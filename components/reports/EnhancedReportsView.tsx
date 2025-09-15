import React, { useState } from 'react';
import type { Project, AssessmentItem, Risk, Control, Vendor, User } from '../../types';
import { PlusCircleIcon, ArrowDownTrayIcon, EyeIcon, DocumentTextIcon, PresentationChartBarIcon } from '../ui/Icons';

interface EnhancedReportsViewProps {
  project: Project;
  user: User;
  assessmentItems: AssessmentItem[];
  risks: Risk[];
  controls: Map<string, Control>;
  vendors: Vendor[];
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'executive' | 'operational' | 'regulatory' | 'vendor' | 'project';
  format: 'pdf' | 'pptx' | 'xlsx' | 'html';
  icon: string;
  estimatedTime: string;
  sections: string[];
  aiPowered: boolean;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'executive-summary',
    name: 'Executive Risk Summary',
    description: 'High-level overview of risk posture for executive leadership',
    type: 'executive',
    format: 'pptx',
    icon: '👔',
    estimatedTime: '2 mins',
    sections: ['Risk Overview', 'Key Metrics', 'Trend Analysis', 'Strategic Recommendations'],
    aiPowered: true
  },
  {
    id: 'weekly-project',
    name: 'Weekly Project Report',
    description: 'Comprehensive weekly status update with progress tracking',
    type: 'project',
    format: 'pdf',
    icon: '📅',
    estimatedTime: '1 min',
    sections: ['Project Status', 'Milestone Progress', 'Risk Updates', 'Next Week\'s Focus'],
    aiPowered: true
  },
  {
    id: 'compliance-assessment',
    name: 'Overall Assessment Report',
    description: 'Detailed compliance status across all frameworks and controls',
    type: 'regulatory',
    format: 'pdf',
    icon: '✅',
    estimatedTime: '3 mins',
    sections: ['Compliance Dashboard', 'Framework Analysis', 'Gap Assessment', 'Remediation Plan'],
    aiPowered: true
  },
  {
    id: 'risk-heatmap',
    name: 'Risk Heat Map Analysis',
    description: 'Visual risk distribution with detailed analytics and trends',
    type: 'operational',
    format: 'html',
    icon: '🔥',
    estimatedTime: '1 min',
    sections: ['Interactive Heat Map', 'Risk Distribution', 'Trend Analysis', 'Recommendations'],
    aiPowered: true
  },
  {
    id: 'vendor-assessment',
    name: 'Vendor Risk Assessment',
    description: 'Comprehensive third-party risk evaluation and monitoring',
    type: 'vendor',
    format: 'xlsx',
    icon: '🏢',
    estimatedTime: '2 mins',
    sections: ['Vendor Portfolio', 'Risk Scoring', 'Performance Metrics', 'Action Items'],
    aiPowered: true
  },
  {
    id: 'regulatory-readiness',
    name: 'Regulatory Readiness Report',
    description: 'Audit-ready documentation with evidence mapping',
    type: 'regulatory',
    format: 'pdf',
    icon: '📋',
    estimatedTime: '5 mins',
    sections: ['Audit Trail', 'Evidence Matrix', 'Control Attestations', 'Gap Analysis'],
    aiPowered: false
  },
  {
    id: 'board-presentation',
    name: 'Board Presentation',
    description: 'Executive presentation for board meetings with key insights',
    type: 'executive',
    format: 'pptx',
    icon: '🎯',
    estimatedTime: '4 mins',
    sections: ['Executive Summary', 'Strategic Risks', 'Investment Priorities', 'Governance Updates'],
    aiPowered: true
  },
  {
    id: 'monthly-dashboard',
    name: 'Monthly Dashboard Report',
    description: 'Comprehensive monthly performance and trend analysis',
    type: 'operational',
    format: 'html',
    icon: '📊',
    estimatedTime: '2 mins',
    sections: ['Performance Metrics', 'Trend Analysis', 'Comparative Data', 'Forecasting'],
    aiPowered: true
  }
];

