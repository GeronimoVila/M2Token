import { Controller, Post, Body, Res, Get, UseGuards, Req, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { type Response } from 'express';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RegisterDto } from '../dtos/register.dto';
import { CompleteSocialRegisterDto } from '../dtos/complete-social-register.dto';
import { LoginDto } from '../dtos/login.dto'; 

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: any) {
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.validateGoogleUser(req.user);

    if (result.isSuspended) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=account_suspended`);
    }

    const tokens = result.tokens!;
    const user = result.user!;

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    if (user.role === 'user') {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/complete-profile`);
    }

    const dashboard = user.role === 'proveedor' ? '/proveedor' : '/companies/dashboard';
    return res.redirect(`${process.env.FRONTEND_URL}${dashboard}`);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('complete-social-registration')
  async completeSocial(
    @Req() req: any,
    @Body() dto: CompleteSocialRegisterDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.completeSocialRegistration(req.user.id, dto);
    
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return result;
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, user } = await this.authService.login(loginDto);
    
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { user, accessToken };
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