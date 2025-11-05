import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectSchema } from './models/project.model';
import { ProjectsController } from './controllers/projects.controller';
import { ProjectsService } from './services/projects.service';
import { AuthModule } from 'src/modules/auth/auth.module'; 

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'projects', schema: ProjectSchema },
    ]),
    AuthModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}