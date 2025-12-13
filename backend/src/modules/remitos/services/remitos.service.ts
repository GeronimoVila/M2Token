import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IRemito } from '../models/remito.model';
import { CreateRemitoDto } from '../dtos/create-remito.dto';
import { ValidateRemitoDto } from '../dtos/validate-remito.dto';
import { IpfsService } from './ipfs.service';

@Injectable()
export class RemitosService {
  constructor(
    @InjectModel('remitos') private readonly remitoModel: Model<IRemito>,
    private readonly ipfsService: IpfsService,
  ) {}


async create(createRemitoDto: CreateRemitoDto, file: Express.Multer.File, proveedorId: string): Promise<IRemito> {
  const cid = await this.ipfsService.uploadFile(file.buffer, file.originalname);

  console.log('Intentando guardar en Mongo con CID:', cid);
  console.log('Datos:', { ...createRemitoDto, proveedorId });

  try {
    const newRemito = new this.remitoModel({
      ...createRemitoDto,
      proveedorId: proveedorId,
      estado: 'pendiente',
      evidenceHash: cid,
    });

    return await newRemito.save();

  } catch (error) {
    console.error('❌ ERROR MONGO:', error);
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
    const remito = await this.remitoModel.findById(remitoId);

    if (!remito) {
      throw new NotFoundException('Remito no encontrado');
    }

    if (remito.estado !== 'pendiente') {
      throw new ForbiddenException(`El remito ya fue procesado (estado: ${remito.estado})`);
    }

    remito.estado = validateDto.estado;
    remito.validatedBy = validatorId as any;
    remito.validatedAt = new Date();

    return remito.save();
  }
}