import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

export function loadEnv() {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  const envPath = path.resolve(process.cwd(), '.env');
  const dotenvPath = fs.existsSync(envLocalPath) ? envLocalPath : envPath;

  dotenv.config({ path: dotenvPath });
}
