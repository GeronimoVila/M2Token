import { IsNumber, Min } from 'class-validator';

export class UpdateSettingsDto {
  @IsNumber()
  @Min(1)
  precioM2!: number;

  @IsNumber()
  @Min(1)
  tokensPorM2!: number;
}