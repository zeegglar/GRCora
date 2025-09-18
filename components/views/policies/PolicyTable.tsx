

import React, { useState } from 'react';
import type { Policy, PolicyVersion, User } from '../../../types';
import { PolicyStatus, UserRole } from '../../../types';
import { mockUsers, mockApi } from '../../../services/api';
import { PlusCircleIcon } from '../../ui/Icons';
import PolicyHistoryModal from './PolicyHistoryModal';

interface PolicyTableProps {
  policies: Policy[];
  user: User;
  onOpenNewPolicyModal: () => void;
  onUpdateStatus: (policyId: string, status: PolicyStatus) => void;
}

const statusStyles: { [key in PolicyStatus]: string } = {
  [PolicyStatus.APPROVED]: 'bg-green-500/20 text-green-400',
  [PolicyStatus.IN_REVIEW]: 'bg-blue-500/20 text-blue-400',
  [PolicyStatus.DRAFT]: 'bg-yellow-500/20 text-yellow-400',
  [PolicyStatus.ARCHIVED]: 'bg-slate-600/50 text-slate-400',
  [PolicyStatus.REJECTED]: 'bg-red-500/20 text-red-400',
};

const PolicyTable: React.FC<PolicyTableProps> = ({ policies, user, onOpenNewPolicyModal, onUpdateStatus }) => {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [policyHistory, setPolicyHistory] = useState<PolicyVersion[]>([]);
  
  const userMap: Map<string, string> = new Map(mockUsers.map(u => [u.id, u.name]));
  const isClientAdmin = user.role === UserRole.CLIENT_ADMIN;

  const handleViewHistory = async (policy: Policy) => {
    setSelectedPolicy(policy);
    const history = await mockApi.getPolicyVersions(policy.id);
    setPolicyHistory(history);
    setIsHistoryModalOpen(true);
  };

  return (
    <>
      <div className="glass-card rounded-lg overflow-hidden">
        <div className="p-4 bg-slate-800/50 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Policy Library</h3>
          <button
            onClick={onOpenNewPolicyModal}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold text-white text-sm"
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>New Policy</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
              <tr>
                <th scope="col" className="px-6 py-3">Policy Title</th>
                <th scope="col" className="px-6 py-3">Version</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Owner</th>
                <th scope="col" className="px-6 py-3">Last Updated</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => (
                <tr key={policy.id} className="border-b border-slate-700 hover:bg-slate-800/40">
                  <td className="px-6 py-4 font-medium text-white">{policy.title}</td>
                  <td className="px-6 py-4">{policy.version}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[policy.status]}`}>
                      {policy.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{userMap.get(policy.ownerId) || 'Unknown'}</td>
                  <td className="px-6 py-4">{policy.lastUpdated}</td>
                  <td className="px-6 py-4 space-x-2">
                    {isClientAdmin && policy.status === PolicyStatus.IN_REVIEW && (
                      <>
                        <button onClick={() => onUpdateStatus(policy.id, PolicyStatus.APPROVED)} className="text-green-400 hover:underline text-xs font-semibold">Approve</button>
                        <button onClick={() => onUpdateStatus(policy.id, PolicyStatus.REJECTED)} className="text-yellow-400 hover:underline text-xs font-semibold">Reject</button>
                      </>
                    )}
                    <button 
                      onClick={() => handleViewHistory(policy)}
                      className="text-blue-400 hover:underline text-xs"
                    >
                      View History
                    </button>
                  </td>
                </tr>
              ))}
              {policies.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">No policies found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <PolicyHistoryModal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)}
        policy={selectedPolicy}
        history={policyHistory}
      />
    </>
  );
};

export default PolicyTable;