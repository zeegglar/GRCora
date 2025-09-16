import React, { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

interface RealTimeEvent {
  id: string;
  type: 'risk_created' | 'assessment_updated' | 'vendor_incident' | 'compliance_changed' | 'deadline_approaching';
  title: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  projectId?: string;
  userId?: string;
  metadata?: any;
}

interface RealTimeSystemProps {
  user: any;
  currentProjectId?: string;
}

const RealTimeSystem: React.FC<RealTimeSystemProps> = ({ user, currentProjectId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Simulate WebSocket connection
    const connectToRealTimeSystem = () => {
      setIsConnected(true);

      // Simulate periodic events
      const eventGenerators = [
        () => generateRiskEvent(),
        () => generateComplianceEvent(),
        () => generateVendorEvent(),
        () => generateDeadlineEvent(),
        () => generateAssessmentEvent()
      ];

      const eventInterval = setInterval(() => {
        // Generate random events with extremely low probability
        if (Math.random() < 0.001) {
          const generator = eventGenerators[Math.floor(Math.random() * eventGenerators.length)];
          generator();
        }
      }, 60000); // Every 60 seconds

      // Don't generate initial events automatically
      // User can enable via dashboard if needed

      return () => {
        clearInterval(eventInterval);
        setIsConnected(false);
      };
    };

    const cleanup = connectToRealTimeSystem();
    return cleanup;
  }, [user, currentProjectId]);

  const generateRiskEvent = () => {
    const riskEvents = [
      {
        type: 'risk_created' as const,
        title: 'New Critical Risk Identified',
        message: 'SQL injection vulnerability detected in user authentication module',
        severity: 'critical' as const
      },
      {
        type: 'risk_created' as const,
        title: 'High Risk: Unencrypted Data Transfer',
        message: 'API endpoints transmitting sensitive data without encryption',
        severity: 'high' as const
      },
      {
        type: 'risk_created' as const,
        title: 'Medium Risk: Outdated Dependencies',
        message: '15 npm packages have known security vulnerabilities',
        severity: 'medium' as const
      }
    ];

    const event = riskEvents[Math.floor(Math.random() * riskEvents.length)];
    const realTimeEvent: RealTimeEvent = {
      id: `risk-${Date.now()}`,
      ...event,
      timestamp: new Date().toISOString(),
      projectId: currentProjectId,
      userId: user.id,
      metadata: { controlId: 'AUTO-SCAN-001' }
    };

    addEvent(realTimeEvent);
  };

  const generateComplianceEvent = () => {
    const complianceEvents = [
      {
        type: 'compliance_changed' as const,
        title: 'Compliance Score Improved',
        message: 'SOC 2 compliance increased to 87% (+3%)',
        severity: 'low' as const
      },
      {
        type: 'compliance_changed' as const,
        title: 'Compliance Gap Identified',
        message: 'Access control reviews are 15 days overdue',
        severity: 'medium' as const
      },
      {
        type: 'assessment_updated' as const,
        title: 'Assessment Status Updated',
        message: '5 controls marked as compliant after remediation',
        severity: 'low' as const
      }
    ];

    const event = complianceEvents[Math.floor(Math.random() * complianceEvents.length)];
    const realTimeEvent: RealTimeEvent = {
      id: `compliance-${Date.now()}`,
      ...event,
      timestamp: new Date().toISOString(),
      projectId: currentProjectId,
      userId: user.id,
      metadata: { framework: 'SOC 2' }
    };

    addEvent(realTimeEvent);
  };

  const generateVendorEvent = () => {
    const vendorEvents = [
      {
        type: 'vendor_incident' as const,
        title: 'Vendor Incident Reported',
        message: 'AWS: Minor service degradation in us-east-1 region',
        severity: 'medium' as const
      },
      {
        type: 'vendor_incident' as const,
        title: 'Critical Vendor Alert',
        message: 'DataGuard: Security breach affecting customer data',
        severity: 'critical' as const
      },
      {
        type: 'vendor_incident' as const,
        title: 'Vendor SLA Breach',
        message: 'HealthTech Analytics: Response time exceeded SLA by 2 hours',
        severity: 'high' as const
      }
    ];

    const event = vendorEvents[Math.floor(Math.random() * vendorEvents.length)];
    const realTimeEvent: RealTimeEvent = {
      id: `vendor-${Date.now()}`,
      ...event,
      timestamp: new Date().toISOString(),
      projectId: currentProjectId,
      userId: user.id,
      metadata: { vendorId: 'ven-' + Math.floor(Math.random() * 3 + 1) }
    };

    addEvent(realTimeEvent);
  };

  const generateDeadlineEvent = () => {
    const deadlineEvents = [
      {
        type: 'deadline_approaching' as const,
        title: 'Audit Deadline Approaching',
        message: 'SOC 2 Type II audit scheduled in 7 days',
        severity: 'medium' as const
      },
      {
        type: 'deadline_approaching' as const,
        title: 'Contract Renewal Required',
        message: 'AWS contract expires in 30 days - renewal action needed',
        severity: 'medium' as const
      },
      {
        type: 'deadline_approaching' as const,
        title: 'Risk Assessment Overdue',
        message: 'Quarterly vendor risk assessments are 5 days overdue',
        severity: 'high' as const
      }
    ];

    const event = deadlineEvents[Math.floor(Math.random() * deadlineEvents.length)];
    const realTimeEvent: RealTimeEvent = {
      id: `deadline-${Date.now()}`,
      ...event,
      timestamp: new Date().toISOString(),
      projectId: currentProjectId,
      userId: user.id,
      metadata: { daysRemaining: Math.floor(Math.random() * 30) + 1 }
    };

    addEvent(realTimeEvent);
  };

  const generateAssessmentEvent = () => {
    const assessmentEvents = [
      {
        type: 'assessment_updated' as const,
        title: 'Automated Assessment Complete',
        message: 'Infrastructure scan completed - 12 controls validated',
        severity: 'low' as const
      },
      {
        type: 'assessment_updated' as const,
        title: 'Manual Review Required',
        message: '3 controls require manual validation and evidence upload',
        severity: 'medium' as const
      }
    ];

    const event = assessmentEvents[Math.floor(Math.random() * assessmentEvents.length)];
    const realTimeEvent: RealTimeEvent = {
      id: `assessment-${Date.now()}`,
      ...event,
      timestamp: new Date().toISOString(),
      projectId: currentProjectId,
      userId: user.id,
      metadata: { controlsAffected: Math.floor(Math.random() * 10) + 1 }
    };

    addEvent(realTimeEvent);
  };

  const addEvent = (event: RealTimeEvent) => {
    setEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events

    // Send notification based on severity
    const notificationType = event.severity === 'critical' ? 'error' :
                           event.severity === 'high' ? 'warning' :
                           event.severity === 'medium' ? 'info' : 'success';

    addNotification(event.message, notificationType);

    // Simulate additional actions for critical events
    if (event.severity === 'critical') {
      setTimeout(() => {
        addNotification('Emergency response team has been notified', 'info');
      }, 2000);
    }
  };

  const getEventIcon = (type: RealTimeEvent['type']) => {
    switch (type) {
      case 'risk_created': return '⚠️';
      case 'assessment_updated': return '✅';
      case 'vendor_incident': return '🏢';
      case 'compliance_changed': return '📊';
      case 'deadline_approaching': return '⏰';
      default: return '📋';
    }
  };

  const getSeverityColor = (severity: RealTimeEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-600/30';
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-600/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600/30';
      case 'low': return 'text-green-400 bg-green-900/20 border-green-600/30';
      default: return 'text-slate-400 bg-slate-900/20 border-slate-600/30';
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - eventTime.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50 transition-all duration-300 ${
      isMinimized ? 'w-64 h-12' : 'w-96 max-h-96'
    }`}>
      {/* Header */}
      <div className="p-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-sm font-medium text-white">Real-Time Events</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-xs text-slate-400">{events.length} events</div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-slate-400 hover:text-white transition-colors"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d={isMinimized ? "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" : "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"} clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-white transition-colors"
            title="Hide"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Events List */}
      {!isMinimized && (
      <div className="max-h-80 overflow-y-auto">
        {events.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-sm">
            No recent events
          </div>
        ) : (
          <div className="space-y-1">
            {events.slice(0, 10).map(event => (
              <div
                key={event.id}
                className={`p-3 border-l-2 hover:bg-slate-700/50 ${getSeverityColor(event.severity)}`}
              >
                <div className="flex items-start space-x-2">
                  <span className="text-lg">{getEventIcon(event.type)}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{event.title}</h4>
                    <p className="text-xs text-slate-300 mt-1">{event.message}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-slate-500 capitalize">{event.type.replace('_', ' ')}</span>
                      <span className="text-xs text-slate-500">{getRelativeTime(event.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isMinimized && events.length > 0 && (
        <div className="p-2 border-t border-slate-700">
          <button
            onClick={() => setEvents([])}
            className="w-full text-xs text-slate-400 hover:text-white transition-colors"
          >
            Clear All Events
          </button>
        </div>
      )}
    </div>
  );
};

export default RealTimeSystem;