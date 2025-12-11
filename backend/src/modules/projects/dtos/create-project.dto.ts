import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del proyecto es obligatorio' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  budget?: number;

  @IsEnum(['planning', 'in_progress', 'finished', 'paused'])
  @IsOptional()
  status?: 'planning' | 'in_progress' | 'finished' | 'paused';
}