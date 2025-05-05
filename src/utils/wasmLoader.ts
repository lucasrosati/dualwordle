
// WebAssembly module and instance variables
let wasmModule: WebAssembly.Module | null = null;
let wasmInstance: WebAssembly.Instance | null = null;
let wasmMemory: WebAssembly.Memory | null = null;
let isWasmLoaded = false;

// Interface for C functions exposed through WebAssembly
interface CGameLogic {
  _isValidGuess: (strPtr: number) => number;
  _checkWordMatch: (guessPtr: number, secretPtr: number) => number;
  _getLetterState: (guessPtr: number, secretPtr: number, position: number) => number;
  _checkSolvedInPrevious: (attemptsPtr: number, attemptCount: number, currentRow: number, secretPtr: number) => number;
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
}

// WASM exports with all functions
let wasmExports: CGameLogic | null = null;

// Helper function to write a string to WASM memory
function writeStringToMemory(str: string): number {
  if (!wasmExports || !wasmMemory) return 0;
  
  const bytes = new TextEncoder().encode(str + '\0'); // null-terminated
  const ptr = wasmExports._malloc(bytes.length);
  const memory = new Uint8Array((wasmMemory as WebAssembly.Memory).buffer);
  memory.set(bytes, ptr);
  return ptr;
}

// Helper function to read a string from WASM memory
function readStringFromMemory(ptr: number, maxLength: number = 100): string {
  if (!wasmMemory) return '';
  
  const memory = new Uint8Array((wasmMemory as WebAssembly.Memory).buffer);
  let end = ptr;
  while (end < ptr + maxLength && memory[end] !== 0) end++;
  const bytes = memory.slice(ptr, end);
  return new TextDecoder().decode(bytes);
}

// Initialize WebAssembly module
export async function initWasm(): Promise<boolean> {
  if (isWasmLoaded) return true;
  
  try {
    // In a real project, you would fetch your compiled WASM file here
    // Since we can't compile C in this environment, we're mocking the WASM loading
    
    // Mock implementation - in a real project, replace with actual compiled WASM
    wasmExports = mockWasmFunctions();
    isWasmLoaded = true;
    console.log("WASM logic loaded (mock implementation)");
    return true;
  } catch (error) {
    console.error("Failed to load WASM:", error);
    return false;
  }
}

// Mock implementation of WASM functions (in a real project, this would be the compiled C code)
function mockWasmFunctions(): CGameLogic {
  // Create a shared memory
  wasmMemory = new WebAssembly.Memory({ initial: 256 }); // 256 pages (16MB)
  const memory = new Uint8Array(wasmMemory.buffer);
  let heapNext = 1024; // Start heap after 1KB
  
  // Very simple malloc implementation
  const malloc = (size: number): number => {
    const ptr = heapNext;
    heapNext += size;
    return ptr;
  };
  
  const free = (_ptr: number): void => {
    // In our simple mock, we don't need to implement free
  };
  
  return {
    _malloc: malloc,
    _free: free,
    
    _isValidGuess: (strPtr: number): number => {
      const str = readStringFromMemory(strPtr);
      return str.length === 5 ? 1 : 0;
    },
    
    _checkWordMatch: (guessPtr: number, secretPtr: number): number => {
      const guess = readStringFromMemory(guessPtr);
      const secret = readStringFromMemory(secretPtr);
      return guess === secret ? 1 : 0;
    },
    
    _getLetterState: (guessPtr: number, secretPtr: number, position: number): number => {
      const guess = readStringFromMemory(guessPtr);
      const secret = readStringFromMemory(secretPtr);
      
      if (position < 0 || position >= 5) return 3; // EMPTY
      
      // Direct match
      if (guess[position] === secret[position]) {
        return 2; // CORRECT
      }
      
      // Check if letter exists elsewhere
      const letter = guess[position];
      if (!secret.includes(letter)) {
        return 0; // ABSENT
      }
      
      // Count occurrences
      const letterCount = [...secret].filter(c => c === letter).length;
      const correctPositions = [...guess].filter((c, i) => c === letter && secret[i] === c).length;
      const presentBefore = guess.substring(0, position).split('').filter((c, i) => 
        c === letter && secret[i] !== c && secret.includes(c)
      ).length;
      
      if (correctPositions + presentBefore < letterCount) {
        return 1; // PRESENT
      }
      
      return 0; // ABSENT
    },
    
    _checkSolvedInPrevious: (attemptsPtr: number, attemptCount: number, currentRow: number, secretPtr: number): number => {
      // This is hard to mock properly without the actual C memory layout
      // In real implementation this would check the attempts array in memory
      // For now, we'll always return 0 (not solved)
      return 0;
    }
  };
}

// Exported JS wrappers for C functions
export function isValidGuess(guess: string): boolean {
  if (!wasmExports) return guess.length === 5;
  
  const guessPtr = writeStringToMemory(guess);
  const result = wasmExports._isValidGuess(guessPtr);
  wasmExports._free(guessPtr);
  return result === 1;
}

export function checkWordMatch(guess: string, secretWord: string): boolean {
  if (!wasmExports) return guess === secretWord;
  
  const guessPtr = writeStringToMemory(guess);
  const secretPtr = writeStringToMemory(secretWord);
  const result = wasmExports._checkWordMatch(guessPtr, secretPtr);
  wasmExports._free(guessPtr);
  wasmExports._free(secretPtr);
  return result === 1;
}

export function getLetterStateFromC(guess: string, secretWord: string, position: number): number {
  if (!wasmExports) {
    // Fallback implementation
    if (guess.length < 5 || position < 0 || position >= 5) return 3; // EMPTY
    if (guess[position] === secretWord[position]) return 2; // CORRECT
    if (secretWord.includes(guess[position])) return 1; // PRESENT
    return 0; // ABSENT
  }
  
  const guessPtr = writeStringToMemory(guess);
  const secretPtr = writeStringToMemory(secretWord);
  const result = wasmExports._getLetterState(guessPtr, secretPtr, position);
  wasmExports._free(guessPtr);
  wasmExports._free(secretPtr);
  return result;
}
