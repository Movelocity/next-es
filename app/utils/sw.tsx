'use client'
import { useEffect } from 'react';
import * as serviceWorkerRegistration from './swRegistration';


export function useSW() {
  useEffect(() => {
    // Register service worker
    serviceWorkerRegistration.register();
  }, []);
}

