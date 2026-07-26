import { signToken, verifyToken, verifyJWT } from '../src/utils/jwt';

describe('jwt utils', () => {
  it('signs and verifies token payload', () => {
    const token = signToken({ id: 7, role: 'ADMIN' });
    const decoded = verifyToken(token) as any;

    expect(decoded.id).toBe(7);
    expect(decoded.role).toBe('ADMIN');
  });

  it('verifyJWT alias works same as verifyToken', () => {
    const token = signToken({ id: 42, role: 'MANAGER' });
    const decoded = verifyJWT(token) as any;

    expect(decoded.id).toBe(42);
    expect(decoded.role).toBe('MANAGER');
  });

  it('throws for malformed token', () => {
    expect(() => verifyToken('bad.token.value')).toThrow();
  });
});
