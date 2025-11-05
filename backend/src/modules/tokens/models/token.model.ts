import mongoose, { Schema, Document } from 'mongoose';

export interface IToken extends Document {
  proveedorId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  remitoId: mongoose.Types.ObjectId;
  cantidad: number;
  tokenIdBlockchain: string;
  estado: 'emitido' | 'canjeado' | 'quemado';
  createdAt: Date;
  mintedBy?: mongoose.Types.ObjectId;
  burnedBy?: mongoose.Types.ObjectId;
}

const TokenSchema = new Schema<IToken>(
  {
    proveedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'projects', index: true, required: true },
    remitoId: { type: mongoose.Schema.Types.ObjectId, ref: 'remitos', required: true },
    cantidad: { type: Number, required: true, min: 0 },
    tokenIdBlockchain: { type: String, required: true, unique: true, trim: true },
    estado: {
      type: String,
      enum: ['emitido', 'canjeado', 'quemado'],
      default: 'emitido',
      index: true,
    },
    createdAt: { type: Date, default: Date.now },
    mintedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    burnedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
  },
  {
    timestamps: true,
    collection: 'tokens',
  }
);

TokenSchema.index({ proveedorId: 1 });
TokenSchema.index({ projectId: 1 });
TokenSchema.index({ tokenIdBlockchain: 1 }, { unique: true });
TokenSchema.index({ estado: 1 });

export const TokenModel = mongoose.model<IToken>('tokens', TokenSchema);