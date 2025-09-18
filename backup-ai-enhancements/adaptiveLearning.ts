#!/usr/bin/env tsx
import { ChatOllama } from '@langchain/ollama';
import { OllamaEmbeddings } from '@langchain/ollama';

/**
 * Adaptive Learning & Inference Optimization System
 *
 * Features:
 * 1. Smart Model Selection (faster inference for simple queries)
 * 2. Semantic Caching (avoid duplicate processing)
 * 3. Response Quality Learning
 * 4. User Feedback Integration
 * 5. Performance Optimization
 * 6. Inference Speed Enhancement
 */

interface QueryClassification {
  complexity: 'simple' | 'medium' | 'complex';
  category: 'factual' | 'analytical' | 'comparative' | 'advisory';
  urgency: 'low' | 'medium' | 'high';
  estimatedTokens: number;
}

interface CacheEntry {
  queryVector: number[];
  response: string;
  quality: number;
  timestamp: Date;
  usageCount: number;
}

interface ModelPerformance {
  modelName: string;
  avgResponseTime: number;
  avgQuality: number;
  usageCount: number;
  lastUsed: Date;
}

interface LearningData {
  queryPattern: string;
  responsePattern: string;
  userSatisfaction: number;
  actualComplexity: number;
  optimalModel: string;
}

class QueryClassifier {
  classifyQuery(query: string): QueryClassification {
    const complexity = this.assessComplexity(query);
    const category = this.categorizeQuery(query);
    const urgency = this.assessUrgency(query);
    const estimatedTokens = this.estimateTokens(query);

    return {
      complexity,
      category,
      urgency,
      estimatedTokens
    };
  }

  private assessComplexity(query: string): 'simple' | 'medium' | 'complex' {
    let complexityScore = 0;

    // Length factor
    if (query.length > 200) complexityScore += 2;
    else if (query.length > 100) complexityScore += 1;

    // Multiple frameworks/standards mentioned
    const frameworks = ['nist', 'iso', 'cis', 'sox', 'hipaa', 'gdpr', 'pci'];
    const frameworkCount = frameworks.filter(fw =>
      query.toLowerCase().includes(fw)
    ).length;
    complexityScore += Math.min(frameworkCount, 3);

    // Complex question words
    const complexWords = ['compare', 'analyze', 'evaluate', 'implement', 'assess'];
    if (complexWords.some(word => query.toLowerCase().includes(word))) {
      complexityScore += 2;
    }

    // Multiple concepts
    const concepts = ['risk', 'control', 'audit', 'compliance', 'governance'];
    const conceptCount = concepts.filter(concept =>
      query.toLowerCase().includes(concept)
    ).length;
    complexityScore += Math.min(conceptCount - 1, 2);

    if (complexityScore >= 5) return 'complex';
    if (complexityScore >= 2) return 'medium';
    return 'simple';
  }

  private categorizeQuery(query: string): 'factual' | 'analytical' | 'comparative' | 'advisory' {
    const queryLower = query.toLowerCase();

    // Comparative queries
    if (queryLower.includes('compare') || queryLower.includes('vs') ||
        queryLower.includes('difference') || queryLower.includes('versus')) {
      return 'comparative';
    }

    // Advisory/implementation queries
    if (queryLower.includes('how to') || queryLower.includes('implement') ||
        queryLower.includes('should') || queryLower.includes('recommend')) {
      return 'advisory';
    }

    // Analytical queries
    if (queryLower.includes('analyze') || queryLower.includes('assess') ||
        queryLower.includes('evaluate') || queryLower.includes('why')) {
      return 'analytical';
    }

    // Default to factual
    return 'factual';
  }

  private assessUrgency(query: string): 'low' | 'medium' | 'high' {
    const urgentWords = ['urgent', 'asap', 'immediately', 'critical', 'emergency'];
    const auditWords = ['audit', 'assessment', 'review', 'examination'];

    const queryLower = query.toLowerCase();

    if (urgentWords.some(word => queryLower.includes(word))) {
      return 'high';
    }

    if (auditWords.some(word => queryLower.includes(word))) {
      return 'medium';
    }

    return 'low';
  }

  private estimateTokens(query: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(query.length / 4);
  }
}

class SemanticCache {
  private cache: Map<string, CacheEntry> = new Map();
  private embeddings: OllamaEmbeddings;
  private similarityThreshold = 0.85;

  constructor() {
    this.embeddings = new OllamaEmbeddings({
      model: 'nomic-embed-text',
      baseUrl: 'http://localhost:11434'
    });
  }

