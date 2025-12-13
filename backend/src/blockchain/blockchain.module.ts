import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [BlockchainController],
  providers: [BlockchainService],
  exports: [BlockchainService]
})
export class BlockchainModule {}