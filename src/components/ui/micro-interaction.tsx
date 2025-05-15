import React, { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

type InteractionType = 
  | 'hover-scale'
  | 'hover-lift'
  | 'hover-glow'
  | 'hover-rotate'
  | 'click-ripple'
  | 'click-bounce'
  | 'focus-outline'
  | 'focus-pulse';

interface MicroInteractionProps {
  children: ReactNode;
  type: InteractionType | InteractionType[];
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  duration?: 'fast' | 'medium' | 'slow';
  disabled?: boolean;
}

/**
 * Component for adding microinteractions to elements
 */
export function MicroInteraction({
  children,
  type,
  className,
  intensity = 'medium',
  duration = 'medium',
  disabled = false,
}: MicroInteractionProps) {
  const [isActive, setIsActive] = useState(false);
  
  // Convert single type to array
  const interactionTypes = Array.isArray(type) ? type : [type];
  
  // Intensity values
  const intensityValues = {
    'hover-scale': {
      subtle: 'hover:scale-[1.02]',
      medium: 'hover:scale-[1.05]',
      strong: 'hover:scale-[1.1]',
    },
    'hover-lift': {
      subtle: 'hover:-translate-y-[2px] hover:shadow-sm',
      medium: 'hover:-translate-y-1 hover:shadow',
      strong: 'hover:-translate-y-2 hover:shadow-md',
    },
    'hover-glow': {
      subtle: 'hover:brightness-[1.05]',
      medium: 'hover:brightness-[1.1]',
      strong: 'hover:brightness-[1.2]',
    },
    'hover-rotate': {
      subtle: 'hover:rotate-1',
      medium: 'hover:rotate-2',
      strong: 'hover:rotate-3',
    },
    'click-ripple': {
      subtle: 'active:scale-[0.98]',
      medium: 'active:scale-[0.97]',
      strong: 'active:scale-[0.95]',
    },
    'click-bounce': {
      subtle: 'active:scale-[0.98] active:duration-75',
      medium: 'active:scale-[0.97] active:duration-75',
      strong: 'active:scale-[0.95] active:duration-75',
    },
    'focus-outline': {
      subtle: 'focus:outline-none focus:ring-1 focus:ring-primary/30',
      medium: 'focus:outline-none focus:ring-2 focus:ring-primary/50',
      strong: 'focus:outline-none focus:ring-2 focus:ring-primary',
    },
    'focus-pulse': {
      subtle: 'focus:outline-none focus:ring-1 focus:ring-primary/30 focus:animate-pulse',
      medium: 'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:animate-pulse',
      strong: 'focus:outline-none focus:ring-2 focus:ring-primary focus:animate-pulse',
    },
  };
  
  // Duration values
  const durationValues = {
    fast: 'duration-150',
    medium: 'duration-200',
    slow: 'duration-300',
  };
  
  // Get classes for each interaction type
  const getInteractionClasses = () => {
    return interactionTypes.map(type => {
      return intensityValues[type]?.[intensity] || '';
    }).join(' ');
  };
  
  // Handle click for ripple effect
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !interactionTypes.includes('click-ripple')) return;
    
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create ripple element
    const ripple = document.createElement('span');
    ripple.style.position = 'absolute';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    ripple.style.width = '0';
    ripple.style.height = '0';
    ripple.style.borderRadius = '50%';
    ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
    ripple.style.pointerEvents = 'none';
    
    // Add ripple to element
    element.appendChild(ripple);
    
    // Animate ripple
    const size = Math.max(element.clientWidth, element.clientHeight) * 2;
    ripple.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.5, width: '0', height: '0' },
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 0, width: `${size}px`, height: `${size}px` },
      ],
      {
        duration: duration === 'fast' ? 400 : duration === 'medium' ? 600 : 800,
        easing: 'ease-out',
      }
    ).onfinish = () => {
      ripple.remove();
    };
    
    // Handle click bounce
    if (interactionTypes.includes('click-bounce')) {
      setIsActive(true);
      setTimeout(() => setIsActive(false), 150);
    }
  };
  
  return (
    <div
      className={cn(
        'relative overflow-hidden transition-all',
        durationValues[duration],
        getInteractionClasses(),
        isActive && 'scale-[0.97]',
        disabled && 'pointer-events-none opacity-60',
        className
      )}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}
