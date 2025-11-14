# 改进开发模式下的 Service Worker 处理

## 📋 变更概览

**变更 ID**: `improve-dev-mode-sw-handling`  
**状态**: 提案阶段（待审批）  
**影响范围**: Service Worker 管理系统

## 🎯 问题描述

在开发阶段，Service Worker 的缓存机制干扰了 Next.js 的热模块替换（HMR），导致：
- 代码修改无法立即生效
- 开发者需要频繁手动清理缓存
- 即使跳过注册，已有的 SW 仍在后台运行

## 💡 解决方案

### 三层防护策略
1. **注册前检测** - 在 `swRegistration.ts` 中检测开发环境并跳过注册
2. **启动时清理** - 开发模式启动时自动注销已有的 Service Worker
3. **SW 自检测** - Service Worker 脚本内部检测环境并拒绝安装

### 关键技术点
- **环境传递**: 通过 URL 参数 `?__env=development|production` 传递环境信息
- **主动清理**: 新增 `devTools.ts` 模块提供清理工具
- **多层检测**: 使用 `NODE_ENV`、hostname、端口等多重检测确保可靠性

## 📁 文件结构

```
openspec/changes/improve-dev-mode-sw-handling/
├── README.md                                    # 本文档
├── proposal.md                                   # 变更提案
├── tasks.md                                      # 实施任务清单
├── design.md                                     # 技术设计文档
└── specs/
    └── service-worker-management/
        └── spec.md                              # 需求规范
```

## ✅ 验证状态

已通过 OpenSpec 严格验证：
```bash
openspec validate improve-dev-mode-sw-handling --strict
# ✓ Change 'improve-dev-mode-sw-handling' is valid
```

## 📊 主要需求（7个）

1. **Development Mode Detection** - 多层环境检测
2. **Automatic Cleanup on Development Startup** - 启动时自动清理
3. **Environment Information Propagation** - 环境信息传递
4. **Development Tools** - 开发工具函数
5. **Clear Logging and Feedback** - 清晰的日志反馈
6. **Hot Reload Compatibility** - 热重载兼容性
7. **Production Environment Integrity** - 生产环境完整性

每个需求都包含详细的场景（Scenarios）定义，共 17 个场景覆盖。

## 🛠️ 实施任务（7个阶段，28个任务）

1. Service Worker 环境检测增强 (4 tasks)
2. 注册逻辑改进 (4 tasks)
3. 开发工具创建 (4 tasks)
4. Next.js 配置更新 (3 tasks)
5. 文档和提示 (4 tasks)
6. 测试验证 (5 tasks)
7. 优化和收尾 (4 tasks)

详见 [`tasks.md`](./tasks.md)

## 🎨 技术架构

### 执行流程（开发模式）
```
应用启动
  ↓
devTools.detectAndCleanupSW()
  - 检测环境
  - 注销所有 SW
  - 清除缓存
  ↓
swRegistration.register()
  - 检测环境 → 跳过注册
  ↓
开发正常进行（无 SW 干扰）
```

### 修改的文件
- ✏️ `app/utils/serviceWorker/swRegistration.ts` - 增强注册逻辑
- ✏️ `public/serviceWorker.js` - 添加环境自检
- ✏️ `next.config.mjs` - 环境变量配置
- ➕ `app/utils/serviceWorker/devTools.ts` - 新增开发工具

## 🚀 下一步

### 开发者行动
1. **审查提案**: 阅读 `proposal.md` 和 `design.md`
2. **讨论改进**: 提出疑问或建议
3. **批准实施**: 确认无异议后开始实施

### 实施步骤
1. 按照 `tasks.md` 的顺序执行任务
2. 每完成一个阶段进行测试验证
3. 更新 `tasks.md` 中的任务状态
4. 完成后运行完整测试套件

## 📖 相关文档

- [OpenSpec AGENTS.md](../../AGENTS.md) - OpenSpec 使用指南
- [项目约定](../../project.md) - ES Viewer 项目规范
- [变更提案](./proposal.md) - 完整的变更说明
- [技术设计](./design.md) - 详细的技术决策
- [需求规范](./specs/service-worker-management/spec.md) - 详细需求和场景

## ❓ 常见问题

### Q: 这会影响生产环境吗？
**A**: 不会。所有改动都只在开发环境生效，生产环境的 Service Worker 功能完全不变。

### Q: 如果需要在开发环境测试 Service Worker 怎么办？
**A**: 可以通过环境变量 `FORCE_SW=true` 来强制启用（功能待实现）。

### Q: 已有的 Service Worker 会被自动清理吗？
**A**: 是的。在开发模式下首次启动时会自动清理所有已注册的 Service Worker。

### Q: 如何手动清理 Service Worker？
**A**: 在浏览器控制台调用 `clearAllServiceWorkers()` 即可（实施后可用）。

## 📝 更新日志

- **2024-11-14**: 初始提案创建并通过验证

---

**维护者**: AI Assistant  
**最后更新**: 2024-11-14  
**OpenSpec 版本**: 符合规范要求

