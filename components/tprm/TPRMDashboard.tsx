import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
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
  Area,
  AreaChart
} from 'recharts';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Shield,
  Building,
  FileText,
  Calendar
} from 'lucide-react';
import TPRMService from '../../services/tprmService';
import type { VendorTier, VendorAssessment } from '../../types/comprehensive';

interface TPRMDashboardProps {
  organizationId: string;
  userRole: string;
}

interface TPRMMetrics {
  total_vendors: number;
  by_tier: { [key: string]: number };
  by_risk_level: { [key: string]: number };
  overdue_assessments: number;
  portfolio_risk_score: number;
  monthly_trend: Array<{
    month: string;
    new_vendors: number;
    assessments_completed: number;
    risk_score: number;
  }>;
}

const COLORS = {
  tier1: '#22c55e',
  tier2: '#3b82f6',
  tier3: '#f59e0b',
  tier4: '#ef4444',
  Low: '#22c55e',
  Medium: '#f59e0b',
  High: '#f97316',
  Critical: '#ef4444'
};

const TPRMDashboard: React.FC<TPRMDashboardProps> = ({
  organizationId,
  userRole
}) => {
  const [metrics, setMetrics] = useState<TPRMMetrics | null>(null);
  const [highRiskVendors, setHighRiskVendors] = useState([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const tprmService = TPRMService.getInstance();

  useEffect(() => {
    loadTPRMData();
  }, [organizationId]);

  const loadTPRMData = async () => {
    try {
      setLoading(true);
      const report = await tprmService.generateTPRMReport(organizationId);

      setMetrics({
        ...report.summary,
        portfolio_risk_score: calculatePortfolioRiskScore(report.summary),
        monthly_trend: generateMockTrend() // In real implementation, fetch from database
      });

      setHighRiskVendors(report.high_risk_vendors);
      setRecommendations(report.recommendations);
    } catch (error) {
      console.error('Error loading TPRM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePortfolioRiskScore = (summary: any): number => {
    if (summary.total_vendors === 0) return 0;

    const weights = { Critical: 0, High: 25, Medium: 70, Low: 95 };
    const totalScore = Object.entries(summary.by_risk_level).reduce((sum, [level, count]) => {
      return sum + (weights[level] * (count as number));
    }, 0);

    return Math.round(totalScore / summary.total_vendors);
  };

  const generateMockTrend = () => [
    { month: 'Jan', new_vendors: 12, assessments_completed: 45, risk_score: 72 },
    { month: 'Feb', new_vendors: 8, assessments_completed: 38, risk_score: 74 },
    { month: 'Mar', new_vendors: 15, assessments_completed: 52, risk_score: 76 },
    { month: 'Apr', new_vendors: 10, assessments_completed: 41, risk_score: 78 },
    { month: 'May', new_vendors: 18, assessments_completed: 67, risk_score: 75 },
    { month: 'Jun', new_vendors: 14, assessments_completed: 58, risk_score: 77 }
  ];

  const getTierData = () => {
    if (!metrics) return [];
    return Object.entries(metrics.by_tier).map(([tier, count]) => ({
      name: tier.toUpperCase(),
      value: count,
      color: COLORS[tier]
    }));
  };

  const getRiskLevelData = () => {
    if (!metrics) return [];
    return Object.entries(metrics.by_risk_level).map(([level, count]) => ({
      name: level,
      value: count,
      color: COLORS[level]
    }));
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'Critical': return 'destructive';
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading TPRM Dashboard...</p>
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
            Third-Party Risk Management
          </h1>
          <p className="text-gray-600">
            Comprehensive vendor risk assessment and portfolio management
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Users className="w-4 h-4 mr-2" />
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.total_vendors || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Portfolio Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.portfolio_risk_score || 0}
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
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(metrics?.by_risk_level.High || 0) + (metrics?.by_risk_level.Critical || 0)}
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
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.overdue_assessments || 0}
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
                <p className="text-sm font-medium text-gray-600">Tier 1</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.by_tier.tier1 || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {recommendations.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {recommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="text-sm">{rec}</li>
              ))}
            </ul>
            {recommendations.length > 3 && (
              <p className="text-sm text-blue-600 mt-2 cursor-pointer">
                View all {recommendations.length} recommendations →
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vendor Tier Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Vendor Tier Distribution</CardTitle>
                <CardDescription>
                  Breakdown of vendors by risk tier classification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={getTierData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {getTierData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {getTierData().map((tier) => (
                    <div key={tier.name} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: tier.color }}
                      />
                      <span className="text-sm">
                        {tier.name}: {tier.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Level Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Level Distribution</CardTitle>
                <CardDescription>
                  Current risk levels across vendor portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={getRiskLevelData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Risk Trend</CardTitle>
              <CardDescription>
                6-month trend of portfolio risk score and assessment activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metrics?.monthly_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="risk_score"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="assessments_completed"
                    stroke="#10b981"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          {/* High Risk Vendors */}
          <Card>
            <CardHeader>
              <CardTitle>High Risk Vendors Requiring Attention</CardTitle>
              <CardDescription>
                Vendors with High or Critical risk levels need immediate review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {highRiskVendors.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-gray-600">No high-risk vendors found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {highRiskVendors.map((vendor) => (
                    <div
                      key={vendor.vendor_id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Vendor {vendor.vendor_id}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Risk Score: {vendor.risk_score}
                          </p>
                        </div>
                        <Badge variant={getRiskBadgeVariant(vendor.risk_level)}>
                          {vendor.risk_level}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button size="sm">
                          Assess Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Schedule</CardTitle>
              <CardDescription>
                Upcoming and overdue vendor assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-600">
                Assessment scheduling interface would be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Analytics</CardTitle>
              <CardDescription>
                Deep dive into vendor portfolio metrics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-600">
                Advanced analytics dashboard would be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TPRMDashboard;