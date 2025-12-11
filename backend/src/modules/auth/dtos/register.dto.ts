import { IsString, IsEmail, IsNotEmpty, MinLength, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsEnum(['EMPRESA', 'PROVEEDOR'])
  @IsNotEmpty()
  type: 'EMPRESA' | 'PROVEEDOR';
}