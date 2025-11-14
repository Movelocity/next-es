import React, { useState } from 'react';
import cn from 'classnames'
type OptionGroupProps = {
  defaultOption?: string;
  options: string[];
  onSelect?: (value: string) => void;
  children?: React.ReactNode[];
  extra?: React.ReactNode;
  className?: string;
  width?: string;
};

/** 
 * 选项卡组件
 * 
 * 使用说明:
 * 通过options和children来实现选项卡功能，option和children的顺序一一对应
 * 
 * <OptionGroup defaultOption={'Cards'} options={['Raw', 'Cards', 'Config']}>
 *   <div>Raw</div>
 *   <div>Cards</div>
 *   <div>Config</div>
 *   {extra}
 * </OptionGroup>
 */
const OptionGroup: React.FC<OptionGroupProps> = ({ defaultOption, options, onSelect, children, className, width, extra }) => {
  const [selectedValue, setSelectedValue] = useState(defaultOption||options[0]);

  const handleClick = (value:string) => {
    setSelectedValue(value);
    onSelect?.(value);
  };

  return (
    <div className={cn("flex flex-col w-full max-h-[95vh]", className)} style={{width: width}}>
      <div className="flex flex-row justify-between flex-wrap">
        <div className="flex-1 flex flex-row">
          {options.map((option) => (
            <div
              key={option}
              className={`cursor-pointer px-2 py-1 rounded-t-sm hover:bg-slate-800 ${selectedValue === option ? 'bg-gray-700' : ''}`}
              onClick={() => handleClick(option)}
            >
              {option}
            </div>
          ))}
        </div>
        {extra && (
          <div className="">
            {extra}
          </div>
        )}
      </div>
      {children && (
        <div className="flex-1 ">
          {React.Children.toArray(children)[options.indexOf(selectedValue)]}
        </div>
      )}
    </div>
  );
};

export default OptionGroup;