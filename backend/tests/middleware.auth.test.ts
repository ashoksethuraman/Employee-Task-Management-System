import { requireAuth, requireRole } from '../src/middleware/auth';
import { verifyToken } from '../src/utils/jwt';

jest.mock('../src/utils/jwt', () => ({
  verifyToken: jest.fn()
}));

function createRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('requireAuth', () => {
  it('returns 401 when authorization header is missing', async () => {
    const req: any = { headers: {} };
    const res = createRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authorization token required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is invalid', async () => {
    (verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error('bad token');
    });

    const req: any = { headers: { authorization: 'Bearer invalid' } };
    const res = createRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('sets req.user and calls next for valid token', async () => {
    (verifyToken as jest.Mock).mockReturnValue({ id: 11, role: 'ADMIN' });

    const req: any = { headers: { authorization: 'Bearer valid-token' } };
    const res = createRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(req.user).toEqual({ id: 11, role: 'ADMIN' });
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('requireRole', () => {
  it('returns 403 when user is not authorized', () => {
    const middleware = requireRole(['ADMIN']);
    const req: any = { user: { id: 1, role: 'EMPLOYEE' } };
    const res = createRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: insufficient permissions' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when user has allowed role', () => {
    const middleware = requireRole(['ADMIN', 'MANAGER']);
    const req: any = { user: { id: 1, role: 'MANAGER' } };
    const res = createRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
