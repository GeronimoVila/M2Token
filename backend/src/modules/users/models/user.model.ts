import mongoose, { Schema, Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  cuil_cuit: number;
  roleId?: mongoose.Types.ObjectId;
  walletAddress?: string;
  datosEmpresa?: Record<string, any>;
  datosProveedor?: Record<string, any>;
  refreshToken?: string;
  createdAt: Date;

  comparePassword(plain: string): Promise<boolean>;
}

export const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    cuil_cuit: { type: Number, required: true },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'roles', index: true },
    walletAddress: { type: String, default: null },
    datosEmpresa: { type: Object, default: null },
    datosProveedor: { type: Object, default: null },
    refreshToken: { type: String, select: false },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ roleId: 1 });

UserSchema.pre('save', async function (next) {
  const user = this as IUser;

  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (err) {
    next(err as any);
  }
});

UserSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.password);
};

export const UserModel = mongoose.model<IUser>('users', UserSchema);