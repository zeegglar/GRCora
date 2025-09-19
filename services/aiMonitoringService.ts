import { supabase } from './supabaseClient';

interface AIMetrics {
  service: string;
  operation: string;
  timestamp: Date;
  duration_ms: number;
  confidence_score: number;
  accuracy_score?: number;
  tokens_used?: number;
  cost_estimate?: number;
  error_occurred: boolean;
  error_message?: string;
  user_feedback?: number; // 1-5 rating
  hallucination_detected: boolean;
  requires_review: boolean;
}

interface AIPerformanceReport {
  service_summary: {
    total_requests: number;
    success_rate: number;
    average_confidence: number;
    average_duration: number;
    total_cost: number;
  };
  quality_metrics: {
    accuracy_trend: number[];
    confidence_trend: number[];
    hallucination_rate: number;
    review_rate: number;
  };
  usage_patterns: {
    peak_hours: number[];
    popular_operations: string[];
    user_satisfaction: number;
  };
  alerts: AIAlert[];
  recommendations: string[];
}

interface AIAlert {
  type: 'performance' | 'quality' | 'cost' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  affected_service: string;
  recommended_action: string;
}

export class AIMonitoringService {
  private static instance: AIMonitoringService;
  private metrics: AIMetrics[] = [];
  private alerts: AIAlert[] = [];
  private readonly MAX_METRICS_STORED = 10000;

  private constructor() {
    this.startPeriodicReporting();
  }

  public static getInstance(): AIMonitoringService {
    if (!AIMonitoringService.instance) {
      AIMonitoringService.instance = new AIMonitoringService();
    }
    return AIMonitoringService.instance;
  }

