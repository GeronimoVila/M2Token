import mongoose, { Schema, Document } from 'mongoose';

export interface IInvitation extends Document {
  email: string;
  companyId: mongoose.Types.ObjectId;
  role: string;
  token: string;
  invitedBy: mongoose.Types.ObjectId;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const InvitationSchema = new Schema<IInvitation>(
  {
    email: { 
      type: String, 
      required: true, 
      lowercase: true, 
      trim: true 
    },
    companyId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'companies', 
      required: true 
    },
    role: { 
      type: String, 
      required: true 
    },
    token: { 
      type: String, 
      required: true, 
      unique: true 
    },
    invitedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'users', 
      required: true 
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'],
      default: 'PENDING',
    },
    expiresAt: { 
      type: Date, 
      required: true 
    },
  },
  {
    timestamps: true,
    collection: 'invitations',
  }
);

// Índices para optimizar búsquedas
InvitationSchema.index({ token: 1 }, { unique: true });
InvitationSchema.index({ email: 1, companyId: 1 });
InvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const InvitationModel = mongoose.model<IInvitation>('invitations', InvitationSchema);