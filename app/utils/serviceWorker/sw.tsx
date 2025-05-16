'use client'
import { useEffect } from 'react';
import { register, unregister } from './swRegistration';

/**
 * Hook to manage service worker registration and unregistration
 *
 * In development mode: Unregisters service workers to prevent caching issues
 * In production mode: Registers the service worker for offline capabilities
 */
export function useSW() {
  useEffect(() => {
    // In development mode, the register function will automatically skip registration
    // In production mode, it will register the service worker
    register();

    // Always unregister service workers in development mode on mount
    // to ensure we don't have stale service workers from previous runs
    if (process.env.NODE_ENV === 'development') {
      unregister();
    }

    // Cleanup function when component unmounts
    return () => {
      // No need to unregister on unmount as it would affect the user experience
      // We only want to unregister during development
    };
  }, []);
}
