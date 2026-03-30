import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../enums/role.enum';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  cuit?: string; 
  
  companyId?: mongoose.Types.ObjectId; 
  role: UserRole;
  walletAddress?: string;
  cbu?: string;
  alias?: string;
  razonSocial?: string;
  
  category?: mongoose.Types.ObjectId;
  specialties?: string[];
  description?: string;
  rating?: number;
  
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
    password: { type: String, required: false, select: false },
    googleId: { type: String, unique: true, sparse: true },
    
    cuit: { type: String, default: null }, 
    
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'companies', default: null, index: true },
    
    role: { 
      type: String, 
      required: true,
      default: UserRole.USER,
      enum: Object.values(UserRole)
    },
    
    walletAddress: { type: String, default: null },
    cbu: { type: String, default: null },
    alias: { type: String, default: null },
    razonSocial: { type: String, default: null },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    specialties: { type: [String], default: [] },
    description: { type: String, default: null },
    rating: { type: Number, default: 0 },
    
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
UserSchema.index({ googleId: 1 }, { sparse: true }); 

export const UserModel = mongoose.model<IUser>('users', UserSchema);