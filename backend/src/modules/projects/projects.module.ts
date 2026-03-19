import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsController } from './controllers/projects.controller';
import { ProjectsService } from './services/projects.service';
import { ProjectSchema } from './models/project.model';
import { AssignmentsModule } from '../project-assignments/assignments.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'projects', schema: ProjectSchema }]),
    AssignmentsModule
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService]
})
export class ProjectsModule {}