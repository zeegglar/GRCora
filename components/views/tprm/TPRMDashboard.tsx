import React, { useState, useEffect } from 'react';
import type { Vendor, VendorRiskAssessment, VendorContract, VendorIncident, View } from '../../../types';
import { VendorCriticality, VendorLifecycleStage, ContractStatus } from '../../../types';
import { mockApi } from '../../../services/api';
import { useNotifications } from '../../context/NotificationContext';

interface TPRMDashboardProps {
  projectId: string;
  setView: (view: View) => void;
}

const TPRMDashboard: React.FC<TPRMDashboardProps> = ({ projectId, setView }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<VendorRiskAssessment[]>([]);
  const [contracts, setContracts] = useState<VendorContract[]>([]);
  const [incidents, setIncidents] = useState<VendorIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotifications();

  useEffect(() => {
    const fetchTPRMData = async () => {
      setIsLoading(true);
      try {
        const vendorData = await mockApi.getVendors(projectId);
        setVendors(vendorData);

        // Fetch related data for all vendors
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
        console.error('Error fetching TPRM data:', error);
        addNotification('Failed to load TPRM dashboard data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTPRMData();
  }, [projectId, addNotification]);

  if (isLoading) {
    return <div className="p-8">Loading TPRM dashboard...</div>;
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'text-red-400';
      case 'resolved': case 'completed': case 'executed': return 'text-green-400';
      case 'active': case 'approved': return 'text-blue-400';
      case 'onboarding': case 'in progress': return 'text-yellow-400';
      case 'offboarding': case 'expired': return 'text-orange-400';
      default: return 'text-slate-400';
    }
  };

  // Calculate statistics
  const riskDistribution = vendors.reduce((acc, vendor) => {
    acc[vendor.riskLevel] = (acc[vendor.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<VendorCriticality, number>);

  const lifecycleDistribution = vendors.reduce((acc, vendor) => {
    acc[vendor.status] = (acc[vendor.status] || 0) + 1;
    return acc;
  }, {} as Record<VendorLifecycleStage, number>);

  const totalSpend = vendors.reduce((sum, vendor) => sum + vendor.annualSpend, 0);
  const averageRiskScore = vendors.length > 0 ? Math.round(vendors.reduce((sum, vendor) => sum + vendor.overallRiskScore, 0) / vendors.length) : 0;
  const openIncidents = incidents.filter(i => i.status === 'Open' || i.status === 'Investigating').length;
  const expiringContracts = contracts.filter(c => {
    const endDate = new Date(c.endDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  }).length;

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <header className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={() => setView({ type: 'project', projectId, tab: 'vendors' })}
              className="text-sm text-blue-400 hover:underline mb-2"
            >
              ← Back to Project
            </button>
            <h1 className="text-4xl font-bold text-white">Third-Party Risk Management</h1>
            <p className="text-slate-400 mt-1">Comprehensive vendor risk oversight and monitoring</p>
          </div>
        </div>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card rounded-lg p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Total Vendors</h3>
          <div className="text-3xl font-bold text-white">{vendors.length}</div>
          <div className="text-sm text-slate-400 mt-1">Active relationships</div>
        </div>

        <div className="glass-card rounded-lg p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Average Risk Score</h3>
          <div className={`text-3xl font-bold ${getRiskLevelColor(
            averageRiskScore <= 25 ? VendorCriticality.LOW :
            averageRiskScore <= 50 ? VendorCriticality.MEDIUM :
            averageRiskScore <= 75 ? VendorCriticality.HIGH : VendorCriticality.CRITICAL
          )}`}>{averageRiskScore}/100</div>
          <div className="text-sm text-slate-400 mt-1">Portfolio risk level</div>
        </div>

        <div className="glass-card rounded-lg p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Annual Spend</h3>
          <div className="text-3xl font-bold text-white">${(totalSpend / 1000000).toFixed(1)}M</div>
          <div className="text-sm text-slate-400 mt-1">Total vendor spend</div>
        </div>

        <div className="glass-card rounded-lg p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Active Issues</h3>
          <div className="text-3xl font-bold text-red-400">{openIncidents}</div>
          <div className="text-sm text-slate-400 mt-1">Open incidents</div>
        </div>
      </div>

      {/* Risk Distribution & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Risk Distribution</h2>
          <div className="space-y-3">
            {Object.entries(riskDistribution).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getRiskLevelBg(level as VendorCriticality)}`}></div>
                  <span className="text-white">{level}</span>
                </div>
                <span className="text-slate-400">{count} vendors</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Risk Alerts</h2>
          <div className="space-y-3">
            {expiringContracts > 0 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-600/20 border border-yellow-600/30 rounded">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <span className="text-yellow-200">{expiringContracts} contract(s) expiring within 90 days</span>
              </div>
            )}
            {openIncidents > 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-600/20 border border-red-600/30 rounded">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <span className="text-red-200">{openIncidents} open incident(s) requiring attention</span>
              </div>
            )}
            {vendors.filter(v => v.nextRiskAssessment && new Date(v.nextRiskAssessment) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-600/20 border border-blue-600/30 rounded">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-blue-200">Risk assessments due within 30 days</span>
              </div>
            )}
            {vendors.filter(v => v.status === VendorLifecycleStage.ONBOARDING).length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-orange-600/20 border border-orange-600/30 rounded">
                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                <span className="text-orange-200">{vendors.filter(v => v.status === VendorLifecycleStage.ONBOARDING).length} vendor(s) in onboarding</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vendor List */}
      <div className="glass-card rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Vendor Portfolio</h2>
          <div className="flex gap-2">
            <select className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-white text-sm">
              <option>All Vendors</option>
              <option>High Risk</option>
              <option>Critical Risk</option>
              <option>Tier 1</option>
              <option>Tier 2</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-700">
                <th className="pb-3 text-slate-400 font-medium">Vendor</th>
                <th className="pb-3 text-slate-400 font-medium">Risk Level</th>
                <th className="pb-3 text-slate-400 font-medium">Status</th>
                <th className="pb-3 text-slate-400 font-medium">Annual Spend</th>
                <th className="pb-3 text-slate-400 font-medium">Next Review</th>
                <th className="pb-3 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(vendor => (
                <tr key={vendor.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="py-4">
                    <div>
                      <div className="font-semibold text-white">{vendor.name}</div>
                      <div className="text-sm text-slate-400">{vendor.serviceCategory}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">Tier {vendor.tier}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${getRiskLevelBg(vendor.criticality)} text-white`}>
                          {vendor.criticality}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className={`font-semibold ${getRiskLevelColor(vendor.riskLevel)}`}>{vendor.overallRiskScore}/100</div>
                    <div className={`text-sm ${getRiskLevelColor(vendor.riskLevel)}`}>{vendor.riskLevel}</div>
                  </td>
                  <td className="py-4">
                    <span className={`${getStatusColor(vendor.status)}`}>{vendor.status}</span>
                  </td>
                  <td className="py-4">
                    <div className="font-semibold text-white">${vendor.annualSpend.toLocaleString()}</div>
                    <div className="text-sm text-slate-400">{vendor.currency}</div>
                  </td>
                  <td className="py-4">
                    <div className="text-white">{vendor.nextReviewDate}</div>
                    {vendor.nextRiskAssessment && (
                      <div className="text-sm text-slate-400">Assessment: {vendor.nextRiskAssessment}</div>
                    )}
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => setView({ type: 'vendorDetail', projectId, vendorId: vendor.id, tab: 'overview' })}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TPRMDashboard;