  async findSimilarQuery(query: string): Promise<CacheEntry | null> {
    if (this.cache.size === 0) return null;

    try {
      const queryVector = await this.embeddings.embedQuery(query);

      let bestMatch: CacheEntry | null = null;
      let bestSimilarity = 0;

      for (const [cachedQuery, entry] of this.cache.entries()) {
        const similarity = this.calculateCosineSimilarity(queryVector, entry.queryVector);

        if (similarity > bestSimilarity && similarity >= this.similarityThreshold) {
          bestSimilarity = similarity;
          bestMatch = entry;
        }
      }

      if (bestMatch) {
        bestMatch.usageCount++;
        console.log(`🎯 Cache hit! Similarity: ${(bestSimilarity * 100).toFixed(1)}%`);
      }

      return bestMatch;
    } catch (error) {
      console.warn('Cache lookup failed:', error);
      return null;
    }
  }

  async cacheResponse(query: string, response: string, quality: number): Promise<void> {
    try {
      const queryVector = await this.embeddings.embedQuery(query);

      const entry: CacheEntry = {
        queryVector,
        response,
        quality,
        timestamp: new Date(),
        usageCount: 1
      };

      // Use first 50 chars of query as cache key
      const cacheKey = query.substring(0, 50);
      this.cache.set(cacheKey, entry);

      // Limit cache size (LRU eviction)
      if (this.cache.size > 100) {
        this.evictOldEntries();
      }

      console.log(`💾 Response cached (${this.cache.size} entries)`);
    } catch (error) {
      console.warn('Cache storage failed:', error);
    }
  }

  private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private evictOldEntries(): void {
    // Remove oldest 20% of entries
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime());

    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  getCacheStats(): any {
    const entries = Array.from(this.cache.values());
    const totalUsage = entries.reduce((sum, entry) => sum + entry.usageCount, 0);
    const avgQuality = entries.reduce((sum, entry) => sum + entry.quality, 0) / entries.length;

    return {
      size: this.cache.size,
      totalUsage,
      avgQuality: avgQuality || 0,
      hitRate: totalUsage > entries.length ? (totalUsage - entries.length) / totalUsage : 0
    };
  }
}

class AdaptiveModelSelector {
  private models: Map<string, ModelPerformance> = new Map();
  private availableModels = [
    { name: 'phi3:mini', speed: 'fast', quality: 'medium', tokens: 4000 },
    { name: 'mistral:7b-instruct-v0.3-q2_K', speed: 'fast', quality: 'good', tokens: 8000 },
    { name: 'mistral:latest', speed: 'medium', quality: 'high', tokens: 8000 },
    { name: 'llama3.1:8b', speed: 'medium', quality: 'high', tokens: 8000 },
    { name: 'qwen2.5-coder:7b', speed: 'medium', quality: 'high', tokens: 32000 }
  ];

  selectOptimalModel(classification: QueryClassification): string {
    // Simple queries -> fast models
    if (classification.complexity === 'simple' && classification.category === 'factual') {
      return 'phi3:mini';
    }

    // High urgency -> fast models
    if (classification.urgency === 'high') {
      return 'mistral:7b-instruct-v0.3-q2_K';
    }

    // Complex analytical queries -> best models
    if (classification.complexity === 'complex' || classification.category === 'analytical') {
      return 'qwen2.5-coder:7b';
    }

    // Default balanced choice
    return 'mistral:latest';
  }

  recordPerformance(modelName: string, responseTime: number, quality: number): void {
    const existing = this.models.get(modelName);

    if (existing) {
      // Update running averages
      existing.avgResponseTime = (existing.avgResponseTime * existing.usageCount + responseTime) / (existing.usageCount + 1);
      existing.avgQuality = (existing.avgQuality * existing.usageCount + quality) / (existing.usageCount + 1);
      existing.usageCount++;
      existing.lastUsed = new Date();
    } else {
      this.models.set(modelName, {
        modelName,
        avgResponseTime: responseTime,
        avgQuality: quality,
        usageCount: 1,
        lastUsed: new Date()
      });
    }
  }

  getModelStats(): ModelPerformance[] {
    return Array.from(this.models.values())
      .sort((a, b) => b.usageCount - a.usageCount);
  }

  recommendOptimizations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getModelStats();

    // Find slow models
    const slowModels = stats.filter(m => m.avgResponseTime > 5000);
    if (slowModels.length > 0) {
      recommendations.push(`Consider alternatives to slow models: ${slowModels.map(m => m.modelName).join(', ')}`);
    }

    // Find underused high-quality models
    const highQualityModels = stats.filter(m => m.avgQuality > 0.8 && m.usageCount < 10);
    if (highQualityModels.length > 0) {
      recommendations.push(`Underused high-quality models: ${highQualityModels.map(m => m.modelName).join(', ')}`);
    }

    return recommendations;
  }
}

class UserFeedbackLearner {
  private feedbackData: LearningData[] = [];

