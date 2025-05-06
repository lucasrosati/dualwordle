/* ================== WASM LOADER =================== */

import engineWasmUrl from '@/wasm/engine.wasm?url';   // URL pública do .wasm

let wasmLoaded = false;
let wasmMem: WebAssembly.Memory | null = null;

interface CExports {
  _isValidGuess: (g: string) => number;
  _checkWordMatch: (g: string, s: string) => number;
  _getLetterState: (g: string, s: string, i: number) => number;
  _checkSolvedInPrevious: (ptrArr: number, len: number, row: number, s: string) => number;
  _malloc: (n: number) => number;
  _free: (p: number) => void;
}
let wasm: CExports | null = null;

/* helper – escreve string no heap (usado só para checkSolvedInPrevious) */
function writeStr(str: string): number {
  if (!wasm || !wasmMem) return 0;
  const bytes = new TextEncoder().encode(str + '\0');
  const ptr   = wasm._malloc(bytes.length);
  new Uint8Array(wasmMem.buffer).set(bytes, ptr);
  return ptr;
}

/* ------------ loader ------------ */
export async function initWasm(): Promise<boolean> {
  if (wasmLoaded) return true;

  try {
    const mod      = await import('@/wasm/engine.js');
    const factory: any = typeof mod === 'function' ? mod : (mod as any).default;

    if (typeof factory !== 'function') {
      throw new Error('engine.js não contém factory – verifique flags emcc');
    }

    const Module: any = await factory({
      locateFile: () => engineWasmUrl,        // aponta engine.wasm
    });

    wasmMem = Module.wasmMemory ?? (Module.HEAP8 && Module.HEAP8.buffer);
    wasm = {
      _isValidGuess:          Module.cwrap('isValidGuess', 'number', ['string']),
      _checkWordMatch:        Module.cwrap('checkWordMatch', 'number', ['string','string']),
      _getLetterState:        Module.cwrap('getLetterState', 'number', ['string','string','number']),
      _checkSolvedInPrevious: Module.cwrap('checkSolvedInPrevious','number',['string','number','number','string']),
      _malloc:                Module._malloc,
      _free:                  Module._free,
    };

    wasmLoaded = true;
    console.log('✅ WASM real carregado');
    return true;
  } catch (err) {
    console.error('❌ Falha ao carregar WASM – usando mock.', err);
    return false;
  }
}

/* ------------ wrappers JS → C ------------ */
export function isValidGuess(guess: string): boolean {
  if (!wasm) return guess.length === 5;           // fallback
  return wasm._isValidGuess(guess) === 1;
}

export function checkWordMatch(guess: string, secret: string): boolean {
  if (!wasm) return guess === secret;
  return wasm._checkWordMatch(guess, secret) === 1;
}

export function getLetterStateFromC(guess: string, secret: string, idx: number): number {
  if (!wasm) return 3;                            // EMPTY
  return wasm._getLetterState(guess, secret, idx);
}

export function checkSolvedInPrevious(attempts: string[], row: number, secret: string): boolean {
  if (!wasm) return false;
  const ptrArr = writeStr(attempts.join(','));
  const ok     = wasm._checkSolvedInPrevious(ptrArr, attempts.length, row, secret);
  wasm._free(ptrArr);
  return ok === 1;
}
