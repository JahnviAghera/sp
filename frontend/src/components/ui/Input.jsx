import React from 'react';

const Input = React.forwardRef(({ label, error, className = '', containerClassName = '', ...props }, ref) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && <label className="input-label">{label}</label>}
      <input
        ref={ref}
        className={`input-field ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
