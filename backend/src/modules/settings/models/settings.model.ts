import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  precioM2: number;
  tokensPorM2: number;
  createdAt: Date;
  updatedAt: Date;
}

export const SettingsSchema = new Schema<ISettings>(
  {
    precioM2: { type: Number, required: true, default: 1500 },
    tokensPorM2: { type: Number, required: true, default: 100 },
  },
  {
    timestamps: true,
    collection: 'settings',
  }
);

export const SettingsModel = mongoose.model<ISettings>('settings', SettingsSchema);