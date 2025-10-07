'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { LightASCIIAnimation } from './ascii-animation';

// Option 1: Grid Pattern with ASCII Animation
export function GridPattern({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <>
      <svg
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full fill-gray-50/30 stroke-gray-200/20",
          className,
        )}
        {...props}
      >
        <defs>
          <pattern
            id="grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
            x="0"
            y="0"
          >
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <LightASCIIAnimation className="opacity-70" />
    </>
  );
}

// Option 2: Hexagon Pattern
export function HexagonPattern({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-50/20 stroke-gray-200/10",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id="hexagon"
          width="60"
          height="52"
          patternUnits="userSpaceOnUse"
          x="0"
          y="0"
        >
          <path
            d="M30 0L60 15L60 37L30 52L0 37L0 15L30 0Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.2"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hexagon)" />
    </svg>
  );
}

// Option 3: Wave Pattern
export function WavePattern({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-50/20 stroke-gray-200/10",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id="wave"
          width="100"
          height="40"
          patternUnits="userSpaceOnUse"
          x="0"
          y="0"
        >
          <path
            d="M0,20 Q25,0 50,20 T100,20 L100,40 L0,40 Z"
            fill="currentColor"
            fillOpacity="0.05"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wave)" />
    </svg>
  );
}

// Option 4: Triangle Pattern
export function TrianglePattern({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-50/15 stroke-gray-200/10",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id="triangle"
          width="50"
          height="43"
          patternUnits="userSpaceOnUse"
          x="0"
          y="0"
        >
          <path
            d="M25,0 L50,43 L0,43 Z"
            fill="currentColor"
            fillOpacity="0.08"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.15"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#triangle)" />
    </svg>
  );
}

// Option 5: Cross Pattern
export function CrossPattern({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-50/20 stroke-gray-200/10",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id="cross"
          width="30"
          height="30"
          patternUnits="userSpaceOnUse"
          x="0"
          y="0"
        >
          <path
            d="M15,0 L15,30 M0,15 L30,15"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.2"
          />
          <circle
            cx="15"
            cy="15"
            r="2"
            fill="currentColor"
            fillOpacity="0.1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#cross)" />
    </svg>
  );
}

// Option 6: Subtle Noise Pattern
export function NoisePattern({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full opacity-20",
        className,
      )}
      {...props}
    >
      <defs>
        <filter id="noise">
          <feTurbulence
            baseFrequency="0.9"
            numOctaves="4"
            result="noise"
            seed="1"
          />
          <feColorMatrix
            in="noise"
            type="saturate"
            values="0"
          />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#noise)" fill="gray" />
    </svg>
  );
}