const EnhancedReportsView: React.FC<EnhancedReportsViewProps> = ({
  project,
  user,
  assessmentItems,
  risks,
  controls,
  vendors
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredTemplates = selectedType === 'all'
    ? reportTemplates
    : reportTemplates.filter(template => template.type === selectedType);

  const handleGenerateReport = async (template: ReportTemplate) => {
    setIsGenerating(true);
    setSelectedTemplate(template);

    // Simulate report generation
    setTimeout(() => {
      const newReport = {
        id: Date.now().toString(),
        template,
        generatedAt: new Date(),
        generatedBy: user.name,
        status: 'completed',
        downloadUrl: '#',
        data: generateReportData(template)
      };

      setGeneratedReports(prev => [newReport, ...prev]);
      setIsGenerating(false);
      setSelectedTemplate(null);
    }, 2000 + Math.random() * 3000);
  };

  const generateReportData = (template: ReportTemplate) => {
    // Generate sample data based on template type
    const compliantCount = assessmentItems.filter(item => item.status === 'Compliant').length;
    const complianceRate = ((compliantCount / assessmentItems.length) * 100).toFixed(1);
    const riskCounts = {
      critical: risks.filter(r => r.level === 'Critical').length,
      high: risks.filter(r => r.level === 'High').length,
      medium: risks.filter(r => r.level === 'Medium').length,
      low: risks.filter(r => r.level === 'Low').length
    };

    return {
      projectName: project.name,
      complianceRate,
      riskCounts,
      vendorCount: vendors.length,
      controlCount: controls.size,
      generationTime: new Date().toISOString()
    };
  };

  const getTypeColor = (type: ReportTemplate['type']) => {
    switch (type) {
      case 'executive': return 'bg-purple-600';
      case 'operational': return 'bg-blue-600';
      case 'regulatory': return 'bg-green-600';
      case 'vendor': return 'bg-orange-600';
      case 'project': return 'bg-indigo-600';
      default: return 'bg-gray-600';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return '📄';
      case 'pptx': return '📊';
      case 'xlsx': return '📈';
      case 'html': return '🌐';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
          <p className="text-slate-400 mt-1">Generate comprehensive GRC reports with AI-powered insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Reports</option>
            <option value="executive">Executive</option>
            <option value="operational">Operational</option>
            <option value="regulatory">Regulatory</option>
            <option value="vendor">Vendor</option>
            <option value="project">Project</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{generatedReports.length}</div>
          <div className="text-sm text-slate-400">Reports Generated</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {((assessmentItems.filter(item => item.status === 'Compliant').length / assessmentItems.length) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-slate-400">Compliance Rate</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{risks.filter(r => r.status === 'Open').length}</div>
          <div className="text-sm text-slate-400">Open Risks</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{vendors.length}</div>
          <div className="text-sm text-slate-400">Active Vendors</div>
        </div>
      </div>

      {/* Report Templates */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Report Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-all hover:bg-slate-700/70"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <h4 className="font-medium text-white text-sm">{template.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${getTypeColor(template.type)}`}>
                        {template.type}
                      </span>
                      <span className="text-xs text-slate-400">{getFormatIcon(template.format)} {template.format.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                {template.aiPowered && (
                  <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full font-semibold">
                    AI
                  </span>
                )}
              </div>

              <p className="text-slate-300 text-xs mb-3">{template.description}</p>

              <div className="space-y-2 mb-4">
                <div className="text-xs text-slate-400">Includes:</div>
                <div className="flex flex-wrap gap-1">
                  {template.sections.slice(0, 3).map((section, index) => (
                    <span key={index} className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded">
                      {section}
                    </span>
                  ))}
                  {template.sections.length > 3 && (
                    <span className="text-xs text-slate-400">+{template.sections.length - 3} more</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Est. {template.estimatedTime}</span>
                <button
                  onClick={() => handleGenerateReport(template)}
                  disabled={isGenerating}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center space-x-1"
                >
                  <PlusCircleIcon className="w-3 h-3" />
                  <span>Generate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      {generatedReports.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Reports</h3>
          <div className="space-y-3">
            {generatedReports.slice(0, 5).map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{report.template.icon}</span>
                  <div>
                    <h4 className="font-medium text-white text-sm">{report.template.name}</h4>
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <span>Generated by {report.generatedBy}</span>
                      <span>•</span>
                      <span>{report.generatedAt.toLocaleDateString()}</span>
                      <span>•</span>
                      <span className={`px-2 py-1 rounded text-white ${getTypeColor(report.template.type)}`}>
                        {report.template.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-slate-400 hover:text-white p-1 rounded transition-colors">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button className="text-slate-400 hover:text-white p-1 rounded transition-colors">
                    <ArrowDownTrayIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generation Modal */}
      {isGenerating && selectedTemplate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-700">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-white mb-2">Generating Report</h3>
              <p className="text-slate-400 mb-4">{selectedTemplate.name}</p>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Analyzing data...</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-200"></div>
                  <span>Generating insights...</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-400"></div>
                  <span>Formatting report...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedReportsView;