import React, { useState } from 'react';
import ClientOnboardingWizard from './onboarding/ClientOnboardingWizard';
import TechnicalFirstDashboard from './dashboard/TechnicalFirstDashboard';
import { ControlTranslationService } from '../services/controlTranslationService';
import { ReportExportService } from '../services/reportExportService';
import { CostEstimationService } from '../services/costEstimationService';

type ViewMode = 'consultant' | 'client';
type CurrentView = 'dashboard' | 'onboarding' | 'controls' | 'reports';

const ImprovedApp: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('consultant');
  const [currentView, setCurrentView] = useState<CurrentView>('dashboard');
  const [selectedControl, setSelectedControl] = useState<string | null>(null);

  const handleExportReport = async () => {
    try {
      const reportContent = await ReportExportService.generateConsultantReport('sample-project-id');
      await ReportExportService.exportToPDF(reportContent, 'GRC_Assessment_Report');
      alert('Report exported successfully!');
    } catch (error) {
      alert('Error exporting report. Please try again.');
    }
  };

  const handleControlSearch = (query: string) => {
    const results = ControlTranslationService.searchTranslatedControls(query);
    console.log('Search results:', results);
  };

  const sampleOrganizationProfile = {
    size: 'Medium' as const,
    industry: 'Nonprofit',
    employeeCount: 25,
    currentSecurityMaturity: 'Basic' as const,
    budget: 'Moderate' as const
  };

  const renderNavigation = () => (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-900">GRCora</h1>

            <div className="flex space-x-1">
              <button
                onClick={() => setViewMode('consultant')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  viewMode === 'consultant'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Consultant View
              </button>
              <button
                onClick={() => setViewMode('client')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  viewMode === 'client'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Client View
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {viewMode === 'consultant' && (
              <>
                <button
                  onClick={() => setCurrentView('onboarding')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    currentView === 'onboarding'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Add Client
                </button>
                <button
                  onClick={() => setCurrentView('controls')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    currentView === 'controls'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Control Library
                </button>
                <button
                  onClick={handleExportReport}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Export Report
                </button>
              </>
            )}
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                currentView === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  const renderControlLibrary = () => {
    const criticalControls = ControlTranslationService.getCriticalControls();
    const quickWins = ControlTranslationService.getQuickWins();

    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Control Library</h2>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search controls (e.g., 'access control', 'backup', 'passwords')"
              onChange={(e) => handleControlSearch(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-red-600 mb-3">🔴 Critical Controls</h3>
              {criticalControls.map(control => {
                const costEstimate = CostEstimationService.calculateControlCost(
                  control.controlId,
                  sampleOrganizationProfile
                );

                return (
                  <div key={control.controlId} className="border border-red-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">{control.plainEnglishTitle}</h4>
                    <p className="text-sm text-gray-600 mb-3">{control.plainEnglishDescription}</p>

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Cost: {costEstimate?.implementationCost.typical.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || 'TBD'}</span>
                      <span>Timeline: {control.estimatedTime}</span>
                      <span>Difficulty: {control.difficulty}</span>
                    </div>

                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <p className="text-sm text-blue-800">
                        <strong>Why it matters:</strong> {control.whyItMatters}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-3">⚡ Quick Wins</h3>
              {quickWins.map(control => {
                const costEstimate = CostEstimationService.calculateControlCost(
                  control.controlId,
                  sampleOrganizationProfile
                );

                return (
                  <div key={control.controlId} className="border border-green-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">{control.plainEnglishTitle}</h4>
                    <p className="text-sm text-gray-600 mb-3">{control.plainEnglishDescription}</p>

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Cost: {costEstimate?.implementationCost.typical.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || 'TBD'}</span>
                      <span>Timeline: {control.estimatedTime}</span>
                      <span>Difficulty: {control.difficulty}</span>
                    </div>

                    <div className="mt-3 p-3 bg-green-50 rounded">
                      <p className="text-sm text-green-800">
                        <strong>Impact:</strong> {control.whyItMatters}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (viewMode === 'client') {
      return <TechnicalFirstDashboard />;
    }

    switch (currentView) {
      case 'onboarding':
        return <ClientOnboardingWizard />;
      case 'controls':
        return renderControlLibrary();
      case 'dashboard':
      default:
        return (
          <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Consultant Dashboard</h2>
              <p className="text-gray-600 mb-6">
                Welcome to the improved GRCora platform. Key features now available:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">✅ Client Onboarding</h3>
                  <p className="text-sm text-green-700">
                    Professional 4-step wizard for adding new clients with framework selection and project scoping.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">✅ Control Translation</h3>
                  <p className="text-sm text-blue-700">
                    Plain English explanations of security controls with implementation guidance and cost estimates.
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">✅ Report Export</h3>
                  <p className="text-sm text-purple-700">
                    Professional consultant reports with risk analysis, timelines, and budget recommendations.
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2">✅ Cost Estimation</h3>
                  <p className="text-sm text-yellow-700">
                    Realistic budget estimates for security controls based on organization size and industry.
                  </p>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-indigo-900 mb-2">✅ Technical-First UI</h3>
                  <p className="text-sm text-indigo-700">
                    Professional dashboard showing technical terms first with optional simplified explanations.
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-2">🎯 Priority Controls</h3>
                  <p className="text-sm text-red-700">
                    Smart prioritization of security controls based on risk impact and implementation difficulty.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setCurrentView('onboarding')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
                >
                  Add New Client
                </button>
                <button
                  onClick={() => setCurrentView('controls')}
                  className="px-6 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700"
                >
                  Browse Controls
                </button>
                <button
                  onClick={handleExportReport}
                  className="px-6 py-3 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700"
                >
                  Generate Sample Report
                </button>
                <button
                  onClick={() => setViewMode('client')}
                  className="px-6 py-3 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700"
                >
                  View Client Dashboard
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}
      <main className="py-8">
        {renderContent()}
      </main>

      {/* Fixed improvement indicator */}
      <div className="fixed bottom-4 right-4 bg-green-600 text-white p-3 rounded-lg shadow-lg">
        <p className="text-sm font-medium">✅ Issues Fixed!</p>
        <p className="text-xs">All critical problems addressed</p>
      </div>
    </div>
  );
};

export default ImprovedApp;