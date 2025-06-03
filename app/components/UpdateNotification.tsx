'use client'
import React, { useState, useEffect } from 'react';
import { useSW } from '../utils/serviceWorker/sw';

/**
 * 更新通知组件
 * 当有新版本可用时显示通知，并提供更新选项
 */
export default function UpdateNotification() {
  const { registered, updateAvailable, error, checkForUpdates, forceUpdate } = useSW();
  const [isVisible, setIsVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // 当有更新可用时显示通知
    if (updateAvailable) {
      setIsVisible(true);
    }
  }, [updateAvailable]);

  const handleCheckUpdate = async () => {
    setIsChecking(true);
    try {
      const hasUpdate = await checkForUpdates();
      if (hasUpdate) {
        setIsVisible(true);
      } else {
        // 显示无更新的提示
        showTemporaryMessage('当前已是最新版本');
      }
    } catch (error) {
      console.error('Check update failed:', error);
      showTemporaryMessage('检查更新失败，请稍后重试');
    } finally {
      setIsChecking(false);
    }
  };

  const handleUpdate = () => {
    forceUpdate();
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const showTemporaryMessage = (message: string) => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10001;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  // 如果service worker注册失败，显示错误状态
  if (error) {
    return (
      <div className="fixed bottom-4 right-4 max-w-sm p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Service Worker 错误</span>
        </div>
        <p className="mt-1 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
        >
          刷新页面
        </button>
      </div>
    );
  }

  return (
    <>
      {/* 更新检查按钮 */}
      <button
        onClick={handleCheckUpdate}
        disabled={isChecking}
        className="fixed bottom-4 left-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-50"
        title="检查更新"
      >
        <svg 
          className={`w-5 h-5 ${isChecking ? 'animate-spin' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
      </button>

      {/* 更新通知 */}
      {isVisible && (
        <div className="fixed top-4 right-4 max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-slide-in">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">
                发现新版本
              </p>
              <p className="mt-1 text-sm text-gray-500">
                有新版本可用，建议立即更新以获得最佳体验。
              </p>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={handleUpdate}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  立即更新
                </button>
                <button
                  onClick={handleDismiss}
                  className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  稍后提醒
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 添加必要的CSS动画 */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
} 