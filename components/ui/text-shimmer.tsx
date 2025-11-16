'use client';
import React, { useMemo, type JSX } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextShimmerProps {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  spread?: number;
}

export function TextShimmer({
  children,
  as: Component = 'div',
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
  const MotionComponent = motion(Component as keyof JSX.IntrinsicElements);


  return (
    <MotionComponent
      className={cn(className)}
      initial={{ backgroundPosition: '100% center' }}
      animate={{ backgroundPosition: '0% center' }}
      transition={{
        repeat: Infinity,
        duration,
        ease: 'linear',
      }}
      style={{
        background: `linear-gradient(90deg, 
          rgba(255, 255, 255, 0.9) 0%, 
          rgba(255, 255, 255, 0.9) 40%, 
          rgba(255, 255, 255, 1) 50%, 
          rgba(255, 255, 255, 0.9) 60%, 
          rgba(255, 255, 255, 0.9) 100%
        )`,
        backgroundSize: '300% 100%',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        backgroundRepeat: 'no-repeat',
        display: 'inline-block',
      }}
    >
      {children}
    </MotionComponent>
  );
}