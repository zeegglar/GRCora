import { nistKnowledgeService } from '../services/nistKnowledgeService';

/**
 * Utility to initialize NIST knowledge base from JSON/JSONL files
 *
 * Usage:
 * 1. Place your NIST files in the public/data directory:
 *    - nist-csf.json (NIST Cybersecurity Framework)
 *    - nist-800-53.json (NIST SP 800-53 Security Controls)
 *    - nist-ai-rmf.json (NIST AI Risk Management Framework)
 *
 * 2. Call initializeNistData() to populate the knowledge base
 */

export interface NISTFileStructure {
  // NIST CSF expected structure
  csf?: Array<{
    Function: string;
    Category: string;
    Subcategory: string;
    Description: string;
    'Implementation Guidance'?: string;
    Guidance?: string;
    'Informative References'?: string[];
    [key: string]: any;
  }>;

  // NIST SP 800-53 expected structure
  sp80053?: Array<{
    Control?: string;
    ID?: string;
    Title?: string;
    'Control Title'?: string;
    Description?: string;
    'Control Description'?: string;
    Guidance?: string;
    'Implementation Guidance'?: string;
    Family?: string;
    'Assessment Methods'?: string[];
    'Related Controls'?: string[];
    Parameters?: string[];
    [key: string]: any;
  }>;

  // NIST AI RMF expected structure
  aiRmf?: Array<{
    Function: string;
    Category: string;
    Title?: string;
    Description?: string;
    Outcome?: string;
    Guidance?: string;
    'Implementation Notes'?: string;
    References?: string[];
    [key: string]: any;
  }>;
}

/**
 * Load NIST data files from public directory
 */
async function loadNistDataFiles(): Promise<NISTFileStructure> {
  const files = {
    csf: null as any,
    sp80053: null as any,
    aiRmf: null as any
  };

  try {
    // Load NIST CSF data
    const csfResponse = await fetch('/data/nist-csf.json');
    if (csfResponse.ok) {
      files.csf = await csfResponse.json();
      console.log('✅ Loaded NIST CSF data:', Array.isArray(files.csf) ? files.csf.length : 'Object');
    } else {
      console.warn('⚠️ NIST CSF file not found at /data/nist-csf.json');
    }
  } catch (error) {
    console.warn('⚠️ Failed to load NIST CSF data:', error);
  }

  try {
    // Load NIST SP 800-53 data
    const sp80053Response = await fetch('/data/nist-800-53.json');
    if (sp80053Response.ok) {
      files.sp80053 = await sp80053Response.json();
      console.log('✅ Loaded NIST SP 800-53 data:', Array.isArray(files.sp80053) ? files.sp80053.length : 'Object');
    } else {
      console.warn('⚠️ NIST SP 800-53 file not found at /data/nist-800-53.json');
    }
  } catch (error) {
    console.warn('⚠️ Failed to load NIST SP 800-53 data:', error);
  }

  try {
    // Load NIST AI RMF data
    const aiRmfResponse = await fetch('/data/nist-ai-rmf.json');
    if (aiRmfResponse.ok) {
      files.aiRmf = await aiRmfResponse.json();
      console.log('✅ Loaded NIST AI RMF data:', Array.isArray(files.aiRmf) ? files.aiRmf.length : 'Object');
    } else {
      console.warn('⚠️ NIST AI RMF file not found at /data/nist-ai-rmf.json');
    }
  } catch (error) {
    console.warn('⚠️ Failed to load NIST AI RMF data:', error);
  }

  return files;
}

/**
 * Load JSONL files (one JSON object per line)
 */
async function loadJsonlFile(url: string): Promise<any[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim());

    return lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (parseError) {
        console.warn('Failed to parse JSONL line:', line.substring(0, 100) + '...');
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    console.warn(`Failed to load JSONL file from ${url}:`, error);
    return [];
  }
}

/**
 * Alternative loader for JSONL files
 */
async function loadNistJsonlFiles(): Promise<NISTFileStructure> {
  const [csfData, sp80053Data, aiRmfData] = await Promise.all([
    loadJsonlFile('/data/nist-csf.jsonl'),
    loadJsonlFile('/data/nist-800-53.jsonl'),
    loadJsonlFile('/data/nist-ai-rmf.jsonl')
  ]);

  return {
    csf: csfData.length > 0 ? csfData : null,
    sp80053: sp80053Data.length > 0 ? sp80053Data : null,
    aiRmf: aiRmfData.length > 0 ? aiRmfData : null
  };
}

