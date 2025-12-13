import { IsString, IsNotEmpty, IsNumber, IsDateString, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRemitoDto {
  @IsMongoId()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  numeroRemito: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  monto: number;

  @IsDateString()
  @IsNotEmpty()
  fechaEntrega: Date;
}