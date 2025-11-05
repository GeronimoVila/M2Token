import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
  entity: 'token' | 'remito' | 'project';
  entityId: mongoose.Types.ObjectId;
  action: 'created' | 'updated' | 'deleted' | 'validated';
  timestamp: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'roles', required: true },
    entity: {
      type: String,
      enum: ['token', 'remito', 'project'],
      required: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    action: {
      type: String,
      enum: ['created', 'updated', 'deleted', 'validated'],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'auditLogs',
  }
);

AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ roleId: 1 });
AuditLogSchema.index({ entity: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ timestamp: -1 });

export const AuditLogModel = mongoose.model<IAuditLog>('auditLogs', AuditLogSchema);