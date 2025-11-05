import { IsNotEmpty, IsEnum } from 'class-validator';

export class ValidateRemitoDto {
  @IsEnum(['validado', 'rechazado'])
  @IsNotEmpty()
  estado: 'validado' | 'rechazado';
}