
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>;
const PrinterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0A42.305 42.305 0 0012 20.499A42.305 42.305 0 006.34 18m11.32 0a48.03 48.03 0 01-10.94 0M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7C14.453 4.546 13.232 4.5 12 4.5c-1.232 0-2.453.046-3.662.138a4.006 4.006 0 00-3.7 3.7C4.546 9.547 4.5 10.768 4.5 12c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7c1.209.092 2.43.138 3.662.138 1.232 0 2.453-.046 3.662-.138a4.006 4.006 0 003.7-3.7c.092-1.209.138-2.43.138-3.662z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.955 8.955M4.5 12.75l.75-7.5A2.25 2.25 0 017.5 3h9a2.25 2.25 0 012.25 2.25l.75 7.5M4.5 12.75V21a2.25 2.25 0 002.25 2.25h10.5A2.25 2.25 0 0019.5 21V12.75M8.25 21h7.5" /></svg>;


interface PageActionsProps {
  onPrint: () => void;
  printButtonText?: string;
  showGoToHomeButton?: boolean;
  containerClassName?: string;
  isPrinting?: boolean;
}

const PageActions: React.FC<PageActionsProps> = ({ 
  onPrint, 
  printButtonText = "Imprimir Relatório", 
  showGoToHomeButton, 
  containerClassName,
  isPrinting = false
}) => {
  const navigate = useNavigate();

  return (
    <div className={`mb-6 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 print:hidden ${containerClassName || ''}`}>
      <Button 
        onClick={() => navigate(-1)} 
        variant="secondary" 
        size="md" 
        aria-label="Voltar para a página anterior"
        className="w-full sm:w-auto flex-grow sm:flex-grow-0"
        disabled={isPrinting}
      >
        <ArrowLeftIcon />
        Voltar
      </Button>
      {showGoToHomeButton && (
        <Button 
          onClick={() => navigate('/home')} 
          variant="secondary" 
          size="md" 
          aria-label="Voltar para o Início"
          className="w-full sm:w-auto flex-grow sm:flex-grow-0"
          disabled={isPrinting}
        >
          <HomeIcon />
          Voltar para o Início
        </Button>
      )}
      <Button 
        onClick={onPrint} 
        variant="success" // Changed from primary to success
        size="md" 
        aria-label={printButtonText}
        className="w-full sm:w-auto flex-grow sm:flex-grow-0"
        disabled={isPrinting}
      >
        <PrinterIcon />
        {isPrinting ? "Gerando PDF..." : printButtonText}
      </Button>
    </div>
  );
};

export default PageActions;
