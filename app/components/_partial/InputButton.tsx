import React, { useState } from 'react';

type InputButtonProps = {
  buttonText: string;
  onButtonClick?: (value: string) => void;
  initialValue?: string;
};

const InputButton: React.FC<InputButtonProps> = ({ buttonText, onButtonClick, initialValue = '' }) => {
  const [inputValue, setInputValue] = useState(initialValue);

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick(inputValue);
    }
  };

  return (
    <div className="flex flex-row justify-around items-center w-full">
      <input 
        value={inputValue} 
        onChange={(e) => setInputValue(e.target.value)}
        className="bg-zinc-800 text-white pl-2 font-mono w-[70%] text-sm rounded-sm h-6 outline-none" 
        spellCheck="false"
      />
      <div 
        className='cursor-pointer rounded-sm hover:bg-zinc-800 px-3' 
        onClick={handleButtonClick}
      >
        {buttonText}
      </div>
    </div>
  );
};

export default InputButton;