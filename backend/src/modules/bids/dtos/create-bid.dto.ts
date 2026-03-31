import { IsString, IsNotEmpty, IsNumber, IsMongoId, Min, IsOptional } from 'class-validator';

export class CreateBidDto {
  @IsMongoId()
  @IsNotEmpty()
  tender: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  message?: string;
}