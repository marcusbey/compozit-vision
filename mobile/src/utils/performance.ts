import { InteractionManager, Platform } from 'react-native';

/**
 * Performance optimization utilities for Enhanced AI Processing
 * Ensures 60 FPS performance and <2 second load times
 */

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  frameRate: number;
  loadTime: number;
}

/**
 * Delays execution until after interactions are complete
 * Prevents UI lag during animations
 */
export const runAfterInteractions = (callback: () => void): void => {
  InteractionManager.runAfterInteractions(() => {
    callback();
  });
};

/**
 * Batches state updates to prevent excessive re-renders
 */
export const batchUpdates = <T>(
  updateFunction: (updates: T) => void,
  updates: T[],
  batchSize: number = 5
): void => {
  const batches = [];
  for (let i = 0; i < updates.length; i += batchSize) {
    batches.push(updates.slice(i, i + batchSize));
  }

  batches.forEach((batch, index) => {
    setTimeout(() => {
      batch.forEach(update => updateFunction(update));
    }, index * 16); // 60 FPS = 16.67ms per frame
  });
};

/**
 * Debounces function calls to prevent excessive API calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttles function calls to maintain performance
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Measures render performance
 */
export const measureRenderPerformance = async (
  componentName: string,
  renderFunction: () => Promise<void> | void
): Promise<PerformanceMetrics> => {
  const startTime = performance.now();
  const startMemory = getMemoryUsage();
  
  await renderFunction();
  
  const endTime = performance.now();
  const endMemory = getMemoryUsage();
  
  const metrics: PerformanceMetrics = {
    renderTime: endTime - startTime,
    memoryUsage: endMemory - startMemory,
    frameRate: calculateFrameRate(endTime - startTime),
    loadTime: endTime - startTime,
  };

  if (__DEV__) {
    console.log(`Performance metrics for ${componentName}:`, metrics);
    
    // Warn if performance targets are not met
    if (metrics.renderTime > 100) {
      console.warn(`${componentName} render time (${metrics.renderTime}ms) exceeds 100ms target`);
    }
    
    if (metrics.frameRate < 55) {
      console.warn(`${componentName} frame rate (${metrics.frameRate} FPS) below 55 FPS target`);
    }
  }

  return metrics;
};

/**
 * Gets current memory usage (if available)
 */
const getMemoryUsage = (): number => {
  if (Platform.OS === 'web' && (performance as any).memory) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
};

/**
 * Calculates frame rate based on render time
 */
const calculateFrameRate = (renderTime: number): number => {
  if (renderTime === 0) return 60;
  return Math.min(60, 1000 / renderTime);
};

/**
 * Optimizes image loading for better performance
 */
export const optimizeImageLoading = (imageUri: string, targetSize?: { width: number; height: number }) => {
  // Add query parameters for image optimization
  const separator = imageUri.includes('?') ? '&' : '?';
  let optimizedUri = imageUri;

  if (targetSize) {
    optimizedUri += `${separator}w=${targetSize.width}&h=${targetSize.height}&fit=cover&auto=format`;
  } else {
    optimizedUri += `${separator}auto=format&q=80`;
  }

  return optimizedUri;
};

/**
 * Preloads images to improve perceived performance
 */
export const preloadImages = async (imageUris: string[]): Promise<void> => {
  const promises = imageUris.map(uri => {
    return new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`Failed to load image: ${uri}`));
      image.src = uri;
    });
  });

  try {
    await Promise.all(promises);
  } catch (error) {
    console.warn('Some images failed to preload:', error);
  }
};

/**
 * Lazy loading utility for components
 */
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>
) => {
  return React.lazy(() => 
    importFunction().then(module => ({
      default: module.default
    }))
  );
};

/**
 * Memory cleanup utility
 */
export const cleanupMemory = (): void => {
  // Force garbage collection if available (mainly for development)
  if (__DEV__ && global.gc) {
    global.gc();
  }
  
  // Clear any cached data that's no longer needed
  // This would be implementation-specific based on your caching strategy
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null);
  
  const startMeasurement = React.useCallback(() => {
    const startTime = performance.now();
    const startMemory = getMemoryUsage();
    
    return {
      end: () => {
        const endTime = performance.now();
        const endMemory = getMemoryUsage();
        
        const newMetrics: PerformanceMetrics = {
          renderTime: endTime - startTime,
          memoryUsage: endMemory - startMemory,
          frameRate: calculateFrameRate(endTime - startTime),
          loadTime: endTime - startTime,
        };
        
        setMetrics(newMetrics);
        
        if (__DEV__) {
          console.log(`${componentName} performance:`, newMetrics);
        }
        
        return newMetrics;
      }
    };
  }, [componentName]);
  
  return { metrics, startMeasurement };
};

/**
 * Animation optimization utilities
 */
export const animationOptimizations = {
  /**
   * Creates optimized animation configs for React Native Reanimated
   */
  createOptimizedTiming: (duration: number = 300) => ({
    duration,
    easing: 'ease-out' as const,
    // Use native driver when possible
    useNativeDriver: true,
  }),

  /**
   * Creates optimized spring configs
   */
  createOptimizedSpring: () => ({
    damping: 15,
    stiffness: 150,
    mass: 1,
    useNativeDriver: true,
  }),

  /**
   * Batch animation updates to prevent layout thrashing
   */
  batchAnimations: (animations: (() => void)[]) => {
    requestAnimationFrame(() => {
      animations.forEach(animation => animation());
    });
  },
};

/**
 * Network request optimization
 */
export const networkOptimizations = {
  /**
   * Creates optimized fetch with timeout and retry logic
   */
  optimizedFetch: async (
    url: string, 
    options: RequestInit = {},
    timeout: number = 5000,
    retries: number = 3
  ): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          return response;
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (error) {
        if (i === retries - 1) throw error;
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    
    throw new Error('Max retries exceeded');
  },

  /**
   * Concurrent request limiter
   */
  createConcurrencyLimiter: (maxConcurrent: number = 3) => {
    let running = 0;
    const queue: (() => void)[] = [];
    
    return <T>(fn: () => Promise<T>): Promise<T> => {
      return new Promise((resolve, reject) => {
        const execute = async () => {
          running++;
          try {
            const result = await fn();
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            running--;
            if (queue.length > 0 && running < maxConcurrent) {
              const next = queue.shift();
              if (next) next();
            }
          }
        };
        
        if (running < maxConcurrent) {
          execute();
        } else {
          queue.push(execute);
        }
      });
    };
  },
};

// React import for hooks
import React from 'react';