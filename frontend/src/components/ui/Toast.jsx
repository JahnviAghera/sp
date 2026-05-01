import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="text-emerald-400" size={20} />,
  error: <XCircle className="text-red-400" size={20} />,
  warning: <AlertTriangle className="text-amber-400" size={20} />,
  info: <Info className="text-brand-400" size={20} />,
};

const bgColors = {
  success: 'bg-emerald-500/10 border-emerald-500/20',
  error: 'bg-red-500/10 border-red-500/20',
  warning: 'bg-amber-500/10 border-amber-500/20',
  info: 'bg-brand-500/10 border-brand-500/20',
};

const Toast = ({ 
  message, 
  type = 'info', 
  onClose, 
  duration = 3000, 
  className = '' 
}) => {
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`flex items-center p-4 rounded-xl border backdrop-blur-md shadow-lg animate-slide-up ${bgColors[type]} ${className}`}>
      <div className="flex-shrink-0 mr-3">
        {icons[type]}
      </div>
      <div className="flex-1 mr-4">
        <p className="text-sm font-medium text-slate-200">
          {message}
        </p>
      </div>
      <button 
        onClick={onClose}
        className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
