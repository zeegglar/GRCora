import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  ClipboardCheck,
  AlertTriangle,
  TrendingUp,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Settings,
  PlayCircle
} from 'lucide-react';
import ControlTestingService from '../../services/controlTestingService';
import type { ControlTest, MaturityAssessment, ControlGap } from '../../types/comprehensive';

interface ControlTestingDashboardProps {
  projectId: string;
  framework: string;
  userRole: string;
}

interface TestMetrics {
  total_tests: number;
  completed_tests: number;
  passed_tests: number;
  failed_tests: number;
  pending_tests: number;
  overall_pass_rate: number;
  maturity_score: number;
  total_gaps: number;
}

const COLORS = {
  passed: '#22c55e',
  failed: '#ef4444',
  pending: '#f59e0b',
  exception: '#f97316',
  not_tested: '#6b7280'
};

const MATURITY_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#22c55e'];

const ControlTestingDashboard: React.FC<ControlTestingDashboardProps> = ({
  projectId,
  framework,
  userRole
}) => {
  const [metrics, setMetrics] = useState<TestMetrics | null>(null);
  const [maturityAssessment, setMaturityAssessment] = useState<MaturityAssessment | null>(null);
  const [gaps, setGaps] = useState<ControlGap[]>([]);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const controlTestingService = ControlTestingService.getInstance();

  useEffect(() => {
    loadControlTestingData();
  }, [projectId, framework]);

  const loadControlTestingData = async () => {
    try {
      setLoading(true);

      // Load test metrics
      const metricsData = await loadTestMetrics();
      setMetrics(metricsData);

      // Load maturity assessment
      const maturity = await controlTestingService.assessControlMaturity(projectId, framework);
      setMaturityAssessment(maturity);

      // Load gap analysis
      const gapReport = await controlTestingService.generateGapAnalysisReport(projectId);
      setGaps(gapReport.critical_gaps);

      // Load test results for charts
      const resultsData = await loadTestResultsData();
      setTestResults(resultsData);

    } catch (error) {
      console.error('Error loading control testing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTestMetrics = async (): Promise<TestMetrics> => {
    // Mock implementation - would fetch from database
    return {
      total_tests: 145,
      completed_tests: 132,
      passed_tests: 118,
      failed_tests: 14,
      pending_tests: 13,
      overall_pass_rate: 89.4,
      maturity_score: 78,
      total_gaps: 27
    };
  };

  const loadTestResultsData = async () => {
    // Mock data for charts
    return [
      { family: 'Organizational', passed: 25, failed: 3, pending: 2, maturity: 4.2 },
      { family: 'People', passed: 18, failed: 2, pending: 1, maturity: 3.8 },
      { family: 'Physical', passed: 22, failed: 1, pending: 2, maturity: 4.5 },
      { family: 'Technological', passed: 35, failed: 5, pending: 3, maturity: 3.5 },
      { family: 'Supplier', passed: 18, failed: 3, pending: 5, maturity: 3.2 }
    ];
  };

  const generateTestPlan = async () => {
    try {
      await controlTestingService.generateTestPlan(projectId, framework, 'full');
      await loadControlTestingData(); // Refresh data
    } catch (error) {
      console.error('Error generating test plan:', error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'passed': return 'default';
      case 'failed': return 'destructive';
      case 'pending': return 'secondary';
      case 'exception': return 'destructive';
      default: return 'outline';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getMaturityRadarData = () => {
    if (!testResults) return [];

    return testResults.map(item => ({
      family: item.family,
      maturity: item.maturity,
      fullMark: 5
    }));
  };

  const getTestStatusData = () => {
    if (!metrics) return [];

    return [
      { name: 'Passed', value: metrics.passed_tests, color: COLORS.passed },
      { name: 'Failed', value: metrics.failed_tests, color: COLORS.failed },
      { name: 'Pending', value: metrics.pending_tests, color: COLORS.pending }
    ];
  };

  const getMaturityLevelName = (level: number): string => {
    const levels = ['', 'Initial', 'Managed', 'Defined', 'Quantitatively Managed', 'Optimizing'];
    return levels[level] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Control Testing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Control Testing & Maturity Assessment
          </h1>
          <p className="text-gray-600">
            {framework} framework testing and gap analysis for project
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={generateTestPlan}>
            <PlayCircle className="w-4 h-4 mr-2" />
            Generate Test Plan
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ClipboardCheck className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.total_tests || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.overall_pass_rate.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Maturity Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.maturity_score || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Control Gaps</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.total_gaps || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.pending_tests || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maturity Level Alert */}
      {maturityAssessment && (
        <Alert>
          <Target className="h-4 w-4" />
          <AlertTitle>Current Maturity Level</AlertTitle>
          <AlertDescription>
            Your organization is at <strong>Level {maturityAssessment.overall_maturity_level}: {getMaturityLevelName(maturityAssessment.overall_maturity_level)}</strong> with a score of {maturityAssessment.overall_maturity_score}/100.
            {maturityAssessment.overall_maturity_level < 4 && (
              <span className="block mt-2">
                Focus on standardizing processes and implementing metrics to advance to the next maturity level.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="testing">Testing Results</TabsTrigger>
          <TabsTrigger value="maturity">Maturity Assessment</TabsTrigger>
          <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Test Status Distribution</CardTitle>
                <CardDescription>
                  Current status of all control tests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={getTestStatusData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {getTestStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {getTestStatusData().map((status) => (
                    <div key={status.name} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-sm">
                        {status.name}: {status.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Control Family Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Control Family Performance</CardTitle>
                <CardDescription>
                  Test results by control family
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={testResults}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="family" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="passed" stackId="a" fill={COLORS.passed} />
                    <Bar dataKey="failed" stackId="a" fill={COLORS.failed} />
                    <Bar dataKey="pending" stackId="a" fill={COLORS.pending} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Testing Progress</CardTitle>
              <CardDescription>
                Overall progress of control testing activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Completed Tests</span>
                    <span>{metrics?.completed_tests}/{metrics?.total_tests}</span>
                  </div>
                  <Progress
                    value={metrics ? (metrics.completed_tests / metrics.total_tests) * 100 : 0}
                    className="mt-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Pass Rate</span>
                    <span>{metrics?.overall_pass_rate.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={metrics?.overall_pass_rate || 0}
                    className="mt-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Maturity Score</span>
                    <span>{metrics?.maturity_score}/100</span>
                  </div>
                  <Progress
                    value={metrics?.maturity_score || 0}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Execution Results</CardTitle>
              <CardDescription>
                Detailed view of individual control test results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-600">
                Test execution interface would be implemented here with detailed test results,
                evidence management, and deficiency tracking.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maturity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Maturity Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Maturity Assessment by Family</CardTitle>
                <CardDescription>
                  Control family maturity levels (1-5 scale)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={getMaturityRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="family" />
                    <PolarRadiusAxis domain={[0, 5]} />
                    <Radar
                      name="Maturity"
                      dataKey="maturity"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Maturity Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Maturity Level Summary</CardTitle>
                <CardDescription>
                  Current maturity characteristics and next steps
                </CardDescription>
              </CardHeader>
              <CardContent>
                {maturityAssessment && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Overall Level:</span>
                      <Badge variant="outline">
                        Level {maturityAssessment.overall_maturity_level}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Score:</span>
                      <span>{maturityAssessment.overall_maturity_score}/100</span>
                    </div>
                    <div>
                      <span className="font-medium">Key Recommendations:</span>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {maturityAssessment.recommendations.slice(0, 3).map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-6">
          {/* Critical Gaps */}
          <Card>
            <CardHeader>
              <CardTitle>Critical Control Gaps</CardTitle>
              <CardDescription>
                High and critical severity gaps requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gaps.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-gray-600">No critical gaps identified</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gaps.map((gap, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900">
                            Control {gap.control_id}
                          </h4>
                          <Badge variant={getSeverityBadgeVariant(gap.severity)}>
                            {gap.severity}
                          </Badge>
                          <Badge variant="outline">
                            {gap.gap_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {gap.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {gap.remediation_effort} effort
                        </span>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ControlTestingDashboard;