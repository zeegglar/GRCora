import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
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
  Area,
  AreaChart
} from 'recharts';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Plus,
  Calendar,
  Eye,
  Edit,
  Archive,
  Send,
  ThumbsUp,
  ThumbsDown,
  Settings
} from 'lucide-react';
import PolicyManagementService from '../../services/policyManagementService';
import type { Policy, ApprovalRequest } from '../../types/comprehensive';

interface PolicyDashboardProps {
  organizationId: string;
  userRole: string;
  userId: string;
}

interface PolicyMetrics {
  total_policies: number;
  pending_reviews: number;
  overdue_reviews: number;
  approval_rate: number;
  average_approval_time: number;
  policies_by_status: { [key: string]: number };
  policies_by_category: { [key: string]: number };
  review_metrics: {
    on_time: number;
    late: number;
    cancelled: number;
  };
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

const PolicyDashboard: React.FC<PolicyDashboardProps> = ({
  organizationId,
  userRole,
  userId
}) => {
  const [metrics, setMetrics] = useState<PolicyMetrics | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const policyService = PolicyManagementService.getInstance();

  useEffect(() => {
    loadPolicyData();
  }, [organizationId]);

  useEffect(() => {
    filterPolicies();
  }, [searchQuery, selectedCategory, selectedStatus]);

  const loadPolicyData = async () => {
    try {
      setLoading(true);

      // Load metrics
      const metricsData = await policyService.getPolicyMetrics(organizationId);
      setMetrics(metricsData);

      // Load policies
      const policiesData = await policyService.searchPolicies(organizationId, {});
      setPolicies(policiesData);

      // Load pending approvals
      const approvalsData = await policyService.getPendingApprovals(organizationId, userId);
      setPendingApprovals(approvalsData);

    } catch (error) {
      console.error('Error loading policy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPolicies = async () => {
    try {
      const searchParams: any = {};

      if (searchQuery) searchParams.query = searchQuery;
      if (selectedCategory !== 'all') searchParams.category = selectedCategory;
      if (selectedStatus !== 'all') searchParams.status = selectedStatus;

      const filteredPolicies = await policyService.searchPolicies(organizationId, searchParams);
      setPolicies(filteredPolicies);

    } catch (error) {
      console.error('Error filtering policies:', error);
    }
  };

  const handleApprovalAction = async (
    requestId: string,
    action: 'approve' | 'reject' | 'request_changes',
    comments?: string
  ) => {
    try {
      await policyService.processApproval(requestId, userId, action, comments);
      await loadPolicyData(); // Refresh data
    } catch (error) {
      console.error('Error processing approval:', error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'pending_approval': return 'secondary';
      case 'archived': return 'outline';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusData = () => {
    if (!metrics) return [];
    return Object.entries(metrics.policies_by_status).map(([status, count]) => ({
      name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count,
      color: getStatusColor(status)
    }));
  };

  const getCategoryData = () => {
    if (!metrics) return [];
    return Object.entries(metrics.policies_by_category).map(([category, count]) => ({
      name: category,
      value: count,
      color: Object.values(COLORS)[Object.keys(metrics.policies_by_category).indexOf(category) % Object.values(COLORS).length]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'draft': return COLORS.gray;
      case 'pending_approval': return COLORS.warning;
      case 'archived': return COLORS.info;
      case 'rejected': return COLORS.danger;
      default: return COLORS.gray;
    }
  };

  const getReviewMetricsData = () => {
    if (!metrics) return [];
    return [
      { name: 'On Time', value: metrics.review_metrics.on_time, color: COLORS.success },
      { name: 'Late', value: metrics.review_metrics.late, color: COLORS.warning },
      { name: 'Cancelled', value: metrics.review_metrics.cancelled, color: COLORS.danger }
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Policy Dashboard...</p>
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
            Policy Management
          </h1>
          <p className="text-gray-600">
            Comprehensive policy lifecycle management with approval workflows
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Policy
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {metrics && metrics.overdue_reviews > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Overdue Reviews</AlertTitle>
          <AlertDescription>
            {metrics.overdue_reviews} policies have overdue reviews requiring immediate attention.
            <Button variant="link" className="p-0 ml-2 h-auto">
              View overdue policies →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Policies</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.total_policies || 0}
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
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.pending_reviews || 0}
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
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.overdue_reviews || 0}
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
                <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.approval_rate || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Approval</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.average_approval_time || 0}d
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Policy Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Status Distribution</CardTitle>
                <CardDescription>
                  Current status breakdown of all policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={getStatusData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {getStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {getStatusData().map((status) => (
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

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Policies by Category</CardTitle>
                <CardDescription>
                  Distribution of policies across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={getCategoryData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill={COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Review Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Review Performance</CardTitle>
              <CardDescription>
                Policy review completion metrics and timeliness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                {getReviewMetricsData().map((metric) => (
                  <div key={metric.name} className="text-center">
                    <div
                      className="text-3xl font-bold mb-2"
                      style={{ color: metric.color }}
                    >
                      {metric.value}%
                    </div>
                    <div className="text-sm text-gray-600">{metric.name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search policies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Policy List */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Library</CardTitle>
              <CardDescription>
                Comprehensive list of organizational policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policies.map((policy) => (
                  <div
                    key={policy.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">{policy.title}</h4>
                        <Badge variant={getStatusBadgeVariant(policy.status)}>
                          {policy.status?.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">{policy.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{policy.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Version: {policy.current_version || '1.0'}</span>
                        <span>Last Updated: {new Date(policy.updated_at).toLocaleDateString()}</span>
                        <span>Owner: {policy.owner_name || 'Unassigned'}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Policies requiring your review and approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-gray-600">No pending approvals</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((approval) => (
                    <div
                      key={approval.id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {approval.policies?.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Version {approval.policy_versions?.version_number} • {approval.policies?.category}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {approval.current_stage?.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="text-sm text-gray-600 mb-4">
                        <p>Due: {new Date(approval.due_date).toLocaleDateString()}</p>
                        <p>Workflow: {approval.approval_workflows?.workflow_name}</p>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprovalAction(approval.id, 'approve')}
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprovalAction(approval.id, 'request_changes')}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Request Changes
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleApprovalAction(approval.id, 'reject')}
                        >
                          <ThumbsDown className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and insights into policy management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-600">
                Advanced policy analytics dashboard would be implemented here with metrics on policy effectiveness, compliance coverage, approval workflow efficiency, and usage patterns.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PolicyDashboard;