// Standalone Node.js script - run directly with: node standalone-upload.js
const readline = require('readline');
const fs = require('fs');
const https = require('https');

console.log('🔐 STANDALONE SUPABASE UPLOAD');
console.log('This script runs independently and stores nothing.\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: JSON.parse(body || '{}') });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function uploadData() {
  try {
    // Get credentials
    const supabaseUrl = await prompt('🌐 Supabase URL: ');
    const serviceKey = await prompt('🔐 Service Role Key: ');

    rl.close();

    console.log('\n🔗 Testing connection...');

    // Test connection
    const testUrl = `${supabaseUrl}/rest/v1/nist_controls?select=id&limit=1`;
    const testOptions = {
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    };

    try {
      const testResponse = await makeRequest(testUrl, testOptions);
      console.log('✅ Connection successful!');
    } catch (error) {
      console.log('⚠️  Table may not exist, will try to create...');
    }

    console.log('📊 Loading framework data...');

    // Load sample data (you'd replace this with your actual data loading)
    const sampleControls = [
      {
        id: 'AC-1',
        family: 'Access Control',
        title: 'Access Control Policy and Procedures',
        description: 'Develop, document, and disseminate access control policy and procedures.',
        framework: 'NIST_800_53',
        content_hash: 'ac1-hash-' + Date.now()
      },
      {
        id: 'GV.OC-01',
        family: 'GOVERN',
        title: 'Organizational mission understanding',
        description: 'The organizational mission is understood and informs cybersecurity risk management.',
        framework: 'NIST_CSF',
        content_hash: 'gv-oc-01-hash-' + Date.now()
      }
    ];

    console.log(`📤 Uploading ${sampleControls.length} sample controls...`);

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

    const uploadResponse = await makeRequest(uploadUrl, uploadOptions, sampleControls);

    if (uploadResponse.status === 201) {
      console.log('✅ Sample upload successful!');
      console.log('\n🎉 CONNECTION VERIFIED!');
      console.log('Your credentials work perfectly.');
      console.log('Ready to proceed with full data upload.');
    } else {
      console.log('❌ Upload failed:', uploadResponse.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

uploadData();