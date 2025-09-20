import React, { useState, useEffect } from 'react';
import type { View } from '../../types';
import {
    ClientsIcon, ReportsIcon, ArrowsRightLeftIcon, LockClosedIcon, TrendingUpIcon, ChatBubbleLeftRightIcon
} from '../ui/Icons';

interface LandingPageProps {
  setView: (view: View) => void;
}

const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; delay?: number }> = ({ icon, title, children, delay = 0 }) => (
    <div className="glass-card p-8 rounded-lg text-left group hover:scale-105 transition-all duration-500" style={{ animationDelay: `${delay}ms` }}>
        <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-lime-500/20 to-lime-600/30 text-lime-400 mb-6 group-hover:from-lime-400/30 group-hover:to-lime-500/40 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-lime-500/25">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-lime-100 transition-colors duration-300">{title}</h3>
        <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">{children}</p>
        <div className="absolute inset-0 bg-gradient-to-r from-lime-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ setView }) => {
  const [currentDemo, setCurrentDemo] = useState(0);
  const [riskCount, setRiskCount] = useState(0);
  const [complianceScore, setComplianceScore] = useState(0);

  const handleContact = (subject: string) => {
    window.location.href = `mailto:demo@grcora.test?subject=${encodeURIComponent(subject)}`;
  };

  // Navigate to login page
  const handleExploreConsultant = () => {
    setView({ type: 'login' });
  };

  const handleTryClient = () => {
    setView({ type: 'login' });
  };

  // Animate stats on mount
  useEffect(() => {
    const riskTimer = setInterval(() => {
      setRiskCount(prev => prev < 247 ? prev + 3 : 247);
    }, 20);

    const complianceTimer = setInterval(() => {
      setComplianceScore(prev => prev < 94 ? prev + 1 : 94);
    }, 30);

    const demoTimer = setInterval(() => {
      setCurrentDemo(prev => (prev + 1) % 8);
    }, 3000);

    return () => {
      clearInterval(riskTimer);
      clearInterval(complianceTimer);
      clearInterval(demoTimer);
    };
  }, []);

  const demoFeatures = [
    {
      title: "🚨 CRITICAL: Ransomware Detection",
      description: "Regional Medical Center: LockBit 3.0 variant detected on 14 endpoints, HIPAA breach procedures activated",
      metrics: "ACTIVE INCIDENT",
      color: "text-red-400"
    },
    {
      title: "⚠️ Supply Chain Compromise",
      description: "TechFlow Manufacturing: IndustrialSoft Systems credentials found on dark web, immediate containment",
      metrics: "FBI NOTIFIED",
      color: "text-red-400"
    },
    {
      title: "🔍 Insider Threat Alert",
      description: "InnovateTech: Privileged user downloaded 847GB data to personal cloud storage outside business hours",
      metrics: "INVESTIGATION ACTIVE",
      color: "text-orange-400"
    },
    {
      title: "🛡️ Cloud Security Breach",
      description: "Financial Trust: 47 failed AWS console logins from TOR exit nodes, MFA bypass attempted",
      metrics: "THREAT BLOCKED",
      color: "text-yellow-400"
    },
    {
      title: "📡 APT Group Activity",
      description: "Multiple clients: Nation-state IOCs detected, attributed to APT29 (Cozy Bear) targeting healthcare",
      metrics: "THREAT INTEL",
      color: "text-red-400"
    },
    {
      title: "💳 Payment Card Breach",
      description: "Financial Trust: PCI compliance violation detected, 12,000 card numbers potentially exposed",
      metrics: "PCI INCIDENT",
      color: "text-red-400"
    },
    {
      title: "🔐 Zero-Day Exploitation",
      description: "Regional Medical: CVE-2024-0001 active exploitation in hospital network, emergency patching underway",
      metrics: "ZERO-DAY ACTIVE",
      color: "text-red-400"
    },
    {
      title: "🌐 DDoS Attack Mitigated",
      description: "TechFlow Manufacturing: 2.4Gbps DDoS attack blocked by CloudFlare, suspected retaliation",
      metrics: "ATTACK BLOCKED",
      color: "text-green-400"
    }
  ];

  return (
    <div className="bg-slate-900 text-slate-300 gradient-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-lime-500/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent hover:from-lime-300 hover:to-lime-500 transition-all duration-300 cursor-pointer">GRCora</h1>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#consultants" className="relative hover:text-lime-400 transition-colors duration-300 group">
              For Consultants
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-lime-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#clients" className="relative hover:text-lime-400 transition-colors duration-300 group">
              For Clients
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-lime-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#security" className="relative hover:text-lime-400 transition-colors duration-300 group">
              Security
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-lime-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#pricing" className="relative hover:text-lime-400 transition-colors duration-300 group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-lime-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <button onClick={() => setView({ type: 'login' })} className="text-sm font-semibold hover:text-lime-400 transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-lime-500/10">
              Sign In
            </button>
            <button onClick={() => handleContact('GRCora Demo Request')} className="btn-primary text-sm">
              Book a Demo
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-lime-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-lime-600/5 rounded-full blur-3xl float-animation"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-lime-400/5 rounded-full blur-2xl"></div>
        </div>

        <section className="relative text-center py-20 md:py-32 px-6">
            <div className="container mx-auto relative z-10">
                <div className="fade-in">
                  <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-8 tracking-tight">
                      <span className="bg-gradient-to-r from-white via-lime-100 to-lime-300 bg-clip-text text-transparent">
                        Unified GRC
                      </span>
                      <br />
                      <span className="text-slate-200">for Modern Teams</span>
                  </h1>
                  <p className="mt-8 max-w-4xl mx-auto text-xl md:text-2xl text-slate-300 leading-relaxed font-light">
                      Transform how you manage compliance. Streamline complex audits, enhance client collaboration, and maintain security standards in one powerful, AI-driven platform.
                  </p>
                </div>

                {/* Enhanced Live Cybersecurity Incident Feed */}
                <div className="mt-16 max-w-5xl mx-auto slide-up" style={{ animationDelay: '600ms' }}>
                  <div className="glass-card p-8 rounded-2xl relative overflow-hidden group hover:shadow-2xl hover:shadow-lime-500/10 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-lime-500/5 via-transparent to-lime-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                          </div>
                          <h3 className="text-xl font-bold text-white">🔴 Live Security Operations Center</h3>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="px-3 py-1 bg-red-500/20 rounded-full border border-red-500/30">
                            <span className="text-sm text-red-400 font-medium">ACTIVE THREATS</span>
                          </div>
                          <div className="w-2 h-2 bg-lime-400 rounded-full pulse-glow"></div>
                        </div>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-6 text-left backdrop-blur-sm border border-slate-700/50">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-200 font-medium text-lg">{demoFeatures[currentDemo].title}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></div>
                              <span className={`font-mono font-bold text-xs px-2 py-1 rounded-md bg-slate-700/50 ${demoFeatures[currentDemo].color}`}>
                                {demoFeatures[currentDemo].metrics}
                              </span>
                            </div>
                          </div>
                          <div className="text-slate-400 leading-relaxed">
                            {demoFeatures[currentDemo].description}
                          </div>
                          <div className="relative">
                            <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                              <div
                                className={`h-3 rounded-full transition-all duration-1000 relative overflow-hidden ${
                                  currentDemo === 0 ? 'bg-gradient-to-r from-red-500 to-red-400 w-5/6' :
                                  currentDemo === 1 ? 'bg-gradient-to-r from-red-500 to-red-400 w-4/5' :
                                  currentDemo === 2 ? 'bg-gradient-to-r from-orange-500 to-orange-400 w-3/4' :
                                  currentDemo === 3 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 w-2/3' :
                                  currentDemo === 4 ? 'bg-gradient-to-r from-red-500 to-red-400 w-5/6' :
                                  currentDemo === 5 ? 'bg-gradient-to-r from-red-500 to-red-400 w-4/5' :
                                  currentDemo === 6 ? 'bg-gradient-to-r from-red-500 to-red-400 w-5/6' :
                                  'bg-gradient-to-r from-green-500 to-lime-400 w-1/2'
                                }`}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-pulse"></div>
                              </div>
                            </div>
                            <div className="text-xs text-slate-500 mt-1 flex justify-between">
                              <span>Threat Level</span>
                              <span>Real-time Analysis</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 slide-up" style={{ animationDelay: '800ms' }}>
                    <button onClick={() => handleContact('GRCora Demo Request')} className="btn-primary px-8 py-4 text-base group">
                        <span className="relative z-10">Book a Demo</span>
                        <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                    <button onClick={handleExploreConsultant} className="px-8 py-4 font-semibold text-white bg-slate-700/30 border border-slate-600/50 rounded-lg hover:bg-slate-700/50 hover:border-lime-500/30 transition-all duration-300 group backdrop-blur-sm">
                        <span className="group-hover:text-lime-300 transition-colors duration-300">Explore Consultant View</span>
                    </button>
                    <button onClick={handleTryClient} className="px-8 py-4 font-semibold text-white bg-lime-600/20 border border-lime-500/50 rounded-lg hover:bg-lime-600/30 hover:border-lime-400 transition-all duration-300 group">
                        <span className="group-hover:text-lime-300 transition-colors duration-300">Try Client Portal</span>
                    </button>
                </div>
            </div>
        </section>

        {/* For Consultants */}
        <section id="consultants" className="py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-800/30"></div>
          <div className="container mx-auto text-center relative z-10">
            <div className="fade-in">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent">Next-Generation</span>
                <br />GRC Consulting Platform
              </h2>
              <p className="mt-6 max-w-4xl mx-auto text-xl text-slate-300 leading-relaxed">
                Transform your practice with intelligent automation, real-time insights, and seamless client collaboration. Built specifically for modern GRC consultants.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 mt-16">
               <FeatureCard
                 icon={<ClientsIcon className="h-7 w-7" />}
                 title="AI-Powered Portfolio Dashboard"
                 delay={200}
               >
                Advanced analytics, predictive risk scoring, and automated client health monitoring with interactive visualizations and real-time insights.
              </FeatureCard>
              <FeatureCard
                 icon={<ReportsIcon className="h-7 w-7" />}
                 title="Intelligent Event Monitoring"
                 delay={400}
               >
                Proactive threat detection, compliance change alerts, and automated incident response workflows with ML-powered pattern recognition.
              </FeatureCard>
              <FeatureCard
                 icon={<ArrowsRightLeftIcon className="h-7 w-7" />}
                 title="Smart Automation Engine"
                 delay={600}
               >
                Context-aware task generation, intelligent workflow optimization, and adaptive remediation strategies powered by advanced AI.
              </FeatureCard>
            </div>

            {/* Enhanced Features Showcase */}
            <div className="mt-20 relative slide-up" style={{ animationDelay: '800ms' }}>
              <div className="glass-card p-10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-lime-500/5 via-transparent to-lime-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold text-white text-center mb-12">
                    <span className="bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent">🚀 Platform Innovations</span>
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4 group/item hover:translate-x-2 transition-transform duration-300">
                        <div className="w-4 h-4 bg-gradient-to-r from-lime-400 to-lime-500 rounded-full mt-2 pulse-glow group-hover/item:scale-110 transition-transform duration-300"></div>
                        <div>
                          <h4 className="font-bold text-white text-lg mb-2 group-hover/item:text-lime-300 transition-colors duration-300">Advanced Analytics Engine</h4>
                          <p className="text-slate-400 leading-relaxed group-hover/item:text-slate-300 transition-colors duration-300">ML-powered insights, predictive modeling, and interactive visualizations with real-time data processing</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4 group/item hover:translate-x-2 transition-transform duration-300">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-lime-400 rounded-full mt-2 group-hover/item:scale-110 transition-transform duration-300"></div>
                        <div>
                          <h4 className="font-bold text-white text-lg mb-2 group-hover/item:text-lime-300 transition-colors duration-300">Intelligent Automation</h4>
                          <p className="text-slate-400 leading-relaxed group-hover/item:text-slate-300 transition-colors duration-300">Context-aware workflows, automated compliance tracking, and adaptive risk response systems</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4 group/item hover:translate-x-2 transition-transform duration-300">
                        <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-lime-400 rounded-full mt-2 group-hover/item:scale-110 transition-transform duration-300"></div>
                        <div>
                          <h4 className="font-bold text-white text-lg mb-2 group-hover/item:text-lime-300 transition-colors duration-300">Real-Time Intelligence</h4>
                          <p className="text-slate-400 leading-relaxed group-hover/item:text-slate-300 transition-colors duration-300">Live threat monitoring, instant compliance alerts, and proactive vulnerability detection</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4 group/item hover:translate-x-2 transition-transform duration-300">
                        <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-lime-400 rounded-full mt-2 group-hover/item:scale-110 transition-transform duration-300"></div>
                        <div>
                          <h4 className="font-bold text-white text-lg mb-2 group-hover/item:text-lime-300 transition-colors duration-300">Seamless Collaboration</h4>
                          <p className="text-slate-400 leading-relaxed group-hover/item:text-slate-300 transition-colors duration-300">Unified client portals, secure document sharing, and real-time progress tracking</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Clients */}
        <section id="clients" className="py-24 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800/30 to-slate-900/50"></div>
          <div className="container mx-auto text-center relative z-10">
            <div className="fade-in">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent">Client-Centric</span>
                <br />Collaboration Portal
              </h2>
              <p className="mt-6 max-w-4xl mx-auto text-xl text-slate-300 leading-relaxed">
                Empower your clients with an intuitive, secure portal that transforms compliance from burden to competitive advantage.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 mt-16">
                <FeatureCard
                  icon={<LockClosedIcon className="h-7 w-7" />}
                  title="Unified Security Hub"
                  delay={200}
                >
                    Centralized access to assessments, policies, and evidence with enterprise-grade security and audit trails.
                </FeatureCard>
                <FeatureCard
                  icon={<TrendingUpIcon className="h-7 w-7" />}
                  title="Real-Time Visibility"
                  delay={400}
                >
                    Interactive dashboards with live compliance metrics, risk scoring, and progress visualization.
                </FeatureCard>
                <FeatureCard
                  icon={<ChatBubbleLeftRightIcon className="h-7 w-7" />}
                  title="Smart Collaboration"
                  delay={600}
                >
                    Streamlined communication, automated workflows, and intelligent task management for seamless teamwork.
                </FeatureCard>
            </div>
          </div>
        </section>

        {/* Security */}
        <section id="security" className="py-20 px-6 bg-slate-900">
             <div className="container mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white">Security is Our Foundation</h2>
                <p className="mt-4 max-w-3xl mx-auto text-slate-400">Your data is segregated and protected with a security-first architecture you can trust.</p>
                <div className="mt-12 max-w-2xl mx-auto text-left space-y-4">
                    <div className="flex items-start space-x-3"><CheckIcon className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" /><div><h4 className="font-semibold text-white">Strict Tenant Isolation</h4><p className="text-slate-400">Your organization's data is secured using row-level security. You only ever see what you are authorized to see.</p></div></div>
                    <div className="flex items-start space-x-3"><CheckIcon className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" /><div><h4 className="font-semibold text-white">Encryption at Rest & In Transit</h4><p className="text-slate-400">All data is encrypted using industry-standard AES-256 encryption.</p></div></div>
                    <div className="flex items-start space-x-3"><CheckIcon className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" /><div><h4 className="font-semibold text-white">Built on Trusted Infrastructure</h4><p className="text-slate-400">GRCora is built on SOC 2 compliant infrastructure for maximum reliability and security.</p></div></div>
                </div>
            </div>
        </section>


        {/* Pricing */}
        <section id="pricing" className="py-20 px-6 bg-slate-800/30">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Simple, Transparent Pricing</h2>
            <p className="mt-4 max-w-3xl mx-auto text-slate-400">Choose the plan that fits your role. No hidden fees, no complexity.</p>
            <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
                <div className="glass-card p-8 rounded-lg text-left flex flex-col">
                    <h3 className="text-2xl font-semibold text-white">Consultant Edition</h3>
                    <p className="mt-2 text-slate-400 flex-grow">For GRC professionals, advisory firms, and vCISOs. Manage unlimited clients and projects from one central command center.</p>
                    <button onClick={() => handleContact('GRCora Pricing Request')} className="mt-6 w-full text-center px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold text-white">Request Pricing</button>
                </div>
                <div className="glass-card p-8 rounded-lg text-left flex flex-col">
                    <h3 className="text-2xl font-semibold text-white">Client Portal</h3>
                    <p className="mt-2 text-slate-400 flex-grow">For organizations working with a consultant on the GRCora platform. Included as part of your consultant's engagement.</p>
                    <button onClick={() => setView({type: 'login'})} className="mt-6 w-full text-center px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors font-semibold text-white">Login to Your Portal</button>
                </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-lime-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-lime-600/5 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto text-center relative z-10">
            <div className="fade-in">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
                Ready to <span className="bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent">Transform</span>
                <br />Your GRC Practice?
              </h2>
              <p className="mt-6 max-w-4xl mx-auto text-xl text-slate-300 leading-relaxed">
                  Join the next generation of GRC professionals. Experience the power of AI-driven compliance, seamless collaboration, and intelligent automation.
              </p>
            </div>
            <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-6 slide-up" style={{ animationDelay: '400ms' }}>
                <button onClick={() => handleContact('GRCora Demo Request')} className="btn-primary px-10 py-4 text-lg group">
                    <span className="relative z-10">Book Your Demo</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </button>
                <button onClick={() => handleContact('GRCora Free Trial Request')} className="px-10 py-4 text-lg font-semibold text-slate-900 bg-gradient-to-r from-lime-400 to-lime-500 rounded-lg hover:from-lime-300 hover:to-lime-400 transition-all duration-300 group shadow-lg hover:shadow-xl hover:shadow-lime-500/25 transform hover:scale-105">
                    <span className="group-hover:scale-105 transition-transform duration-300">Start Free Trial</span>
                </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto px-6 py-8">
            <div className="grid md:grid-cols-4 gap-8">
                <div>
                    <h3 className="font-bold text-white text-lg">GRCora</h3>
                    <p className="text-slate-400 mt-2 text-sm">Unified GRC for Consultants and Their Clients.</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-white">Product</h4>
                    <ul className="mt-4 space-y-2 text-sm">
                        <li><a href="#consultants" className="text-slate-400 hover:text-white">For Consultants</a></li>
                        <li><a href="#clients" className="text-slate-400 hover:text-white">For Clients</a></li>
                        <li><a href="#security" className="text-slate-400 hover:text-white">Security</a></li>
                        <li><a href="#pricing" className="text-slate-400 hover:text-white">Pricing</a></li>
                    </ul>
                 </div>
                 <div>
                    <h4 className="font-semibold text-white">Company</h4>
                     <ul className="mt-4 space-y-2 text-sm">
                        <li><a href="#" className="text-slate-400 hover:text-white">About Us</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white">Contact</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white">Careers</a></li>
                    </ul>
                 </div>
                 <div>
                    <h4 className="font-semibold text-white">Legal</h4>
                     <ul className="mt-4 space-y-2 text-sm">
                        <li><a href="#" className="text-slate-400 hover:text-white">Privacy Policy</a></li>
                        <li><a href="#" className="text-slate-400 hover:text-white">Terms of Service</a></li>
                    </ul>
                 </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
                <p>&copy; 2024 GRCora Inc. All rights reserved.</p>
            </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;