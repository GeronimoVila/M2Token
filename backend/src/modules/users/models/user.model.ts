import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  cuit?: string; 
  
  companyId?: mongoose.Types.ObjectId; 
  role: string; 
  walletAddress?: string;
  category?: string;
  address?: string;
  phone?: string;
  website?: string;
  
  refreshToken?: string;
  isActive: boolean;
  createdAt: Date;
}

export const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    cuit: { type: String, default: null }, 
    
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'companies', default: null, index: true },
    
    role: { 
      type: String, 
      required: true,
      default: 'user',
      enum: ['superadmin', 'proveedor', 'empresa_owner', 'empresa_admin', 'empresa_operator', 'empresa_auditor', 'user']
    },
    
    walletAddress: { type: String, default: null },
    category: { type: String, default: null },
    address: { type: String, default: null },
    phone: { type: String, default: null },
    website: { type: String, default: null },
    
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
UserSchema.index({ cuit: 1 }); 

export const UserModel = mongoose.model<IUser>('users', UserSchema);