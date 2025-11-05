import mongoose, { Schema, Document } from 'mongoose';

export interface ICanje extends Document {
  tokenId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tipo: 'proveedor->empresa' | 'empresa->proveedor' | 'proveedor->proveedor';
  cantidad: number;
  fecha: Date;
  estado: 'pendiente' | 'completado' | 'rechazado';
  hashOnChain?: string;
  createdAt: Date;
}

const CanjeSchema = new Schema<ICanje>(
  {
    tokenId: { type: mongoose.Schema.Types.ObjectId, ref: 'tokens', index: true, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true, required: true },
    tipo: {
      type: String,
      enum: ['proveedor->empresa', 'empresa->proveedor', 'proveedor->proveedor'],
      required: true,
    },
    cantidad: { type: Number, required: true, min: 0 },
    fecha: { type: Date, required: true },
    estado: {
      type: String,
      enum: ['pendiente', 'completado', 'rechazado'],
      default: 'pendiente',
      index: true,
    },
    hashOnChain: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'canjes',
  }
);

CanjeSchema.index({ tokenId: 1 });
CanjeSchema.index({ userId: 1 });
CanjeSchema.index({ estado: 1 });

export const CanjeModel = mongoose.model<ICanje>('canjes', CanjeSchema);