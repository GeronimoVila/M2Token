import mongoose from 'mongoose';
import { UserModel } from './src/modules/users/models/user.model';
import { RoleModel } from './src/modules/roles/models/role.model';
import { ProjectModel } from './src/modules/projects/models/project.model';
import { RemitoModel } from './src/modules/remitos/models/remito.model';
import { TokenModel } from './src/modules/tokens/models/token.model';
import { CanjeModel } from './src/modules/canjes/models/canje.model';
import { BlockchainLogModel } from './src/modules/blockchain/models/blockchainLog.model';
import { AuditLogModel } from './src/modules/audit/models/auditLog.model';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI!;
const dbName = 'm2token_db';

async function main() {
  await mongoose.connect(MONGO_URI, { dbName });
  console.log('✅ Conectado a MongoDB');

  // Inserta un documento vacío en cada colección (sólo si no existe)
  await RoleModel.create({ name: 'temp_role', description: 'rol temporal' });
  await UserModel.create({ name: 'temp_user', email: 'temp@example.com', password: '123', cuil_cuit: 12345678 });
  await ProjectModel.create({ userId: new mongoose.Types.ObjectId(), name: 'Proyecto Temporal', total_m2: 0 });
  await RemitoModel.create({ projectId: new mongoose.Types.ObjectId(), proveedorId: new mongoose.Types.ObjectId(), numeroRemito: 'RMT-TEMP', monto: 0, fechaEntrega: new Date() });
  await TokenModel.create({ proveedorId: new mongoose.Types.ObjectId(), projectId: new mongoose.Types.ObjectId(), remitoId: new mongoose.Types.ObjectId(), cantidad: 0, tokenIdBlockchain: 'TEMP-TOKEN' });
  await CanjeModel.create({ tokenId: new mongoose.Types.ObjectId(), userId: new mongoose.Types.ObjectId(), tipo: 'proveedor->empresa', cantidad: 0, fecha: new Date() });
  await BlockchainLogModel.create({ entityType: 'token', entityId: new mongoose.Types.ObjectId(), txHash: '0xTEMP', status: 'pending' });
  await AuditLogModel.create({ userId: new mongoose.Types.ObjectId(), roleId: new mongoose.Types.ObjectId(), entity: 'project', entityId: new mongoose.Types.ObjectId(), action: 'created' });

  console.log('🌱 Colecciones creadas con documentos temporales');

  await mongoose.disconnect();
  console.log('🔌 Desconectado de MongoDB');
}

main().catch(err => console.error('❌ Error en seed:', err));
