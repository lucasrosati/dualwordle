// src/utils/wasm.ts
export const loadWasm = async () => {
    const Module = await import('../../static/engine.js');
    return {
      isValidGuess: Module.cwrap("isValidGuess", "number", ["string"]),
      checkWordMatch: Module.cwrap("checkWordMatch", "number", ["string", "string"]),
      getLetterState: Module.cwrap("getLetterState", "number", ["string", "string", "number"]),
      checkSolvedInPrevious: Module.cwrap("checkSolvedInPrevious", "number", ["string", "number", "number", "string"]),
      addPlayer: Module.cwrap("add_player", null, ["string", "number"]),
      getRanking: Module.cwrap("get_ranking", "string", []),
      clearRanking: Module.cwrap("clear_ranking", null, [])
    };
  };
  