/**
 * Normalize data structure - handle both arrays and objects
 */
function normalizeDataArray(data: any): any[] {
  if (Array.isArray(data)) {
    return data;
  } else if (data && typeof data === 'object') {
    // If it's an object, try common property names for arrays
    const possibleArrays = [
      data.controls,
      data.categories,
      data.subcategories,
      data.functions,
      data.data,
      data.items,
      Object.values(data)
    ].find(val => Array.isArray(val));

    return possibleArrays || [data];
  }
  return [];
}

/**
 * Main initialization function
 */
export async function initializeNistData(): Promise<boolean> {
  console.log('🚀 Initializing NIST knowledge base...');

  try {
    // Try to load JSON files first, then fall back to JSONL
    let nistData = await loadNistDataFiles();

    // If JSON files didn't work, try JSONL files
    if (!nistData.csf && !nistData.sp80053 && !nistData.aiRmf) {
      console.log('📄 JSON files not found, trying JSONL format...');
      nistData = await loadNistJsonlFiles();
    }

    // Normalize data structures
    const csfArray = nistData.csf ? normalizeDataArray(nistData.csf) : [];
    const sp80053Array = nistData.sp80053 ? normalizeDataArray(nistData.sp80053) : [];
    const aiRmfArray = nistData.aiRmf ? normalizeDataArray(nistData.aiRmf) : [];

    console.log(`📊 Data Summary:
    • NIST CSF: ${csfArray.length} items
    • NIST SP 800-53: ${sp80053Array.length} items
    • NIST AI RMF: ${aiRmfArray.length} items`);

    if (csfArray.length === 0 && sp80053Array.length === 0 && aiRmfArray.length === 0) {
      console.warn('⚠️ No NIST data found. Please ensure files are placed in public/data/');
      return false;
    }

    // Initialize the knowledge base
    await nistKnowledgeService.initializeKnowledgeBase(
      csfArray,
      sp80053Array,
      aiRmfArray
    );

    console.log('✅ NIST knowledge base initialized successfully!');
    console.log('💡 You can now use the AI Assistant to query NIST controls and get compliance guidance.');

    return true;
  } catch (error) {
    console.error('❌ Failed to initialize NIST knowledge base:', error);
    return false;
  }
}

/**
 * Test the knowledge base with sample queries
 */
export async function testNistKnowledgeBase(): Promise<void> {
  console.log('🧪 Testing NIST knowledge base...');

  const testQueries = [
    'access control requirements',
    'incident response planning',
    'data encryption standards',
    'AI governance principles',
    'vulnerability management'
  ];

  for (const query of testQueries) {
    try {
      const result = await nistKnowledgeService.queryControls(query, ['NIST_CSF', 'NIST_800_53'], 3);
      console.log(`\n🔍 Query: "${query}"`);
      console.log(`📋 Found ${result.controls.length} relevant controls`);

      if (result.controls.length > 0) {
        console.log(`🎯 Top result: ${result.controls[0].title} (${result.controls[0].framework})`);
      }
    } catch (error) {
      console.error(`❌ Test query failed for "${query}":`, error);
    }
  }
}

/**
 * Check if knowledge base is already initialized
 */
export async function isKnowledgeBaseInitialized(): Promise<boolean> {
  try {
    const testResult = await nistKnowledgeService.queryControls('test', ['NIST_CSF'], 1);
    return testResult.controls.length > 0;
  } catch {
    return false;
  }
}

// Auto-initialize when the module is imported (optional)
export async function autoInitialize(): Promise<void> {
  if (typeof window !== 'undefined') {
    // Only run in browser environment
    const isInitialized = await isKnowledgeBaseInitialized();

    if (!isInitialized) {
      console.log('🔧 Auto-initializing NIST knowledge base...');
      const success = await initializeNistData();

      if (success) {
        // Optionally run test queries
        await testNistKnowledgeBase();
      }
    } else {
      console.log('✅ NIST knowledge base already initialized');
    }
  }
}

// Export utility functions for manual control
export const nistUtils = {
  initialize: initializeNistData,
  test: testNistKnowledgeBase,
  isInitialized: isKnowledgeBaseInitialized,
  loadFiles: loadNistDataFiles,
  loadJsonl: loadNistJsonlFiles
};