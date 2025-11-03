import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string; // nombre del rol (admin, empresa, proveedor, auditor, etc.)
  description?: string;
  permissions?: Record<string, any>; // estructura flexible para permisos dinámicos
  createdAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    permissions: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'roles',
  }
);

RoleSchema.index({ name: 1 }, { unique: true });

export const RoleModel = mongoose.model<IRole>('roles', RoleSchema);