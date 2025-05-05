#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('Running escrow release test...');

try {
  // Run the test file
  const result = execSync(
    'npx jest tests/escrow-release.test.js --forceExit',
    { 
      cwd: rootDir,
      stdio: 'inherit' 
    }
  );
  
  console.log('Test completed successfully!');
} catch (error) {
  console.error('Test failed with error:', error.message);
  process.exit(1);
} 