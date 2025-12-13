import { Controller, Post, Get, Patch, Body, Req, UseGuards, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @Roles('proveedor', 'PROVEEDOR')
  @UseInterceptors(FileInterceptor('file'))
  async createRemito(
    @Body() createRemitoDto: CreateRemitoDto, 
    @Req() req,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('El archivo PDF del remito es obligatorio');
    }
    
    const proveedorId = req.user.userId;
    return this.remitosService.create(createRemitoDto, file, proveedorId);
  }

  @Get('my-remitos')
  @UseGuards(RolesGuard)
  @Roles('proveedor', 'PROVEEDOR')
  async getMyRemitos(@Req() req) {
    const proveedorId = req.user.userId; 
    return this.remitosService.findMyRemitos(proveedorId);
  }

  @Get('project/:projectId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'empresa', 'EMPRESA', 'empresa_owner') 
  async getRemitosByProject(@Param('projectId', ParseMongoIdPipe) projectId: string) {
    return this.remitosService.findByProjectId(projectId);
  }

  @Patch(':id/validate')
  @UseGuards(RolesGuard)
  @Roles('admin', 'empresa', 'EMPRESA', 'empresa_owner')
  async validateRemito(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() validateDto: ValidateRemitoDto,
    @Req() req,
  ) {
    const validatorId = req.user.userId;
    return this.remitosService.validate(id, validateDto, validatorId);
  }
}