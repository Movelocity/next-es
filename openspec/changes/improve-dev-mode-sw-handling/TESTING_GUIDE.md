# 测试指南

本文档提供详细的测试步骤，用于验证开发模式下 Service Worker 处理改进。

## 测试环境准备

### 必需工具
- Chrome/Edge 浏览器（推荐使用 Chrome）
- Chrome DevTools
- Node.js 18+ 
- 项目源代码

### 测试前检查
```bash
# 确认当前分支
git branch

# 确认文件已更新
git status

# 确认依赖已安装
yarn install
```

## 测试场景

### 场景 1: 开发模式 - 全新启动（无已有 SW）

**目标**: 验证开发环境启动时不注册 Service Worker

**步骤**:

1. **清理浏览器状态**
   ```
   Chrome DevTools > Application > Clear Storage
   勾选所有选项 > Clear site data
   ```

2. **启动开发服务器**
   ```bash
   yarn dev
   ```

3. **打开应用**
   ```
   http://localhost:3999
   ```

4. **检查控制台输出**

**预期结果** ✅:
```
[Next.js] 开发模式：Service Worker 已禁用
[SW Dev] 检测到开发模式
[SW Dev] 没有发现已注册的 Service Worker
[SW Dev] 没有发现缓存
[SW Dev] ✅ 环境已干净，无需清理
[SW Dev] Service Worker 注册已跳过，支持热重载
[SW Dev] 开发工具已加载，可用命令：
[SW Dev] - clearAllServiceWorkers() - 清理所有 SW 和缓存
[SW Dev] - getServiceWorkerStatus() - 查看 SW 状态
[SW Dev] - isDevelopmentMode() - 检查是否为开发模式
```

5. **验证 SW 状态**
   ```javascript
   // 在控制台执行
   window.getServiceWorkerStatus()
   ```

**预期输出** ✅:
```javascript
{
  supported: true,
  isDevelopment: true,
  registrations: 0,      // 无注册
  caches: 0,             // 无缓存
  controller: false      // 无活跃 controller
}
```

6. **验证 Chrome DevTools**
   ```
   Chrome DevTools > Application > Service Workers
   ```

**预期结果** ✅: 显示 "No service workers registered"

---

### 场景 2: 开发模式 - 有已注册的 SW

**目标**: 验证自动清理功能

**步骤**:

1. **模拟已有 SW（先运行生产构建）**
   ```bash
   yarn build
   yarn start
   ```
   
2. **访问应用并确认 SW 已注册**
   ```
   http://localhost:3999
   ```
   
   检查 DevTools > Application > Service Workers
   应该看到已注册的 SW

3. **停止生产服务器，启动开发服务器**
   ```bash
   # Ctrl+C 停止 start
   yarn dev
   ```

4. **刷新页面并检查控制台**

**预期结果** ✅:
```
[SW Dev] 检测到开发模式
[SW Dev] 发现 1 个已注册的 Service Worker
[SW Dev] 已注销 Service Worker: http://localhost:3999/
[SW Dev] 发现 X 个缓存
[SW Dev] 已清除缓存: es-viewer-cache-v2.0.1
[SW Dev] 已清除缓存: es-viewer-static-v2.0.1
[SW Dev] 已清除版本信息
[SW Dev] ✅ 清理完成: 注销 1 个 SW, 清除 X 个缓存
[SW Dev] Service Worker 注册已跳过，支持热重载
```

5. **再次检查状态**
   ```javascript
   window.getServiceWorkerStatus()
   ```

**预期输出** ✅:
```javascript
{
  supported: true,
  isDevelopment: true,
  registrations: 0,      // 已清理
  caches: 0,             // 已清理
  controller: false
}
```

---

### 场景 3: 热重载功能测试

**目标**: 验证代码修改能立即生效

**步骤**:

1. **在开发模式下运行应用**
   ```bash
   yarn dev
   ```

2. **修改源代码**
   
   编辑任意组件文件，例如：
   ```typescript
   // app/page.tsx
   export default function Home() {
     return <div>测试热重载 - {new Date().toLocaleTimeString()}</div>
   }
   ```

3. **保存文件**

4. **观察浏览器**

**预期结果** ✅:
- 页面自动刷新或模块热替换
- 修改立即可见
- 控制台无 Service Worker 相关错误
- 无需手动刷新

5. **检查网络请求**
   ```
   Chrome DevTools > Network
   勾选 "Disable cache"
   ```

**预期结果** ✅:
- 所有请求直接到达开发服务器
- 无 "(from ServiceWorker)" 标记
- 静态资源实时更新

---

### 场景 4: 生产构建测试

**目标**: 验证生产环境 SW 功能正常

**步骤**:

1. **构建生产版本**
   ```bash
   yarn build
   ```

2. **启动生产服务器**
   ```bash
   yarn start
   ```

3. **访问应用**
   ```
   http://localhost:3999
   ```

4. **检查控制台输出**

**预期结果** ✅:
```
[SW] 正在注册 Service Worker...
[SW] Service Worker 注册成功: http://localhost:3999/
[SW] Service Worker installing...
[SW] 环境检测通过，继续安装 (env: production)
[SW] Service Worker 安装成功
[SW] Service Worker activating...
[SW] Service Worker 激活成功
```

5. **检查 DevTools**
   ```
   Chrome DevTools > Application > Service Workers
   ```

**预期结果** ✅:
- Status: "activated and is running"
- Source: serviceWorker.js?__env=production&v=...

6. **检查缓存**
   ```
   Chrome DevTools > Application > Cache Storage
   ```

**预期结果** ✅:
- es-viewer-cache-v2.0.1
- es-viewer-static-v2.0.1
- es-viewer-dynamic-v2.0.1

