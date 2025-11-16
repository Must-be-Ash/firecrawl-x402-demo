"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Component,
  ExpandableCard,
  ExpandableCardHeader,
  ExpandableCardContent,
  ExpandableContent,
} from "@/components/ui/expandable";
import { cn } from "@/lib/utils";
import { SearchButton } from "@/components/ui/search-button";

// Hook to detect mobile and get viewport dimensions
function useViewport() {
  const [viewport, setViewport] = useState({ width: 0, height: 0, isMobile: false });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewport({
        width,
        height,
        isMobile: width < 768,
      });
    };
    
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return viewport;
}

interface ExpandableSearchDockProps {
  query: string;
  setQuery: (query: string) => void;
  limit: number;
  setLimit: (limit: number) => void;
  onSearch: () => void;
  isLoading: boolean;
  className?: string;
}

export function ExpandableSearchDock({
  query,
  setQuery,
  limit,
  setLimit,
  onSearch,
  isLoading,
  className,
}: ExpandableSearchDockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const { isMobile, width, height } = useViewport();

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);

    // Reset height to auto to get the correct scrollHeight
    e.target.style.height = "auto";

    // Set height based on scrollHeight, with max height
    const maxHeight = 120; // max height in pixels when collapsed
    const newHeight = Math.min(e.target.scrollHeight, maxHeight);
    e.target.style.height = `${newHeight}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSearch();
      setIsExpanded(false); // Collapse after search
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleSearchClick = () => {
    onSearch();
    setIsExpanded(false); // Collapse after search
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  // Handle click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Backdrop blur overlay when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      <Component
        expanded={isExpanded}
        expandDirection="both"
        expandBehavior="replace"
        transitionDuration={0.3}
        easeType="easeInOut"
      >
        <div
          ref={dockRef}
          className={cn(
            "fixed bottom-24 z-50",
            isMobile 
              ? isExpanded 
                ? "left-0 right-0 px-4" 
                : "left-1/2 -translate-x-1/2"
              : "left-1/2 -translate-x-1/2",
            "origin-center",
            className
          )}
          style={!isMobile || !isExpanded ? { transform: "translateX(-50%)" } : undefined}
        >
        <ExpandableCard
          collapsedSize={{ width: 320, height: 48 }}
          expandedSize={isMobile && width > 0
            ? { width: width - 32, height: Math.min(height - 150, 600) }
            : { width: 800, height: 550 }
          }
          className="origin-center"
        >
          {/* Collapsed View: Minimal Dock - Just Input (No Buttons) */}
          <ExpandableCardHeader className="p-0">
            <div className="flex items-center gap-3 px-4 py-3 h-full w-full">
              <div className="flex-1 relative min-w-0">
                <textarea
                  ref={textareaRef}
                  value={query}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  onFocus={handleFocus}
                  placeholder="Search anything..."
                  rows={1}
                  data-no-toggle="true"
                  className={cn(
                    "w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none resize-none overflow-y-auto leading-relaxed text-sm transition-all",
                    isExpanded 
                      ? "border border-gray-200/50 bg-gray-50/50 focus:border-gray-300/50 focus:bg-gray-50" 
                      : "border-none bg-transparent"
                  )}
                  disabled={isLoading}
                  style={{
                    minHeight: isExpanded ? "48px" : "24px",
                    maxHeight: isExpanded ? "120px" : "80px",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                />
              </div>
              {isExpanded && (
                <div className="flex-shrink-0 ml-auto">
                  <SearchButton
                    onClick={handleSearchClick}
                    disabled={isLoading || !query.trim()}
                  />
                </div>
              )}
            </div>
          </ExpandableCardHeader>

          {/* Expanded View: Settings Panel */}
          <ExpandableContent preset="blur-md" stagger staggerChildren={0.1}>
            <ExpandableCardContent className={cn(
              "px-4 pb-4 pt-2 overflow-y-auto",
              isMobile ? "max-h-[calc(100vh-180px)]" : "max-h-[calc(100vh-200px)]"
            )}>
              {/* Settings Grid */}
              <div className="bg-gray-50 rounded-xl p-2.5 mb-4 w-fit mx-auto">
                <div className="flex items-center gap-3" data-no-toggle="true">
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Results</span>
                  <div className="flex items-center gap-1">
                    {[5, 10, 15, 20].map((value) => (
                      <button
                        key={value}
                        onClick={() => setLimit(value)}
                        data-no-toggle="true"
                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                          limit === value
                            ? "bg-gray-800 text-white"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </ExpandableCardContent>
          </ExpandableContent>
        </ExpandableCard>
      </div>
    </Component>
    </>
  );
}
