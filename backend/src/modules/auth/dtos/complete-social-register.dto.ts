import { IsEnum, IsNotEmpty } from 'class-validator';

export enum UserType {
  EMPRESA = 'EMPRESA',
  PROVEEDOR = 'PROVEEDOR',
}

export class CompleteSocialRegisterDto {
  @IsNotEmpty({ message: 'El tipo de usuario es obligatorio' })
  @IsEnum(UserType, { message: 'El tipo debe ser EMPRESA o PROVEEDOR' })
  type: UserType;
}