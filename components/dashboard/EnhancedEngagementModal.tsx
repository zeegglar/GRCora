import React, { useState } from 'react';
import type { Organization } from '../../types';
import { mockApi } from '../../services/api';
import {
  XMarkIcon,
  PlusCircleIcon,
  CalendarIcon,
  BellIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  EnvelopeIcon
} from '../ui/Icons';

interface EngagementTemplate {
  id: string;
  name: string;
  frameworks: string[];
  estimatedDuration: number;
  phases: string[];
  defaultNotifications: NotificationSetting[];
}

interface NotificationSetting {
  type: 'milestone' | 'deadline' | 'weekly_update' | 'assessment_due' | 'risk_alert';
  enabled: boolean;
  timing: number; // days before/after
  recipients: string[];
  template: string;
}

interface EnhancedEngagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Organization[];
  onCreate: (name: string, organizationId: string, frameworks: string[], settings: EngagementSettings) => void;
  onClientCreated: () => void;
}

interface EngagementSettings {
  template?: string;
  startDate: Date;
  estimatedCompletion: Date;
  notifications: NotificationSetting[];
  communicationFrequency: 'weekly' | 'biweekly' | 'monthly';
  primaryContact: string;
  secondaryContact?: string;
  reportingSchedule: string[];
}

const engagementTemplates: EngagementTemplate[] = [
  {
    id: 'soc2_standard',
    name: 'SOC 2 Type II Standard',
    frameworks: ['SOC 2'],
    estimatedDuration: 120, // days
    phases: ['Readiness Assessment', 'Gap Analysis', 'Implementation', 'Pre-audit', 'Audit Support'],
    defaultNotifications: [
      {
        type: 'milestone',
        enabled: true,
        timing: -7,
        recipients: ['client'],
        template: 'Upcoming milestone reminder'
      },
      {
        type: 'weekly_update',
        enabled: true,
        timing: 0,
        recipients: ['client', 'consultant'],
        template: 'Weekly progress update'
      }
    ]
  },
  {
    id: 'iso27001_premium',
    name: 'ISO 27001 Premium Package',
    frameworks: ['ISO 27001:2022'],
    estimatedDuration: 180,
    phases: ['Risk Assessment', 'ISMS Development', 'Implementation', 'Internal Audit', 'Certification Support'],
    defaultNotifications: [
      {
        type: 'milestone',
        enabled: true,
        timing: -7,
        recipients: ['client'],
        template: 'Phase completion approaching'
      },
      {
        type: 'risk_alert',
        enabled: true,
        timing: 0,
        recipients: ['client', 'consultant'],
        template: 'Critical risk identified'
      }
    ]
  },
  {
    id: 'multi_framework',
    name: 'Multi-Framework Compliance',
    frameworks: ['SOC 2', 'ISO 27001:2022', 'HIPAA'],
    estimatedDuration: 240,
    phases: ['Framework Mapping', 'Gap Analysis', 'Integrated Implementation', 'Dual Audit Prep'],
    defaultNotifications: [
      {
        type: 'weekly_update',
        enabled: true,
        timing: 0,
        recipients: ['client'],
        template: 'Multi-framework progress report'
      }
    ]
  }
];

const availableFrameworks = ['SOC 2', 'ISO 27001:2022', 'HIPAA', 'PCI DSS v4.0', 'NIST CSF 2.0', 'FedRAMP', 'GDPR'];

