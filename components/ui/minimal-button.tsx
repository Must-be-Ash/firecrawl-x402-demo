'use client';
import React from 'react';

interface MinimalButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function MinimalButton({
  children,
  onClick,
  variant = 'secondary',
  className = '',
}: MinimalButtonProps) {
  const baseStyles = variant === 'primary'
    ? "relative inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
    : "relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2";

  const variantStyles = variant === 'primary'
    ? "text-black"
    : "text-gray-700";

  const frameStyles = variant === 'primary'
    ? "bg-gradient-to-b from-gray-400 via-gray-300 to-gray-500 shadow-md"
    : "bg-gradient-to-b from-gray-300 via-gray-200 to-gray-400";

  const innerStyles = variant === 'primary'
    ? "bg-gradient-radial from-gray-50 via-gray-100 to-gray-200"
    : "bg-gradient-radial from-gray-100 via-gray-150 to-gray-200";

  return (
    <div className={`relative ${frameStyles} ${variant === 'primary' ? 'rounded-full' : 'rounded-lg'} p-[2px] shadow-sm ${className}`}>
      <button
        onClick={onClick}
        className={`${baseStyles} ${variantStyles} ${innerStyles} w-full h-full hover:shadow-inner active:shadow-inner transition-all`}
        style={{
          background: variant === 'primary' 
            ? 'radial-gradient(circle at 30% 30%, #f9fafb, #f3f4f6, #e5e7eb)'
            : 'radial-gradient(circle at 30% 30%, #f9fafb, #f3f4f6, #e5e7eb)',
          boxShadow: variant === 'primary'
            ? 'inset 0 1px 2px rgba(255, 255, 255, 0.8), inset 0 -1px 1px rgba(0, 0, 0, 0.1)'
            : 'none'
        }}
      >
        {children}
      </button>
    </div>
  );
}
