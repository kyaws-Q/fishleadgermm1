import { useState, useEffect } from 'react';

type AnimationOptions = {
  duration?: number;
  delay?: number;
  easing?: string;
  iterations?: number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
};

type AnimationState = 'idle' | 'running' | 'paused' | 'finished';

/**
 * Hook for controlling CSS animations
 * @param animationName The name of the animation to use
 * @param options Animation options
 * @returns Animation controls and state
 */
export function useAnimation(
  animationName: string,
  options: AnimationOptions = {}
) {
  const [state, setState] = useState<AnimationState>('idle');
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [animation, setAnimation] = useState<Animation | null>(null);
  
  const {
    duration = 1000,
    delay = 0,
    easing = 'ease',
    iterations = 1,
    direction = 'normal',
    fillMode = 'both',
  } = options;
  
  // Create animation when element is available
  useEffect(() => {
    if (!element || !animationName) return;
    
    // Get animation keyframes from CSS
    const keyframes = getKeyframesFromCSS(animationName);
    
    if (!keyframes.length) {
      console.warn(`Animation "${animationName}" not found in CSS`);
      return;
    }
    
    // Create animation
    const anim = element.animate(keyframes, {
      duration,
      delay,
      easing,
      iterations,
      direction,
      fill: fillMode,
    });
    
    // Set initial state
    anim.pause();
    setState('idle');
    setAnimation(anim);
    
    // Update state when animation finishes
    anim.onfinish = () => setState('finished');
    
    // Cleanup
    return () => {
      anim.cancel();
    };
  }, [element, animationName, duration, delay, easing, iterations, direction, fillMode]);
  
  // Play animation
  const play = () => {
    if (animation) {
      animation.play();
      setState('running');
    }
  };
  
  // Pause animation
  const pause = () => {
    if (animation) {
      animation.pause();
      setState('paused');
    }
  };
  
  // Cancel animation
  const cancel = () => {
    if (animation) {
      animation.cancel();
      setState('idle');
    }
  };
  
  // Finish animation
  const finish = () => {
    if (animation) {
      animation.finish();
      setState('finished');
    }
  };
  
  // Reverse animation
  const reverse = () => {
    if (animation) {
      animation.reverse();
      setState('running');
    }
  };
  
  return {
    state,
    setElement,
    play,
    pause,
    cancel,
    finish,
    reverse,
  };
}

/**
 * Helper function to extract keyframes from CSS
 */
function getKeyframesFromCSS(animationName: string): Keyframe[] {
  try {
    // Default keyframes if we can't find them in CSS
    const defaultKeyframes: Keyframe[] = [
      { opacity: 0 },
      { opacity: 1 },
    ];
    
    // Try to find the keyframes in the CSS
    for (let i = 0; i < document.styleSheets.length; i++) {
      const styleSheet = document.styleSheets[i];
      try {
        const rules = styleSheet.cssRules || styleSheet.rules;
        for (let j = 0; j < rules.length; j++) {
          const rule = rules[j];
          if (rule instanceof CSSKeyframesRule && rule.name === animationName) {
            const keyframes: Keyframe[] = [];
            for (let k = 0; k < rule.cssRules.length; k++) {
              const keyframeRule = rule.cssRules[k] as CSSKeyframeRule;
              const keyframe: Keyframe = {};
              
              // Parse keyframe properties
              for (let l = 0; l < keyframeRule.style.length; l++) {
                const property = keyframeRule.style[l];
                keyframe[property as any] = keyframeRule.style.getPropertyValue(property);
              }
              
              keyframes.push(keyframe);
            }
            return keyframes;
          }
        }
      } catch (e) {
        // Ignore CORS errors when accessing stylesheets
        continue;
      }
    }
    
    return defaultKeyframes;
  } catch (error) {
    console.error('Error extracting keyframes:', error);
    return [{ opacity: 0 }, { opacity: 1 }];
  }
}

/**
 * Hook for applying animations to elements
 * @param options Animation options
 * @returns Ref to attach to element and animation controls
 */
export function useAnimatedElement(
  animationName: string,
  options: AnimationOptions & { autoPlay?: boolean } = {}
) {
  const { autoPlay = false, ...animationOptions } = options;
  const { setElement, ...controls } = useAnimation(animationName, animationOptions);
  
  // Create ref callback
  const ref = (element: HTMLElement | null) => {
    setElement(element);
    if (element && autoPlay) {
      // Small delay to ensure animation is created
      setTimeout(() => controls.play(), 10);
    }
  };
  
  return { ref, ...controls };
}
