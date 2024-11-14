import React, { useCallback } from 'react';
import cn from 'classnames'

interface DragBarProps {
  className?: string;
  updateDrag: (screenRatio: number) => void;
}

const DragBar: React.FC<DragBarProps> = ({ className, updateDrag }) => {
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const startX = e.clientX;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const diffX = e.clientX - startX;
      const newRatio = Math.max(0, Math.min(1, (startX + diffX) / window.innerWidth));
      updateDrag(newRatio);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [updateDrag]);

  return (
    <div
      className={cn(className, 'flex flex-col items-center justify-center cursor-col-resize user-select-none hover:bg-sky-700')}
      onMouseDown={handleMouseDown}
    >
      ‖
    </div>
  );
};

export default DragBar;