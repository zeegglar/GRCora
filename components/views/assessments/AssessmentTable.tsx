
import React, { useState, useMemo } from 'react';
import type { AssessmentItem, Control, User, Project } from '../../../types';
import { mockApi } from '../../../services/api';
import AIAssistPanel from '../../ui/AIAssistPanel';
import ControlMappingModal from './ControlMappingModal';
import { LinkIcon } from '../../ui/Icons';
import SendReminderModal from './SendReminderModal';
import { UserRole } from '../../../types';

// FIX: Add project to props to receive the full project context.
interface AssessmentTableProps {
  assessmentItems: AssessmentItem[];
  controls: Map<string, Control>;
  user: User;
  onUpdate: () => void;
  project: Project;
}

const statusStyles = {
  'Compliant': 'bg-green-500/20 text-green-400',
  'Non-Compliant': 'bg-red-500/20 text-red-400',
  'In Progress': 'bg-yellow-500/20 text-yellow-400',
  'Not Applicable': 'bg-slate-600/50 text-slate-400',
};

// FIX: Add project to props to receive the full project context from AssessmentTable.
const AssessmentRow: React.FC<{ 
  item: AssessmentItem; 
  control: Control; 
  allControls: Control[];
  user: User;
  onUpdate: () => void;
  project: Project;
}> = ({ item, control, allControls, user, onUpdate, project }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [mappings, setMappings] = useState([]);

  const isConsultant = [UserRole.CONSULTANT_OWNER, UserRole.CONSULTANT_ADMIN, UserRole.CONSULTANT_COLLABORATOR].includes(user.role);

  const handleStatusChange = (newStatus: AssessmentItem['status']) => {
    mockApi.updateAssessmentItemStatus(item.id, newStatus).then(onUpdate);
  };

  const handleApplyRemediation = (plan: string) => {
    mockApi.updateAssessmentItemNotes(item.id, item.notes + `\n\n---REMEDIATION---\n` + plan).then(onUpdate);
  }

  const handleApplyPolicy = (content: string) => {
    // In a real app, this would open the new policy modal with pre-filled content
    alert("Policy content created. Please paste it into a new policy document.");
  }

  const handleCopyToNotes = (content: string) => {
    const newNotes = item.notes
      ? `${item.notes}\n\n--- Copied from GRCora Assist ---\n${content}`
      : `--- Copied from GRCora Assist ---\n${content}`;
    mockApi.updateAssessmentItemNotes(item.id, newNotes).then(onUpdate);
  };

  const handleOpenMapping = async () => {
    const data = await mockApi.getMappingsForControl(control.id);
    setMappings(data);
    setIsMappingModalOpen(true);
  }

  const handleCreateMapping = async (sourceId: string, targetId: string) => {
    await mockApi.createMapping(sourceId, targetId);
    handleOpenMapping(); // Refresh
  }

  const handleDeleteMapping = async (mappingId: string) => {
    await mockApi.deleteMapping(mappingId);
    handleOpenMapping(); // Refresh
  }

  return (
    <>
      <tr onClick={() => setIsExpanded(!isExpanded)} className="border-b border-slate-700 hover:bg-slate-800/40 cursor-pointer">
        <td className="px-6 py-4 font-mono text-slate-400">{control.id}</td>
        <td className="px-6 py-4 font-medium text-white">{control.name}</td>
        <td className="px-6 py-4">
          <select
            value={item.status}
            onChange={(e) => handleStatusChange(e.target.value as AssessmentItem['status'])}
            onClick={(e) => e.stopPropagation()} // Prevent row click from triggering
            className={`w-full px-2 py-1 text-xs font-semibold rounded-md border-transparent focus:border-blue-500 focus:ring-0 ${statusStyles[item.status]}`}
          >
            <option value="Compliant">Compliant</option>
            <option value="Non-Compliant">Non-Compliant</option>
            <option value="In Progress">In Progress</option>
            <option value="Not Applicable">Not Applicable</option>
          </select>
        </td>
        <td className="px-6 py-4 text-slate-400">{control.family}</td>
        <td className="px-6 py-4 text-slate-400">{control.framework}</td>
      </tr>
      {isExpanded && (
        <tr className="bg-slate-800/20">
          <td colSpan={5} className="p-4">
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h4 className="font-semibold text-white">Control Description</h4>
              <p className="text-sm text-slate-400 mt-1 mb-4">{control.description}</p>
              {isConsultant && <button onClick={handleOpenMapping} className="mb-4 flex items-center text-sm text-blue-400 hover:underline"><LinkIcon className="h-4 w-4 mr-2" />Manage Mappings</button>}
              <h4 className="font-semibold text-white">Auditor Notes</h4>
              <textarea
                key={item.id + item.notes} // Force re-render when notes change
                defaultValue={item.notes}
                onBlur={(e) => mockApi.updateAssessmentItemNotes(item.id, e.target.value)}
                rows={3}
                className="w-full mt-1 p-2 text-sm bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add notes here..."
              />
              <div className="flex justify-end mt-2">
                 <button onClick={() => setIsReminderModalOpen(true)} className="text-sm text-blue-400 hover:underline">Send Reminder...</button>
              </div>
              {/* FIX: Use the complete project object passed from props, which resolves the missing 'organizationId' error and provides correct project context. */}
              <AIAssistPanel 
                control={control} 
                project={project}
                onApplyRemediation={handleApplyRemediation}
                onApplyPolicy={handleApplyPolicy}
                onCopyToNotes={handleCopyToNotes}
              />
            </div>
          </td>
        </tr>
      )}
      <ControlMappingModal 
        isOpen={isMappingModalOpen}
        onClose={() => setIsMappingModalOpen(false)}
        control={control}
        allControls={allControls}
        mappings={mappings}
        onCreate={handleCreateMapping}
        onDelete={handleDeleteMapping}
      />
      <SendReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        control={control}
      />
    </>
  );
};

const AssessmentTable: React.FC<AssessmentTableProps> = ({ assessmentItems, controls, user, onUpdate, project }) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [familyFilter, setFamilyFilter] = useState<string>('All');
  const [frameworkFilter, setFrameworkFilter] = useState<string>('All');

  const allControls = useMemo(() => Array.from(controls.values()), [controls]);
  
  const controlFamilies = useMemo(() => {
    const families = new Set<string>();
    allControls.forEach(control => families.add(control.family));
    return Array.from(families).sort();
  }, [allControls]);

  const filteredAssessmentItems = useMemo(() => {
    return assessmentItems
      .filter(item => {
        if (statusFilter === 'All') return true;
        return item.status === statusFilter;
      })
      .filter(item => {
        if (familyFilter === 'All') return true;
        const control = controls.get(item.controlId);
        return control?.family === familyFilter;
      })
      .filter(item => {
        if (frameworkFilter === 'All') return true;
        const control = controls.get(item.controlId);
        return control?.framework === frameworkFilter;
      });
  }, [assessmentItems, statusFilter, familyFilter, frameworkFilter, controls]);

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="p-4 bg-slate-800/50 flex items-center space-x-4 border-b border-slate-700/50">
        <div>
          <label htmlFor="status-filter" className="block text-xs font-medium text-slate-400 mb-1">Filter by Status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48 rounded-md bg-slate-700/60 border-slate-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm py-1.5"
          >
            <option>All</option>
            <option>Compliant</option>
            <option>Non-Compliant</option>
            <option>In Progress</option>
            <option>Not Applicable</option>
          </select>
        </div>
        <div>
          <label htmlFor="family-filter" className="block text-xs font-medium text-slate-400 mb-1">Filter by Family</label>
          <select
            id="family-filter"
            value={familyFilter}
            onChange={(e) => setFamilyFilter(e.target.value)}
            className="w-64 rounded-md bg-slate-700/60 border-slate-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm py-1.5"
          >
            <option>All</option>
            {controlFamilies.map(family => (
              <option key={family} value={family}>{family}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="framework-filter" className="block text-xs font-medium text-slate-400 mb-1">Filter by Framework</label>
          <select
            id="framework-filter"
            value={frameworkFilter}
            onChange={(e) => setFrameworkFilter(e.target.value)}
            className="w-48 rounded-md bg-slate-700/60 border-slate-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm py-1.5"
          >
            <option>All</option>
            {project.frameworks.map(framework => (
              <option key={framework} value={framework}>{framework}</option>
            ))}
          </select>
        </div>
      </div>
      <table className="w-full text-sm text-left text-slate-300">
        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
          <tr>
            <th scope="col" className="px-6 py-3">Control ID</th>
            <th scope="col" className="px-6 py-3">Control Name</th>
            <th scope="col" className="px-6 py-3">Status</th>
            <th scope="col" className="px-6 py-3">Family</th>
            <th scope="col" className="px-6 py-3">Framework</th>
          </tr>
        </thead>
        <tbody>
          {filteredAssessmentItems.map((item) => {
            const control = controls.get(item.controlId);
            if (!control) return null;
            // FIX: Pass down the project prop to each AssessmentRow.
            return <AssessmentRow key={item.id} item={item} control={control} allControls={allControls} user={user} onUpdate={onUpdate} project={project} />;
          })}
          {filteredAssessmentItems.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-12 text-slate-500">
                <p className="font-semibold">No Results Found</p>
                <p className="mt-1 text-sm">No assessment items match the current filters.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssessmentTable;
