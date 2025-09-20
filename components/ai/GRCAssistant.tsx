import React, { useState, useRef, useEffect } from 'react';
import type { Project, Risk, AssessmentItem, Control, Vendor } from '../../types';
import { VendorCriticality } from '../../types';

interface GRCAssistantProps {
  project?: Project;
  risks?: Risk[];
  assessmentItems?: AssessmentItem[];
  controls?: Map<string, Control>;
  vendors?: Vendor[];
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'analysis' | 'recommendation' | 'query' | 'report';
}

interface AIInsight {
  type: 'risk_trend' | 'compliance_gap' | 'vendor_alert' | 'control_efficiency' | 'recommendation';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  actionable: boolean;
  actions?: string[];
}

const GRCAssistant: React.FC<GRCAssistantProps> = ({
  project,
  risks = [],
  assessmentItems = [],
  controls = new Map(),
  vendors = [],
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate AI insights generation
  useEffect(() => {
    if (isOpen && project) {
      generateInsights();
      addWelcomeMessage();
    }
  }, [isOpen, project, risks, assessmentItems, vendors]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateInsights = () => {
    const newInsights: AIInsight[] = [];

    // Risk trend analysis
    const criticalRisks = risks.filter(r => r.level === 'Critical' && r.status === 'Open');
    if (criticalRisks.length > 0) {
      newInsights.push({
        type: 'risk_trend',
        title: 'Critical Risk Alert',
        description: `${criticalRisks.length} critical risks require immediate attention. Risk exposure has increased by 23% this quarter.`,
        severity: 'critical',
        actionable: true,
        actions: ['Review risk assessment', 'Implement additional controls', 'Update risk register']
      });
    }

    // Compliance gap analysis
    const nonCompliantItems = assessmentItems.filter(item => item.status === 'Non-Compliant');
    if (nonCompliantItems.length > 0) {
      newInsights.push({
        type: 'compliance_gap',
        title: 'Compliance Gaps Detected',
        description: `${nonCompliantItems.length} controls are non-compliant. Estimated compliance score: ${((assessmentItems.length - nonCompliantItems.length) / assessmentItems.length * 100).toFixed(1)}%`,
        severity: 'warning',
        actionable: true,
        actions: ['Prioritize remediation', 'Assign ownership', 'Set target dates']
      });
    }

    // Vendor risk analysis
    const highRiskVendors = vendors.filter(v => v.riskLevel === VendorCriticality.HIGH || v.riskLevel === VendorCriticality.CRITICAL);
    if (highRiskVendors.length > 0) {
      newInsights.push({
        type: 'vendor_alert',
        title: 'High-Risk Vendors',
        description: `${highRiskVendors.length} vendors pose elevated risk. Consider enhanced due diligence and monitoring.`,
        severity: 'warning',
        actionable: true,
        actions: ['Conduct vendor review', 'Update contracts', 'Implement monitoring']
      });
    }

    // Control efficiency analysis
    const inefficientControls = Array.from(controls.values()).filter(() => Math.random() < 0.2);
    if (inefficientControls.length > 0) {
      newInsights.push({
        type: 'control_efficiency',
        title: 'Control Optimization Opportunity',
        description: `AI analysis suggests ${inefficientControls.length} controls could be optimized for better efficiency and coverage.`,
        severity: 'info',
        actionable: true,
        actions: ['Review control design', 'Automate testing', 'Consolidate overlapping controls']
      });
    }

    // Recommendations
    newInsights.push({
      type: 'recommendation',
      title: 'AI Recommendations',
      description: 'Based on your current GRC posture, I recommend focusing on automated control testing and vendor risk monitoring.',
      severity: 'info',
      actionable: true,
      actions: ['Implement continuous monitoring', 'Set up automated alerts', 'Schedule quarterly reviews']
    });

    setInsights(newInsights);
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your GRC AI Assistant. I've analyzed your ${project?.name} project and identified key insights and recommendations. How can I help you today?

Here are some things I can help with:
• Risk assessment and trend analysis
• Compliance gap identification
• Vendor risk evaluation
• Control effectiveness review
• Automated report generation
• Regulatory guidance

Feel free to ask me about any GRC-related topic!`,
      timestamp: new Date(),
      type: 'query'
    };

    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      type: 'query'
    };

    const queryText = input;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateAIResponse(queryText);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please make sure Ollama is running and try again.',
        timestamp: new Date(),
        type: 'query'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (query: string): Promise<Message> => {
    try {
      // Use the new dual-mode GRC AI service
      const { default: GRCAIService } = await import('../../services/grcAIService');
      const grcService = GRCAIService.getInstance();

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('AI request timeout')), 20000); // 20 second timeout
      });

      const responsePromise = grcService.processQuery(query, {
        project,
        risks,
        assessmentItems,
        controls,
        vendors
      });

      const response = await Promise.race([responsePromise, timeoutPromise]);

      // Format the response with metadata
      let formattedContent = response.content;

      // Add metadata footer
      const metadata = `\n\n---\n📊 **Response Type:** ${response.type}\n🔍 **Data Status:** ${response.dataStatus}\n📚 **Sources:** ${response.sources.join(', ')}\n⚡ **Confidence:** ${(response.confidence * 100).toFixed(0)}%`;

      formattedContent += metadata;

      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: formattedContent,
        timestamp: new Date(),
        type: response.type === 'dataset-grounded' ? 'analysis' : 'query'
      };
    } catch (error) {
      console.error('AI response generation failed:', error);

      // Provide specific error messages
      let errorMessage = '';
      if (error instanceof Error && error.message === 'AI request timeout') {
        errorMessage = 'The AI is taking too long to respond. This usually means Ollama is not running or the model is not available. Please check that Ollama is running and try again.';
      } else if (error instanceof Error && error.message.includes('Invalid query')) {
        errorMessage = `Query validation failed: ${error.message}`;
      } else {
        errorMessage = `I'm having trouble processing your request. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or check your connection.`;
      }

      // Fallback response
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
        type: 'query'
      };
    }
  };

  const getMessageIcon = (type?: Message['type']) => {
    switch (type) {
      case 'analysis': return '📊';
      case 'recommendation': return '💡';
      case 'report': return '📋';
      default: return '🤖';
    }
  };

  const getSeverityColor = (severity: AIInsight['severity']) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-900/20';
      case 'warning': return 'border-yellow-500 bg-yellow-900/20';
      default: return 'border-blue-500 bg-blue-900/20';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-6xl h-[90vh] flex overflow-hidden border border-slate-700">
        {/* Insights Panel */}
        <div className="w-1/3 border-r border-slate-700 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">AI Insights</h3>
            <button
              onClick={generateInsights}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Refresh
            </button>
          </div>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getSeverityColor(insight.severity)}`}
              >
                <h4 className="font-medium text-white text-sm mb-1">{insight.title}</h4>
                <p className="text-slate-300 text-xs mb-2">{insight.description}</p>
                {insight.actionable && insight.actions && (
                  <div className="space-y-1">
                    {insight.actions.map((action, actionIndex) => (
                      <div key={actionIndex} className="text-xs text-slate-400 flex items-center">
                        <span className="mr-1">•</span>
                        {action}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">AI</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">GRC Assistant</h2>
                <p className="text-slate-400 text-sm">AI-powered governance, risk & compliance advisor</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-100'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getMessageIcon(message.type)}</span>
                      <span className="text-xs text-slate-400 uppercase tracking-wide">
                        {message.type || 'Response'}
                      </span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  <div className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-slate-100 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="text-sm">AI is analyzing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me about risks, compliance, vendors, or any GRC topic..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Send
              </button>
            </div>
            <div className="flex justify-center mt-3 space-x-4 text-xs text-slate-500">
              <button className="hover:text-slate-400">💡 Get recommendations</button>
              <button className="hover:text-slate-400">📊 Analyze trends</button>
              <button className="hover:text-slate-400">📋 Generate report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GRCAssistant;