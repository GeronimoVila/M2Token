import { Injectable, NotFoundException, ForbiddenException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IRemito } from '../models/remito.model';
import { CreateRemitoDto } from '../dtos/create-remito.dto';
import { ValidateRemitoDto } from '../dtos/validate-remito.dto';
import { IpfsService } from './ipfs.service';
import { BlockchainService } from '../../../blockchain/blockchain.service';

@Injectable()
export class RemitosService {
  private readonly logger = new Logger(RemitosService.name);

  constructor(
    @InjectModel('remitos') private readonly remitoModel: Model<IRemito>,
    private readonly ipfsService: IpfsService,
    private readonly blockchainService: BlockchainService,
  ) {}

  async create(createRemitoDto: CreateRemitoDto, file: Express.Multer.File, proveedorId: string): Promise<IRemito> {
    const cid = await this.ipfsService.uploadFile(file.buffer, file.originalname);

    this.logger.log(`Guardando remito en Mongo con CID: ${cid}`);

    try {
      const newRemito = new this.remitoModel({
        ...createRemitoDto,
        proveedorId: proveedorId,
        estado: 'pendiente',
        evidenceHash: cid,
      });

      return await newRemito.save();

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

    if (!remito) {
      throw new NotFoundException('Remito no encontrado');
    }

    if (remito.estado !== 'pendiente') {
      throw new ForbiddenException(`El remito ya fue procesado (estado: ${remito.estado})`);
    }

    remito.estado = validateDto.estado;
    remito.validatedBy = validatorId as any;
    remito.validatedAt = new Date();

    if (remito.estado === 'validado' && !remito.txHash) {
      
      this.logger.log(`🏗️ Iniciando proceso de tokenización para Remito ID: ${remitoId}`);

      const proveedor: any = remito.proveedorId;
      const walletAddress = proveedor.walletAddress;

      if (!walletAddress) {
        throw new BadRequestException('El proveedor no tiene una Billetera (Wallet) configurada en su perfil. No se pueden emitir tokens.');
      }

      const projectHex = remito.projectId.toString();
      const numericProjectId = parseInt(projectHex.slice(-6), 16); 

      try {
        const txResult = await this.blockchainService.mintTokens(
          walletAddress,
          numericProjectId,
          remito.monto,
          remito._id.toString()
        );

        remito.txHash = txResult.txHash;
        remito.mintedAt = new Date();
        
        this.logger.log(`✅ Tokenización exitosa. Hash: ${txResult.txHash}`);

      } catch (error) {
        this.logger.error('❌ Error en Blockchain:', error);
        throw new InternalServerErrorException('Error al emitir tokens en Blockchain: ' + error.message);
      }
    }

    return remito.save();
  }
}