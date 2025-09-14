# 🚀 Supabase Controls Seeding Guide

## Quick Start

Your Node.js script for seeding Supabase with NIST framework controls is ready to use! Here's everything you need to know:

## 📁 Files Created

```
📦 Your Project
├── scripts/
│   ├── seed-controls.js      # 🎯 Main seeding script
│   ├── test-parsing.js       # 🧪 Test script (no DB required)
│   └── README.md            # 📚 Detailed documentation
├── data/
│   └── nist-800-53.jsonl    # 📋 Sample NIST controls data
├── package.json             # ➕ Added npm scripts
└── SEEDING_GUIDE.md         # 📖 This guide
```

## 🛠️ Setup Instructions

### 1. **Update Your .env File**
Replace the placeholder values in your `.env` file with real Supabase credentials:

```bash
# Replace these placeholder values with your actual Supabase credentials
VITE_SUPABASE_URL="https://your-actual-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-actual-anon-key-here"
```

### 2. **Prepare Your JSONL Files**
Place your `.jsonl` files in the `data/` directory. Each line should be a JSON object like:

```json
{"control_identifier": "AC-1", "control_name": "Access Control Policy", "control_text": "Description...", "control_family": "Access Control"}
```

### 3. **Configure the Script** (Optional)
Edit `scripts/seed-controls.js` to customize:

- **File path**: Change `JSONL_FILE_PATH`
- **Framework name**: Change `FRAMEWORK_NAME`
- **Field mapping**: Update `FIELD_MAPPING` object
- **Batch size**: Adjust `BATCH_SIZE`

## 🎯 Usage Commands

### Test Parsing (No Database Required)
```bash
npm run test:parsing
```
This tests your JSONL file parsing without connecting to Supabase.

### Seed Database
```bash
npm run seed:controls
```
This runs the full seeding process with your Supabase database.

### Alternative (Direct Node.js)
```bash
node scripts/seed-controls.js
node scripts/test-parsing.js
```

## 📊 Expected Output

### Successful Run Example:
```
🚀 Starting Supabase Controls Seeder
==================================================
📁 File: /path/to/data/nist-800-53.jsonl
🏷️  Framework: NIST 800-53
==================================================
🔗 Connecting to Supabase...
✅ Database connection and schema validated successfully
📊 Current controls in database for framework 'NIST 800-53': 0
📂 Reading file: /path/to/data/nist-800-53.jsonl
✅ Successfully parsed 5 controls
🚀 Starting batch insert of 5 controls...
📦 Processing batch 1/1 (5 controls)...
✅ Batch 1 completed successfully (5 records)

📊 INSERTION SUMMARY:
   ✅ Successfully processed: 5 controls
   ❌ Failed to process: 0 controls
   📋 Total attempted: 5 controls

🎉 Controls seeding completed successfully!
```

## 🔧 Configuration Options

### Default Configuration
```javascript
// File location
const JSONL_FILE_PATH = path.join(__dirname, '..', 'data', 'nist-800-53.jsonl');

// Framework name (goes into 'framework' column)
const FRAMEWORK_NAME = 'NIST 800-53';

// Batch processing size
const BATCH_SIZE = 100;

// Field mapping from JSON to Supabase columns
const FIELD_MAPPING = {
  id: 'control_identifier',           // JSON → Supabase
  name: 'control_name',
  description: 'control_text',
  family: 'control_family'
};
```

### For Different Frameworks
To seed a different framework (e.g., ISO 27001):

1. Create a new JSONL file: `data/iso-27001.jsonl`
2. Update the configuration:
   ```javascript
   const JSONL_FILE_PATH = path.join(__dirname, '..', 'data', 'iso-27001.jsonl');
   const FRAMEWORK_NAME = 'ISO 27001:2022';
   ```
3. Adjust field mapping if your JSON structure is different

## 🛡️ Safety Features

- ✅ **Upsert Operations**: Won't create duplicates if run multiple times
- ✅ **Batch Processing**: Respects API rate limits
- ✅ **Error Handling**: Continues processing even if some records fail
- ✅ **Validation**: Checks database connection before starting
- ✅ **Progress Tracking**: Shows detailed progress and summary

## 🚨 Troubleshooting

### Common Issues:

1. **"Missing Supabase credentials"**
   ```
   Solution: Update your .env file with real Supabase credentials
   ```

2. **"File not found"**
   ```
   Solution: Ensure your JSONL file exists in the data/ directory
   ```

3. **"Database validation failed"**
   ```
   Solution: Verify your controls table exists in Supabase and API key has correct permissions
   ```

4. **JSON parsing errors**
   ```
   Solution: Check that each line in your JSONL file is valid JSON
   ```

## 📋 Database Schema

Your Supabase `controls` table should have:

```sql
CREATE TABLE controls (
  id text PRIMARY KEY,
  name text,
  description text,
  family text,
  framework text
);
```

## 🎉 You're Ready!

Your seeding script is production-ready with:
- ✅ Comprehensive error handling
- ✅ Batch processing for efficiency
- ✅ Upsert operations for safety
- ✅ Detailed logging and progress tracking
- ✅ Flexible configuration
- ✅ Testing capabilities

## 💡 Next Steps

1. **Test first**: Run `npm run test:parsing` to verify your data
2. **Update credentials**: Add real Supabase credentials to `.env`
3. **Seed your database**: Run `npm run seed:controls`
4. **Verify results**: Check your Supabase database for the imported controls

Happy seeding! 🌱