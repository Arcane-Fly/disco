import { useState, useEffect, useRef } from 'react';

interface GestureHookOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  threshold?: number;
}

export function useGestures(options: GestureHookOptions) {
  const [isGesturing, setIsGesturing] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const pinchStartRef = useRef<number | null>(null);
  const threshold = options.threshold || 50;

  const handleTouchStart = (e: Event) => {
    const touchEvent = e as TouchEvent;
    if (touchEvent.touches.length === 1) {
      // Single touch - track for swipe
      const touch = touchEvent.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    } else if (touchEvent.touches.length === 2) {
      // Two fingers - track for pinch
      const touch1 = touchEvent.touches[0];
      const touch2 = touchEvent.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      pinchStartRef.current = distance;
    }
    setIsGesturing(true);
  };

  const handleTouchMove = (e: Event) => {
    const touchEvent = e as TouchEvent;
    if (touchEvent.touches.length === 2 && pinchStartRef.current && options.onPinch) {
      // Handle pinch gesture
      const touch1 = touchEvent.touches[0];
      const touch2 = touchEvent.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      const scale = distance / pinchStartRef.current;
      options.onPinch(scale);
    }
  };

  const handleTouchEnd = (e: Event) => {
    const touchEvent = e as TouchEvent;
    if (touchStartRef.current && touchEvent.changedTouches.length === 1) {
      const touch = touchEvent.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;
      
      // Only process quick swipes (less than 300ms)
      if (deltaTime < 300) {
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Determine if this is a swipe gesture
        if (absDeltaX > threshold || absDeltaY > threshold) {
          if (absDeltaX > absDeltaY) {
            // Horizontal swipe
            if (deltaX > 0 && options.onSwipeRight) {
              options.onSwipeRight();
            } else if (deltaX < 0 && options.onSwipeLeft) {
              options.onSwipeLeft();
            }
          } else {
            // Vertical swipe
            if (deltaY > 0 && options.onSwipeDown) {
              options.onSwipeDown();
            } else if (deltaY < 0 && options.onSwipeUp) {
              options.onSwipeUp();
            }
          }
        }
      }
    }
    
    touchStartRef.current = null;
    pinchStartRef.current = null;
    setIsGesturing(false);
  };

  return {
    isGesturing,
    gestureHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
}