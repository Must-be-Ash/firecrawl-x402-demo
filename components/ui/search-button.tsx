'use client';
import React from 'react';

interface SearchButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

export function SearchButton({ onClick, disabled = false }: SearchButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-[38px] w-[38px] md:h-[50px] md:w-[50px] rounded-full bg-gradient-to-b from-[#FF8C00] via-[#FF7400] to-[#FF5C00] hover:from-[#FFA500] hover:via-[#FF8C00] hover:to-[#FF7400] active:from-[#FF5C00] active:via-[#E64D00] active:to-[#CC4400] shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white"
    >
      <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>
  );
}
