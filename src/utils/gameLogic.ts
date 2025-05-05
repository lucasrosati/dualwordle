
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

// Function to generate two words using Gemini API
export async function generateWordsWithGemini(apiKey: string): Promise<{word1: string, word2: string}> {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
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
                text: `Gere duas palavras em português de 5 letras diferentes uma da outra para um jogo tipo Termo (Wordle). As palavras devem ser comuns, apenas com letras sem acentos, e não relacionadas entre si. Essas palavras serão usadas como solução para um jogo. Retorne apenas as duas palavras, separadas por vírgula, em minúsculas, sem explicação ou texto adicional. Por exemplo: "teste,mundo"`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 20
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    let result = data.candidates[0].content.parts[0].text.trim().toLowerCase();
    
    // Clean up and extract the two words
    result = result.replace(/[^a-z,]/g, '');
    const words = result.split(',');
    
    if (words.length !== 2 || words[0].length !== 5 || words[1].length !== 5) {
      console.error("Generated words don't meet requirements:", words);
      // Fallback to existing word list
      return {
        word1: getRandomWord(),
        word2: getRandomWord()
      };
    }
    
    return {
      word1: words[0],
      word2: words[1]
    };
  } catch (error) {
    console.error("Error generating words with Gemini:", error);
    // Fallback to existing word list
    return {
      word1: getRandomWord(),
      word2: getRandomWord()
    };
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
    // Clear previous game state from localStorage
    localStorage.removeItem(STORAGE_KEY_GAME);
    
    const words = await generateWordsWithGemini(apiKey);
    
    return {
      secretWord1: words.word1,
      secretWord2: words.word2,
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
  // Clear previous game state from localStorage
  localStorage.removeItem(STORAGE_KEY_GAME);
  
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

// Constants for storage keys
export const STORAGE_KEY_RANKING = 'dueto-ranking';
export const STORAGE_KEY_GAME = 'dueto-game';

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
  // We'll consider any 5-letter word as valid for now since we're using Gemini for word generation
  return guess.length === 5;
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
