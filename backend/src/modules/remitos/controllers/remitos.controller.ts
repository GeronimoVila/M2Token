import { Controller, Post, Get, Patch, Body, Req, UseGuards, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseMongoIdPipe } from 'src/utils/pipes/parse-mongo-id.pipe';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RemitosService } from '../services/remitos.service';
import { CreateRemitoDto } from '../dtos/create-remito.dto';
import { ValidateRemitoDto } from '../dtos/validate-remito.dto';
import { UserRole } from 'src/modules/users/enums/role.enum';

@Controller('remitos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RemitosController {
  constructor(private readonly remitosService: RemitosService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.PROVEEDOR)
  @UseInterceptors(FileInterceptor('file'))
  async createRemito(
    @Body() createRemitoDto: CreateRemitoDto, 
    @Req() req,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('El archivo PDF del remito es obligatorio');
    }
    
    const proveedorId = req.user.id;
    return this.remitosService.create(createRemitoDto, file, proveedorId);
  }

  @Get('my-remitos')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PROVEEDOR)
  async getMyRemitos(@Req() req) {
    const proveedorId = req.user.id; 
    return this.remitosService.findMyRemitos(proveedorId);
  }

  @Get('project/:projectId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY_OWNER, UserRole.COMPANY_ADMIN, UserRole.COMPANY_APPROVER, UserRole.COMPANY_VIEWER, UserRole.SUPERADMIN)
  async getRemitosByProject(@Param('projectId', ParseMongoIdPipe) projectId: string) {
    return this.remitosService.findByProjectId(projectId);
  }

  @Patch(':id/validate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY_OWNER, UserRole.COMPANY_ADMIN, UserRole.COMPANY_APPROVER, UserRole.SUPERADMIN)
  async validateRemito(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() validateDto: ValidateRemitoDto,
    @Req() req,
  ) {
    const validatorId = req.user.id;
    return this.remitosService.validate(id, validateDto, validatorId);
  }
}