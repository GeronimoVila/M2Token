import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BidsService } from './services/bids.service';
import { BidsController } from './controllers/bids.controller';
import { Bid, BidSchema } from './models/bid.model';
import { Tender, TenderSchema } from '../tenders/models/tender.model';
import { AssignmentsModule } from '../project-assignments/assignments.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bid.name, schema: BidSchema },
      { name: Tender.name, schema: TenderSchema }
    ]),
    AssignmentsModule
  ],
  controllers: [BidsController],
  providers: [BidsService],
  exports: [BidsService],
})
export class BidsModule {}