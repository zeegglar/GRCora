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
  technicalTitle: string;
  plainTitle: string;
  technicalDescription: string;
  plainDescription: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  estimatedCost: string;
  timeline: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  impact: string;
  whyItMatters: string;
  implementationSteps: string[];
}

const TechnicalFirstDashboard: React.FC = () => {
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
  const [showBreakdown, setShowBreakdown] = useState<{ [key: string]: boolean }>({});
  const [useSimpleLanguage, setUseSimpleLanguage] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // Load critical actions with both technical and plain language versions
    const actions: ActionItem[] = [
      {
        id: 'ac-2',
        technicalTitle: 'Account Management (NIST AC-2)',
        plainTitle: 'User Account Setup',
        technicalDescription: 'Implement proper account management controls including account creation, modification, enablement, disablement, and removal processes.',
        plainDescription: 'Give each staff member their own username and password instead of sharing accounts.',
        priority: 'Critical',
        estimatedCost: '$500 - $2,000',
        timeline: '1-2 weeks',
        difficulty: 'Easy',
        impact: 'Prevents 70% of unauthorized access incidents',
        whyItMatters: 'Without individual accounts, you can\'t tell who accessed what data, making it impossible to investigate security incidents or comply with audit requirements.',
        implementationSteps: [
          'Create individual accounts for each staff member',
          'Remove any shared passwords or generic accounts',
          'Set up different access levels (admin, staff, volunteer)',
          'Document who has access to what systems',
          'Review access permissions every 3 months'
        ]
      },
      {
        id: 'ia-2',
        technicalTitle: 'Multi-Factor Authentication (NIST IA-2)',
        plainTitle: 'Extra Login Security',
        technicalDescription: 'Deploy multi-factor authentication mechanisms for user identification and authentication to organizational systems.',
        plainDescription: 'Require a phone code in addition to passwords for important systems.',
        priority: 'Critical',
        estimatedCost: '$1,500 - $4,000',
        timeline: '2-4 weeks',
        difficulty: 'Medium',
        impact: 'Blocks 99.9% of password-based attacks',
        whyItMatters: 'Even if someone steals or guesses a password, they still can\'t access your systems without the second factor (usually a phone).',
        implementationSteps: [
          'Choose MFA solution (Microsoft, Google, or dedicated service)',
          'Enable MFA on critical systems (email, file storage, databases)',
          'Train staff on using MFA',
          'Set up backup authentication methods',
          'Test MFA recovery procedures'
        ]
      },
      {
        id: 'cp-9',
        technicalTitle: 'System Backup (NIST CP-9)',
        plainTitle: 'Data Backup',
        technicalDescription: 'Conduct backups of user-level information contained in the system per organization-defined frequency to ensure data availability.',
        plainDescription: 'Automatically save copies of important files every day to protect against ransomware.',
        priority: 'Critical',
        estimatedCost: '$1,000 - $3,000',
        timeline: '1 week',
        difficulty: 'Easy',
        impact: 'Enables full recovery from cyberattacks and hardware failures',
        whyItMatters: 'Ransomware attacks encrypt your files and demand payment. With good backups, you can restore everything without paying criminals.',
        implementationSteps: [
          'Set up automatic daily backups of all important data',
          'Store backup copies in secure cloud service',
          'Test restoring data from backups monthly',
          'Keep backups for at least 1 year',
          'Encrypt backup files to protect sensitive data'
        ]
      },
      {
        id: 'sc-8',
        technicalTitle: 'Transmission Confidentiality (NIST SC-8)',
        plainTitle: 'Secure Communication',
        technicalDescription: 'Protect the confidentiality and integrity of transmitted information through cryptographic mechanisms.',
        plainDescription: 'Use encrypted email when sending sensitive donor or financial information.',
        priority: 'High',
        estimatedCost: '$500 - $2,000',
        timeline: '1-2 weeks',
        difficulty: 'Easy',
        impact: 'Protects sensitive data from interception during transmission',
        whyItMatters: 'Sending sensitive information through regular email is like sending cash in a clear envelope - anyone can see it.',
        implementationSteps: [
          'Set up encrypted email service',
          'Use secure file sharing for large documents',
          'Train staff never to email sensitive data unencrypted',
          'Implement secure messaging for internal communications',
          'Verify recipient identity before sending sensitive information'
        ]
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
    if (score >= 80) return 'Strong security posture';
    if (score >= 60) return 'Moderate security posture';
    if (score >= 40) return 'Below average security posture';
    return 'Significant security gaps identified';
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

  const toggleBreakdown = (itemId: string) => {
    setShowBreakdown(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const toggleLanguage = (itemId: string) => {
    setUseSimpleLanguage(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Assessment Dashboard</h1>
        <p className="text-gray-600">Current security posture and recommended improvements</p>
      </div>

      {/* Security Score Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Security Compliance Score</h2>

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className={`text-6xl font-bold ${getScoreColor(securityScore.overall)}`}>
              {securityScore.overall}%
            </div>
            <p className="text-lg text-gray-600 mt-2">{getScoreDescription(securityScore.overall)}</p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500 mb-2">Compliance Framework Coverage:</p>
            <p className="text-lg font-medium text-gray-700">NIST Cybersecurity Framework</p>
            <p className="text-sm text-gray-500">42 of 104 core controls implemented</p>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(securityScore.breakdown.accessControl)}`}>
              {securityScore.breakdown.accessControl}%
            </div>
            <p className="text-sm text-gray-600">Access Control (AC)</p>
            <p className="text-xs text-gray-500">Identity & Access Management</p>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(securityScore.breakdown.dataProtection)}`}>
              {securityScore.breakdown.dataProtection}%
            </div>
            <p className="text-sm text-gray-600">System Protection (SC)</p>
            <p className="text-xs text-gray-500">Data & Communications Security</p>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(securityScore.breakdown.incidentResponse)}`}>
              {securityScore.breakdown.incidentResponse}%
            </div>
            <p className="text-sm text-gray-600">Incident Response (IR)</p>
            <p className="text-xs text-gray-500">Security Event Management</p>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(securityScore.breakdown.backup)}`}>
              {securityScore.breakdown.backup}%
            </div>
            <p className="text-sm text-gray-600">Contingency Planning (CP)</p>
            <p className="text-xs text-gray-500">Backup & Recovery</p>
          </div>
        </div>
      </div>

      {/* Priority Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Priority Security Controls</h2>
          <p className="text-sm text-gray-600">
            Implementing these will improve your score to <span className="font-semibold text-green-600">75%</span>
          </p>
        </div>

        <div className="space-y-4">
          {actionItems.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{getPriorityIcon(item.priority)}</span>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {useSimpleLanguage[item.id] ? item.plainTitle : item.technicalTitle}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                      item.priority === 'High' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.priority}
                    </span>
                    <button
                      onClick={() => toggleLanguage(item.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      {useSimpleLanguage[item.id] ? 'Show Technical' : 'Simplify'}
                    </button>
                  </div>

                  <p className="text-gray-700 mb-3">
                    {useSimpleLanguage[item.id] ? item.plainDescription : item.technicalDescription}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Implementation Cost:</span> {item.estimatedCost}
                    </div>
                    <div>
                      <span className="font-medium">Timeline:</span> {item.timeline}
                    </div>
                    <div>
                      <span className="font-medium">Complexity:</span> {item.difficulty}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleBreakdown(item.id)}
                  className="ml-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {showBreakdown[item.id] ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showBreakdown[item.id] && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h4 className="font-medium text-blue-900 mb-2">Business Impact:</h4>
                      <p className="text-blue-800 text-sm mb-3">{item.impact}</p>
                      <h4 className="font-medium text-blue-900 mb-2">Why This Matters:</h4>
                      <p className="text-blue-800 text-sm">{item.whyItMatters}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-gray-900 mb-2">Implementation Steps:</h4>
                      <ol className="text-sm text-gray-700 space-y-1">
                        {item.implementationSteps.map((step, index) => (
                          <li key={index} className="flex">
                            <span className="font-medium text-blue-600 mr-2">{index + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Budget Planning */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Implementation Budget</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-900 mb-2">🚨 Phase 1: Critical Controls</h3>
            <div className="text-2xl font-bold text-red-600">$3,000 - $9,000</div>
            <p className="text-sm text-red-700 mt-1">Next 3 months - Essential security controls</p>
            <p className="text-xs text-red-600 mt-2">NIST CSF Core Functions: Identify, Protect</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">⚡ Phase 2: Enhanced Security</h3>
            <div className="text-2xl font-bold text-yellow-600">$5,000 - $15,000</div>
            <p className="text-sm text-yellow-700 mt-1">Months 3-6 - Infrastructure hardening</p>
            <p className="text-xs text-yellow-600 mt-2">NIST CSF Core Functions: Detect, Respond</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">✨ Phase 3: Advanced Capabilities</h3>
            <div className="text-2xl font-bold text-green-600">$2,000 - $8,000</div>
            <p className="text-sm text-green-700 mt-1">Months 6-12 - Optimization & monitoring</p>
            <p className="text-xs text-green-600 mt-2">NIST CSF Core Functions: Recover, Govern</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💰 Return on Investment</h3>
          <p className="text-blue-800">
            Total investment: <span className="font-bold">$10,000 - $32,000</span> over 12 months
          </p>
          <p className="text-blue-800">
            Potential savings: <span className="font-bold">$180,000</span> in avoided breach costs
          </p>
          <p className="text-blue-800">
            <span className="font-bold">ROI: 563% - 1,800%</span> return on security investment
          </p>
        </div>
      </div>
    </div>
  );
};

export default TechnicalFirstDashboard;