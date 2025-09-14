
import React, { useState, useEffect } from 'react';
import type { Vendor, View } from '../../../types';
import { VendorLifecycleStage } from '../../../types';
import { mockApi } from '../../../services/api';
import { CheckCircleIcon } from '../../ui/Icons';

interface VendorDetailViewProps {
  vendorId: string;
  projectId: string;
  setView: (view: View) => void;
}

const lifecycleStages = [
    VendorLifecycleStage.IDENTIFICATION,
    VendorLifecycleStage.ONBOARDING,
    VendorLifecycleStage.ACTIVE,
    VendorLifecycleStage.OFFBOARDING,
];

const lifecycleDescriptions: Record<VendorLifecycleStage, string> = {
    [VendorLifecycleStage.IDENTIFICATION]: "Initial identification and business case for the vendor relationship.",
    [VendorLifecycleStage.ONBOARDING]: "Due diligence, risk assessment, and contract negotiation.",
    [VendorLifecycleStage.ACTIVE]: "Ongoing monitoring, performance reviews, and continuous risk assessment.",
    [VendorLifecycleStage.OFFBOARDING]: "Secure termination of access, data return/destruction, and final contract review.",
}

const VendorDetailView: React.FC<VendorDetailViewProps> = ({ vendorId, projectId, setView }) => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVendor = async () => {
      setIsLoading(true);
      const data = await mockApi.getVendorById(vendorId);
      setVendor(data || null);
      setIsLoading(false);
    };
    fetchVendor();
  }, [vendorId]);

  const handleAdvanceStage = async () => {
      if (!vendor) return;
      const currentIndex = lifecycleStages.indexOf(vendor.status);
      if (currentIndex < lifecycleStages.length - 1) {
          const nextStage = lifecycleStages[currentIndex + 1];
          const updatedVendor = await mockApi.updateVendorLifecycleStage(vendor.id, nextStage);
          setVendor(updatedVendor);
      }
  }

  if (isLoading) {
    return <div className="p-8">Loading vendor details...</div>;
  }

  if (!vendor) {
    return <div className="p-8">Vendor not found.</div>;
  }
  
  const currentStageIndex = lifecycleStages.indexOf(vendor.status);

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <header className="mb-8 flex justify-between items-start">
        <div>
            <button onClick={() => setView({ type: 'project', projectId, tab: 'vendors' })} className="text-sm text-blue-400 hover:underline mb-2">
            &larr; Back to Vendors
            </button>
            <h1 className="text-4xl font-bold text-white">{vendor.name}</h1>
            <p className="text-slate-400 mt-1">Service: {vendor.service}</p>
        </div>
         {currentStageIndex < lifecycleStages.length - 1 && (
            <button 
                onClick={handleAdvanceStage}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold text-white"
            >
                Advance to {lifecycleStages[currentStageIndex + 1]}
            </button>
        )}
      </header>
      <main>
        {/* Lifecycle Stepper */}
        <div className="mb-8">
             <ol className="relative grid grid-cols-4 text-sm font-medium text-gray-500">
                {lifecycleStages.map((stage, index) => (
                    <li key={stage} className="relative flex items-start justify-start">
                         <div className="flex flex-col items-center w-full">
                            <div className="flex items-center">
                                {index > 0 && <div className={`flex-1 h-0.5 ${index <= currentStageIndex ? 'bg-blue-500' : 'bg-slate-700'}`}></div>}
                                <span className={`flex items-center justify-center w-8 h-8 rounded-full ring-4 ${index <= currentStageIndex ? 'bg-blue-700 text-blue-200 ring-blue-900/50' : 'bg-slate-700 text-slate-400 ring-slate-800'}`}>
                                    {index < currentStageIndex ? <CheckCircleIcon className="w-5 h-5" /> : index + 1}
                                </span>
                                {index < lifecycleStages.length - 1 && <div className={`flex-1 h-0.5 ${index < currentStageIndex ? 'bg-blue-500' : 'bg-slate-700'}`}></div>}
                            </div>
                            <div className="mt-3 text-center">
                                <h3 className={`font-semibold ${index <= currentStageIndex ? 'text-white' : 'text-slate-400'}`}>{stage}</h3>
                                <p className="text-xs text-slate-500 mt-1">{lifecycleDescriptions[stage]}</p>
                            </div>
                         </div>
                    </li>
                ))}
            </ol>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 glass-card rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Due Diligence Questionnaire</h2>
                <p className="text-slate-500 text-center py-8">Questionnaire not yet sent.</p>
            </div>
             <div className="glass-card rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Details</h2>
                <div className="space-y-3 text-sm">
                    <div><p className="text-slate-400">Current Stage</p><p className="font-semibold text-blue-300">{vendor.status}</p></div>
                    <div><p className="text-slate-400">Tier</p><p className="font-semibold">Tier {vendor.tier}</p></div>
                    <div><p className="text-slate-400">Internal Owner</p><p className="font-semibold">{vendor.owner}</p></div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default VendorDetailView;
