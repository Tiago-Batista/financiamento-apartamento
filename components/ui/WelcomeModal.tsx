

import React, { useState, useEffect } from 'react';
import Button from './Button';
import { WELCOME_MODAL_DISMISSED_KEY } from '../../types';
import { Link } from 'react-router-dom';

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

const WelcomeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(WELCOME_MODAL_DISMISSED_KEY);
    if (!dismissed) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(WELCOME_MODAL_DISMISSED_KEY, 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 print:hidden"
      onClick={handleClose} // Close on backdrop click
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()} // Prevent close on modal content click
      >
        <button
          onClick={handleClose}
          aria-label="Fechar Boas-Vindas"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <CloseIcon />
        </button>

        <h2 id="welcome-modal-title" className="text-2xl font-bold text-primary mb-4">
          Bem-vindo ao Gerenciador de Financiamento!
        </h2>
        <div className="space-y-3 text-gray-700 text-sm">
          <p>
            Este aplicativo foi projetado para ajudá-lo a organizar e acompanhar todos os detalhes financeiros da aquisição do seu imóvel.
          </p>
          <p>
            <strong>Principais Funcionalidades:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>
              <strong>Dashboard:</strong> Configure valores globais (valor do imóvel, subsídios, etc.) e veja um resumo financeiro. <Link to="/dashboard" className="text-primary hover:underline" onClick={handleClose}>Ir para Dashboard</Link>
            </li>
            <li>
              <strong>F/Entrada, Evolução da Obra, Financiamento Caixa:</strong> Registre pagamentos detalhados para cada etapa, anexe comprovantes e categorize suas despesas.
            </li>
            <li>
              <strong>Análise de Documentos (IA):</strong> Utilize inteligência artificial para analisar seus comprovantes, extrair informações e sugerir nomes padronizados. <Link to="/ai-analysis" className="text-primary hover:underline" onClick={handleClose}>Experimentar Análise IA</Link>
            </li>
            <li>
              <strong>Relatórios e Exportação:</strong> Gere PDFs e exporte dados em CSV para seus registros.
            </li>
            <li>
              <strong>Orçamentos:</strong> Defina orçamentos mensais por categoria e acompanhe seus gastos.
            </li>
          </ul>
          <p>
            <strong>Dicas para Começar:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Comece configurando os valores no <Link to="/dashboard" className="text-primary hover:underline" onClick={handleClose}>Dashboard</Link>.</li>
            <li>Adicione suas categorias personalizadas na seção "Gerenciar Categorias" do Dashboard.</li>
            <li>Explore a seção de "Análise de Documentos" para ver como a IA pode ajudar a organizar seus comprovantes.</li>
          </ul>
          <p>
            Esperamos que esta ferramenta seja útil! Seus dados são salvos localmente no seu navegador.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="dontShowAgain" className="ml-2 block text-sm text-gray-700">
              Não mostrar esta mensagem novamente
            </label>
          </div>
          <Button onClick={handleClose} variant="primary" className="w-full">
            Entendido, começar a usar!
          </Button>
        </div>
        {/* The <style jsx> block has been removed to fix the type error.
            Ensure that 'animate-scaleUp' is defined in your Tailwind config or global CSS.
            Example for tailwind.config.js if it's a custom animation:
            theme: {
              extend: {
                keyframes: {
                  scaleUp: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                  }
                },
                animation: {
                  scaleUp: 'scaleUp 0.3s ease-out forwards',
                }
              }
            }
        */}
      </div>
    </div>
  );
};

export default WelcomeModal;