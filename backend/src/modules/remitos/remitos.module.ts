import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RemitoSchema } from './models/remito.model';
import { RemitosController } from './controllers/remitos.controller';
import { RemitosService } from './services/remitos.service';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UsersModule } from 'src/modules/users/users.module';
import { IpfsService } from './services/ipfs.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'remitos', schema: RemitoSchema }]),
    AuthModule,
    UsersModule,
  ],
  controllers: [RemitosController],
  providers: [RemitosService, IpfsService],
})
export class RemitosModule {}