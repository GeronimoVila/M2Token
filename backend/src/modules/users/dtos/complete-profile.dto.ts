import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CompleteProfileDto {
  @IsString()
  @IsNotEmpty({ message: 'El CUIT es obligatorio para proveedores' })
  cuit: string;

  @IsString()
  @IsNotEmpty({ message: 'El rubro es obligatorio' })
  category: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'El sitio web debe ser una URL válida' })
  website?: string;
}