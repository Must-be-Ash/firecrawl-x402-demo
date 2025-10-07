'use client';
import React from 'react';

interface SignoutButtonProps {
  onClick?: () => void;
  className?: string;
}

export function SignoutButton({ onClick, className = '' }: SignoutButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium text-xs md:text-sm w-full md:w-auto justify-center ${className}`}
    >
      <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      <span className="sm:inline">Sign Out</span>
    </button>
  );
}
