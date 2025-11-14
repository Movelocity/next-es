'use client'
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { KvItem } from '@/components/ParamCards';

const useSmoothInputFocus = () => {
  const handleSmoothFocus = useCallback((targetInput: HTMLInputElement, position: number) => {
    // 使用 double requestAnimationFrame 确保 DOM 更新完成
    targetInput.focus();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        targetInput.setSelectionRange(position, position);
      });
    });
  }, []);
  
  return { handleSmoothFocus };
};

interface KvGroupProps {
  pairs: Record<string, string>;
  onUpdate?: (key_name: string, newValue: string) => void;
}

/** 支持通过上下键切换焦点的KV组 */
export const KvGroup: React.FC<KvGroupProps> = ({ pairs, onUpdate }) => {
  const [data, setData] = useState(pairs);
  
  useEffect(() => {
    setData(pairs);
  }, [pairs]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const updateValue = (key_name: string, newValue: string) => {
    setData((prevData) => ({
      ...prevData,
      [key_name]: newValue,
    }));
    onUpdate?.(key_name, newValue);
  };

  const { handleSmoothFocus } = useSmoothInputFocus();

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (containerRef.current === null) return;
    const inputs: NodeListOf<HTMLInputElement> = containerRef.current.querySelectorAll('input[type="text"]');
    if ((e.key === 'ArrowUp' && index > 0) || (e.key === 'ArrowDown' && index < inputs.length - 1)) {
      e.preventDefault();
      const currentInput = inputs[index];
      const nextIndex = e.key === 'ArrowUp' ? index - 1 : index + 1;
      const nextInput = inputs[nextIndex];
      const position = currentInput.selectionStart;
      
      // 组合优化：先隐藏光标，再设置位置，最后显示
      nextInput.style.caretColor = 'transparent';
      nextInput.focus();
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          nextInput.setSelectionRange(position, position);
          nextInput.style.caretColor = 'auto';
        });
      });
    }
  }, [handleSmoothFocus])

  return (
    <div ref={containerRef}>
      {Object.entries(data).map(([key_name, value], index) => (
        <KvItem
          key={key_name}
          key_name={key_name}
          value={value}
          index={index}
          updateValue={updateValue}
          handleKeyDown={handleKeyDown}
        />
      ))}
    </div>
  );
}
KvGroup.displayName = "KvGroup"

export default KvGroup;