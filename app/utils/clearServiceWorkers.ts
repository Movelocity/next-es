/**
 * Utility function to manually clear all service workers
 * This can be called from the browser console when needed
 */
import { clearCachesAndServiceWorkers } from './swRegistration';

// Export the function for use in components
export const clearAllServiceWorkers = clearCachesAndServiceWorkers;

// Make it available globally for easy access from the browser console
if (typeof window !== 'undefined') {
  (window as any).clearAllServiceWorkers = clearAllServiceWorkers;
  console.log('Service worker utilities loaded. Use clearAllServiceWorkers() to clear service workers and caches.');
}
