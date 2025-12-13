import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateAssignmentDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId({ message: 'El ID del proyecto no es válido' })
  projectId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId({ message: 'El ID del proveedor no es válido' })
  providerId: string;
}