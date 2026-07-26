import fs from 'fs';
import dotenv from 'dotenv';
import { loadEnv } from '../src/utils/env';

jest.mock('fs');
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('loadEnv', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('prefers .env.local when present', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);

    loadEnv();

    expect(dotenv.config).toHaveBeenCalledWith(
      expect.objectContaining({ path: expect.stringContaining('.env.local') })
    );
  });

  it('falls back to .env when .env.local is missing', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    loadEnv();

    expect(dotenv.config).toHaveBeenCalledWith(
      expect.objectContaining({ path: expect.stringContaining('.env') })
    );
    expect(dotenv.config).not.toHaveBeenCalledWith(
      expect.objectContaining({ path: expect.stringContaining('.env.local') })
    );
  });
});
