// Verify upload results
const https = require('https');

const supabaseUrl = process.argv[2] || 'https://bxuemorpwwelxpbrpyve.supabase.co';
const serviceKey = process.argv[3];

if (!serviceKey) {
  console.log('Usage: node verify-upload.cjs "URL" "SERVICE_KEY"');
  process.exit(1);
}

console.log('🔍 VERIFYING UPLOAD RESULTS\n');

function makeRequest(url, options) {
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
    req.end();
  });
}

async function verifyUpload() {
  try {
    console.log('📊 Checking table and count...');

    // Get total count
    const countUrl = `${supabaseUrl}/rest/v1/nist_controls?select=id&limit=1`;
    const countOptions = {
      method: 'HEAD',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'count=exact'
      }
    };

    const countResponse = await makeRequest(countUrl, countOptions);

    if (countResponse.status === 200) {
      const totalCount = countResponse.headers['content-range'];
      if (totalCount) {
        const count = totalCount.split('/')[1];
        console.log(`✅ Total records: ${count}`);
      }
    } else {
      console.log(`❌ Count request failed: Status ${countResponse.status}`);
      console.log('Response:', countResponse.data);
    }

    // Get sample data
    console.log('\n📋 Getting sample records...');
    const sampleUrl = `${supabaseUrl}/rest/v1/nist_controls?select=control_id,title,framework&limit=5`;
    const sampleOptions = {
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    };

    const sampleResponse = await makeRequest(sampleUrl, sampleOptions);

    if (sampleResponse.status === 200 && sampleResponse.data.length > 0) {
      console.log(`✅ Sample records (${sampleResponse.data.length}):`);
      sampleResponse.data.forEach((control, i) => {
        console.log(`   ${i + 1}. [${control.framework}] ${control.control_id}: ${control.title.substring(0, 50)}...`);
      });
    } else {
      console.log('❌ No data found or access denied');
      console.log(`Status: ${sampleResponse.status}`);
      console.log('Response:', sampleResponse.data);
    }

    // Framework breakdown
    console.log('\n📊 Framework breakdown...');
    const frameworkUrl = `${supabaseUrl}/rest/v1/nist_controls?select=framework&limit=5000`;
    const frameworkOptions = {
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    };

    const frameworkResponse = await makeRequest(frameworkUrl, frameworkOptions);

    if (frameworkResponse.status === 200) {
      const frameworkStats = frameworkResponse.data.reduce((acc, row) => {
        acc[row.framework] = (acc[row.framework] || 0) + 1;
        return acc;
      }, {});

      console.log('✅ Framework distribution:');
      Object.entries(frameworkStats).forEach(([framework, count]) => {
        console.log(`   ${framework}: ${count} controls`);
      });
    }

    // Test search
    console.log('\n🔍 Testing search...');
    const searchUrl = `${supabaseUrl}/rest/v1/nist_controls?title=ilike.*access*&select=control_id,title,framework&limit=3`;
    const searchOptions = {
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    };

    const searchResponse = await makeRequest(searchUrl, searchOptions);

    if (searchResponse.status === 200 && searchResponse.data.length > 0) {
      console.log(`✅ Search test passed (${searchResponse.data.length} results):`);
      searchResponse.data.forEach((control, i) => {
        console.log(`   ${i + 1}. [${control.framework}] ${control.control_id}: ${control.title.substring(0, 50)}...`);
      });
    }

    console.log('\n🎉 VERIFICATION COMPLETE!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyUpload();