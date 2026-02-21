// Vercel Serverless Function Entry Point
// This file imports and exports the Express app as a serverless function

// Configure environment variables
require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env.production') });

const app = require('../backend/src/server');

// Export the Express app as a serverless function
module.exports = app;
