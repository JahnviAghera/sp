import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, type = 'text', className = '', ...props }, ref) => {
  return (
    <div className="w-full space-y-2">
      {label && <label className="block text-sm font-semibold text-slate-300 ml-1">{label}</label>}
      <div className="relative">
        <input
          ref={ref}
          type={type}
          className={`
            w-full px-5 py-3.5 bg-dark-800/50 border border-dark-700 rounded-2xl text-white placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500
            transition-all duration-200 backdrop-blur-sm
            ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-400 mt-1 ml-1">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
