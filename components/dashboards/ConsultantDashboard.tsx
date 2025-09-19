import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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
  ScatterChart,
  Scatter
} from 'recharts';
import {
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Building,
  FileText,
  Calendar,
  Target,
  Briefcase,
  Star,
  Activity,
  Settings
} from 'lucide-react';

interface ConsultantDashboardProps {
  organizationId: string;
  userId: string;
  userRole: 'consultant_owner' | 'consultant_analyst' | 'consultant_manager';
}

interface ConsultantMetrics {
  portfolio: {
    total_clients: number;
    active_projects: number;
    revenue_ytd: number;
    utilization_rate: number;
    client_satisfaction: number;
    pipeline_value: number;
  };
  performance: {
    projects_completed: number;
    on_time_delivery: number;
    budget_performance: number;
    client_retention: number;
    repeat_business: number;
  };
  workload: {
    current_capacity: number;
    billable_hours_week: number;
    upcoming_deadlines: number;
    overdue_tasks: number;
  };
  client_portfolio: Array<{
    client_name: string;
    industry: string;
    relationship_health: number;
    revenue_contribution: number;
    projects_active: number;
    compliance_score: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    next_milestone: string;
  }>;
  revenue_trend: Array<{
    month: string;
    actual: number;
    target: number;
    forecast: number;
  }>;
  project_pipeline: Array<{
    id: string;
    client: string;
    type: string;
    value: number;
    probability: number;
    stage: string;
    expected_close: string;
  }>;
  task_distribution: Array<{
    category: string;
    hours: number;
    percentage: number;
  }>;
  team_performance: Array<{
    member: string;
    utilization: number;
    satisfaction: number;
    projects: number;
  }>;
}

const COLORS = {
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  gray: '#6b7280'
};

