import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserModel, IUser } from 'src/modules/users/models/user.model';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { hashPassword, comparePassword } from 'src/utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from 'src/utils/token';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  async register(registerDto: RegisterDto) {
    const { name, email, password, cuil_cuit, roleId } = registerDto;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) throw new ConflictException('El email ya está registrado');

    const hashedPassword = await hashPassword(password);

    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      cuil_cuit,
      roleId,
    });

    return {
      message: 'Usuario registrado correctamente',
      user: { id: (user._id as Types.ObjectId).toString(), email: user.email, name: user.name },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await UserModel.findOne({ email }).select('+password').populate('roleId');
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Credenciales inválidas');

    const payload = {
      id: (user._id as Types.ObjectId).toString(),
      email: user.email,
      role: (user.roleId as any)?.name || 'user',
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    (user as IUser).refreshToken = refreshToken;
    await user.save();

    return {
      accessToken,
      refreshToken,
      user: {
        id: (user._id as Types.ObjectId).toString(),
        email: user.email,
        name: user.name,
        role: payload.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('Refresh token requerido');

    const decoded = verifyRefreshToken(refreshToken);
    const user = await UserModel.findById(decoded.id).select('+refreshToken');

    if (!user || (user as IUser).refreshToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const payload = {
      id: (user._id as Types.ObjectId).toString(),
      email: user.email,
    };

    const newAccessToken = signAccessToken(payload);
    return { accessToken: newAccessToken };
  }

  async logout(userId: string) {
    await UserModel.findByIdAndUpdate(userId, { $unset: { refreshToken: '' } });
    return { message: 'Sesión cerrada exitosamente' };
  }
}