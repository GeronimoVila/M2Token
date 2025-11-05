import mongoose from 'mongoose';
import { RoleModel } from './src/modules/roles/models/role.model';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI!;
const dbName = 'm2token_db';

async function seedRoles() {
  await mongoose.connect(MONGO_URI, { dbName });
  console.log('✅ Conectado a MongoDB para seed');

  // Limpiar roles existentes para evitar duplicados
  await RoleModel.deleteMany({});
  console.log('Roles antiguos eliminados');

  // Crear roles base
  await RoleModel.create([
    { name: 'user', description: 'Usuario estándar de la plataforma' },
    { name: 'admin', description: 'Administrador con todos los permisos' },
    { name: 'proveedor', description: 'Usuario proveedor de materiales' },
    { name: 'empresa', description: 'Usuario de empresa constructora' },
  ]);

  console.log('🌱 Roles base creados exitosamente');

  await mongoose.disconnect();
  console.log('🔌 Desconectado de MongoDB');
}

seedRoles().catch(err => console.error('❌ Error en seed:', err));