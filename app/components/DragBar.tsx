import React, { useCallback, useState } from 'react';
import cn from 'classnames'

interface DragBarProps {
  className?: string;
  updateDrag: (screenRatio: number) => void;
}

const DragBar: React.FC<DragBarProps> = ({ className, updateDrag }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    setIsDragging(true);
    
    // Add a style to prevent text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const diffX = e.clientX - startX;
      const newRatio = Math.max(0, Math.min(1, (startX + diffX) / window.innerWidth));
      updateDrag(newRatio);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [updateDrag]);

  return (
    <div
      className={cn(
        className,
        'flex flex-col items-center justify-center cursor-col-resize select-none hover:bg-sky-700',
        isDragging && 'bg-sky-700'
      )}
      onMouseDown={handleMouseDown}
    >
      ‖
    </div>
  );
};

export default DragBar;