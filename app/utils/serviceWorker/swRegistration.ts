/**
 * Service Worker Registration and Unregistration
 *
 * This module handles the registration and unregistration of service workers
 * with special handling for development mode to prevent caching issues.
 */

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Register the service worker for production environments
 */
export function register() {
  // Skip registration in development mode
  if (isDevelopment) {
    console.log('Service worker registration skipped in development mode');
    return;
  }

  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/serviceWorker.js';

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('ServiceWorker registration successful:', registration);
        })
        .catch((error) => {
          console.error('ServiceWorker registration failed:', error);
        });
    });
  }
}

/**
 * Unregister all service workers
 */
export function unregister() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    // Get all service worker registrations
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length > 0) {
        console.log(`Found ${registrations.length} service worker(s) to unregister`);

        // Unregister each service worker
        registrations.forEach(registration => {
          registration.unregister().then(() => {
            console.log('ServiceWorker unregistered successfully');
          });
        });
      } else {
        console.log('No service workers to unregister');
      }
    }).catch(error => {
      console.error('Error unregistering service workers:', error);
    });
  }
}

/**
 * Clear all caches and unregister service workers
 */
export function clearCachesAndServiceWorkers() {
  if (typeof window === 'undefined') return;

  // Unregister service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      let count = 0;
      const promises = registrations.map(registration => {
        count++;
        return registration.unregister();
      });

      return Promise.all(promises).then(() => {
        console.log(`Unregistered ${count} service worker(s)`);
        return count;
      });
    }).then(() => {
      // Clear caches
      if ('caches' in window) {
        return caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              console.log(`Deleting cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
          );
        });
      }
    }).then(() => {
      console.log('All service workers and caches cleared');
      // Only reload in development mode to avoid disrupting users in production
      if (isDevelopment) {
        window.location.reload();
      }
    }).catch(error => {
      console.error('Error clearing service workers and caches:', error);
    });
  }
}


export const clearAllServiceWorkers = clearCachesAndServiceWorkers;

// Make it available globally for easy access from the browser console
if (typeof window !== 'undefined') {
  (window as any).clearAllServiceWorkers = clearAllServiceWorkers;
  console.log('Service worker utilities loaded. Use clearAllServiceWorkers() to clear service workers and caches.');
}
