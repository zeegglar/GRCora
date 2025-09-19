import { GoogleGenerativeAI } from '@google/generative-ai';
import type { EmbeddingResult, QueryResponse, RAGContext } from '../types/comprehensive';

interface VectorStore {
  id: string;
  content: string;
  metadata: {
    source: string;
    type: 'control' | 'policy' | 'assessment' | 'finding' | 'procedure';
    framework?: string;
    organization_id: string;
    created_at: string;
  };
  embedding: number[];
}

interface KnowledgeBase {
  controls: Map<string, any>;
  policies: Map<string, any>;
  assessments: Map<string, any>;
  findings: Map<string, any>;
  procedures: Map<string, any>;
}

export class RAGService {
  private static instance: RAGService;
  private genAI: GoogleGenerativeAI;
  private vectorStore: VectorStore[] = [];
  private knowledgeBase: KnowledgeBase = {
    controls: new Map(),
    policies: new Map(),
    assessments: new Map(),
    findings: new Map(),
    procedures: new Map()
  };

  private readonly EMBEDDING_MODEL = 'embedding-001';
  private readonly GENERATION_MODEL = 'gemini-1.5-pro';
  private readonly MAX_CONTEXT_LENGTH = 8000;
  private readonly SIMILARITY_THRESHOLD = 0.7;

