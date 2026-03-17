import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { IUser } from 'src/modules/users/models/user.model';
import { UsersService } from 'src/modules/users/services/users.service';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { CompleteSocialRegisterDto } from '../dtos/complete-social-register.dto';
import { hashPassword, comparePassword } from 'src/utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from 'src/utils/token';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  async validateGoogleUser(googleUser: any) {
    let user = await this.usersService.findByEmail(googleUser.email);

    if (!user) {
      user = await this.usersService.create({
        name: `${googleUser.firstName} ${googleUser.lastName}`,
        email: googleUser.email,
        googleId: googleUser.googleId,
        role: 'user', 
        isActive: true,
      });
    } else if (!user.googleId) {
      await this.usersService.update(user._id.toString(), { googleId: googleUser.googleId });
    }

    const tokens = await this.generateTokens(user);
    
    await this.usersService.update(user._id.toString(), { 
      refreshToken: tokens.refreshToken 
    });

    return {
      tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        companyId: user.companyId
      }
    };
  }

  async completeSocialRegistration(userId: string, dto: CompleteSocialRegisterDto) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    
    if (user.role !== 'user') throw new ConflictException('El perfil ya ha sido completado anteriormente');

    const newRole = dto.type === 'EMPRESA' ? 'empresa_owner' : 'proveedor';
    
    const updatedUser = await this.usersService.update(userId, { role: newRole });

    const tokens = await this.generateTokens(updatedUser!);

    return {
      message: 'Perfil completado correctamente',
      accessToken: tokens.accessToken,
      user: {
        id: updatedUser!._id.toString(),
        email: updatedUser!.email,
        role: updatedUser!.role,
        companyId: updatedUser!.companyId 
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { name, email, password, type } = registerDto; 
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) throw new ConflictException('El email ya está registrado');

    const initialRole = type === 'EMPRESA' ? 'empresa_owner' : 'proveedor';
    const hashedPassword = await hashPassword(password); 

    const user = await this.usersService.create({
      name, email, password: hashedPassword, role: initialRole
    });

    const tokens = await this.generateTokens(user);
    await this.usersService.update((user._id as Types.ObjectId).toString(), { refreshToken: tokens.refreshToken });

    return {
      message: 'Usuario registrado correctamente',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role, companyId: user.companyId },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const isMatch = await comparePassword(password, user.password || '');
    if (!isMatch) throw new UnauthorizedException('Credenciales inválidas');

    const tokens = await this.generateTokens(user);
    await this.usersService.update(user._id.toString(), { refreshToken: tokens.refreshToken });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role, companyId: user.companyId },
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('Refresh token requerido');
    try {
      const decoded = verifyRefreshToken(refreshToken) as { sub: string; id: string; email: string };
      const userId = decoded.sub || decoded.id; 
      const user = await this.usersService.findByIdWithRefreshToken(userId);

      if (!user || user.refreshToken !== refreshToken) throw new UnauthorizedException('Refresh token inválido');

      const payload = { sub: user._id.toString(), id: user._id.toString(), email: user.email, role: user.role, companyId: user.companyId };
      return { accessToken: signAccessToken(payload) };
    } catch (error) {
      throw new UnauthorizedException('Token expirado o inválido');
    }
  }

  async logout(userId: string) {
    await this.usersService.update(userId, { refreshToken: undefined }); 
    return { message: 'Sesión cerrada exitosamente' };
  }

  private async generateTokens(user: IUser) {
    const payload = {
      sub: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      companyId: user.companyId
    };
    return { accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload) };
  }
}