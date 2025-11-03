import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // Configuración global del .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        console.log('🔗 Intentando conectar a MongoDB:', uri);

        try {
          const mongoose = await import('mongoose');
          await mongoose.connect(uri!, {
            dbName: 'm2token_db',
          });
          console.log('✅ Conectado exitosamente a MongoDB!');
        } catch (error) {
          console.error('❌ Error conectando a MongoDB:', error);
        }

        return {
          uri,
          dbName: 'm2token_db',
        };
      },
      inject: [ConfigService],
    }),


    // Módulos del proyecto
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}