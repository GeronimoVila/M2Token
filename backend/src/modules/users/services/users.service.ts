import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from '../models/user.model';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { CompleteProfileDto } from '../dtos/complete-profile.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { hashPassword } from '../../../utils/password';

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

async findProviders(query: any): Promise<IUser[]> {
    try {
      const { category, location, search } = query;
      
      const filter: any = { role: 'proveedor', isActive: true };

      if (category && category !== 'all') {
        filter.category = category;
      }

      if (location) {
        filter.address = { $regex: location, $options: 'i' };
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { specialties: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { razonSocial: { $regex: search, $options: 'i' } }
        ];
      }

      return await this.userModel.find(filter)
        .populate('category', 'name label')
        .select('-password -refreshToken -cbu -alias -walletAddress -googleId')
        .sort({ rating: -1, createdAt: -1 })
        .exec();

    } catch (error) {
      console.error("ERROR findProviders:", error);
      throw error;
    }
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

    if (updateData.name) updateFields.name = updateData.name;
    if (updateData.walletAddress) updateFields.walletAddress = updateData.walletAddress;
    if (updateData.cuil) updateFields.cuit = updateData.cuil;
    if (updateData.cuit) updateFields.cuit = updateData.cuit;
    
    if (updateData.cbu) updateFields.cbu = updateData.cbu;
    if (updateData.alias) updateFields.alias = updateData.alias;
    if (updateData.razonSocial) updateFields.razonSocial = updateData.razonSocial;
    if (updateData.category) updateFields.category = updateData.category;
    
    if (updateData.specialties !== undefined) updateFields.specialties = updateData.specialties;
    if (updateData.address !== undefined) updateFields.address = updateData.address;
    if (updateData.description !== undefined) updateFields.description = updateData.description;

    if (updateData.phone) updateFields.phone = updateData.phone;
    if (updateData.website) updateFields.website = updateData.website;
    if (updateData.password) {
      updateFields.password = await hashPassword(updateData.password);
    }

    return this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).exec();
  }
}