'use client'
import React, { useState, useCallback, useRef, memo } from 'react';

interface KeyValuePairProps {
  key_name: string;
  value: string;
  index: number;
  updateValue: (key_name: string, newValue: string) => void;
  handleKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
}

export const KeyValuePair: React.FC<KeyValuePairProps> = ({ key_name, value, index, updateValue, handleKeyDown }) => {
  return (
    <div className="flex flex-row items-center w-[98%] rounded-md bg-zinc-600 mb-1">
      <span className="w-1/2 pl-2">{key_name}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => updateValue(key_name, e.target.value)}
        onKeyDown={(e) => handleKeyDown?.(e, index)}
        className="bg-zinc-700 rounded-r-sm px-2 outline-none w-full"
      />
    </div>
  );
};


interface KeyValuePairGroupProps {
  pairs: Record<string, string>;
  onUpdate?: (key_name: string, newValue: string) => void;
}

export const KeyValuePairGroup: React.FC<KeyValuePairGroupProps> = ({ pairs, onUpdate }) => {
  const [data, setData] = useState(pairs);
  const containerRef = useRef(null);
  // console.log(typeof(pairs), pairs)
  const updateValue = (key_name: string, newValue: string) => {
    setData((prevData) => ({
      ...prevData,
      [key_name]: newValue,
    }));
    onUpdate?.(key_name, newValue);
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (containerRef.current === null) return;
    const inputs = (containerRef.current as HTMLDivElement).querySelectorAll('input[type="text"]');

    if (e.key === 'ArrowUp' && index > 0) {
      const input1 = (inputs[index] as HTMLInputElement)
      const inputNext = (inputs[index - 1] as HTMLInputElement)
      const position = input1.selectionStart;
      inputNext.focus()
      setTimeout(()=>inputNext.setSelectionRange(position, position), 100)
      console.log('position', position, inputNext.selectionStart);
    } else if (e.key === 'ArrowDown' && index < inputs.length - 1) {
      const input1 = (inputs[index] as HTMLInputElement)
      const inputNext = (inputs[index + 1] as HTMLInputElement)
      const position = input1.selectionStart;
      inputNext.focus()
      setTimeout(()=>inputNext.setSelectionRange(position, position), 100)
      console.log('position', position, inputNext.selectionStart);
    }
  }, [])

  return (
    <div ref={containerRef}>
      {Object.entries(data).map(([key_name, value], index) => (
        <KeyValuePair
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
KeyValuePairGroup.displayName = "KeyValuePairGroup"