  recordFeedback(
    query: string,
    response: string,
    userSatisfaction: number,
    actualComplexity: number,
    modelUsed: string
  ): void {
    const learningEntry: LearningData = {
      queryPattern: this.extractPattern(query),
      responsePattern: this.extractPattern(response),
      userSatisfaction,
      actualComplexity,
      optimalModel: modelUsed
    };

    this.feedbackData.push(learningEntry);

    // Keep only recent feedback (last 1000 entries)
    if (this.feedbackData.length > 1000) {
      this.feedbackData = this.feedbackData.slice(-1000);
    }

    this.updateLearnings();
  }

  private extractPattern(text: string): string {
    // Extract key patterns from text for learning
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Get most frequent words as pattern
    const wordCount = words.reduce((count: any, word: string) => {
      count[word] = (count[word] || 0) + 1;
      return count;
    }, {});

    return Object.entries(wordCount)
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 5)
      .map(([word]: any) => word)
      .join(' ');
  }

  private updateLearnings(): void {
    if (this.feedbackData.length < 10) return;

    // Find patterns in successful responses
    const goodResponses = this.feedbackData.filter(entry => entry.userSatisfaction > 0.8);
    const poorResponses = this.feedbackData.filter(entry => entry.userSatisfaction < 0.5);

    console.log(`📚 Learning update: ${goodResponses.length} good, ${poorResponses.length} poor responses`);

    // Analyze patterns
    if (goodResponses.length > 5) {
      this.analyzeSuccessPatterns(goodResponses);
    }

    if (poorResponses.length > 3) {
      this.analyzeFailurePatterns(poorResponses);
    }
  }

  private analyzeSuccessPatterns(goodResponses: LearningData[]): void {
    // Find common query patterns in successful responses
    const queryPatterns = goodResponses.map(r => r.queryPattern);
    const commonPatterns = this.findCommonElements(queryPatterns);

    console.log(`✅ Success patterns found: ${commonPatterns.join(', ')}`);
  }

  private analyzeFailurePatterns(poorResponses: LearningData[]): void {
    // Find common issues in poor responses
    const queryPatterns = poorResponses.map(r => r.queryPattern);
    const problemPatterns = this.findCommonElements(queryPatterns);

    console.log(`❌ Problem patterns found: ${problemPatterns.join(', ')}`);
  }

  private findCommonElements(patterns: string[]): string[] {
    const wordCounts: any = {};

    patterns.forEach(pattern => {
      pattern.split(' ').forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
    });

    return Object.entries(wordCounts)
      .filter(([, count]: any) => count >= patterns.length * 0.5)
      .map(([word]: any) => word);
  }

  getLearningInsights(): any {
    if (this.feedbackData.length < 5) return null;

    const avgSatisfaction = this.feedbackData.reduce((sum, entry) =>
      sum + entry.userSatisfaction, 0) / this.feedbackData.length;

    const modelPerformance = this.feedbackData.reduce((acc: any, entry) => {
      if (!acc[entry.optimalModel]) {
        acc[entry.optimalModel] = { total: 0, count: 0 };
      }
      acc[entry.optimalModel].total += entry.userSatisfaction;
      acc[entry.optimalModel].count++;
      return acc;
    }, {});

    const bestModel = Object.entries(modelPerformance)
      .map(([model, data]: any) => ({
        model,
        avgSatisfaction: data.total / data.count
      }))
      .sort((a, b) => b.avgSatisfaction - a.avgSatisfaction)[0];

    return {
      totalFeedback: this.feedbackData.length,
      avgSatisfaction,
      bestModel: bestModel?.model,
      bestModelScore: bestModel?.avgSatisfaction
    };
  }
}

// Main Adaptive Learning System
class AdaptiveLearningRAG {
  private classifier: QueryClassifier;
  private cache: SemanticCache;
  private modelSelector: AdaptiveModelSelector;
  private learner: UserFeedbackLearner;

  constructor() {
    this.classifier = new QueryClassifier();
    this.cache = new SemanticCache();
    this.modelSelector = new AdaptiveModelSelector();
    this.learner = new UserFeedbackLearner();
  }

