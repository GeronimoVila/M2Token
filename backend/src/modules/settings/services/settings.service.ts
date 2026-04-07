import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ISettings } from '../models/settings.model';
import { UpdateSettingsDto } from '../dtos/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel('settings') private readonly settingsModel: Model<ISettings>,
  ) {}

  async getGlobalSettings(): Promise<ISettings> {
    let settings = await this.settingsModel.findOne().exec();
    
    if (!settings) {
      settings = await this.settingsModel.create({
        precioM2: 1500,
        tokensPorM2: 100
      });
    }
    return settings;
  }

  async updateGlobalSettings(dto: UpdateSettingsDto): Promise<ISettings> {
    let settings = await this.settingsModel.findOne().exec();
    
    if (!settings) {
      settings = new this.settingsModel(dto);
    } else {
      settings.precioM2 = dto.precioM2;
      settings.tokensPorM2 = dto.tokensPorM2;
    }
    
    return await settings.save();
  }
}