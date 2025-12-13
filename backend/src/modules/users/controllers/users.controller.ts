import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; 
import { UsersService } from '../services/users.service';
import { UpdateProfileDto } from '../dtos/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    const userId = req.user.userId || req.user.sub || req.user.id;
    return this.usersService.findMe(userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const userId = req.user.userId || req.user.sub || req.user.id;
    return this.usersService.updateProfile(userId, dto); 
  }

  @Get('providers')
  @UseGuards(JwtAuthGuard)
  async getProviders() {
    return this.usersService.findAll({ role: 'proveedor', isActive: true });
  }
}