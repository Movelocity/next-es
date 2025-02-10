import { useState } from 'react';

/**
 * Custom hook to manage panel ratio in the ES Log Panel
 * @param initialRatio Initial ratio for the left panel (between 0 and 1)
 * @returns Object containing ratio values and setter function
 */
export const useRatio = (initialRatio: number = 0.25) => {
  const [leftRatio, setLeftRatio] = useState(initialRatio);
  const rightRatio = 1 - leftRatio;
  const leftEditorWidth = `calc(${Math.trunc(leftRatio*100)}% - 4px)`;
  const rightEditorWidth = `calc(${Math.trunc(rightRatio*100)}% - 4px)`;

  return {
    leftRatio,
    rightRatio,
    leftEditorWidth,
    rightEditorWidth,
    setLeftRatio,
  };
}; 