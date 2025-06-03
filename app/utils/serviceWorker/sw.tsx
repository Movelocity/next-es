'use client'
import { useEffect, useState } from 'react';
import { register, unregister, checkVersion } from './swRegistration';

/**
 * Enhanced hook to manage service worker registration and version updates
 *
 * Features:
 * - Automatic version checking and updates
 * - Smart error recovery
 * - User-friendly notifications
 * - Development mode handling
 */
export function useSW() {
  const [swStatus, setSWStatus] = useState<{
    registered: boolean;
    updateAvailable: boolean;
    error: string | null;
  }>({
    registered: false,
    updateAvailable: false,
    error: null
  });

  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // 在开发模式下，清理所有service worker以避免缓存问题
      console.log('Development mode: Cleaning up service workers...');
      unregister();
      setSWStatus(prev => ({ ...prev, registered: false }));
      return;
    }

    // 生产模式下注册service worker
    let mounted = true;
    
    const initServiceWorker = async () => {
      try {
        // 注册service worker
        register();
        
        if (mounted) {
          setSWStatus(prev => ({ ...prev, registered: true, error: null }));
        }

        // 检查初始版本
        setTimeout(async () => {
          try {
            const hasUpdate = await checkVersion();
            if (mounted) {
              setSWStatus(prev => ({ ...prev, updateAvailable: hasUpdate }));
            }
          } catch (error) {
            console.warn('Initial version check failed:', error);
          }
        }, 2000);

        // 监听service worker状态变化
        if ('serviceWorker' in navigator) {
          const handleSWMessage = (event: MessageEvent) => {
            const { type } = event.data;
            
            if (mounted) {
              switch (type) {
                case 'SW_UPDATED':
                  setSWStatus(prev => ({ ...prev, updateAvailable: true }));
                  break;
                case 'VERSION_UPDATE':
                  setSWStatus(prev => ({ ...prev, updateAvailable: true }));
                  break;
                case 'RESOURCE_ERROR':
                  // 资源加载失败时，可能需要更新
                  setTimeout(() => {
                    if (mounted) {
                      checkVersion().then(hasUpdate => {
                        setSWStatus(prev => ({ ...prev, updateAvailable: hasUpdate }));
                      });
                    }
                  }, 5000);
                  break;
              }
            }
          };

          navigator.serviceWorker.addEventListener('message', handleSWMessage);
          
          // 清理函数
          return () => {
            navigator.serviceWorker.removeEventListener('message', handleSWMessage);
          };
        }

      } catch (error) {
        console.error('Service worker initialization failed:', error);
        if (mounted) {
          setSWStatus(prev => ({ 
            ...prev, 
            registered: false, 
            error: error instanceof Error ? error.message : 'Unknown error'
          }));
        }
      }
    };

    initServiceWorker();

    // 清理函数
    return () => {
      mounted = false;
    };
  }, []);

  // 返回状态和控制函数
  return {
    ...swStatus,
    checkForUpdates: checkVersion,
    forceUpdate: () => {
      window.location.reload();
    }
  };
}
