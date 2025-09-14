import React, { useState, useRef, useEffect } from 'react';
import type { AssessmentItem, Control, Project, ControlMapping } from '../../../types';
import { AssessmentStatus } from '../../../types';
import AIAssistPanel from '../../ui/AIAssistPanel';
import { LinkIcon } from '../../ui/Icons';
import ControlMappingModal from './ControlMappingModal';

interface AssessmentTableProps {
  assessmentItems: AssessmentItem[];
  controls: Map<string, Control>;
  project: Project;
  controlMappings: ControlMapping[];
  onUpdateItem: (itemId: string, updates: Partial<Pick<AssessmentItem, 'status' | 'notes' | 'remediationPlan'>>) => Promise<void>;
  onCreateMapping: (sourceControlId: string, targetControlId: string) => void;
  onDeleteMapping: (mappingId: string) => void;
  onOpenNewPolicyModal: (content: string, control: Control) => void;
}

const statusStyles: { [key in AssessmentStatus]: string } = {
  [AssessmentStatus.COMPLETED]: 'bg-green-500/20 text-green-400',
  [AssessmentStatus.IN_PROGRESS]: 'bg-yellow-500/20 text-yellow-400',
  [AssessmentStatus.IN_REVIEW]: 'bg-blue-500/20 text-blue-400',
  [AssessmentStatus.NOT_STARTED]: 'bg-slate-600/50 text-slate-400',
};

const AssessmentStatusDropdown: React.FC<{
    item: AssessmentItem;
    onUpdateStatus: (itemId: string, status: AssessmentStatus) => void;
}> = ({ item, onUpdateStatus }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (status: AssessmentStatus) => {
        onUpdateStatus(item.id, status);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setIsOpen(!isOpen)} className={`inline-flex items-center w-32 justify-center px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles[item.status]}`}>
                {item.status}
            </button>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-32 bg-slate-700 border border-slate-600 rounded-md shadow-lg">
                    {Object.values(AssessmentStatus).map(status => (
                        <a
                            key={status}
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleSelect(status); }}
                            className="block px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-600"
                        >
                            {status}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

const AssessmentDetailModal: React.FC<{
    item: AssessmentItem;
    control: Control;
    project: Project;
    onUpdateItem: (itemId: string, updates: Partial<Pick<AssessmentItem, 'status' | 'notes' | 'remediationPlan'>>) => Promise<void>;
    onOpenNewPolicyModal: (content: string, control: Control) => void;
}> = ({ item, control, project, onUpdateItem, onOpenNewPolicyModal }) => {
    const [notes, setNotes] = useState(item.notes);
    const [isSaving, setIsSaving] = useState(false);
    
    const handleSaveNotes = async () => {
        setIsSaving(true);
        await onUpdateItem(item.id, { notes });
        setIsSaving(false);
    };

    const handleApplyRemediation = async (remediationPlan: string) => {
        await onUpdateItem(item.id, { remediationPlan });
        alert("Remediation plan applied!");
    };

    const handleApplyPolicy = (policyContent: string) => {
        onOpenNewPolicyModal(policyContent, control);
    };

    return (
        <div className="p-4">
            <h4 className="font-semibold text-white">Control Description</h4>
            <p className="text-slate-400 mt-1 mb-4">{control.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                    <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={5}
                        className="w-full p-2 text-sm bg-slate-900/50 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                     <button 
                        onClick={handleSaveNotes}
                        disabled={isSaving}
                        className="mt-2 px-3 py-1 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Notes'}
                    </button>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Remediation Plan</label>
                    <div className="w-full p-2 text-sm bg-slate-900/50 border border-slate-700 rounded-md min-h-[110px] whitespace-pre-wrap">
                        {item.remediationPlan || <span className="text-slate-500">No plan defined. Use AI Assist to draft one.</span>}
                    </div>
                </div>
            </div>

            <AIAssistPanel 
                control={control} 
                project={project}
                onApplyRemediation={handleApplyRemediation}
                onApplyPolicy={handleApplyPolicy}
            />
        </div>
    )
}

const AssessmentTable: React.FC<AssessmentTableProps> = ({ 
  assessmentItems, 
  controls, 
  project, 
  controlMappings, 
  onUpdateItem, 
  onCreateMapping, 
  onDeleteMapping,
  onOpenNewPolicyModal
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };
  
  const handleOpenMappingModal = (control: Control) => {
      setSelectedControl(control);
      setIsMappingModalOpen(true);
  }

  return (
    <>
      <div className="glass-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
              <tr>
                <th scope="col" className="px-6 py-3">Control ID</th>
                <th scope="col" className="px-6 py-3">Control Name</th>
                <th scope="col" className="px-6 py-3">Family</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Mappings</th>
              </tr>
            </thead>
            <tbody>
              {assessmentItems.map((item) => {
                const control = controls.get(item.controlId);
                if (!control) return null;
                return (
                  <React.Fragment key={item.id}>
                    <tr onClick={() => toggleRow(item.id)} className="border-b border-slate-700 hover:bg-slate-800/40 cursor-pointer">
                      <td className="px-6 py-4 font-mono">{control.id}</td>
                      <td className="px-6 py-4 font-medium text-white">{control.name}</td>
                      <td className="px-6 py-4 text-slate-400">{control.family}</td>
                      <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                        <AssessmentStatusDropdown item={item} onUpdateStatus={(id, status) => onUpdateItem(id, { status })} />
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={(e) => { e.stopPropagation(); handleOpenMappingModal(control); }} className="p-1 rounded-md hover:bg-slate-700">
                           <LinkIcon className="h-5 w-5 text-slate-400" />
                        </button>
                      </td>
                    </tr>
                    {expandedRow === item.id && (
                      <tr className="bg-slate-800/20">
                        <td colSpan={5} className="p-0">
                          <AssessmentDetailModal 
                            item={item} 
                            control={control} 
                            project={project} 
                            onUpdateItem={onUpdateItem}
                            onOpenNewPolicyModal={onOpenNewPolicyModal}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {selectedControl && (
        <ControlMappingModal 
          isOpen={isMappingModalOpen}
          onClose={() => setIsMappingModalOpen(false)}
          control={selectedControl}
          allControls={Array.from(controls.values())}
          mappings={controlMappings.filter(m => m.sourceControlId === selectedControl.id || m.targetControlId === selectedControl.id)}
          onCreate={onCreateMapping}
          onDelete={onDeleteMapping}
        />
      )}
    </>
  );
};

export default AssessmentTable;