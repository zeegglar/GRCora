# Supabase Controls Seeder

This script reads JSONL files containing NIST framework controls and efficiently inserts them into your Supabase `controls` table using batch upserts.

## Features

- ✅ **Batch Processing**: Inserts controls in configurable batches (default: 100) to respect API rate limits
- ✅ **Upsert Support**: Uses `upsert` operations to prevent duplicates when running multiple times
- ✅ **Error Handling**: Graceful handling of JSON parsing errors and database insertion failures
- ✅ **Progress Tracking**: Detailed console logging showing progress, batch status, and final summary
- ✅ **Flexible Configuration**: Easy to modify file paths, framework names, and field mappings
- ✅ **Schema Validation**: Validates database connection and table schema before processing

## Prerequisites

1. **Node.js** (v16 or higher with ES modules support)
2. **Supabase Project** with a `controls` table
3. **Environment Variables** configured in `.env` file
4. **JSONL Data Files** with control information

## Database Schema

Your Supabase `controls` table should have the following columns:

```sql
CREATE TABLE controls (
  id text PRIMARY KEY,
  name text,
  description text,
  family text,
  framework text
);
```

## Setup Instructions

### 1. Environment Configuration

Ensure your `.env` file in the project root contains:

```env
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key-here"
```

### 2. Prepare Your Data Files

Place your JSONL files in the `data/` directory. Each line should be a valid JSON object:

```jsonl
{"control_identifier": "AC-1", "control_name": "Access Control Policy and Procedures", "control_text": "The organization develops...", "control_family": "Access Control"}
{"control_identifier": "AC-2", "control_name": "Account Management", "control_text": "The information system manages...", "control_family": "Access Control"}
```

### 3. Configure the Script

Edit the configuration section in `scripts/seed-controls.js`:

```javascript
// =============================================================================
// CONFIGURATION - Modify these variables as needed
// =============================================================================

const JSONL_FILE_PATH = path.join(__dirname, '..', 'data', 'nist-800-53.jsonl');
const FRAMEWORK_NAME = 'NIST 800-53';
const BATCH_SIZE = 100;

// =============================================================================
// DATA MAPPING CONFIGURATION
// =============================================================================

const FIELD_MAPPING = {
  id: 'control_identifier',           // JSON field -> Supabase column
  name: 'control_name',               // JSON field -> Supabase column
  description: 'control_text',        // JSON field -> Supabase column
  family: 'control_family'            // JSON field -> Supabase column
  // framework will be set from FRAMEWORK_NAME constant
};
```

## Usage

### Method 1: Using npm script (Recommended)

```bash
npm run seed:controls
```

### Method 2: Direct Node.js execution

```bash
node scripts/seed-controls.js
```

## Example Output

```
🚀 Starting Supabase Controls Seeder
==================================================
📁 File: /path/to/data/nist-800-53.jsonl
🏷️  Framework: NIST 800-53
==================================================
🔗 Connecting to Supabase...
   URL: https://your-project-ref.supabase.co
   Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
🔍 Validating database connection and schema...
✅ Database connection and schema validated successfully
📊 Current controls in database for framework 'NIST 800-53': 0
📂 Reading file: /path/to/data/nist-800-53.jsonl
📋 Found 5 lines in file
✅ Successfully parsed 5 controls
🔄 Mapping controls to database schema...
✅ Mapped 5 controls
🚀 Starting batch insert of 5 controls...
📦 Using batch size: 100
📦 Processing batch 1/1 (5 controls)...
✅ Batch 1 completed successfully (5 records)

📊 INSERTION SUMMARY:
   ✅ Successfully processed: 5 controls
   ❌ Failed to process: 0 controls
   📋 Total attempted: 5 controls

🎉 Controls seeding completed successfully!
==================================================
```

## Configuration Options

### File Path Configuration

Change the input file by modifying:

```javascript
const JSONL_FILE_PATH = path.join(__dirname, '..', 'data', 'your-file.jsonl');
```

### Framework Name

Set the framework name that will be stored in the database:

```javascript
const FRAMEWORK_NAME = 'Your Framework Name';
```

### Field Mapping

Customize how JSON fields map to database columns:

```javascript
const FIELD_MAPPING = {
  id: 'your_id_field',
  name: 'your_name_field',
  description: 'your_description_field',
  family: 'your_family_field'
};
```

### Batch Size

Adjust the batch size for processing:

```javascript
const BATCH_SIZE = 50; // Smaller batches for slower connections
```

## Error Handling

The script handles various error scenarios:

- **Missing environment variables**: Clear error message with setup instructions
- **File not found**: Descriptive error showing expected file path
- **JSON parsing errors**: Continues processing valid lines, reports invalid ones
- **Database connection issues**: Validates connection before processing
- **Insertion failures**: Reports failed batches while continuing with successful ones

## Troubleshooting

### Common Issues

1. **"Missing Supabase credentials"**
   - Ensure `.env` file exists in project root
   - Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

2. **"File not found"**
   - Check the `JSONL_FILE_PATH` configuration
   - Ensure the data file exists in the specified location

3. **"Database validation failed"**
   - Verify the `controls` table exists in your Supabase database
   - Check that your API key has the necessary permissions

4. **JSON parsing errors**
   - Ensure each line in your JSONL file is valid JSON
   - Check that field names match your mapping configuration

### Performance Tuning

- **Slow insertions**: Reduce `BATCH_SIZE` to 25-50
- **Rate limiting**: The script includes automatic delays between batches
- **Large files**: The script processes files line-by-line to handle large datasets efficiently

## File Structure

```
project-root/
├── scripts/
│   ├── seed-controls.js     # Main seeding script
│   └── README.md           # This documentation
├── data/
│   ├── nist-800-53.jsonl   # Sample NIST controls
│   └── [your-files].jsonl  # Your control files
├── .env                    # Environment variables
└── package.json           # npm scripts configuration
```

## Security Notes

- The script uses environment variables to securely store Supabase credentials
- Never commit your `.env` file to version control
- The script only requires database INSERT/UPSERT permissions
- All operations are performed through Supabase's secure API

## Contributing

To modify the script for different data formats:

1. Update the `FIELD_MAPPING` object to match your JSON structure
2. Modify the `FRAMEWORK_NAME` for your specific framework
3. Adjust the `JSONL_FILE_PATH` to point to your data file
4. Test with a small sample file first