
// Word database from the original C code
const WORD_LIST = [
  "claro", "fases", "gesto", "jovem", "lugar", "mente", "noite", "papel", "reino", "senso",
  "texto", "unido", "vasto", "lenda", "doido", "carro", "sabor", "trato", "suave", "mover",
  "crepe", "risos", "gruta", "fusao", "salva", "feito", "gemer", "limpo", "macio", "curvo",
  "pomba", "quase", "tonal", "russo", "duras", "posse", "bravo", "esqui", "usina", "pilar",
  "baixo", "disco", "longo", "bocal", "moral", "altar", "breve", "troca", "sutil", "pobre",
  "densa", "costa", "pesca", "antes", "fruta", "livro", "bagre", "bruto", "ficha", "nuvem",
  "viver", "grama", "nevar", "floco", "forma", "gesso", "rezar", "jaula", "lotar", "nervo",
  "obeso", "patio", "quilo", "renda", "sorte", "terra", "ursos", "visto", "troco", "rapaz",
  "leite", "prova", "quota", "risco", "sinal", "temor", "trigo", "bolso", "cedro", "farto",
  "golpe", "haste", "imune", "janta", "luzir", "manha", "noiva", "haver", "pente", "dente",
  "sopro"
];

export type LetterState = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';

export interface LetterTile {
  letter: string;
  state1: LetterState;
  state2: LetterState;
}

export interface GameState {
  secretWord1: string;
  secretWord2: string;
  currentGuess: string;
  attempts: string[];
  currentRow: number;
  gameOver: boolean;
  wordSolved1: boolean;
  wordSolved2: boolean;
  message: string;
  keyboardStates: Record<string, LetterState>;
}

export interface RankingEntry {
  name: string;
  attempts: number;
  acertos: number;
}

// Function to generate words using Gemini API
export async function generateWordWithGemini(apiKey: string, exclude?: string): Promise<string> {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Generate one random 5-letter Portuguese word. The word should be common, valid for word games, and contain exactly 5 letters. Return ONLY the word in lowercase, with no explanation or additional text. ${exclude ? `The word cannot be "${exclude}".` : ''}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 100
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    let word = data.candidates[0].content.parts[0].text.trim().toLowerCase();
    
    // Clean up the response to ensure it's a valid 5-letter word
    word = word.replace(/[^a-z]/g, '');
    
    if (word.length !== 5) {
      console.error("Generated word doesn't have 5 letters:", word);
      // Fallback to existing word list
      return getRandomWord(exclude);
    }
    
    return word;
  } catch (error) {
    console.error("Error generating word with Gemini:", error);
    // Fallback to existing word list
    return getRandomWord(exclude);
  }
}

export function getRandomWord(exclude?: string): string {
  let word;
  do {
    word = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
  } while (exclude && word === exclude);
  return word;
}

export async function initializeGameWithGemini(apiKey: string): Promise<GameState> {
  try {
    const secretWord1 = await generateWordWithGemini(apiKey);
    const secretWord2 = await generateWordWithGemini(apiKey, secretWord1);
    
    return {
      secretWord1,
      secretWord2,
      currentGuess: '',
      attempts: [],
      currentRow: 0,
      gameOver: false,
      wordSolved1: false,
      wordSolved2: false,
      message: '',
      keyboardStates: {},
    };
  } catch (error) {
    console.error("Error initializing game with Gemini:", error);
    // Fallback to standard initialization
    return initializeGame();
  }
}

export function initializeGame(): GameState {
  const secretWord1 = getRandomWord();
  const secretWord2 = getRandomWord(secretWord1);
  
  return {
    secretWord1,
    secretWord2,
    currentGuess: '',
    attempts: [],
    currentRow: 0,
    gameOver: false,
    wordSolved1: false,
    wordSolved2: false,
    message: '',
    keyboardStates: {},
  };
}

export function checkGuess(guess: string, secretWord: string): LetterState[] {
  const result: LetterState[] = Array(5).fill('absent');
  const secretLetters = secretWord.split('');
  
  // First pass: check for correct positions
  for (let i = 0; i < 5; i++) {
    if (guess[i] === secretWord[i]) {
      result[i] = 'correct';
      secretLetters[i] = '#'; // Mark as used
    }
  }
  
  // Second pass: check for present letters
  for (let i = 0; i < 5; i++) {
    if (result[i] !== 'correct') {
      const index = secretLetters.indexOf(guess[i]);
      if (index !== -1) {
        result[i] = 'present';
        secretLetters[index] = '#'; // Mark as used
      }
    }
  }
  
  return result;
}

export function updateGameState(state: GameState, guess: string): GameState {
  const newState = { ...state };
  
  // Add guess to attempts
  newState.attempts = [...newState.attempts, guess];
  newState.currentRow++;
  newState.currentGuess = '';
  
  // Check if the word matches either secret word
  if (guess === state.secretWord1) {
    newState.wordSolved1 = true;
  }
  
  if (guess === state.secretWord2) {
    newState.wordSolved2 = true;
  }
  
  // Update keyboard states
  const states1 = checkGuess(guess, state.secretWord1);
  const states2 = checkGuess(guess, state.secretWord2);
  
  for (let i = 0; i < 5; i++) {
    const letter = guess[i];
    const currentState = newState.keyboardStates[letter] || 'absent';
    
    // Prioritize 'correct' over 'present' over 'absent'
    if (states1[i] === 'correct' || states2[i] === 'correct') {
      newState.keyboardStates[letter] = 'correct';
    } else if ((states1[i] === 'present' || states2[i] === 'present') && currentState !== 'correct') {
      newState.keyboardStates[letter] = 'present';
    } else if (currentState !== 'correct' && currentState !== 'present') {
      newState.keyboardStates[letter] = 'absent';
    }
  }
  
  // Check game over conditions
  if (newState.wordSolved1 && newState.wordSolved2) {
    newState.gameOver = true;
    newState.message = `Parabéns! Você encontrou ambas palavras em ${newState.currentRow} tentativas!`;
  } else if (newState.currentRow >= 6) {
    newState.gameOver = true;
    newState.message = `Game over! As palavras eram "${state.secretWord1}" e "${state.secretWord2}".`;
  }
  
  return newState;
}

export function isValidGuess(guess: string): boolean {
  return guess.length === 5 && WORD_LIST.includes(guess.toLowerCase());
}

export interface RankingEntry {
  name: string;
  attempts: number;
  acertos: number;
}

// For ranking - using merge sort (a more efficient algorithm than insertion sort)
export function mergeSort(arr: RankingEntry[]): RankingEntry[] {
  if (arr.length <= 1) {
    return arr;
  }

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left: RankingEntry[], right: RankingEntry[]): RankingEntry[] {
  let result: RankingEntry[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    // Sort by acertos (descending) first, then by attempts (ascending)
    if (left[leftIndex].acertos > right[rightIndex].acertos) {
      result.push(left[leftIndex]);
      leftIndex++;
    } else if (left[leftIndex].acertos < right[rightIndex].acertos) {
      result.push(right[rightIndex]);
      rightIndex++;
    } else {
      // If acertos are equal, compare attempts
      if (left[leftIndex].attempts <= right[rightIndex].attempts) {
        result.push(left[leftIndex]);
        leftIndex++;
      } else {
        result.push(right[rightIndex]);
        rightIndex++;
      }
    }
  }

  return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
}
