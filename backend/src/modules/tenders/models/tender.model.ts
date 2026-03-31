import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type TenderDocument = Tender & Document;

export enum TenderStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  AWARDED = 'AWARDED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class Tender {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'projects', required: true })
  project: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'companies', required: true })
  company: Types.ObjectId;

  @Prop({ required: true })
  budgetM2: number;

  @Prop({ required: true })
  deadline: Date;

  @Prop({ required: true, enum: TenderStatus, default: TenderStatus.OPEN })
  status: TenderStatus;
}

export const TenderSchema = SchemaFactory.createForClass(Tender);