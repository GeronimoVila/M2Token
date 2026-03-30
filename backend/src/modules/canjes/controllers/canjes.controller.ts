import { Controller, Post, Body, Get, Param, UseGuards, Req, Patch, ForbiddenException } from '@nestjs/common';
import { CanjesService } from '../services/canjes.service';
import { CreateCanjeDto } from '../dtos/create-canje.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from 'src/modules/users/enums/role.enum';

@Controller('canjes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CanjesController {
  constructor(private readonly canjesService: CanjesService) {}

  @Post()
  @Roles(UserRole.PROVEEDOR)
  async solicitarCanje(@Req() req, @Body() dto: CreateCanjeDto) {
    const userId = req.user.id;
    return this.canjesService.solicitarCanje(userId, dto);
  }

  @Get('my-canjes')
  @Roles(UserRole.PROVEEDOR)
  async getMyCanjes(@Req() req) {
    const userId = req.user.id;
    return this.canjesService.findMyCanjes(userId);
  }

  @Post(':id/confirm-payment')
  @Roles(UserRole.COMPANY_OWNER, UserRole.COMPANY_ADMIN, UserRole.SUPERADMIN)
  async confirmarYQuemar(@Req() req, @Param('id') canjeId: string) {
    const adminId = req.user.id;
    
    return this.canjesService.confirmarPagoYQuemar(canjeId, adminId);
  }

  @Get('project/:projectId')
  async getByProject(@Param('projectId') projectId: string) {
    return this.canjesService.findAll({ projectId });
  }
}