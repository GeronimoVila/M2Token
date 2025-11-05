import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IProject } from '../models/project.model';
import { CreateProjectDto } from '../dtos/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel('projects') private readonly projectModel: Model<IProject>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<IProject> {
    const newProject = new this.projectModel({
      ...createProjectDto,
      userId: userId,
    });
    return newProject.save();
  }

  async findAllByUserId(userId: string): Promise<IProject[]> {
    return this.projectModel.find({ userId: userId }).exec();
  }
}