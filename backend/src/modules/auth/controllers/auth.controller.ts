import { 
  Controller, 
  Post, 
  Body, 
  Res 
} from '@nestjs/common';
import { type Response } from 'express';
import { AuthService } from '../services/auth.service';
import { loginSchema, type LoginData } from '@common/schemas/auth.schema';
import { RegisterDto } from '../dtos/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(
    @Body() loginData: LoginData,
    @Res({ passthrough: true }) res: Response,
  ) {
    loginSchema.parse(loginData);
    const { accessToken, user } = await this.authService.login(loginData);
    
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return { 
      user, 
      accessToken
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0),
    });
    return { message: 'Sesión cerrada exitosamente' };
  }
}