import mongoose, { Schema, Document } from 'mongoose';

export interface IRemito extends Document {
  projectId: mongoose.Types.ObjectId;
  proveedorId: mongoose.Types.ObjectId;
  numeroRemito: string;
  descripcion?: string;
  monto: number;
  estado: 'pendiente' | 'validado' | 'rechazado';
  fechaEntrega: Date;
  createdAt: Date;
  validatedBy?: mongoose.Types.ObjectId;
  validatedAt?: Date;
  evidenceHash: string;
  txHash?: string;
  mintedAt?: Date;
}

export const RemitoSchema = new Schema<IRemito>(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'projects', index: true, required: true },
    proveedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true, required: true },
    numeroRemito: { type: String, required: true, unique: true, trim: true },
    descripcion: { type: String, default: '' },
    monto: { type: Number, required: true },
    estado: { 
      type: String, 
      enum: ['pendiente', 'validado', 'rechazado'], 
      default: 'pendiente',
      index: true 
    },
    fechaEntrega: { type: Date, required: true },
    validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    validatedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    evidenceHash: { type: String, required: true },
    txHash: { type: String, default: null },
    mintedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: 'remitos',
  }
);

RemitoSchema.index({ projectId: 1 });
RemitoSchema.index({ proveedorId: 1 });
RemitoSchema.index({ numeroRemito: 1 }, { unique: true });
RemitoSchema.index({ estado: 1 });

export const RemitoModel = mongoose.model<IRemito>('remitos', RemitoSchema);