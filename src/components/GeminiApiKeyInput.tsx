
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface GeminiApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
}

export function GeminiApiKeyInput({ onApiKeySet }: GeminiApiKeyInputProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const { toast } = useToast();
  
  // Check if API key is stored in localStorage
  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      onApiKeySet(storedApiKey);
    }
  }, [onApiKeySet]);
  
  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma chave de API válida",
        variant: "destructive"
      });
      return;
    }
    
    localStorage.setItem('gemini-api-key', apiKey);
    onApiKeySet(apiKey);
    
    toast({
      title: "Sucesso",
      description: "Chave da API do Gemini salva com sucesso",
    });
  };
  
  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-bold text-white">Configurar API do Gemini</h3>
      <p className="text-gray-300 text-sm">
        Para gerar palavras com o Gemini, é necessário fornecer uma chave de API do Google.
        Obtenha uma chave em: <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">ai.google.dev</a>
      </p>
      <div className="flex gap-2">
        <Input
          type="password"
          placeholder="Cole sua chave de API do Gemini aqui"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSaveApiKey}>Salvar</Button>
      </div>
    </div>
  );
}
