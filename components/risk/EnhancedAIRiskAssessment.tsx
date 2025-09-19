import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Brain,
  AlertTriangle,
  Shield,
  TrendingUp,
  CheckCircle,
  Clock,
  FileText,
  Sparkles,
  AlertCircle,
  Target,
  Settings
} from 'lucide-react';
import AIRiskService from '../../services/aiRiskService';
import type { Risk, RiskLevel } from '../../types';

interface AIRiskAssessmentProps {
  onRiskCreated: (risk: Risk) => void;
  organizationContext: {
    industry: string;
    size: 'small' | 'medium' | 'large';
    regulatory_requirements: string[];
    existing_controls: string[];
  };
}

interface AIAnalysisResult {
  risk_score: number;
  confidence: 'high' | 'medium' | 'low';
  ai_assessment: string;
  recommended_controls: string[];
  likelihood_factors: string[];
  impact_factors: string[];
  citations: any[];
  requires_review: boolean;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center space-x-2 text-slate-400">
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span>AI Analysis in Progress...</span>
  </div>
);

const ConfidenceBadge: React.FC<{ confidence: 'high' | 'medium' | 'low' }> = ({ confidence }) => {
  const colors = {
    high: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <Badge className={`${colors[confidence]} border`}>
      {confidence.toUpperCase()} CONFIDENCE
    </Badge>
  );
};

const RiskScoreIndicator: React.FC<{ score: number; confidence: string }> = ({ score, confidence }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getScoreLevel = (score: number): RiskLevel => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
        {score}
      </div>
      <div>
        <div className={`font-semibold ${getScoreColor(score)}`}>
          {getScoreLevel(score)} Risk
        </div>
        <div className="text-sm text-slate-400">
          AI-Generated Score
        </div>
      </div>
    </div>
  );
};

