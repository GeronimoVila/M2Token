import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompaniesController } from './controllers/companies.controller';
import { CompaniesService } from './services/companies.service';
import { CompanySchema } from './models/company.model';
import { UserSchema } from '../users/models/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'companies', schema: CompanySchema },
      { name: 'users', schema: UserSchema },
    ]),
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService, MongooseModule],
})
export class CompaniesModule {}