
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
      
      // Check if this word is already solved in a previous attempt
      const solvedInPreviousAttempt = 
        wordIndex === 1 && wordSolved1 && attempts.indexOf(secretWord1) < row ||
        wordIndex === 2 && wordSolved2 && attempts.indexOf(secretWord2) < row;
        
      if (solvedInPreviousAttempt) {
        return 'correct';
      }
      
      // If the exact guess matches the secret word, all letters are correct
      if (guess === secretWord) {
        return 'correct';
      }
      
      // Use WASM to get the letter state
      return convertLetterState(getLetterStateFromC(guess, secretWord, col));
    }
    
    // For current row (uncommitted guess)
    if (row === currentRow) {
      return col < currentGuess.length ? 'tbd' : 'empty';
    }
    
    // For future rows
    return 'empty';
  }
  
  // Generate board rows with proper styling
  const boardRows = [];
  for (let row = 0; row < MAX_ROWS; row++) {
    const rowTiles = [];
    for (let col = 0; col < 5; col++) {
      const letter = row < currentRow ? attempts[row][col] : (row === currentRow && col < currentGuess.length ? currentGuess[col] : '');
      const state1 = getLetterState(row, col, 1);
      const state2 = getLetterState(row, col, 2);
      
      // Determine final state for rendering (prioritize correct over present over absent)
      let finalState: LetterState = 'empty';
      if (state1 === 'correct' || state2 === 'correct') {
        finalState = 'correct';
      } else if (state1 === 'present' || state2 === 'present') {
        finalState = 'present';
      } else if (state1 === 'absent' && state2 === 'absent') {
        finalState = 'absent';
      } else if (state1 === 'tbd' || state2 === 'tbd') {
        finalState = 'tbd';
      }
      
      rowTiles.push(
        <div 
          key={`tile-${row}-${col}`}
          className={cn(
            'letter-tile',
            {
              'bg-correct text-white border-correct': finalState === 'correct',
              'bg-present text-white border-present': finalState === 'present',
              'bg-absent text-white border-absent': finalState === 'absent',
              'bg-transparent': finalState === 'empty',
              'border-gray-700': finalState === 'tbd',
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
    
    boardRows.push(
      <div key={`board-row-1-${row}`} className="flex gap-2 mb-2">
        {rowTiles}
      </div>
    );
  }

  // Do the same for the second word
  const boardRows2 = [];
  for (let row = 0; row < MAX_ROWS; row++) {
    const rowTiles = [];
    for (let col = 0; col < 5; col++) {
      const letter = row < currentRow ? attempts[row][col] : (row === currentRow && col < currentGuess.length ? currentGuess[col] : '');
      const state1 = getLetterState(row, col, 1);
      const state2 = getLetterState(row, col, 2);
      
      // Determine final state for rendering (prioritize correct over present over absent)
      let finalState: LetterState = 'empty';
      if (state2 === 'correct') {
        finalState = 'correct';
      } else if (state2 === 'present') {
        finalState = 'present';
      } else if (state2 === 'absent') {
        finalState = 'absent';
      } else if (state2 === 'tbd') {
        finalState = 'tbd';
      }
      
      rowTiles.push(
        <div 
          key={`tile2-${row}-${col}`}
          className={cn(
            'letter-tile',
            {
              'bg-correct text-white border-correct': finalState === 'correct',
              'bg-present text-white border-present': finalState === 'present',
              'bg-absent text-white border-absent': finalState === 'absent',
              'bg-transparent': finalState === 'empty',
              'border-gray-700': finalState === 'tbd',
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
        {boardRows}
      </div>
      <div className="game-board">
        {boardRows2}
      </div>
    </div>
  );
}
