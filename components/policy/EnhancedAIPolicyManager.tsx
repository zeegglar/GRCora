import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  FileText,
  Sparkles,
  Brain,
  CheckCircle,
  AlertTriangle,
  Shield,
  Download,
  Upload,
  Search,
  Settings,
  Eye,
  Edit,
  Plus,
  Zap
} from 'lucide-react';
import AIPolicyService from '../../services/aiPolicyService';

interface Policy {
  id: string;
  title: string;
  content: string;
  framework: string[];
  status: 'draft' | 'approved' | 'under_review';
  version: string;
  last_updated: Date;
  created_by: string;
}

interface PolicyAnalysisResult {
  compliance_score: number;
  confidence: 'high' | 'medium' | 'low';
  gap_analysis: {
    strengths: string[];
    gaps: string[];
    recommendations: string[];
  };
  framework_alignment: Array<{
    framework: string;
    alignment_score: number;
    missing_requirements: string[];
  }>;
  requires_review: boolean;
}

interface OrganizationContext {
  name: string;
  industry: string;
  size: 'small' | 'medium' | 'large';
  regulatory_requirements: string[];
}

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center space-x-2 text-slate-400">
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span>AI Processing...</span>
  </div>
);

const ComplianceScoreIndicator: React.FC<{ score: number; confidence: string }> = ({ score, confidence }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Needs Work';
    return 'Poor';
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
        {score}%
      </div>
      <div>
        <div className={`font-semibold ${getScoreColor(score)}`}>
          {getScoreStatus(score)}
        </div>
        <div className="text-sm text-slate-400">
          {confidence} confidence
        </div>
      </div>
    </div>
  );
};

