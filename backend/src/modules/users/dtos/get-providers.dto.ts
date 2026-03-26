import { IsOptional, IsString, IsMongoId } from 'class-validator';

export class GetProvidersQueryDto {
  @IsOptional()
  @IsMongoId({ message: 'El ID de la categoría no es válido' })
  category?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  search?: string;
}