import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { RemitosModule } from './modules/remitos/remitos.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { AssignmentsModule } from './modules/project-assignments/assignments.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { CanjesModule } from './modules/canjes/canjes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');

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

    AuthModule,
    UsersModule,
    ProjectsModule,
    RemitosModule,
    CompaniesModule,
    AssignmentsModule,
    BlockchainModule,
    CanjesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}