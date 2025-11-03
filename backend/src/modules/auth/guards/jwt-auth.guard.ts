import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { verifyAccessToken } from 'src/utils/token';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization || '';

    if (!authHeader.startsWith('Bearer '))
      throw new UnauthorizedException('Token no provisto o formato inválido');

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyAccessToken(token);
      request.user = decoded; // adjuntamos los datos del token al request
      return true;
    } catch (err) {
      throw new ForbiddenException('Token inválido o expirado');
    }
  }
}