import React from 'react';

const Avatar = ({ src, alt = 'Avatar', fallback, size = 'md', className = '', status }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const sizeClass = sizes[size] || sizes.md;

  return (
    <div className={`relative inline-block ${sizeClass} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full rounded-full object-cover border border-white/10"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-dark-600 border border-white/10 flex items-center justify-center text-slate-300 font-medium">
          {fallback || alt.charAt(0).toUpperCase()}
        </div>
      )}
      
      {status && (
        <span 
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-dark-900 ${
            status === 'online' ? 'status-online' : 
            status === 'busy' ? 'status-busy' : 'status-offline'
          }`} 
        />
      )}
    </div>
  );
};

export default Avatar;
