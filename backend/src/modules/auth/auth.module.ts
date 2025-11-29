import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from 'src/modules/users/users.module';
import { RolesModule } from 'src/modules/roles/roles.module'; 
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecreto_largo_y_unico', 
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RolesGuard,
    JwtStrategy,
  ], 
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}