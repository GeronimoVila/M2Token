import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from '../models/user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('users') private readonly userModel: Model<IUser>,
  ) {}

  async findMe(id: string): Promise<IUser> {
    const user = await this.userModel.findById(id).select('-password');

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }
}