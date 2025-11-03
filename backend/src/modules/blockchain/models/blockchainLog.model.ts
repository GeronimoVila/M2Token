import mongoose, { Schema, Document } from 'mongoose';

export interface IBlockchainLog extends Document {
  entityType: 'token' | 'remito' | 'canje';
  entityId: mongoose.Types.ObjectId;
  txHash: string;
  blockNumber?: number;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
}

const BlockchainLogSchema = new Schema<IBlockchainLog>(
  {
    entityType: {
      type: String,
      enum: ['token', 'remito', 'canje'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'entityType',
    },
    txHash: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    blockNumber: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending',
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'blockchainLogs',
  }
);

BlockchainLogSchema.index({ entityType: 1 });
BlockchainLogSchema.index({ entityId: 1 });
BlockchainLogSchema.index({ txHash: 1 }, { unique: true });
BlockchainLogSchema.index({ status: 1 });

export const BlockchainLogModel = mongoose.model<IBlockchainLog>(
  'blockchainLogs',
  BlockchainLogSchema
);