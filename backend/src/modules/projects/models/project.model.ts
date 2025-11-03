import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  location?: string;
  total_m2: number;
  status: 'en_obra' | 'finalizado' | 'pausado';
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    total_m2: { type: Number, required: true },
    status: { type: String, enum: ['en_obra', 'finalizado', 'pausado'], default: 'en_obra' },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'projects',
  }
);

ProjectSchema.index({ userId: 1 });

export const ProjectModel = mongoose.model<IProject>('projects', ProjectSchema);