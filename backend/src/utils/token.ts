// src/utils/token.ts
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import ms from 'ms';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'clave-ultra-secreta';
const REFRESH_SECRET: Secret = process.env.REFRESH_TOKEN_SECRET || 'refresh-ultra-secreta';

// Convierte "15m", "7d", etc. a segundos
const toSeconds = (value: string | undefined, fallback: string): number => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore – los tipos de `ms` no reconocen correctamente cadenas "15m", "7d"
  const msValue = ms(value ?? fallback);
  return Math.floor(msValue / 1000);
};

const jwtOptions: SignOptions = { expiresIn: toSeconds(process.env.JWT_EXPIRES_IN, '15m') };
const refreshOptions: SignOptions = { expiresIn: toSeconds(process.env.REFRESH_TOKEN_EXPIRES_IN, '7d') };

export interface JwtPayload {
  id: string;
  email: string;
  role?: string;
}

export const signAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, JWT_SECRET, jwtOptions);

export const signRefreshToken = (payload: JwtPayload): string =>
  jwt.sign(payload, REFRESH_SECRET, refreshOptions);

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, JWT_SECRET) as JwtPayload;

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, REFRESH_SECRET) as JwtPayload;