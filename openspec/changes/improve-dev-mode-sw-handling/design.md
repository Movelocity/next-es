# Design: 开发模式下的 Service Worker 处理

## Context

Service Worker 是为生产环境设计的离线缓存机制，但在开发环境中会干扰热重载和实时更新。当前实现虽然有开发模式检测，但不够彻底，已注册的 Service Worker 仍会在后台运行。

### 技术背景
- Next.js 开发服务器使用 HMR（热模块替换）来实现即时更新
- Service Worker 的缓存策略会拦截并缓存请求
- Service Worker 即使在页面关闭后也会持续存在
- 浏览器的 Service Worker 注册是跨会话持久化的

### 约束条件
- Next.js 的 `process.env.NODE_ENV` 在编译时被替换
- Service Worker 脚本运行在独立的 Worker 线程，无法直接访问 window 对象
- 必须保持生产环境的 Service Worker 功能完整

## Goals / Non-Goals

### Goals
- 开发模式下完全禁用 Service Worker 注册
- 自动清理开发模式下遗留的 Service Worker
- 提供开发者友好的调试工具
- 保持生产环境的功能不受影响
- 提供清晰的日志和状态提示

### Non-Goals
- 不在开发模式下提供任何缓存功能
- 不修改 Service Worker 的核心缓存策略
- 不创建复杂的开发/生产双模式 Service Worker

## Decisions

### Decision 1: 多层环境检测

**决定**：在三个层面进行环境检测
1. Service Worker 注册前（swRegistration.ts）
2. Service Worker 脚本内部（serviceWorker.js）
3. 应用启动时（devTools.ts）

**理由**：
- 单点检测不足以处理所有场景
- Service Worker 可能在之前的会话中注册
- 需要在多个入口点确保开发模式下不运行

**替代方案考虑**：
- 仅在注册前检测：不够可靠，已注册的 SW 仍会运行
- 使用不同的 SW 文件：增加维护成本，容易出错

### Decision 2: 通过 URL 参数传递环境信息

**决定**：注册 Service Worker 时添加 `?__env=development|production` 参数

**实现**：
```typescript
const swUrl = `/serviceWorker.js?__env=${process.env.NODE_ENV}`;
navigator.serviceWorker.register(swUrl);
```

**理由**：
- Service Worker 脚本可以通过 `self.location.search` 获取参数
- 不依赖外部配置或复杂的通信机制
- 简单可靠，易于调试

**替代方案考虑**：
- 通过 postMessage 通信：时序复杂，可能遗漏
- 使用不同的文件路径：需要构建时处理，增加复杂度

### Decision 3: 启动时主动清理

**决定**：在开发模式下，应用启动时执行以下步骤：
1. 检测当前环境
2. 查找所有已注册的 Service Worker
3. 注销所有 Service Worker
4. 清除所有缓存
5. 在控制台输出清理结果

**实现位置**：新建 `app/utils/serviceWorker/devTools.ts`

**理由**：
- 主动而非被动，确保开发环境干净
- 启动时执行，不影响运行时性能
- 给开发者明确的反馈

### Decision 4: Service Worker 内部自检

**决定**：在 serviceWorker.js 的 install 事件中添加环境检测

```javascript
self.addEventListener('install', (event) => {
  const params = new URLSearchParams(self.location.search);
  const env = params.get('__env');
  
  if (env === 'development') {
    console.log('[SW] Development mode detected, skipping installation');
    self.skipWaiting();
    self.registration.unregister();
    return;
  }
  
  // 正常的安装流程...
});
```

**理由**：
- 最后一道防线，即使其他检测失败也能阻止
- 在 SW 内部处理，不依赖主线程
- 立即注销，不等待激活

## Technical Architecture

### 文件结构
```
app/utils/serviceWorker/
├── swRegistration.ts     # 主要注册逻辑（修改）
├── devTools.ts           # 新增：开发工具
└── types.ts              # 类型定义（可选）

public/
└── serviceWorker.js      # SW 脚本（修改）
```

### 执行流程

#### 开发模式启动流程
```
1. 应用启动
   ↓
2. devTools.detectAndCleanupSW() 
   - 检测环境
   - 注销所有 SW
   - 清除缓存
   ↓
3. swRegistration.register()
   - 检测环境 → 跳过注册
   - 输出日志
   ↓
4. 开发正常进行，无 SW 干扰
```

#### 生产模式启动流程
```
1. 应用启动
   ↓
2. devTools（不执行或快速返回）
   ↓
3. swRegistration.register()
   - 注册 SW（带环境参数）
   ↓
4. serviceWorker.js
   - 检测环境 → production
   - 正常安装和激活
   ↓
5. 离线缓存正常工作
```

### 环境检测策略

**可靠性排序**（从高到低）：
1. `next.config.mjs` 中定义的环境变量
2. `process.env.NODE_ENV`（在构建时替换）
3. 检查 `location.hostname`（localhost 为开发）
4. 检查端口号（3999 为开发）

**实现**：
```typescript
export function isDevelopmentMode(): boolean {
  // 1. 优先使用 Next.js 环境变量
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // 2. 检查 hostname（防御性检测）
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }
  }
  
  return false;
}
```

## Risks / Trade-offs

### Risk 1: 环境检测失误

**风险**：误判环境导致生产模式下 SW 被禁用

**缓解措施**：
- 多层检测，只有明确为开发模式才禁用
- 生产构建时 `process.env.NODE_ENV` 固定为 'production'
- 添加详细日志，方便排查

### Risk 2: 清理过于激进

**风险**：错误清理用户想保留的 Service Worker

**缓解措施**：
- 只在明确的开发环境执行清理
- 清理前输出日志
- 只清理当前域名的 SW

### Risk 3: 兼容性问题

**风险**：旧浏览器不支持某些 API

**缓解措施**：
- 所有 SW 操作包裹在 feature detection 中
- 使用 try-catch 捕获异常
- 降级优雅，不影响核心功能

## Migration Plan

### 步骤 1: 准备阶段
- 创建 devTools.ts
- 更新 swRegistration.ts
- 修改 serviceWorker.js

### 步骤 2: 测试阶段
- 本地开发环境测试
- 生产构建测试
- 不同浏览器测试

### 步骤 3: 部署阶段
- 合并代码
- 发布新版本
- 监控问题反馈

### 回滚计划
如果出现问题：
1. 回滚到之前的注册逻辑
2. 手动清理用户浏览器的 SW（通过公告）
3. 重新评估方案

## Open Questions

1. **Q**: 是否需要在生产环境也提供手动清理 SW 的工具？
   **A**: 是的，作为 troubleshooting 的一部分，但需要用户明确触发

2. **Q**: 是否需要支持"开发模式但测试 SW"的场景？
   **A**: 可以通过环境变量 `FORCE_SW=true` 来支持，但默认禁用

3. **Q**: Service Worker 文件的缓存策略是否需要调整？
   **A**: 不在本次变更范围，保持现有策略

## Future Improvements

1. 添加 Service Worker 状态面板（可视化工具）
2. 支持开发模式下的"部分缓存"（仅缓存静态资源）
3. 集成到项目的 dev 工具栏中
4. 提供更细粒度的缓存控制

