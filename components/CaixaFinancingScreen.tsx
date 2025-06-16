import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { CaixaFinancingInstallment, Proof, MAX_PROOF_FILE_SIZE_BYTES, ALLOWED_PROOF_FILE_TYPES, MAX_PROOF_FILE_SIZE_MB } from '../types';
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

const CAIXA_HISTORY_ID = "caixa-financing-history-content";
const SECTION_PREFIX = "FINANCIAMENTO_CAIXA_";

const CaixaFinancingScreen: React.FC = () => {
  const { state, dispatch, formatCurrency, getTotalPrincipalPaidOnCaixaFinancing, getTotalInterestPaidOnCaixaFinancing, getCaixaFinancingOutstandingBalance, saveStateToLocalStorageManually } = useAppContext();
  
  const [paymentDate, setPaymentDate] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [interestPaid, setInterestPaid] = useState('');
  const [description, setDescription] = useState('');
  const [singleProof, setSingleProof] = useState<Proof | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const singleFileInputRef = React.useRef<HTMLInputElement>(null);

  const [batchStartDate, setBatchStartDate] = useState('');
  const [batchAmountPaid, setBatchAmountPaid] = useState('');
  const [batchInterestPaid, setBatchInterestPaid] = useState('');
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
    if (!paymentDate || !amountPaid || !interestPaid) { alert('Preencha todos os campos obrigatórios.'); return; }
    const numAmountPaid = parseFloat(amountPaid);
    const numInterestPaid = parseFloat(interestPaid);
    if (numInterestPaid > numAmountPaid) { alert('Juros não pode ser maior que o valor pago.'); return; }

    const newInstallment: CaixaFinancingInstallment = {
      id: crypto.randomUUID(), paymentDate, amountPaid: numAmountPaid, interestPaid: numInterestPaid,
      principalPaid: numAmountPaid - numInterestPaid, description: description || undefined, 
      proofs: singleProof ? [singleProof] : undefined,
    };
    dispatch({ type: 'ADD_CAIXA_FINANCING_INSTALLMENT', payload: newInstallment });
    setPaymentDate(''); setAmountPaid(''); setInterestPaid(''); setDescription(''); clearSingleProofFile();
    setSaveStatusMessage("Parcela adicionada localmente!");
    setTimeout(() => setSaveStatusMessage(null), 3000);
  };

  const handleRemoveInstallment = (id: string) => {
    if (window.confirm('Remover esta parcela?')) {
      dispatch({ type: 'REMOVE_CAIXA_FINANCING_INSTALLMENT', payload: id });
    }
  };
  
  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(batchAmountPaid);
    const numInterest = parseFloat(batchInterestPaid);
    const numInstallments = parseInt(batchInstallments, 10);

    if (!batchStartDate || !batchAmountPaid || !batchInterestPaid || !batchInstallments || numAmount <= 0 || numInterest < 0 || numInstallments <= 0) {
      alert('Preencha todos os campos do lote com valores válidos.'); return;
    }
    if (numInterest > numAmount) { alert('Juros por parcela não pode ser maior que o valor total da parcela.'); return; }
    
    const startDateObj = new Date(batchStartDate + 'T00:00:00');
    const originalDay = startDateObj.getDate();
    let entriesAdded = 0;
    for (let i = 0; i < numInstallments; i++) {
      let currentEntryDate = new Date(startDateObj.getFullYear(), startDateObj.getMonth() + i, 1);
      const daysInMonth = new Date(currentEntryDate.getFullYear(), currentEntryDate.getMonth() + 1, 0).getDate();
      currentEntryDate.setDate(Math.min(originalDay, daysInMonth));

      const newInstallment: CaixaFinancingInstallment = {
        id: crypto.randomUUID(), paymentDate: currentEntryDate.toISOString().split('T')[0],
        amountPaid: numAmount, interestPaid: numInterest, principalPaid: numAmount - numInterest,
        description: batchDescription ? `${batchDescription} (Parcela ${i+1}/${numInstallments})` : `Parcela ${i+1}/${numInstallments}`,
        proofs: batchProofs.length > 0 ? [...batchProofs] : undefined,
      };
      dispatch({ type: 'ADD_CAIXA_FINANCING_INSTALLMENT', payload: newInstallment });
      entriesAdded++;
    }
    setBatchStartDate(''); setBatchAmountPaid(''); setBatchInterestPaid(''); setBatchInstallments(''); setBatchDescription('');
    clearBatchProofFiles();
    setSaveStatusMessage(`${entriesAdded} parcelas adicionadas localmente!`);
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
    const monthlyInstallments = state.caixaFinancingInstallments.filter(inst => {
      const instDate = new Date(inst.paymentDate + 'T00:00:00');
      return instDate.getMonth() === currentMonth && instDate.getFullYear() === currentYear;
    });
    if (monthlyInstallments.length === 0) { alert("Nenhuma parcela neste mês para compartilhar."); return; }
    let summary = `Resumo Parcelas - Financiamento Caixa - ${String(currentMonth + 1).padStart(2, '0')}/${currentYear}\n\n`;
    let totalMonthly = 0;
    monthlyInstallments.forEach(inst => {
      summary += `- Data: ${new Date(inst.paymentDate+'T00:00:00').toLocaleDateString('pt-BR')}, Valor: ${formatCurrency(inst.amountPaid)} (J: ${formatCurrency(inst.interestPaid)}, P: ${formatCurrency(inst.principalPaid)})`;
      if (inst.description) summary += `, Desc: ${inst.description}`;
      summary += '\n'; totalMonthly += inst.amountPaid;
    });
    summary += `\nTotal Mês: ${formatCurrency(totalMonthly)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(summary)}`, '_blank');
  };

  const handlePrint = async () => {
    await generatePdfFromElement({
      elementId: CAIXA_HISTORY_ID, pdfFileName: "Relatorio_Financiamento_Caixa.pdf",
      pdfTitle: "Relatório de Parcelas (Financiamento Caixa)",
      checkIsEmpty: () => state.caixaFinancingInstallments.length === 0,
      onStart: () => setIsPrinting(true),
      onFinish: (success) => {
        setIsPrinting(false);
        if (!success && state.caixaFinancingInstallments.length > 0) alert("Falha PDF Financiamento Caixa.");
      }
    });
  };

  const sortedCaixaFinancingInstallments = useMemo(() => {
    return [...state.caixaFinancingInstallments].sort((a,b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [state.caixaFinancingInstallments]);

  const dirAttributesForBatchUpload: any = { webkitdirectory: "", directory: "" };

  return (
    <div className="space-y-8">
      <PageActions 
        onPrint={handlePrint} 
        printButtonText={isPrinting ? "Gerando PDF..." : "Imprimir Relatório Financiamento"} 
        showGoToHomeButton={true} 
        isPrinting={isPrinting}
      />

      <Section title="Visão Geral do Financiamento Caixa">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Saldo Devedor Inicial" value={formatCurrency(state.initialLoanAmount)} className="card-print-styling"/>
            <StatCard title="Total Principal Pago" value={formatCurrency(getTotalPrincipalPaidOnCaixaFinancing())} valueClassName="text-green-500 print:text-black" className="card-print-styling"/>
            <StatCard title="Total Juros Pagos" value={formatCurrency(getTotalInterestPaidOnCaixaFinancing())} valueClassName="text-yellow-500 print:text-black" className="card-print-styling"/>
            <StatCard title="Saldo Devedor Atual" value={formatCurrency(getCaixaFinancingOutstandingBalance())} valueClassName="text-red-500 print:text-black" className="card-print-styling"/>
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

      <Section title="Cadastro em Lote de Parcelas (Financiamento Caixa)" className="print:hidden">
        <Card title="Adicionar Múltiplas Parcelas">
          <form onSubmit={handleBatchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Data de Início da Primeira Parcela" id="cf-batch-start-date" type="date" value={batchStartDate} onChange={(e) => setBatchStartDate(e.target.value)} required />
              <Input label="Número de Parcelas" id="cf-batch-installments" type="number" value={batchInstallments} onChange={(e) => setBatchInstallments(e.target.value)} required min="1" step="1" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Valor Total por Parcela (R$)" id="cf-batch-amount" type="number" value={batchAmountPaid} onChange={(e) => setBatchAmountPaid(e.target.value)} required min="0.01" step="any" />
              <Input label="Valor dos Juros por Parcela (R$)" id="cf-batch-interest" type="number" value={batchInterestPaid} onChange={(e) => setBatchInterestPaid(e.target.value)} required min="0" step="any" />
            </div>
            <Input label="Descrição Comum (Opcional)" id="cf-batch-description" type="text" value={batchDescription} onChange={(e) => setBatchDescription(e.target.value)} />
            
            <div className="mb-4">
              <label htmlFor="cf-batch-proofs" className="block text-sm font-medium text-gray-700 mb-1">
                  Comprovantes da Pasta (PDF, PNG - Máx. {MAX_PROOF_FILE_SIZE_MB}MB por arquivo)
              </label>
              <input
                  id="cf-batch-proofs" type="file" ref={batchFileInputRef}
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
                <Button type="submit" variant="primary" disabled={isPrinting}>Adicionar Parcelas (Local)</Button>
            </div>
          </form>
        </Card>
      </Section>

      <Section title="Cadastro Individual de Parcela (Financiamento Caixa)" className="print:hidden">
        <Card title="Nova Parcela Única do Financiamento">
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <Input label="Data do Pagamento" id="cf-paymentDate" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required />
            <Input label="Valor Total Pago (R$)" id="cf-amountPaid" type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} required min="0" step="any" />
            <Input label="Valor dos Juros (R$)" id="cf-interestPaid" type="number" value={interestPaid} onChange={(e) => setInterestPaid(e.target.value)} required min="0" step="any" />
            <Input label="Descrição (Opcional)" id="cf-description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
             <div className="mb-4">
                <label htmlFor="cf-proof" className="block text-sm font-medium text-gray-700 mb-1">
                    Comprovante (PDF, PNG - Máx. {MAX_PROOF_FILE_SIZE_MB}MB)
                </label>
                <input id="cf-proof" type="file" ref={singleFileInputRef} accept={ALLOWED_PROOF_FILE_TYPES.join(',')}
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
                <Button type="submit" variant="primary" disabled={isPrinting}>Adicionar Parcela (Local)</Button>
            </div>
          </form>
        </Card>
      </Section>

      <Section title="Histórico de Parcelas do Financiamento" id={CAIXA_HISTORY_ID}>
        {sortedCaixaFinancingInstallments.length === 0 ? (
          <p className="text-gray-500 print:text-black">Nenhuma parcela registrada.</p>
        ) : (
          <Card className="overflow-x-auto card-print-styling">
            <table className="min-w-full divide-y divide-gray-200 print:divide-gray-300">
              <thead className="bg-gray-50 print:bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Data Pag.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Valor Pago</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Juros</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Principal Amortizado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">Comprovante(s)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 print:bg-white print:divide-gray-300">
                {sortedCaixaFinancingInstallments.map(installment => (
                  <tr key={installment.id} className="print:text-black">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black">{new Date(installment.paymentDate + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black">{formatCurrency(installment.amountPaid)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black">{formatCurrency(installment.interestPaid)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black">{formatCurrency(installment.principalPaid)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 print:text-black">{installment.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 print:hidden">
                      {installment.proofs && installment.proofs.length > 0 ? (
                        <a href={installment.proofs[0].dataUrl} target="_blank" rel="noopener noreferrer" download={installment.proofs[0].name}
                          title={`Baixar ${installment.proofs[0].name}${installment.proofs.length > 1 ? ` (e mais ${installment.proofs.length - 1})` : ''}`}
                           className="text-primary hover:text-primary-dark underline">
                          <PaperClipIcon /> {installment.proofs[0].name.length > 25 ? installment.proofs[0].name.substring(0,22) + "..." : installment.proofs[0].name} ({Math.round(installment.proofs[0].size / 1024)} KB)
                          {installment.proofs.length > 1 && <span className="ml-1 text-xs font-normal text-gray-400">({installment.proofs.length} arquivos)</span>}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium print:hidden">
                       <Button variant="danger" size="sm" onClick={() => handleRemoveInstallment(installment.id)} aria-label="Remover parcela" disabled={isPrinting}>
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
    </div>
  );
};

export default CaixaFinancingScreen;