
#include <stdlib.h>
#include <string.h>
#include <emscripten.h>

// Letter states enum matching JS counterpart
typedef enum {
  LETTER_ABSENT = 0,
  LETTER_PRESENT = 1,
  LETTER_CORRECT = 2,
  LETTER_EMPTY = 3,
  LETTER_TBD = 4
} LetterState;

// Function to check if a word is valid
EMSCRIPTEN_KEEPALIVE
int isValidGuess(const char* guess) {
  if (!guess) return 0;
  return strlen(guess) == 5 ? 1 : 0;
}

// Helper function to count occurrences of a character in a string
int countChar(const char* str, char c) {
  int count = 0;
  for (int i = 0; str[i] != '\0'; i++) {
    if (str[i] == c) count++;
  }
  return count;
}

// Check if the specific guess matches the secret word
EMSCRIPTEN_KEEPALIVE
int checkWordMatch(const char* guess, const char* secretWord) {
  if (!guess || !secretWord) return 0;
  return strcmp(guess, secretWord) == 0 ? 1 : 0;
}

// Get letter state for a specific position
EMSCRIPTEN_KEEPALIVE
int getLetterState(const char* guess, const char* secretWord, int position) {
  if (!guess || !secretWord || position < 0 || position >= 5) {
    return LETTER_EMPTY;
  }
  
  // If the letter is in the correct position
  if (guess[position] == secretWord[position]) {
    return LETTER_CORRECT;
  }
  
  // Check if the letter exists elsewhere
  char letter = guess[position];
  int letterInSecret = 0;
  for (int i = 0; i < 5; i++) {
    if (secretWord[i] == letter) {
      letterInSecret = 1;
      break;
    }
  }
  
  if (!letterInSecret) {
    return LETTER_ABSENT;
  }
  
  // Count occurrences of this letter
  int letterCount = countChar(secretWord, letter);
  int correctPositions = 0;
  int presentPositionsBefore = 0;
  
  // Count correct positions of this letter
  for (int i = 0; i < 5; i++) {
    if (guess[i] == letter && secretWord[i] == letter) {
      correctPositions++;
    }
  }
  
  // Count present positions before current
  for (int i = 0; i < position; i++) {
    if (guess[i] == letter && secretWord[i] != letter && strchr(secretWord, letter) != NULL) {
      presentPositionsBefore++;
    }
  }
  
  // If we haven't exceeded the count, mark as present
  if (correctPositions + presentPositionsBefore < letterCount) {
    return LETTER_PRESENT;
  }
  
  return LETTER_ABSENT;
}

// Function to check if a word has been solved in a previous attempt
EMSCRIPTEN_KEEPALIVE
int checkSolvedInPrevious(const char* attempts, int attemptCount, int currentRow, const char* secretWord) {
  if (!attempts || !secretWord || currentRow <= 0) return 0;
  
  const int WORD_LENGTH = 5;
  for (int i = 0; i < currentRow; i++) {
    const char* attempt = attempts + (i * WORD_LENGTH);
    if (strncmp(attempt, secretWord, WORD_LENGTH) == 0) {
      return 1;
    }
  }
  
  return 0;
}
