import * as jwt from 'jsonwebtoken';
import ms from 'ms';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto_largo_y_unico';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'otro_supersecreto_mas_largo';

const toSeconds = (value: string | undefined, fallback: string): number => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const msValue = ms(value ?? fallback);
  return Math.floor(msValue / 1000);
};

const jwtOptions: jwt.SignOptions = { expiresIn: toSeconds(process.env.JWT_EXPIRES_IN, '15m') };
const refreshOptions: jwt.SignOptions = { expiresIn: toSeconds(process.env.REFRESH_TOKEN_EXPIRES_IN, '7d') };

export interface JwtPayload {
  id: string;
  email: string;
  role?: string;
  name?: string;
}

export const signAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, JWT_SECRET, jwtOptions);

export const signRefreshToken = (payload: JwtPayload): string =>
  jwt.sign(payload, REFRESH_SECRET, refreshOptions);

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, JWT_SECRET) as JwtPayload;

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, REFRESH_SECRET) as JwtPayload;