import React, { useState, useEffect } from 'react';
import type { Vendor, VendorRiskAssessment, VendorContract, VendorIncident, View } from '../../../types';
import { VendorCriticality, VendorLifecycleStage, VendorRiskCategory } from '../../../types';
import { mockApi } from '../../../services/api';
import { useNotifications } from '../../context/NotificationContext';

interface TPRMReportsViewProps {
  projectId: string;
  setView: (view: View) => void;
}

interface RiskTrendData {
  month: string;
  lowRisk: number;
  mediumRisk: number;
  highRisk: number;
  criticalRisk: number;
}

const TPRMReportsView: React.FC<TPRMReportsViewProps> = ({ projectId, setView }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<VendorRiskAssessment[]>([]);
  const [contracts, setContracts] = useState<VendorContract[]>([]);
  const [incidents, setIncidents] = useState<VendorIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<'executive' | 'risk-assessment' | 'compliance' | 'financial'>('executive');
  const { addNotification } = useNotifications();

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        const vendorData = await mockApi.getVendors(projectId);
        setVendors(vendorData);

        const allRiskAssessments: VendorRiskAssessment[] = [];
        const allContracts: VendorContract[] = [];
        const allIncidents: VendorIncident[] = [];

        for (const vendor of vendorData) {
          const [riskData, contractData, incidentData] = await Promise.all([
            mockApi.getVendorRiskAssessments(vendor.id),
            mockApi.getVendorContracts(vendor.id),
            mockApi.getVendorIncidents(vendor.id)
          ]);
          allRiskAssessments.push(...riskData);
          allContracts.push(...contractData);
          allIncidents.push(...incidentData);
        }

        setRiskAssessments(allRiskAssessments);
        setContracts(allContracts);
        setIncidents(allIncidents);
      } catch (error) {
        console.error('Error fetching report data:', error);
        addNotification('Failed to load report data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [projectId, addNotification]);

  if (isLoading) {
    return <div className="p-8">Loading TPRM reports...</div>;
  }

  const getRiskLevelColor = (level: VendorCriticality) => {
    switch (level) {
      case VendorCriticality.LOW: return 'text-green-400';
      case VendorCriticality.MEDIUM: return 'text-yellow-400';
      case VendorCriticality.HIGH: return 'text-orange-400';
      case VendorCriticality.CRITICAL: return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getRiskLevelBg = (level: VendorCriticality) => {
    switch (level) {
      case VendorCriticality.LOW: return 'bg-green-600';
      case VendorCriticality.MEDIUM: return 'bg-yellow-600';
      case VendorCriticality.HIGH: return 'bg-orange-600';
      case VendorCriticality.CRITICAL: return 'bg-red-600';
      default: return 'bg-slate-600';
    }
  };

  // Calculate report metrics
  const totalSpend = vendors.reduce((sum, vendor) => sum + vendor.annualSpend, 0);
  const averageRiskScore = vendors.length > 0 ? Math.round(vendors.reduce((sum, vendor) => sum + vendor.overallRiskScore, 0) / vendors.length) : 0;

  const riskDistribution = vendors.reduce((acc, vendor) => {
    acc[vendor.riskLevel] = (acc[vendor.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<VendorCriticality, number>);

  const lifecycleDistribution = vendors.reduce((acc, vendor) => {
    acc[vendor.status] = (acc[vendor.status] || 0) + 1;
    return acc;
  }, {} as Record<VendorLifecycleStage, number>);

  const tierDistribution = vendors.reduce((acc, vendor) => {
    acc[vendor.tier] = (acc[vendor.tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const incidentsByMonth = incidents.reduce((acc, incident) => {
    const month = new Date(incident.reportedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const contractsExpiring = contracts.filter(c => {
    const endDate = new Date(c.endDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 365 && daysUntilExpiry > 0;
  }).sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

  // Risk category analysis
  const riskCategoryAverages = riskAssessments.reduce((acc, assessment) => {
    Object.entries(assessment.categories).forEach(([category, data]) => {
      if (!acc[category as VendorRiskCategory]) {
        acc[category as VendorRiskCategory] = { total: 0, count: 0 };
      }
      acc[category as VendorRiskCategory].total += data.score;
      acc[category as VendorRiskCategory].count += 1;
    });
    return acc;
  }, {} as Record<VendorRiskCategory, { total: number; count: number }>);

  const categoryAverages = Object.entries(riskCategoryAverages).map(([category, data]) => ({
    category: category as VendorRiskCategory,
    average: Math.round(data.total / data.count)
  }));

  const exportToCSV = (reportType: string) => {
    let csvContent = '';

    if (reportType === 'vendor-summary') {
      csvContent = 'Vendor Name,Risk Level,Risk Score,Tier,Status,Annual Spend,Next Review\n';
      vendors.forEach(vendor => {
        csvContent += `"${vendor.name}","${vendor.riskLevel}",${vendor.overallRiskScore},"${vendor.tier}","${vendor.status}",${vendor.annualSpend},"${vendor.nextReviewDate}"\n`;
      });
    } else if (reportType === 'risk-assessments') {
      csvContent = 'Vendor Name,Assessment Date,Overall Score,Risk Level,Operational,Financial,Compliance,Security,Reputation\n';
      riskAssessments.forEach(assessment => {
        const vendor = vendors.find(v => v.id === assessment.vendorId);
        const categories = assessment.categories;
        csvContent += `"${vendor?.name || assessment.vendorId}","${assessment.assessmentDate}",${assessment.overallRiskScore},"${assessment.riskLevel}",${categories[VendorRiskCategory.OPERATIONAL]?.score || 0},${categories[VendorRiskCategory.FINANCIAL]?.score || 0},${categories[VendorRiskCategory.COMPLIANCE]?.score || 0},${categories[VendorRiskCategory.SECURITY]?.score || 0},${categories[VendorRiskCategory.REPUTATION]?.score || 0}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tprm-${reportType}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification(`${reportType} report exported successfully`, 'success');
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <header className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={() => setView({ type: 'tprmDashboard', projectId })}
              className="text-sm text-blue-400 hover:underline mb-2"
            >
              ← Back to TPRM Dashboard
            </button>
            <h1 className="text-4xl font-bold text-white">TPRM Reports & Analytics</h1>
            <p className="text-slate-400 mt-1">Comprehensive reporting and analysis for third-party risk management</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportToCSV('vendor-summary')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              Export Vendor Summary
            </button>
            <button
              onClick={() => exportToCSV('risk-assessments')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
            >
              Export Risk Data
            </button>
          </div>
        </div>
      </header>

      {/* Report Navigation */}
      <nav className="mb-6">
        <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
          {[
            { id: 'executive', label: 'Executive Summary' },
            { id: 'risk-assessment', label: 'Risk Assessment' },
            { id: 'compliance', label: 'Compliance' },
            { id: 'financial', label: 'Financial Analysis' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedReport(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedReport === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {selectedReport === 'executive' && (
        <div className="space-y-6">
          {/* Executive KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card rounded-lg p-6">
              <h3 className="text-slate-400 text-sm font-medium mb-2">Total Vendors</h3>
              <div className="text-3xl font-bold text-white">{vendors.length}</div>
              <div className="text-sm text-slate-400 mt-1">Managed relationships</div>
            </div>

            <div className="glass-card rounded-lg p-6">
              <h3 className="text-slate-400 text-sm font-medium mb-2">Portfolio Risk</h3>
              <div className={`text-3xl font-bold ${getRiskLevelColor(
                averageRiskScore <= 25 ? VendorCriticality.LOW :
                averageRiskScore <= 50 ? VendorCriticality.MEDIUM :
                averageRiskScore <= 75 ? VendorCriticality.HIGH : VendorCriticality.CRITICAL
              )}`}>{averageRiskScore}/100</div>
              <div className="text-sm text-slate-400 mt-1">Average risk score</div>
            </div>

            <div className="glass-card rounded-lg p-6">
              <h3 className="text-slate-400 text-sm font-medium mb-2">Total Spend</h3>
              <div className="text-3xl font-bold text-white">${(totalSpend / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-slate-400 mt-1">Annual vendor spend</div>
            </div>

            <div className="glass-card rounded-lg p-6">
              <h3 className="text-slate-400 text-sm font-medium mb-2">Open Issues</h3>
              <div className="text-3xl font-bold text-red-400">{incidents.filter(i => i.status === 'Open' || i.status === 'Investigating').length}</div>
              <div className="text-sm text-slate-400 mt-1">Requiring attention</div>
            </div>
          </div>

          {/* Risk & Lifecycle Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Risk Level Distribution</h2>
              <div className="space-y-3">
                {Object.entries(riskDistribution).map(([level, count]) => {
                  const percentage = Math.round((count / vendors.length) * 100);
                  return (
                    <div key={level} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getRiskLevelBg(level as VendorCriticality)}`}></div>
                        <span className="text-white">{level}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getRiskLevelBg(level as VendorCriticality)}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-slate-400 text-sm w-16 text-right">{count} ({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Lifecycle Stage Distribution</h2>
              <div className="space-y-3">
                {Object.entries(lifecycleDistribution).map(([stage, count]) => {
                  const percentage = Math.round((count / vendors.length) * 100);
                  return (
                    <div key={stage} className="flex items-center justify-between">
                      <span className="text-white">{stage}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-slate-400 text-sm w-16 text-right">{count} ({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contract Renewals */}
          <div className="glass-card rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Upcoming Contract Renewals (Next 12 Months)</h2>
            {contractsExpiring.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-700">
                      <th className="pb-3 text-slate-400 font-medium">Vendor</th>
                      <th className="pb-3 text-slate-400 font-medium">Contract</th>
                      <th className="pb-3 text-slate-400 font-medium">End Date</th>
                      <th className="pb-3 text-slate-400 font-medium">Value</th>
                      <th className="pb-3 text-slate-400 font-medium">Days Until Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractsExpiring.slice(0, 5).map(contract => {
                      const vendor = vendors.find(v => v.id === contract.vendorId);
                      const daysUntilExpiry = Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <tr key={contract.id} className="border-b border-slate-800/50">
                          <td className="py-3 text-white">{vendor?.name || contract.vendorId}</td>
                          <td className="py-3 text-white">{contract.title}</td>
                          <td className="py-3 text-white">{contract.endDate}</td>
                          <td className="py-3 text-white">${contract.annualValue.toLocaleString()} {contract.currency}</td>
                          <td className="py-3">
                            <span className={`${daysUntilExpiry <= 30 ? 'text-red-400' : daysUntilExpiry <= 90 ? 'text-yellow-400' : 'text-green-400'}`}>
                              {daysUntilExpiry} days
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">No contracts expiring in the next 12 months</p>
            )}
          </div>
        </div>
      )}

      {selectedReport === 'risk-assessment' && (
        <div className="space-y-6">
          {/* Risk Category Analysis */}
          <div className="glass-card rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Risk Category Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAverages.map(({ category, average }) => (
                <div key={category} className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">{category}</h3>
                  <div className={`text-2xl font-bold mb-2 ${getRiskLevelColor(
                    average <= 25 ? VendorCriticality.LOW :
                    average <= 50 ? VendorCriticality.MEDIUM :
                    average <= 75 ? VendorCriticality.HIGH : VendorCriticality.CRITICAL
                  )}`}>{average}/100</div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getRiskLevelBg(
                        average <= 25 ? VendorCriticality.LOW :
                        average <= 50 ? VendorCriticality.MEDIUM :
                        average <= 75 ? VendorCriticality.HIGH : VendorCriticality.CRITICAL
                      )}`}
                      style={{ width: `${average}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High Risk Vendors */}
          <div className="glass-card rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">High Risk Vendors Requiring Attention</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-700">
                    <th className="pb-3 text-slate-400 font-medium">Vendor</th>
                    <th className="pb-3 text-slate-400 font-medium">Risk Score</th>
                    <th className="pb-3 text-slate-400 font-medium">Primary Concerns</th>
                    <th className="pb-3 text-slate-400 font-medium">Last Assessment</th>
                    <th className="pb-3 text-slate-400 font-medium">Next Review</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors
                    .filter(vendor => vendor.riskLevel === VendorCriticality.HIGH || vendor.riskLevel === VendorCriticality.CRITICAL)
                    .sort((a, b) => b.overallRiskScore - a.overallRiskScore)
                    .map(vendor => {
                      const assessment = riskAssessments.find(ra => ra.vendorId === vendor.id);
                      const highestRiskCategories = assessment ?
                        Object.entries(assessment.categories)
                          .sort(([,a], [,b]) => b.score - a.score)
                          .slice(0, 2)
                          .map(([category]) => category) : [];

                      return (
                        <tr key={vendor.id} className="border-b border-slate-800/50">
                          <td className="py-3 text-white">{vendor.name}</td>
                          <td className="py-3">
                            <span className={`font-bold ${getRiskLevelColor(vendor.riskLevel)}`}>
                              {vendor.overallRiskScore}/100
                            </span>
                          </td>
                          <td className="py-3 text-slate-300">
                            {highestRiskCategories.join(', ') || 'No assessment data'}
                          </td>
                          <td className="py-3 text-slate-300">{vendor.lastRiskAssessment || 'N/A'}</td>
                          <td className="py-3 text-slate-300">{vendor.nextRiskAssessment}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'compliance' && (
        <div className="space-y-6">
          {/* Compliance Framework Coverage */}
          <div className="glass-card rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Compliance Framework Coverage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['SOC 2', 'ISO 27001', 'GDPR', 'HIPAA', 'PCI DSS'].map(framework => {
                const compliantVendors = vendors.filter(vendor =>
                  vendor.complianceFrameworks.includes(framework) ||
                  vendor.regulatoryRequirements.includes(framework)
                ).length;
                const percentage = Math.round((compliantVendors / vendors.length) * 100);

                return (
                  <div key={framework} className="bg-slate-800/50 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2">{framework}</h3>
                    <div className="text-2xl font-bold text-white mb-2">{percentage}%</div>
                    <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-slate-400">{compliantVendors} of {vendors.length} vendors</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Due Diligence Status */}
          <div className="glass-card rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Due Diligence Completion Status</h2>
            <div className="space-y-4">
              {vendors.map(vendor => {
                const ddRecords = []; // Mock due diligence completion
                const completionRate = vendor.status === VendorLifecycleStage.ACTIVE ? 100 :
                                     vendor.status === VendorLifecycleStage.ONBOARDING ? 60 : 0;

                return (
                  <div key={vendor.id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded">
                    <div>
                      <div className="font-semibold text-white">{vendor.name}</div>
                      <div className="text-sm text-slate-400">{vendor.serviceCategory}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${completionRate === 100 ? 'bg-green-500' : completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-medium w-12 text-right">{completionRate}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'financial' && (
        <div className="space-y-6">
          {/* Spend Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-card rounded-lg p-6">
              <h3 className="text-slate-400 text-sm font-medium mb-2">Total Annual Spend</h3>
              <div className="text-3xl font-bold text-white">${(totalSpend / 1000000).toFixed(2)}M</div>
              <div className="text-sm text-slate-400 mt-1">Across all vendors</div>
            </div>

            <div className="glass-card rounded-lg p-6">
              <h3 className="text-slate-400 text-sm font-medium mb-2">Tier 1 Spend</h3>
              <div className="text-3xl font-bold text-white">
                ${(vendors.filter(v => v.tier === '1').reduce((sum, v) => sum + v.annualSpend, 0) / 1000000).toFixed(2)}M
              </div>
              <div className="text-sm text-slate-400 mt-1">Critical vendors</div>
            </div>

            <div className="glass-card rounded-lg p-6">
              <h3 className="text-slate-400 text-sm font-medium mb-2">Average Vendor Cost</h3>
              <div className="text-3xl font-bold text-white">
                ${Math.round(totalSpend / vendors.length).toLocaleString()}
              </div>
              <div className="text-sm text-slate-400 mt-1">Per vendor annually</div>
            </div>
          </div>

          {/* Top Vendors by Spend */}
          <div className="glass-card rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Top Vendors by Annual Spend</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-700">
                    <th className="pb-3 text-slate-400 font-medium">Vendor</th>
                    <th className="pb-3 text-slate-400 font-medium">Annual Spend</th>
                    <th className="pb-3 text-slate-400 font-medium">% of Total</th>
                    <th className="pb-3 text-slate-400 font-medium">Risk Level</th>
                    <th className="pb-3 text-slate-400 font-medium">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors
                    .sort((a, b) => b.annualSpend - a.annualSpend)
                    .map(vendor => {
                      const percentage = ((vendor.annualSpend / totalSpend) * 100).toFixed(1);
                      return (
                        <tr key={vendor.id} className="border-b border-slate-800/50">
                          <td className="py-3 text-white">{vendor.name}</td>
                          <td className="py-3 text-white">${vendor.annualSpend.toLocaleString()} {vendor.currency}</td>
                          <td className="py-3 text-slate-300">{percentage}%</td>
                          <td className="py-3">
                            <span className={`${getRiskLevelColor(vendor.riskLevel)}`}>
                              {vendor.riskLevel}
                            </span>
                          </td>
                          <td className="py-3 text-slate-300">Tier {vendor.tier}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Spend by Tier */}
          <div className="glass-card rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Spend Distribution by Tier</h2>
            <div className="space-y-3">
              {Object.entries(tierDistribution).map(([tier, count]) => {
                const tierSpend = vendors.filter(v => v.tier === tier).reduce((sum, v) => sum + v.annualSpend, 0);
                const percentage = Math.round((tierSpend / totalSpend) * 100);
                return (
                  <div key={tier} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-white">Tier {tier}</span>
                      <span className="text-slate-400 text-sm">({count} vendors)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-slate-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-medium w-24 text-right">
                        ${(tierSpend / 1000000).toFixed(1)}M ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TPRMReportsView;