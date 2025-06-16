import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ConstructionProgressEntry, Proof, MAX_PROOF_FILE_SIZE_BYTES, ALLOWED_PROOF_FILE_TYPES, MAX_PROOF_FILE_SIZE_MB } from '../types';
import Input from './ui/Input';
import Button from './ui/Button';
import Card from './ui/Card';
import Section from './ui/Section';
import StatCard from './ui/StatCard';
import PageActions from './ui/PageActions';
import { generatePdfFromElement } from '../utils/generatePdf';

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.03 3.22.077m3.22-.077L10.88 5.79m5.32 0L10.88 5.79m0 0H9.25m2.25.375V4.632c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v1.14M9.25 10.5h5.5m-5.5 3h5.5m-5.5 3h5.5M3 7.5h18M3 12h18m-9 9v-9" /></svg>;
const PaperClipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 inline"><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.35 3.43 16.84L2.05 22L7.31 20.63C8.76 21.41 10.37 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 6.46 17.5 2 12.04 2ZM17.46 15.53C17.22 15.89 16.26 16.44 15.9 16.56C15.54 16.68 15.02 16.76 14.35 16.56C13.62 16.34 12.56 15.93 11.34 14.84C9.82 13.46 9.04 11.83 8.83 11.47C8.62 11.11 8.03 10.24 8.03 9.5C8.03 8.78 8.44 8.38 8.66 8.18C8.88 7.98 9.24 7.92 9.51 7.92C9.62 7.92 9.73 7.93 9.83 7.93C10.03 7.93 10.16 7.92 10.31 8.21C10.48 8.52 10.93 9.64 10.99 9.76C11.05 9.88 11.1 10.02 11.01 10.16C10.92 10.3 10.86 10.38 10.71 10.53C10.56 10.68 10.44 10.79 10.31 10.9C10.18 11.01 10.04 11.14 10.21 11.43C10.38 11.72 10.88 12.32 11.48 12.85C12.25 13.54 12.89 13.82 13.15 13.94C13.41 14.06 13.64 14.04 13.81 13.84C14.01 13.61 14.27 13.25 14.46 12.99C14.65 12.73 14.93 12.67 15.21 12.77C15.49 12.87 16.51 13.41 16.75 13.65C16.99 13.89 17.13 14.05 17.19 14.19C17.25 14.33 17.23 14.71 16.99 15.07L17.46 15.53Z" /></svg>;

const CONSTRUCTION_HISTORY_ID = "construction-history-content";
const CONSTRUCTION_MONTHLY_ID = "construction-monthly-content"; // This ID seems to be for a separate printable section, not used by handlePrint
const SECTION_PREFIX = "EVOLUCAO_OBRA_";


interface MonthlyPayment {
  monthYear: string;
  totalPaid: number;
}

const ConstructionProgressScreen: React.FC = () => {
  const { state, dispatch, formatCurrency, getTotalConstructionProgressPaid, saveStateToLocalStorageManually } = useAppContext();

  const [date, setDate] = useState('');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [singleProof, setSingleProof] = useState<Proof | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const singleFileInputRef = React.useRef<HTMLInputElement>(null);

  const [batchStartDate, setBatchStartDate] = useState('');
  const [batchValue, setBatchValue] = useState('');
  const [batchInstallments, setBatchInstallments] = useState('');
  const [batchDescription, setBatchDescription] = useState('');
  const [batchProofs, setBatchProofs] = useState<Proof[]>([]);
  const [batchFileError, setBatchFileError] = useState<string | null>(null);
  const batchFileInputRef = React.useRef<HTMLInputElement>(null);

  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const processFile = useCallback((file: File): Promise<Proof | { error: string }> => {
    return new Promise((resolve) => {
      if (!ALLOWED_PROOF_FILE_TYPES.includes(file.type)) {
        resolve({ error: `Tipo de arquivo inválido: ${file.name}. Permitidos: ${ALLOWED_PROOF_FILE_TYPES.join(', ')}` });
        return;
      }
      if (file.size > MAX_PROOF_FILE_SIZE_BYTES) {
        resolve({ error: `Arquivo muito grande: ${file.name}. Máximo: ${MAX_PROOF_FILE_SIZE_MB}MB.` });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        let finalFileName = file.name;
        if (!file.name.toLowerCase().startsWith(SECTION_PREFIX.toLowerCase())) {
          finalFileName = `${SECTION_PREFIX}${file.name}`;
        }
        resolve({
          name: finalFileName,
          type: file.type,
          dataUrl: reader.result as string,
          size: file.size,
        });
      };
      reader.onerror = () => {
        resolve({ error: `Erro ao ler o arquivo: ${file.name}.` });
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleSingleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setSingleProof(null);
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await processFile(file);
    if ('error' in result) {
      setFileError(result.error);
      if(singleFileInputRef.current) singleFileInputRef.current.value = ""; 
    } else {
      setSingleProof(result);
    }
  };

  const clearSingleProofFile = () => {
    setSingleProof(null);
    setFileError(null);
    if(singleFileInputRef.current) singleFileInputRef.current.value = "";
  };

  const handleBatchFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setBatchFileError(null);
    setBatchProofs([]);
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newProofs: Proof[] = [];
    let errors: string[] = [];

    for (const file of Array.from(files)) {
      const result = await processFile(file);
      if ('error' in result) {
        errors.push(result.error);
      } else {
        newProofs.push(result);
      }
    }

    if (errors.length > 0) {
      setBatchFileError(errors.join('\n'));
    }
    setBatchProofs(newProofs);
  };

  const clearBatchProofFiles = () => {
    setBatchProofs([]);
    setBatchFileError(null);
    if (batchFileInputRef.current) batchFileInputRef.current.value = "";
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !value) { alert('Data e valor são obrigatórios.'); return; }
    const newEntry: ConstructionProgressEntry = {
      id: crypto.randomUUID(), date, value: parseFloat(value),
      description: description || undefined, 
      proofs: singleProof ? [singleProof] : undefined,
    };
    dispatch({ type: 'ADD_CONSTRUCTION_PROGRESS_ENTRY', payload: newEntry });
    setDate(''); setValue(''); setDescription(''); clearSingleProofFile();
    setSaveStatusMessage("Pagamento adicionado localmente!");
    setTimeout(() => setSaveStatusMessage(null), 3000);
  };

  const handleRemoveEntry = (id: string) => {
    if (window.confirm('Remover este pagamento?')) {
        dispatch({ type: 'REMOVE_CONSTRUCTION_PROGRESS_ENTRY', payload: id });
    }
  };
  
  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(batchValue);
    const numInstallments = parseInt(batchInstallments, 10);

    if (!batchStartDate || !batchValue || !batchInstallments || numValue <= 0 || numInstallments <= 0) {
      alert('Preencha todos os campos do lote com valores válidos.'); return;
    }
    
    const startDateObj = new Date(batchStartDate + 'T00:00:00');
    const originalDay = startDateObj.getDate();
    let entriesAdded = 0;
    for (let i = 0; i < numInstallments; i++) {
      let currentEntryDate = new Date(startDateObj.getFullYear(), startDateObj.getMonth() + i, 1);
      const daysInMonth = new Date(currentEntryDate.getFullYear(), currentEntryDate.getMonth() + 1, 0).getDate();
      currentEntryDate.setDate(Math.min(originalDay, daysInMonth));
      
      const newEntry: ConstructionProgressEntry = {
        id: crypto.randomUUID(), date: currentEntryDate.toISOString().split('T')[0], value: numValue,
        description: batchDescription ? `${batchDescription} (Parcela ${i+1}/${numInstallments})` : `Parcela ${i+1}/${numInstallments}`,
        proofs: batchProofs.length > 0 ? [...batchProofs] : undefined,
      };
      dispatch({ type: 'ADD_CONSTRUCTION_PROGRESS_ENTRY', payload: newEntry });
      entriesAdded++;
    }
    setBatchStartDate(''); setBatchValue(''); setBatchInstallments(''); setBatchDescription('');
    clearBatchProofFiles();
    setSaveStatusMessage(`${entriesAdded} pagamentos adicionados localmente!`);
    setTimeout(() => setSaveStatusMessage(null), 3000);
  };

  const handleSaveData = () => {
    if (saveStateToLocalStorageManually()) setSaveStatusMessage("Dados salvos localmente!");
    else setSaveStatusMessage("Erro ao salvar localmente.");
    setTimeout(() => setSaveStatusMessage(null), 3000);
  };

  const handleShareToWhatsApp = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyEntries = state.constructionProgressEntries.filter(entry => {
      const entryDate = new Date(entry.date + 'T00:00:00');
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });
    if (monthlyEntries.length === 0) { alert("Nenhum pagamento neste mês para compartilhar."); return; }
    let summary = `Resumo Pagamentos - Evolução Obra - ${String(currentMonth + 1).padStart(2, '0')}/${currentYear}\n\n`;
    let totalMonthly = 0;
    monthlyEntries.forEach(e => {
      summary += `- Data: ${new Date(e.date+'T00:00:00').toLocaleDateString('pt-BR')}, Valor: ${formatCurrency(e.value)}`;
      if (e.description) summary += `, Desc: ${e.description}`;
      summary += '\n'; totalMonthly += e.value;
    });
    summary += `\nTotal Mês: ${formatCurrency(totalMonthly)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(summary)}`, '_blank');
  };

  const monthlyPayments = useMemo<MonthlyPayment[]>(() => {
    const grouped: { [key: string]: number } = {};
    state.constructionProgressEntries.forEach(entry => {
      const entryDate = new Date(entry.date + 'T00:00:00'); 
      const monthYear = `${String(entryDate.getMonth() + 1).padStart(2, '0')}/${entryDate.getFullYear()}`;
      grouped[monthYear] = (grouped[monthYear] || 0) + entry.value;
    });
    return Object.entries(grouped)
      .map(([monthYear, totalPaid]) => ({ monthYear, totalPaid }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.monthYear.split('/').map(Number);
        const [bMonth, bYear] = b.monthYear.split('/').map(Number);
        return new Date(bYear, bMonth - 1).getTime() - new Date(aYear, aMonth - 1).getTime();
      });
  }, [state.constructionProgressEntries]);

  const handlePrint = async () => {
    // This function can print both combined or offer separate prints.
    // For now, it prints the main history. If monthlyPayments table is also to be printed,
    // it needs a separate call or to be included in CONSTRUCTION_HISTORY_ID.
    // Assuming CONSTRUCTION_HISTORY_ID covers both tables if they are under one common parent.
    // If not, printing CONSTRUCTION_MONTHLY_ID would be a separate action.
    // The current PageActions only supports one onPrint.
    // For simplicity, let's assume CONSTRUCTION_HISTORY_ID is the main content to print.
    await generatePdfFromElement({
      elementId: CONSTRUCTION_HISTORY_ID, 
      pdfFileName: "Relatorio_Evolucao_Obra_Historico.pdf",
      pdfTitle: "Histórico de Pagamentos (Evolução de Obra)",
      checkIsEmpty: () => state.constructionProgressEntries.length === 0,
      onStart: () => setIsPrinting(true),
      onFinish: (success) => {
        setIsPrinting(false);
        if (!success && state.constructionProgressEntries.length > 0) alert("Falha PDF Histórico Evolução Obra.");
      }
    });
  };

  const sortedConstructionProgressEntries = useMemo(() => {
    return [...state.constructionProgressEntries].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.constructionProgressEntries]);

  const dirAttributesForBatchUpload: any = { webkitdirectory: "", directory: "" };

  return (
    <div className="space-y-8">
      <PageActions 
        onPrint={handlePrint} 
        printButtonText={isPrinting ? "Gerando PDF..." : "Imprimir Relatório Evolução Obra"} 
        showGoToHomeButton={true} 
        isPrinting={isPrinting}
      />

      <Section title="Visão Geral da Evolução de Obra">
         <div className="mb-8">
            <StatCard title="Total Pago (Evolução de Obra)" value={formatCurrency(getTotalConstructionProgressPaid())} valueClassName="text-green-500 print:text-black" className="card-print-styling"/>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 print:hidden">
          <Button onClick={handleSaveData} variant="success" size="md" disabled={isPrinting}>
            Salvar Dados Local
          </Button>
           <Button onClick={handleShareToWhatsApp} variant="primary" size="md" className="bg-green-500 hover:bg-green-600" disabled={isPrinting}>
            <WhatsAppIcon /> Compartilhar Resumo Mensal
          </Button>
          {saveStatusMessage && (
            <p className={`text-sm font-medium ${saveStatusMessage.includes('sucesso') || saveStatusMessage.includes('concluída') ? 'text-green-700' : saveStatusMessage.includes('Processando') || saveStatusMessage.includes('Salvando') ? 'text-blue-700' : 'text-red-700'}`}>
              {saveStatusMessage}
            </p>
          )}
        </div>
      </Section>

      <Section title="Cadastro em Lote (Evolução de Obra)" className="print:hidden">
        <Card title="Adicionar Múltiplos Pagamentos de Evolução de Obra">
          <form onSubmit={handleBatchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Data de Início do Primeiro Pagamento" id="cp-batch-start-date" type="date" value={batchStartDate} onChange={(e) => setBatchStartDate(e.target.value)} required />
              <Input label="Número de Pagamentos" id="cp-batch-installments" type="number" value={batchInstallments} onChange={(e) => setBatchInstallments(e.target.value)} required min="1" step="1" />
            </div>
            <Input label="Valor por Pagamento (R$)" id="cp-batch-value" type="number" value={batchValue} onChange={(e) => setBatchValue(e.target.value)} required min="0.01" step="any" />
            <Input label="Descrição Comum (Opcional)" id="cp-batch-description" type="text" value={batchDescription} onChange={(e) => setBatchDescription(e.target.value)} />
            
            <div className="mb-4">
              <label htmlFor="cp-batch-proofs" className="block text-sm font-medium text-gray-700 mb-1">
                  Comprovantes da Pasta (PDF, PNG - Máx. {MAX_PROOF_FILE_SIZE_MB}MB por arquivo)
              </label>
              <input
                  id="cp-batch-proofs" type="file" ref={batchFileInputRef}
                  {...dirAttributesForBatchUpload}
                  multiple
                  accept={ALLOWED_PROOF_FILE_TYPES.join(',')}
                  onChange={handleBatchFileChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-primary/80"
              />
              {batchProofs.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                      {batchProofs.length} arquivo(s) selecionado(s):
                      <ul className="list-disc list-inside max-h-32 overflow-y-auto">
                          {batchProofs.map(p => <li key={p.name} title={p.name}>{p.name.length > 40 ? p.name.substring(0,37) + '...' : p.name} ({Math.round(p.size / 1024)} KB)</li>)}
                      </ul>
                      <Button variant="danger" size="sm" onClick={clearBatchProofFiles} className="mt-1 !py-0.5 !px-1.5 text-xs">Limpar Arquivos</Button>
                  </div>
              )}
              {batchFileError && <pre className="mt-1 text-xs text-red-600 whitespace-pre-wrap">{batchFileError}</pre>}
              <p className="mt-1 text-xs text-gray-500">Nota: A seleção de pastas é suportada principalmente em navegadores baseados em Chrome.</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="primary" disabled={isPrinting}>Adicionar Pagamentos (Local)</Button>
            </div>
          </form>
        </Card>
      </Section>
      
      <Section title="Cadastro Individual (Evolução de Obra)" className="print:hidden">
        <Card title="Novo Pagamento Único de Evolução de Obra">
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <Input label="Data do Pagamento" id="cp-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <Input label="Valor Pago (R$)" id="cp-value" type="number" value={value} onChange={(e) => setValue(e.target.value)} required min="0" step="any"/>
            <Input label="Descrição (Opcional)" id="cp-description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="mb-4">
                <label htmlFor="cp-proof" className="block text-sm font-medium text-gray-700 mb-1">
                    Comprovante (PDF, PNG - Máx. {MAX_PROOF_FILE_SIZE_MB}MB)
                </label>
                <input id="cp-proof" type="file" ref={singleFileInputRef} accept={ALLOWED_PROOF_FILE_TYPES.join(',')}
                    onChange={handleSingleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-primary/80"
                />
                {singleProof && (
                    <div className="mt-2 text-sm text-gray-600">
                        {singleProof.name} ({Math.round(singleProof.size / 1024)} KB)
                        <Button variant="danger" size="sm" onClick={clearSingleProofFile} className="ml-2 !py-0.5 !px-1.5 text-xs">Limpar</Button>
                    </div>
                )}
                {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="primary" disabled={isPrinting}>Adicionar Pagamento (Local)</Button>
            </div>
          </form>
        </Card>
      </Section>

      {/* This outer div will contain both tables if they need to be printed together */}
      <div id={CONSTRUCTION_HISTORY_ID}>
        <Section title="Histórico de Pagamentos (Evolução de Obra)">
          {sortedConstructionProgressEntries.length === 0 ? (
            <p className="text-gray-500 print:text-black">Nenhum pagamento registrado.</p>
          ) : (
            <Card className="overflow-x-auto card-print-styling">
              <table className="min-w-full divide-y divide-gray-200 print:divide-gray-300">
                <thead className="bg-gray-50 print:bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Valor Pago</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Descrição</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">Comprovante(s)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 print:bg-white print:divide-gray-300">
                  {sortedConstructionProgressEntries.map(entry => (
                    <tr key={entry.id} className="print:text-black">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black">{new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black">{formatCurrency(entry.value)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 print:text-black">{entry.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 print:hidden">
                        {entry.proofs && entry.proofs.length > 0 ? (
                          <a href={entry.proofs[0].dataUrl} target="_blank" rel="noopener noreferrer" download={entry.proofs[0].name}
                            title={`Baixar ${entry.proofs[0].name}${entry.proofs.length > 1 ? ` (e mais ${entry.proofs.length - 1})` : ''}`} 
                            className="text-primary hover:text-primary-dark underline">
                            <PaperClipIcon /> {entry.proofs[0].name.length > 25 ? entry.proofs[0].name.substring(0,22) + "..." : entry.proofs[0].name} ({Math.round(entry.proofs[0].size / 1024)} KB)
                            {entry.proofs.length > 1 && <span className="ml-1 text-xs font-normal text-gray-400">({entry.proofs.length} arquivos)</span>}
                          </a>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium print:hidden">
                        <Button variant="danger" size="sm" onClick={() => handleRemoveEntry(entry.id)} aria-label="Remover pagamento" disabled={isPrinting}>
                          <TrashIcon />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </Section>

        <Section title="Pagamentos Mensais (Evolução de Obra)" id={CONSTRUCTION_MONTHLY_ID}> {/* Ensure this ID is unique if printed separately */}
          {monthlyPayments.length === 0 ? (
            <p className="text-gray-500 print:text-black">Nenhum pagamento mensal para exibir.</p>
          ) : (
            <Card className="overflow-x-auto card-print-styling">
              <table className="min-w-full divide-y divide-gray-200 print:divide-gray-300">
                <thead className="bg-gray-50 print:bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Mês/Ano</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Total Pago no Mês</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 print:bg-white print:divide-gray-300">
                  {monthlyPayments.map(item => (
                    <tr key={item.monthYear} className="print:text-black">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black">{item.monthYear}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black">{formatCurrency(item.totalPaid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </Section>
      </div> {/* End of CONSTRUCTION_HISTORY_ID container */}
    </div>
  );
};

export default ConstructionProgressScreen;