import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { UsersModule } from 'src/modules/users/users.module';
import { RolesModule } from 'src/modules/roles/roles.module'; 
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'supersecreto_largo_y_unico',
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RolesGuard,
    JwtStrategy,
    GoogleStrategy,
  ], 
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}