import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssignmentsController } from './controllers/assignments.controller';
import { AssignmentsService } from './services/assignments.service';
import { AssignmentSchema } from './models/assignment.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'project_assignments', schema: AssignmentSchema }]),
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}