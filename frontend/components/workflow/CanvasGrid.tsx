/**
 * Canvas Grid Component - WebContainer Compatible
 * Handles hydration-safe canvas rendering with proper client-side initialization
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CanvasGridProps {
  width?: number;
  height?: number;
  gridSize?: number;
  className?: string;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  children?: React.ReactNode;
}

const CanvasGrid: React.FC<CanvasGridProps> = ({
  width = 800,
  height = 600,
  gridSize = 20,
  className = '',
  onCanvasReady,
  children
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  // Client-side mounting check to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize canvas grid when client-side mounted
  useEffect(() => {
    if (!isClient || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas dimensions
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width || width;
      canvas.height = rect.height || height;
    } else {
      canvas.width = width;
      canvas.height = height;
    }

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height, gridSize);
    
    setCanvasReady(true);
    onCanvasReady?.(canvas);
  }, [isClient, width, height, gridSize, onCanvasReady]);

  const drawGrid = useCallback((
    ctx: CanvasRenderingContext2D, 
    canvasWidth: number, 
    canvasHeight: number, 
    size: number
  ) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Set grid style
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;

    // Draw vertical lines
    for (let x = 0; x <= canvasWidth; x += size) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, canvasHeight);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= canvasHeight; y += size) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(canvasWidth, y + 0.5);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }, []);

  // Handle window resize
  useEffect(() => {
    if (!isClient || !canvasRef.current || !containerRef.current) return;

    const handleResize = () => {
      const canvas = canvasRef.current!;
      const container = containerRef.current!;
      const ctx = canvas.getContext('2d')!;
      
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      drawGrid(ctx, canvas.width, canvas.height, gridSize);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isClient, drawGrid, gridSize]);

  // Server-side render fallback
  if (!isClient) {
    return (
      <div 
        className={`bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 ${className}`}
        style={{ width, height }}
      />
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      suppressHydrationWarning
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          background: 'transparent',
          imageRendering: 'pixelated' // Prevent canvas blur in WebContainer
        }}
      />
      {canvasReady && children && (
        <div className="absolute inset-0 pointer-events-none">
          {children}
        </div>
      )}
    </div>
  );
};

export default CanvasGrid;