const ConsultantDashboard: React.FC<ConsultantDashboardProps> = ({
  organizationId,
  userId,
  userRole
}) => {
  const [metrics, setMetrics] = useState<ConsultantMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadConsultantMetrics();
  }, [organizationId, userId, timeframe]);

  const loadConsultantMetrics = async () => {
    try {
      setLoading(true);

      // Mock data - would fetch from analytics service
      const mockMetrics: ConsultantMetrics = {
        portfolio: {
          total_clients: 18,
          active_projects: 32,
          revenue_ytd: 2850000,
          utilization_rate: 78,
          client_satisfaction: 4.6,
          pipeline_value: 1200000
        },
        performance: {
          projects_completed: 47,
          on_time_delivery: 94,
          budget_performance: 102,
          client_retention: 89,
          repeat_business: 73
        },
        workload: {
          current_capacity: 85,
          billable_hours_week: 34,
          upcoming_deadlines: 8,
          overdue_tasks: 3
        },
        client_portfolio: [
          {
            client_name: 'TechFlow Industries',
            industry: 'Technology',
            relationship_health: 92,
            revenue_contribution: 18.5,
            projects_active: 3,
            compliance_score: 87,
            risk_level: 'low',
            next_milestone: '2024-10-15'
          },
          {
            client_name: 'Green Earth Foundation',
            industry: 'Healthcare',
            relationship_health: 88,
            revenue_contribution: 15.2,
            projects_active: 2,
            compliance_score: 73,
            risk_level: 'medium',
            next_milestone: '2024-09-30'
          },
          {
            client_name: 'Global Finance Corp',
            industry: 'Financial',
            relationship_health: 95,
            revenue_contribution: 22.1,
            projects_active: 4,
            compliance_score: 91,
            risk_level: 'low',
            next_milestone: '2024-11-01'
          },
          {
            client_name: 'Manufacturing Plus',
            industry: 'Manufacturing',
            relationship_health: 71,
            revenue_contribution: 8.3,
            projects_active: 1,
            compliance_score: 64,
            risk_level: 'high',
            next_milestone: '2024-09-25'
          }
        ],
        revenue_trend: [
          { month: 'Jan', actual: 450000, target: 400000, forecast: 420000 },
          { month: 'Feb', actual: 520000, target: 450000, forecast: 480000 },
          { month: 'Mar', actual: 480000, target: 450000, forecast: 460000 },
          { month: 'Apr', actual: 510000, target: 500000, forecast: 520000 },
          { month: 'May', actual: 485000, target: 500000, forecast: 500000 },
          { month: 'Jun', actual: 405000, target: 450000, forecast: 440000 }
        ],
        project_pipeline: [
          {
            id: 'PIPE-001',
            client: 'Enterprise Systems Ltd',
            type: 'ISO 27001 Assessment',
            value: 85000,
            probability: 85,
            stage: 'Proposal',
            expected_close: '2024-10-01'
          },
          {
            id: 'PIPE-002',
            client: 'Regional Bank Corp',
            type: 'SOC 2 Audit Prep',
            value: 120000,
            probability: 70,
            stage: 'Negotiation',
            expected_close: '2024-09-28'
          },
          {
            id: 'PIPE-003',
            client: 'HealthTech Solutions',
            type: 'HIPAA Compliance',
            value: 95000,
            probability: 90,
            stage: 'Contract',
            expected_close: '2024-09-22'
          }
        ],
        task_distribution: [
          { category: 'Client Assessments', hours: 120, percentage: 35 },
          { category: 'Report Writing', hours: 80, percentage: 23 },
          { category: 'Client Meetings', hours: 60, percentage: 17 },
          { category: 'Documentation', hours: 45, percentage: 13 },
          { category: 'Training/Research', hours: 25, percentage: 7 },
          { category: 'Admin Tasks', hours: 15, percentage: 5 }
        ],
        team_performance: [
          { member: 'Sarah Johnson', utilization: 82, satisfaction: 4.8, projects: 6 },
          { member: 'Mike Chen', utilization: 75, satisfaction: 4.6, projects: 4 },
          { member: 'Emily Rodriguez', utilization: 88, satisfaction: 4.7, projects: 7 },
          { member: 'David Kumar', utilization: 91, satisfaction: 4.5, projects: 8 }
        ]
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading consultant metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return COLORS.success;
      case 'medium': return COLORS.warning;
      case 'high': return COLORS.danger;
      case 'critical': return COLORS.danger;
      default: return COLORS.gray;
    }
  };

  const getRiskLevelBadge = (level: string) => {
    switch (level) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'outline';
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

  const getPipelineStageColor = (stage: string) => {
    switch (stage) {
      case 'Contract': return COLORS.success;
      case 'Negotiation': return COLORS.warning;
      case 'Proposal': return COLORS.info;
      default: return COLORS.gray;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Consultant Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Consultant Portfolio Dashboard
          </h1>
          <p className="text-gray-600">
            Portfolio performance, client health, and business metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button variant="outline" onClick={loadConsultantMetrics}>
            <Settings className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Workload Alert */}
      {metrics.workload.current_capacity > 90 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>High Capacity Utilization</AlertTitle>
          <AlertDescription>
            Current capacity is at {metrics.workload.current_capacity}%. Consider redistributing workload or declining new projects.
            {metrics.workload.overdue_tasks > 0 && ` You have ${metrics.workload.overdue_tasks} overdue tasks.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.portfolio.total_clients}
                </p>
                <p className="text-xs text-gray-500">
                  {metrics.portfolio.active_projects} projects
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue YTD</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics.portfolio.revenue_ytd)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(metrics.portfolio.pipeline_value)} pipeline
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utilization</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.portfolio.utilization_rate}%
                </p>
                <Progress value={metrics.portfolio.utilization_rate} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Client Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.portfolio.client_satisfaction}
                </p>
                <p className="text-xs text-gray-500">out of 5.0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Client Portfolio</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Performance</CardTitle>
                <CardDescription>Monthly actual vs target revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={metrics.revenue_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value / 1000}K`} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stroke={COLORS.gray}
                      fill={COLORS.gray}
                      fillOpacity={0.3}
                      strokeDasharray="5 5"
                    />
                    <Area
                      type="monotone"
                      dataKey="actual"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Task Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Time Allocation</CardTitle>
                <CardDescription>Hours distribution by task category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={metrics.task_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="hours"
                    >
                      {metrics.task_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} hours`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {metrics.task_distribution.map((task, index) => (
                    <div key={task.category} className="flex items-center text-xs">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: Object.values(COLORS)[index % Object.values(COLORS).length] }}
                      />
                      <span>{task.category}: {task.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>Current period performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{metrics.performance.projects_completed}</div>
                  <div className="text-sm text-gray-600">Projects Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{metrics.performance.on_time_delivery}%</div>
                  <div className="text-sm text-gray-600">On-Time Delivery</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{metrics.performance.budget_performance}%</div>
                  <div className="text-sm text-gray-600">Budget Performance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{metrics.performance.client_retention}%</div>
                  <div className="text-sm text-gray-600">Client Retention</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{metrics.performance.repeat_business}%</div>
                  <div className="text-sm text-gray-600">Repeat Business</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Portfolio Health</CardTitle>
              <CardDescription>Relationship health and revenue contribution by client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.client_portfolio.map((client) => (
                  <div key={client.client_name} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{client.client_name}</h4>
                        <p className="text-sm text-gray-600">{client.industry}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getRiskLevelBadge(client.risk_level)}>
                          {client.risk_level} risk
                        </Badge>
                        <Badge variant="outline">
                          {client.revenue_contribution}% revenue
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Health Score:</span>
                        <div className="flex items-center mt-1">
                          <Progress value={client.relationship_health} className="flex-1 h-2 mr-2" />
                          <span className="font-medium">{client.relationship_health}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Compliance:</span>
                        <div className="flex items-center mt-1">
                          <Progress value={client.compliance_score} className="flex-1 h-2 mr-2" />
                          <span className="font-medium">{client.compliance_score}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Active Projects:</span>
                        <div className="font-medium mt-1">{client.projects_active}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Next Milestone:</span>
                        <div className="font-medium mt-1">
                          {new Date(client.next_milestone).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Pipeline</CardTitle>
              <CardDescription>Opportunities in progress and forecasted revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.project_pipeline.map((opportunity) => (
                  <div key={opportunity.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{opportunity.client}</h4>
                        <p className="text-sm text-gray-600">{opportunity.type}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge style={{ backgroundColor: getPipelineStageColor(opportunity.stage) }}>
                          {opportunity.stage}
                        </Badge>
                        <Badge variant="outline">
                          {formatCurrency(opportunity.value)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Probability:</span>
                        <div className="flex items-center mt-1">
                          <Progress value={opportunity.probability} className="flex-1 h-2 mr-2" />
                          <span className="font-medium">{opportunity.probability}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Expected Value:</span>
                        <div className="font-medium mt-1">
                          {formatCurrency(opportunity.value * (opportunity.probability / 100))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Expected Close:</span>
                        <div className="font-medium mt-1">
                          {new Date(opportunity.expected_close).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {userRole === 'consultant_owner' && (
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>Individual team member metrics and utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.team_performance.map((member) => (
                    <div key={member.member} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{member.member}</h4>
                        <p className="text-sm text-gray-600">{member.projects} active projects</p>
                      </div>
                      <div className="grid grid-cols-2 gap-6 text-sm">
                        <div>
                          <span className="text-gray-600">Utilization:</span>
                          <div className="flex items-center mt-1">
                            <Progress value={member.utilization} className="w-20 h-2 mr-2" />
                            <span className="font-medium">{member.utilization}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Satisfaction:</span>
                          <div className="font-medium mt-1">{member.satisfaction}/5.0</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workload Analysis</CardTitle>
                <CardDescription>Current capacity and upcoming commitments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Current Capacity</span>
                      <span>{metrics.workload.current_capacity}%</span>
                    </div>
                    <Progress value={metrics.workload.current_capacity} />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{metrics.workload.billable_hours_week}</div>
                      <div className="text-sm text-gray-600">Billable Hours/Week</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{metrics.workload.upcoming_deadlines}</div>
                      <div className="text-sm text-gray-600">Upcoming Deadlines</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{metrics.workload.overdue_tasks}</div>
                      <div className="text-sm text-gray-600">Overdue Tasks</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Historical performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-600">
                  Performance trend charts would be implemented here with historical data on delivery times, budget performance, and client satisfaction over time.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConsultantDashboard;