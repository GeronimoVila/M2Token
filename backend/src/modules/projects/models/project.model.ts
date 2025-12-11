import { Schema, Document, Types } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  address?: string;
  budget?: number;
  status: 'planning' | 'in_progress' | 'finished' | 'paused';
  companyId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const ProjectSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    address: { type: String },
    budget: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['planning', 'in_progress', 'finished', 'paused'], 
      default: 'planning' 
    },
    companyId: { type: Schema.Types.ObjectId, ref: 'companies', required: true },
  },
  { timestamps: true }
);