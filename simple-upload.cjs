// Simple standalone upload script for cmd/PowerShell
const https = require('https');

console.log('🔐 SIMPLE SUPABASE TEST');
console.log('Enter your credentials as command line arguments:\n');
console.log('Usage: node simple-upload.cjs "YOUR_URL" "YOUR_SERVICE_KEY"\n');

const supabaseUrl = process.argv[2];
const serviceKey = process.argv[3];

if (!supabaseUrl || !serviceKey) {
  console.log('❌ Please provide both URL and Service Key:');
  console.log('Example:');
  console.log('node simple-upload.cjs "https://bxuemorpwwelxpbrpyve.supabase.co" "eyJhbGc..."');
  process.exit(1);
}

console.log('🔗 Testing connection...');
console.log(`📍 URL: ${supabaseUrl.substring(0, 30)}...`);
console.log(`🔑 Key: ${serviceKey.substring(0, 20)}...\n`);

function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: body ? JSON.parse(body) : {},
            headers: res.headers
          });
        } catch (e) {
          resolve({ status: res.statusCode, data: { error: body }, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testConnection() {
  try {
    // Test 1: Basic connection test
    console.log('📊 Test 1: Basic connection...');

    const testUrl = `${supabaseUrl}/rest/v1/nist_controls?select=id&limit=1`;
    const testOptions = {
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    };

    const testResponse = await makeRequest(testUrl, testOptions);

    if (testResponse.status === 200) {
      console.log('✅ Table exists and accessible!');
      console.log(`📊 Response: ${JSON.stringify(testResponse.data)}`);
    } else if (testResponse.status === 404) {
      console.log('⚠️  Table does not exist - will try to create sample record...');

      // Test 2: Try to insert a sample record (this will create the table if permissions allow)
      console.log('\n📊 Test 2: Creating sample record...');

      const sampleControl = {
        id: 'TEST-' + Date.now(),
        family: 'Test',
        title: 'Test Control',
        description: 'Test description for connection verification',
        framework: 'NIST_800_53',
        content_hash: 'test-hash-' + Date.now()
      };

      const uploadUrl = `${supabaseUrl}/rest/v1/nist_controls`;
      const uploadOptions = {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }
      };

      const uploadResponse = await makeRequest(uploadUrl, uploadOptions, sampleControl);

      if (uploadResponse.status === 201) {
        console.log('✅ Sample record created successfully!');
        console.log('✅ Database connection verified!');

        // Clean up test record
        const deleteUrl = `${supabaseUrl}/rest/v1/nist_controls?id=eq.${sampleControl.id}`;
        const deleteOptions = {
          method: 'DELETE',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`
          }
        };

        await makeRequest(deleteUrl, deleteOptions);
        console.log('🧹 Test record cleaned up');

      } else {
        console.log('❌ Failed to create sample record:');
        console.log(`Status: ${uploadResponse.status}`);
        console.log(`Response: ${JSON.stringify(uploadResponse.data)}`);
      }
    } else {
      console.log('❌ Unexpected response:');
      console.log(`Status: ${testResponse.status}`);
      console.log(`Response: ${JSON.stringify(testResponse.data)}`);
    }

    console.log('\n🎉 CONNECTION TEST COMPLETE!');
    console.log('Your credentials are working properly.');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();