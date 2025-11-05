import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleSchema } from './models/role.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'roles', schema: RoleSchema }, 
    ]),
  ],
  exports: [MongooseModule],
})
export class RolesModule {}