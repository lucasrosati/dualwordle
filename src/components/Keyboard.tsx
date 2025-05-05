
import React from 'react';
import { LetterState } from '../utils/gameLogic';
import { cn } from '@/lib/utils';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  keyboardStates: Record<string, LetterState>;
}

export function Keyboard({ onKeyPress, keyboardStates }: KeyboardProps) {
  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  // Handle physical keyboard
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onKeyPress('ENTER');
      } else if (e.key === 'Backspace') {
        onKeyPress('BACKSPACE');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        onKeyPress(e.key.toLowerCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onKeyPress]);

  const getKeyStyle = (key: string) => {
    const state = keyboardStates[key];
    switch (state) {
      case 'correct':
        return 'bg-correct border-correct';
      case 'present':
        return 'bg-present border-present';
      case 'absent':
        return 'bg-absent border-absent';
      default:
        return 'bg-keyboard';
    }
  };

  return (
    <div className="keyboard mt-4">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {rowIndex === 2 && (
            <button 
              onClick={() => onKeyPress('ENTER')} 
              className="keyboard-key keyboard-key-action"
            >
              ENTER
            </button>
          )}
          
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key)}
              className={cn("keyboard-key keyboard-key-letter", getKeyStyle(key))}
            >
              {key.toUpperCase()}
            </button>
          ))}
          
          {rowIndex === 2 && (
            <button 
              onClick={() => onKeyPress('BACKSPACE')} 
              className="keyboard-key keyboard-key-action"
            >
              ←
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
