# Service Worker 自检机制 - 解决版本更新缓存问题

## 🚀 核心功能

解决了版本更新时Service Worker加载旧页面的常见问题，实现了：

- ✅ **智能版本检测** - 自动检测应用更新
- ✅ **资源失败恢复** - 加载失败时主动更新
- ✅ **用户友好通知** - 优雅的更新提醒
- ✅ **一键版本管理** - 自动更新所有相关文件

## 📁 主要文件

```
📦 增强的Service Worker系统
├── public/serviceWorker.js          # 智能Service Worker
├── public/offline.html              # 离线页面
├── app/api/version/route.ts         # 版本检查API
├── app/utils/serviceWorker/         # Service Worker管理
├── app/components/UpdateNotification.tsx # 更新通知UI
├── scripts/update-version.js        # 版本更新脚本
└── docs/SERVICE_WORKER_GUIDE.md     # 详细使用指南
```

## 🛠️ 快速开始

### 1. 在应用中添加更新通知

```tsx
// app/layout.tsx 或主应用组件
import UpdateNotification from './components/UpdateNotification';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <UpdateNotification />
      </body>
    </html>
  );
}
```

### 2. 版本更新流程

```bash
# 一键更新版本（自动更新所有相关文件）
node scripts/update-version.js 2.1.0

# 构建和部署
npm run build
npm run deploy
```

### 3. 浏览器调试命令

```javascript
// 控制台可用命令
checkAppVersion()           // 手动检查版本
clearAllServiceWorkers()    // 清理所有缓存
sendMessageToSW(type, data) // 与SW通信
```

## 🔧 工作原理

### 版本检测流程
1. **页面加载** → 注册Service Worker
2. **定期检查** → 每5分钟检查版本API
3. **发现更新** → 显示用户友好的通知
4. **用户确认** → 清理缓存并刷新页面

### 资源失败恢复
1. **网络请求失败** → 自动重试（最多3次）
2. **关键资源失败** → 通知用户并提供恢复选项
3. **API请求失败** → 使用缓存数据作为降级方案

### 智能缓存策略
- **API请求**: 网络优先，缓存降级
- **静态资源**: 缓存优先，网络更新
- **版本控制**: 自动清理旧版本缓存

## 🎯 解决的问题

### 传统问题
- ❌ 版本更新后仍显示旧页面
- ❌ 用户需要手动强制刷新
- ❌ 资源加载失败无自动恢复
- ❌ 缓存清理不彻底

### 现在的解决方案
- ✅ 自动检测版本更新
- ✅ 智能的用户更新提醒
- ✅ 资源失败自动重试和恢复
- ✅ 完整的缓存生命周期管理

## 🔍 监控和调试

### 开发者工具检查
1. **Application > Service Workers** - 查看SW状态
2. **Application > Storage** - 检查缓存内容  
3. **Network** - 监控请求和缓存命中
4. **Console** - 查看版本检测日志

### 常见问题排查
- **SW未注册**: 检查HTTPS环境
- **版本检测失败**: 确认`/api/version`可访问
- **缓存未清理**: 执行`clearAllServiceWorkers()`

## 📊 性能特点

- **非阻塞更新**: 不影响用户当前操作
- **智能重试**: 避免不必要的网络请求
- **渐进增强**: 不支持SW的浏览器正常工作
- **离线支持**: 网络中断时提供基本功能

## 🚀 高级配置

### 自定义检查间隔
```typescript
// swRegistration.ts
const VERSION_CHECK_INTERVAL = 10 * 60 * 1000; // 10分钟
```

### 自定义重试策略
```javascript
// serviceWorker.js
const MAX_RETRY_COUNT = 5;
const RETRY_DELAY = 2000;
```

## 📝 部署清单

- [ ] 更新版本号 (`node scripts/update-version.js x.y.z`)
- [ ] 测试版本检测API
- [ ] 构建应用 (`npm run build`)
- [ ] 验证Service Worker注册
- [ ] 部署到生产环境
- [ ] 确认版本更新通知正常工作

---

💡 **提示**: 查看 `docs/SERVICE_WORKER_GUIDE.md` 获取完整的技术文档和高级用法。 