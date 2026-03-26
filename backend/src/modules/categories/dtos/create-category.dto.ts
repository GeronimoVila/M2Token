import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}