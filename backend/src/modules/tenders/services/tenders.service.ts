import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tender, TenderDocument, TenderStatus } from '../models/tender.model';
import { CreateTenderDto } from '../dtos/create-tender.dto';

@Injectable()
export class TendersService {
  constructor(
    @InjectModel(Tender.name) private tenderModel: Model<TenderDocument>,
  ) {}

  async create(createTenderDto: CreateTenderDto, companyId: string): Promise<Tender> {
    const newTender = new this.tenderModel({
      ...createTenderDto,
      project: new Types.ObjectId(createTenderDto.project),
      category: new Types.ObjectId(createTenderDto.category),
      company: new Types.ObjectId(companyId),
    });
    return newTender.save();
  }

  async findByProject(projectId: string): Promise<Tender[]> {
    try {
      return await this.tenderModel
        .find({ project: new Types.ObjectId(projectId) })
        .populate('category', 'name label')
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw error;
    }
  }

  async findById(id: string): Promise<Tender> {
    const tender = await this.tenderModel
      .findById(id)
      .populate('category')
      .populate('project', 'name address')
      .exec();
      
    if (!tender) throw new NotFoundException('Licitación no encontrada');
    return tender;
  }


  async findOpenTenders(): Promise<Tender[]> {
    try {
      const tenders = await this.tenderModel
        .find({ status: TenderStatus.OPEN })
        .populate('category', 'name label')
        .populate('company', 'name razonSocial')
        .populate('project', 'address')
        .sort({ createdAt: -1 })
        .exec();
        
      return tenders;
    } catch (error) {
      throw error;
    }
  }
}