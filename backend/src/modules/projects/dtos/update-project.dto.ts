import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsString()
  @IsOptional()
  @IsEnum(['planning', 'in_progress', 'finished', 'paused'])
  status?: string;
}