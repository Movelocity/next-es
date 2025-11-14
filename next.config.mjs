import { codeInspectorPlugin } from 'code-inspector-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    config.plugins.push(codeInspectorPlugin({ bundler: 'webpack' }));
    
    // 开发模式下输出提示
    if (dev && !isServer) {
      console.log('[Next.js] 开发模式：Service Worker 已禁用');
    }
    
    return config;
  },
  
  // Service Worker 相关配置
  headers: async () => {
    return [
      {
        // 确保 Service Worker 文件使用正确的 MIME 类型
        source: '/serviceWorker.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
