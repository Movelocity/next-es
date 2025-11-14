/**
 * Service Worker Registration and Management
 *
 * 增强版service worker管理，包含版本检测、错误恢复和用户通知功能
 * 
 * 开发模式特性：
 * - 自动检测并清理已有的 Service Worker
 * - 跳过 Service Worker 注册
 * - 不干扰热模块替换（HMR）
 */

import { detectAndCleanupSW, isDevelopmentMode } from './devTools';

// 检查是否在开发模式
const isDevelopment = process.env.NODE_ENV === 'development';

// 版本检测和更新配置
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5分钟检查一次版本
const ERROR_RETRY_INTERVAL = 30 * 1000; // 30秒后重试失败的操作
const MAX_ERROR_COUNT = 3; // 最大错误次数

// 错误计数器
let errorCount = 0;
let lastErrorTime = 0;

/**
 * 显示用户通知
 * @param message 通知消息
 * @param type 通知类型
 * @param actions 可选的操作按钮
 */
function showUserNotification(message: string, type: 'info' | 'warning' | 'error' = 'info', actions?: Array<{text: string, action: () => void}>) {
  // 创建通知元素
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    max-width: 400px;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    color: white;
    background: ${type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
    transition: all 0.3s ease;
    transform: translateX(100%);
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <div style="flex: 1; margin-right: 12px;">${message}</div>
      <button style="
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      " onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // 添加操作按钮
  if (actions && actions.length > 0) {
    const actionsDiv = document.createElement('div');
    actionsDiv.style.cssText = 'margin-top: 12px; display: flex; gap: 8px;';
    
    actions.forEach(({ text, action }) => {
      const button = document.createElement('button');
      button.textContent = text;
      button.style.cssText = `
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.2s ease;
      `;
      button.onmouseover = () => button.style.background = 'rgba(255, 255, 255, 0.3)';
      button.onmouseout = () => button.style.background = 'rgba(255, 255, 255, 0.2)';
      button.onclick = () => {
        action();
        notification.remove();
      };
      actionsDiv.appendChild(button);
    });
    
    notification.appendChild(actionsDiv);
  }
  
  document.body.appendChild(notification);
  
  // 动画显示
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  // 自动隐藏（除非是错误类型）
  if (type !== 'error') {
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 3000);
    }, 50000);
  }
}

/**
 * 检查应用版本更新
 */
