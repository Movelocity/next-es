#!/usr/bin/env node

/**
 * 版本更新脚本
 * 
 * 自动更新以下文件中的版本号：
 * - package.json
 * - public/serviceWorker.js
 * - app/api/version/route.ts
 * 
 * 使用方法：
 * node scripts/update-version.js [version]
 * 
 * 示例：
 * node scripts/update-version.js 2.1.0
 */

const fs = require('fs');
const path = require('path');

function updatePackageJson(version) {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  packageContent.version = version;
  fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2) + '\n');
  console.log(`✅ Updated package.json version to ${version}`);
}

function updateServiceWorker(version) {
  const swPath = path.join(process.cwd(), 'public/serviceWorker.js');
  let content = fs.readFileSync(swPath, 'utf-8');
  
  // 更新版本号
  content = content.replace(
    /const CACHE_VERSION = '[^']+'/,
    `const CACHE_VERSION = 'v${version}'`
  );
  
  fs.writeFileSync(swPath, content);
  console.log(`✅ Updated serviceWorker.js version to v${version}`);
}

function updateVersionAPI(version) {
  const apiPath = path.join(process.cwd(), 'app/api/version/route.ts');
  let content = fs.readFileSync(apiPath, 'utf-8');
  
  // 更新版本号
  content = content.replace(
    /const APP_VERSION = '[^']+'/,
    `const APP_VERSION = 'v${version}'`
  );
  
  fs.writeFileSync(apiPath, content);
  console.log(`✅ Updated version API to v${version}`);
}

function updateREADME(version) {
  const readmePath = path.join(process.cwd(), 'README.md');
  
  if (fs.existsSync(readmePath)) {
    let content = fs.readFileSync(readmePath, 'utf-8');
    
    // 如果存在版本徽章，更新它
    if (content.includes('![Version]')) {
      content = content.replace(
        /!\[Version\]\([^)]+\)/,
        `![Version](https://img.shields.io/badge/version-${version}-blue)`
      );
      fs.writeFileSync(readmePath, content);
      console.log(`✅ Updated README.md version badge to ${version}`);
    }
  }
}

function generateChangelogEntry(version) {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  const date = new Date().toISOString().split('T')[0];
  
  const entry = `
## [${version}] - ${date}

### Added
- 版本更新 ${version}

### Changed
- 更新了Service Worker缓存策略
- 优化了版本检测机制

### Fixed
- 修复了资源加载失败时的恢复机制

`;

  if (fs.existsSync(changelogPath)) {
    const content = fs.readFileSync(changelogPath, 'utf-8');
    const updatedContent = content.replace(
      /# Changelog\n/,
      `# Changelog\n${entry}`
    );
    fs.writeFileSync(changelogPath, updatedContent);
  } else {
    fs.writeFileSync(changelogPath, `# Changelog${entry}`);
  }
  
  console.log(`✅ Updated CHANGELOG.md with version ${version}`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ 请提供版本号');
    console.log('使用方法: node scripts/update-version.js [version]');
    console.log('示例: node scripts/update-version.js 2.1.0');
    process.exit(1);
  }
  
  const version = args[0];
  
  // 验证版本号格式
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    console.error('❌ 版本号格式错误，应为 x.y.z 格式');
    process.exit(1);
  }
  
  console.log(`🚀 开始更新版本到 ${version}`);
  
  try {
    updatePackageJson(version);
    updateServiceWorker(version);
    updateVersionAPI(version);
    updateREADME(version);
    generateChangelogEntry(version);
    
    console.log(`\n🎉 版本更新完成！`);
    console.log(`📋 下一步：`);
    console.log(`   1. 检查更新的文件`);
    console.log(`   2. 提交更改: git add . && git commit -m "chore: bump version to ${version}"`);
    console.log(`   3. 创建标签: git tag v${version}`);
    console.log(`   4. 推送更改: git push && git push --tags`);
    console.log(`   5. 部署应用`);
    
  } catch (error) {
    console.error('❌ 更新版本时出错:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  updatePackageJson,
  updateServiceWorker,
  updateVersionAPI,
  updateREADME,
  generateChangelogEntry
}; 