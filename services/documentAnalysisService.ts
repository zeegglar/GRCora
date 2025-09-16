import { supabase } from './supabaseClient';

export interface DocumentAnalysisRequest {
  files: File[];
  documentType: string;
  projectId: string;
  clientId: string;
  brandAssets?: BrandAssets;
}

export interface BrandAssets {
  logo?: File;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  documentTemplate: string;
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    page?: number;
    section?: string;
    confidence: number;
    extractedAt: string;
  };
  embedding?: number[];
}

export interface ExtractedEntity {
  type: 'risk' | 'control' | 'policy' | 'requirement' | 'finding';
  title: string;
  description: string;
  category: string;
  severity?: string;
  status?: string;
  metadata: Record<string, any>;
  confidence: number;
  sourceLocation: {
    document: string;
    page?: number;
    section?: string;
  };
}

export interface BrandProfile {
  clientId: string;
  logoUrl?: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  typography: {
    fontFamily: string;
    headingStyle: string;
    bodyStyle: string;
  };
  documentStructure: {
    headerFormat: string;
    sectionFormat: string;
    tableFormat: string;
    listFormat: string;
  };
  terminology: Record<string, string>;
  writingStyle: {
    tone: 'formal' | 'professional' | 'casual';
    perspective: 'first-person' | 'third-person';
    technicalLevel: 'basic' | 'intermediate' | 'advanced';
  };
}

export interface ProcessingResult {
  documentId: string;
  fileName: string;
  documentType: string;
  chunks: DocumentChunk[];
  extractedEntities: ExtractedEntity[];
  brandProfile?: Partial<BrandProfile>;
  processingStats: {
    totalPages: number;
    totalChunks: number;
    totalEntities: number;
    averageConfidence: number;
    processingTime: number;
  };
  suggestedActions: string[];
}

class DocumentAnalysisService {
  private readonly chunkSize = 1000; // characters per chunk
  private readonly chunkOverlap = 200; // overlap between chunks

