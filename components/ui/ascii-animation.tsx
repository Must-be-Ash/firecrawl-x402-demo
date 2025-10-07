'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ASCIIAnimationProps {
  className?: string;
  activeTiles?: Set<number>;
  characters?: string;
}

const ASCII_CHARS = '.:X=+÷';

// Grid cell size - must match SVG grid pattern
const CELL_SIZE = 60;

export function ASCIIAnimation({
  className = '',
  activeTiles = new Set(),
  characters = ASCII_CHARS
}: ASCIIAnimationProps) {
  const [tileContents, setTileContents] = useState<Map<number, string>>(new Map());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [gridDimensions, setGridDimensions] = useState({ cols: 0, rows: 0 });

  // Calculate grid dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const cols = Math.floor(rect.width / CELL_SIZE);
      const rows = Math.floor(rect.height / CELL_SIZE);
      setGridDimensions({ cols, rows });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const generateTileContent = useCallback(() => {
    const newTileContents = new Map<number, string>();

    activeTiles.forEach(tileIndex => {
      // Generate ASCII content for this tile
      // At 10px font size with 1.0 line height, we can fit:
      // - ~10 characters per line (10px * 10 chars ≈ 60px with monospace spacing)
      // - ~6 lines (10px * 6 lines = 60px)
      const charsPerLine = 10;
      const numLines = 6;
      let content = '';

      for (let line = 0; line < numLines; line++) {
        for (let char = 0; char < charsPerLine; char++) {
          content += characters[Math.floor(Math.random() * characters.length)];
        }
        if (line < numLines - 1) content += '\n';
      }

      newTileContents.set(tileIndex, content);
    });

    setTileContents(newTileContents);
  }, [activeTiles, characters]);

  useEffect(() => {
    const startAnimation = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Animate characters within active tiles every 200ms
      intervalRef.current = setInterval(() => {
        generateTileContent();
      }, 200);
    };

    // Start animation after a short delay
    const timeoutId = setTimeout(startAnimation, 100);

    // Initial generation
    generateTileContent();

    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeTiles, characters, generateTileContent]);

  // Convert tile index to grid position
  const getTilePosition = (index: number) => {
    const col = index % gridDimensions.cols;
    const row = Math.floor(index / gridDimensions.cols);
    return { col, row };
  };

  return (
    <div
      ref={canvasRef}
      className={cn(
        "absolute inset-0 overflow-hidden",
        className
      )}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridDimensions.cols}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${gridDimensions.rows}, ${CELL_SIZE}px)`,
        gap: 0,
      }}
    >
      {Array.from(tileContents.entries()).map(([tileIndex, content]) => {
        const { col, row } = getTilePosition(tileIndex);
        return (
          <div
            key={tileIndex}
            className="select-none pointer-events-none"
            style={{
              gridColumn: col + 1,
              gridRow: row + 1,
              width: `${CELL_SIZE}px`,
              height: `${CELL_SIZE}px`,
              fontFamily: 'Monaco, "Cascadia Code", "Fira Code", Consolas, monospace',
              fontSize: '10px',
              lineHeight: '1.0',
              color: 'rgb(75 85 99 / 0.8)',
              whiteSpace: 'pre',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}

// Lightweight version for background patterns with diagonal wave on random tiles
export function LightASCIIAnimation({ className = '' }: { className?: string }) {
  const [tilesWithOpacity, setTilesWithOpacity] = useState<Map<number, number>>(new Map());
  const canvasRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const gridDimensionsRef = useRef({ cols: 0, rows: 0 });
  const activeTilesRef = useRef<Set<number>>(new Set());

  // Use only these 6 characters
  const characters = '.:X=+÷';

  // Calculate grid dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const cols = Math.floor(rect.width / CELL_SIZE);
      const rows = Math.floor(rect.height / CELL_SIZE);
      gridDimensionsRef.current = { cols, rows };
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Diagonal wave animation (bottom-left to top-right) on random subset of tiles
  useEffect(() => {
    let waveStartTime: number | null = null;
    const waveDuration = 3500; // 3.5 seconds wave duration (even slower)
    const pauseBetweenWaves = 2000; // 2 seconds pause between waves
    let isWavePlaying = false;
    let pauseStartTime: number | null = null;

    const animate = (timestamp: number) => {
      const { cols, rows } = gridDimensionsRef.current;

      if (cols === 0 || rows === 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Handle pause between waves
      if (!isWavePlaying) {
        if (pauseStartTime === null) {
          pauseStartTime = timestamp;
        }

        if (timestamp - pauseStartTime >= pauseBetweenWaves) {
          // Start new wave
          isWavePlaying = true;
          waveStartTime = timestamp;
          pauseStartTime = null;

          // Select random 45-55% of tiles to show during this wave (more visible)
          const totalTiles = cols * rows;
          const numActiveTiles = Math.floor(totalTiles * (0.45 + Math.random() * 0.1));
          const newActiveTiles = new Set<number>();

          while (newActiveTiles.size < numActiveTiles) {
            const randomIndex = Math.floor(Math.random() * totalTiles);
            newActiveTiles.add(randomIndex);
          }

          activeTilesRef.current = newActiveTiles;
        } else {
          // During pause, clear all tiles
          setTilesWithOpacity(new Map());
          animationFrameRef.current = requestAnimationFrame(animate);
          return;
        }
      }

      if (waveStartTime === null) {
        waveStartTime = timestamp;
      }

      const elapsed = timestamp - waveStartTime;
      const progress = elapsed / waveDuration;

      const newTilesWithOpacity = new Map<number, number>();

      // Create wave envelope: fade in and fade out (wider wave = more visible)
      const waveWidth = 0.6;

      // Calculate diagonal wave effect (bottom-left to top-right)
      activeTilesRef.current.forEach(tileIndex => {
        const col = tileIndex % cols;
        const row = Math.floor(tileIndex / cols);

        // For bottom-left to top-right:
        // Bottom-left (col=0, row=rows-1) should be 0 (start)
        // Top-right (col=cols-1, row=0) should be 1 (end)
        // Normalize by the maximum diagonal value to ensure top-right = 1.0
        const maxDiagonal = cols + rows - 2;
        const diagonalProgress = maxDiagonal > 0 ? (col + (rows - 1 - row)) / maxDiagonal : 0;

        const tileProgress = progress - diagonalProgress;

        let opacity = 0;

        if (tileProgress > 0 && tileProgress < waveWidth) {
          // Smooth sine wave envelope with boosted visibility
          const baseOpacity = Math.sin((tileProgress / waveWidth) * Math.PI);
          // Boost to 0.75 max opacity for better visibility without being too dark
          opacity = baseOpacity * 0.75;
        }

        if (opacity > 0.02) { // Lower threshold to show more tiles
          newTilesWithOpacity.set(tileIndex, opacity);
        }
      });

      setTilesWithOpacity(newTilesWithOpacity);

      // Check if wave is complete - need to wait for last tiles to fade out
      // Wave is complete when even the top-right corner (diagonalProgress = 1) has faded
      if (progress >= 1 + waveWidth) {
        isWavePlaying = false;
        waveStartTime = null;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div ref={canvasRef} className="absolute inset-0">
      <ASCIIAnimationWithOpacity
        className={className}
        tilesWithOpacity={tilesWithOpacity}
        characters={characters}
      />
    </div>
  );
}

// Modified ASCII Animation that supports per-tile opacity
interface ASCIIAnimationWithOpacityProps {
  className?: string;
  tilesWithOpacity: Map<number, number>;
  characters: string;
}

function ASCIIAnimationWithOpacity({
  className = '',
  tilesWithOpacity,
  characters
}: ASCIIAnimationWithOpacityProps) {
  const [tileContents, setTileContents] = useState<Map<number, string>>(new Map());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [gridDimensions, setGridDimensions] = useState({ cols: 0, rows: 0 });

  // Calculate grid dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const cols = Math.floor(rect.width / CELL_SIZE);
      const rows = Math.floor(rect.height / CELL_SIZE);
      setGridDimensions({ cols, rows });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const generateTileContent = useCallback(() => {
    const newTileContents = new Map<number, string>();

    tilesWithOpacity.forEach((_, tileIndex) => {
      const charsPerLine = 10;
      const numLines = 6;
      let content = '';

      for (let line = 0; line < numLines; line++) {
        for (let char = 0; char < charsPerLine; char++) {
          content += characters[Math.floor(Math.random() * characters.length)];
        }
        if (line < numLines - 1) content += '\n';
      }

      newTileContents.set(tileIndex, content);
    });

    setTileContents(newTileContents);
  }, [tilesWithOpacity, characters]);

  useEffect(() => {
    const startAnimation = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        generateTileContent();
      }, 200);
    };

    const timeoutId = setTimeout(startAnimation, 100);
    generateTileContent();

    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tilesWithOpacity, characters, generateTileContent]);

  const getTilePosition = (index: number) => {
    const col = index % gridDimensions.cols;
    const row = Math.floor(index / gridDimensions.cols);
    return { col, row };
  };

  return (
    <div
      ref={canvasRef}
      className={cn(
        "absolute inset-0 overflow-hidden",
        className
      )}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridDimensions.cols}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${gridDimensions.rows}, ${CELL_SIZE}px)`,
        gap: 0,
      }}
    >
      {Array.from(tileContents.entries()).map(([tileIndex, content]) => {
        const { col, row } = getTilePosition(tileIndex);
        const opacity = tilesWithOpacity.get(tileIndex) || 0;

        return (
          <div
            key={tileIndex}
            className="select-none pointer-events-none"
            style={{
              gridColumn: col + 1,
              gridRow: row + 1,
              width: `${CELL_SIZE}px`,
              height: `${CELL_SIZE}px`,
              fontFamily: 'Monaco, "Cascadia Code", "Fira Code", Consolas, monospace',
              fontSize: '10px',
              lineHeight: '1.0',
              color: 'rgb(75 85 99 / 0.8)',
              whiteSpace: 'pre',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity,
              transition: 'opacity 0.3s ease-in-out',
            }}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