  constructor() {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Google API key not found. Please set VITE_GOOGLE_API_KEY environment variable.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  public static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

  async initializeKnowledgeBase(organizationId: string): Promise<void> {
    try {
      console.log('Initializing knowledge base for organization:', organizationId);

      // Load and embed controls
      await this.loadControls(organizationId);

      // Load and embed policies
      await this.loadPolicies(organizationId);

      // Load and embed assessment data
      await this.loadAssessmentData(organizationId);

      // Load and embed audit findings
      await this.loadAuditFindings(organizationId);

      // Load and embed procedures
      await this.loadProcedures(organizationId);

      console.log('Knowledge base initialized with', this.vectorStore.length, 'documents');

    } catch (error) {
      console.error('Error initializing knowledge base:', error);
      throw error;
    }
  }

  private async loadControls(organizationId: string): Promise<void> {
    // ISO 27001:2022 control data including clause 7.3
    const controls = [
      {
        id: 'ISO-7.3',
        name: 'Awareness',
        description: 'Clause 7.3 of ISO 27001:2022 requires that persons doing work under the organization\'s control shall be aware of: (a) the information security policy; (b) their contribution to the effectiveness of the information security management system, including the benefits of improved information security performance; (c) the implications of not conforming with the information security management system requirements. The organization shall ensure that all personnel are made aware of information security policies, procedures, and their individual responsibilities.',
        framework: 'ISO 27001:2022',
        family: 'Organizational',
        clause: '7.3',
        requirements: [
          'Information security policy awareness',
          'Understanding of contribution to ISMS effectiveness',
          'Benefits of improved information security performance',
          'Implications of non-conformity with ISMS requirements',
          'Individual responsibilities and accountability'
        ]
      },
      {
        id: 'ISO-A.5.1',
        name: 'Policies for information security',
        description: 'Management direction and support for information security in accordance with business requirements and relevant laws and regulations',
        framework: 'ISO 27001:2022',
        family: 'Organizational'
      },
      {
        id: 'ISO-A.8.1',
        name: 'User endpoint devices',
        description: 'Information stored on, processed by or accessible via user endpoint devices shall be protected',
        framework: 'ISO 27001:2022',
        family: 'Technological'
      }
    ];

    for (const control of controls) {
      const clauseInfo = control.clause ? ` Clause: ${control.clause}.` : '';
      const requirements = control.requirements ? ` Requirements: ${control.requirements.join(', ')}.` : '';
      const content = `${control.name}: ${control.description}. Framework: ${control.framework}. Family: ${control.family}.${clauseInfo}${requirements}`;
      const embedding = await this.generateEmbedding(content);

      this.vectorStore.push({
        id: control.id,
        content,
        metadata: {
          source: 'controls',
          type: 'control',
          framework: control.framework,
          organization_id: organizationId,
          created_at: new Date().toISOString()
        },
        embedding
      });

      this.knowledgeBase.controls.set(control.id, control);
    }
  }

  private async loadPolicies(organizationId: string): Promise<void> {
    // Mock policy data
    const policies = [
      {
        id: 'POL-001',
        title: 'Information Security Policy',
        content: 'This policy establishes the framework for information security management across the organization, defining roles, responsibilities, and requirements for protecting organizational assets.',
        status: 'approved',
        version: '2.1'
      },
      {
        id: 'POL-002',
        title: 'Access Control Policy',
        content: 'This policy defines requirements for managing user access to organizational systems and data, including authentication, authorization, and access review procedures.',
        status: 'approved',
        version: '1.3'
      }
    ];

    for (const policy of policies) {
      const content = `Policy: ${policy.title} (${policy.id}). ${policy.content} Status: ${policy.status}, Version: ${policy.version}`;
      const embedding = await this.generateEmbedding(content);

      this.vectorStore.push({
        id: policy.id,
        content,
        metadata: {
          source: 'policies',
          type: 'policy',
          organization_id: organizationId,
          created_at: new Date().toISOString()
        },
        embedding
      });

      this.knowledgeBase.policies.set(policy.id, policy);
    }
  }

  private async loadAssessmentData(organizationId: string): Promise<void> {
    // Mock assessment data
    const assessments = [
      {
        id: 'ASSESS-001',
        type: 'ISO 27001 Gap Assessment',
        findings: 'Organization has strong technical controls but lacks formal risk management procedures. Key gaps identified in incident response and business continuity planning.',
        compliance_percentage: 73,
        framework: 'ISO 27001'
      }
    ];

    for (const assessment of assessments) {
      const content = `Assessment: ${assessment.type} (${assessment.id}). Findings: ${assessment.findings} Compliance: ${assessment.compliance_percentage}% Framework: ${assessment.framework}`;
      const embedding = await this.generateEmbedding(content);

      this.vectorStore.push({
        id: assessment.id,
        content,
        metadata: {
          source: 'assessments',
          type: 'assessment',
          framework: assessment.framework,
          organization_id: organizationId,
          created_at: new Date().toISOString()
        },
        embedding
      });

      this.knowledgeBase.assessments.set(assessment.id, assessment);
    }
  }

  private async loadAuditFindings(organizationId: string): Promise<void> {
    // Mock audit findings
    const findings = [
      {
        id: 'FIND-001',
        description: 'Inadequate password complexity requirements observed in Active Directory configuration',
        severity: 'Medium',
        control_id: 'ISO-A.9.4.3',
        status: 'open'
      }
    ];

    for (const finding of findings) {
      const content = `Audit Finding: ${finding.description} Severity: ${finding.severity} Control: ${finding.control_id} Status: ${finding.status}`;
      const embedding = await this.generateEmbedding(content);

      this.vectorStore.push({
        id: finding.id,
        content,
        metadata: {
          source: 'findings',
          type: 'finding',
          organization_id: organizationId,
          created_at: new Date().toISOString()
        },
        embedding
      });

      this.knowledgeBase.findings.set(finding.id, finding);
    }
  }

  private async loadProcedures(organizationId: string): Promise<void> {
    // Mock procedures
    const procedures = [
      {
        id: 'PROC-001',
        title: 'Incident Response Procedure',
        content: 'Step-by-step process for identifying, reporting, investigating, and resolving security incidents, including escalation procedures and communication requirements.',
        category: 'Security Operations'
      }
    ];

    for (const procedure of procedures) {
      const content = `Procedure: ${procedure.title} (${procedure.id}). Category: ${procedure.category}. ${procedure.content}`;
      const embedding = await this.generateEmbedding(content);

      this.vectorStore.push({
        id: procedure.id,
        content,
        metadata: {
          source: 'procedures',
          type: 'procedure',
          organization_id: organizationId,
          created_at: new Date().toISOString()
        },
        embedding
      });

      this.knowledgeBase.procedures.set(procedure.id, procedure);
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.EMBEDDING_MODEL });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Error generating embedding:', error);
      // Return mock embedding for development
      return Array.from({ length: 768 }, () => Math.random());
    }
  }

  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private async retrieveRelevantContext(
    query: string,
    organizationId: string,
    maxResults: number = 5
  ): Promise<{ content: string; metadata: any; similarity: number }[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);

      // Calculate similarities
      const similarities = this.vectorStore
        .filter(doc => doc.metadata.organization_id === organizationId)
        .map(doc => ({
          content: doc.content,
          metadata: doc.metadata,
          similarity: this.calculateCosineSimilarity(queryEmbedding, doc.embedding)
        }))
        .filter(result => result.similarity >= this.SIMILARITY_THRESHOLD)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, maxResults);

      return similarities;

    } catch (error) {
      console.error('Error retrieving context:', error);
      return [];
    }
  }

  async query(
    question: string,
    context: RAGContext,
    options: {
      includeReferences?: boolean;
      maxTokens?: number;
      temperature?: number;
    } = {}
  ): Promise<QueryResponse> {
    try {
      console.log('Processing RAG query:', question);

      const {
        includeReferences = true,
        maxTokens = 1000,
        temperature = 0.3
      } = options;

      // Retrieve relevant context
      const relevantDocs = await this.retrieveRelevantContext(
        question,
        context.organization_id,
        5
      );

      // Build context for the LLM
      const contextText = relevantDocs
        .map(doc => `Source: ${doc.metadata.source} (${doc.metadata.type})\n${doc.content}`)
        .join('\n\n');

      // Enhance prompt with GRC expertise
      const enhancedPrompt = this.buildGRCPrompt(question, contextText, context);

      // Generate response
      const model = this.genAI.getGenerativeModel({
        model: this.GENERATION_MODEL,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: temperature
        }
      });

      const result = await model.generateContent(enhancedPrompt);
      const response = result.response.text();

      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(relevantDocs, question);

      // Extract citations
      const citations = includeReferences
        ? relevantDocs.map(doc => ({
            source: doc.metadata.source,
            type: doc.metadata.type,
            similarity: doc.similarity,
            framework: doc.metadata.framework
          }))
        : [];

      return {
        response,
        confidence_score: confidenceScore,
        citations,
        context_used: contextText.length > 0,
        suggested_actions: this.extractSuggestedActions(response, context)
      };

    } catch (error) {
      console.error('Error processing RAG query:', error);

      return {
        response: 'I apologize, but I encountered an error processing your question. Please try rephrasing your query or contact support if the issue persists.',
        confidence_score: 0,
        citations: [],
        context_used: false,
        suggested_actions: []
      };
    }
  }

  private buildGRCPrompt(question: string, context: string, ragContext: RAGContext): string {
    const roleDescription = this.getRoleBasedInstructions(ragContext.user_role);

    // Check if this is a specific technical question
    const isSpecificQuestion = question.toLowerCase().includes('clause') ||
                              question.toLowerCase().includes('control') ||
                              question.toLowerCase().includes('iso') ||
                              question.toLowerCase().includes('nist') ||
                              question.toLowerCase().includes('summarize') ||
                              question.toLowerCase().includes('explain') ||
                              question.toLowerCase().includes('define');

    if (isSpecificQuestion && context) {
      return `You are a professional GRC expert. The user is asking a specific question about standards, frameworks, or controls.

USER QUESTION: ${question}

RELEVANT INFORMATION FROM KNOWLEDGE BASE:
${context}

INSTRUCTIONS:
1. Answer the specific question directly and accurately
2. Use the information from the knowledge base if relevant
3. If asking about a specific clause, control, or standard, provide detailed information
4. Structure your response clearly with headings if appropriate
5. Be factual and precise - avoid generic advice unless specifically requested
6. If the knowledge base doesn't contain the specific information requested, state this clearly

Provide a direct, informative answer to their specific question.`;
    }

    return `You are a professional GRC (Governance, Risk, and Compliance) advisor with expertise in cybersecurity frameworks, risk management, and regulatory compliance.

${roleDescription}

Based on the following organizational context and relevant documents, please answer the user's question:

ORGANIZATIONAL CONTEXT:
- User Role: ${ragContext.user_role}
- Framework Focus: ${ragContext.framework || 'Multiple frameworks'}
- Project Context: ${ragContext.project_id ? 'Active project engagement' : 'General inquiry'}

RELEVANT DOCUMENTS:
${context || 'No specific documents found. Provide general GRC guidance.'}

USER QUESTION:
${question}

INSTRUCTIONS:
1. Provide accurate, professional GRC advice
2. Reference specific frameworks, controls, or standards when applicable
3. If using organizational data from the documents, cite the sources
4. If insufficient information is available, clearly state this limitation
5. Offer practical, actionable recommendations when appropriate
6. Use professional but accessible language
7. Focus on business value and risk mitigation

Your response should be comprehensive but concise, directly addressing the question while providing valuable GRC insights.`;
  }

  private getRoleBasedInstructions(userRole: string): string {
    const roleInstructions = {
      consultant: 'You are providing advice to a GRC consultant. Focus on technical accuracy, framework specifics, and implementation guidance that can be shared with clients.',
      ciso: 'You are providing advice to a Chief Information Security Officer. Focus on strategic guidance, executive-level insights, and business risk implications.',
      analyst: 'You are providing advice to a GRC analyst. Focus on practical implementation details, assessment procedures, and operational guidance.',
      auditor: 'You are providing advice to an auditor. Focus on control testing, evidence requirements, and compliance verification procedures.',
      client: 'You are providing advice to a client organization. Focus on clear explanations, business impact, and practical next steps in accessible language.'
    };

    return roleInstructions[userRole] || roleInstructions.client;
  }

  private calculateConfidenceScore(relevantDocs: any[], question: string): number {
    if (relevantDocs.length === 0) return 20;

    const avgSimilarity = relevantDocs.reduce((sum, doc) => sum + doc.similarity, 0) / relevantDocs.length;
    const docCountScore = Math.min(relevantDocs.length / 3, 1) * 30;
    const similarityScore = avgSimilarity * 50;
    const baseScore = 20;

    return Math.round(baseScore + docCountScore + similarityScore);
  }

  private extractSuggestedActions(response: string, context: RAGContext): string[] {
    const actions = [];

    // Extract action-oriented sentences from the response
    const sentences = response.split('.').map(s => s.trim()).filter(s => s.length > 10);

    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes('should') ||
          sentence.toLowerCase().includes('recommend') ||
          sentence.toLowerCase().includes('consider') ||
          sentence.toLowerCase().includes('implement')) {
        actions.push(sentence + '.');
      }
    }

    // Add role-specific suggested actions
    if (context.user_role === 'ciso') {
      actions.push('Review and update the information security strategy based on these findings.');
      actions.push('Consider budget allocation for identified security improvements.');
    }

    return actions.slice(0, 5); // Limit to 5 suggestions
  }

  async addDocument(
    content: string,
    metadata: {
      source: string;
      type: 'control' | 'policy' | 'assessment' | 'finding' | 'procedure';
      organization_id: string;
      framework?: string;
    }
  ): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(content);

      const document: VectorStore = {
        id: `${metadata.source}_${Date.now()}`,
        content,
        metadata: {
          ...metadata,
          created_at: new Date().toISOString()
        },
        embedding
      };

      this.vectorStore.push(document);

      // Update appropriate knowledge base
      this.knowledgeBase[metadata.type + 's']?.set(document.id, { content, ...metadata });

    } catch (error) {
      console.error('Error adding document to knowledge base:', error);
      throw error;
    }
  }

  async updateKnowledgeBase(organizationId: string): Promise<void> {
    // Clear existing data for the organization
    this.vectorStore = this.vectorStore.filter(
      doc => doc.metadata.organization_id !== organizationId
    );

    // Reload knowledge base
    await this.initializeKnowledgeBase(organizationId);
  }

  getKnowledgeBaseStats(organizationId: string): {
    total_documents: number;
    by_type: { [key: string]: number };
    by_source: { [key: string]: number };
    last_updated: string;
  } {
    const orgDocs = this.vectorStore.filter(
      doc => doc.metadata.organization_id === organizationId
    );

    const byType = {};
    const bySource = {};

    orgDocs.forEach(doc => {
      byType[doc.metadata.type] = (byType[doc.metadata.type] || 0) + 1;
      bySource[doc.metadata.source] = (bySource[doc.metadata.source] || 0) + 1;
    });

    const lastUpdated = orgDocs.length > 0
      ? Math.max(...orgDocs.map(doc => new Date(doc.metadata.created_at).getTime()))
      : Date.now();

    return {
      total_documents: orgDocs.length,
      by_type: byType,
      by_source: bySource,
      last_updated: new Date(lastUpdated).toISOString()
    };
  }
}

export default RAGService;