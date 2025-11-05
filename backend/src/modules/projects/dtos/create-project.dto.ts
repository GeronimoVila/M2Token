import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @IsNotEmpty()
  total_m2: number;

  @IsEnum(['en_obra', 'finalizado', 'pausado'])
  @IsOptional()
  status?: 'en_obra' | 'finalizado' | 'pausado';
}