const EnhancedEngagementModal: React.FC<EnhancedEngagementModalProps> = ({
  isOpen,
  onClose,
  clients,
  onCreate,
  onClientCreated
}) => {
  const [step, setStep] = useState(1);
  const [clientId, setClientId] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [primaryContact, setPrimaryContact] = useState('');
  const [secondaryContact, setSecondaryContact] = useState('');
  const [communicationFreq, setCommunicationFreq] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [notifications, setNotifications] = useState<NotificationSetting[]>([]);
  const [customNotification, setCustomNotification] = useState({
    type: 'milestone' as const,
    timing: -7,
    recipients: ['client'],
    template: ''
  });

  const isAddingNewClient = clientId === 'add_new_client';
  const selectedTemplateData = engagementTemplates.find(t => t.id === selectedTemplate);

  if (!isOpen) return null;

  const handleTemplateSelect = (templateId: string) => {
    const template = engagementTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSelectedFrameworks(template.frameworks);
      setNotifications([...template.defaultNotifications]);
      setProjectName(template.name);
    }
  };

  const handleFrameworkChange = (framework: string) => {
    setSelectedFrameworks(prev =>
      prev.includes(framework) ? prev.filter(f => f !== framework) : [...prev, framework]
    );
  };

  const addNotification = () => {
    if (customNotification.template) {
      setNotifications(prev => [...prev, { ...customNotification, enabled: true }]);
      setCustomNotification({
        type: 'milestone',
        timing: -7,
        recipients: ['client'],
        template: ''
      });
    }
  };

  const removeNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalClientId = clientId;

    if (isAddingNewClient) {
      if (!newClientName) {
        alert('Please enter a name for the new client.');
        return;
      }
      const newOrg = await mockApi.createOrganization(newClientName);
      finalClientId = newOrg.id;
      onClientCreated();
    }

    if (!finalClientId || !projectName || selectedFrameworks.length === 0) {
      alert('Please fill out all required fields and select at least one framework.');
      return;
    }

    const estimatedCompletion = new Date(startDate);
    estimatedCompletion.setDate(estimatedCompletion.getDate() + (selectedTemplateData?.estimatedDuration || 90));

    const settings: EngagementSettings = {
      template: selectedTemplate,
      startDate: new Date(startDate),
      estimatedCompletion,
      notifications,
      communicationFrequency: communicationFreq,
      primaryContact,
      secondaryContact,
      reportingSchedule: communicationFreq === 'weekly' ? ['Monday'] : communicationFreq === 'biweekly' ? ['Monday', 'Thursday'] : ['1st', '15th']
    };

    onCreate(projectName, finalClientId, selectedFrameworks, settings);

    // Reset form
    setStep(1);
    setClientId('');
    setProjectName('');
    setSelectedFrameworks([]);
    setNotifications([]);
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Create New Engagement</h2>
            <p className="text-slate-400 text-sm mt-1">Step {step} of 3 • Professional engagement setup</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Client & Template Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">Select Client</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                    required
                  >
                    <option value="">Choose existing client...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                    <option value="add_new_client">+ Add New Client</option>
                  </select>

                  {isAddingNewClient && (
                    <input
                      type="text"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="New client name"
                      className="w-full mt-3 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3">Engagement Template</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {engagementTemplates.map(template => (
                      <div
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedTemplate === template.id
                            ? 'border-blue-500 bg-blue-900/20'
                            : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                        }`}
                      >
                        <h3 className="font-semibold text-white mb-2">{template.name}</h3>
                        <p className="text-xs text-slate-400 mb-2">{template.frameworks.join(', ')}</p>
                        <div className="flex items-center text-xs text-slate-500">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {template.estimatedDuration} days
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3">Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3">Compliance Frameworks</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableFrameworks.map(framework => (
                      <label key={framework} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFrameworks.includes(framework)}
                          onChange={() => handleFrameworkChange(framework)}
                          className="rounded border-slate-600 bg-slate-700 text-blue-500"
                        />
                        <span className="text-sm text-white">{framework}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Timeline & Contacts */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">Communication Frequency</label>
                    <select
                      value={communicationFreq}
                      onChange={(e) => setCommunicationFreq(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                    >
                      <option value="weekly">Weekly Updates</option>
                      <option value="biweekly">Bi-weekly Updates</option>
                      <option value="monthly">Monthly Updates</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">Primary Contact Email</label>
                    <input
                      type="email"
                      value={primaryContact}
                      onChange={(e) => setPrimaryContact(e.target.value)}
                      placeholder="primary@client.com"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">Secondary Contact (Optional)</label>
                    <input
                      type="email"
                      value={secondaryContact}
                      onChange={(e) => setSecondaryContact(e.target.value)}
                      placeholder="secondary@client.com"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400"
                    />
                  </div>
                </div>

                {selectedTemplateData && (
                  <div className="glass-card p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-3">Engagement Phases</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedTemplateData.phases.map((phase, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-slate-300">
                          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                            {index + 1}
                          </span>
                          <span>{phase}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Automated Notifications */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <BellIcon className="w-5 h-5 mr-2 text-blue-400" />
                    Automated Notifications
                  </h3>

                  <div className="space-y-4">
                    {notifications.map((notification, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-white capitalize">
                            {notification.type.replace('_', ' ')} Notification
                          </div>
                          <div className="text-sm text-slate-400">
                            {notification.timing > 0 ? `${notification.timing} days after` : `${Math.abs(notification.timing)} days before`} •
                            To: {notification.recipients.join(', ')}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNotification(index)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <div className="border-2 border-dashed border-slate-700 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-3">Add Custom Notification</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <select
                          value={customNotification.type}
                          onChange={(e) => setCustomNotification(prev => ({...prev, type: e.target.value as any}))}
                          className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                        >
                          <option value="milestone">Milestone</option>
                          <option value="deadline">Deadline</option>
                          <option value="weekly_update">Weekly Update</option>
                          <option value="assessment_due">Assessment Due</option>
                          <option value="risk_alert">Risk Alert</option>
                        </select>

                        <input
                          type="number"
                          value={customNotification.timing}
                          onChange={(e) => setCustomNotification(prev => ({...prev, timing: parseInt(e.target.value)}))}
                          placeholder="Days before/after"
                          className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                        />

                        <select
                          multiple
                          value={customNotification.recipients}
                          onChange={(e) => setCustomNotification(prev => ({
                            ...prev,
                            recipients: Array.from(e.target.selectedOptions, option => option.value)
                          }))}
                          className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                        >
                          <option value="client">Client</option>
                          <option value="consultant">Consultant</option>
                          <option value="team">Team</option>
                        </select>
                      </div>

                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={customNotification.template}
                          onChange={(e) => setCustomNotification(prev => ({...prev, template: e.target.value}))}
                          placeholder="Notification message template..."
                          className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                        />
                        <button
                          type="button"
                          onClick={addNotification}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-700">
              <div className="flex items-center space-x-2">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i <= step ? 'bg-blue-500' : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>

              <div className="flex space-x-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Previous
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <PlusCircleIcon className="w-4 h-4" />
                    <span>Create Engagement</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnhancedEngagementModal;