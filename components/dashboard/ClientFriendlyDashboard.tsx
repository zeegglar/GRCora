import React, { useState, useEffect } from 'react';
import { ControlTranslationService } from '../../services/controlTranslationService';
import { CostEstimationService } from '../../services/costEstimationService';

interface SecurityScore {
  overall: number;
  breakdown: {
    accessControl: number;
    dataProtection: number;
    incidentResponse: number;
    backup: number;
  };
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  estimatedCost: string;
  timeline: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  impact: string;
}

const ClientFriendlyDashboard: React.FC = () => {
  const [securityScore, setSecurityScore] = useState<SecurityScore>({
    overall: 42,
    breakdown: {
      accessControl: 35,
      dataProtection: 40,
      incidentResponse: 20,
      backup: 75
    }
  });

  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // Load critical actions based on control translations
    const criticalControls = ControlTranslationService.getCriticalControls();
    const quickWins = ControlTranslationService.getQuickWins();

    const actions: ActionItem[] = [
      {
        id: 'ac-2',
        title: 'Set Up Individual User Accounts',
        description: 'Give each staff member their own username and password instead of sharing accounts.',
        priority: 'Critical',
        estimatedCost: '$500 - $2,000',
        timeline: '1-2 weeks',
        difficulty: 'Easy',
        impact: 'Prevents 70% of unauthorized access incidents'
      },
      {
        id: 'ia-2',
        title: 'Add Extra Login Security',
        description: 'Require a phone code in addition to passwords for important systems.',
        priority: 'Critical',
        estimatedCost: '$1,500 - $4,000',
        timeline: '2-4 weeks',
        difficulty: 'Medium',
        impact: 'Blocks 99% of password-based attacks'
      },
      {
        id: 'cp-9',
        title: 'Back Up Your Data',
        description: 'Automatically save copies of important files every day to protect against ransomware.',
        priority: 'Critical',
        estimatedCost: '$1,000 - $3,000',
        timeline: '1 week',
        difficulty: 'Easy',
        impact: 'Enables full recovery from cyberattacks'
      },
      {
        id: 'sc-8',
        title: 'Secure Email and File Sharing',
        description: 'Use encrypted email when sending sensitive donor or financial information.',
        priority: 'High',
        estimatedCost: '$500 - $2,000',
        timeline: '1-2 weeks',
        difficulty: 'Easy',
        impact: 'Protects sensitive data in transit'
      }
    ];

    setActionItems(actions);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Strong - Your organization is well-protected';
    if (score >= 60) return 'Good - Some improvements needed';
    if (score >= 40) return 'Fair - Important gaps to address';
    return 'Needs Attention - Critical security gaps';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Critical': return '🔴';
      case 'High': return '🟡';
      case 'Medium': return '🟠';
      case 'Low': return '🟢';
      default: return '⚪';
    }
  };

  const getDifficultyDescription = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'Your current IT person can handle this';
      case 'Medium': return 'May need some outside help';
      case 'Hard': return 'Recommend hiring a security consultant';
      default: return 'Complexity varies';
    }
  };

  const toggleDetails = (itemId: string) => {
    setShowDetails(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Dashboard</h1>
        <p className="text-gray-600">Simple view of your organization's cybersecurity health</p>
      </div>

      {/* Security Score Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Security Score</h2>

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className={`text-6xl font-bold ${getScoreColor(securityScore.overall)}`}>
              {securityScore.overall}%
            </div>
            <p className="text-lg text-gray-600 mt-2">{getScoreDescription(securityScore.overall)}</p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500 mb-2">Compared to similar organizations:</p>
            <p className="text-lg font-medium text-gray-700">
              {securityScore.overall >= 50 ? 'Above Average' : 'Below Average'}
            </p>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(securityScore.breakdown.accessControl)}`}>
              {securityScore.breakdown.accessControl}%
            </div>
            <p className="text-sm text-gray-600">User Access Control</p>
            <p className="text-xs text-gray-500">Who can log in</p>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(securityScore.breakdown.dataProtection)}`}>
              {securityScore.breakdown.dataProtection}%
            </div>
            <p className="text-sm text-gray-600">Data Protection</p>
            <p className="text-xs text-gray-500">Keeping info safe</p>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(securityScore.breakdown.incidentResponse)}`}>
              {securityScore.breakdown.incidentResponse}%
            </div>
            <p className="text-sm text-gray-600">Incident Response</p>
            <p className="text-xs text-gray-500">When things go wrong</p>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(securityScore.breakdown.backup)}`}>
              {securityScore.breakdown.backup}%
            </div>
            <p className="text-sm text-gray-600">Data Backup</p>
            <p className="text-xs text-gray-500">Recovery readiness</p>
          </div>
        </div>
      </div>

      {/* Priority Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Priority Actions</h2>
          <p className="text-sm text-gray-600">
            Complete these to improve your security score to <span className="font-semibold text-green-600">75%</span>
          </p>
        </div>

        <div className="space-y-4">
          {actionItems.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{getPriorityIcon(item.priority)}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                      item.priority === 'High' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.priority}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-3">{item.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Cost:</span> {item.estimatedCost}
                    </div>
                    <div>
                      <span className="font-medium">Timeline:</span> {item.timeline}
                    </div>
                    <div>
                      <span className="font-medium">Difficulty:</span> {item.difficulty}
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mt-2 italic">
                    {getDifficultyDescription(item.difficulty)}
                  </p>
                </div>

                <button
                  onClick={() => toggleDetails(item.id)}
                  className="ml-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {showDetails[item.id] ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails[item.id] && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h4 className="font-medium text-blue-900 mb-2">Why This Matters:</h4>
                    <p className="text-blue-800 text-sm">{item.impact}</p>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Implementation Steps:</h4>
                    <div className="text-sm text-gray-700">
                      {/* Would fetch from ControlTranslationService */}
                      <p>Detailed implementation steps would be loaded here based on the control ID.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Budget Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Budget Planning</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-900 mb-2">🚨 Critical (Next 3 months)</h3>
            <div className="text-2xl font-bold text-red-600">$3,000 - $9,000</div>
            <p className="text-sm text-red-700 mt-1">Must-do items to prevent major risks</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">⚡ Important (3-6 months)</h3>
            <div className="text-2xl font-bold text-yellow-600">$5,000 - $15,000</div>
            <p className="text-sm text-yellow-700 mt-1">Significant security improvements</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">✨ Enhanced (6-12 months)</h3>
            <div className="text-2xl font-bold text-green-600">$2,000 - $8,000</div>
            <p className="text-sm text-green-700 mt-1">Advanced security capabilities</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💰 Return on Investment</h3>
          <p className="text-blue-800">
            These security improvements could save your organization <span className="font-bold">$180,000</span> in
            potential breach costs and regulatory penalties. That's a <span className="font-bold">900% return</span> on
            your security investment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientFriendlyDashboard;