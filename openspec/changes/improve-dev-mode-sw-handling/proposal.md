# Change: 改进开发模式下的 Service Worker 处理

## Why

在开发阶段，Service Worker 的缓存机制会导致以下问题：
1. 拦截网络请求并返回缓存内容，导致代码修改无法立即生效
2. Next.js 的热模块替换（HMR）被缓存策略干扰，无法实时更新
3. 即使代码中有开发模式检测，已注册的 Service Worker 仍会在后台运行
4. 开发者需要手动清理 Service Worker 和缓存，降低开发效率

这直接影响了开发体验，开发者必须频繁刷新页面或手动清理缓存才能看到代码变更。

## What Changes

1. **增强开发模式检测**：在 Service Worker 脚本本身添加环境检测
2. **启动时自动清理**：开发模式下启动时自动注销已有的 Service Worker
3. **添加开发工具**：提供开发者友好的调试命令
4. **改进注册逻辑**：优化 swRegistration.ts 中的开发模式处理
5. **添加环境标识**：通过 URL 参数或 header 让 Service Worker 识别环境

## Impact

### 受影响的文件
- `app/utils/serviceWorker/swRegistration.ts` - 注册逻辑增强
- `public/serviceWorker.js` - 添加环境检测
- `next.config.mjs` - 可能需要配置环境变量传递
- `package.json` - 添加开发工具脚本
- 新增：`app/utils/serviceWorker/devTools.ts` - 开发辅助工具

### 受影响的用户场景
- **开发者**：可以正常使用热重载，无需手动清理缓存
- **生产环境**：不受影响，Service Worker 正常工作
- **从生产切换到开发**：自动清理旧的 Service Worker

### 破坏性变更
- 无破坏性变更，仅增强开发体验

## Benefits

1. **提升开发效率**：代码修改立即生效，无需手动清理
2. **减少困惑**：新开发者不会被缓存问题困扰
3. **保持生产优势**：生产环境仍享受 Service Worker 带来的离线能力
4. **更好的工具**：提供清晰的调试和管理命令

