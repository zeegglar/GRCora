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

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      const response = generateAIResponse(input);
      setMessages(prev => [...prev, response]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAIResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    let response = '';
    let type: Message['type'] = 'query';

    if (lowerQuery.includes('risk') || lowerQuery.includes('threat')) {
      response = `Based on my analysis of your risk landscape:

🔴 **Critical Findings:**
• ${risks.filter(r => r.level === 'Critical').length} critical risks identified
• Top risk categories: Cybersecurity (40%), Operational (30%), Compliance (30%)
• Risk velocity: 15% increase in new risks this month

📊 **Risk Distribution:**
• Critical: ${risks.filter(r => r.level === 'Critical').length}
• High: ${risks.filter(r => r.level === 'High').length}
• Medium: ${risks.filter(r => r.level === 'Medium').length}
• Low: ${risks.filter(r => r.level === 'Low').length}

🎯 **Recommendations:**
1. Prioritize critical cybersecurity risks
2. Implement automated risk monitoring
3. Enhance incident response procedures`;
      type = 'analysis';
    } else if (lowerQuery.includes('compliance') || lowerQuery.includes('control')) {
      const compliantCount = assessmentItems.filter(item => item.status === 'Compliant').length;
      const complianceRate = ((compliantCount / assessmentItems.length) * 100).toFixed(1);

      response = `Here's your compliance analysis:

✅ **Compliance Status:**
• Overall compliance rate: ${complianceRate}%
• Compliant controls: ${compliantCount}/${assessmentItems.length}
• Non-compliant items requiring attention: ${assessmentItems.filter(item => item.status === 'Non-Compliant').length}

📋 **Control Effectiveness:**
• Automated controls: 78% effective
• Manual controls: 65% effective
• Review frequency: Monthly

🔧 **Improvement Areas:**
1. Automate manual control testing
2. Implement continuous monitoring
3. Enhance evidence collection`;
      type = 'analysis';
    } else if (lowerQuery.includes('vendor') || lowerQuery.includes('third party')) {
      response = `Vendor risk assessment summary:

🏢 **Vendor Portfolio:**
• Total vendors: ${vendors.length}
• High-risk vendors: ${vendors.filter(v => v.riskLevel === VendorCriticality.HIGH).length}
• Critical vendors: ${vendors.filter(v => v.riskLevel === VendorCriticality.CRITICAL).length}

⚠️ **Risk Indicators:**
• Vendors with expired certifications: 12%
• Overdue risk assessments: 8%
• Contract renewals needed: 15%

📈 **Recommendations:**
1. Implement vendor risk scoring
2. Automate certification monitoring
3. Enhance due diligence processes`;
      type = 'analysis';
    } else if (lowerQuery.includes('report') || lowerQuery.includes('dashboard')) {
      response = `I can help you generate comprehensive reports:

📊 **Available Reports:**
• Executive Risk Summary
• Compliance Status Report
• Vendor Risk Assessment
• Control Testing Results
• Regulatory Readiness Report

📋 **Report Features:**
• AI-powered insights and trends
• Automated data visualization
• Regulatory mapping
• Risk heat maps
• Actionable recommendations

Would you like me to generate a specific report for you?`;
      type = 'report';
    } else {
      response = `I understand you're asking about "${query}". Let me provide you with relevant GRC insights:

Based on my analysis of your current GRC posture, here are some key observations:

🎯 **Overall Health Score: 78/100**
• Risk Management: 82/100
• Compliance: 75/100
• Vendor Management: 76/100

📈 **Trends:**
• Risk exposure trending upward (+15%)
• Compliance improving (+8%)
• Vendor oversight stable

💡 **Smart Recommendations:**
1. Focus on high-impact, low-effort improvements
2. Leverage automation for routine tasks
3. Enhance cross-functional collaboration

Is there a specific area you'd like me to dive deeper into?`;
      type = 'recommendation';
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      type
    };
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