const FrameworkAlignmentCard: React.FC<{ alignment: any }> = ({ alignment }) => {
  const getAlignmentColor = (score: number) => {
    if (score >= 90) return 'border-green-500/50 bg-green-500/10';
    if (score >= 75) return 'border-yellow-500/50 bg-yellow-500/10';
    if (score >= 60) return 'border-orange-500/50 bg-orange-500/10';
    return 'border-red-500/50 bg-red-500/10';
  };

  return (
    <Card className={`${getAlignmentColor(alignment.alignment_score)} border`}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-slate-200">{alignment.framework}</h4>
          <Badge variant="outline">{alignment.alignment_score}%</Badge>
        </div>
        {alignment.missing_requirements.length > 0 && (
          <div>
            <p className="text-sm text-slate-400 mb-2">Missing Requirements:</p>
            <ul className="text-sm space-y-1">
              {alignment.missing_requirements.map((req: string, index: number) => (
                <li key={index} className="text-slate-300 flex items-start">
                  <span className="w-2 h-2 rounded-full bg-red-400 mt-2 mr-2 flex-shrink-0"></span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const EnhancedAIPolicyManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'generate' | 'manage'>('analyze');
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Analysis Tab State
  const [policyContent, setPolicyContent] = useState('');
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(['ISO 27001:2022']);
  const [analysisResult, setAnalysisResult] = useState<PolicyAnalysisResult | null>(null);

  // Generation Tab State
  const [policyType, setPolicyType] = useState('Information Security');
  const [organizationDetails, setOrganizationDetails] = useState<OrganizationContext>({
    name: 'Your Organization',
    industry: 'Technology',
    size: 'medium',
    regulatory_requirements: ['GDPR', 'SOX']
  });
  const [generatedPolicy, setGeneratedPolicy] = useState('');

  const [error, setError] = useState('');

  const aiPolicyService = AIPolicyService.getInstance();

  const availableFrameworks = [
    'ISO 27001:2022',
    'NIST Cybersecurity Framework',
    'SOC 2',
    'HIPAA',
    'GDPR',
    'PCI DSS'
  ];

  const policyTypes = [
    'Information Security',
    'Data Protection',
    'Access Control',
    'Incident Response',
    'Business Continuity',
    'Risk Management',
    'Vendor Management',
    'Acceptable Use'
  ];

  const handlePolicyAnalysis = async () => {
    if (!policyContent.trim()) {
      setError('Please provide policy content to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      console.log('🔍 Starting AI policy analysis...');

      const result = await aiPolicyService.analyzePolicyCompliance(
        policyContent,
        selectedFrameworks,
        {
          industry: organizationDetails.industry,
          size: organizationDetails.size,
          regulatory_requirements: organizationDetails.regulatory_requirements
        }
      );

      setAnalysisResult(result);

      console.log('✅ Policy analysis completed:', {
        score: result.compliance_score,
        confidence: result.confidence,
        requiresReview: result.requires_review
      });

    } catch (err: any) {
      console.error('❌ Policy analysis failed:', err);
      setError('Policy analysis failed: ' + (err.message || 'Service unavailable'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePolicyGeneration = async () => {
    setIsGenerating(true);
    setError('');

    try {
      console.log('📝 Starting AI policy generation...');

      const result = await aiPolicyService.generatePolicyFromTemplate(
        policyType,
        selectedFrameworks,
        organizationDetails
      );

      setGeneratedPolicy(result.generated_policy);

      console.log('✅ Policy generation completed');

    } catch (err: any) {
      console.error('❌ Policy generation failed:', err);
      setError('Policy generation failed: ' + (err.message || 'Service unavailable'));
    } finally {
      setIsGenerating(false);
    }
  };

  const renderAnalysisTab = () => (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-200">
            <Search className="w-5 h-5 mr-2 text-blue-400" />
            Policy Compliance Analysis
          </CardTitle>
          <CardDescription>
            Analyze your existing policies against compliance frameworks using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Target Frameworks
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableFrameworks.map(framework => (
                <label key={framework} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFrameworks.includes(framework)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFrameworks([...selectedFrameworks, framework]);
                      } else {
                        setSelectedFrameworks(selectedFrameworks.filter(f => f !== framework));
                      }
                    }}
                    className="rounded border-slate-600 bg-slate-700 text-blue-500"
                  />
                  <span className="text-sm text-slate-300">{framework}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Policy Content
            </label>
            <Textarea
              value={policyContent}
              onChange={(e) => setPolicyContent(e.target.value)}
              placeholder="Paste your policy content here for AI analysis..."
              rows={8}
              className="bg-slate-800 border-slate-700 text-slate-200"
            />
          </div>

          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handlePolicyAnalysis}
            disabled={isAnalyzing || !policyContent.trim() || selectedFrameworks.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isAnalyzing ? <LoadingSpinner /> : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysisResult && (
        <div className="space-y-4">
          {/* Compliance Score */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-slate-200">
                <span>Compliance Score</span>
                <Badge className={`${
                  analysisResult.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
                  analysisResult.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                } border-0`}>
                  {analysisResult.confidence} confidence
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ComplianceScoreIndicator
                score={analysisResult.compliance_score}
                confidence={analysisResult.confidence}
              />
            </CardContent>
          </Card>

          {/* Framework Alignment */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200">Framework Alignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {analysisResult.framework_alignment.map((alignment, index) => (
                  <FrameworkAlignmentCard key={index} alignment={alignment} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gap Analysis */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Strengths */}
            <Card className="bg-green-500/10 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-400 text-sm flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisResult.gap_analysis.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-slate-300 flex items-start">
                      <span className="w-2 h-2 rounded-full bg-green-400 mt-2 mr-3 flex-shrink-0"></span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Gaps */}
            <Card className="bg-red-500/10 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400 text-sm flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Gaps Identified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisResult.gap_analysis.gaps.map((gap, index) => (
                    <li key={index} className="text-sm text-slate-300 flex items-start">
                      <span className="w-2 h-2 rounded-full bg-red-400 mt-2 mr-3 flex-shrink-0"></span>
                      {gap}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-blue-400 text-sm flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisResult.gap_analysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-slate-300 flex items-start">
                      <span className="w-2 h-2 rounded-full bg-blue-400 mt-2 mr-3 flex-shrink-0"></span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {analysisResult.requires_review && (
            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-400">
                This analysis requires human review due to {analysisResult.confidence} confidence level.
                Please verify the findings with a compliance expert.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );

  const renderGenerationTab = () => (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-200">
            <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
            AI Policy Generation
          </CardTitle>
          <CardDescription>
            Generate comprehensive policies using AI and industry frameworks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Policy Type
              </label>
              <Select value={policyType} onValueChange={setPolicyType}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {policyTypes.map(type => (
                    <SelectItem key={type} value={type} className="text-slate-200">
                      {type} Policy
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Organization Size
              </label>
              <Select
                value={organizationDetails.size}
                onValueChange={(value: 'small' | 'medium' | 'large') =>
                  setOrganizationDetails({...organizationDetails, size: value})
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="small" className="text-slate-200">Small (1-50 employees)</SelectItem>
                  <SelectItem value="medium" className="text-slate-200">Medium (51-500 employees)</SelectItem>
                  <SelectItem value="large" className="text-slate-200">Large (500+ employees)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Organization Name
              </label>
              <Input
                value={organizationDetails.name}
                onChange={(e) => setOrganizationDetails({
                  ...organizationDetails,
                  name: e.target.value
                })}
                className="bg-slate-800 border-slate-700 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Industry
              </label>
              <Select
                value={organizationDetails.industry}
                onValueChange={(value) =>
                  setOrganizationDetails({...organizationDetails, industry: value})
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="Technology" className="text-slate-200">Technology</SelectItem>
                  <SelectItem value="Healthcare" className="text-slate-200">Healthcare</SelectItem>
                  <SelectItem value="Financial Services" className="text-slate-200">Financial Services</SelectItem>
                  <SelectItem value="Manufacturing" className="text-slate-200">Manufacturing</SelectItem>
                  <SelectItem value="Retail" className="text-slate-200">Retail</SelectItem>
                  <SelectItem value="Government" className="text-slate-200">Government</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Target Frameworks
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableFrameworks.map(framework => (
                <label key={framework} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFrameworks.includes(framework)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFrameworks([...selectedFrameworks, framework]);
                      } else {
                        setSelectedFrameworks(selectedFrameworks.filter(f => f !== framework));
                      }
                    }}
                    className="rounded border-slate-600 bg-slate-700 text-purple-500"
                  />
                  <span className="text-sm text-slate-300">{framework}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handlePolicyGeneration}
            disabled={isGenerating || selectedFrameworks.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? <LoadingSpinner /> : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Policy with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedPolicy && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-slate-200">
              <span>Generated Policy</span>
              <div className="space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 w-full">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                {generatedPolicy}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderManagementTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-200">Policy Library</h3>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          New Policy
        </Button>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <p className="text-center text-slate-400">
            Policy management features coming soon...
          </p>
          <p className="text-center text-slate-500 text-sm mt-2">
            This will include policy versioning, approval workflows, and automated compliance tracking.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">AI Policy Management</h2>
          <p className="text-slate-400">Analyze, generate, and manage policies with artificial intelligence</p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
          <TabsTrigger value="analyze" className="data-[state=active]:bg-slate-700">
            <Search className="w-4 h-4 mr-2" />
            Analyze
          </TabsTrigger>
          <TabsTrigger value="generate" className="data-[state=active]:bg-slate-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="manage" className="data-[state=active]:bg-slate-700">
            <FileText className="w-4 h-4 mr-2" />
            Manage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyze">
          {renderAnalysisTab()}
        </TabsContent>

        <TabsContent value="generate">
          {renderGenerationTab()}
        </TabsContent>

        <TabsContent value="manage">
          {renderManagementTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAIPolicyManager;