import fetch from 'node-fetch';

// Test login function
async function testLogin() {
  try {
    console.log('Testing login API...');
    
    const email = 'test@example.com'; // Replace with a valid email
    const password = 'password123';    // Replace with a valid password
    
    console.log(`Attempting to login with: ${email}`);
    
    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });
    
    const data = await response.json();
    
    console.log('Status code:', response.status);
    console.log('Response data:', data);
    
    if (response.status === 200 && data.token) {
      console.log('✅ Login successful!');
      console.log('Auth token:', data.token);
    } else {
      console.log('❌ Login failed:', data.message);
    }
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testLogin(); 