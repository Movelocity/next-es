import React, { useState } from 'react';

type OptionGroupProps = {
  defaultOption?: string;
  options: string[];
  onSelect: (value: string) => void;
};

const OptionGroup: React.FC<OptionGroupProps> = ({ defaultOption, options, onSelect }) => {
  const [selectedValue, setSelectedValue] = useState(defaultOption||options[0]);

  const handleClick = (value:string) => {
    setSelectedValue(value);
    onSelect(value);
  };

  return (
    <div className="flex flex-row">
      {options.map((option) => (
        <div
          key={option}
          className={`cursor-pointer px-2 rounded-t-sm hover:bg-slate-800 ${selectedValue === option ? 'bg-gray-700' : ''}`}
          onClick={() => handleClick(option)}
        >
          {option}
        </div>
      ))}
    </div>
  );
};

export default OptionGroup;