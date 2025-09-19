import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Brain,
  Shield,
  FileText,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Eye,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import AIMonitoringService from '../../services/aiMonitoringService';
import AIRiskService from '../../services/aiRiskService';
import AIPolicyService from '../../services/aiPolicyService';
import AIVendorService from '../../services/aiVendorService';

interface AIServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'offline';
  lastUsed: Date;
  totalOperations: number;
  averageConfidence: number;
  errorRate: number;
}

const ComprehensiveAIDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'monitoring' | 'services' | 'audit'>('overview');
  const [performanceReport, setPerformanceReport] = useState<any>(null);
  const [aiServices, setAiServices] = useState<AIServiceStatus[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const monitoringService = AIMonitoringService.getInstance();
  const riskService = AIRiskService.getInstance();
  const policyService = AIPolicyService.getInstance();
  const vendorService = AIVendorService.getInstance();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load performance report
      const report = await monitoringService.generatePerformanceReport('day');
      setPerformanceReport(report);

      // Load active alerts
      const activeAlerts = monitoringService.getActiveAlerts();
      setAlerts(activeAlerts);

      // Mock service status data
      const serviceStatuses: AIServiceStatus[] = [
        {
          name: 'Risk Assessment AI',
          status: 'operational',
          lastUsed: new Date(Date.now() - 15 * 60 * 1000),
          totalOperations: 47,
          averageConfidence: 0.87,
          errorRate: 0.02
        },
        {
          name: 'Policy Analysis AI',
          status: 'operational',
          lastUsed: new Date(Date.now() - 8 * 60 * 1000),
          totalOperations: 23,
          averageConfidence: 0.91,
          errorRate: 0.00
        },
        {
          name: 'Vendor Risk AI',
          status: 'operational',
          lastUsed: new Date(Date.now() - 3 * 60 * 1000),
          totalOperations: 12,
          averageConfidence: 0.79,
          errorRate: 0.08
        },
        {
          name: 'Document Analysis AI',
          status: 'operational',
          lastUsed: new Date(Date.now() - 45 * 60 * 1000),
          totalOperations: 8,
          averageConfidence: 0.84,
          errorRate: 0.00
        }
      ];
      setAiServices(serviceStatuses);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      operational: 'bg-green-500/20 text-green-400 border-green-500/30',
      degraded: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      offline: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status as keyof typeof colors] || 'bg-slate-500/20 text-slate-400';
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* AI Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active AI Services</p>
                <p className="text-2xl font-bold text-green-400">
                  {aiServices.filter(s => s.status === 'operational').length}
                </p>
              </div>
              <Brain className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Daily Operations</p>
                <p className="text-2xl font-bold text-blue-400">
                  {performanceReport?.service_summary.total_requests || 0}
                </p>
              </div>
              <Zap className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Confidence</p>
                <p className="text-2xl font-bold text-purple-400">
                  {((performanceReport?.service_summary.average_confidence || 0) * 100).toFixed(0)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Alerts</p>
                <p className="text-2xl font-bold text-orange-400">
                  {alerts.length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Status Grid */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-200">
            <Brain className="w-5 h-5 mr-2 text-blue-400" />
            AI Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiServices.map((service, index) => (
              <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-200">{service.name}</h4>
                  <Badge className={`${getStatusBadge(service.status)} border`}>
                    {service.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Operations:</span>
                    <span className="text-slate-300">{service.totalOperations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confidence:</span>
                    <span className="text-slate-300">{(service.averageConfidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Error Rate:</span>
                    <span className={service.errorRate > 0.05 ? 'text-red-400' : 'text-green-400'}>
                      {(service.errorRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Used:</span>
                    <span className="text-slate-300">
                      {Math.round((Date.now() - service.lastUsed.getTime()) / 60000)}m ago
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-200">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-400" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <Alert key={index} className={`border-${
                  alert.severity === 'critical' ? 'red' :
                  alert.severity === 'high' ? 'orange' :
                  alert.severity === 'medium' ? 'yellow' : 'blue'
                }-500/50`}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold">{alert.message}</span>
                        <p className="text-sm text-slate-400 mt-1">
                          {alert.recommended_action}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        {alert.severity}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
              <Shield className="w-5 h-5" />
              <span className="text-xs">Risk Analysis</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
              <FileText className="w-5 h-5" />
              <span className="text-xs">Policy Review</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
              <Users className="w-5 h-5" />
              <span className="text-xs">Vendor Assessment</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
              <Eye className="w-5 h-5" />
              <span className="text-xs">Document Scan</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMonitoringTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-200">AI Performance Monitoring</h3>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {performanceReport && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm text-slate-200">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {(performanceReport.service_summary.success_rate * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-slate-400">
                {performanceReport.service_summary.total_requests} operations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm text-slate-200">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {(performanceReport.service_summary.average_duration / 1000).toFixed(1)}s
              </div>
              <p className="text-sm text-slate-400">Per operation</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm text-slate-200">Daily Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                ${performanceReport.service_summary.total_cost.toFixed(2)}
              </div>
              <p className="text-sm text-slate-400">AI operations</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">Quality Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {performanceReport && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-slate-200">
                  {(performanceReport.quality_metrics.hallucination_rate * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-slate-400">Hallucination Rate</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-200">
                  {(performanceReport.quality_metrics.review_rate * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-slate-400">Requires Review</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-200">
                  {performanceReport.usage_patterns.user_satisfaction.toFixed(1)}/5
                </div>
                <p className="text-sm text-slate-400">User Rating</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-200">
                  {performanceReport.usage_patterns.popular_operations.length}
                </div>
                <p className="text-sm text-slate-400">Active Operations</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {performanceReport?.recommendations.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {performanceReport.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start text-slate-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderServicesTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-200">AI Service Management</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Assessment Service */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-200">
              <Shield className="w-5 h-5 mr-2 text-red-400" />
              Risk Assessment AI
            </CardTitle>
            <CardDescription>
              AI-powered risk analysis with hallucination prevention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Status:</span>
                <Badge className="bg-green-500/20 text-green-400">Operational</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Confidence Score:</span>
                <span className="text-slate-300">87%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Accuracy Rate:</span>
                <span className="text-slate-300">94%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Hallucination Rate:</span>
                <span className="text-green-400">0.02%</span>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Policy Analysis Service */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-200">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              Policy Analysis AI
            </CardTitle>
            <CardDescription>
              Automated policy compliance and gap analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Status:</span>
                <Badge className="bg-green-500/20 text-green-400">Operational</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Confidence Score:</span>
                <span className="text-slate-300">91%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Framework Coverage:</span>
                <span className="text-slate-300">6 standards</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Error Rate:</span>
                <span className="text-green-400">0%</span>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vendor Risk Service */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-200">
              <Users className="w-5 h-5 mr-2 text-purple-400" />
              Vendor Risk AI
            </CardTitle>
            <CardDescription>
              Automated vendor risk assessment and due diligence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Status:</span>
                <Badge className="bg-green-500/20 text-green-400">Operational</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Confidence Score:</span>
                <span className="text-slate-300">79%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Risk Categories:</span>
                <span className="text-slate-300">5 assessed</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Review Rate:</span>
                <span className="text-yellow-400">15%</span>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Document Analysis Service */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-200">
              <Eye className="w-5 h-5 mr-2 text-green-400" />
              Document Analysis AI
            </CardTitle>
            <CardDescription>
              Intelligent document processing and compliance checking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Status:</span>
                <Badge className="bg-green-500/20 text-green-400">Operational</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Confidence Score:</span>
                <span className="text-slate-300">84%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Processing Speed:</span>
                <span className="text-slate-300">2.3s avg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Accuracy Rate:</span>
                <span className="text-green-400">97%</span>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAuditTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-200">AI Audit Trail</h3>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Audit Log
        </Button>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">Audit Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">98.5%</div>
              <p className="text-sm text-slate-400">Verified Operations</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">1.5%</div>
              <p className="text-sm text-slate-400">Require Review</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">847</div>
              <p className="text-sm text-slate-400">Total Operations</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">100%</div>
              <p className="text-sm text-slate-400">Audit Coverage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">Recent Audit Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { service: 'Risk Assessment', operation: 'analyze_threat', confidence: 0.94, time: '2 minutes ago', status: 'verified' },
              { service: 'Policy Analysis', operation: 'gap_analysis', confidence: 0.89, time: '8 minutes ago', status: 'verified' },
              { service: 'Vendor Risk', operation: 'risk_scoring', confidence: 0.67, time: '15 minutes ago', status: 'pending' },
              { service: 'Document Analysis', operation: 'compliance_check', confidence: 0.91, time: '22 minutes ago', status: 'verified' }
            ].map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div>
                  <div className="font-medium text-slate-200">{entry.service}</div>
                  <div className="text-sm text-slate-400">{entry.operation}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-300">{(entry.confidence * 100).toFixed(0)}% confidence</div>
                  <div className="text-sm text-slate-400">{entry.time}</div>
                </div>
                <Badge className={entry.status === 'verified' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                  {entry.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-200">AI Management Dashboard</h1>
          <p className="text-slate-400">Monitor and manage AI-powered GRC capabilities</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={loadDashboardData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
            <TrendingUp className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="data-[state=active]:bg-slate-700">
            <Eye className="w-4 h-4 mr-2" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-slate-700">
            <Brain className="w-4 h-4 mr-2" />
            Services
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-slate-700">
            <Shield className="w-4 h-4 mr-2" />
            Audit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="monitoring">
          {renderMonitoringTab()}
        </TabsContent>

        <TabsContent value="services">
          {renderServicesTab()}
        </TabsContent>

        <TabsContent value="audit">
          {renderAuditTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveAIDashboard;