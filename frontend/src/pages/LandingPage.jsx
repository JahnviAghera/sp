import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, Users, TrendingUp, Shield, ArrowRight, Zap, Award } from 'lucide-react';
import Button from '../components/ui/Button';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <div className={`glass p-8 rounded-3xl hover:border-brand-500/30 transition-all duration-300 hover:-translate-y-2 animate-slide-up ${delay}`}>
    <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center mb-6">
      <Icon size={28} className="text-brand-400" />
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-bg-primary overflow-hidden selection:bg-brand-500/30 selection:text-white">
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-screen bg-gradient-hero opacity-50 z-0 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-600/20 rounded-full blur-[120px] z-0 pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[100px] z-0 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 w-full glass border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow">
            <Mic size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">SpeakSpace</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">Log in</Link>
          <Link to="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-brand-500/20 text-brand-300 text-sm font-semibold mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          The future of communication training
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 animate-slide-up leading-tight">
          Master Your Voice with <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-purple-400 to-cyan-400">AI-Powered Feedback</span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 animate-slide-up animate-stagger-1">
          Practice group discussions and interview skills in real-time. 
          Get instant, actionable insights on your communication style, confidence, and clarity.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animate-stagger-2">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" icon={ArrowRight} iconPosition="right" className="w-full">
              Start Practicing Free
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full">
              View Demo
            </Button>
          </Link>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-24 relative max-w-5xl mx-auto animate-slide-up animate-stagger-3">
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent z-10" />
          <div className="glass-strong rounded-t-3xl border-b-0 p-4 shadow-2xl relative overflow-hidden">
            {/* Mock Header */}
            <div className="flex gap-2 mb-4 px-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            {/* Mock Content */}
            <div className="grid grid-cols-3 gap-6 h-[400px]">
              <div className="col-span-2 bg-dark-900/50 rounded-2xl border border-white/5 p-6">
                <div className="w-1/3 h-6 bg-slate-800 rounded-md mb-6 skeleton" />
                <div className="space-y-4">
                  <div className="w-full h-24 bg-slate-800/50 rounded-xl skeleton" />
                  <div className="w-full h-24 bg-slate-800/50 rounded-xl skeleton" />
                </div>
              </div>
              <div className="col-span-1 bg-dark-900/50 rounded-2xl border border-white/5 p-6">
                <div className="w-1/2 h-6 bg-slate-800 rounded-md mb-6 skeleton" />
                <div className="w-full h-40 bg-brand-900/20 rounded-xl border border-brand-500/20 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-brand-500/30 flex items-center justify-center">
                    <span className="text-2xl font-bold text-brand-400">92</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="relative z-10 py-24 bg-dark-950/50 border-t border-white/5">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need to succeed</h2>
            <p className="text-slate-400">Comprehensive tools designed to elevate your speaking capabilities.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Mic} 
              title="Real-time Audio Rooms" 
              description="Join seamless, low-latency audio rooms to practice with peers from around the world."
              delay="animate-stagger-1"
            />
            <FeatureCard 
              icon={Zap} 
              title="Instant AI Feedback" 
              description="Our advanced AI analyzes your tone, pace, and vocabulary, providing actionable insights."
              delay="animate-stagger-2"
            />
            <FeatureCard 
              icon={TrendingUp} 
              title="Performance Analytics" 
              description="Track your progress over time with detailed charts and personalized improvement metrics."
              delay="animate-stagger-3"
            />
            <FeatureCard 
              icon={Users} 
              title="Peer Evaluation" 
              description="Give and receive constructive feedback from your peers to build a supportive community."
              delay="animate-stagger-4"
            />
            <FeatureCard 
              icon={Shield} 
              title="Moderator Controls" 
              description="Create private rooms, manage participants, and enforce speaking times with robust tools."
              delay="animate-stagger-5"
            />
            <FeatureCard 
              icon={Award} 
              title="Global Leaderboard" 
              description="Compete with other speakers, earn badges, and climb the ranks as you improve your skills."
              delay="animate-stagger-[6]"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 bg-dark-900">
        <div className="container mx-auto px-6 text-center text-slate-500">
          <p>© {new Date().getFullYear()} SpeakSpace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
