import { Controller, Get, Patch, Body, Req, UseGuards, Query, Post } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; 
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../enums/role.enum';
import { UsersService } from '../services/users.service';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { GetProvidersQueryDto } from '../dtos/get-providers.dto';
import { InviteUserDto } from '../dtos/invite-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    const userId = req.user.id;
    return this.usersService.findMe(userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const userId = req.user.id;
    return this.usersService.updateProfile(userId, dto); 
  }

  @Get('providers')
  @UseGuards(JwtAuthGuard)
  async getProviders(@Query() query: GetProvidersQueryDto) {
    return this.usersService.findProviders(query);
  }

  @Post('invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_OWNER, UserRole.COMPANY_ADMIN)
  async inviteUser(@Req() req: any, @Body() dto: InviteUserDto) {
    return this.usersService.inviteCompanyUser(req.user.id, dto);
  }

  @Get('team')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_OWNER, UserRole.COMPANY_ADMIN, UserRole.COMPANY_APPROVER, UserRole.COMPANY_VIEWER)
  async getTeam(@Req() req: any) {
    return this.usersService.getCompanyTeam(req.user.id);
  }
}