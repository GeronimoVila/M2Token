import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ICompany } from '../models/company.model';
import { IUser } from '../../users/models/user.model';
import { CreateCompanyDto } from '../dtos/create-company.dto';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class CompaniesService extends BaseRepository<ICompany> {
  constructor(
    @InjectModel('companies') private readonly companyModel: Model<ICompany>,
    @InjectModel('users') private readonly userModel: Model<IUser>,
  ) {
    super(companyModel);
  }

  async createCompany(createCompanyDto: CreateCompanyDto, userId: string): Promise<ICompany> {
    const existingCompany = await this.findOne({ cuit: createCompanyDto.cuit });
    if (existingCompany) {
      throw new ConflictException('Ya existe una empresa registrada con ese CUIT.');
    }

    const newCompany = await this.create({
      ...createCompanyDto,
      ownerId: new Types.ObjectId(userId),
    });

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { 
        companyId: newCompany._id,
        role: 'empresa_owner' 
      },
      { new: true }
    );

    if (!updatedUser) {
      await this.delete(newCompany._id as string);
      throw new NotFoundException('Usuario propietario no encontrado.');
    }

    return newCompany;
  }

  async findByOwner(userId: string): Promise<ICompany | null> {
    return this.findOne({ ownerId: new Types.ObjectId(userId) });
  }
}