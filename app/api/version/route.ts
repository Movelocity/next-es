import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

// 应用版本管理
const APP_VERSION = 'v2.0.1'; // 手动维护版本号，每次发布时更新

/**
 * 获取应用版本信息
 * 支持 GET 请求，返回当前应用版本、构建时间等信息
 */
export async function GET(request: NextRequest) {
  try {
    // 获取package.json中的版本信息
    let packageVersion = APP_VERSION;
    try {
      const packagePath = join(process.cwd(), 'package.json');
      const packageContent = readFileSync(packagePath, 'utf-8');
      const packageJson = JSON.parse(packageContent);
      packageVersion = packageJson.version || APP_VERSION;
    } catch (error) {
      console.warn('Could not read package.json version, using fallback:', error);
    }

    // 获取构建时间（如果可用）
    let buildTime = null;
    try {
      const buildInfoPath = join(process.cwd(), '.next/build-manifest.json');
      const buildInfo = readFileSync(buildInfoPath, 'utf-8');
      const manifest = JSON.parse(buildInfo);
      // Next.js构建清单可能包含时间戳信息
      buildTime = new Date().toISOString(); // 临时使用当前时间
    } catch (error) {
      // 构建信息不可用时，使用当前时间
      buildTime = new Date().toISOString();
    }

    const versionInfo = {
      version: packageVersion,
      appVersion: APP_VERSION,
      buildTime,
      timestamp: Date.now(),
      node: process.version,
      platform: process.platform,
      // 添加一些有用的环境信息
      environment: process.env.NODE_ENV || 'development',
      // 生成唯一的构建ID（基于时间和版本）
      buildId: Buffer.from(`${packageVersion}-${buildTime}`).toString('base64').slice(0, 12)
    };

    // 设置适当的缓存头
    const response = NextResponse.json(versionInfo);
    
    // 防止缓存，确保总是获取最新版本信息
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;

  } catch (error) {
    console.error('Version API error:', error);
    
    // 即使出错也返回基本版本信息
    return NextResponse.json({
      version: APP_VERSION,
      appVersion: APP_VERSION,
      timestamp: Date.now(),
      error: 'Could not retrieve full version information'
    }, { 
      status: 200, // 仍然返回200，因为我们提供了基本信息
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

/**
 * 健康检查端点
 * 支持 HEAD 请求用于快速健康检查
 */
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-App-Version': APP_VERSION,
      'X-Timestamp': Date.now().toString()
    }
  });
} 