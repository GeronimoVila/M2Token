import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  cuil_cuit?: number;
  
  companyId?: mongoose.Types.ObjectId; 
  
  role: string; 
  
  walletAddress?: string;
  
  datosProveedor?: Record<string, any>; 
  
  refreshToken?: string;
  isActive: boolean;
  createdAt: Date;
}

export const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    cuil_cuit: { type: Number },
    
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'companies', default: null, index: true },
    
    role: { 
      type: String, 
      required: true,
      default: 'user',
      enum: ['superadmin', 'proveedor', 'empresa_owner', 'empresa_admin', 'empresa_operator', 'empresa_auditor', 'user']
    },
    
    walletAddress: { type: String, default: null },
    
    datosProveedor: { type: Object, default: null },
    
    refreshToken: { type: String, select: false },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ companyId: 1 });

export const UserModel = mongoose.model<IUser>('users', UserSchema);