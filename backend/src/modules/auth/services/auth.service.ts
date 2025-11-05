import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from 'src/modules/users/models/user.model';
import { IRole } from 'src/modules/roles/models/role.model'; 
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { hashPassword, comparePassword } from 'src/utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from 'src/utils/token';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('users') private userModel: Model<IUser>,
    @InjectModel('roles') private roleModel: Model<IRole>
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password, cuil_cuit } = registerDto; 

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) throw new ConflictException('El email ya está registrado');

    const userRole = await this.roleModel.findOne({ name: 'user' });
    if (!userRole) {
      throw new ConflictException('Rol "user" no encontrado. Ejecuta el seed.');
    }

    const user = await this.userModel.create({
      name,
      email,
      password: password, 
      cuil_cuit,
      roleId: userRole._id,
    });

    return {
      message: 'Usuario registrado correctamente',
      user: { id: (user._id as Types.ObjectId).toString(), email: user.email, name: user.name },
    };
  }
  
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email }).select('+password').populate('roleId');
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
    const user = await this.userModel.findById(decoded.id).select('+refreshToken');

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
    await this.userModel.findByIdAndUpdate(userId, { $unset: { refreshToken: '' } });
    return { message: 'Sesión cerrada exitosamente' };
  }
}