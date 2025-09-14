import React, { useState } from 'react';
import type { Project, AssessmentItem, Risk, Control } from '../../../types';
import { PlusCircleIcon } from '../../ui/Icons';
import GenerateReportModal from './GenerateReportModal';

interface ReportsViewProps {
  project: Project;
  assessmentItems: AssessmentItem[];
  risks: Risk[];
  controls: Map<string, Control>;
}

const ReportsView: React.FC<ReportsViewProps> = ({ project, assessmentItems, risks, controls }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="glass-card rounded-lg overflow-hidden">
        <div className="p-4 bg-slate-800/50 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Reports</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold text-white text-sm"
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Generate Report</span>
          </button>
        </div>
        <div className="p-8 text-center text-slate-500">
          <p>No reports have been generated for this project yet.</p>
          <p className="mt-2 text-sm">Click "Generate Report" to create a new report.</p>
        </div>
      </div>
      <GenerateReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={project}
        assessmentItems={assessmentItems}
        risks={risks}
        controls={controls}
      />
    </>
  );
};

export default ReportsView;
