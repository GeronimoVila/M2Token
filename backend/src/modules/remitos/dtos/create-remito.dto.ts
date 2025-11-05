import { IsString, IsNotEmpty, IsNumber, IsDateString, IsMongoId } from 'class-validator';

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

  @IsNumber()
  @IsNotEmpty()
  monto: number;

  @IsDateString()
  @IsNotEmpty()
  fechaEntrega: Date;
}