

import React, { useState } from 'react';
import type { Vendor } from '../../../types';

interface NewVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vendorData: Omit<Vendor, 'id' | 'status'>) => void;
  projectId: string;
}

const NewVendorModal: React.FC<NewVendorModalProps> = ({ isOpen, onClose, onSave, projectId }) => {
  const [name, setName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [tier, setTier] = useState<'1' | '2' | '3' | '4'>('4');
  const [businessOwner, setBusinessOwner] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !serviceCategory || !businessOwner) {
      alert('Please fill out all fields.');
      return;
    }
    onSave({
      name,
      description: '',
      website: '',
      industry: '',
      headquarters: '',
      serviceCategory,
      servicesProvided: [serviceCategory],
      criticality: 'LOW',
      tier,
      overallRiskScore: 0,
      riskLevel: 'LOW',
      nextRiskAssessment: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      businessOwner,
      contacts: [],
      dataTypes: [],
      accessLevel: 'None',
      hasSystemAccess: false,
      annualSpend: 0,
      currency: 'USD',
      paymentTerms: 'Net 30',
      certifications: [],
      complianceFrameworks: [],
      projectId,
      regulatoryRequirements: []
    });
    // Reset form
    setName('');
    setServiceCategory('');
    setTier('4');
    setBusinessOwner('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl border border-slate-700 animate-fade-in-scale-up">
        <header className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Add New Vendor</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
            <div>
              <label htmlFor="vendorName" className="block text-sm font-medium text-slate-300 mb-1">Vendor Name</label>
              <input
                type="text"
                id="vendorName"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
             <div>
              <label htmlFor="vendorService" className="block text-sm font-medium text-slate-300 mb-1">Service Category</label>
              <input
                type="text"
                id="vendorService"
                value={serviceCategory}
                onChange={e => setServiceCategory(e.target.value)}
                className="w-full px-3 py-2 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Cloud Hosting, Penetration Testing"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="vendorTier" className="block text-sm font-medium text-slate-300 mb-1">Tier</label>
                <select
                  id="vendorTier"
                  value={tier}
                  onChange={e => setTier(e.target.value as '1' | '2' | '3' | '4')}
                  className="w-full px-3 py-2 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">Tier 1 (Critical)</option>
                  <option value="2">Tier 2 (Important)</option>
                  <option value="3">Tier 3 (Standard)</option>
                  <option value="4">Tier 4 (Low Risk)</option>
                </select>
              </div>
              <div>
                <label htmlFor="vendorOwner" className="block text-sm font-medium text-slate-300 mb-1">Business Owner</label>
                <input
                  type="text"
                  id="vendorOwner"
                  value={businessOwner}
                  onChange={e => setBusinessOwner(e.target.value)}
                  className="w-full px-3 py-2 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>
          <footer className="p-4 border-t border-slate-700 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 transition-colors text-white">Save Vendor</button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default NewVendorModal;