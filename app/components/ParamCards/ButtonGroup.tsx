import React, { useState } from 'react';
import cn from 'classnames'
type ButtonGroupProps = {
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
};

const ButtonGroup: React.FC<ButtonGroupProps> = ({ options, onSelect }) => {
  const [selectedValue, setSelectedValue] = useState(options[0].value); // 默认选中第一个值

  const handleButtonClick = (value: string) => {
    setSelectedValue(value);
    onSelect(value); // Emit 选中值
  };

  return (
    <div className="bg-zinc-800 rounded-md overflow-hidden flex flex-row text-sm">
      {options.map((option, index) => (
        <React.Fragment key={option.value}>
          <button
            onClick={() => handleButtonClick(option.value)}
            className={cn(
              'flex-1 text-white transition-colors duration-200 px-2', 
              selectedValue === option.value? 'bg-zinc-600' : 'hover:bg-zinc-700'
            )}
          >
            {option.label}
          </button>
          {index < options.length - 1 && (
            <div className="w-px bg-gray-400"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ButtonGroup;