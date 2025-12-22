import { IsEnum, IsInt, IsMongoId, IsPositive, IsOptional, IsString } from 'class-validator';
import { TipoCanje } from '../models/canje.model';

export class CreateCanjeDto {
  @IsMongoId()
  projectId: string;

  @IsInt()
  @IsPositive({ message: 'La cantidad de tokens debe ser mayor a 0' })
  amountTokens: number;

  @IsEnum(TipoCanje, { message: 'El tipo debe ser DINERO o ACTIVO' })
  tipo: TipoCanje;

  @IsOptional()
  @IsString()
  descripcionActivo?: string; 
}