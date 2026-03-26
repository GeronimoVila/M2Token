import mongoose from 'mongoose';
import { RoleModel } from './src/modules/roles/models/role.model';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI!;
const dbName = 'm2token_db';

async function seedDatabase() {
  await mongoose.connect(MONGO_URI, { dbName });
  console.log('✅ Conectado a MongoDB para purga y seed...');

  console.log('🔥 Purgando la base de datos completa...');
  await mongoose.connection.db.dropDatabase();
  console.log('🗑️ Base de datos eliminada limpiamente.');

  console.log('🌱 Sembrando Roles...');
  await RoleModel.create([
    { name: 'superadmin', description: 'Administrador total del sistema (La Bestia)' },
    { name: 'user', description: 'Usuario estándar sin asignar' },
    { name: 'proveedor', description: 'Usuario proveedor de materiales/servicios' },
    { name: 'empresa_owner', description: 'Dueño de empresa constructora' },
    { name: 'empresa_admin', description: 'Administrador de empresa constructora' },
    { name: 'empresa_operator', description: 'Operador (Puede cargar, pero no validar)' },
    { name: 'empresa_auditor', description: 'Auditor de empresa (Solo lectura/Reportes)' },
  ]);
  console.log('✅ Roles base creados exitosamente.');

  console.log('🌱 Sembrando Categorías...');
  const categoriasBase = [
    { name: 'MATERIALES_OBRA_GRUESA', label: 'Materiales de Obra Gruesa', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'MATERIALES_OBRA_FINA', label: 'Materiales de Obra Fina', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'INSTALACIONES_ELECTRICAS', label: 'Instalaciones Eléctricas', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'PLOMERIA_Y_SANITARIOS', label: 'Plomería y Sanitarios', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'MAQUINARIA_Y_HERRAMIENTAS', label: 'Maquinaria y Herramientas', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'CARPINTERIA_Y_ABERTURAS', label: 'Carpintería y Aberturas', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'SERVICIOS_PROFESIONALES', label: 'Servicios Profesionales', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'MANO_DE_OBRA', label: 'Mano de Obra (Cuadrillas)', isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ];

  await mongoose.connection.collection('categories').insertMany(categoriasBase);
  console.log(`✅ ${categoriasBase.length} Categorías creadas exitosamente.`);

  await mongoose.disconnect();
  console.log('🔌 Desconectado de MongoDB');
  console.log('🚀 SEED COMPLETADO: Tu plataforma está lista para la Fase 2.');
}

seedDatabase().catch(err => {
  console.error('❌ Error fatal en seed:', err);
  process.exit(1);
});