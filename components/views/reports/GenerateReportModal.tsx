import React, { useState } from 'react';
import type { Project, AssessmentItem, Risk, Control } from '../../../types';
import { generateExecutiveSummary } from '../../../services/geminiService';
import { ClipboardDocumentIcon } from '../../ui/Icons';
import { parseMarkdownSafely } from '../../../utils/sanitization';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  assessmentItems: AssessmentItem[];
  risks: Risk[];
  controls: Map<string, Control>;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center space-x-2 text-slate-400">
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Generating Report... This may take a moment.</span>
    </div>
);


const GenerateReportModal: React.FC<GenerateReportModalProps> = ({ isOpen, onClose, project, assessmentItems, risks, controls }) => {
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reportOutput, setReportOutput] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setReportOutput('');
    setError('');
    try {
        const result = await generateExecutiveSummary(project, assessmentItems, risks, controls, instructions);
        setReportOutput(result);
    } catch (err) {
        setError('Failed to generate report. Please check the console.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
      navigator.clipboard.writeText(reportOutput);
      alert('Report copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-3xl border border-slate-700 animate-fade-in-scale-up">
        <header className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Generate Executive Summary</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-slate-300 mb-1">Additional Instructions (Optional)</label>
              <textarea
                id="instructions"
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                className="w-full h-24 p-2 text-sm bg-slate-900/50 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Focus on risks related to third-party vendors. The audience is the board of directors."
              />
            </div>

            {(isLoading || error || reportOutput) && (
                <div className="bg-slate-900/70 p-4 rounded-lg min-h-[150px] text-sm text-slate-300 whitespace-pre-wrap font-mono relative">
                    {isLoading && <LoadingSpinner />}
                    {error && <p className="text-red-400">{error}</p>}
                    {reportOutput && !isLoading && (
                        <>
                            <div className="report-output">
                                {parseMarkdownSafely(reportOutput)}
                            </div>
                             <button 
                                type="button"
                                onClick={handleCopy}
                                className="absolute top-2 right-2 flex items-center space-x-1 px-2 py-1 text-xs rounded-md bg-slate-600/80 hover:bg-slate-500 text-white transition-colors"
                            >
                               <ClipboardDocumentIcon className="h-4 w-4" />
                               <span>Copy</span>
                            </button>
                        </>
                    )}
                </div>
            )}
            
          </div>
          <footer className="p-4 border-t border-slate-700 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 transition-colors text-white" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate with AI'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default GenerateReportModal;
