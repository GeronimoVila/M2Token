import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from '../enums/role.enum';

export class InviteUserDto {
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @IsEnum([UserRole.COMPANY_ADMIN, UserRole.COMPANY_APPROVER, UserRole.COMPANY_VIEWER], {
    message: 'Rol inválido para invitación de empresa',
  })
  role: UserRole;
}