import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from the project root
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const required = ['VPS_HOST', 'VPS_USERNAME', 'VPS_PASSWORD'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  throw new Error(
    `Missing required env var(s) in .env.local: ${missing.join(', ')}. ` +
    'VPS credentials must not be hardcoded — set them in your local, gitignored .env.local.'
  );
}

export const sshConfig = {
  host: process.env.VPS_HOST,
  port: parseInt(process.env.VPS_PORT || '22', 10),
  username: process.env.VPS_USERNAME,
  password: process.env.VPS_PASSWORD
};
