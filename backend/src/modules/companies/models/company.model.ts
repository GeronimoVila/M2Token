import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  razonSocial: string;
  cuit: number;
  address?: string;
  contactEmail?: string;
  website?: string;
  ownerId: mongoose.Types.ObjectId; 
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    razonSocial: { type: String, required: true, trim: true },
    cuit: { type: Number, required: true, unique: true },
    address: { type: String },
    contactEmail: { type: String, lowercase: true, trim: true },
    website: { type: String, trim: true },
    
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    
    status: { 
      type: String, 
      enum: ['PENDING', 'ACTIVE', 'INACTIVE'], 
      default: 'ACTIVE' 
    },
  },
  {
    timestamps: true,
    collection: 'companies',
  }
);

// Índices
CompanySchema.index({ cuit: 1 }, { unique: true });
CompanySchema.index({ ownerId: 1 });

export const CompanyModel = mongoose.model<ICompany>('companies', CompanySchema);