  /**
   * Main document processing pipeline
   */
  async processDocuments(request: DocumentAnalysisRequest): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];

    for (const file of request.files) {
      const startTime = Date.now();

      // 1. Extract text content from file
      const textContent = await this.extractTextFromFile(file);

      // 2. Create chunks for RAG
      const chunks = this.createChunks(textContent, file.name);

      // 3. Generate embeddings for each chunk
      const chunksWithEmbeddings = await this.generateEmbeddings(chunks);

      // 4. Extract structured entities based on document type
      const extractedEntities = await this.extractEntities(
        textContent,
        request.documentType,
        file.name
      );

      // 5. Learn brand profile if this is existing documentation
      const brandProfile = request.documentType === 'existing_documentation'
        ? await this.learnBrandProfile(textContent, request.clientId)
        : undefined;

      // 6. Store in vector database
      await this.storeInVectorDB(chunksWithEmbeddings, request.projectId, file.name);

      const processingTime = Date.now() - startTime;

      const result: ProcessingResult = {
        documentId: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fileName: file.name,
        documentType: request.documentType,
        chunks: chunksWithEmbeddings,
        extractedEntities,
        brandProfile,
        processingStats: {
          totalPages: this.estimatePageCount(textContent),
          totalChunks: chunksWithEmbeddings.length,
          totalEntities: extractedEntities.length,
          averageConfidence: this.calculateAverageConfidence(extractedEntities),
          processingTime
        },
        suggestedActions: this.generateSuggestedActions(request.documentType, extractedEntities)
      };

      results.push(result);
    }

    return results;
  }

  /**
   * Extract text content from various file types
   */
  private async extractTextFromFile(file: File): Promise<string> {
    const fileType = file.type;

    if (fileType === 'application/pdf') {
      return this.extractFromPDF(file);
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return this.extractFromWord(file);
    } else if (fileType.includes('sheet') || fileType.includes('excel')) {
      return this.extractFromExcel(file);
    } else if (fileType === 'text/plain' || fileType === 'text/csv') {
      return this.extractFromText(file);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  private async extractFromPDF(file: File): Promise<string> {
    // Mock PDF extraction - in real implementation, use pdf-parse or similar
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Simulate PDF text extraction
        resolve(`[PDF Content from ${file.name}]\n\nThis is extracted text from the PDF document. In a real implementation, this would use libraries like pdf-parse to extract actual text content from PDF files.\n\nSample extracted content:\n- Risk Assessment Framework\n- Security Controls Implementation\n- Compliance Requirements\n- Audit Findings and Recommendations`);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  private async extractFromWord(file: File): Promise<string> {
    // Mock Word extraction - in real implementation, use mammoth.js or similar
    return `[Word Document Content from ${file.name}]\n\nExtracted text from Word document would appear here. Real implementation would use libraries like mammoth.js to extract text from .docx files.\n\nSample policy content:\n1. Information Security Policy\n2. Access Control Procedures\n3. Data Classification Standards\n4. Incident Response Plan`;
  }

  private async extractFromExcel(file: File): Promise<string> {
    // Mock Excel extraction - in real implementation, use xlsx library
    return `[Excel Spreadsheet Content from ${file.name}]\n\nExtracted data from Excel spreadsheet:\n\nRisk Register:\nRisk ID | Risk Title | Likelihood | Impact | Category\nR001 | Data Breach | High | High | Cybersecurity\nR002 | System Outage | Medium | High | Operational\nR003 | Compliance Violation | Low | Medium | Regulatory`;
  }

  private async extractFromText(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(file);
    });
  }

  /**
   * Create overlapping text chunks for RAG
   */
  private createChunks(text: string, fileName: string): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const words = text.split(/\s+/);

    for (let i = 0; i < words.length; i += this.chunkSize) {
      const chunkWords = words.slice(
        Math.max(0, i - this.chunkOverlap),
        i + this.chunkSize
      );

      const chunk: DocumentChunk = {
        id: `chunk_${chunks.length + 1}`,
        content: chunkWords.join(' '),
        metadata: {
          confidence: 0.95,
          extractedAt: new Date().toISOString()
        }
      };

      chunks.push(chunk);
    }

    return chunks;
  }

  /**
   * Generate embeddings for text chunks (mock implementation)
   */
  private async generateEmbeddings(chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
    // Mock embedding generation - in real implementation, call OpenAI, Cohere, or local model
    return chunks.map(chunk => ({
      ...chunk,
      embedding: Array.from({ length: 768 }, () => Math.random() - 0.5) // Mock 768-dim embedding
    }));
  }

  /**
   * Extract structured entities based on document type
   */
  private async extractEntities(
    text: string,
    documentType: string,
    fileName: string
  ): Promise<ExtractedEntity[]> {
    const entities: ExtractedEntity[] = [];

    switch (documentType) {
      case 'risk_register':
        entities.push(...this.extractRiskEntities(text, fileName));
        break;
      case 'security_policy':
        entities.push(...this.extractPolicyEntities(text, fileName));
        break;
      case 'audit_report':
        entities.push(...this.extractAuditEntities(text, fileName));
        break;
      case 'vendor_assessment':
        entities.push(...this.extractVendorEntities(text, fileName));
        break;
    }

    return entities;
  }

  private extractRiskEntities(text: string, fileName: string): ExtractedEntity[] {
    // Mock risk extraction - real implementation would use NLP models
    return [
      {
        type: 'risk',
        title: 'Unauthorized Data Access',
        description: 'Risk of unauthorized access to sensitive customer information',
        category: 'Cybersecurity',
        severity: 'High',
        status: 'Open',
        metadata: {
          likelihood: 'Medium',
          impact: 'High',
          owner: 'CISO',
          treatmentPlan: 'Implement MFA and access monitoring'
        },
        confidence: 0.89,
        sourceLocation: { document: fileName, page: 1, section: 'Risk Assessment' }
      },
      {
        type: 'risk',
        title: 'System Downtime',
        description: 'Potential for critical system outages affecting business operations',
        category: 'Operational',
        severity: 'Medium',
        status: 'Mitigated',
        metadata: {
          likelihood: 'Low',
          impact: 'High',
          owner: 'IT Manager',
          treatmentPlan: 'Backup systems and redundancy'
        },
        confidence: 0.92,
        sourceLocation: { document: fileName, page: 2, section: 'Operational Risks' }
      }
    ];
  }

  private extractPolicyEntities(text: string, fileName: string): ExtractedEntity[] {
    return [
      {
        type: 'policy',
        title: 'Access Control Policy',
        description: 'Defines procedures for user access management and authorization',
        category: 'Security',
        metadata: {
          frameworks: ['ISO 27001', 'SOC 2'],
          controls: ['A.9.1.1', 'A.9.2.1'],
          reviewFrequency: 'Annual'
        },
        confidence: 0.95,
        sourceLocation: { document: fileName, section: 'Security Policies' }
      }
    ];
  }

  private extractAuditEntities(text: string, fileName: string): ExtractedEntity[] {
    return [
      {
        type: 'finding',
        title: 'Inadequate Access Reviews',
        description: 'User access reviews are not performed regularly as required',
        category: 'Access Management',
        severity: 'Medium',
        metadata: {
          recommendation: 'Implement quarterly access reviews',
          framework: 'SOC 2',
          control: 'CC6.1'
        },
        confidence: 0.87,
        sourceLocation: { document: fileName, section: 'Audit Findings' }
      }
    ];
  }

  private extractVendorEntities(text: string, fileName: string): ExtractedEntity[] {
    return [
      {
        type: 'control',
        title: 'Vendor Security Assessment',
        description: 'Regular security assessments of third-party vendors',
        category: 'Third Party Management',
        status: 'Implemented',
        metadata: {
          frequency: 'Annual',
          criteria: ['SOC 2 Type II', 'ISO 27001', 'Security questionnaire']
        },
        confidence: 0.91,
        sourceLocation: { document: fileName, section: 'Vendor Management' }
      }
    ];
  }

  /**
   * Learn brand profile from existing documentation
   */
  private async learnBrandProfile(text: string, clientId: string): Promise<Partial<BrandProfile>> {
    // Mock brand learning - real implementation would use ML models
    return {
      colorScheme: {
        primary: '#2563eb',
        secondary: '#1e40af'
      },
      typography: {
        fontFamily: 'Arial',
        headingStyle: 'Bold, 14pt',
        bodyStyle: 'Regular, 11pt'
      },
      writingStyle: {
        tone: 'professional',
        perspective: 'third-person',
        technicalLevel: 'intermediate'
      },
      terminology: {
        'data breach': 'security incident',
        'users': 'personnel',
        'systems': 'information systems'
      }
    };
  }

  /**
   * Store chunks in vector database for RAG queries
   */
  private async storeInVectorDB(
    chunks: DocumentChunk[],
    projectId: string,
    fileName: string
  ): Promise<void> {
    // Mock vector storage - real implementation would use Pinecone, Weaviate, or PostgreSQL with pgvector
    console.log(`Storing ${chunks.length} chunks for ${fileName} in project ${projectId}`);

    // In real implementation:
    // - Store embeddings in vector database
    // - Associate with project and client IDs
    // - Enable semantic search and retrieval
  }

  /**
   * Query stored documents using RAG
   */
  async queryDocuments(
    query: string,
    projectId: string,
    limit: number = 5
  ): Promise<DocumentChunk[]> {
    // Mock RAG query - real implementation would:
    // 1. Generate embedding for query
    // 2. Perform vector similarity search
    // 3. Return most relevant chunks

    return [
      {
        id: 'chunk_1',
        content: 'Sample relevant content that matches the query...',
        metadata: {
          confidence: 0.92,
          extractedAt: new Date().toISOString()
        }
      }
    ];
  }

  /**
   * Generate branded documents using extracted data and brand profile
   */
  async generateBrandedDocument(
    template: string,
    data: any,
    brandProfile: BrandProfile,
    format: 'pdf' | 'word' | 'html' = 'pdf'
  ): Promise<Blob> {
    // Mock document generation - real implementation would:
    // 1. Load template
    // 2. Apply brand styling (colors, fonts, logo)
    // 3. Populate with extracted data
    // 4. Generate final document

    const mockContent = `
      <html>
        <head>
          <style>
            body { font-family: ${brandProfile.typography.fontFamily}; }
            h1 { color: ${brandProfile.colorScheme.primary}; }
            .header { background-color: ${brandProfile.colorScheme.primary}; color: white; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Branded Document</h1>
          </div>
          <div>
            <p>Generated document content with client branding applied...</p>
            <pre>${JSON.stringify(data, null, 2)}</pre>
          </div>
        </body>
      </html>
    `;

    return new Blob([mockContent], { type: 'text/html' });
  }

  // Helper methods
  private estimatePageCount(text: string): number {
    return Math.ceil(text.length / 2500); // ~2500 chars per page
  }

  private calculateAverageConfidence(entities: ExtractedEntity[]): number {
    if (entities.length === 0) return 0;
    return entities.reduce((sum, entity) => sum + entity.confidence, 0) / entities.length;
  }

  private generateSuggestedActions(
    documentType: string,
    entities: ExtractedEntity[]
  ): string[] {
    const actions: Record<string, string[]> = {
      risk_register: [
        `Import ${entities.length} risks into risk management system`,
        'Schedule review meetings for high-priority risks',
        'Generate client-branded risk dashboard',
        'Create risk treatment plans for open risks'
      ],
      security_policy: [
        `Map ${entities.length} policies to compliance frameworks`,
        'Identify policy gaps against selected standards',
        'Generate policy implementation timeline',
        'Create branded policy documentation'
      ],
      audit_report: [
        `Create remediation plans for ${entities.filter(e => e.type === 'finding').length} findings`,
        'Generate management presentation with findings',
        'Schedule follow-up assessments',
        'Track compliance improvements'
      ],
      existing_documentation: [
        'Learn and apply client brand profile to future documents',
        'Extract terminology for consistent language use',
        'Adapt document templates to match client style',
        'Create branded report templates'
      ]
    };

    return actions[documentType] || ['Process document content into system'];
  }
}

export const documentAnalysisService = new DocumentAnalysisService();