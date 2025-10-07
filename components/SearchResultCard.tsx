"use client";

import { useState } from "react";
import Image from "next/image";
import { FirecrawlWebResult } from "@/types/firecrawl";
import { MinimalButton } from "@/components/ui/minimal-button";
import { HyperText } from "@/components/ui/hyper-text";

interface SearchResultCardProps {
  result: FirecrawlWebResult;
  index: number;
}

export default function SearchResultCard({ result, index }: SearchResultCardProps) {
  const [showContent, setShowContent] = useState(false);

  // Extract domain from URL for favicon
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return '';
    }
  };

  const domain = getDomain(result.url);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Card Header */}
      <div className="p-3 md:p-4 border-b border-gray-100">
        <div className="flex items-start gap-3">
          {/* Favicon */}
          <Image
            src={faviconUrl}
            alt={`${domain} favicon`}
            width={32}
            height={32}
            className="w-8 h-8 rounded-lg flex-shrink-0 mt-1"
            unoptimized
          />

          <div className="flex-1 min-w-0">
            {/* Title with HyperText Effect (Desktop Only) */}
            <div className="mb-1">
              <div className="hidden md:block">
                <HyperText
                  text={result.title || result.metadata.title || 'Untitled'}
                  className="text-base md:text-lg font-semibold text-gray-900 line-clamp-2"
                  duration={600}
                  animateOnLoad={false}
                />
              </div>
              <h3 className="md:hidden font-semibold text-gray-900 text-base line-clamp-2">
                {result.title || result.metadata.title || 'Untitled'}
              </h3>
            </div>

            {/* Source & URL */}
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 flex-wrap">
              <span className="font-medium">{domain}</span>
              <span className="hidden sm:inline">•</span>
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 truncate max-w-[200px] sm:max-w-xs"
              >
                {result.url}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 md:p-4">
        {/* Description/Summary */}
        <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4">
          {result.description || result.summary || result.metadata.description || 'No description available.'}
        </p>

        {/* Screenshot/Image if available */}
        {result.screenshot && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <Image
              src={result.screenshot}
              alt={result.title || 'Screenshot'}
              width={800}
              height={400}
              className="w-full h-48 object-cover"
              unoptimized
            />
          </div>
        )}

        {/* Action Buttons with HyperText Effect (Desktop Only) */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <MinimalButton
            variant="primary"
            onClick={() => window.open(result.url, '_blank')}
          >
            <div className="hidden md:block">
              <HyperText
                text="Visit"
                className="text-white font-medium"
                duration={300}
                animateOnLoad={false}
              />
            </div>
            <span className="md:hidden text-white font-medium">Visit</span>
          </MinimalButton>

          {result.markdown && (
            <MinimalButton
              variant="secondary"
              onClick={() => setShowContent(!showContent)}
            >
              <div className="hidden md:block">
                <HyperText
                  text={showContent ? 'Hide' : 'View'}
                  className="text-gray-700 font-medium"
                  duration={350}
                  animateOnLoad={false}
                />
              </div>
              <span className="md:hidden text-gray-700 font-medium">
                {showContent ? 'Hide' : 'View'}
              </span>
            </MinimalButton>
          )}

          {result.markdown && (
            <MinimalButton
              variant="secondary"
              onClick={() => {
                const blob = new Blob([result.markdown], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${result.title || 'content'}.md`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <div className="hidden md:block">
                <HyperText
                  text="Download"
                  className="hidden sm:inline text-gray-700 font-medium"
                  duration={400}
                  animateOnLoad={false}
                />
                <HyperText
                  text="DL"
                  className="sm:hidden text-gray-700 font-medium"
                  duration={400}
                  animateOnLoad={false}
                />
              </div>
              <span className="md:hidden text-gray-700 font-medium">
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">DL</span>
              </span>
            </MinimalButton>
          )}
        </div>

        {/* Expandable Content */}
        {showContent && result.markdown && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <pre className="bg-gray-50 p-3 md:p-4 rounded-lg overflow-x-auto max-h-64 md:max-h-96 text-xs whitespace-pre-wrap text-gray-700 font-mono">
              {result.markdown}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
