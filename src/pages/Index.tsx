
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
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
  STORAGE_KEY_GAME
} from '@/utils/gameLogic';

const Index = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [activeTab, setActiveTab] = useState('game');
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize game when API key is set
  useEffect(() => {
    const loadGame = async () => {
      setIsLoading(true);
      try {
        // Load saved ranking
        const savedRanking = localStorage.getItem(STORAGE_KEY_RANKING);
        if (savedRanking) {
          setRanking(JSON.parse(savedRanking));
        }
        
        if (geminiApiKey) {
          // Always initialize a new game with Gemini when the component mounts
          const initializedGame = await initializeGameWithGemini(geminiApiKey);
          setGameState(initializedGame);
        } else {
          // Fallback to default initialization
          setGameState(initializeGame());
        }
      } catch (error) {
        console.error("Error loading game:", error);
        // Fallback to default initialization
        setGameState(initializeGame());
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGame();
  }, [geminiApiKey]);

  // Save game state
  useEffect(() => {
    if (gameState) {
      localStorage.setItem(STORAGE_KEY_GAME, JSON.stringify(gameState));
    }
  }, [gameState]);
  
  const handleKeyPress = (key: string) => {
    if (!gameState || gameState.gameOver) return;
    
    if (key === 'ENTER') {
      if (gameState.currentGuess.length !== 5) {
        toast({
          title: "Palavra muito curta",
          description: "Digite uma palavra de 5 letras",
          variant: "destructive"
        });
        return;
      }
      
      if (!isValidGuess(gameState.currentGuess)) {
        toast({
          title: "Palavra inválida",
          description: "Esta palavra não está no dicionário do jogo",
          variant: "destructive"
        });
        return;
      }
      
      setGameState(updateGameState(gameState, gameState.currentGuess));
    } 
    else if (key === 'BACKSPACE') {
      setGameState({
        ...gameState,
        currentGuess: gameState.currentGuess.slice(0, -1)
      });
    } 
    else if (/^[a-z]$/.test(key) && gameState.currentGuess.length < 5) {
      setGameState({
        ...gameState,
        currentGuess: gameState.currentGuess + key
      });
    }
  };
  
  const handleRestart = async () => {
    setIsLoading(true);
    try {
      if (geminiApiKey) {
        const newGame = await initializeGameWithGemini(geminiApiKey);
        setGameState(newGame);
      } else {
        setGameState(initializeGame());
      }
    } catch (error) {
      console.error("Error restarting game:", error);
      setGameState(initializeGame());
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveScore = (name: string) => {
    if (!gameState) return;
    
    const acertos = (gameState.wordSolved1 ? 1 : 0) + (gameState.wordSolved2 ? 1 : 0);
    
    const newRanking = [...ranking, {
      name,
      attempts: gameState.currentRow,
      acertos
    }];
    
    const sortedRanking = mergeSort(newRanking);
    setRanking(sortedRanking);
    localStorage.setItem(STORAGE_KEY_RANKING, JSON.stringify(sortedRanking));
    
    // Reset the game
    handleRestart();
    
    toast({
      title: "Pontuação salva!",
      description: "Seu resultado foi adicionado ao ranking",
    });
  };
  
  const handleClearRanking = () => {
    setRanking([]);
    localStorage.removeItem(STORAGE_KEY_RANKING);
    toast({
      title: "Ranking limpo",
      description: "O ranking foi resetado com sucesso",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">DUETO</h1>
        <GeminiApiKeyInput onApiKeySet={setGeminiApiKey} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-white">DUETO</h1>
      
      <Tabs defaultValue="game" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="game">Jogo</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
        </TabsList>
        
        <TabsContent value="game" className="space-y-4">
          <GameBoard
            attempts={gameState.attempts}
            currentGuess={gameState.currentGuess}
            currentRow={gameState.currentRow}
            secretWord1={gameState.secretWord1}
            secretWord2={gameState.secretWord2}
            wordSolved1={gameState.wordSolved1}
            wordSolved2={gameState.wordSolved2}
          />
          
          <div className="mt-8">
            <p className="text-center mb-4 text-white">
              {gameState.wordSolved1 ? '✓' : '❓'} Palavra 1 | Palavra 2 {gameState.wordSolved2 ? '✓' : '❓'}
            </p>
          </div>
          
          <Keyboard
            onKeyPress={handleKeyPress}
            keyboardStates={gameState.keyboardStates}
          />
        </TabsContent>
        
        <TabsContent value="ranking">
          <RankingTable ranking={ranking} />
          
          <div className="flex justify-center mt-4">
            <button
              onClick={handleClearRanking}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Limpar Ranking
            </button>
          </div>
        </TabsContent>
      </Tabs>
      
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
