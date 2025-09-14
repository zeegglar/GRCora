

import React, { useState, useEffect } from 'react';
import type { Policy, User, Control } from '../../../types';
import { PolicyStatus } from '../../../types';
import { mockApi } from '../../../services/api';
import { analyzePolicyAgainstFramework } from '../../../services/geminiService';
import { DocumentTextIcon, PresentationChartBarIcon, ClipboardDocumentIcon, CheckCircleIcon } from '../../ui/Icons';


interface NewPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (policyData: Omit<Policy, 'id' | 'history'>) => void;
  user: User;
  projectId: string;
  initialContent?: string;
  contextControl?: Control | null;
}

const NewPolicyModal: React.FC<NewPolicyModalProps> = ({ isOpen, onClose, onSave, user, projectId, initialContent, contextControl }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'analyze'>('create');
  
  // Create Tab State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Analyze Tab State
  const [policyToAnalyze, setPolicyToAnalyze] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('');
  const [availableFrameworks, setAvailableFrameworks] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialContent ? 'create' : 'create');
      if (initialContent) {
        setContent(initialContent);
      } else {
        setContent('');
      }
      if (contextControl) {
        setTitle(`Policy for ${contextControl.name}`);
      } else {
        setTitle('');
      }

      const fetchFrameworks = async () => {
        const fws = await mockApi.getAvailableFrameworks();
        setAvailableFrameworks(fws);
        if (fws.length > 0) {
            setSelectedFramework(fws[0]);
        }
      };
      fetchFrameworks();

    } else {
        // Reset state on close
        setTitle('');
        setContent('');
        setPolicyToAnalyze('');
        setAnalysisResult('');
        setIsAnalyzing(false);
    }
  }, [isOpen, initialContent, contextControl]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert('Please enter a policy title.');
      return;
    }
    onSave({
      title,
      content,
      ownerId: user.id,
      projectId,
      status: PolicyStatus.DRAFT,
      version: '1.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      controlId: contextControl?.id
    });
    onClose();
  };

  const handleAnalyze = async () => {
      if (!policyToAnalyze || !selectedFramework) {
        alert("Please provide the policy text and select a framework.");
        return;
    }
    setIsAnalyzing(true);
    setAnalysisResult('');
    try {
        const result = await analyzePolicyAgainstFramework(policyToAnalyze, selectedFramework);
        setAnalysisResult(result);
    } catch (e) {
        console.error(e);
        setAnalysisResult("An error occurred during analysis. Please try again.");
    } finally {
        setIsAnalyzing(false);
    }
  }
  
  const handleDownload = (format: 'word' | 'ppt') => {
    const cleanText = analysisResult.replace(/<\/?[^>]+(>|$)/g, ""); // Basic HTML strip
    if (format === 'word') {
        const html = `
            <html>
                <head><style>h2 { color: #3b82f6; } ul { list-style-type: disc; margin-left: 20px; }</style></head>
                <body><h1>Policy Gap Analysis</h1>${analysisResult}</body>
            </html>
        `;
        const blob = new Blob([html], { type: 'application/msword' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Policy-Gap-Analysis.doc';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else if (format === 'ppt') {
        // A simple text-based PPT. For rich PPTs, a library like pptxgenjs would be needed.
        const pptContent = `GRCora Policy Analysis\n\n${cleanText.replace(/## /g, '\n\n').replace(/### /g, '')}`;
        const blob = new Blob([pptContent], { type: 'application/vnd.ms-powerpoint' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Policy-Gap-Analysis.ppt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(analysisResult);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-3xl border border-slate-700 animate-fade-in-scale-up">
        <header className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">New Policy</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        
        <div className="border-b border-slate-700 px-4">
             <nav className="flex space-x-4">
                <button onClick={() => setActiveTab('create')} className={`py-3 px-1 text-sm font-semibold ${activeTab === 'create' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400'}`}>Create from Scratch</button>
                <button onClick={() => setActiveTab('analyze')} className={`py-3 px-1 text-sm font-semibold ${activeTab === 'analyze' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400'}`}>Analyze Existing Policy</button>
             </nav>
        </div>
        
        {activeTab === 'create' && (
             <form onSubmit={handleSubmit}>
                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                    <div>
                        <label htmlFor="policyTitle" className="block text-sm font-medium text-slate-300 mb-1">Policy Title</label>
                        <input type="text" id="policyTitle" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="policyContent" className="block text-sm font-medium text-slate-300 mb-1">Content</label>
                        <textarea id="policyContent" value={content} onChange={e => setContent(e.target.value)} rows={10} className="w-full p-2 text-sm bg-slate-900/50 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <footer className="p-4 border-t border-slate-700 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 transition-colors text-white">Save Draft</button>
                </footer>
            </form>
        )}
        
        {activeTab === 'analyze' && (
             <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                <div>
                    <label htmlFor="policyToAnalyze" className="block text-sm font-medium text-slate-300 mb-1">Paste Existing Policy Text</label>
                    <textarea id="policyToAnalyze" value={policyToAnalyze} onChange={e => setPolicyToAnalyze(e.target.value)} rows={8} className="w-full p-2 text-sm bg-slate-900/50 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Paste the full text of your policy here..."></textarea>
                </div>
                <div className="flex items-end space-x-3">
                    <div className="flex-grow">
                        <label htmlFor="framework" className="block text-sm font-medium text-slate-300 mb-1">Analyze Against Framework</label>
                        <select id="framework" value={selectedFramework} onChange={e => setSelectedFramework(e.target.value)} className="w-full px-3 py-2 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                           {availableFrameworks.map(fw => <option key={fw} value={fw}>{fw}</option>)}
                        </select>
                    </div>
                    <button onClick={handleAnalyze} disabled={isAnalyzing} className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 transition-colors text-white disabled:opacity-50">
                        {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>

                {(isAnalyzing || analysisResult) && (
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Analysis Report</label>
                        <div className="bg-slate-900/70 p-4 rounded-lg min-h-[150px] text-sm text-slate-300 whitespace-pre-wrap font-mono relative border border-slate-700">
                            {isAnalyzing && <div className="text-center">Generating analysis...</div>}
                            {analysisResult && !isAnalyzing && (
                                <>
                                    <div dangerouslySetInnerHTML={{ __html: analysisResult.replace(/## /g, '<h2 class="text-lg font-bold text-blue-300 mt-2 mb-1">').replace(/### /g, '<h3 class="text-md font-semibold text-white mb-1">') }} />
                                    <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-slate-700/50">
                                         <button onClick={handleCopy} className="flex items-center space-x-1 px-2 py-1 text-xs rounded-md bg-slate-600/80 hover:bg-slate-500 text-white transition-colors">
                                            {isCopied ? <CheckCircleIcon className="h-4 w-4 text-green-400" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
                                            <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                                        </button>
                                        <button onClick={() => handleDownload('word')} className="flex items-center space-x-1 px-2 py-1 text-xs rounded-md bg-slate-600/80 hover:bg-slate-500 text-white transition-colors">
                                            <DocumentTextIcon className="h-4 w-4" />
                                            <span>.docx</span>
                                        </button>
                                         <button onClick={() => handleDownload('ppt')} className="flex items-center space-x-1 px-2 py-1 text-xs rounded-md bg-slate-600/80 hover:bg-slate-500 text-white transition-colors">
                                            <PresentationChartBarIcon className="h-4 w-4" />
                                            <span>.pptx</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
             </div>
        )}
      </div>
    </div>
  );
};

export default NewPolicyModal;