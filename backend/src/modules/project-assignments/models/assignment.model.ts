import { Schema, Document, Types } from 'mongoose';

export interface IAssignment extends Document {
  projectId: Types.ObjectId;
  providerId: Types.ObjectId;
  companyId: Types.ObjectId;
  status: 'active' | 'finished' | 'suspended';
  assignedAt: Date;
}

export const AssignmentSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'projects', required: true },
    providerId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'companies', required: true },
    status: { 
      type: String, 
      enum: ['active', 'finished', 'suspended'], 
      default: 'active' 
    },
    assignedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AssignmentSchema.index({ projectId: 1, providerId: 1 }, { unique: true });