  async logAIOperation(
    service: string,
    operation: string,
    startTime: Date,
    endTime: Date,
    result: {
      confidence_score: number;
      accuracy_score?: number;
      tokens_used?: number;
      error?: string;
      hallucination_detected?: boolean;
      requires_review?: boolean;
    }
  ): Promise<void> {
    const metric: AIMetrics = {
      service,
      operation,
      timestamp: startTime,
      duration_ms: endTime.getTime() - startTime.getTime(),
      confidence_score: result.confidence_score,
      accuracy_score: result.accuracy_score,
      tokens_used: result.tokens_used,
      cost_estimate: this.estimateCost(result.tokens_used || 0),
      error_occurred: !!result.error,
      error_message: result.error,
      hallucination_detected: result.hallucination_detected || false,
      requires_review: result.requires_review || false
    };

    this.metrics.push(metric);

    // Maintain metrics storage limit
    if (this.metrics.length > this.MAX_METRICS_STORED) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS_STORED);
    }

    // Check for alerts
    this.checkForAlerts(metric);

    // Store critical metrics in database
    if (metric.error_occurred || metric.confidence_score < 0.6 || metric.hallucination_detected) {
      await this.persistCriticalMetric(metric);
    }

    console.log(`📊 AI Operation Logged: ${service}.${operation} (${metric.duration_ms}ms, confidence: ${(metric.confidence_score * 100).toFixed(1)}%)`);
  }

  async logUserFeedback(
    service: string,
    operation: string,
    timestamp: Date,
    rating: number
  ): Promise<void> {
    // Find the corresponding metric and update it
    const metricIndex = this.metrics.findIndex(m =>
      m.service === service &&
      m.operation === operation &&
      Math.abs(m.timestamp.getTime() - timestamp.getTime()) < 60000 // Within 1 minute
    );

    if (metricIndex !== -1) {
      this.metrics[metricIndex].user_feedback = rating;
      console.log(`👤 User Feedback Logged: ${service}.${operation} rated ${rating}/5`);
    }
  }

  private estimateCost(tokens: number): number {
    // Rough cost estimation based on typical AI service pricing
    const costPerToken = 0.000002; // ~$0.002 per 1K tokens
    return tokens * costPerToken;
  }

  private checkForAlerts(metric: AIMetrics): void {
    const recentMetrics = this.getRecentMetrics(metric.service, 60); // Last hour

    // Performance alert
    if (metric.duration_ms > 30000) { // > 30 seconds
      this.createAlert('performance', 'high',
        `Slow AI response detected: ${metric.service}.${metric.operation} took ${(metric.duration_ms/1000).toFixed(1)}s`,
        metric.service,
        'Investigate service performance and consider optimization'
      );
    }

    // Quality alert
    if (metric.confidence_score < 0.5) {
      this.createAlert('quality', 'medium',
        `Low confidence AI response: ${metric.service}.${metric.operation} (${(metric.confidence_score * 100).toFixed(1)}%)`,
        metric.service,
        'Review AI prompts and training data quality'
      );
    }

    // Hallucination alert
    if (metric.hallucination_detected) {
      this.createAlert('quality', 'critical',
        `Hallucination detected in ${metric.service}.${metric.operation}`,
        metric.service,
        'Immediate review required - verify response accuracy'
      );
    }

    // Error rate alert
    const errorRate = recentMetrics.filter(m => m.error_occurred).length / recentMetrics.length;
    if (errorRate > 0.1 && recentMetrics.length > 10) { // > 10% error rate
      this.createAlert('performance', 'high',
        `High error rate detected: ${(errorRate * 100).toFixed(1)}% in ${metric.service}`,
        metric.service,
        'Check service health and API connectivity'
      );
    }

    // Cost alert
    const hourlyCost = recentMetrics.reduce((sum, m) => sum + (m.cost_estimate || 0), 0);
    if (hourlyCost > 10) { // > $10/hour
      this.createAlert('cost', 'medium',
        `High AI usage cost: $${hourlyCost.toFixed(2)}/hour for ${metric.service}`,
        metric.service,
        'Review usage patterns and consider cost optimization'
      );
    }
  }

  private createAlert(
    type: 'performance' | 'quality' | 'cost' | 'security',
    severity: 'low' | 'medium' | 'high' | 'critical',
    message: string,
    service: string,
    action: string
  ): void {
    const alert: AIAlert = {
      type,
      severity,
      message,
      timestamp: new Date(),
      affected_service: service,
      recommended_action: action
    };

    this.alerts.push(alert);

    // Log critical alerts immediately
    if (severity === 'critical') {
      console.error(`🚨 CRITICAL AI ALERT: ${message}`);
    } else if (severity === 'high') {
      console.warn(`⚠️ HIGH AI ALERT: ${message}`);
    }

    // Keep only recent alerts
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(a => a.timestamp > oneWeekAgo);
  }

  private getRecentMetrics(service: string, minutes: number): AIMetrics[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.metrics.filter(m =>
      m.service === service && m.timestamp > cutoff
    );
  }

  async generatePerformanceReport(
    timeRange: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<AIPerformanceReport> {
    const timeRangeMs = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };

    const cutoff = new Date(Date.now() - timeRangeMs[timeRange]);
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff);

    if (recentMetrics.length === 0) {
      return this.getEmptyReport();
    }

    // Service Summary
    const totalRequests = recentMetrics.length;
    const successfulRequests = recentMetrics.filter(m => !m.error_occurred).length;
    const successRate = successfulRequests / totalRequests;
    const averageConfidence = recentMetrics.reduce((sum, m) => sum + m.confidence_score, 0) / totalRequests;
    const averageDuration = recentMetrics.reduce((sum, m) => sum + m.duration_ms, 0) / totalRequests;
    const totalCost = recentMetrics.reduce((sum, m) => sum + (m.cost_estimate || 0), 0);

    // Quality Metrics
    const accuracyTrend = this.calculateTrend(recentMetrics, 'accuracy_score');
    const confidenceTrend = this.calculateTrend(recentMetrics, 'confidence_score');
    const hallucinationRate = recentMetrics.filter(m => m.hallucination_detected).length / totalRequests;
    const reviewRate = recentMetrics.filter(m => m.requires_review).length / totalRequests;

    // Usage Patterns
    const peakHours = this.calculatePeakHours(recentMetrics);
    const popularOperations = this.getPopularOperations(recentMetrics);
    const userSatisfaction = this.calculateUserSatisfaction(recentMetrics);

    // Recent Alerts
    const recentAlerts = this.alerts.filter(a => a.timestamp > cutoff);

    // Recommendations
    const recommendations = this.generateRecommendations(recentMetrics, recentAlerts);

    return {
      service_summary: {
        total_requests: totalRequests,
        success_rate: successRate,
        average_confidence: averageConfidence,
        average_duration: averageDuration,
        total_cost: totalCost
      },
      quality_metrics: {
        accuracy_trend: accuracyTrend,
        confidence_trend: confidenceTrend,
        hallucination_rate: hallucinationRate,
        review_rate: reviewRate
      },
      usage_patterns: {
        peak_hours: peakHours,
        popular_operations: popularOperations,
        user_satisfaction: userSatisfaction
      },
      alerts: recentAlerts,
      recommendations
    };
  }

  private calculateTrend(metrics: AIMetrics[], field: keyof AIMetrics): number[] {
    // Calculate trend over time periods
    const buckets = 10; // Divide time range into 10 buckets
    const trendData: number[] = [];

    if (metrics.length === 0) return Array(buckets).fill(0);

    const timeRange = metrics[metrics.length - 1].timestamp.getTime() - metrics[0].timestamp.getTime();
    const bucketSize = timeRange / buckets;

    for (let i = 0; i < buckets; i++) {
      const bucketStart = metrics[0].timestamp.getTime() + (i * bucketSize);
      const bucketEnd = bucketStart + bucketSize;

      const bucketMetrics = metrics.filter(m =>
        m.timestamp.getTime() >= bucketStart &&
        m.timestamp.getTime() < bucketEnd &&
        m[field] !== undefined
      );

      if (bucketMetrics.length > 0) {
        const average = bucketMetrics.reduce((sum, m) => sum + (m[field] as number), 0) / bucketMetrics.length;
        trendData.push(average);
      } else {
        trendData.push(0);
      }
    }

    return trendData;
  }

  private calculatePeakHours(metrics: AIMetrics[]): number[] {
    const hourCounts = new Array(24).fill(0);

    metrics.forEach(m => {
      const hour = m.timestamp.getHours();
      hourCounts[hour]++;
    });

    return hourCounts;
  }

  private getPopularOperations(metrics: AIMetrics[]): string[] {
    const operationCounts = new Map<string, number>();

    metrics.forEach(m => {
      const key = `${m.service}.${m.operation}`;
      operationCounts.set(key, (operationCounts.get(key) || 0) + 1);
    });

    return Array.from(operationCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([operation]) => operation);
  }

  private calculateUserSatisfaction(metrics: AIMetrics[]): number {
    const ratingsMetrics = metrics.filter(m => m.user_feedback !== undefined);

    if (ratingsMetrics.length === 0) return 0;

    const totalRating = ratingsMetrics.reduce((sum, m) => sum + (m.user_feedback || 0), 0);
    return totalRating / ratingsMetrics.length;
  }

  private generateRecommendations(metrics: AIMetrics[], alerts: AIAlert[]): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    const avgDuration = metrics.reduce((sum, m) => sum + m.duration_ms, 0) / metrics.length;
    if (avgDuration > 10000) {
      recommendations.push('Consider optimizing AI prompts to reduce response time');
    }

    // Quality recommendations
    const avgConfidence = metrics.reduce((sum, m) => sum + m.confidence_score, 0) / metrics.length;
    if (avgConfidence < 0.7) {
      recommendations.push('Review and improve AI training data quality');
    }

    // Cost recommendations
    const totalCost = metrics.reduce((sum, m) => sum + (m.cost_estimate || 0), 0);
    if (totalCost > 100) {
      recommendations.push('Implement token usage optimization to reduce costs');
    }

    // Error rate recommendations
    const errorRate = metrics.filter(m => m.error_occurred).length / metrics.length;
    if (errorRate > 0.05) {
      recommendations.push('Investigate and resolve recurring AI service errors');
    }

    // Alert-based recommendations
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
      recommendations.push('Address critical AI quality issues immediately');
    }

    return recommendations;
  }

  private getEmptyReport(): AIPerformanceReport {
    return {
      service_summary: {
        total_requests: 0,
        success_rate: 0,
        average_confidence: 0,
        average_duration: 0,
        total_cost: 0
      },
      quality_metrics: {
        accuracy_trend: [],
        confidence_trend: [],
        hallucination_rate: 0,
        review_rate: 0
      },
      usage_patterns: {
        peak_hours: new Array(24).fill(0),
        popular_operations: [],
        user_satisfaction: 0
      },
      alerts: [],
      recommendations: ['No AI activity detected in the selected time range']
    };
  }

  private async persistCriticalMetric(metric: AIMetrics): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_metrics')
        .insert({
          service: metric.service,
          operation: metric.operation,
          timestamp: metric.timestamp.toISOString(),
          duration_ms: metric.duration_ms,
          confidence_score: metric.confidence_score,
          accuracy_score: metric.accuracy_score,
          error_occurred: metric.error_occurred,
          error_message: metric.error_message,
          hallucination_detected: metric.hallucination_detected,
          requires_review: metric.requires_review
        });

      if (error) {
        console.error('Failed to persist AI metric:', error);
      }
    } catch (error) {
      console.error('Error persisting AI metric:', error);
    }
  }

  private startPeriodicReporting(): void {
    // Generate hourly summary reports
    setInterval(async () => {
      const report = await this.generatePerformanceReport('hour');

      if (report.service_summary.total_requests > 0) {
        console.log(`📊 Hourly AI Report: ${report.service_summary.total_requests} requests, ${(report.service_summary.success_rate * 100).toFixed(1)}% success rate`);

        // Log critical issues
        const criticalAlerts = report.alerts.filter(a => a.severity === 'critical');
        if (criticalAlerts.length > 0) {
          console.error(`🚨 ${criticalAlerts.length} critical AI issues detected in the last hour`);
        }
      }
    }, 60 * 60 * 1000); // Every hour
  }

  getActiveAlerts(): AIAlert[] {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.alerts.filter(a => a.timestamp > oneHourAgo);
  }

  acknowledgeAlert(timestamp: Date): void {
    const alertIndex = this.alerts.findIndex(a =>
      Math.abs(a.timestamp.getTime() - timestamp.getTime()) < 1000
    );

    if (alertIndex !== -1) {
      this.alerts.splice(alertIndex, 1);
      console.log('✅ AI Alert acknowledged and dismissed');
    }
  }

  exportMetrics(): string {
    const csv = [
      'Timestamp,Service,Operation,Duration(ms),Confidence,Accuracy,Error,Hallucination,Review Required,User Rating',
      ...this.metrics.map(m =>
        `"${m.timestamp.toISOString()}","${m.service}","${m.operation}",${m.duration_ms},${m.confidence_score},${m.accuracy_score || ''},${m.error_occurred},${m.hallucination_detected},${m.requires_review},${m.user_feedback || ''}`
      )
    ].join('\n');

    return csv;
  }
}

