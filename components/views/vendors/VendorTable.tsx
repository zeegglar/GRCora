

import React, { useState } from 'react';
import type { Vendor, View } from '../../../types';
import { PlusCircleIcon } from '../../ui/Icons';
import NewVendorModal from './NewVendorModal';

interface VendorTableProps {
  vendors: Vendor[];
  setView: (view: View) => void;
  projectId: string;
  onCreateVendor: (vendorData: Omit<Vendor, 'id' | 'status'>) => void;
}

const VendorTable: React.FC<VendorTableProps> = ({ vendors, setView, projectId, onCreateVendor }) => {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  return (
    <>
      <div className="glass-card rounded-lg overflow-hidden">
        <div className="p-4 bg-slate-800/50 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Third-Party Vendors</h3>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold text-white text-sm"
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Add Vendor</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
              <tr>
                <th scope="col" className="px-6 py-3">Vendor Name</th>
                <th scope="col" className="px-6 py-3">Service</th>
                <th scope="col" className="px-6 py-3">Tier</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Owner</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  onClick={() => setView({ type: 'vendorDetail', projectId, vendorId: vendor.id })}
                  className="border-b border-slate-700 hover:bg-slate-800/40 cursor-pointer"
                >
                  <td className="px-6 py-4 font-medium text-white">{vendor.name}</td>
                  <td className="px-6 py-4">{vendor.serviceCategory}</td>
                  <td className="px-6 py-4">{`Tier ${vendor.tier}`}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${vendor.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/50 text-slate-400'}`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{vendor.businessOwner}</td>
                </tr>
              ))}
              {vendors.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">No vendors added to this project.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <NewVendorModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={onCreateVendor}
        projectId={projectId}
      />
    </>
  );
};

export default VendorTable;