async function checkForUpdates(): Promise<boolean> {
  try {
    const response = await fetch('/api/version', {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Version check failed: ${response.status}`);
    }
    
    const currentVersionData = await response.json();
    const currentVersion = currentVersionData.version;
    
    // 获取本地存储的版本信息
    const storedVersion = localStorage.getItem('app-version');
    
    if (storedVersion && storedVersion !== currentVersion) {
      console.log(`Version update detected: ${storedVersion} -> ${currentVersion}`);
      
      // 显示更新通知
      showUserNotification(
        `发现新版本 ${currentVersion}，建议刷新页面获取最新功能。`,
        'info',
        [
          {
            text: '立即刷新',
            action: () => {
              localStorage.setItem('app-version', currentVersion);
              window.location.reload();
            }
          },
          {
            text: '稍后提醒',
            action: () => {
              // 10分钟后再次提醒
              setTimeout(() => checkForUpdates(), 10 * 60 * 1000);
            }
          }
        ]
      );
      
      return true;
    } else if (!storedVersion) {
      // 首次访问，存储版本信息
      localStorage.setItem('app-version', currentVersion);
    }
    
    return false;
  } catch (error) {
    console.error('Version check failed:', error);
    
    // 增加错误计数
    errorCount++;
    lastErrorTime = Date.now();
    
    if (errorCount >= MAX_ERROR_COUNT) {
      showUserNotification(
        '版本检查失败，可能影响应用更新。请检查网络连接。',
        'warning',
        [
          {
            text: '重试',
            action: () => {
              errorCount = 0;
              checkForUpdates();
            }
          }
        ]
      );
    }
    
    return false;
  }
}

/**
 * 处理Service Worker消息
 */
function handleServiceWorkerMessage(event: MessageEvent) {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SW_UPDATED':
      console.log('Service Worker updated to version:', data?.version);
      showUserNotification(
        'Service Worker已更新，应用性能得到提升。',
        'info'
      );
      break;
      
    case 'VERSION_UPDATE':
      console.log('Version update detected by SW:', data);
      showUserNotification(
        `检测到新版本，正在准备更新...`,
        'info'
      );
      // 稍微延迟后重新加载，让用户看到通知
      setTimeout(() => window.location.reload(), 2000);
      break;
      
    case 'RESOURCE_ERROR':
      console.error('Resource loading failed:', data);
      
      // 如果是关键资源失败，提供恢复选项
      if (data?.url?.includes('.js') || data?.url?.includes('.css')) {
        showUserNotification(
          '部分资源加载失败，可能是网络问题或版本更新导致。',
          'error',
          [
            {
              text: '刷新页面',
              action: () => window.location.reload()
            },
            {
              text: '清除缓存',
              action: () => clearCachesAndServiceWorkers()
            }
          ]
        );
      }
      break;
      
    case 'NETWORK_ERROR':
      console.warn('Network error detected:', data);
      if (errorCount < MAX_ERROR_COUNT) {
        showUserNotification(
          '网络连接不稳定，正在尝试恢复...',
          'warning'
        );
      }
      break;
      
    case 'FORCE_RELOAD':
      console.log('Force reload requested by SW');
      window.location.reload();
      break;
  }
}

/**
 * 注册Service Worker（增强版）
 * 
 * 开发模式：
 * - 自动清理已有的 Service Worker
 * - 跳过新的 Service Worker 注册
 * 
 * 生产模式：
 * - 注册 Service Worker 并传递环境参数
 * - 启用版本检测和自动更新
 */
export async function register() {
  // 开发模式处理
  if (isDevelopment) {
    console.log('[SW Dev] 检测到开发模式');
    
    // 自动清理已有的 Service Worker
    try {
      const cleanup = await detectAndCleanupSW();
      if (cleanup.unregistered > 0 || cleanup.cachesCleared > 0) {
        console.log('[SW Dev] 清理完成，开发环境已准备就绪');
      }
    } catch (error) {
      console.error('[SW Dev] 清理失败:', error);
    }
    
    console.log('[SW Dev] Service Worker 注册已跳过，支持热重载');
    return;
  }

  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        // 生产模式：注册时附加环境参数
        const env = process.env.NODE_ENV || 'production';
        const swUrl = `/serviceWorker.js?__env=${env}&v=${Date.now()}`;
        
        console.log('[SW] 正在注册 Service Worker...');
        
        // 注册Service Worker
        const registration = await navigator.serviceWorker.register(swUrl);
        console.log('[SW] Service Worker 注册成功:', registration.scope);
        
        // 监听Service Worker更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 新的Service Worker已安装，但旧的仍在运行
                showUserNotification(
                  '应用已更新，刷新页面即可使用新功能。',
                  'info',
                  [
                    {
                      text: '立即刷新',
                      action: () => window.location.reload()
                    }
                  ]
                );
              }
            });
          }
        });
        
        // 监听Service Worker消息
        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        
        // 定期检查版本更新
        setInterval(checkForUpdates, VERSION_CHECK_INTERVAL);
        
        // 初始版本检查
        setTimeout(checkForUpdates, 1000);
        
        // 监听网络状态变化
        window.addEventListener('online', () => {
          console.log('Network back online, checking for updates...');
          checkForUpdates();
          errorCount = 0; // 重置错误计数
        });
        
        window.addEventListener('offline', () => {
          console.log('Network offline detected');
          showUserNotification(
            '网络连接中断，应用将尝试使用缓存内容。',
            'warning'
          );
        });
        
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
        
        showUserNotification(
          'Service Worker注册失败，离线功能可能不可用。',
          'error',
          [
            {
              text: '重试',
              action: () => register()
            }
          ]
        );
      }
    });
  }
}

/**
 * 注销所有Service Worker
 */
export function unregister() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length > 0) {
        console.log(`Found ${registrations.length} service worker(s) to unregister`);

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
 * 清除所有缓存和Service Worker（增强版）
 */
export function clearCachesAndServiceWorkers() {
  if (typeof window === 'undefined') return Promise.resolve();

  return new Promise<void>((resolve) => {
    // 显示清理进度通知
    const notification = showUserNotification('正在清理应用缓存...', 'info');
    
    // 注销Service Worker
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
        // 清理缓存
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
        // 清理本地存储的版本信息
        localStorage.removeItem('app-version');
        
        console.log('All service workers and caches cleared');
        
        // 显示完成通知
        showUserNotification(
          '缓存清理完成，页面将在3秒后自动刷新。',
          'info'
        );
        
        // 延迟刷新页面
        setTimeout(() => {
          window.location.reload();
        }, 3000);
        
        resolve();
      }).catch(error => {
        console.error('Error clearing service workers and caches:', error);
        showUserNotification(
          '缓存清理失败，请手动刷新页面。',
          'error',
          [
            {
              text: '刷新页面',
              action: () => window.location.reload()
            }
          ]
        );
        resolve();
      });
    } else {
      resolve();
    }
  });
}

/**
 * 手动检查版本更新
 */
export function checkVersion(): Promise<boolean> {
  return checkForUpdates();
}

/**
 * 向Service Worker发送消息
 */
export function sendMessageToSW(type: string, data?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!navigator.serviceWorker?.controller) {
      reject(new Error('No active service worker'));
      return;
    }
    
    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
      resolve(event.data);
    };
    
    navigator.serviceWorker.controller.postMessage(
      { type, data },
      [channel.port2]
    );
    
    // 5秒超时
    setTimeout(() => {
      reject(new Error('Service worker message timeout'));
    }, 5000);
  });
}

// 保持向后兼容
export const clearAllServiceWorkers = clearCachesAndServiceWorkers;

// 全局工具函数
if (typeof window !== 'undefined') {
  (window as any).clearAllServiceWorkers = clearAllServiceWorkers;
  (window as any).checkAppVersion = checkVersion;
  (window as any).sendMessageToSW = sendMessageToSW;
  
  console.log('Enhanced service worker utilities loaded.');
  console.log('Available commands:');
  console.log('- clearAllServiceWorkers() - 清理所有缓存和Service Worker');
  console.log('- checkAppVersion() - 手动检查版本更新');
  console.log('- sendMessageToSW(type, data) - 向Service Worker发送消息');
}
