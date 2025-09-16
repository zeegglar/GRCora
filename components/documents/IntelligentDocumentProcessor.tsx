import React, { useState, useCallback } from 'react';
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  CogIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  DownloadIcon,
  BrainIcon,
  CameraIcon,
  ColorSwatchIcon,
  UsersIcon
} from '../ui/Icons';

interface DocumentType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  processingTemplate: string;
  extractionFields: string[];
}

interface BrandAssets {
  logo?: File;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  documentTemplate: string;
}

interface ProcessingResult {
  documentType: string;
  extractedData: Record<string, any>;
  confidence: number;
  suggestedActions: string[];
  generatedContent?: string;
  risks?: ExtractedRisk[];
  policies?: ExtractedPolicy[];
  controls?: ExtractedControl[];
}

interface ExtractedRisk {
  title: string;
  description: string;
  likelihood: string;
  impact: string;
  category: string;
  mitigation: string;
  confidence: number;
}

interface ExtractedPolicy {
  title: string;
  description: string;
  category: string;
  applicableFrameworks: string[];
  requirements: string[];
  confidence: number;
}

interface ExtractedControl {
  id: string;
  title: string;
  description: string;
  category: string;
  framework: string;
  implementationStatus: string;
  confidence: number;
}

const documentTypes: DocumentType[] = [
  {
    id: 'risk_register',
    name: 'Risk Register',
    icon: <ExclamationTriangleIcon className="w-6 h-6" />,
    description: 'Extract risks, likelihood, impact, and mitigation strategies',
    processingTemplate: 'risk_analysis',
    extractionFields: ['title', 'description', 'likelihood', 'impact', 'category', 'mitigation', 'owner']
  },
  {
    id: 'security_policy',
    name: 'Security Policies',
    icon: <DocumentTextIcon className="w-6 h-6" />,
    description: 'Parse policies, controls, and compliance requirements',
    processingTemplate: 'policy_analysis',
    extractionFields: ['policy_name', 'description', 'controls', 'requirements', 'frameworks']
  },
  {
    id: 'audit_report',
    name: 'Audit Reports',
    icon: <CheckCircleIcon className="w-6 h-6" />,
    description: 'Extract findings, recommendations, and compliance gaps',
    processingTemplate: 'audit_analysis',
    extractionFields: ['findings', 'recommendations', 'compliance_status', 'gaps', 'evidence']
  },
  {
    id: 'vendor_assessment',
    name: 'Vendor Assessments',
    icon: <UsersIcon className="w-6 h-6" />,
    description: 'Analyze vendor security questionnaires and certifications',
    processingTemplate: 'vendor_analysis',
    extractionFields: ['vendor_info', 'certifications', 'security_measures', 'risk_level']
  },
  {
    id: 'existing_documentation',
    name: 'Existing Documentation',
    icon: <BrainIcon className="w-6 h-6" />,
    description: 'Learn from client\'s existing format, style, and branding',
    processingTemplate: 'format_learning',
    extractionFields: ['structure', 'formatting', 'terminology', 'branding_elements']
  }
];

interface IntelligentDocumentProcessorProps {
  clientId: string;
  projectId: string;
  onProcessingComplete: (results: ProcessingResult[]) => void;
}

