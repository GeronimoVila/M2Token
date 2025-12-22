import { Controller, Post, Body, Get, Param, UseGuards, Req, Patch, ForbiddenException } from '@nestjs/common';
import { CanjesService } from '../services/canjes.service';
import { CreateCanjeDto } from '../dtos/create-canje.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('canjes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CanjesController {
  constructor(private readonly canjesService: CanjesService) {}

  @Post()
  @Roles('proveedor')
  async solicitarCanje(@Req() req, @Body() dto: CreateCanjeDto) {
    const userId = req.user.userId || req.user.sub || req.user._id;
    return this.canjesService.solicitarCanje(userId, dto);
  }

  @Get('my-canjes')
  @Roles('proveedor')
  async getMyCanjes(@Req() req) {
    const userId = req.user.userId || req.user.sub || req.user._id;
    return this.canjesService.findMyCanjes(userId);
  }


  @Post(':id/confirm-payment')
  @Roles('empresa_owner', 'empresa_admin', 'superadmin')
  async confirmarYQuemar(@Req() req, @Param('id') canjeId: string) {
    const adminId = req.user.userId || req.user.sub;
    
    return this.canjesService.confirmarPagoYQuemar(canjeId, adminId);
  }

  @Get('project/:projectId')
  async getByProject(@Param('projectId') projectId: string) {
    return this.canjesService.findAll({ projectId });
  }

  // @Get('pending')
  // @Roles('empresa_owner', 'empresa_admin')
  // async getPendingCanjes() { ... }
}