import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, Sparkles, Shield, TrendingUp, Users, MessageSquare, 
  ChevronRight, Play, Star, Zap, Award, CheckCircle2 
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-bg-primary min-h-screen text-white overflow-x-hidden selection:bg-brand-500 selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500 rounded-xl shadow-lg shadow-brand-500/20">
              <Mic size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">Speak<span className="text-brand-500">Space</span></span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <a href="#features" className="hover:text-brand-500 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-brand-500 transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-brand-500 transition-colors">Success</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="px-6 py-2.5 font-bold text-sm hover:text-brand-500 transition-colors">Sign In</button>
            <button onClick={() => navigate('/register')} className="px-8 py-2.5 bg-brand-500 hover:bg-brand-600 rounded-xl font-black text-sm transition-all shadow-xl shadow-brand-500/20">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-8 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] translate-y-1/2" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 rounded-full border border-brand-500/20 text-brand-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles size={14} fill="currentColor" />
            Master the Art of Group Discussion
          </div>
          
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Practice GD with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400 italic">Real-Time AI</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-400 leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            Join live voice rooms, engage in structured discussions, and get instant feedback from our AI moderator to ace your interviews.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
            <button onClick={() => navigate('/register')} className="w-full sm:w-auto px-10 py-5 bg-brand-500 hover:bg-brand-600 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-brand-500/40 flex items-center justify-center gap-3 group">
              Start Practicing Free
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-lg transition-all border border-white/10 flex items-center justify-center gap-3">
              <Play fill="currentColor" size={20} />
              Watch Demo
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-wrap justify-center items-center gap-x-16 gap-y-8 grayscale opacity-50">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" className="h-6" alt="Google" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" className="h-6" alt="Amazon" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" className="h-6" alt="Microsoft" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" className="h-6" alt="Netflix" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-8 bg-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4">Everything you need to <span className="text-brand-500">Stand Out</span></h2>
            <p className="text-slate-500">The most advanced platform built specifically for soft skills preparation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Mic size={32} />}
              title="Real-Time Voice Rooms"
              desc="Crystal clear, low-latency audio rooms powered by WebRTC for natural conversations."
            />
            <FeatureCard 
              icon={<Sparkles size={32} />}
              title="AI Moderator"
              desc="Intelligent session management that assigns turns, suggests topics, and monitors sentiment."
            />
            <FeatureCard 
              icon={<TrendingUp size={32} />}
              title="Advanced Analytics"
              desc="Visual feedback on your fluency, confidence, and participation time after every session."
            />
            <FeatureCard 
              icon={<Shield size={32} />}
              title="Moderator Controls"
              desc="Tools for human facilitators to manage discipline and ensure high-quality discussions."
            />
            <FeatureCard 
              icon={<MessageSquare size={32} />}
              title="Integrated Chat"
              desc="Share links, pointers, and quick clarifications without interrupting the flow."
            />
            <FeatureCard 
              icon={<Award size={32} />}
              title="Global Rankings"
              desc="Compete with thousands of users and earn badges for your communication milestones."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-32 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-grow space-y-12">
            <div className="space-y-4">
              <h2 className="text-5xl font-black leading-tight">Mastering GD is as <br />simple as <span className="text-brand-500">1-2-3</span></h2>
              <p className="text-slate-400 text-lg">We've broken down complex preparation into a seamless daily habit.</p>
            </div>
            
            <div className="space-y-8">
              <Step number="01" title="Join a Live Room" desc="Choose a topic that interests you and jump into a session with real peers." />
              <Step number="02" title="Engage and Discuss" desc="Use the turn-based system to share your views and interact with others." />
              <Step number="03" title="Get Instant Analysis" desc="Our AI evaluates your session and gives you a roadmap to improve." />
            </div>
          </div>

          <div className="relative w-full lg:w-[600px] aspect-square group">
            <div className="absolute inset-0 bg-brand-500 rounded-[3rem] rotate-6 group-hover:rotate-3 transition-transform duration-700 opacity-20" />
            <div className="absolute inset-0 bg-dark-800 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-white/5 flex items-center gap-4">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <div className="flex-grow" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SpeakSpace Console</span>
              </div>
              <div className="p-10 space-y-8">
                <div className="flex items-center gap-6 p-6 glass-strong rounded-3xl border border-white/5">
                  <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center text-white text-2xl font-black">A</div>
                  <div>
                    <p className="text-brand-400 text-[10px] font-black uppercase tracking-widest mb-1">Current Speaker</p>
                    <p className="text-xl font-bold">Aryan Sharma</p>
                  </div>
                  <div className="flex-grow" />
                  <Zap className="text-brand-500 animate-pulse" />
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time Insights</p>
                  <div className="space-y-3">
                    <div className="h-10 bg-white/5 rounded-xl border border-white/5 w-full flex items-center px-4 gap-3">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span className="text-xs text-slate-300">High Fluency detected (89%)</span>
                    </div>
                    <div className="h-10 bg-white/5 rounded-xl border border-white/5 w-[80%] flex items-center px-4 gap-3">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span className="text-xs text-slate-300">Great eye contact (Simulation)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8">
        <div className="max-w-5xl mx-auto glass-strong rounded-[4rem] p-16 text-center border border-white/5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-500/20 rounded-full blur-[80px]" />
          <div className="relative z-10">
            <h2 className="text-5xl font-black mb-6">Ready to Ace your <br /><span className="text-brand-500">Next Interview?</span></h2>
            <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto">Join 5,000+ students and professionals who are building their confidence on SpeakSpace.</p>
            <button onClick={() => navigate('/register')} className="px-12 py-6 bg-brand-500 hover:bg-brand-600 rounded-[2rem] font-black text-xl transition-all shadow-2xl shadow-brand-500/40">
              Start Your Journey Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6 max-w-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500 rounded-xl">
                <Mic size={20} className="text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase italic">SpeakSpace</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">The ultimate platform for Group Discussion and Interview skill building. Powered by AI, driven by community.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
            <FooterCol title="Product" links={['Features', 'AI Moderator', 'Pricing', 'Security']} />
            <FooterCol title="Resources" links={['Blog', 'GD Topics', 'Interview Tips', 'FAQ']} />
            <FooterCol title="Company" links={['About', 'Careers', 'Privacy', 'Terms']} />
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center text-slate-600 text-xs font-bold uppercase tracking-widest">
          © 2026 SpeakSpace. All rights reserved. Built with ❤️ for future leaders.
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-10 bg-white/5 rounded-[3rem] border border-white/5 hover:border-brand-500/30 transition-all duration-500 group">
    <div className="w-16 h-16 bg-dark-900 rounded-2xl flex items-center justify-center text-brand-500 mb-8 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500 shadow-lg">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const Step = ({ number, title, desc }) => (
  <div className="flex gap-8 group">
    <div className="text-5xl font-black text-white/10 group-hover:text-brand-500 transition-colors duration-500">{number}</div>
    <div className="space-y-2">
      <h4 className="text-xl font-bold text-white">{title}</h4>
      <p className="text-slate-500 text-sm">{desc}</p>
    </div>
  </div>
);

const FooterCol = ({ title, links }) => (
  <div className="space-y-6">
    <h5 className="text-[10px] font-black text-white uppercase tracking-widest">{title}</h5>
    <ul className="space-y-4">
      {links.map(l => (
        <li key={l}><a href={`#${l}`} className="text-sm text-slate-500 hover:text-brand-500 transition-colors">{l}</a></li>
      ))}
    </ul>
  </div>
);

export default LandingPage;
