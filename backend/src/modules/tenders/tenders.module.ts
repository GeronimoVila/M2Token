import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TendersService } from './services/tenders.service';
import { TendersController } from './controllers/tenders.controller';
import { Tender, TenderSchema } from './models/tender.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: Tender.name, schema: TenderSchema }])],
  controllers: [TendersController],
  providers: [TendersService],
  exports: [TendersService],
})
export class TendersModule {}