// Utility function to wrap AI operations with monitoring
export async function monitorAIOperation<T>(
  service: string,
  operation: string,
  aiFunction: () => Promise<T>,
  options: {
    expectedConfidence?: number;
    checkHallucination?: boolean;
  } = {}
): Promise<T> {
  const monitor = AIMonitoringService.getInstance();
  const startTime = new Date();
  let result: T;
  let error: string | undefined;
  let confidence = 1.0;
  let hallucinationDetected = false;

  try {
    result = await aiFunction();

    // Extract confidence if result has it
    if (typeof result === 'object' && result !== null && 'confidence' in result) {
      confidence = (result as any).confidence === 'high' ? 0.9 :
                   (result as any).confidence === 'medium' ? 0.7 : 0.5;
    }

    // Check for hallucination indicators if enabled
    if (options.checkHallucination && typeof result === 'object' && result !== null) {
      hallucinationDetected = !!(result as any).requires_review ||
                              !!(result as any).unverified_claims?.length;
    }

  } catch (err: any) {
    error = err.message || 'AI operation failed';
    throw err;
  } finally {
    const endTime = new Date();

    await monitor.logAIOperation(service, operation, startTime, endTime, {
      confidence_score: confidence,
      accuracy_score: options.expectedConfidence,
      error,
      hallucination_detected: hallucinationDetected,
      requires_review: confidence < 0.7 || hallucinationDetected
    });
  }

  return result!;
}

export default AIMonitoringService;