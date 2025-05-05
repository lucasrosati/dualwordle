
import React, { useEffect } from 'react';
import { LetterState } from '../utils/gameLogic';
import { cn } from '@/lib/utils';
import { getLetterStateFromC, initWasm } from '@/utils/wasmLoader';

interface GameBoardProps {
  attempts: string[];
  currentGuess: string;
  currentRow: number;
  secretWord1: string;
  secretWord2: string;
  wordSolved1: boolean;
  wordSolved2: boolean;
}

export function GameBoard({
  attempts,
  currentGuess,
  currentRow,
  secretWord1,
  secretWord2,
  wordSolved1,
  wordSolved2
}: GameBoardProps) {
  const MAX_ROWS = 6;
  
  // Initialize WASM when component mounts
  useEffect(() => {
    initWasm();
  }, []);
  
  // Helper function to convert C letter state to TS letter state
  function convertLetterState(stateNum: number): LetterState {
    switch(stateNum) {
      case 0: return 'absent';
      case 1: return 'present';
      case 2: return 'correct';
      case 3: return 'empty';
      case 4: return 'tbd';
      default: return 'empty';
    }
  }
  
  // Helper function to get letter state from WASM
  function getLetterState(row: number, col: number, wordIndex: 1 | 2): LetterState {
    // For completed rows (submitted guesses)
    if (row < currentRow && row < attempts.length) {
      const guess = attempts[row];
      const secretWord = wordIndex === 1 ? secretWord1 : secretWord2;
      
      // If the guess matches the secret word exactly, all letters are correct
      if (guess === secretWord) {
        return 'correct';
      }
      
      // Check if this word is already solved in a previous attempt
      const isWordSolved = (wordIndex === 1 && wordSolved1) || (wordIndex === 2 && wordSolved2);
      
      if (isWordSolved && guess !== secretWord) {
        // For already solved words, still show the correct feedback for this attempt
        return convertLetterState(getLetterStateFromC(guess, secretWord, col));
      }
      
      // Use WASM to get the letter state for this specific word
      return convertLetterState(getLetterStateFromC(guess, secretWord, col));
    }
    
    // For current row (uncommitted guess)
    if (row === currentRow) {
      return col < currentGuess.length ? 'tbd' : 'empty';
    }
    
    // For future rows
    return 'empty';
  }
  
  // Generate board rows with proper styling for Word 1
  const boardRows1 = [];
  for (let row = 0; row < MAX_ROWS; row++) {
    const rowTiles = [];
    for (let col = 0; col < 5; col++) {
      const letter = row < currentRow ? attempts[row][col] : (row === currentRow && col < currentGuess.length ? currentGuess[col] : '');
      const state = getLetterState(row, col, 1);
      
      rowTiles.push(
        <div 
          key={`tile1-${row}-${col}`}
          className={cn(
            'letter-tile text-white',
            {
              'bg-correct border-correct': state === 'correct',
              'bg-present border-present': state === 'present',
              'bg-absent border-absent': state === 'absent',
              'bg-transparent': state === 'empty',
              'border-gray-700': state === 'tbd',
              'animate-pop': row === currentRow - 1 && !attempts[row - 1]?.[col + 1],
              'animate-flip': row === currentRow - 1
            }
          )}
          style={{ animationDelay: `${col * 100}ms` }}
        >
          {letter.toUpperCase()}
        </div>
      );
    }
    
    boardRows1.push(
      <div key={`board-row-1-${row}`} className="flex gap-2 mb-2">
        {rowTiles}
      </div>
    );
  }

  // Generate board rows with proper styling for Word 2
  const boardRows2 = [];
  for (let row = 0; row < MAX_ROWS; row++) {
    const rowTiles = [];
    for (let col = 0; col < 5; col++) {
      const letter = row < currentRow ? attempts[row][col] : (row === currentRow && col < currentGuess.length ? currentGuess[col] : '');
      const state = getLetterState(row, col, 2);
      
      rowTiles.push(
        <div 
          key={`tile2-${row}-${col}`}
          className={cn(
            'letter-tile text-white',
            {
              'bg-correct border-correct': state === 'correct',
              'bg-present border-present': state === 'present',
              'bg-absent border-absent': state === 'absent',
              'bg-transparent': state === 'empty',
              'border-gray-700': state === 'tbd',
              'animate-pop': row === currentRow - 1 && !attempts[row - 1]?.[col + 1],
              'animate-flip': row === currentRow - 1
            }
          )}
          style={{ animationDelay: `${col * 100}ms` }}
        >
          {letter.toUpperCase()}
        </div>
      );
    }
    
    boardRows2.push(
      <div key={`board-row-2-${row}`} className="flex gap-2 mb-2">
        {rowTiles}
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-8 mx-auto">
      <div className="game-board">
        {boardRows1}
      </div>
      <div className="game-board">
        {boardRows2}
      </div>
    </div>
  );
}
