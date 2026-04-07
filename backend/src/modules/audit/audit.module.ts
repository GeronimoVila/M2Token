import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogSchema } from './models/auditLog.model';
import { AuditService } from './services/audit.service';
import { AuditController } from './controllers/audit.controller';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'auditLogs', schema: AuditLogSchema }]),
  ],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}