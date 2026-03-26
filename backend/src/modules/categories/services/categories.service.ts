import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../models/category.model';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { UpdateCategoryDto } from '../dtos/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryModel.findOne({ name: createCategoryDto.name.toUpperCase() });
    if (existing) {
      throw new ConflictException('La categoría ya existe');
    }
    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  async findAllActive(): Promise<Category[]> {
    return this.categoryModel.find({ isActive: true }).sort({ label: 1 }).exec();
  }

  async findAllForAdmin(): Promise<Category[]> {
    return this.categoryModel.find().sort({ label: 1 }).exec();
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
    if (!updatedCategory) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return updatedCategory;
  }

  async toggleActive(id: string, isActive: boolean): Promise<Category> {
    const category = await this.categoryModel.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return category;
  }
}