import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IRemito } from '../models/remito.model';
import { CreateRemitoDto } from '../dtos/create-remito.dto';
import { ValidateRemitoDto } from '../dtos/validate-remito.dto';

@Injectable()
export class RemitosService {
  constructor(
    @InjectModel('remitos') private readonly remitoModel: Model<IRemito>,
  ) {}

  async create(createRemitoDto: CreateRemitoDto, proveedorId: string): Promise<IRemito> {
    const newRemito = new this.remitoModel({
      ...createRemitoDto,
      proveedorId: proveedorId,
      estado: 'pendiente',
    });
    return newRemito.save();
  }

  async findMyRemitos(proveedorId: string): Promise<IRemito[]> {
    return this.remitoModel.find({ proveedorId: proveedorId }).exec();
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