import mongoose, { Schema, Document } from 'mongoose';

export enum TipoCanje {
  DINERO = 'DINERO',
  ACTIVO = 'ACTIVO'
}

export enum EstadoCanje {
  PENDIENTE = 'PENDIENTE',
  APROBADO_PAGANDO = 'APROBADO_PAGANDO',
  COMPLETADO = 'COMPLETADO',
  RECHAZADO = 'RECHAZADO'
}

export interface ICanje extends Document {
  proveedorId: mongoose.Types.ObjectId;  
  projectId: mongoose.Types.ObjectId;    
  amountTokens: number;
  tipo: TipoCanje;
  valorTokenAlMomento: number;
  montoTotalFiat?: number;
  descripcionActivo?: string;
  estado: EstadoCanje;
  evidenciaPagoUrl?: string;
  motivoRechazo?: string;
  txHash?: string;
  burnedAt?: Date;                       
  createdAt: Date;
  updatedAt: Date;
}

export const CanjeSchema = new Schema<ICanje>(
  {
    proveedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'projects', required: true, index: true },
    
    amountTokens: { type: Number, required: true, min: 1 },
    tipo: { type: String, enum: Object.values(TipoCanje), required: true },
    
    valorTokenAlMomento: { type: Number, default: 0 }, 
    montoTotalFiat: { type: Number },
    descripcionActivo: { type: String },
    
    estado: { 
      type: String, 
      enum: Object.values(EstadoCanje), 
      default: EstadoCanje.PENDIENTE,
      index: true
    },
    
    evidenciaPagoUrl: { type: String },
    motivoRechazo: { type: String },
    
    txHash: { type: String },
    burnedAt: { type: Date },
  },
  {
    timestamps: true,
    collection: 'canjes',
  }
);

export const CanjeModel = mongoose.model<ICanje>('canjes', CanjeSchema);