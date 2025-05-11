// src/pages/index.tsx

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { GameBoard } from '@/components/GameBoard';
import { Keyboard } from '@/components/Keyboard';
import { RankingTable } from '@/components/RankingTable';
import { GameOver } from '@/components/GameOver';
import { GeminiApiKeyInput } from '@/components/GeminiApiKeyInput';
import {
  initializeGame,
  initializeGameWithGemini,
  updateGameState,
  isValidGuess,
  GameState,
  RankingEntry,
  mergeSort,
  STORAGE_KEY_RANKING,
  STORAGE_KEY_GAME,
} from '@/utils/gameLogic';
import { initWasm } from '@/utils/wasmLoader';

const Index: React.FC = () => {
  /* ------------------------------------------------------------------ */
  /*  States                                                            */
  /* ------------------------------------------------------------------ */
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [showRanking, setShowRanking] = useState(() => window.location.hash === '#ranking');
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(
    'AIzaSyBAbz8yRrJM8w4nOq0B73yWBEacjwMGXSY',
  );
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  /* ------------------------------------------------------------------ */
  /*  Load WASM once on mount                                           */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    initWasm().then((ok) => {
      if (!ok) console.warn('⚠️  WASM mock em uso – sem feedback de cores.');
    });
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Initialize game (or restore)                                      */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const loadGame = async () => {
      setIsLoading(true);
      try {
        /* Restora ranking, se existir */
        const savedRanking = localStorage.getItem(STORAGE_KEY_RANKING);
        if (savedRanking) setRanking(JSON.parse(savedRanking));

        /* Inicia jogo */
        if (geminiApiKey) {
          const g = await initializeGameWithGemini(geminiApiKey);
          setGameState(g);
        } else {
          setGameState(initializeGame());
        }
      } catch (err) {
        console.error('Erro ao carregar o jogo:', err);
        setGameState(initializeGame());
      } finally {
        setIsLoading(false);
      }
    };

    loadGame();
  }, [geminiApiKey]);

  /* ------------------------------------------------------------------ */
  /*  Persist gameState                                                 */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (gameState) {
      localStorage.setItem(STORAGE_KEY_GAME, JSON.stringify(gameState));
    }
  }, [gameState]);

  /* ------------------------------------------------------------------ */
  /*  Handlers                                                          */
  /* ------------------------------------------------------------------ */
  const handleKeyPress = (key: string) => {
    if (!gameState || gameState.gameOver) return;

    if (key === 'ENTER') {
      if (gameState.currentGuess.length !== 5) {
        toast({
          title: 'Palavra muito curta',
          description: 'Digite uma palavra de 5 letras',
          variant: 'destructive',
        });
        return;
      }
      if (!isValidGuess(gameState.currentGuess)) {
        toast({
          title: 'Palavra inválida',
          description: 'Esta palavra não está no dicionário do jogo',
          variant: 'destructive',
        });
        return;
      }
      setGameState(updateGameState(gameState, gameState.currentGuess));
    } else if (key === 'BACKSPACE') {
      setGameState({ ...gameState, currentGuess: gameState.currentGuess.slice(0, -1) });
    } else if (/^[a-z]$/.test(key) && gameState.currentGuess.length < 5) {
      setGameState({ ...gameState, currentGuess: gameState.currentGuess + key });
    }
  };

  const handleRestart = async () => {
    setIsLoading(true);
    try {
      if (geminiApiKey) {
        setGameState(await initializeGameWithGemini(geminiApiKey));
      } else {
        setGameState(initializeGame());
      }
    } catch (err) {
      console.error('Erro ao reiniciar:', err);
      setGameState(initializeGame());
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveScore = (name: string) => {
    if (!gameState) return;
    const acertos = (gameState.wordSolved1 ? 1 : 0) + (gameState.wordSolved2 ? 1 : 0);
    const newRanking = [...ranking, { name, attempts: gameState.currentRow, acertos }];
    const sorted = mergeSort(newRanking);
    setRanking(sorted);
    localStorage.setItem(STORAGE_KEY_RANKING, JSON.stringify(sorted));
    handleRestart();
    toast({ title: 'Pontuação salva!', description: 'Seu resultado foi adicionado ao ranking' });
  };

  const handleClearRanking = () => {
    setRanking([]);
    localStorage.removeItem(STORAGE_KEY_RANKING);
    toast({ title: 'Ranking limpo', description: 'O ranking foi resetado com sucesso' });
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="container mx-auto px-4 py-8 text-white">
        <h1 className="text-4xl font-bold mb-8 text-center">DUETO</h1>
        <GeminiApiKeyInput onApiKeySet={setGeminiApiKey} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <h1 className="text-4xl font-bold mb-8 text-center">DUETO</h1>

      {/* Toggle buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <button onClick={() => setShowRanking(false)} className={`px-4 py-2 rounded ${!showRanking ? 'bg-white text-black' : 'bg-gray-700'}`}>
          Jogo
        </button>
        <button onClick={() => setShowRanking(true)} className={`px-4 py-2 rounded ${showRanking ? 'bg-white text-black' : 'bg-gray-700'}`}>
          Ranking
        </button>
      </div>

      {showRanking ? (
        <>
          <RankingTable ranking={ranking} />
          <div className="flex justify-center mt-4">
            <button onClick={handleClearRanking} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
              Limpar Ranking
            </button>
          </div>
        </>
      ) : (
        <>
          <GameBoard
            attempts={gameState.attempts}
            currentGuess={gameState.currentGuess}
            currentRow={gameState.currentRow}
            secretWord1={gameState.secretWord1}
            secretWord2={gameState.secretWord2}
            wordSolved1={gameState.wordSolved1}
            wordSolved2={gameState.wordSolved2}
          />
          <div className="mt-8 text-center">
            <p>
              {gameState.wordSolved1 ? '✓' : '❓'} Palavra 1 | Palavra 2 {gameState.wordSolved2 ? '✓' : '❓'}
            </p>
          </div>
          <Keyboard onKeyPress={handleKeyPress} keyboardStates={gameState.keyboardStates} />
        </>
      )}

{gameState.gameOver && (
        <GameOver
          message={gameState.message}
          onRestart={handleRestart}
          onSaveScore={handleSaveScore}
          secretWord1={gameState.secretWord1}
          secretWord2={gameState.secretWord2}
          attempts={gameState.currentRow}
          wordSolved1={gameState.wordSolved1}
          wordSolved2={gameState.wordSolved2}
        />
      )}
    </div>
  );
};

export default Index;
