import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CanjesService } from './services/canjes.service';
import { CanjesController } from './controllers/canjes.controller';
import { CanjeSchema } from './models/canje.model';
import { BlockchainModule } from '../../blockchain/blockchain.module';
import { UsersModule } from '../users/users.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'canjes', schema: CanjeSchema }]),
    BlockchainModule,
    UsersModule,
    ProjectsModule
  ],
  controllers: [CanjesController],
  providers: [CanjesService],
  exports: [CanjesService],
})
export class CanjesModule {}