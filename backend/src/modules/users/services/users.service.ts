import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from '../models/user.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel('users') private readonly userModel: Model<IUser>) {}

  async findMe(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('roleId')
      .select('-password -refreshToken');

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const userObject = user.toObject();
    
    return {
      ...userObject,
      role: (userObject.roleId as any)?.name || 'invitado', 
    };
  }
}