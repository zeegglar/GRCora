import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

interface ClientDetails {
  name: string;
  industry: string;
  size: string;
  domain: string;
  frameworks: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  projectScope: string;
  timeline: string;
  budget: string;
}

const ClientOnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [clientDetails, setClientDetails] = useState<ClientDetails>({
    name: '',
    industry: '',
    size: '',
    domain: '',
    frameworks: [],
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    projectScope: '',
    timeline: '',
    budget: ''
  });

  const frameworks = [
    { id: 'nist_csf', name: 'NIST Cybersecurity Framework 2.0', description: 'Comprehensive cybersecurity framework' },
    { id: 'iso_27001', name: 'ISO 27001:2022', description: 'International information security standard' },
    { id: 'nist_800_53', name: 'NIST SP 800-53', description: 'Security controls for federal information systems' },
    { id: 'cis_v8', name: 'CIS Controls v8', description: 'Prioritized cybersecurity controls' },
    { id: 'soc2', name: 'SOC 2', description: 'Service organization controls for security' }
  ];

  const industries = [
    'Healthcare', 'Financial Services', 'Technology', 'Manufacturing',
    'Education', 'Government', 'Nonprofit', 'Retail', 'Energy', 'Other'
  ];

  const organizationSizes = [
    'Small (1-50 employees)',
    'Medium (51-200 employees)',
    'Large (201-1000 employees)',
    'Enterprise (1000+ employees)'
  ];

  const handleInputChange = (field: keyof ClientDetails, value: string | string[]) => {
    setClientDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleFrameworkToggle = (frameworkId: string) => {
    const currentFrameworks = clientDetails.frameworks;
    const updatedFrameworks = currentFrameworks.includes(frameworkId)
      ? currentFrameworks.filter(f => f !== frameworkId)
      : [...currentFrameworks, frameworkId];

    handleInputChange('frameworks', updatedFrameworks);
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: clientDetails.name,
          domain: clientDetails.domain,
          industry: clientDetails.industry,
          size: clientDetails.size
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          organization_id: orgData.id,
          name: `${clientDetails.name} - Security Assessment`,
          description: clientDetails.projectScope,
          frameworks: clientDetails.frameworks,
          status: 'Active'
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create user profile for contact
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .insert({
          organization_id: orgData.id,
          name: clientDetails.contactName,
          email: clientDetails.contactEmail,
          phone: clientDetails.contactPhone,
          role: 'client_admin'
        });

      if (userError) throw userError;

      alert('Client successfully onboarded! Redirecting to project dashboard...');
      // Redirect logic here

    } catch (error) {
      console.error('Error onboarding client:', error);
      alert('Error creating client. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return clientDetails.name && clientDetails.industry && clientDetails.size;
      case 2:
        return clientDetails.frameworks.length > 0;
      case 3:
        return clientDetails.contactName && clientDetails.contactEmail;
      case 4:
        return clientDetails.projectScope && clientDetails.timeline && clientDetails.budget;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Onboarding</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Add a new client to your GRC portfolio</p>
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map(num => (
              <div
                key={num}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  num === step
                    ? 'bg-blue-600 text-white'
                    : num < step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}
              >
                {num < step ? '✓' : num}
              </div>
            ))}
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Organization Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
            <input
              type="text"
              placeholder="e.g., Green Earth Foundation"
              value={clientDetails.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website Domain (optional)</label>
            <input
              type="text"
              placeholder="e.g., greenearthfoundation.org"
              value={clientDetails.domain}
              onChange={(e) => handleInputChange('domain', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
            <select
              value={clientDetails.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select industry...</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Organization Size</label>
            <select
              value={clientDetails.size}
              onChange={(e) => handleInputChange('size', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select size...</option>
              {organizationSizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Compliance Frameworks</h2>
          <p className="text-gray-600">Select the frameworks your client needs to comply with</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {frameworks.map(framework => (
              <div
                key={framework.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  clientDetails.frameworks.includes(framework.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleFrameworkToggle(framework.id)}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={clientDetails.frameworks.includes(framework.id)}
                    onChange={() => handleFrameworkToggle(framework.id)}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{framework.name}</h3>
                    <p className="text-sm text-gray-600">{framework.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Primary Contact</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
            <input
              type="text"
              placeholder="e.g., Sarah Johnson"
              value={clientDetails.contactName}
              onChange={(e) => handleInputChange('contactName', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              placeholder="e.g., sarah@greenearthfoundation.org"
              value={clientDetails.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (optional)</label>
            <input
              type="tel"
              placeholder="e.g., (555) 123-4567"
              value={clientDetails.contactPhone}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Project Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Scope</label>
            <textarea
              placeholder="Describe the security assessment scope, goals, and deliverables..."
              value={clientDetails.projectScope}
              onChange={(e) => handleInputChange('projectScope', e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
            <select
              value={clientDetails.timeline}
              onChange={(e) => handleInputChange('timeline', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select timeline...</option>
              <option value="1-3 months">1-3 months</option>
              <option value="3-6 months">3-6 months</option>
              <option value="6-12 months">6-12 months</option>
              <option value="12+ months">12+ months</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
            <select
              value={clientDetails.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select budget range...</option>
              <option value="$10,000 - $25,000">$10,000 - $25,000</option>
              <option value="$25,000 - $50,000">$25,000 - $50,000</option>
              <option value="$50,000 - $100,000">$50,000 - $100,000</option>
              <option value="$100,000+">$100,000+</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className={`px-6 py-2 rounded-md font-medium ${
            step === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Back
        </button>

        <div className="space-x-3">
          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`px-6 py-2 rounded-md font-medium ${
                isStepValid()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStepValid() || isLoading}
              className={`px-6 py-2 rounded-md font-medium ${
                isStepValid() && !isLoading
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Creating Client...' : 'Complete Onboarding'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientOnboardingWizard;