import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Users,
  DollarSign,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Building,
  FileText,
  Settings
} from 'lucide-react';

interface ExecutiveDashboardProps {
  organizationId: string;
  userRole: 'ceo' | 'ciso' | 'cfo' | 'coo' | 'board_member';
  timeframe: '30d' | '90d' | '1y';
}

interface ExecutiveKPIs {
  overall_risk_score: number;
  compliance_percentage: number;
  incidents_ytd: number;
  budget_utilization: number;
  audit_readiness: number;
  vendor_risk_exposure: number;
  policy_compliance: number;
  training_completion: number;
  trend_data: {
    risk_score_trend: Array<{ period: string; score: number; target: number }>;
    compliance_trend: Array<{ period: string; percentage: number; target: number }>;
    incident_trend: Array<{ period: string; count: number; severity: string }>;
    budget_trend: Array<{ period: string; spent: number; allocated: number }>;
  };
  risk_by_category: Array<{ category: string; score: number; change: number }>;
  top_risks: Array<{
    id: string;
    title: string;
    inherent_risk: number;
    residual_risk: number;
    treatment_status: string;
    owner: string;
  }>;
  compliance_frameworks: Array<{
    framework: string;
    percentage: number;
    gaps: number;
    next_audit: string;
  }>;
  portfolio_health: {
    active_projects: number;
    on_track: number;
    at_risk: number;
    overdue: number;
  };
}

const COLORS = {
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6'
};

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  organizationId,
  userRole,
  timeframe
}) => {
  const [kpis, setKPIs] = useState<ExecutiveKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadExecutiveKPIs();

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(loadExecutiveKPIs, 5 * 60 * 1000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [organizationId, timeframe]);

  const loadExecutiveKPIs = async () => {
    try {
      setLoading(true);

      // Mock data - would fetch from comprehensive analytics service
      const mockKPIs: ExecutiveKPIs = {
        overall_risk_score: 73,
        compliance_percentage: 87,
        incidents_ytd: 12,
        budget_utilization: 68,
        audit_readiness: 82,
        vendor_risk_exposure: 45,
        policy_compliance: 91,
        training_completion: 76,
        trend_data: {
          risk_score_trend: [
            { period: 'Jan', score: 78, target: 75 },
            { period: 'Feb', score: 76, target: 75 },
            { period: 'Mar', score: 74, target: 75 },
            { period: 'Apr', score: 73, target: 75 },
            { period: 'May', score: 72, target: 75 },
            { period: 'Jun', score: 73, target: 75 }
          ],
          compliance_trend: [
            { period: 'Jan', percentage: 82, target: 90 },
            { period: 'Feb', percentage: 84, target: 90 },
            { period: 'Mar', percentage: 85, target: 90 },
            { period: 'Apr', percentage: 86, target: 90 },
            { period: 'May', percentage: 87, target: 90 },
            { period: 'Jun', percentage: 87, target: 90 }
          ],
          incident_trend: [
            { period: 'Q1', count: 4, severity: 'medium' },
            { period: 'Q2', count: 8, severity: 'low' },
            { period: 'Q3', count: 0, severity: 'high' },
            { period: 'Q4', count: 0, severity: 'critical' }
          ],
          budget_trend: [
            { period: 'Q1', spent: 450000, allocated: 600000 },
            { period: 'Q2', spent: 890000, allocated: 1200000 },
            { period: 'Q3', spent: 1200000, allocated: 1800000 },
            { period: 'Q4', spent: 1360000, allocated: 2000000 }
          ]
        },
        risk_by_category: [
          { category: 'Cyber Security', score: 75, change: -3 },
          { category: 'Operational', score: 68, change: +2 },
          { category: 'Financial', score: 82, change: -1 },
          { category: 'Regulatory', score: 71, change: +5 },
          { category: 'Strategic', score: 77, change: 0 },
          { category: 'Reputational', score: 69, change: -2 }
        ],
        top_risks: [
          {
            id: 'RISK-001',
            title: 'Third-party data breach exposure',
            inherent_risk: 85,
            residual_risk: 45,
            treatment_status: 'in_progress',
            owner: 'CISO'
          },
          {
            id: 'RISK-002',
            title: 'Regulatory compliance gaps',
            inherent_risk: 78,
            residual_risk: 52,
            treatment_status: 'planned',
            owner: 'Legal'
          },
          {
            id: 'RISK-003',
            title: 'Cloud infrastructure vulnerabilities',
            inherent_risk: 72,
            residual_risk: 38,
            treatment_status: 'implemented',
            owner: 'CTO'
          }
        ],
        compliance_frameworks: [
          { framework: 'ISO 27001', percentage: 87, gaps: 13, next_audit: '2024-09-15' },
          { framework: 'SOC 2', percentage: 91, gaps: 7, next_audit: '2024-11-30' },
          { framework: 'GDPR', percentage: 83, gaps: 18, next_audit: '2025-01-20' },
          { framework: 'HIPAA', percentage: 89, gaps: 9, next_audit: '2024-12-10' }
        ],
        portfolio_health: {
          active_projects: 24,
          on_track: 18,
          at_risk: 4,
          overdue: 2
        }
      };

      setKPIs(mockKPIs);
    } catch (error) {
      console.error('Error loading executive KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return COLORS.danger;
    if (score >= 60) return COLORS.warning;
    if (score >= 40) return COLORS.info;
    return COLORS.success;
  };

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return COLORS.success;
    if (percentage >= 80) return COLORS.info;
    if (percentage >= 70) return COLORS.warning;
    return COLORS.danger;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-red-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-green-600" />;
    return <div className="w-4 h-4" />; // Neutral
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'implemented': return 'default';
      case 'in_progress': return 'secondary';
      case 'planned': return 'outline';
      default: return 'destructive';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRoleSpecificTitle = () => {
    const titles = {
      ceo: 'CEO Risk & Compliance Overview',
      ciso: 'CISO Security Dashboard',
      cfo: 'CFO Risk & Budget Overview',
      coo: 'COO Operational Risk Dashboard',
      board_member: 'Board Risk Summary'
    };
    return titles[userRole] || 'Executive Dashboard';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Executive Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!kpis) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getRoleSpecificTitle()}
          </h1>
          <p className="text-gray-600">
            Real-time organizational risk and compliance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            Last updated: {new Date().toLocaleTimeString()}
          </Badge>
          <Button variant="outline" onClick={loadExecutiveKPIs}>
            <Settings className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {kpis.overall_risk_score > 75 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Risk Score Above Threshold</AlertTitle>
          <AlertDescription>
            Overall organizational risk score is {kpis.overall_risk_score}, exceeding the target of 75.
            Immediate attention required on high-priority risks.
          </AlertDescription>
        </Alert>
      )}

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Risk Score */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8" style={{ color: getRiskScoreColor(kpis.overall_risk_score) }} />
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Overall Risk Score</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-900">
                    {kpis.overall_risk_score}
                  </p>
                  <Badge variant="outline">Target: ≤75</Badge>
                </div>
                <Progress
                  value={kpis.overall_risk_score}
                  className="mt-2"
                  style={{
                    backgroundColor: '#f3f4f6',
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Percentage */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8" style={{ color: getComplianceColor(kpis.compliance_percentage) }} />
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-900">
                    {kpis.compliance_percentage}%
                  </p>
                  <Badge variant="outline">Target: ≥90%</Badge>
                </div>
                <Progress
                  value={kpis.compliance_percentage}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Incidents YTD */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Incidents YTD</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-900">
                    {kpis.incidents_ytd}
                  </p>
                  <Badge variant={kpis.incidents_ytd > 15 ? 'destructive' : 'default'}>
                    Target: ≤15
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {kpis.incidents_ytd > 15 ? 'Above target' : 'Within target'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Readiness */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600" />
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Audit Readiness</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-900">
                    {kpis.audit_readiness}%
                  </p>
                  <Badge variant="outline">Target: ≥85%</Badge>
                </div>
                <Progress
                  value={kpis.audit_readiness}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Score Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Score Trend</CardTitle>
            <CardDescription>6-month risk score progression vs target</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={kpis.trend_data.risk_score_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis domain={[60, 85]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke={COLORS.warning}
                  fill={COLORS.warning}
                  fillOpacity={0.3}
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Compliance Framework Status */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Framework Status</CardTitle>
            <CardDescription>Current compliance percentages by framework</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpis.compliance_frameworks.map((framework) => (
                <div key={framework.framework}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{framework.framework}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{framework.percentage}%</span>
                      <Badge variant="outline" className="text-xs">
                        {framework.gaps} gaps
                      </Badge>
                    </div>
                  </div>
                  <Progress value={framework.percentage} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    Next audit: {new Date(framework.next_audit).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Risk by Category</CardTitle>
            <CardDescription>Current risk scores and trends by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpis.risk_by_category.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium w-24">{category.category}</span>
                    {getTrendIcon(category.change)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24">
                      <Progress value={category.score} className="h-2" />
                    </div>
                    <span className="text-sm font-medium w-8">{category.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Security Budget Utilization</CardTitle>
            <CardDescription>Quarterly spend vs allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={kpis.trend_data.budget_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={(value) => `$${value / 1000}K`} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="allocated" fill={COLORS.info} opacity={0.7} />
                <Bar dataKey="spent" fill={COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm font-medium">Current Utilization:</span>
              <Badge variant="outline">{kpis.budget_utilization}%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Risks and Portfolio Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Risks */}
        <Card>
          <CardHeader>
            <CardTitle>Top Strategic Risks</CardTitle>
            <CardDescription>Highest priority risks requiring executive attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpis.top_risks.map((risk) => (
                <div key={risk.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{risk.title}</h4>
                    <Badge variant={getStatusBadgeVariant(risk.treatment_status)}>
                      {risk.treatment_status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-600">Inherent:</span>
                      <span className="ml-2 font-medium">{risk.inherent_risk}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Residual:</span>
                      <span className="ml-2 font-medium">{risk.residual_risk}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    Owner: {risk.owner}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Health */}
        <Card>
          <CardHeader>
            <CardTitle>Project Portfolio Health</CardTitle>
            <CardDescription>Current status of active GRC projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{kpis.portfolio_health.active_projects}</div>
                <div className="text-sm text-gray-600">Active Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{kpis.portfolio_health.on_track}</div>
                <div className="text-sm text-gray-600">On Track</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{kpis.portfolio_health.at_risk}</div>
                <div className="text-sm text-gray-600">At Risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{kpis.portfolio_health.overdue}</div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={150}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="90%"
                data={[
                  { name: 'On Track', value: (kpis.portfolio_health.on_track / kpis.portfolio_health.active_projects) * 100, fill: COLORS.success },
                  { name: 'At Risk', value: (kpis.portfolio_health.at_risk / kpis.portfolio_health.active_projects) * 100, fill: COLORS.warning },
                  { name: 'Overdue', value: (kpis.portfolio_health.overdue / kpis.portfolio_health.active_projects) * 100, fill: COLORS.danger }
                ]}
              >
                <RadialBar dataKey="value" cornerRadius={5} />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;