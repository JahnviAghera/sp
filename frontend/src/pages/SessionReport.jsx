import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, ArrowLeft, Download, Award, Target, CheckCircle, Loader2 } from 'lucide-react';
import api from '../services/api';
import html2pdf from 'html2pdf.js';

export default function SessionReport() {
  const { code } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const handleDownloadPDF = () => {
    setExporting(true);
    const element = reportRef.current;
    const opt = {
      margin: [10, 10],
      filename: `SpeakSpace_Report_${code}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0f172a' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setExporting(false);
    });
  };

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const resp = await api.get(`/rooms/${code}/review`);
        setReportData(resp.data.review);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to generate report');
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [code]);

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-6" />
        <h2 className="text-xl font-bold text-white mb-2">Analyzing Session...</h2>
        <p className="text-slate-400">Gemini is compiling transcripts and generating insights.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="p-8 bg-red-500/10 border border-red-500/30 rounded-3xl max-w-md text-center">
          <h2 className="text-xl font-bold text-red-400 mb-4">Report Unavailable</h2>
          <p className="text-red-300/80 mb-6">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="report-content" ref={reportRef} className="max-w-5xl mx-auto w-full p-8 space-y-12 animate-in fade-in duration-700 bg-[#0f172a]">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-brand-600/20 to-purple-600/20 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5"><Sparkles size={200} /></div>
        <div className="relative z-10">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-brand-400 text-sm font-bold mb-4 hover:text-brand-300 transition-colors no-print">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">End-of-Session Review</h1>
          <p className="text-slate-300 text-lg">Room: <span className="font-mono text-brand-400 uppercase">{code}</span></p>
        </div>
        <div className="relative z-10 no-print">
          <button 
            onClick={handleDownloadPDF} 
            disabled={exporting}
            className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-xl shadow-brand-500/20"
          >
            {exporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />} 
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </header>

      <section className="p-8 glass-strong rounded-[2.5rem] border border-white/5">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Executive Summary</h2>
        <p className="text-xl text-white leading-relaxed">{reportData?.sessionSummary}</p>
        <div className="mt-6 inline-block px-4 py-2 bg-brand-500/10 border border-brand-500/30 rounded-xl text-brand-400 font-bold text-sm">
          Overall Vibe: {reportData?.overallVibe}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-white flex items-center gap-3">
          <Award size={24} className="text-brand-500" />
          Participant Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportData?.participants?.map((p, idx) => (
            <div key={idx} className="p-8 bg-dark-800 rounded-3xl border border-white/5 hover:border-brand-500/30 transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-brand-400">Score: {p.overallScore}/100</span>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-brand-500 flex items-center justify-center font-black text-xl text-white">
                  {p.overallScore}
                </div>
              </div>
              
              <div className="space-y-4 flex-grow">
                <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><CheckCircle size={12} className="text-emerald-500"/> Strengths</h4>
                  <ul className="space-y-1">
                    {p.strengths?.map((s, i) => <li key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-emerald-500 mt-0.5">•</span> {s}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><Target size={12} className="text-yellow-500"/> Areas for Improvement</h4>
                  <ul className="space-y-1">
                    {p.areasForImprovement?.map((s, i) => <li key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-yellow-500 mt-0.5">•</span> {s}</li>)}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-sm text-slate-400 italic leading-relaxed">"{p.feedback}"</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
