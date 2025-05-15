import React, { useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type TransitionType = 'fade' | 'slide' | 'zoom' | 'flip' | 'none';
type Direction = 'up' | 'down' | 'left' | 'right';

interface AnimatedTransitionProps {
  children: ReactNode;
  show?: boolean;
  type?: TransitionType;
  direction?: Direction;
  duration?: number;
  delay?: number;
  className?: string;
  unmountOnExit?: boolean;
  onEnter?: () => void;
  onExit?: () => void;
}

/**
 * Component for animated transitions
 */
export function AnimatedTransition({
  children,
  show = true,
  type = 'fade',
  direction = 'up',
  duration = 300,
  delay = 0,
  className,
  unmountOnExit = false,
  onEnter,
  onExit,
}: AnimatedTransitionProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setIsAnimating(true);
      onEnter?.();
    } else {
      setIsAnimating(false);
      onExit?.();
      if (unmountOnExit) {
        const timer = setTimeout(() => {
          setShouldRender(false);
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [show, duration, unmountOnExit, onEnter, onExit]);
  
  if (!shouldRender && unmountOnExit) {
    return null;
  }
  
  // Get transition classes based on type and direction
  const getTransitionClasses = () => {
    const baseClasses = `transition-all duration-${duration} delay-${delay}`;
    
    if (type === 'none') return baseClasses;
    
    const enterClasses = {
      fade: 'opacity-100',
      slide: `translate-${direction === 'up' ? 'y-0' : direction === 'down' ? 'y-0' : direction === 'left' ? 'x-0' : 'x-0'}`,
      zoom: 'scale-100 opacity-100',
      flip: `rotate-${direction === 'up' || direction === 'down' ? 'x' : 'y'}-0 opacity-100`,
    };
    
    const exitClasses = {
      fade: 'opacity-0',
      slide: `translate-${direction === 'up' ? 'y-full' : direction === 'down' ? '-y-full' : direction === 'left' ? 'x-full' : '-x-full'}`,
      zoom: 'scale-95 opacity-0',
      flip: `rotate-${direction === 'up' ? 'x-90' : direction === 'down' ? '-x-90' : direction === 'left' ? 'y-90' : '-y-90'} opacity-0`,
    };
    
    return cn(
      baseClasses,
      isAnimating ? enterClasses[type] : exitClasses[type]
    );
  };
  
  return (
    <div
      className={cn(
        getTransitionClasses(),
        type === 'slide' && 'transform',
        type === 'zoom' && 'transform',
        type === 'flip' && 'transform perspective-1000',
        className
      )}
    >
      {children}
    </div>
  );
}
