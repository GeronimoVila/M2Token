import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICanje, TipoCanje, EstadoCanje } from '../models/canje.model';
import { CreateCanjeDto } from '../dtos/create-canje.dto';
import { BlockchainService } from '../../../blockchain/blockchain.service';
import { UsersService } from '../../users/services/users.service';
import { ProjectsService } from '../../projects/services/projects.service';
import { AuditService } from '../../audit/services/audit.service';

@Injectable()
export class CanjesService {
  constructor(
    @InjectModel('canjes') private readonly canjeModel: Model<ICanje>,
    private readonly blockchainService: BlockchainService,
    private readonly usersService: UsersService,
    private readonly projectsService: ProjectsService,
    private readonly auditService: AuditService
  ) {}

  async solicitarCanje(userId: string, dto: CreateCanjeDto) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.walletAddress) {
      throw new BadRequestException('Usuario no tiene wallet configurada');
    }

    const project = await this.projectsService.findById(dto.projectId);
    if (!project) throw new NotFoundException('Proyecto no encontrado');
    
    if (dto.tipo === TipoCanje.ACTIVO && project.status !== 'finished') {
      throw new BadRequestException('No se puede canjear por Activo hasta que la obra esté finalizada.');
    }

    const numericProjectId = parseInt(dto.projectId.toString().slice(-6), 16);
    const saldoBlockchainStr = await this.blockchainService.getBalance(user.walletAddress, numericProjectId);
    const saldoBlockchain = Number(saldoBlockchainStr); 

    const canjesPendientes = await this.canjeModel.find({
      proveedorId: userId,
      projectId: dto.projectId,
      estado: { $in: [EstadoCanje.PENDIENTE, EstadoCanje.APROBADO_PAGANDO] }
    });
    
    const tokensComprometidos = canjesPendientes.reduce((sum, c) => sum + c.amountTokens, 0);
    const saldoDisponible = saldoBlockchain - tokensComprometidos;

    if (dto.amountTokens > saldoDisponible) {
      throw new BadRequestException(`Saldo insuficiente. Tienes ${saldoBlockchain} tokens, pero ${tokensComprometidos} están comprometidos en canjes pendientes.`);
    }

    const nuevoCanje = new this.canjeModel({
      proveedorId: userId,
      projectId: dto.projectId,
      amountTokens: dto.amountTokens,
      tipo: dto.tipo,
      estado: EstadoCanje.PENDIENTE,
      valorTokenAlMomento: 1,
      descripcionActivo: dto.descripcionActivo
    });

    const savedCanje = await nuevoCanje.save();

    const projectDoc = await this.canjeModel.db.model('projects').findById(savedCanje.projectId).select('name companyId').exec();
    const companyDoc = projectDoc ? await this.canjeModel.db.model('companies').findById(projectDoc.companyId).select('name').exec() : null;

    await this.auditService.logAction(
      userId, 
      userId, 
      'canje', 
      savedCanje._id.toString(), 
      'created', 
      { 
        tipo: savedCanje.tipo,
        montoM2T: savedCanje.amountTokens, 
        nombreProyecto: projectDoc?.name || 'Proyecto Desconocido',
        nombreEmpresa: companyDoc?.name || 'Empresa Desconocida',
        descripcion: savedCanje.descripcionActivo 
      }
    );

    return savedCanje;
  }

  async confirmarPagoYQuemar(canjeId: string, adminUserId: string) {
    const canje = await this.canjeModel.findById(canjeId).populate('proveedorId');
    if (!canje) throw new NotFoundException('Canje no encontrado');

    if (canje.estado !== EstadoCanje.APROBADO_PAGANDO && canje.estado !== EstadoCanje.PENDIENTE) {
       throw new BadRequestException('El canje no está en estado válido para quemar');
    }

    const proveedor: any = canje.proveedorId;
    const walletAddress = proveedor.walletAddress;
    
    const numericProjectId = parseInt(canje.projectId.toString().slice(-6), 16);

    try {
      const result = await this.blockchainService.burnTokens(
        walletAddress,
        numericProjectId,
        canje.amountTokens
      );

      canje.estado = EstadoCanje.COMPLETADO;
      canje.txHash = result.txHash;
      canje.burnedAt = new Date();
      await canje.save();

      await this.auditService.logAction(
        adminUserId, 
        adminUserId, 
        'canje', 
        canje._id.toString(), 
        'approved', 
        { tipo: canje.tipo, montoM2T: canje.amountTokens, txHash: result.txHash }
      );

      return { success: true, txHash: result.txHash };

    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error quemando tokens: ' + error.message);
    }
  }

  async findMyCanjes(userId: string) {
    return this.canjeModel.find({ proveedorId: userId })
      .populate('projectId', 'name status')
      .sort({ createdAt: -1 });
  }

  async findAll(filter: any = {}) {
    return this.canjeModel.find(filter)
      .populate('proveedorId', 'email name walletAddress')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })
      .exec();
  }
}