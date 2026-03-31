import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BidsService } from '../services/bids.service';
import { CreateBidDto } from '../dtos/create-bid.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enums/role.enum';
import { ParseMongoIdPipe } from '../../../utils/pipes/parse-mongo-id.pipe';

@Controller('bids')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  @Roles(UserRole.PROVEEDOR)
  async create(@Body() createBidDto: CreateBidDto, @Request() req) {
    return this.bidsService.create(createBidDto, req.user.id);
  }

  @Get('tender/:tenderId')
  @Roles(UserRole.COMPANY_OWNER, UserRole.COMPANY_ADMIN, UserRole.COMPANY_APPROVER, UserRole.COMPANY_VIEWER)
  async getByTender(@Param('tenderId', ParseMongoIdPipe) tenderId: string) {
    return this.bidsService.findByTender(tenderId);
  }

  @Get('my-bids')
  @Roles(UserRole.PROVEEDOR)
  async getMyBids(@Request() req) {
    return this.bidsService.findByProvider(req.user.id);
  }

  @Post(':id/adjudicate')
  @Roles(UserRole.COMPANY_OWNER, UserRole.COMPANY_ADMIN)
  async adjudicateBid(@Param('id', ParseMongoIdPipe) bidId: string, @Request() req) {
    return this.bidsService.adjudicate(bidId, req.user.companyId);
  }
}