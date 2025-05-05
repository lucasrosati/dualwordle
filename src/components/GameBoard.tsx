
import React from 'react';
import { LetterState } from '../utils/gameLogic';
import { cn } from '@/lib/utils';

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
  
  // Helper function to get letter state
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
      
      // Check if the letter is in the correct position
      if (guess[col] === secretWord[col]) {
        return 'correct';
      }
      
      // Check if the letter exists in the word but in a different position
      if (secretWord.includes(guess[col])) {
        // We need to account for duplicate letters
        const letter = guess[col];
        
        // Count how many times this letter appears in the secret word
        const letterCount = secretWord.split('').filter(l => l === letter).length;
        
        // Count how many times this letter is in the correct position in the current guess
        const correctPositions = guess.split('').filter((l, i) => 
          l === letter && secretWord[i] === letter
        ).length;
        
        // Count how many times this letter has been marked as present in positions before the current one
        const presentPositionsBeforeCurrent = guess.substring(0, col).split('').filter((l, i) => 
          l === letter && secretWord[i] !== letter && secretWord.includes(l)
        ).length;
        
        // If we haven't exceeded the count of this letter in the secret word, mark as present
        if (correctPositions + presentPositionsBeforeCurrent < letterCount) {
          return 'present';
        }
      }
      
      return 'absent';
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
      
      rowTiles.push(
        <div 
          key={`tile-${row}-${col}`}
          className={cn(
            'letter-tile',
            {
              'bg-correct text-white border-correct': state1 === 'correct',
              'bg-present text-white border-present': state1 === 'present' && state2 !== 'correct',
              'bg-absent text-white border-absent': state1 === 'absent' && state2 !== 'correct' && state2 !== 'present',
              'bg-transparent': state1 === 'empty',
              'border-gray-700': state1 === 'tbd',
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
      
      rowTiles.push(
        <div 
          key={`tile2-${row}-${col}`}
          className={cn(
            'letter-tile',
            {
              'bg-correct text-white border-correct': state2 === 'correct',
              'bg-present text-white border-present': state2 === 'present' && state1 !== 'correct',
              'bg-absent text-white border-absent': state2 === 'absent' && state1 !== 'correct' && state1 !== 'present',
              'bg-transparent': state2 === 'empty',
              'border-gray-700': state2 === 'tbd',
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
