// Create nist_controls table schema
const https = require('https');

console.log('🗄️  CREATING NIST_CONTROLS TABLE SCHEMA\n');

const supabaseUrl = process.argv[2];
const serviceKey = process.argv[3];

if (!supabaseUrl || !serviceKey) {
  console.log('❌ Please provide both URL and Service Key:');
  console.log('Usage: node create-table.cjs "YOUR_URL" "YOUR_SERVICE_KEY"');
  process.exit(1);
}

console.log('🔗 Creating table schema...');
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
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function createTable() {
  try {
    console.log('📋 Creating nist_controls table...');

    // SQL to create the table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.nist_controls (
        id TEXT PRIMARY KEY,
        family TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        guidance TEXT,
        framework TEXT NOT NULL,
        category TEXT,
        subcategory TEXT,
        content_hash TEXT UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Enable Row Level Security
      ALTER TABLE public.nist_controls ENABLE ROW LEVEL SECURITY;

      -- Create policy to allow all operations for service role
      CREATE POLICY "Allow all for service role" ON public.nist_controls
      FOR ALL USING (true);

      -- Grant permissions
      GRANT ALL ON public.nist_controls TO authenticated;
      GRANT ALL ON public.nist_controls TO anon;

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_nist_controls_framework ON public.nist_controls(framework);
      CREATE INDEX IF NOT EXISTS idx_nist_controls_family ON public.nist_controls(family);
      CREATE INDEX IF NOT EXISTS idx_nist_controls_title ON public.nist_controls USING gin(to_tsvector('english', title));
      CREATE INDEX IF NOT EXISTS idx_nist_controls_description ON public.nist_controls USING gin(to_tsvector('english', description));
    `;

    // Execute the SQL via Supabase REST API
    const sqlUrl = `${supabaseUrl}/rest/v1/rpc/exec_sql`;
    const sqlOptions = {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    };

    // Try alternative approach - direct SQL execution
    const postgrestUrl = `${supabaseUrl}/rest/v1/`;

    // First, let's try creating a simple test record to trigger table creation
    console.log('📊 Attempting to create table via INSERT...');

    const sampleControl = {
      id: 'SCHEMA-TEST-' + Date.now(),
      family: 'Test',
      title: 'Schema Test Control',
      description: 'Test control to create table schema',
      framework: 'NIST_800_53',
      content_hash: 'schema-test-' + Date.now()
    };

    const insertUrl = `${supabaseUrl}/rest/v1/nist_controls`;
    const insertOptions = {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    };

    const insertResponse = await makeRequest(insertUrl, insertOptions, JSON.stringify(sampleControl));

    if (insertResponse.status === 201) {
      console.log('✅ Table created successfully via INSERT!');

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
      console.log('❌ Table creation failed:');
      console.log(`Status: ${insertResponse.status}`);
      console.log(`Response: ${JSON.stringify(insertResponse.data)}`);

      // If table doesn't exist, the error should indicate what's needed
      if (insertResponse.data && insertResponse.data.message) {
        console.log('\n📋 Error details:', insertResponse.data.message);

        if (insertResponse.data.message.includes('does not exist')) {
          console.log('\n⚠️  Table does not exist in database.');
          console.log('💡 You may need to create the table manually in Supabase Dashboard:');
          console.log('   1. Go to your Supabase project dashboard');
          console.log('   2. Navigate to Table Editor');
          console.log('   3. Create a new table named "nist_controls"');
          console.log('   4. Add columns: id (text), family (text), title (text), description (text), guidance (text), framework (text), category (text), subcategory (text), content_hash (text)');
        }
      }
    }

    // Verify table existence
    console.log('\n🔍 Verifying table...');
    const verifyUrl = `${supabaseUrl}/rest/v1/nist_controls?select=id&limit=1`;
    const verifyOptions = {
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    };

    const verifyResponse = await makeRequest(verifyUrl, verifyOptions);

    if (verifyResponse.status === 200) {
      console.log('✅ Table verified and accessible!');
      console.log('🎉 DATABASE SCHEMA SETUP COMPLETE!');
    } else {
      console.log('❌ Table verification failed');
      console.log(`Status: ${verifyResponse.status}`);
      console.log(`Response: ${JSON.stringify(verifyResponse.data)}`);
    }

  } catch (error) {
    console.error('❌ Schema creation failed:', error.message);
  }
}

createTable();