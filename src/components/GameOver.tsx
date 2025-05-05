
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface GameOverProps {
  message: string;
  onRestart: () => void;
  onSaveScore: (name: string) => void;
  secretWord1: string;
  secretWord2: string;
  attempts: number;
  wordSolved1: boolean;
  wordSolved2: boolean;
}

export function GameOver({ 
  message, 
  onRestart, 
  onSaveScore,
  secretWord1,
  secretWord2,
  attempts,
  wordSolved1,
  wordSolved2
}: GameOverProps) {
  const [name, setName] = React.useState('');
  const acertosCount = (wordSolved1 ? 1 : 0) + (wordSolved2 ? 1 : 0);

  const handleSaveScore = () => {
    if (name.trim() !== '') {
      onSaveScore(name);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Jogo finalizado!</h2>
        <p className="mb-4">{message}</p>
        
        <div className="mb-4">
          <p><strong>Palavra 1:</strong> {secretWord1.toUpperCase()} {wordSolved1 ? '✓' : '✗'}</p>
          <p><strong>Palavra 2:</strong> {secretWord2.toUpperCase()} {wordSolved2 ? '✓' : '✗'}</p>
          <p><strong>Tentativas:</strong> {attempts}</p>
          <p><strong>Acertos:</strong> {acertosCount}</p>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSaveScore} disabled={name.trim() === ''}>
              Salvar
            </Button>
          </div>
          
          <Button onClick={onRestart} className="w-full">
            Jogar novamente
          </Button>
        </div>
      </div>
    </div>
  );
}
