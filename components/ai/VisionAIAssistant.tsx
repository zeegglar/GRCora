import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Bot,
  Send,
  MessageSquare,
  Brain,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  FileText,
  Shield
} from 'lucide-react';
import RAGService from '../../services/ragService';
import type { QueryResponse, RAGContext } from '../../types/comprehensive';

interface VisionAIAssistantProps {
  organizationId: string;
  userRole: string;
  projectId?: string;
  framework?: string;
  contextData?: any;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence_score?: number;
  citations?: any[];
  suggested_actions?: string[];
}

interface QuickPrompt {
  id: string;
  title: string;
  prompt: string;
  category: 'assessment' | 'compliance' | 'risk' | 'audit' | 'general';
  icon: React.ReactNode;
}

const VisionAIAssistant: React.FC<VisionAIAssistantProps> = ({
  organizationId,
  userRole,
  projectId,
  framework,
  contextData
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [knowledgeBaseReady, setKnowledgeBaseReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'knowledge'>('chat');
  const [knowledgeStats, setKnowledgeStats] = useState(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ragService = RAGService.getInstance();

  const quickPrompts: QuickPrompt[] = [
    {
      id: 'compliance-status',
      title: 'Compliance Status',
      prompt: 'What is our current compliance status and what are the key gaps?',
      category: 'compliance',
      icon: <Shield className="w-4 h-4" />
    },
    {
      id: 'risk-assessment',
      title: 'Risk Assessment',
      prompt: 'Summarize our top risks and recommended treatments',
      category: 'risk',
      icon: <AlertCircle className="w-4 h-4" />
    },
    {
      id: 'control-gaps',
      title: 'Control Gaps',
      prompt: 'What are the critical control gaps in our current implementation?',
      category: 'assessment',
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: 'audit-readiness',
      title: 'Audit Readiness',
      prompt: 'Are we ready for an external audit? What needs attention?',
      category: 'audit',
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      id: 'improvement-recommendations',
      title: 'Improvement Plan',
      prompt: 'What should be our top priorities for security improvement?',
      category: 'general',
      icon: <TrendingUp className="w-4 h-4" />
    }
  ];

  useEffect(() => {
    if (isOpen && !knowledgeBaseReady) {
      initializeKnowledgeBase();
    }
  }, [isOpen, organizationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeKnowledgeBase = async () => {
    try {
      setIsLoading(true);

      await ragService.initializeKnowledgeBase(organizationId);
      const stats = ragService.getKnowledgeBaseStats(organizationId);
      setKnowledgeStats(stats);
      setKnowledgeBaseReady(true);

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'assistant',
        content: `Hello! I'm your GRC Vision AI assistant. I've analyzed your organization's data and I'm ready to help with compliance, risk management, and security questions. I have access to ${stats.total_documents} documents including controls, policies, assessments, and procedures.

How can I assist you today?`,
        timestamp: new Date(),
        confidence_score: 100
      };

      setMessages([welcomeMessage]);

    } catch (error) {
      console.error('Error initializing knowledge base:', error);
      const errorMessage: ChatMessage = {
        id: 'error',
        type: 'assistant',
        content: 'I encountered an issue initializing my knowledge base. I can still help with general GRC questions, but my responses may be limited. Please try refreshing or contact support.',
        timestamp: new Date(),
        confidence_score: 0
      };
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || currentMessage.trim();
    if (!content || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const ragContext: RAGContext = {
        organization_id: organizationId,
        user_role: userRole,
        project_id: projectId,
        framework: framework,
        context_data: contextData
      };

      const response = await ragService.query(content, ragContext, {
        includeReferences: true,
        maxTokens: 1000,
        temperature: 0.3
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: response.response,
        timestamp: new Date(),
        confidence_score: response.confidence_score,
        citations: response.citations,
        suggested_actions: response.suggested_actions
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.',
        timestamp: new Date(),
        confidence_score: 0
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: QuickPrompt) => {
    handleSendMessage(prompt.prompt);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const provideFeedback = (messageId: string, isPositive: boolean) => {
    // In a real implementation, this would send feedback to analytics
  };

  const getConfidenceBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'assessment': return <FileText className="w-4 h-4" />;
      case 'compliance': return <Shield className="w-4 h-4" />;
      case 'risk': return <AlertCircle className="w-4 h-4" />;
      case 'audit': return <BookOpen className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Sparkles className="w-4 h-4 mr-2" />
          Vision AI
          {knowledgeBaseReady && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <span>Vision AI Assistant</span>
            {knowledgeStats && (
              <Badge variant="outline" className="ml-2">
                {knowledgeStats.total_documents} docs
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Your intelligent GRC advisor with access to organizational knowledge
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4">
          {/* Tab Navigation */}
          <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'insights'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Brain className="w-4 h-4 inline mr-2" />
              Insights
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'knowledge'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Knowledge
            </button>
          </div>

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <>
              {/* Quick Prompts */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {quickPrompts.map((prompt) => (
                  <Button
                    key={prompt.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPrompt(prompt)}
                    className="justify-start h-auto p-3"
                    disabled={isLoading}
                  >
                    <div className="flex items-center space-x-2">
                      {prompt.icon}
                      <span className="text-xs">{prompt.title}</span>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="space-y-2">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                          {message.type === 'assistant' && (
                            <>
                              {/* Confidence Score */}
                              {message.confidence_score !== undefined && (
                                <div className="flex items-center justify-between mt-2">
                                  <Badge variant={getConfidenceBadgeVariant(message.confidence_score)}>
                                    Confidence: {message.confidence_score}%
                                  </Badge>
                                  <div className="flex space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(message.content)}
                                    >
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => provideFeedback(message.id, true)}
                                    >
                                      <ThumbsUp className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => provideFeedback(message.id, false)}
                                    >
                                      <ThumbsDown className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Citations */}
                              {message.citations && message.citations.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs font-medium text-gray-600 mb-2">Sources:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {message.citations.map((citation, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {citation.source} ({citation.type})
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Suggested Actions */}
                              {message.suggested_actions && message.suggested_actions.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs font-medium text-gray-600 mb-2">Suggested Actions:</p>
                                  <ul className="text-xs space-y-1">
                                    {message.suggested_actions.map((action, index) => (
                                      <li key={index} className="flex items-start space-x-1">
                                        <span>•</span>
                                        <span>{action}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </>
                          )}

                          <p className="text-xs opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-gray-600">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="flex space-x-2">
                <Textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Ask me about compliance, risks, controls, or any GRC topic..."
                  className="flex-1 min-h-[40px] max-h-[120px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading || !knowledgeBaseReady}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!currentMessage.trim() || isLoading || !knowledgeBaseReady}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Brain className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">AI Insights</h3>
                  <p className="text-gray-600">
                    Proactive insights and recommendations based on your data
                  </p>
                </div>
                <p className="text-sm text-gray-500">Coming soon...</p>
              </div>
            </div>
          )}

          {/* Knowledge Tab */}
          {activeTab === 'knowledge' && (
            <div className="flex-1 space-y-4">
              {knowledgeStats && (
                <Card>
                  <CardHeader>
                    <CardTitle>Knowledge Base Status</CardTitle>
                    <CardDescription>
                      Current state of AI knowledge base for your organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Documents</p>
                        <p className="text-2xl font-bold">{knowledgeStats.total_documents}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Last Updated</p>
                        <p className="text-sm">{new Date(knowledgeStats.last_updated).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-600 mb-2">By Document Type</p>
                      <div className="space-y-2">
                        {Object.entries(knowledgeStats.by_type).map(([type, count]) => (
                          <div key={type} className="flex justify-between items-center">
                            <span className="text-sm capitalize">{type}s</span>
                            <Badge variant="outline">{count as number}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VisionAIAssistant;