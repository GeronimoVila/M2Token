import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type BidDocument = Bid & Document;

export enum BidStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class Bid {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tender', required: true })
  tender!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'users', required: true })
  provider!: Types.ObjectId;

  @Prop({ required: true })
  amount!: number;

  @Prop()
  message!: string;

  @Prop({ required: true, enum: BidStatus, default: BidStatus.PENDING })
  status!: BidStatus;
}

export const BidSchema = SchemaFactory.createForClass(Bid);