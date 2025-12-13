import { Controller, Get, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';

@Controller('blockchain')
@UseGuards(JwtAuthGuard)
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('balance')
    async getBalance(
      @Query('wallet') wallet: string,
      @Query('projectId') projectId: string
    ) {
      if (!wallet || !projectId) {
        throw new BadRequestException('Faltan parámetros: wallet y projectId');
      }

    const numericId = parseInt(projectId.toString().slice(-6), 16);

    if (isNaN(numericId)) {
      throw new BadRequestException('El Project ID debe ser un número');
    }

    const balance = await this.blockchainService.getBalance(wallet, numericId);
    
    return {
      wallet,
      projectId: projectId,
      blockchainId: numericId,
      balance: balance,
      m2: Number(balance) / 100
    };
  }
}