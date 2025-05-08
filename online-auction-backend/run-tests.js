// run-tests.js
import { execSync } from 'child_process';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
const envFile = 'env.test';
dotenv.config({ path: envFile });

// Load test environment variables
let testEnv = {};
try {
  const testEnvContent = readFileSync(envFile, 'utf8');
  testEnvContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        testEnv[key.trim()] = value.trim();
      }
    }
  });
  console.log('Loaded test environment variables');
} catch (err) {
  console.warn(`Warning: Could not load ${envFile}. Using default environment.`);
}

// Configure test directory
const TEST_DIR = './tests';
const TEST_COMMAND = 'NODE_OPTIONS=\'--experimental-vm-modules\' npx jest';

// Get all test files from the tests directory
const getTestFiles = () => {
  const allFiles = readdirSync(TEST_DIR);
  return allFiles.filter(file => file.endsWith('.test.js'));
};

// Run tests sequentially
const runTests = async () => {
  const testFiles = getTestFiles();
  console.log(`Found ${testFiles.length} test files`);
  
  let passedTests = 0;
  let failedTests = [];
  
  // Run each test file separately
  for (const testFile of testFiles) {
    const fullPath = join(TEST_DIR, testFile);
    console.log(`\n\n===============================`);
    console.log(`Running test: ${testFile}`);
    console.log(`===============================`);
    
    try {
      // Run with environment setup for testing
      execSync(`${TEST_COMMAND} ${fullPath}`, { 
        stdio: 'inherit',
        env: {
          ...process.env,
          ...testEnv,
          NODE_ENV: 'test',
          // Mock Stripe key to avoid actual API calls
          STRIPE_SECRET_KEY: testEnv.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_testing'
        }
      });
      console.log(`✅ ${testFile} - PASSED`);
      passedTests++;
    } catch (error) {
      console.log(`❌ ${testFile} - FAILED`);
      failedTests.push(testFile);
    }
  }
  
  // Summary
  console.log('\n\n===============================');
  console.log('TEST SUMMARY');
  console.log('===============================');
  console.log(`Total tests: ${testFiles.length}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests.length}`);
  
  if (failedTests.length > 0) {
    console.log('\nFailed tests:');
    failedTests.forEach(test => console.log(`- ${test}`));
    process.exit(1);
  } else {
    console.log('\nAll tests passed! 🎉');
    process.exit(0);
  }
};

// Execute
runTests().catch(err => {
  console.error('Error running tests:', err);
  process.exit(1);
}); 