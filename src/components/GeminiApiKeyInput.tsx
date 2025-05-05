
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface GeminiApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
}

export function GeminiApiKeyInput({ onApiKeySet }: GeminiApiKeyInputProps) {
  const [apiKey, setApiKey] = useState<string>('AIzaSyBAbz8yRrJM8w4nOq0B73yWBEacjwMGXSY');
  const { toast } = useToast();
  
  // Apply API key on component mount
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('gemini-api-key', apiKey);
      onApiKeySet(apiKey);
    }
  }, [apiKey, onApiKeySet]);
  
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
        A chave de API do Gemini já está configurada. Caso deseje usar outra chave, você pode alterá-la abaixo.
      </p>
      <div className="flex gap-2">
        <Input
          type="password"
          placeholder="Chave de API do Gemini"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSaveApiKey}>Salvar</Button>
      </div>
    </div>
  );
}
