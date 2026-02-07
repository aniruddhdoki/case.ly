'use strict';
// Load .env before server.js runs so OPENAI_API_KEY is available when agent.js loads.
require('dotenv').config();
if (!process.env.OPENAI_API_KEY) {
  require('dotenv').config({ path: '.env.example' });
}