  async processAdaptiveQuery(query: string): Promise<any> {
    const startTime = Date.now();
    console.log('🧠 ADAPTIVE LEARNING RAG PROCESSING\n');

    // Step 1: Classify Query
    console.log('1️⃣ Query Classification...');
    const classification = this.classifier.classifyQuery(query);
    console.log(`   Complexity: ${classification.complexity}`);
    console.log(`   Category: ${classification.category}`);
    console.log(`   Urgency: ${classification.urgency}`);
    console.log(`   Estimated Tokens: ${classification.estimatedTokens}`);

    // Step 2: Check Cache
    console.log('\n2️⃣ Semantic Cache Check...');
    const cachedResult = await this.cache.findSimilarQuery(query);

    if (cachedResult && cachedResult.quality > 0.8) {
      console.log(`✅ Using cached response (Quality: ${(cachedResult.quality * 100).toFixed(1)}%)`);
      return {
        response: cachedResult.response,
        source: 'cache',
        quality: cachedResult.quality,
        responseTime: Date.now() - startTime,
        classification
      };
    }

    // Step 3: Select Optimal Model
    console.log('\n3️⃣ Model Selection...');
    const selectedModel = this.modelSelector.selectOptimalModel(classification);
    console.log(`   Selected Model: ${selectedModel}`);

    // Step 4: Generate Response (mock for this example)
    console.log('\n4️⃣ Response Generation...');
    const mockResponse = await this.generateResponse(query, selectedModel);
    const responseTime = Date.now() - startTime;

    // Step 5: Cache Response
    console.log('\n5️⃣ Caching Response...');
    await this.cache.cacheResponse(query, mockResponse.content, mockResponse.quality);

    // Step 6: Record Performance
    this.modelSelector.recordPerformance(selectedModel, responseTime, mockResponse.quality);

    return {
      response: mockResponse.content,
      source: 'generated',
      model: selectedModel,
      quality: mockResponse.quality,
      responseTime,
      classification,
      cacheStats: this.cache.getCacheStats()
    };
  }

  private async generateResponse(query: string, modelName: string): Promise<any> {
    // Mock response generation with quality based on model
    const qualityByModel: any = {
      'phi3:mini': 0.7,
      'mistral:7b-instruct-v0.3-q2_K': 0.8,
      'mistral:latest': 0.9,
      'llama3.1:8b': 0.9,
      'qwen2.5-coder:7b': 0.95
    };

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    return {
      content: `Response generated by ${modelName} for: ${query.substring(0, 50)}...`,
      quality: qualityByModel[modelName] || 0.8
    };
  }

  recordUserFeedback(
    query: string,
    response: string,
    satisfaction: number,
    complexity: number,
    model: string
  ): void {
    this.learner.recordFeedback(query, response, satisfaction, complexity, model);
  }

  getSystemInsights(): any {
    return {
      cache: this.cache.getCacheStats(),
      models: this.modelSelector.getModelStats(),
      learning: this.learner.getLearningInsights(),
      optimizations: this.modelSelector.recommendOptimizations()
    };
  }
}

// Export for use in main application
export {
  AdaptiveLearningRAG,
  QueryClassifier,
  SemanticCache,
  AdaptiveModelSelector,
  UserFeedbackLearner
};

// Test the adaptive system
async function testAdaptiveLearning() {
  console.log('🧪 TESTING ADAPTIVE LEARNING SYSTEM\n');

  const adaptiveRAG = new AdaptiveLearningRAG();

  const testQueries = [
    'What is NIST 800-53?', // Simple factual
    'How do I implement comprehensive access control for a financial services company?', // Complex advisory
    'Compare NIST CSF vs ISO 27001 frameworks', // Complex comparative
    'What does AC-2 control require?', // Simple factual (should be cached after first)
    'Urgent: Need compliance gap analysis for SOX audit next week' // High urgency
  ];

  for (let i = 0; i < testQueries.length; i++) {
    const query = testQueries[i];
    console.log(`${'='.repeat(80)}`);
    console.log(`🧪 TEST ${i + 1}: ${query}`);
    console.log('='.repeat(80));

    try {
      const result = await adaptiveRAG.processAdaptiveQuery(query);

      console.log(`✅ Response: ${result.response.substring(0, 100)}...`);
      console.log(`📊 Source: ${result.source}`);
      console.log(`🤖 Model: ${result.model || 'cached'}`);
      console.log(`⭐ Quality: ${(result.quality * 100).toFixed(1)}%`);
      console.log(`⚡ Response Time: ${result.responseTime}ms`);

      // Simulate user feedback
      const satisfaction = 0.7 + Math.random() * 0.3; // 70-100% satisfaction
      adaptiveRAG.recordUserFeedback(
        query,
        result.response,
        satisfaction,
        result.classification.complexity === 'simple' ? 0.3 :
        result.classification.complexity === 'medium' ? 0.6 : 0.9,
        result.model || 'cached'
      );

    } catch (error) {
      console.error(`❌ Test failed: ${error}`);
    }

    console.log('');
  }

  // Show system insights
  console.log('📊 SYSTEM INSIGHTS:');
  const insights = adaptiveRAG.getSystemInsights();
  console.log('Cache Stats:', insights.cache);
  console.log('Model Performance:', insights.models);
  console.log('Learning Insights:', insights.learning);
  console.log('Optimizations:', insights.optimizations);

  console.log('\n🎉 ADAPTIVE LEARNING TESTING COMPLETE!');
}

// Run test
testAdaptiveLearning().catch(console.error);