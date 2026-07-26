import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'supersecretjwtkey';
const expiresIn = (process.env.JWT_EXPIRES_IN || '1h') as jwt.SignOptions['expiresIn'];

export function signToken(payload: object) {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret);
}

export const verifyJWT = verifyToken;