const EnhancedAIRiskAssessment: React.FC<AIRiskAssessmentProps> = ({
  onRiskCreated,
  organizationContext
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'input' | 'analysis' | 'review' | 'treatment'>('input');

  // Form State
  const [riskTitle, setRiskTitle] = useState('');
  const [riskDescription, setRiskDescription] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [treatmentPlan, setTreatmentPlan] = useState<any>(null);
  const [error, setError] = useState('');
  const [humanReview, setHumanReview] = useState('');

  const aiRiskService = AIRiskService.getInstance();

  const handleAIAnalysis = async () => {
    if (!riskDescription.trim()) {
      setError('Please provide a risk description');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      console.log('🧠 Starting AI risk analysis...');

      const result = await aiRiskService.analyzeRiskWithAI(
        riskDescription,
        organizationContext
      );

      setAiAnalysis(result);
      setCurrentStep('analysis');

      console.log('✅ AI analysis completed:', {
        score: result.risk_score,
        confidence: result.confidence,
        requiresReview: result.requires_review
      });

    } catch (err: any) {
      console.error('❌ AI analysis failed:', err);
      setError('AI analysis failed: ' + (err.message || 'Service unavailable'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateTreatmentPlan = async () => {
    if (!aiAnalysis) return;

    setIsAnalyzing(true);
    try {
      const mockRisk: Risk = {
        id: `temp-${Date.now()}`,
        title: riskTitle,
        description: riskDescription,
        level: aiAnalysis.risk_score >= 80 ? 'Critical' :
               aiAnalysis.risk_score >= 60 ? 'High' :
               aiAnalysis.risk_score >= 40 ? 'Medium' : 'Low',
        status: 'Open',
        controlId: '',
        likelihood: Math.round(aiAnalysis.risk_score / 20),
        impact: Math.round(aiAnalysis.risk_score / 20),
        mitigation: '',
        owner: '',
        dueDate: new Date()
      };

      const treatment = await aiRiskService.generateRiskTreatmentPlan(
        mockRisk,
        organizationContext
      );

      setTreatmentPlan(treatment);
      setCurrentStep('treatment');

    } catch (err: any) {
      setError('Treatment plan generation failed: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateRisk = () => {
    if (!aiAnalysis) return;

    const newRisk: Risk = {
      id: `risk-${Date.now()}`,
      title: riskTitle,
      description: riskDescription,
      level: aiAnalysis.risk_score >= 80 ? 'Critical' :
             aiAnalysis.risk_score >= 60 ? 'High' :
             aiAnalysis.risk_score >= 40 ? 'Medium' : 'Low',
      status: 'Open',
      controlId: '',
      likelihood: Math.round(aiAnalysis.risk_score / 20),
      impact: Math.round(aiAnalysis.risk_score / 20),
      mitigation: aiAnalysis.recommended_controls.join('; '),
      owner: '',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    };

    onRiskCreated(newRisk);

    // Reset form
    setIsOpen(false);
    setCurrentStep('input');
    setRiskTitle('');
    setRiskDescription('');
    setAiAnalysis(null);
    setTreatmentPlan(null);
    setError('');
    setHumanReview('');
  };

  const renderInputStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Risk Title
        </label>
        <Input
          value={riskTitle}
          onChange={(e) => setRiskTitle(e.target.value)}
          placeholder="Enter a brief risk title..."
          className="bg-slate-800 border-slate-700 text-slate-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Risk Description
        </label>
        <Textarea
          value={riskDescription}
          onChange={(e) => setRiskDescription(e.target.value)}
          placeholder="Describe the risk scenario, potential threats, and context..."
          rows={4}
          className="bg-slate-800 border-slate-700 text-slate-200"
        />
        <p className="text-xs text-slate-400 mt-1">
          Be specific about the threat, vulnerability, and potential impact
        </p>
      </div>

      <Alert>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          Our AI will analyze this risk using industry frameworks, threat intelligence,
          and your organization's context to provide scoring and recommendations.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button
          onClick={handleAIAnalysis}
          disabled={isAnalyzing || !riskDescription.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isAnalyzing ? <LoadingSpinner /> : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze with AI
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderAnalysisStep = () => {
    if (!aiAnalysis) return null;

    return (
      <div className="space-y-6">
        {/* Risk Score Header */}
        <div className="flex items-center justify-between">
          <RiskScoreIndicator score={aiAnalysis.risk_score} confidence={aiAnalysis.confidence} />
          <ConfidenceBadge confidence={aiAnalysis.confidence} />
        </div>

        {/* AI Assessment */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-200">
              <Brain className="w-5 h-5 mr-2 text-blue-400" />
              AI Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 leading-relaxed">
              {aiAnalysis.ai_assessment}
            </p>
          </CardContent>
        </Card>

        {/* Risk Factors */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-slate-800/30 border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm text-orange-400 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Likelihood Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {aiAnalysis.likelihood_factors.map((factor, index) => (
                  <li key={index} className="text-sm text-slate-300 flex items-start">
                    <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 mr-3 flex-shrink-0"></span>
                    {factor}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/30 border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm text-red-400 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Impact Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {aiAnalysis.impact_factors.map((factor, index) => (
                  <li key={index} className="text-sm text-slate-300 flex items-start">
                    <span className="w-2 h-2 rounded-full bg-red-400 mt-2 mr-3 flex-shrink-0"></span>
                    {factor}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Controls */}
        <Card className="bg-slate-800/30 border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm text-green-400 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Recommended Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {aiAnalysis.recommended_controls.map((control, index) => (
                <li key={index} className="text-sm text-slate-300 flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                  {control}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Citations */}
        {aiAnalysis.citations.length > 0 && (
          <Card className="bg-slate-800/30 border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm text-blue-400 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Source References
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {aiAnalysis.citations.map((citation, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{citation.source}</span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(citation.relevance_score * 100)}% relevance
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Required Warning */}
        {aiAnalysis.requires_review && (
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <Clock className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-400">
              This assessment requires human review due to {aiAnalysis.confidence} confidence level.
              Please verify the analysis before proceeding.
            </AlertDescription>
          </Alert>
        )}

        {/* Human Review Section */}
        {aiAnalysis.requires_review && (
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Human Review Notes (Optional)
            </label>
            <Textarea
              value={humanReview}
              onChange={(e) => setHumanReview(e.target.value)}
              placeholder="Add your expert review, corrections, or additional context..."
              rows={3}
              className="bg-slate-800 border-slate-700 text-slate-200"
            />
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setCurrentStep('input')}>
            Back to Input
          </Button>
          <div className="space-x-3">
            <Button
              variant="outline"
              onClick={handleGenerateTreatmentPlan}
              disabled={isAnalyzing}
            >
              <Target className="w-4 h-4 mr-2" />
              Treatment Plan
            </Button>
            <Button
              onClick={handleCreateRisk}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Risk
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderTreatmentStep = () => {
    if (!treatmentPlan) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-200">Risk Treatment Plan</h3>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 border">
            AI-Generated
          </Badge>
        </div>

        {/* Treatment Options */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-200">Treatment Options</h4>
          {treatmentPlan.treatment_options.map((option: any, index: number) => (
            <Card key={index} className="bg-slate-800/30 border-slate-700">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="capitalize">
                    {option.strategy}
                  </Badge>
                  <span className="text-sm text-slate-400">
                    Effectiveness: {option.effectiveness}/10
                  </span>
                </div>
                <p className="text-slate-300 mb-2">{option.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Cost: </span>
                    <span className="text-slate-300">{option.estimated_cost}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Timeline: </span>
                    <span className="text-slate-300">{option.timeline}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recommended Strategy */}
        <Card className="bg-green-500/10 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400 text-sm">Recommended Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">{treatmentPlan.recommended_strategy}</p>
          </CardContent>
        </Card>

        {/* Implementation Steps */}
        <div>
          <h4 className="font-medium text-slate-200 mb-3">Implementation Steps</h4>
          <ol className="space-y-2">
            {treatmentPlan.implementation_steps.map((step: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-slate-300">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setCurrentStep('analysis')}>
            Back to Analysis
          </Button>
          <Button
            onClick={handleCreateRisk}
            className="bg-green-600 hover:bg-green-700"
          >
            Create Risk with Treatment Plan
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Sparkles className="w-4 h-4 mr-2" />
          AI Risk Assessment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-200 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-400" />
            AI-Powered Risk Assessment
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Leverage artificial intelligence to analyze risks using industry frameworks and threat intelligence
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {currentStep === 'input' && renderInputStep()}
          {currentStep === 'analysis' && renderAnalysisStep()}
          {currentStep === 'treatment' && renderTreatmentStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAIRiskAssessment;