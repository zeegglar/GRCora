
import React, { useState } from 'react';
import type { Control, Project } from '../../types';
import { explainControl, suggestEvidence, draftRemediationPlan, draftPolicySection } from '../../services/geminiService';
import { CheckCircleIcon } from './Icons';
import { logger } from '../../utils/logger';

type AIAction = 'explain' | 'evidence' | 'remediation' | 'policy';

interface AIAssistPanelProps {
  control: Control;
  project: Project;
  onApplyRemediation: (remediationPlan: string) => void;
  onApplyPolicy: (policyContent: string) => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2 text-slate-400">
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Working...</span>
    </div>
);

const AIAssistPanel: React.FC<AIAssistPanelProps> = ({ control, project, onApplyRemediation, onApplyPolicy }) => {
  const [activeAction, setActiveAction] = useState<AIAction | null>(null);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [lastAction, setLastAction] = useState<AIAction | null>(null);

  const handleAction = async (action: AIAction) => {
    setActiveAction(action);
    setOutput('');
    setError('');
    setIsCopied(false);
    try {
      let result = '';
      switch (action) {
        case 'explain':
          result = await explainControl(control, project);
          break;
        case 'evidence':
          result = await suggestEvidence(control, project);
          break;
        case 'remediation':
          const issue = "The current process is not formally documented or consistently followed.";
          result = await draftRemediationPlan(control, project, issue);
          break;
        case 'policy':
          result = await draftPolicySection(control, project);
          break;
      }
      setOutput(result);
      setLastAction(action);
    } catch (e) {
      setError('An error occurred while communicating with the AI. Please try again.');
      logger.error('AI assist action failed', e, { action, controlId: control.id, projectId: project.id });
    } finally {
      setActiveAction(null);
    }
  };
  
  const handleCopy = () => {
      navigator.clipboard.writeText(output);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  }

  const handleApply = () => {
    if (lastAction === 'remediation') {
        onApplyRemediation(output);
    } else if (lastAction === 'policy') {
        onApplyPolicy(output);
    }
  }

  const actionButtons: { id: AIAction; label: string }[] = [
    { id: 'explain', label: 'Explain Control' },
    { id: 'evidence', label: 'Suggest Evidence' },
    { id: 'remediation', label: 'Draft Plan' },
    { id: 'policy', label: 'Draft Policy' },
  ];
  
  const getApplyButtonText = () => {
      if (lastAction === 'remediation') return 'Apply to Plan';
      if (lastAction === 'policy') return 'Apply & Create Policy';
      return 'Apply';
  }

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 my-4 border border-slate-700/50">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gradient bg-gradient-aura">GRCora Assist</p>
        <div className="flex space-x-2">
            {actionButtons.map(({ id, label }) => (
                <button
                    key={id}
                    onClick={() => handleAction(id)}
                    disabled={!!activeAction}
                    className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {activeAction === id ? <LoadingSpinner /> : label}
                </button>
            ))}
        </div>
      </div>
      {(output || error || activeAction) && (
        <div className="mt-4 p-3 bg-slate-900/70 rounded-md text-sm text-slate-300 whitespace-pre-wrap relative min-h-[100px]">
          {activeAction && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
          {error ? <p className="text-red-400">{error}</p> : <p>{output}</p>}
          {output && !error && !activeAction && (
             <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-slate-700/50">
                <button 
                    onClick={handleCopy}
                    className="flex items-center space-x-1 px-2 py-1 text-xs rounded-md bg-slate-600/80 hover:bg-slate-500 text-white transition-colors"
                >
                   {isCopied ? <CheckCircleIcon className="h-4 w-4 text-green-400" /> : null}
                   <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                </button>
                {(lastAction === 'remediation' || lastAction === 'policy') && (
                     <button 
                        onClick={handleApply}
                        className="px-3 py-1 text-xs rounded-md font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                        {getApplyButtonText()}
                    </button>
                )}
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAssistPanel;
