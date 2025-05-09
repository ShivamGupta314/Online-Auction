// fix-email-config.js
// A script to copy from .envv to .env with fixed email config

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envvPath = path.join(__dirname, '.envv');
const envPath = path.join(__dirname, '.env');

try {
  console.log('Reading .envv file...');
  if (!fs.existsSync(envvPath)) {
    console.error('.envv file not found. Please check if it exists in the root directory.');
    process.exit(1);
  }
  
  let envContent = fs.readFileSync(envvPath, 'utf8');
  
  // Comment out problematic email config lines
  envContent = envContent.replace(
    /EMAIL_HOST=smtp.example.com/g, 
    '# EMAIL_HOST=smtp.example.com'
  );
  
  envContent = envContent.replace(
    /EMAIL_PORT=587/g, 
    '# EMAIL_PORT=587'
  );
  
  envContent = envContent.replace(
    /EMAIL_USER=your-email@example.com/g, 
    '# EMAIL_USER=your-email@example.com'
  );
  
  envContent = envContent.replace(
    /EMAIL_PASS=your-email-password/g, 
    '# EMAIL_PASS=your-email-password'
  );
  
  console.log('Writing to .env file...');
  fs.writeFileSync(envPath, envContent);
  
  console.log('Fixed! Created a new .env file from .envv with corrected email configuration.');
  console.log('The system will now use Ethereal for test emails.');
} catch (error) {
  console.error('Error updating/creating .env file:', error);
} 