7. **测试离线功能**
   ```
   Chrome DevTools > Network > Offline
   刷新页面
   ```

**预期结果** ✅:
- 页面仍然可访问
- 显示缓存的内容或离线页面

---

### 场景 5: 手动清理工具测试

**目标**: 验证手动清理命令

**步骤**:

1. **在生产模式运行并注册 SW**
   ```bash
   yarn build && yarn start
   ```

2. **访问应用，确认 SW 已注册**

3. **在控制台执行清理命令**
   ```javascript
   clearAllServiceWorkers()
   ```

**预期结果** ✅:
```
[SW] 开始手动清理 Service Worker 和缓存...
[SW] 已注销 1 个 Service Worker
[SW] 已清除 3 个缓存
[SW] ✅ 清理完成！建议刷新页面。
[SW] 正在刷新页面...
```

4. **3秒后自动刷新**

5. **刷新后检查状态**
   ```javascript
   window.getServiceWorkerStatus()
   ```

**预期输出** ✅:
```javascript
{
  registrations: 0,
  caches: 0,
  controller: false
}
```

---

### 场景 6: 环境切换测试

**目标**: 验证从生产切换到开发的清理

**步骤**:

1. **生产模式运行**
   ```bash
   yarn build && yarn start
   ```

2. **访问并确认 SW 注册**

3. **停止生产服务器**

4. **启动开发服务器**
   ```bash
   yarn dev
   ```

5. **刷新页面**

**预期结果** ✅:
- 自动检测到已有 SW
- 自动执行清理
- 输出清理统计
- 跳过新的 SW 注册

---

### 场景 7: 浏览器兼容性测试

**目标**: 验证多浏览器支持

**测试浏览器**:
- Chrome/Edge (Chromium)
- Firefox
- Safari (如果可用)

**步骤**:
1. 在每个浏览器重复场景 1-3
2. 检查控制台输出
3. 验证功能正常

**预期结果** ✅:
- 所有浏览器行为一致
- 不支持 SW 的浏览器优雅降级
- 无 JavaScript 错误

---

## 测试清单

将以下内容复制到测试报告中：

```
□ 场景 1: 开发模式 - 全新启动
  □ 控制台输出正确
  □ 无 SW 注册
  □ 无缓存
  □ 开发工具可用

□ 场景 2: 开发模式 - 有已注册的 SW
  □ 自动检测到 SW
  □ 自动清理成功
  □ 输出清理统计
  
□ 场景 3: 热重载功能
  □ 代码修改立即生效
  □ HMR 工作正常
  □ 无 SW 干扰

□ 场景 4: 生产构建
  □ SW 成功注册
  □ 缓存策略生效
  □ 离线功能可用
  □ 版本检测工作

□ 场景 5: 手动清理工具
  □ 清理命令可用
  □ 清理成功
  □ 自动刷新

□ 场景 6: 环境切换
  □ 自动清理旧 SW
  □ 开发环境干净

□ 场景 7: 浏览器兼容性
  □ Chrome 正常
  □ Firefox 正常
  □ Safari 正常（如测试）
```

## 常见问题排查

### 问题 1: SW 仍然注册

**症状**: 开发模式下仍看到 SW

**排查**:
1. 确认 `NODE_ENV` 值
   ```javascript
   console.log(process.env.NODE_ENV)
   ```
2. 确认使用 `yarn dev` 而非 `yarn start`
3. 手动清理: `clearAllServiceWorkers()`
4. 硬刷新: Ctrl+Shift+R

### 问题 2: 热重载不工作

**症状**: 修改代码后无变化

**排查**:
1. 检查是否有 SW 注册
2. 检查 Network 面板是否有 "(from ServiceWorker)"
3. 确认没有开启 "Disable cache"
4. 重启开发服务器

### 问题 3: 生产 SW 无法注册

**症状**: 生产环境 SW 注册失败

**排查**:
1. 检查 `serviceWorker.js` 是否可访问
2. 检查控制台错误
3. 验证 Next.js headers 配置
4. 检查浏览器安全设置

### 问题 4: 命令不可用

**症状**: `clearAllServiceWorkers()` 未定义

**排查**:
1. 确认 devTools.ts 已加载
2. 检查浏览器控制台错误
3. 确认在浏览器环境（非 SSR）
4. 刷新页面重试

## 测试报告模板

```markdown
# Service Worker 改进测试报告

**测试人员**: [姓名]
**测试日期**: [日期]
**浏览器**: Chrome [版本]
**Node.js**: [版本]

## 测试结果

### 场景 1: 开发模式 - 全新启动
- 状态: ✅ 通过 / ❌ 失败
- 备注: 

### 场景 2: 开发模式 - 有已注册的 SW
- 状态: ✅ 通过 / ❌ 失败
- 备注: 

### 场景 3: 热重载功能
- 状态: ✅ 通过 / ❌ 失败
- 备注: 

### 场景 4: 生产构建
- 状态: ✅ 通过 / ❌ 失败
- 备注: 

### 场景 5: 手动清理工具
- 状态: ✅ 通过 / ❌ 失败
- 备注: 

### 场景 6: 环境切换
- 状态: ✅ 通过 / ❌ 失败
- 备注: 

### 场景 7: 浏览器兼容性
- Chrome: ✅ 通过 / ❌ 失败
- Firefox: ✅ 通过 / ❌ 失败
- Safari: ✅ 通过 / ❌ 失败 / ⊘ 未测试

## 发现的问题

1. [问题描述]
   - 重现步骤:
   - 预期行为:
   - 实际行为:
   - 严重程度: 严重/中等/轻微

## 总结

- 通过场景数: X/7
- 发现问题数: X
- 建议: 
```

---

**测试完成后请更新**: `IMPLEMENTATION_SUMMARY.md` 中的测试状态

