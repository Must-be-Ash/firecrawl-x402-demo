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
  const baseStyles = "relative inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2";

  const variantStyles = variant === 'primary'
    ? "text-white"
    : "text-gray-700";

  const frameStyles = variant === 'primary'
    ? "bg-gradient-to-b from-orange-600 via-orange-500 to-orange-700"
    : "bg-gradient-to-b from-gray-300 via-gray-200 to-gray-400";

  const innerStyles = variant === 'primary'
    ? "bg-gradient-radial from-orange-400 via-orange-500 to-orange-600"
    : "bg-gradient-radial from-gray-100 via-gray-150 to-gray-200";

  return (
    <div className={`relative ${frameStyles} rounded-lg p-0.5 ${className}`}>
      <button
        onClick={onClick}
        className={`${baseStyles} ${variantStyles} ${innerStyles} w-full h-full`}
        style={{
          background: variant === 'primary' 
            ? 'radial-gradient(circle at 30% 30%, #fb923c, #f97316, #ea580c)'
            : 'radial-gradient(circle at 30% 30%, #f9fafb, #f3f4f6, #e5e7eb)'
        }}
      >
        {children}
      </button>
    </div>
  );
}
