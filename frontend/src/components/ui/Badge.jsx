import React from 'react';

const variants = {
  brand: 'badge-brand',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  neutral: 'badge-neutral',
};

const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const badgeClass = variants[variant] || variants.neutral;
  
  return (
    <span className={`${badgeClass} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
