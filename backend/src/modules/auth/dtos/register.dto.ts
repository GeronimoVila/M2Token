import { IsEmail, IsNotEmpty, IsString, MinLength, IsIn } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  cuil_cuit: number;

  @IsString()
  @IsNotEmpty()

  @IsIn(['empresa', 'proveedor'], { message: 'El rol debe ser empresa o proveedor' })
  role: string; 
}