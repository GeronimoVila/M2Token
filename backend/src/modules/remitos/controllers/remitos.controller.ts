import { Controller, Post, Get, Patch, Body, Req, UseGuards, Param } from '@nestjs/common';
import { ParseMongoIdPipe } from 'src/utils/pipes/parse-mongo-id.pipe';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RemitosService } from '../services/remitos.service';
import { CreateRemitoDto } from '../dtos/create-remito.dto';
import { ValidateRemitoDto } from '../dtos/validate-remito.dto';

@Controller('remitos')
@UseGuards(JwtAuthGuard)
export class RemitosController {
  constructor(private readonly remitosService: RemitosService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('proveedor')
  async createRemito(@Body() createRemitoDto: CreateRemitoDto, @Req() req) {
    const proveedorId = req.user.id;
    return this.remitosService.create(createRemitoDto, proveedorId);
  }

  @Get('my-remitos')
  @UseGuards(RolesGuard)
  @Roles('proveedor')
  async getMyRemitos(@Req() req) {
    const proveedorId = req.user.id;
    return this.remitosService.findMyRemitos(proveedorId);
  }

  @Get('project/:projectId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'empresa')
  async getRemitosByProject(@Param('projectId', ParseMongoIdPipe) projectId: string) {
    return this.remitosService.findByProjectId(projectId);
  }

  @Patch(':id/validate')
  @UseGuards(RolesGuard)
  @Roles('admin', 'empresa')
  async validateRemito(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() validateDto: ValidateRemitoDto,
    @Req() req,
  ) {
    const validatorId = req.user.id;
    return this.remitosService.validate(id, validateDto, validatorId);
  }
}