import 'multer';
import { Injectable, NotFoundException, ForbiddenException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IRemito } from '../models/remito.model';
import { CreateRemitoDto } from '../dtos/create-remito.dto';
import { ValidateRemitoDto } from '../dtos/validate-remito.dto';
import { IpfsService } from './ipfs.service';
import { BlockchainService } from '../../../blockchain/blockchain.service';
import { AuditService } from '../../audit/services/audit.service';
import { SettingsService } from '../../settings/services/settings.service';

@Injectable()
export class RemitosService {
  private readonly logger = new Logger(RemitosService.name);

  constructor(
    @InjectModel('remitos') private readonly remitoModel: Model<IRemito>,
    private readonly ipfsService: IpfsService,
    private readonly blockchainService: BlockchainService,
    private readonly auditService: AuditService,
    private readonly settingsService: SettingsService,
  ) {}

  async create(createRemitoDto: CreateRemitoDto, file: Express.Multer.File, proveedorId: string): Promise<IRemito> {
    const cid = await this.ipfsService.uploadFile(file.buffer, file.originalname);

    try {
      const newRemito = new this.remitoModel({
        ...createRemitoDto,
        proveedorId: proveedorId,
        estado: 'pendiente',
        evidenceHash: cid,
      });

      const savedRemito = await newRemito.save();

      const project = await this.remitoModel.db.model('projects').findById(savedRemito.projectId).select('name companyId').exec();
      const company = project ? await this.remitoModel.db.model('companies').findById(project.companyId).select('name').exec() : null;

      await this.auditService.logAction(
        proveedorId, 
        proveedorId, 
        'remito', 
        savedRemito._id.toString(), 
        'created', 
        { 
          numeroRemito: savedRemito.numeroRemito,
          monto: savedRemito.monto,
          nombreProyecto: project?.name || 'Proyecto Desconocido',
          nombreEmpresa: company?.name || 'Empresa Desconocida'
        }
      );

      return savedRemito;
    } catch (error) {
      this.logger.error('❌ ERROR MONGO:', error);
      throw error;
    }
  }

  async findMyRemitos(proveedorId: string): Promise<IRemito[]> {
    return this.remitoModel
      .find({ proveedorId: proveedorId })
      .populate('projectId', 'name address')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByProjectId(projectId: string): Promise<IRemito[]> {
    return this.remitoModel.find({ projectId: projectId }).populate('proveedorId', 'name email').exec();
  }

  async validate(remitoId: string, validateDto: ValidateRemitoDto, validatorId: string): Promise<IRemito> {
    const remito = await this.remitoModel.findById(remitoId).populate('proveedorId');
    if (!remito) throw new NotFoundException('Remito no encontrado');
    if (remito.estado !== 'pendiente') throw new ForbiddenException(`El remito ya fue procesado`);

    remito.estado = validateDto.estado;
    remito.validatedBy = validatorId as any;
    remito.validatedAt = new Date();

    if (remito.estado === 'validado' && !remito.txHash) {
      const proveedor: any = remito.proveedorId;
      const walletAddress = proveedor.walletAddress;
      if (!walletAddress) throw new BadRequestException('El proveedor no tiene wallet configurada');

      const projectHex = remito.projectId.toString();
      const numericProjectId = parseInt(projectHex.slice(-6), 16); 

      try {
        const config = await this.settingsService.getGlobalSettings();
        const precioM2 = config.precioM2 || 1500;
        const tokensPorM2 = config.tokensPorM2 || 100;

        const rawTokensToMint = (remito.monto / precioM2) * tokensPorM2;
        
        const finalTokensToMint = Math.round(rawTokensToMint * 100) / 100;

        this.logger.log(`Minteando: Monto $${remito.monto} -> PrecioM2 $${precioM2} -> Emisión: ${finalTokensToMint} M2T`);

        const txResult = await this.blockchainService.mintTokens(
          walletAddress,
          numericProjectId,
          finalTokensToMint,
          remito._id.toString()
        );
        remito.txHash = txResult.txHash;
        remito.mintedAt = new Date();

        remito.set('metadata.calculoTokens', {
          precioM2Usado: precioM2,
          tokensPorM2Usado: tokensPorM2,
          tokensEmitidos: finalTokensToMint
        });

      } catch (error: any) {
        throw new InternalServerErrorException('Error en Blockchain: ' + error.message);
      }
    }

    const savedRemito = await remito.save();

    const project = await this.remitoModel.db.model('projects').findById(savedRemito.projectId).select('name companyId').exec();
    const company = project ? await this.remitoModel.db.model('companies').findById(project.companyId).select('name').exec() : null;

    await this.auditService.logAction(
      validatorId, 
      validatorId, 
      'remito', 
      savedRemito._id.toString(), 
      'validated', 
      { 
        estado: savedRemito.estado, 
        txHash: savedRemito.txHash, 
        montoFacturado: savedRemito.monto,
        tokensEmitidos: savedRemito.get('metadata.calculoTokens.tokensEmitidos') || 0,
        numeroRemito: savedRemito.numeroRemito,
        nombreProyecto: project?.name || 'Proyecto Desconocido',
        nombreEmpresa: company?.name || 'Empresa Desconocida'
      }
    );

    return savedRemito;
  }
}