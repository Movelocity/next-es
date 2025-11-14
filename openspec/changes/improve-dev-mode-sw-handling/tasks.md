# Implementation Tasks

## 1. Service Worker 环境检测增强 ✅
- [x] 1.1 在 serviceWorker.js 中添加环境检测逻辑
- [x] 1.2 开发模式下立即 unregister 自身
- [x] 1.3 通过 URL 参数传递环境信息（如 `?__env=development`）
- [x] 1.4 添加 console 提示，说明为何跳过注册

## 2. 注册逻辑改进 ✅
- [x] 2.1 增强 swRegistration.ts 的开发模式检测
- [x] 2.2 添加启动时自动清理功能
- [x] 2.3 检测到已有 Service Worker 时提供清理选项
- [x] 2.4 添加环境信息到 Service Worker 注册 URL

## 3. 开发工具创建 ✅
- [x] 3.1 创建 devTools.ts 模块
- [x] 3.2 实现 `detectAndCleanupSW()` 函数
- [x] 3.3 实现 `isDevelopmentMode()` 可靠检测函数
- [x] 3.4 添加全局调试命令（挂载到 window）

## 4. Next.js 配置更新 ✅
- [x] 4.1 在 next.config.mjs 中配置环境变量
- [x] 4.2 确保 NODE_ENV 正确传递到客户端
- [x] 4.3 配置 Service Worker 文件的正确处理

## 5. 文档和提示
- [ ] 5.1 添加开发模式说明到 README
- [ ] 5.2 在控制台输出清晰的状态信息
- [ ] 5.3 创建 troubleshooting 指南
- [ ] 5.4 更新 SERVICE_WORKER_GUIDE.md

## 6. 测试验证
- [ ] 6.1 测试开发模式下不注册 Service Worker
- [ ] 6.2 测试从生产模式切换到开发模式的自动清理
- [ ] 6.3 测试生产构建的 Service Worker 正常工作
- [ ] 6.4 测试热重载功能正常
- [ ] 6.5 测试清理工具函数的有效性

## 7. 优化和收尾
- [ ] 7.1 确保所有 console 输出都有明确的前缀
- [ ] 7.2 检查是否有遗漏的边缘情况
- [ ] 7.3 代码审查和 linting
- [ ] 7.4 更新 CHANGELOG.md

