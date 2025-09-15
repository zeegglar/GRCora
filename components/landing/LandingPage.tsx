import React from 'react';
import type { View } from '../../types';
import {
    ClientsIcon, ReportsIcon, ArrowsRightLeftIcon, LockClosedIcon, TrendingUpIcon, ChatBubbleLeftRightIcon
} from '../ui/Icons';

interface LandingPageProps {
  setView: (view: View) => void;
  onLogin: (userId: string) => void;
}

const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="glass-card p-6 rounded-lg text-left">
        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600/20 text-blue-400 mb-5">
            {icon}
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 text-slate-400">{children}</p>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ setView, onLogin }) => {

  const handleContact = (subject: string) => {
    window.location.href = `mailto:demo@grcora.test?subject=${encodeURIComponent(subject)}`;
  };

  return (
    <div className="bg-slate-900 text-slate-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/70 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gradient bg-gradient-grcora">GRCora</h1>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#consultants" className="hover:text-white">For Consultants</a>
            <a href="#clients" className="hover:text-white">For Clients</a>
            <a href="#security" className="hover:text-white">Security</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
          </nav>
          <div className="flex items-center space-x-4">
            <button onClick={() => setView({ type: 'login' })} className="text-sm font-semibold hover:text-white">
              Sign In
            </button>
            <button onClick={() => handleContact('GRCora Demo Request')} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              Book a Demo
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24">
        <section className="text-center py-20 md:py-32 px-6 bg-gradient-to-b from-slate-900 to-slate-800/20">
            <div className="container mx-auto">
                <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                    Unified GRC for Consultants and Their Clients
                </h1>
                <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-slate-400">
                    Manage multiple client engagements, streamline complex audits, and collaborate securely in a single, audit-ready platform. GRCora brings clarity and control to your entire compliance lifecycle.
                </p>
                <div className="mt-10 flex justify-center space-x-4">
                    <button onClick={() => handleContact('GRCora Demo Request')} className="px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                        Book a Demo
                    </button>
                    <button onClick={() => onLogin('user-1')} className="px-8 py-3 font-semibold text-white bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors">
                        Explore Consultant View
                    </button>
                </div>
            </div>
        </section>

        {/* For Consultants */}
        <section id="consultants" className="py-20 px-6 bg-slate-900">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">A Multi-Tenant Platform Built for GRC Consulting</h2>
            <p className="mt-4 max-w-3xl mx-auto text-slate-400">
              Stop juggling spreadsheets and siloed tools. GRCora provides the purpose-built infrastructure to scale your practice and deliver exceptional value to every client.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
               <FeatureCard icon={<ClientsIcon className="h-6 w-6" />} title="Centralized Client Management">
                Oversee your entire client portfolio from a single, powerful dashboard with strict data isolation.
              </FeatureCard>
              <FeatureCard icon={<ReportsIcon className="h-6 w-6" />} title="Audit-Ready Reporting">
                Generate comprehensive reports like Gap Analysis and Statements of Applicability in minutes.
              </FeatureCard>
              <FeatureCard icon={<ArrowsRightLeftIcon className="h-6 w-6" />} title="Cross-Framework Intelligence">
                Map controls and evidence across standards like ISO 27001, SOC 2, and NIST to eliminate redundant work.
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* For Clients */}
        <section id="clients" className="py-20 px-6 bg-slate-800/30">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">An Intuitive Portal for Your Clients</h2>
            <p className="mt-4 max-w-3xl mx-auto text-slate-400">
              Empower your clients with a secure, collaborative portal designed to make the compliance process transparent and straightforward.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
                <FeatureCard icon={<LockClosedIcon className="h-6 w-6" />} title="A Single Source of Truth">
                    Access assessments, upload evidence, and review policies in one organized, secure hub.
                </FeatureCard>
                <FeatureCard icon={<TrendingUpIcon className="h-6 w-6" />} title="Transparent Progress Tracking">
                    Visualize your compliance posture in real-time with clear dashboards and status indicators.
                </FeatureCard>
                <FeatureCard icon={<ChatBubbleLeftRightIcon className="h-6 w-6" />} title="Seamless Collaboration">
                    Facilitate evidence requests and guidance directly in the platform for a complete audit trail.
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
        <section className="py-20 px-6 bg-gradient-core">
             <div className="container mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Streamline Your GRC Process?</h2>
                <p className="mt-4 max-w-3xl mx-auto text-slate-300">
                    See how GRCora can bring clarity, efficiency, and control to your compliance engagements. Book a personalized demo or start a free trial for your consultancy today.
                </p>
                <div className="mt-10 flex justify-center space-x-4">
                    <button onClick={() => handleContact('GRCora Demo Request')} className="px-8 py-3 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
                        Book a Demo
                    </button>
                    <button onClick={() => handleContact('GRCora Free Trial Request')} className="px-8 py-3 font-semibold text-slate-800 bg-white rounded-lg hover:bg-slate-200 transition-colors">
                        Start Free Trial
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