const IntelligentDocumentProcessor: React.FC<IntelligentDocumentProcessorProps> = ({
  clientId,
  projectId,
  onProcessingComplete
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [brandAssets, setBrandAssets] = useState<BrandAssets>({
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    fontFamily: 'Inter',
    documentTemplate: 'professional'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResults, setProcessingResults] = useState<ProcessingResult[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'brand' | 'process' | 'results'>('upload');

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  }, []);

  const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBrandAssets(prev => ({
        ...prev,
        logo: file,
        logoUrl: URL.createObjectURL(file)
      }));
    }
  }, []);

  const processDocuments = async () => {
    if (!selectedFiles.length || !selectedDocType) return;

    setIsProcessing(true);
    setCurrentStep('process');

    try {
      // Mock AI processing - in real implementation, this would call your RAG service
      const results: ProcessingResult[] = [];

      for (const file of selectedFiles) {
        // Simulate document processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        const mockResult: ProcessingResult = {
          documentType: selectedDocType,
          extractedData: generateMockExtractedData(selectedDocType, file.name),
          confidence: Math.random() * 0.3 + 0.7, // 70-100%
          suggestedActions: generateMockActions(selectedDocType),
          ...(selectedDocType === 'risk_register' && {
            risks: generateMockRisks()
          }),
          ...(selectedDocType === 'security_policy' && {
            policies: generateMockPolicies()
          })
        };

        results.push(mockResult);
      }

      setProcessingResults(results);
      setCurrentStep('results');
      onProcessingComplete(results);
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMockExtractedData = (docType: string, fileName: string): Record<string, any> => {
    switch (docType) {
      case 'risk_register':
        return {
          totalRisks: Math.floor(Math.random() * 20) + 5,
          criticalRisks: Math.floor(Math.random() * 5) + 1,
          categories: ['Cybersecurity', 'Operational', 'Compliance', 'Financial'],
          lastUpdated: new Date().toISOString(),
          fileName
        };
      case 'security_policy':
        return {
          totalPolicies: Math.floor(Math.random() * 15) + 3,
          frameworks: ['ISO 27001', 'SOC 2', 'NIST CSF'],
          controls: Math.floor(Math.random() * 50) + 20,
          fileName
        };
      default:
        return { fileName, processed: true };
    }
  };

  const generateMockActions = (docType: string): string[] => {
    const actions = {
      risk_register: [
        'Import 12 high-priority risks into risk management system',
        'Schedule review meetings for 3 critical risks',
        'Update risk treatment plans based on extracted mitigation strategies',
        'Generate client-branded risk dashboard using extracted data'
      ],
      security_policy: [
        'Map extracted policies to SOC 2 requirements',
        'Identify 5 policy gaps against ISO 27001 standards',
        'Generate implementation timeline for missing controls',
        'Create policy review schedule with extracted owners'
      ],
      audit_report: [
        'Create remediation plan for 8 identified findings',
        'Track compliance improvements over time',
        'Generate management presentation with extracted insights'
      ]
    };
    return actions[docType as keyof typeof actions] || ['Document processed successfully'];
  };

  const generateMockRisks = (): ExtractedRisk[] => [
    {
      title: 'Data Breach via Unauthorized Access',
      description: 'Potential for unauthorized access to sensitive customer data through compromised credentials',
      likelihood: 'Medium',
      impact: 'High',
      category: 'Cybersecurity',
      mitigation: 'Implement MFA and regular access reviews',
      confidence: 0.92
    },
    {
      title: 'Vendor Security Incident',
      description: 'Third-party vendor experiencing security breach affecting our data',
      likelihood: 'Low',
      impact: 'High',
      category: 'Third Party',
      mitigation: 'Enhanced vendor security assessments and monitoring',
      confidence: 0.88
    }
  ];

  const generateMockPolicies = (): ExtractedPolicy[] => [
    {
      title: 'Access Control Policy',
      description: 'Defines procedures for granting, modifying, and revoking system access',
      category: 'Security',
      applicableFrameworks: ['ISO 27001', 'SOC 2'],
      requirements: ['Role-based access', 'Regular access reviews', 'Privileged access management'],
      confidence: 0.95
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
          <BrainIcon className="w-8 h-8 mr-3 text-blue-400" />
          Intelligent Document Processor
        </h2>
        <p className="text-slate-400">
          Upload client documents to extract data, learn their format, and generate branded deliverables
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between items-center mb-8">
        {[
          { id: 'upload', name: 'Upload Documents', icon: CloudArrowUpIcon },
          { id: 'brand', name: 'Brand Assets', icon: ColorSwatchIcon },
          { id: 'process', name: 'AI Processing', icon: CogIcon },
          { id: 'results', name: 'Results', icon: SparklesIcon }
        ].map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              currentStep === step.id
                ? 'bg-blue-600 text-white'
                : index < ['upload', 'brand', 'process', 'results'].indexOf(currentStep)
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-400'
            }`}>
              <step.icon className="w-5 h-5" />
            </div>
            <span className={`ml-2 text-sm ${
              currentStep === step.id ? 'text-blue-400' : 'text-slate-400'
            }`}>
              {step.name}
            </span>
            {index < 3 && <div className="w-16 h-0.5 bg-slate-700 mx-4" />}
          </div>
        ))}
      </div>

      {/* Step 1: Document Upload */}
      {currentStep === 'upload' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4">Select Document Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedDocType(type.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedDocType === type.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-blue-400">
                      {type.icon}
                    </div>
                    <h4 className="font-semibold text-white">{type.name}</h4>
                  </div>
                  <p className="text-sm text-slate-400">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4">Upload Files</h3>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
              <CloudArrowUpIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-white mb-2">Drag and drop files here, or click to browse</p>
              <p className="text-sm text-slate-400 mb-4">
                Supports PDF, Word, Excel, PowerPoint, and image files (up to 50MB each)
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors inline-block"
              >
                Choose Files
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-white mb-2">Selected Files:</h4>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="w-5 h-5 text-blue-400" />
                        <span className="text-white">{file.name}</span>
                        <span className="text-xs text-slate-400">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setCurrentStep('brand')}
              disabled={!selectedFiles.length || !selectedDocType}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Next: Brand Setup
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Brand Assets */}
      {currentStep === 'brand' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4">Client Brand Assets</h3>
            <p className="text-slate-400 mb-6">
              Configure client branding to generate documents that match their visual identity
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Logo Upload</label>
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center">
                    {brandAssets.logoUrl ? (
                      <div className="space-y-3">
                        <img
                          src={brandAssets.logoUrl}
                          alt="Client logo"
                          className="max-h-16 mx-auto"
                        />
                        <button
                          onClick={() => setBrandAssets(prev => ({ ...prev, logo: undefined, logoUrl: undefined }))}
                          className="text-sm text-red-400 hover:text-red-300"
                        >
                          Remove Logo
                        </button>
                      </div>
                    ) : (
                      <>
                        <CameraIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded cursor-pointer transition-colors inline-block"
                        >
                          Upload Logo
                        </label>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Primary Color</label>
                  <div className="flex space-x-3">
                    <input
                      type="color"
                      value={brandAssets.primaryColor}
                      onChange={(e) => setBrandAssets(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-12 h-10 border border-slate-600 rounded"
                    />
                    <input
                      type="text"
                      value={brandAssets.primaryColor}
                      onChange={(e) => setBrandAssets(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Secondary Color</label>
                  <div className="flex space-x-3">
                    <input
                      type="color"
                      value={brandAssets.secondaryColor}
                      onChange={(e) => setBrandAssets(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-12 h-10 border border-slate-600 rounded"
                    />
                    <input
                      type="text"
                      value={brandAssets.secondaryColor}
                      onChange={(e) => setBrandAssets(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Font Family</label>
                  <select
                    value={brandAssets.fontFamily}
                    onChange={(e) => setBrandAssets(prev => ({ ...prev, fontFamily: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                  >
                    <option value="Inter">Inter (Modern)</option>
                    <option value="Arial">Arial (Classic)</option>
                    <option value="Times New Roman">Times New Roman (Traditional)</option>
                    <option value="Calibri">Calibri (Professional)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Document Template</label>
                  <select
                    value={brandAssets.documentTemplate}
                    onChange={(e) => setBrandAssets(prev => ({ ...prev, documentTemplate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                  >
                    <option value="professional">Professional</option>
                    <option value="corporate">Corporate</option>
                    <option value="modern">Modern</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-800 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Preview</h4>
                  <div
                    className="p-4 rounded border-l-4"
                    style={{
                      backgroundColor: `${brandAssets.primaryColor}10`,
                      borderColor: brandAssets.primaryColor,
                      fontFamily: brandAssets.fontFamily
                    }}
                  >
                    <h5 className="font-semibold text-white mb-1">Sample Document Title</h5>
                    <p className="text-sm text-slate-300">
                      This is how your branded documents will appear with the selected theme.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep('upload')}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={processDocuments}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Process Documents
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Processing */}
      {currentStep === 'process' && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-6"></div>
          <h3 className="text-xl font-semibold text-white mb-2">Processing Documents...</h3>
          <p className="text-slate-400">
            AI is analyzing your documents and extracting structured data
          </p>
        </div>
      )}

      {/* Step 4: Results */}
      {currentStep === 'results' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <CheckCircleIcon className="w-6 h-6 text-green-400 mr-2" />
              Processing Complete
            </h3>

            {processingResults.map((result, index) => (
              <div key={index} className="mb-6 last:mb-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">
                    {selectedFiles[index]?.name}
                  </h4>
                  <span className="text-sm text-green-400">
                    {(result.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>

                <div className="bg-slate-800 rounded-lg p-4 mb-4">
                  <h5 className="font-medium text-white mb-2">Extracted Data:</h5>
                  <pre className="text-sm text-slate-300 overflow-x-auto">
                    {JSON.stringify(result.extractedData, null, 2)}
                  </pre>
                </div>

                <div className="mb-4">
                  <h5 className="font-medium text-white mb-2">Suggested Actions:</h5>
                  <ul className="space-y-1">
                    {result.suggestedActions.map((action, actionIndex) => (
                      <li key={actionIndex} className="text-sm text-slate-300 flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            <div className="flex justify-center space-x-4 pt-6 border-t border-slate-700">
              <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <DownloadIcon className="w-5 h-5" />
                <span>Export Results</span>
              </button>
              <button className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Import to Project</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligentDocumentProcessor;