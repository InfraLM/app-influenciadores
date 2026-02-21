// Vercel Serverless Function Entry Point
// This file uses ES Modules to be compatible with the project's package.json "type": "module"

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Create require function for CommonJS modules
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const dotenv = require('dotenv');
dotenv.config({ path: join(__dirname, '../backend/.env.production') });

// Import the Express app (CommonJS)
const app = require('../backend/src/server');

// Export as ES Module default export for Vercel
export default app;
