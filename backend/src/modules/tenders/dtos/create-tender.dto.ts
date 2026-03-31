import { IsString, IsNotEmpty, IsNumber, IsDateString, IsMongoId, Min } from 'class-validator';

export class CreateTenderDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsMongoId()
  @IsNotEmpty()
  category: string;

  @IsMongoId()
  @IsNotEmpty()
  project: string;

  @IsNumber()
  @Min(0)
  budgetM2: number;

  @IsDateString()
  @IsNotEmpty()
  deadline: string;
}