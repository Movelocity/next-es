/**
 * Service Worker Development Tools
 * 
 * 为开发模式提供 Service Worker 管理和调试工具
 * 确保开发环境不受缓存干扰，支持热重载
 */

/**
 * 可靠的开发环境检测
 * 
 * 使用多层检测确保准确判断开发环境：
 * 1. NODE_ENV 环境变量（构建时替换）
 * 2. hostname 检测（localhost/127.0.0.1）
 * 3. 端口号检测（开发端口 3999）
 * 
 * @returns {boolean} 是否为开发环境
 */
export function isDevelopmentMode(): boolean {
  // 1. 优先使用 Next.js 环境变量（最可靠）
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // 2. 检查 hostname（防御性检测）
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
      return true;
    }
    
    // 3. 检查开发端口（额外保险）
    const port = window.location.port;
    if (port === '3999') { // 项目开发端口
      return true;
    }
  }
  
  return false;
}

/**
 * 检测并清理开发环境中的 Service Worker
 * 
 * 在开发模式启动时调用，自动清理所有已注册的 Service Worker 和缓存，
 * 确保不干扰热重载和代码更新。
 * 
 * @returns {Promise<{unregistered: number, cachesCleared: number}>} 清理统计信息
 */
export async function detectAndCleanupSW(): Promise<{
  unregistered: number;
  cachesCleared: number;
}> {
  // 只在浏览器环境执行
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return { unregistered: 0, cachesCleared: 0 };
  }
  
  // 只在开发模式执行
  if (!isDevelopmentMode()) {
    return { unregistered: 0, cachesCleared: 0 };
  }
  
  console.log('[SW Dev] 检测开发环境，开始清理 Service Worker...');
  
  let unregistered = 0;
  let cachesCleared = 0;
  
  try {
    // 1. 注销所有 Service Worker
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    if (registrations.length > 0) {
      console.log(`[SW Dev] 发现 ${registrations.length} 个已注册的 Service Worker`);
      
      for (const registration of registrations) {
        try {
          const success = await registration.unregister();
          if (success) {
            unregistered++;
            console.log(`[SW Dev] 已注销 Service Worker: ${registration.scope}`);
          }
        } catch (error) {
          console.warn('[SW Dev] 注销 Service Worker 失败:', error);
        }
      }
    } else {
      console.log('[SW Dev] 没有发现已注册的 Service Worker');
    }
    
    // 2. 清除所有缓存
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      
      if (cacheNames.length > 0) {
        console.log(`[SW Dev] 发现 ${cacheNames.length} 个缓存`);
        
        for (const cacheName of cacheNames) {
          try {
            const success = await caches.delete(cacheName);
            if (success) {
              cachesCleared++;
              console.log(`[SW Dev] 已清除缓存: ${cacheName}`);
            }
          } catch (error) {
            console.warn(`[SW Dev] 清除缓存失败 (${cacheName}):`, error);
          }
        }
      } else {
        console.log('[SW Dev] 没有发现缓存');
      }
    }
    
    // 3. 清理本地存储的版本信息
    try {
      localStorage.removeItem('app-version');
      console.log('[SW Dev] 已清除版本信息');
    } catch (error) {
      console.warn('[SW Dev] 清除版本信息失败:', error);
    }
    
    // 输出总结
    if (unregistered > 0 || cachesCleared > 0) {
      console.log(
        `[SW Dev] ✅ 清理完成: 注销 ${unregistered} 个 SW, 清除 ${cachesCleared} 个缓存`
      );
    } else {
      console.log('[SW Dev] ✅ 环境已干净，无需清理');
    }
    
    return { unregistered, cachesCleared };
    
  } catch (error) {
    console.error('[SW Dev] 清理过程发生错误:', error);
    return { unregistered, cachesCleared };
  }
}

/**
 * 手动清理所有 Service Worker 和缓存
 * 
 * 可在任何环境下调用（不检查开发模式），用于 troubleshooting。
 * 建议通过控制台调用: window.clearAllServiceWorkers()
 * 
 * @returns {Promise<void>}
 */
export async function clearAllServiceWorkers(): Promise<void> {
  if (typeof window === 'undefined') {
    console.warn('[SW] 只能在浏览器环境中清理 Service Worker');
    return;
  }
  
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW] 当前浏览器不支持 Service Worker');
    return;
  }
  
  console.log('[SW] 开始手动清理 Service Worker 和缓存...');
  
  try {
    // 注销所有 Service Worker
    const registrations = await navigator.serviceWorker.getRegistrations();
    const unregisterPromises = registrations.map(reg => reg.unregister());
    await Promise.all(unregisterPromises);
    console.log(`[SW] 已注销 ${registrations.length} 个 Service Worker`);
    
    // 清除所有缓存
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const deletePromises = cacheNames.map(name => caches.delete(name));
      await Promise.all(deletePromises);
      console.log(`[SW] 已清除 ${cacheNames.length} 个缓存`);
    }
    
    // 清理版本信息
    localStorage.removeItem('app-version');
    
    console.log('[SW] ✅ 清理完成！建议刷新页面。');
    
    // 3秒后自动刷新
    setTimeout(() => {
      console.log('[SW] 正在刷新页面...');
      window.location.reload();
    }, 3000);
    
  } catch (error) {
    console.error('[SW] 清理失败:', error);
    console.log('[SW] 请尝试手动清理：');
    console.log('[SW] 1. 打开 Chrome DevTools > Application > Service Workers');
    console.log('[SW] 2. 点击 "Unregister" 按钮');
    console.log('[SW] 3. 在 Cache Storage 中手动删除缓存');
  }
}

/**
 * 获取 Service Worker 状态信息
 * 
 * 用于调试和监控，返回当前的 SW 注册信息
 * 
 * @returns {Promise<object>} Service Worker 状态
 */
export async function getServiceWorkerStatus(): Promise<{
  supported: boolean;
  isDevelopment: boolean;
  registrations: number;
  caches: number;
  controller: boolean;
}> {
  const status = {
    supported: 'serviceWorker' in navigator,
    isDevelopment: isDevelopmentMode(),
    registrations: 0,
    caches: 0,
    controller: false,
  };
  
  if (!status.supported || typeof window === 'undefined') {
    return status;
  }
  
  try {
    // 获取注册数量
    const registrations = await navigator.serviceWorker.getRegistrations();
    status.registrations = registrations.length;
    
    // 检查是否有活跃的 controller
    status.controller = !!navigator.serviceWorker.controller;
    
    // 获取缓存数量
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      status.caches = cacheNames.length;
    }
  } catch (error) {
    console.warn('[SW] 获取状态失败:', error);
  }
  
  return status;
}

// 在浏览器环境下挂载全局调试命令
if (typeof window !== 'undefined') {
  (window as any).clearAllServiceWorkers = clearAllServiceWorkers;
  (window as any).getServiceWorkerStatus = getServiceWorkerStatus;
  (window as any).isDevelopmentMode = isDevelopmentMode;
  
  // 输出可用命令
  if (isDevelopmentMode()) {
    console.log('[SW Dev] 开发工具已加载，可用命令：');
    console.log('[SW Dev] - clearAllServiceWorkers() - 清理所有 SW 和缓存');
    console.log('[SW Dev] - getServiceWorkerStatus() - 查看 SW 状态');
    console.log('[SW Dev] - isDevelopmentMode() - 检查是否为开发模式');
  }
}

