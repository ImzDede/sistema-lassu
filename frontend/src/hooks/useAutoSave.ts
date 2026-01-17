import { useState, useEffect } from 'react';

export function useAutoSave(dados: Record<string, any>, tipoFormulario: string) {
  const [status, setStatus] = useState('Salvo');

  useEffect(() => {
    const timer = setTimeout(async () => {
      setStatus('Salvando...');

      // 1. Verifica conexão
      if (navigator.onLine) {
        try {
          // Tenta enviar para o Backend (Rota de Rascunho)
          await fetch('/api/salvar-rascunho', {
            method: 'POST',
            body: JSON.stringify(dados)
          });
          setStatus('Salvo na nuvem');
          
          // Limpa o localStorage para não ficar dados velhos
          localStorage.removeItem(`rascunho_${tipoFormulario}`);
        } catch (error) {
          // Se a API falhar, cai no fallback do localStorage
          salvarLocal(dados, tipoFormulario);
        }
      } else {
        // Sem internet
        salvarLocal(dados, tipoFormulario);
      }
    }, 2000); // Debounce de 2 segundos após o usuário parar de digitar

    return () => clearTimeout(timer);
  }, [dados]);

  const salvarLocal = (data: Record<string, any>, key: string) => {
    localStorage.setItem(`rascunho_${key}`, JSON.stringify(data));
    setStatus('Salvo offline (sem internet)');
  };

  return status;
}