import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  RadioGroup,
  RadioGroupItem,
} from '../ui/radio-group';
import {
  CheckCircle,
  AlertTriangle,
  Upload,
  FileText,
  Save,
  Send,
  Clock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import TPRMService from '../../services/tprmService';

interface Question {
  id: string;
  category: 'security' | 'financial' | 'operational' | 'compliance' | 'reputation';
  question_text: string;
  question_type: 'multiple_choice' | 'yes_no' | 'numeric' | 'text' | 'file_upload';
  options?: string[];
  weight: number;
  required: boolean;
  help_text?: string;
}

interface VendorAssessmentFormProps {
  vendorId: string;
  organizationId: string;
  assessmentId?: string;
  onComplete: (results: any) => void;
  onCancel: () => void;
}

const VendorAssessmentForm: React.FC<VendorAssessmentFormProps> = ({
  vendorId,
  organizationId,
  assessmentId,
  onComplete,
  onCancel
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<{ [key: string]: any }>({});
  const [currentSection, setCurrentSection] = useState('security');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const tprmService = TPRMService.getInstance();

  const sections = [
    { id: 'security', label: 'Security & Privacy', icon: '🔒' },
    { id: 'financial', label: 'Financial Stability', icon: '💰' },
    { id: 'operational', label: 'Operational Resilience', icon: '⚙️' },
    { id: 'compliance', label: 'Regulatory Compliance', icon: '📋' },
    { id: 'reputation', label: 'Reputation & ESG', icon: '🌟' }
  ];

  useEffect(() => {
    loadQuestions();
    if (assessmentId) {
      loadExistingResponses();
    }
  }, []);

  useEffect(() => {
    calculateProgress();
  }, [responses, questions]);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('tprm_questions')
        .select('*')
        .order('category', { ascending: true })
        .order('weight', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_responses')
        .select('*')
        .eq('assessment_id', assessmentId);

      if (error) throw error;

      const responseMap = {};
      data?.forEach(response => {
        responseMap[response.question_id] = {
          answer: response.answer,
          score: response.score,
          evidence_url: response.evidence_url,
          notes: response.notes
        };
      });

      setResponses(responseMap);
    } catch (error) {
      console.error('Error loading existing responses:', error);
    }
  };

  const calculateProgress = () => {
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(responses).length;
    setProgress(totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0);
  };

  const handleResponseChange = (questionId: string, field: string, value: any) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const currentResponse = responses[questionId] || {};
    const updatedResponse = {
      ...currentResponse,
      [field]: value
    };

    // Calculate score based on response
    if (field === 'answer') {
      updatedResponse.score = calculateQuestionScore(question, value);
    }

    setResponses(prev => ({
      ...prev,
      [questionId]: updatedResponse
    }));
  };

  const calculateQuestionScore = (question: Question, answer: any): number => {
    switch (question.question_type) {
      case 'yes_no':
        return answer === 'yes' ? 100 : 0;

      case 'multiple_choice':
        // Score based on position in options (first option = 100, last = 0)
        const optionIndex = question.options?.indexOf(answer) || 0;
        const totalOptions = question.options?.length || 1;
        return Math.round(((totalOptions - optionIndex - 1) / (totalOptions - 1)) * 100);

      case 'numeric':
        // Score based on value (implementation depends on question context)
        return Math.min(Math.max(parseInt(answer) || 0, 0), 100);

      default:
        return 50; // Default neutral score for text responses
    }
  };

  const validateSection = (sectionId: string): boolean => {
    const sectionQuestions = questions.filter(q => q.category === sectionId && q.required);
    const errors = [];

    sectionQuestions.forEach(question => {
      const response = responses[question.id];
      if (!response || !response.answer) {
        errors.push(`${question.question_text} is required`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const saveAssessment = async (status: 'draft' | 'submitted') => {
    try {
      setSaving(true);

      // Create or update assessment
      let currentAssessmentId = assessmentId;

      if (!currentAssessmentId) {
        const { data: assessment, error: assessmentError } = await supabase
          .from('vendor_assessments')
          .insert({
            vendor_id: vendorId,
            organization_id: organizationId,
            assessment_type: 'comprehensive',
            status: status,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (assessmentError) throw assessmentError;
        currentAssessmentId = assessment.id;
      } else {
        const { error: updateError } = await supabase
          .from('vendor_assessments')
          .update({
            status: status,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentAssessmentId);

        if (updateError) throw updateError;
      }

      // Save responses
      const responseData = Object.entries(responses).map(([questionId, response]) => ({
        assessment_id: currentAssessmentId,
        question_id: questionId,
        answer: response.answer,
        score: response.score || 0,
        evidence_url: response.evidence_url,
        notes: response.notes
      }));

      const { error: responseError } = await supabase
        .from('vendor_responses')
        .upsert(responseData);

      if (responseError) throw responseError;

      // If submitted, calculate vendor risk profile
      if (status === 'submitted') {
        const riskProfile = await tprmService.assessVendor(vendorId, organizationId);
        onComplete(riskProfile);
      }

    } catch (error) {
      console.error('Error saving assessment:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderQuestion = (question: Question) => {
    const response = responses[question.id] || {};

    return (
      <Card key={question.id} className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">
                {question.question_text}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </CardTitle>
              {question.help_text && (
                <CardDescription className="mt-2">
                  {question.help_text}
                </CardDescription>
              )}
            </div>
            <Badge variant="outline" className="ml-4">
              Weight: {question.weight}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Answer Input */}
          {question.question_type === 'yes_no' && (
            <RadioGroup
              value={response.answer || ''}
              onValueChange={(value) => handleResponseChange(question.id, 'answer', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                <Label htmlFor={`${question.id}-yes`}>Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id={`${question.id}-no`} />
                <Label htmlFor={`${question.id}-no`}>No</Label>
              </div>
            </RadioGroup>
          )}

          {question.question_type === 'multiple_choice' && (
            <Select
              value={response.answer || ''}
              onValueChange={(value) => handleResponseChange(question.id, 'answer', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {question.question_type === 'numeric' && (
            <Input
              type="number"
              value={response.answer || ''}
              onChange={(e) => handleResponseChange(question.id, 'answer', e.target.value)}
              placeholder="Enter numeric value..."
            />
          )}

          {question.question_type === 'text' && (
            <Textarea
              value={response.answer || ''}
              onChange={(e) => handleResponseChange(question.id, 'answer', e.target.value)}
              placeholder="Enter your response..."
              rows={3}
            />
          )}

          {question.question_type === 'file_upload' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Evidence
                </Button>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor={`${question.id}-notes`}>Additional Notes</Label>
            <Textarea
              id={`${question.id}-notes`}
              value={response.notes || ''}
              onChange={(e) => handleResponseChange(question.id, 'notes', e.target.value)}
              placeholder="Add any additional context or notes..."
              rows={2}
            />
          </div>

          {/* Score Display */}
          {response.score !== undefined && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Score:</span>
              <Badge variant={response.score >= 70 ? 'default' : 'destructive'}>
                {response.score}/100
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const getSectionQuestions = (sectionId: string) => {
    return questions.filter(q => q.category === sectionId);
  };

  const getSectionProgress = (sectionId: string) => {
    const sectionQuestions = getSectionQuestions(sectionId);
    const answeredQuestions = sectionQuestions.filter(q => responses[q.id]?.answer);
    return sectionQuestions.length > 0 ? (answeredQuestions.length / sectionQuestions.length) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Vendor Risk Assessment
          </h1>
          <p className="text-gray-600">
            Comprehensive third-party risk evaluation
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => saveAssessment('draft')}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={() => saveAssessment('submitted')}
            disabled={saving || progress < 100}
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Assessment
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">Please address the following issues:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Assessment Sections */}
      <Tabs value={currentSection} onValueChange={setCurrentSection}>
        <TabsList className="grid w-full grid-cols-5">
          {sections.map((section) => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className="flex flex-col items-center space-y-1"
            >
              <span>{section.icon}</span>
              <span className="text-xs">{section.label}</span>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-blue-600 h-1 rounded-full transition-all"
                  style={{ width: `${getSectionProgress(section.id)}%` }}
                />
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>{section.icon}</span>
                  <span>{section.label}</span>
                </CardTitle>
                <CardDescription>
                  Complete all questions in this section to proceed
                </CardDescription>
              </CardHeader>
            </Card>

            {getSectionQuestions(section.id).map(renderQuestion)}

            {/* Section Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === currentSection);
                  if (currentIndex > 0) {
                    setCurrentSection(sections[currentIndex - 1].id);
                  }
                }}
                disabled={sections[0].id === currentSection}
              >
                Previous Section
              </Button>
              <Button
                onClick={() => {
                  if (validateSection(currentSection)) {
                    const currentIndex = sections.findIndex(s => s.id === currentSection);
                    if (currentIndex < sections.length - 1) {
                      setCurrentSection(sections[currentIndex + 1].id);
                    }
                  }
                }}
                disabled={sections[sections.length - 1].id === currentSection}
              >
                Next Section
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default VendorAssessmentForm;