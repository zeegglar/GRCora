import React, { useState } from 'react';
import { ReportGenerator, ReportData } from '../../services/reportGenerator';
import { supabaseApi } from '../../services/supabaseApi';
import type { Project, Organization, AssessmentItem, Risk, Control } from '../../types';
import {
  DocumentTextIcon,
  CloudArrowDownIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '../ui/Icons';

interface RealReportGeneratorProps {
  project: Project;
  organization: Organization;
  assessmentItems: AssessmentItem[];
  risks: Risk[];
  controls: Control[];
}

interface ReportOption {
  type: 'assessment' | 'executive_summary' | 'risk_register';
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

const reportOptions: ReportOption[] = [
  {
    type: 'assessment',
    title: 'Full Assessment Report',
    description: 'Comprehensive report with all control assessments, findings, and recommendations',
    icon: DocumentTextIcon,
    color: 'bg-blue-600'
  },
  {
    type: 'executive_summary',
    title: 'Executive Dashboard',
    description: 'High-level summary with KPIs and key findings for C-suite consumption',
    icon: ChartBarIcon,
    color: 'bg-emerald-600'
  },
  {
    type: 'risk_register',
    title: 'Risk Register',
    description: 'Detailed risk analysis with AI-powered insights and mitigation strategies',
    icon: ExclamationTriangleIcon,
    color: 'bg-red-600'
  }
];

const RealReportGenerator: React.FC<RealReportGeneratorProps> = ({
  project,
  organization,
  assessmentItems,
  risks,
  controls
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  const generateReport = async (reportType: 'assessment' | 'executive_summary' | 'risk_register') => {
    setIsGenerating(true);
    setGenerationStatus('Preparing data...');
    setError('');
    setDownloadUrl('');

    try {
      // Prepare report data
      const reportData: ReportData = {
        project,
        organization,
        assessmentItems,
        risks,
        controls,
        reportType
      };

      setGenerationStatus('Generating AI insights...');

      // Generate and save report
      const url = await ReportGenerator.generateAndSaveReport(reportData);

      setGenerationStatus('Report generated successfully!');
      setDownloadUrl(url);

      // Auto-download after a short delay
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportType}-${project.name}-${new Date().toISOString().split('T')[0]}.pdf`;
        link.click();
      }, 1000);

    } catch (err) {
      console.error('Report generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Generate Reports</h2>
        <p className="text-slate-400">
          Create professional, AI-enhanced reports for {organization.name} - {project.name}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-400">
            {assessmentItems.length}
          </div>
          <div className="text-sm text-slate-400">Total Controls</div>
        </div>
        <div className="glass-card p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-400">
            {assessmentItems.filter(a => a.status === 'Compliant').length}
          </div>
          <div className="text-sm text-slate-400">Compliant</div>
        </div>
        <div className="glass-card p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-400">
            {risks.filter(r => r.level === 'CRITICAL').length}
          </div>
          <div className="text-sm text-slate-400">Critical Risks</div>
        </div>
        <div className="glass-card p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-emerald-400">
            {Math.round((assessmentItems.filter(a => a.status === 'Compliant').length / assessmentItems.length) * 100)}%
          </div>
          <div className="text-sm text-slate-400">Compliance Rate</div>
        </div>
      </div>

      {/* Report Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportOptions.map((option) => {
          const IconComponent = option.icon;

          return (
            <div
              key={option.type}
              className="glass-card p-6 rounded-xl hover:ring-2 hover:ring-blue-500/50 transition-all"
            >
              <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center mb-4`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{option.title}</h3>
              <p className="text-sm text-slate-400 mb-4">{option.description}</p>

              <button
                onClick={() => generateReport(option.type)}
                disabled={isGenerating}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  isGenerating
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Generation Status */}
      {(isGenerating || generationStatus || error) && (
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Report Generation Status</h3>

          {isGenerating && (
            <div className="flex items-center space-x-3 mb-4">
              <div className="loading-spinner"></div>
              <span className="text-slate-300">{generationStatus}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          {downloadUrl && !isGenerating && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                <span className="text-green-400">Report generated successfully!</span>
              </div>
              <a
                href={downloadUrl}
                download
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <CloudArrowDownIcon className="h-4 w-4" />
                <span>Download PDF</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Features List */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Report Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <span className="text-slate-300">AI-powered executive summaries</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <span className="text-slate-300">Client-branded PDF output</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <span className="text-slate-300">Professional formatting</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <span className="text-slate-300">Compliance scoring</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <span className="text-slate-300">Risk trend analysis</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <span className="text-slate-300">Actionable recommendations</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <span className="text-slate-300">Real-time data integration</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <span className="text-slate-300">Secure cloud storage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealReportGenerator;