

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { useAppContext } from '../contexts/AppContext';
import { DocumentForAnalysis, Proof, AiAnalysisContent, AiDocumentType, AiKeyInfo, ALLOWED_PROOF_FILE_TYPES, AiActionLogEntry, DownPaymentEntry, ConstructionProgressEntry, CaixaFinancingInstallment } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';
import Section from './ui/Section';
import PageActions from './ui/PageActions';
import EmptyState from './ui/EmptyState'; 
import Input from './ui/Input'; 
import { sanitizeFilename, formatDateForFilename } from '../utils/stringUtils';
import { generatePdfFromElement } from '../utils/generatePdf';
import { convertToCSV, downloadFile, ColumnDefinition } from '../utils/exportUtils'; 

// Placeholder icons
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573 3.007-9.963 7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 10.5h.008v.008h-.008V10.5z" /></svg>;
const MagnifyingGlassPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mx-auto"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TableIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5V7.5M15.75 19.5V7.5m0 12a1.125 1.125 0 001.125-1.125M15.75 19.5h1.125c.621 0 1.125-.504 1.125-1.125V8.625c0-.621-.504-1.125-1.125-1.125H3.375M3.375 8.625V18.375c0 .621.504 1.125 1.125 1.125h10.125M3.375 8.625c0-.621.504-1.125 1.125-1.125h13.5c.621 0 1.125.504 1.125 1.125v1.125c0 .621-.504 1.125-1.125 1.125h-13.5M3.375 4.5h17.25M3.375 4.5V3.375c0-.621.504-1.125 1.125-1.125h13.5C18.996 2.25 19.5 2.754 19.5 3.375V4.5M8.25 15h7.5M8.25 12h7.5M8.25 9h7.5M3.375 7.5h17.25" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CancelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5" /></svg>;


interface GenerateNameResult {
  newName: string | null;
  typeOfIMName: 'imBoleto' | 'imComprovante' | 'imOutro' | null;
}

interface EditableDocFields {
    newNameSuggestion: string;
    documentType: AiDocumentType;
    summary: string;
    keyInfo: AiKeyInfo;
}

const AI_ANALYSIS_CONTENT_ID = "ai-analysis-print-content";
const AI_LOG_ID = "ai-log-content";


const AiAnalysisScreen: React.FC = () => {
  const { state, dispatch, addNotification } = useAppContext(); 
  const [documents, setDocuments] = useState<DocumentForAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'valid' | 'missing'>('checking');
  const [isPrinting, setIsPrinting] = useState(false);
  const [currentProcessingMessage, setCurrentProcessingMessage] = useState<string>('');
  const analysisCancelledRef = useRef<boolean>(false);

  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editableFields, setEditableFields] = useState<Partial<EditableDocFields>>({});

  const [filterTextAI, setFilterTextAI] = useState('');
  const [filterStatusAI, setFilterStatusAI] = useState<DocumentForAnalysis['analysisStatus'] | ''>('');
  const [filterUserCategoryAI, setFilterUserCategoryAI] = useState('');
  const [filterSourceTypeAI, setFilterSourceTypeAI] = useState('');

  const aiModelInstance = useRef<GoogleGenAI | null>(null);


  useEffect(() => {
    if (typeof process.env.API_KEY === 'string' && process.env.API_KEY.length > 0) {
      setApiKeyStatus('valid');
      aiModelInstance.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
      setApiKeyStatus('missing');
      aiModelInstance.current = null;
    }
  }, []);

  const gatherAllProofs = useCallback(() => {
    const allProofs: DocumentForAnalysis[] = [];
    
    const addProofs = (entries: any[], type: string, typeLabel: string) => {
      entries.forEach((entry, entryIndex) => { 
        if (entry.proofs && entry.proofs.length > 0) {
          entry.proofs.forEach((proof: Proof, proofIndex: number) => {
            const existingDoc = documents.find(d => 
                d.sourceEntryId === entry.id && 
                d.sourceEntryType === typeLabel &&
                d.proof.name === proof.name 
            );

            if (proof.dataUrl && ALLOWED_PROOF_FILE_TYPES.includes(proof.type)) {
                 allProofs.push({
                    id: `${typeLabel.replace(/\s+/g, '')}-${entry.id}-proof-${proofIndex}`, 
                    sourceEntryId: entry.id,
                    sourceEntryType: typeLabel, 
                    sourceEntryDescription: entry.description || new Date(entry.date || entry.paymentDate || Date.now()).toLocaleDateString('pt-BR'),
                    proof: { ...proof }, 
                    analysisStatus: existingDoc?.analysisStatus || 'pending',
                    analysisResult: existingDoc?.analysisResult,
                    errorMessage: existingDoc?.errorMessage,
                    newNameSuggestion: existingDoc?.newNameSuggestion,
                    userAssignedCategory: existingDoc?.userAssignedCategory, 
                    isUserCancelled: existingDoc?.isUserCancelled,
                  });
            }
          });
        }
      });
    };

    addProofs(state.downPaymentEntries, 'F/Entrada', 'F/Entrada');
    addProofs(state.constructionProgressEntries, 'EvoluçãoObra', 'Evolução da Obra');
    addProofs(state.caixaFinancingInstallments, 'FinanciamentoCaixa', 'Financiamento Caixa');
    
    setDocuments(prevDocs => {
        return allProofs.map(newDoc => {
            const oldDoc = prevDocs.find(pd => pd.id === newDoc.id);
            if (oldDoc) {
                const updatedDoc: DocumentForAnalysis = {
                    id: newDoc.id, // from newDoc
                    sourceEntryId: newDoc.sourceEntryId,
                    sourceEntryType: newDoc.sourceEntryType,
                    sourceEntryDescription: newDoc.sourceEntryDescription,
                    proof: newDoc.proof, // from newDoc - always take the latest proof
                    
                    // Prioritize analysis fields from oldDoc (true current state)
                    analysisStatus: oldDoc.analysisStatus, 
                    analysisResult: oldDoc.analysisResult,
                    errorMessage: oldDoc.errorMessage,
                    newNameSuggestion: oldDoc.newNameSuggestion,
                    userAssignedCategory: oldDoc.userAssignedCategory,
                    isUserCancelled: oldDoc.isUserCancelled,
                };
                // If a newDoc (from allProofs) has status but oldDoc (from prevDocs) doesn't,
                // it means this is the first time it's being "seen" by this specific updater call,
                // but newDoc was already prepared by addProofs.
                // However, if oldDoc.analysisStatus is undefined/null, it means it's genuinely new or reset.
                // The newDoc status (from addProofs) would be 'pending' or copied from 'existingDoc'.
                // It's safer to trust oldDoc's status if it exists.
                if (!oldDoc.analysisStatus) {
                    updatedDoc.analysisStatus = newDoc.analysisStatus || 'pending';
                }

                return updatedDoc;
            }
            // If not in prevDocs, it's a new item for the documents list.
            // newDoc from allProofs is already shaped by addProofs.
            return newDoc;
        });
    });
  // Dependencies for gatherAllProofs.
  // `documents` is read by `addProofs` via `existingDoc = documents.find(...)`.
  // This creates a dependency cycle if `gatherAllProofs` is in a `useEffect` that also depends on `documents`.
  // For now, keeping `documents` in the dep array as per the original full file structure,
  // but this is a potential source of infinite loops if not handled carefully in `useEffect`.
  // A more robust solution might involve refactoring how `allProofs` are constructed or how `existingDoc` data is merged.
  }, [state.downPaymentEntries, state.constructionProgressEntries, state.caixaFinancingInstallments, documents]);
  
  // ... rest of the AiAnalysisScreen.tsx component code ...

  // Make sure the component's JSX is returned
  return (
    <div className="space-y-8">
      <PageActions 
        onPrint={async () => { /* TODO: Implement print for AI Analysis */ 
            addNotification('Função de impressão para Análise IA ainda não implementada.', 'info');
        }}
        printButtonText={isPrinting ? "Gerando PDF..." : "Imprimir Análise IA"}
        showGoToHomeButton={true}
        isPrinting={isPrinting}
      />

      {apiKeyStatus === 'missing' && (
        <Card title="Chave de API da Gemini Não Configurada" className="border-l-4 border-red-500">
          <p className="text-red-700">
            A chave de API do Google Gemini não foi encontrada nas variáveis de ambiente (<code>process.env.API_KEY</code>).
            A funcionalidade de análise por IA não estará disponível até que a chave seja configurada corretamente.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Por favor, certifique-se de que a variável <code>API_KEY</code> está definida no ambiente onde esta aplicação está rodando.
            Esta aplicação NÃO solicitará a chave de API diretamente.
          </p>
        </Card>
      )}

      {/* Other sections like Controls, Document List, AI Log will go here */}
      <Section title="Controles de Análise IA" className="print:hidden">
        <Card>
            {/* TODO: Add controls for starting/stopping analysis */}
            <p className="text-gray-600">Controles para iniciar e gerenciar a análise de documentos aparecerão aqui.</p>
             <Button 
                onClick={() => { /* TODO: Implement startAnalysis */ addNotification('Iniciar Análise - Placeholder', 'info'); }}
                variant="primary" 
                size="lg"
                disabled={isAnalyzing || apiKeyStatus !== 'valid' || documents.filter(d => d.analysisStatus === 'pending').length === 0}
                className="flex items-center"
            >
                <SparklesIcon /> {isAnalyzing ? `Analisando... (${overallProgress.toFixed(0)}%)` : `Iniciar Análise de ${documents.filter(d=>d.analysisStatus === 'pending').length} Documentos`}
            </Button>
            {isAnalyzing && (
                 <Button 
                    onClick={() => { /* TODO: Implement cancelAnalysis */ addNotification('Cancelar Análise - Placeholder', 'info'); }}
                    variant="danger" 
                    size="md"
                    className="ml-4 flex items-center"
                >
                    <StopIcon /> Cancelar Análise
                </Button>
            )}
            <p className="text-sm text-gray-500 mt-2">{currentProcessingMessage}</p>
        </Card>
      </Section>

       <Section title="Documentos para Análise">
        {/* TODO: Add filters for documents */}
        {documents.length === 0 ? (
          <EmptyState 
            icon={<MagnifyingGlassPlusIcon />}
            title="Nenhum Documento Encontrado"
            message="Não há comprovantes anexados nas seções F/Entrada, Evolução de Obra ou Financiamento Caixa, ou os arquivos não são suportados para análise."
          />
        ) : (
          <Card className="overflow-x-auto card-print-styling">
            <div className="min-w-full">
                 {/* TODO: Render actual document list table here */}
                 <p className="p-4 text-gray-500">A lista de documentos para análise aparecerá aqui.</p>
                 <table className="min-w-full divide-y divide-gray-200">
                    {/* Table headers and rows */}
                 </table>
            </div>
          </Card>
        )}
      </Section>
      
      <Section title="Log de Ações da IA" id={AI_LOG_ID} className="print:hidden">
        <Card>
          {state.aiActionLog.length === 0 ? (
            <p className="text-gray-500">Nenhuma ação da IA registrada ainda.</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {state.aiActionLog.map(log => (
                <li key={log.id} className="text-sm p-2 bg-gray-50 rounded">
                  <span className="font-semibold text-primary">
                    [{new Date(log.timestamp).toLocaleTimeString('pt-BR')}]:
                  </span>{' '}
                  {log.summary}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Section>

    </div>
  );
};

export default AiAnalysisScreen;
