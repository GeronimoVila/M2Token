import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEmail, IsUrl } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  razonSocial: string;

  @IsNumber()
  @IsNotEmpty()
  cuit: number;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsUrl()
  @IsOptional()
  website?: string;
}