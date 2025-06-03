// 版本信息 - 每次更新时需要修改这个版本号
const CACHE_VERSION = 'v2.0.1';
const CACHE_NAME = `es-viewer-cache-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `es-viewer-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `es-viewer-dynamic-${CACHE_VERSION}`;

// 需要缓存的静态资源
const urlsToCache = [
  '/',
  '/offline.html', // 离线页面（需要创建）
];

// 版本检测相关
const VERSION_CHECK_INTERVAL = 30 * 60 * 1000; // 30分钟检查一次
let lastVersionCheck = 0;

// 失败重试配置
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 1000; // 1秒

/**
 * 检查应用版本是否更新
 */
async function checkForUpdates() {
  try {
    const response = await fetch('/api/version', { 
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const currentVersion = data.version;
      
      // 获取存储的版本信息
      const storedVersion = await self.caches.open(CACHE_NAME)
        .then(cache => cache.match('/version'))
        .then(response => response ? response.json() : null);
      
      if (storedVersion && storedVersion.version !== currentVersion) {
        console.log(`Version update detected: ${storedVersion.version} -> ${currentVersion}`);
        // 通知主线程有新版本
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'VERSION_UPDATE',
              oldVersion: storedVersion.version,
              newVersion: currentVersion
            });
          });
        });
        
        // 清理旧缓存并触发更新
        await clearOldCaches();
        return true;
      }
    }
  } catch (error) {
    console.error('Version check failed:', error);
  }
  return false;
}

/**
 * 清理旧版本的缓存
 */
async function clearOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name.startsWith('es-viewer-') && name !== CACHE_NAME && 
    name !== STATIC_CACHE_NAME && name !== DYNAMIC_CACHE_NAME
  );
  
  await Promise.all(oldCaches.map(cacheName => {
    console.log('Deleting old cache:', cacheName);
    return caches.delete(cacheName);
  }));
}

/**
 * 带重试的网络请求
 */
async function fetchWithRetry(request, retryCount = 0) {
  try {
    const response = await fetch(request.clone());
    
    // 检查响应状态
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.warn(`Fetch failed (attempt ${retryCount + 1}):`, error.message);
    
    if (retryCount < MAX_RETRY_COUNT) {
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
      return fetchWithRetry(request, retryCount + 1);
    }
    
    throw error;
  }
}

/**
 * 智能缓存策略
 */
async function handleFetch(event) {
  const request = event.request;
  const url = new URL(request.url);
  
  // 跳过非HTTP请求
  if (request.url.startsWith('chrome-extension://') || 
      request.url.startsWith('moz-extension://') ||
      !request.url.startsWith('http')) {
    return fetch(request);
  }
  
  // API请求使用网络优先策略
  if (url.pathname.startsWith('/api/')) {
    try {
      const response = await fetchWithRetry(request);
      
      // 缓存成功的API响应
      if (response.ok && request.method === 'GET') {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        cache.put(request, response.clone());
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      
      // 尝试从缓存获取
      const cached = await caches.match(request);
      if (cached) {
        console.log('Serving stale API response from cache');
        return cached;
      }
      
      // 如果是版本检查失败，通知主线程
      if (url.pathname === '/api/version') {
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'NETWORK_ERROR',
              message: 'Version check failed'
            });
          });
        });
      }
      
      throw error;
    }
  }
  
  // 静态资源使用缓存优先策略
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetchWithRetry(request);
    
    // 缓存静态资源
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Static resource fetch failed:', error);
    
    // 对于页面请求，返回离线页面
    if (request.destination === 'document') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    // 通知主线程资源加载失败
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'RESOURCE_ERROR',
          url: request.url,
          error: error.message
        });
      });
    });
    
    throw error;
  }
}

// Service Worker 安装
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    (async () => {
      // 创建缓存并添加基本资源
      const cache = await caches.open(STATIC_CACHE_NAME);
      await cache.addAll(urlsToCache);
      
      // 存储版本信息
      await cache.put('/version', new Response(JSON.stringify({
        version: CACHE_VERSION,
        timestamp: Date.now()
      }), {
        headers: { 'Content-Type': 'application/json' }
      }));
      
      console.log('Service Worker installed successfully');
      
      // 跳过等待，立即激活
      self.skipWaiting();
    })()
  );
});

// Service Worker 激活
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    (async () => {
      // 清理旧缓存
      await clearOldCaches();
      
      // 立即控制所有客户端
      await self.clients.claim();
      
      console.log('Service Worker activated successfully');
      
      // 通知所有客户端Service Worker已更新
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_UPDATED',
          version: CACHE_VERSION
        });
      });
    })()
  );
});

// 处理网络请求
self.addEventListener('fetch', (event) => {
  event.respondWith(handleFetch(event));
});

// 处理主线程消息
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'CHECK_VERSION':
      checkForUpdates().then(hasUpdate => {
        event.ports[0].postMessage({ hasUpdate });
      });
      break;
      
    case 'FORCE_UPDATE':
      clearOldCaches().then(() => {
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'FORCE_RELOAD' });
          });
        });
      });
      break;
      
    case 'CLEAR_CACHE':
      caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
  }
});

// 定期检查版本更新
setInterval(() => {
  const now = Date.now();
  if (now - lastVersionCheck > VERSION_CHECK_INTERVAL) {
    lastVersionCheck = now;
    checkForUpdates();
  }
}, VERSION_CHECK_INTERVAL);

console.log(`Service Worker loaded - Version: ${CACHE_VERSION}`); 