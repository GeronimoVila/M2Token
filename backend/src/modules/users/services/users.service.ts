import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from '../models/user.model';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { CompleteProfileDto } from '../dtos/complete-profile.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';

@Injectable()
export class UsersService extends BaseRepository<IUser> {
  constructor(
    @InjectModel('users') private readonly userModel: Model<IUser>
  ) {
    super(userModel);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email });
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findByIdWithRefreshToken(id: string): Promise<IUser | null> {
    return this.userModel.findById(id).select('+refreshToken').exec();
  }

  async findMe(id: string): Promise<IUser | null> {
    return this.findById(id);
  }

  async completeProviderProfile(userId: string, data: CompleteProfileDto): Promise<IUser | null> {
    const existingCuit = await this.findOne({ cuit: data.cuit });
    
    if (existingCuit && existingCuit._id.toString() !== userId) {
      throw new ConflictException('Ya existe un usuario registrado con ese CUIT.');
    }

    return this.update(userId, {
      cuit: data.cuit,
      category: data.category,
      address: data.address,
      phone: data.phone,
      website: data.website
    });
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    const updateFields: any = {};

    if (updateData.walletAddress) updateFields.walletAddress = updateData.walletAddress;
    
    if (updateData.cuil) updateFields.cuit = updateData.cuil;
    
    if (updateData.cbu) updateFields.cbu = updateData.cbu;
    if (updateData.alias) updateFields.alias = updateData.alias;
    if (updateData.razonSocial) updateFields.razonSocial = updateData.razonSocial;

    return this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).exec();
  }
}