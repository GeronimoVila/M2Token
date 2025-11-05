import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UsersModule } from 'src/modules/users/users.module';
import { RolesModule } from 'src/modules/roles/roles.module'; 
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    UsersModule,
    RolesModule 
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RolesGuard
  ], 
  exports: [AuthService],
})
export class AuthModule {}