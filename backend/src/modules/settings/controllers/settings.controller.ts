import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from '../services/settings.service';
import { UpdateSettingsDto } from '../dtos/update-settings.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enums/role.enum';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('global')
  async getSettings() {
    return this.settingsService.getGlobalSettings();
  }

  @Put('global')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateGlobalSettings(dto);
  }
}