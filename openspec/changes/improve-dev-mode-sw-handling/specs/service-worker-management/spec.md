# Specification: Service Worker Management

## ADDED Requirements

### Requirement: Development Mode Detection

系统 SHALL 在多个层面检测应用运行环境，并在开发模式下禁用 Service Worker 功能。

#### Scenario: 开发模式下跳过 Service Worker 注册
- **GIVEN** 应用在开发模式下运行（NODE_ENV=development）
- **WHEN** 应用启动并尝试注册 Service Worker
- **THEN** 注册逻辑检测到开发环境并跳过注册
- **AND** 在控制台输出 "Service worker registration skipped in development mode" 日志

#### Scenario: Service Worker 脚本自检测开发环境
- **GIVEN** Service Worker 脚本被加载
- **WHEN** Service Worker 检测到 URL 参数 `__env=development`
- **THEN** Service Worker 立即调用 `self.registration.unregister()`
- **AND** 在控制台输出 "Development mode detected, skipping installation" 日志
- **AND** Service Worker 停止安装流程

#### Scenario: 生产模式下正常注册
- **GIVEN** 应用在生产模式下运行（NODE_ENV=production）
- **WHEN** 应用启动并尝试注册 Service Worker
- **THEN** Service Worker 成功注册
- **AND** Service Worker 按照缓存策略正常工作

### Requirement: Automatic Cleanup on Development Startup

系统 SHALL 在开发模式启动时自动检测并清理已注册的 Service Worker 和缓存。

#### Scenario: 启动时发现已注册的 Service Worker
- **GIVEN** 浏览器中存在已注册的 Service Worker
- **WHEN** 应用在开发模式下启动
- **THEN** 系统自动注销所有 Service Worker
- **AND** 清除所有应用相关的缓存
- **AND** 在控制台输出清理结果（如 "Unregistered 1 service worker(s)"）

#### Scenario: 启动时没有已注册的 Service Worker
- **GIVEN** 浏览器中没有已注册的 Service Worker
- **WHEN** 应用在开发模式下启动
- **THEN** 清理检测快速完成
- **AND** 在控制台输出 "No service workers to unregister" 日志
- **AND** 不执行任何注销操作

#### Scenario: 清理失败的错误处理
- **GIVEN** 应用尝试清理 Service Worker
- **WHEN** 注销过程中发生错误（如权限问题）
- **THEN** 错误被捕获并记录到控制台
- **AND** 应用继续正常启动，不中断开发流程
- **AND** 显示错误提示建议手动清理

### Requirement: Environment Information Propagation

系统 SHALL 通过 URL 参数将环境信息传递给 Service Worker 脚本。

#### Scenario: 注册时附加环境参数
- **GIVEN** 应用决定注册 Service Worker
- **WHEN** 调用 `navigator.serviceWorker.register()`
- **THEN** Service Worker URL 包含 `?__env=production` 或 `?__env=development` 参数
- **AND** 参数值与 `process.env.NODE_ENV` 一致

#### Scenario: Service Worker 读取环境参数
- **GIVEN** Service Worker 脚本开始执行
- **WHEN** 在 install 事件监听器中处理
- **THEN** 通过 `new URLSearchParams(self.location.search).get('__env')` 获取环境信息
- **AND** 环境信息可用于条件判断

### Requirement: Development Tools

系统 SHALL 提供开发者工具函数，用于管理和调试 Service Worker。

#### Scenario: 检测开发环境
- **GIVEN** 开发者调用 `isDevelopmentMode()` 函数
- **WHEN** 应用在 localhost 或 NODE_ENV=development 环境运行
- **THEN** 函数返回 `true`
- **AND** 使用多层检测确保可靠性

#### Scenario: 手动清理 Service Worker
- **GIVEN** 开发者在控制台调用 `window.clearAllServiceWorkers()`
- **WHEN** 函数执行
- **THEN** 所有注册的 Service Worker 被注销
- **AND** 所有缓存被清除
- **AND** 返回 Promise 在完成后 resolve

#### Scenario: 检测并自动清理
- **GIVEN** 开发者调用 `detectAndCleanupSW()` 函数
- **WHEN** 检测到开发环境且存在已注册的 Service Worker
- **THEN** 自动执行清理流程
- **AND** 返回清理统计信息（注销数量、清除缓存数量）

### Requirement: Clear Logging and Feedback

系统 SHALL 在 Service Worker 相关操作中提供清晰的日志输出。

#### Scenario: 开发模式日志输出
- **GIVEN** Service Worker 管理系统执行任何操作
- **WHEN** 在开发模式下运行
- **THEN** 所有日志使用统一前缀 "[SW Dev]" 或 "[SW]"
- **AND** 日志清楚说明执行的操作和原因
- **AND** 使用适当的日志级别（info, warn, error）

#### Scenario: 生产模式日志精简
- **GIVEN** Service Worker 在生产模式下运行
- **WHEN** 执行缓存或注册操作
- **THEN** 仅输出关键信息（注册成功、更新可用等）
- **AND** 调试信息不输出到生产环境控制台

### Requirement: Hot Reload Compatibility

系统 SHALL 确保开发模式下不干扰 Next.js 的热模块替换（HMR）功能。

#### Scenario: 代码修改后立即生效
- **GIVEN** 开发者在开发模式下修改源代码
- **WHEN** Next.js HMR 尝试更新模块
- **THEN** 更新请求不被 Service Worker 缓存拦截
- **AND** 修改的代码立即在浏览器中生效
- **AND** 不需要手动刷新页面

#### Scenario: 静态资源的实时更新
- **GIVEN** 开发者修改样式文件或图片
- **WHEN** 浏览器请求更新的资源
- **THEN** 请求直接到达开发服务器
- **AND** 新资源立即显示，不读取缓存
- **AND** 控制台没有缓存相关的 HMR 错误

### Requirement: Production Environment Integrity

系统 SHALL 确保生产环境的 Service Worker 功能完全不受开发模式改动影响。

#### Scenario: 生产构建的 Service Worker 正常工作
- **GIVEN** 应用使用 `next build` 构建生产版本
- **WHEN** 生产应用在浏览器中运行
- **THEN** Service Worker 成功注册并激活
- **AND** 缓存策略按预期工作
- **AND** 离线功能正常可用

#### Scenario: 版本更新检测机制不受影响
- **GIVEN** 生产环境中部署了新版本应用
- **WHEN** 用户访问应用且 Service Worker 检测到版本变化
- **THEN** 版本更新通知正常显示
- **AND** 用户可以选择刷新以使用新版本
- **AND** 缓存更新流程正常执行

