
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { CaixaFinancingInstallment, Proof, MAX_PROOF_FILE_SIZE_BYTES, ALLOWED_PROOF_FILE_TYPES, MAX_PROOF_FILE_SIZE_MB } from '../types';
import Input from './ui/Input';
import Button from './ui/Button';
import Card from './ui/Card';
import Section from './ui/Section';
import StatCard from './ui/StatCard';
import PageActions from './ui/PageActions';
import EmptyState from './ui/EmptyState';
import { generatePdfFromElement } from '../utils/generatePdf';
import { convertToCSV, downloadFile, ColumnDefinition } from '../utils/exportUtils'; 

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.03 3.22.077m3.22-.077L10.88 5.79m5.32 0L10.88 5.79m0 0H9.25m2.25.375V4.632c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v1.14M9.25 10.5h5.5m-5.5 3h5.5m-5.5 3h5.5M3 7.5h18M3 12h18m-9 9v-9" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const PaperClipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 inline"><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.35 3.43 16.84L2.05 22L7.31 20.63C8.76 21.41 10.37 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 6.46 17.5 2 12.04 2ZM17.46 15.53C17.22 15.89 16.26 16.44 15.9 16.56C15.54 16.68 15.02 16.76 14.35 16.56C13.62 16.34 12.56 15.93 11.34 14.84C9.82 13.46 9.04 11.83 8.83 11.47C8.62 11.11 8.03 10.24 8.03 9.5C8.03 8.78 8.44 8.38 8.66 8.18C8.88 7.98 9.24 7.92 9.51 7.92C9.62 7.92 9.73 7.93 9.83 7.93C10.03 7.93 10.16 7.92 10.31 8.21C10.48 8.52 10.93 9.64 10.99 9.76C11.05 9.88 11.1 10.02 11.01 10.16C10.92 10.3 10.86 10.38 10.71 10.53C10.56 10.68 10.44 10.79 10.31 10.9C10.18 11.01 10.04 11.14 10.21 11.43C10.38 11.72 10.88 12.32 11.48 12.85C12.25 13.54 12.89 13.82 13.15 13.94C13.41 14.06 13.64 14.04 13.81 13.84C14.01 13.61 14.27 13.25 14.46 12.99C14.65 12.73 14.93 12.67 15.21 12.77C15.49 12.87 16.51 13.41 16.75 13.65C16.99 13.89 17.13 14.05 17.19 14.19C17.25 14.33 17.23 14.71 16.99 15.07L17.46 15.53Z" /></svg>;
const DocumentAddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mx-auto"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const TableIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5V7.5M15.75 19.5V7.5m0 12a1.125 1.125 0 001.125-1.125M15.75 19.5h1.125c.621 0 1.125-.504 1.125-1.125V8.625c0-.621-.504-1.125-1.125-1.125H3.375M3.375 8.625V18.375c0 .621.504 1.125 1.125 1.125h10.125M3.375 8.625c0-.621.504-1.125 1.125-1.125h13.5c.621 0 1.125.504 1.125 1.125v1.125c0 .621-.504 1.125-1.125 1.125h-13.5M3.375 4.5h17.25M3.375 4.5V3.375c0-.621.504-1.125 1.125-1.125h13.5C18.996 2.25 19.5 2.754 19.5 3.375V4.5M8.25 15h7.5M8.25 12h7.5M8.25 9h7.5M3.375 7.5h17.25" /></svg>;


const CAIXA_HISTORY_ID = "caixa-financing-history-content";
const SECTION_PREFIX = "FINANCIAMENTO_CAIXA_";
const readableAllowedFileTypes = ALLOWED_PROOF_FILE_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ');

const CaixaFinancingScreen: React.FC = () => {
  const { state, dispatch, formatCurrency, getTotalPrincipalPaidOnCaixaFinancing, getTotalInterestPaidOnCaixaFinancing, getCaixaFinancingOutstandingBalance, saveStateToLocalStorageManually, addNotification } = useAppContext();
  
  const [editingInstallmentId, setEditingInstallmentId] = useState<string | null>(null);
  const [paymentDate, setPaymentDate] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [interestPaid, setInterestPaid] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [currentProofs, setCurrentProofs] = useState<Proof[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const singleFileInputRef = React.useRef<HTMLInputElement>(null);

  const [batchStartDate, setBatchStartDate] = useState('');
  const [batchAmountPaid, setBatchAmountPaid] = useState('');
  const [batchInterestPaid, setBatchInterestPaid] = useState('');
  const [batchInstallments, setBatchInstallments] = useState('');
  const [batchDescription, setBatchDescription] = useState('');
  const [batchCategory, setBatchCategory] = useState('');
  const [batchProofs, setBatchProofs] = useState<Proof[]>([]);
  const [batchFileError, setBatchFileError] = useState<string | null>(null);
  const batchFileInputRef = React.useRef<HTMLInputElement>(null);

  const [filterText, setFilterText] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [isPrinting, setIsPrinting] = useState(false);

  const processFile = useCallback((file: File): Promise<Proof | { error: string }> => {
    return new Promise((resolve) => {
      if (!ALLOWED_PROOF_FILE_TYPES.includes(file.type)) {
        resolve({ error: `Tipo de arquivo inválido: ${file.name}. Permitidos: ${readableAllowedFileTypes}` });
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
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await processFile(file);
    if ('error' in result) {
      setFileError(result.error);
      addNotification(result.error, 'error');
    } else {
      setCurrentProofs(prev => [...prev, result]);
      addNotification(`Comprovante "${result.name}" pronto para ser anexado.`, 'info', 3000);
    }
    if(singleFileInputRef.current) singleFileInputRef.current.value = ""; 
  };

  const removeSingleProof = (proofName: string) => {
    setCurrentProofs(prev => prev.filter(p => p.name !== proofName));
    addNotification(`Comprovante "${proofName}" removido da lista atual.`, 'info', 3000);
  };

  const handleBatchFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setBatchFileError(null);
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newProofsPromises = Array.from(files).map(file => processFile(file));
    const results = await Promise.all(newProofsPromises);
    
    const validProofs: Proof[] = [];
    let currentBatchErrors: string[] = [];

    results.forEach(result => {
      if ('error' in result) {
        currentBatchErrors.push(result.error);
      } else {
        validProofs.push(result);
      }
    });
    
    setBatchProofs(prev => [...prev, ...validProofs]);
    if (validProofs.length > 0) {
        addNotification(`${validProofs.length} comprovante(s) pronto(s) para o lote.`, 'info', 3000);
    }
    if (currentBatchErrors.length > 0) {
      const errorMsg = currentBatchErrors.join('\n');
      setBatchFileError(prev => (prev ? prev + '\n' : '') + errorMsg);
      addNotification(`Erros ao processar alguns arquivos do lote:\n${errorMsg}`, 'error', 7000);
    }
    if (batchFileInputRef.current) batchFileInputRef.current.value = "";
  };

  const removeBatchProof = (proofName: string) => {
    setBatchProofs(prev => prev.filter(p => p.name !== proofName));
    addNotification(`Comprovante "${proofName}" removido da lista do lote.`, 'info', 3000);
  };
  
  const clearSingleForm = (isCancelEdit: boolean = false) => {
    setPaymentDate('');
    setAmountPaid('');
    setInterestPaid('');
    setDescription('');
    setCategory('');
    setCurrentProofs([]);
    setFileError(null);
    if(singleFileInputRef.current) singleFileInputRef.current.value = "";
    if(isCancelEdit) {
        setEditingInstallmentId(null);
        addNotification("Edição cancelada.", 'info');
    }
  };

  const handleClearBatchForm = () => {
    setBatchStartDate('');
    setBatchAmountPaid('');
    setBatchInterestPaid('');
    setBatchInstallments('');
    setBatchDescription('');
    setBatchCategory('');
    setBatchProofs([]);
    setBatchFileError(null);
    if (batchFileInputRef.current) batchFileInputRef.current.value = "";
    addNotification("Campos do formulário de lote limpos.", 'info');
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentDate || !amountPaid || !interestPaid) { addNotification('Preencha todos os campos obrigatórios.', 'warning'); return; }
    const numAmountPaid = parseFloat(amountPaid);
    const numInterestPaid = parseFloat(interestPaid);
    if (numInterestPaid > numAmountPaid) { addNotification('Juros não pode ser maior que o valor pago.', 'warning'); return; }

    const installmentData: CaixaFinancingInstallment = {
      id: editingInstallmentId || crypto.randomUUID(), 
      paymentDate, 
      amountPaid: numAmountPaid, 
      interestPaid: numInterestPaid,
      principalPaid: numAmountPaid - numInterestPaid, 
      description: description || undefined, 
      category: category || undefined,
      proofs: currentProofs.length > 0 ? currentProofs : undefined,
    };

    if (editingInstallmentId) {
      dispatch({ type: 'UPDATE_CAIXA_FINANCING_INSTALLMENT', payload: installmentData });
      addNotification("Parcela atualizada com sucesso!", 'success');
      setEditingInstallmentId(null);
    } else {
      dispatch({ type: 'ADD_CAIXA_FINANCING_INSTALLMENT', payload: installmentData });
      addNotification("Parcela adicionada com sucesso!", 'success');
    }
    clearSingleForm();
  };

  const handleEditInstallment = (installment: CaixaFinancingInstallment) => {
    setEditingInstallmentId(installment.id);
    setPaymentDate(installment.paymentDate);
    setAmountPaid(String(installment.amountPaid));
    setInterestPaid(String(installment.interestPaid));
    setDescription(installment.description || '');
    setCategory(installment.category || '');
    setCurrentProofs(installment.proofs || []);
    setFileError(null);
    const formElement = document.getElementById('cf-single-entry-form-card');
    formElement?.scrollIntoView({ behavior: 'smooth' });
    addNotification(`Editando parcela: ${installment.description || installment.paymentDate}`, 'info');
  };

  const handleRemoveInstallment = (id: string) => {
    if (window.confirm('Remover esta parcela?')) {
      dispatch({ type: 'REMOVE_CAIXA_FINANCING_INSTALLMENT', payload: id });
      addNotification("Parcela removida.", 'success');
    }
  };
  
  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(batchAmountPaid);
    const numInterest = parseFloat(batchInterestPaid);
    const numInstallments = parseInt(batchInstallments, 10);

    if (!batchStartDate || !batchAmountPaid || !batchInterestPaid || !batchInstallments || numAmount <= 0 || numInterest < 0 || numInstallments <= 0) {
      addNotification('Preencha todos os campos do lote com valores válidos.', 'warning'); return;
    }
    if (numInterest > numAmount) { addNotification('Juros por parcela não pode ser maior que o valor total da parcela.', 'warning'); return; }
    
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
        category: batchCategory || undefined,
        proofs: batchProofs.length > 0 ? batchProofs.map(p => ({...p, name: `${p.name.substring(0, p.name.lastIndexOf('.'))}_Parc${i+1}${p.name.substring(p.name.lastIndexOf('.'))}` })) : undefined,
      };
      dispatch({ type: 'ADD_CAIXA_FINANCING_INSTALLMENT', payload: newInstallment });
      entriesAdded++;
    }
    handleClearBatchForm();
    addNotification(`${entriesAdded} parcelas adicionadas em lote!`, 'success');
  };

  const handleSaveData = () => {
    if (saveStateToLocalStorageManually()) {
        addNotification("Dados de Financiamento Caixa salvos localmente!", 'success');
    } else {
        addNotification("Erro ao salvar dados de Financiamento Caixa.", 'error');
    }
  };

  const handleShareToWhatsApp = () => {
      const totalPaid = getTotalPrincipalPaidOnCaixaFinancing() + getTotalInterestPaidOnCaixaFinancing();
      const outstanding = getCaixaFinancingOutstandingBalance();
      const message = `Resumo Financiamento Caixa:\nTotal Pago (Principal+Juros): ${formatCurrency(totalPaid)}\nSaldo Devedor: ${formatCurrency(outstanding)}\n\nÚltimas Parcelas:\n${filteredAndSortedCaixaFinancingInstallments.slice(0,5).map(inst => `- ${new Date(inst.paymentDate + 'T00:00:00').toLocaleDateString('pt-BR')}: ${formatCurrency(inst.amountPaid)} (J: ${formatCurrency(inst.interestPaid)}) ${inst.description ? '('+inst.description+')' : ''}`).join('\n')}${filteredAndSortedCaixaFinancingInstallments.length > 5 ? '\n...e mais.' : ''}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
  };
  
  const handlePrint = async () => {
      await generatePdfFromElement({
        elementId: CAIXA_HISTORY_ID,
        pdfFileName: "Relatorio_Financiamento_Caixa.pdf",
        pdfTitle: "Relatório de Parcelas - Financiamento Caixa",
        checkIsEmpty: () => filteredAndSortedCaixaFinancingInstallments.length === 0,
        noDataMessage: "Não há parcelas do financiamento Caixa registradas para os filtros atuais.",
        onStart: () => setIsPrinting(true),
        onFinish: (success) => {
            setIsPrinting(false);
            if (!success) addNotification("Falha ao gerar PDF do Financiamento Caixa.", 'error');
        }
      });
  };

  const handleExportCSV = () => {
    if (filteredAndSortedCaixaFinancingInstallments.length === 0) {
      addNotification("Não há dados para exportar.", 'info');
      return;
    }
    const columns: ColumnDefinition<CaixaFinancingInstallment>[] = [
      { key: 'paymentDate', label: 'Data Pagamento', formatter: (value) => new Date(value + 'T00:00:00').toLocaleDateString('pt-BR') },
      { key: 'amountPaid', label: 'Valor Pago', formatter: (value) => formatCurrency(value) },
      { key: 'interestPaid', label: 'Juros Pago', formatter: (value) => formatCurrency(value) },
      { key: 'principalPaid', label: 'Principal Pago', formatter: (value) => formatCurrency(value) },
      { key: 'description', label: 'Descrição' },
      { key: 'category', label: 'Categoria' },
      { key: 'proofs', label: 'Comprovantes', formatter: (proofs) => proofs ? proofs.map((p: Proof) => p.name).join('; ') : '' },
    ];
    const csvData = convertToCSV(filteredAndSortedCaixaFinancingInstallments, columns);
    downloadFile("financiamento_caixa_export.csv", csvData, "text/csv;charset=utf-8;");
    addNotification("Dados exportados para CSV!", 'success');
  };

  const filteredAndSortedCaixaFinancingInstallments = useMemo(() => {
    let installments = [...state.caixaFinancingInstallments];
    if (filterText) {
      const lowerFilterText = filterText.toLowerCase();
      installments = installments.filter(inst => 
        (inst.description && inst.description.toLowerCase().includes(lowerFilterText)) ||
        (inst.category && inst.category.toLowerCase().includes(lowerFilterText)) ||
        (inst.proofs && inst.proofs.some(p => p.name.toLowerCase().includes(lowerFilterText)))
      );
    }
    if (filterStartDate) {
      installments = installments.filter(inst => new Date(inst.paymentDate + "T00:00:00") >= new Date(filterStartDate + 'T00:00:00'));
    }
    if (filterEndDate) {
      installments = installments.filter(inst => new Date(inst.paymentDate + "T00:00:00") <= new Date(filterEndDate + 'T23:59:59'));
    }
    if (filterCategory) {
      installments = installments.filter(inst => inst.category === filterCategory);
    }
    return installments.sort((a,b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [state.caixaFinancingInstallments, filterText, filterStartDate, filterEndDate, filterCategory]);

  const dirAttributesForBatchUpload: any = { webkitdirectory: "", directory: "" };

  return (
    <div className="space-y-8">
      <PageActions 
        onPrint={handlePrint} 
        printButtonText={isPrinting ? "Gerando PDF..." : "Imprimir Relatório Financiamento"} 
        showGoToHomeButton={true} 
        isPrinting={isPrinting}
      />
       <Button onClick={handleExportCSV} variant="primary" size="md" className="print:hidden ml-auto flex items-center" disabled={isPrinting || filteredAndSortedCaixaFinancingInstallments.length === 0}>
        <TableIcon /> Exportar para CSV
      </Button>

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
        </div>
      </Section>

      <Section title="Cadastro em Lote de Parcelas (Financiamento Caixa)" className="print:hidden">
        <Card title="Adicionar Múltiplas Parcelas">
          <form onSubmit={handleBatchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Data de Início da Primeira Parcela" id="cf-batch-start-date" type="date" value={batchStartDate} onChange={(e) => setBatchStartDate(e.target.value)} required placeholder="DD/MM/AAAA" />
              <Input label="Número de Parcelas" id="cf-batch-installments" type="number" value={batchInstallments} onChange={(e) => setBatchInstallments(e.target.value)} required min="1" step="1" placeholder="Ex: 360" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Valor Total por Parcela (R$)" id="cf-batch-amount" type="number" value={batchAmountPaid} onChange={(e) => setBatchAmountPaid(e.target.value)} required min="0.01" step="any" placeholder="0,00" />
              <Input label="Valor dos Juros por Parcela (R$)" id="cf-batch-interest" type="number" value={batchInterestPaid} onChange={(e) => setBatchInterestPaid(e.target.value)} required min="0" step="any" placeholder="0,00" />
            </div>
            <Input label="Descrição Comum (Opcional)" id="cf-batch-description" type="text" value={batchDescription} onChange={(e) => setBatchDescription(e.target.value)} placeholder="Ex: Parcela mensal do financiamento" />
            <div className="mb-4">
              <label htmlFor="cf-batch-category" className="block text-sm font-medium text-gray-700 mb-1">Categoria (Opcional)</label>
              <select id="cf-batch-category" value={batchCategory} onChange={(e) => setBatchCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                <option value="">Selecione uma categoria</option>
                {state.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
             <div className="mb-4">
              <label htmlFor="cf-batch-proofs" className="block text-sm font-medium text-gray-700 mb-1">
                  Comprovantes da Pasta ({readableAllowedFileTypes} - Máx. {MAX_PROOF_FILE_SIZE_MB}MB por arq.)
              </label>
              <input id="cf-batch-proofs" type="file" ref={batchFileInputRef} {...dirAttributesForBatchUpload} multiple accept={ALLOWED_PROOF_FILE_TYPES.join(',')} onChange={handleBatchFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-primary/80" />
              {batchProofs.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                      {batchProofs.length} arquivo(s) selecionado(s):
                      <ul className="list-disc list-inside max-h-32 overflow-y-auto">
                           {batchProofs.map(p => <li key={p.name} title={p.name} className="flex justify-between items-center"><span>{p.name.length > 40 ? p.name.substring(0,37) + '...' : p.name} ({Math.round(p.size / 1024)} KB)</span> <Button type="button" variant="danger" size="sm" onClick={() => removeBatchProof(p.name)} className="!py-0.5 !px-1 text-xs ml-2">X</Button></li>)}
                      </ul>
                  </div>
              )}
              {batchFileError && <pre className="mt-1 text-xs text-red-600 whitespace-pre-wrap">{batchFileError}</pre>}
              <p className="mt-1 text-xs text-gray-500">Dica: Para selecionar uma pasta inteira de comprovantes, utilize um navegador compatível (ex: Chrome, Edge).</p>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="primary" disabled={isPrinting}>Adicionar Parcelas (Local)</Button>
                <Button type="button" variant="secondary" onClick={handleClearBatchForm} disabled={isPrinting}>Limpar Campos</Button>
            </div>
          </form>
        </Card>
      </Section>

      <Section title={editingInstallmentId ? "Editar Parcela (Financiamento Caixa)" : "Cadastro Individual de Parcela (Financiamento Caixa)"} className="print:hidden" id="cf-single-entry-form-card">
        <Card title={editingInstallmentId ? "Alterar Dados da Parcela" : "Nova Parcela Única do Financiamento"}>
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <Input label="Data do Pagamento" id="cf-paymentDate" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required placeholder="DD/MM/AAAA" />
            <Input label="Valor Total Pago (R$)" id="cf-amountPaid" type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} required min="0" step="any" placeholder="0,00" />
            <Input label="Valor dos Juros (R$)" id="cf-interestPaid" type="number" value={interestPaid} onChange={(e) => setInterestPaid(e.target.value)} required min="0" step="any" placeholder="0,00" />
            <Input label="Descrição (Opcional)" id="cf-description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Parcela 1 de 360" />
            <div className="mb-4">
              <label htmlFor="cf-category" className="block text-sm font-medium text-gray-700 mb-1">Categoria (Opcional)</label>
              <select id="cf-category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                <option value="">Selecione uma categoria</option>
                {state.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
             <div className="mb-4">
                <label htmlFor="cf-proof" className="block text-sm font-medium text-gray-700 mb-1">
                    Adicionar Comprovante ({readableAllowedFileTypes} - Máx. {MAX_PROOF_FILE_SIZE_MB}MB)
                </label>
                <input id="cf-proof" type="file" ref={singleFileInputRef} accept={ALLOWED_PROOF_FILE_TYPES.join(',')} onChange={handleSingleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-primary/80" />
                {currentProofs.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                        Comprovantes Atuais:
                        <ul className="list-disc list-inside max-h-32 overflow-y-auto">
                           {currentProofs.map(p => <li key={p.name} title={p.name} className="flex justify-between items-center"><span>{p.name.length > 40 ? p.name.substring(0,37) + '...' : p.name} ({Math.round(p.size / 1024)} KB)</span> <Button type="button" variant="danger" size="sm" onClick={() => removeSingleProof(p.name)} className="!py-0.5 !px-1 text-xs ml-2">X</Button></li>)}
                        </ul>
                    </div>
                )}
                {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="primary" disabled={isPrinting}>{editingInstallmentId ? "Salvar Alterações" : "Adicionar Parcela (Local)"}</Button>
                <Button type="button" variant="secondary" onClick={() => clearSingleForm(!!editingInstallmentId)} disabled={isPrinting}>{editingInstallmentId ? "Cancelar Edição" : "Limpar Campos"}</Button>
            </div>
          </form>
        </Card>
      </Section>

      <Section title="Histórico de Parcelas do Financiamento" id={CAIXA_HISTORY_ID}>
        <Card className="mb-4 p-4 print:hidden">
          <h4 className="text-md font-semibold mb-2">Filtrar Histórico:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Pesquisar Descrição/Arq." id="filterTextCF" type="text" value={filterText} onChange={e => setFilterText(e.target.value)} placeholder="Ex: Parcela, Comprovante.pdf" />
            <Input label="Data Inicial" id="filterStartDateCF" type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} />
            <Input label="Data Final" id="filterEndDateCF" type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} />
            <div>
              <label htmlFor="filterCategoryCF" className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select id="filterCategoryCF" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                <option value="">Todas as Categorias</option>
                {state.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
        </Card>
        {filteredAndSortedCaixaFinancingInstallments.length === 0 ? (
          <EmptyState 
            icon={<DocumentAddIcon />}
            title="Nenhuma Parcela Registrada"
            message={<>Ainda não há parcelas do Financiamento Caixa ou os filtros não retornaram resultados. <br/>Clique em "Adicionar Parcela (Local)" acima para começar ou ajuste os filtros.</>}
          />
        ) : (
          <Card className="overflow-x-auto card-print-styling">
            <table className="min-w-full divide-y divide-gray-200 print:divide-gray-300">
              <thead className="bg-gray-50 print:bg-gray-100">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Data Pag.</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Valor Pago</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Juros</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Principal</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Descrição</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Categoria</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">Comprovante(s)</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 print:bg-white print:divide-gray-300">
                {filteredAndSortedCaixaFinancingInstallments.map(installment => (
                  <tr key={installment.id} className="print:text-black">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black">{new Date(installment.paymentDate + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black">{formatCurrency(installment.amountPaid)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black">{formatCurrency(installment.interestPaid)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black">{formatCurrency(installment.principalPaid)}</td>
                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-500 print:text-black break-words max-w-xs">{installment.description || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 print:text-black">{installment.category || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 print:hidden">
                      {installment.proofs && installment.proofs.length > 0 ? (
                        installment.proofs.map(p => (
                          p.dataUrl ? (
                            <a key={p.name} href={p.dataUrl} target="_blank" rel="noopener noreferrer" download={p.name} title={`Baixar ${p.name}`} className="block text-primary hover:text-primary-dark underline mb-1 last:mb-0">
                              <PaperClipIcon /> {p.name.length > 25 ? p.name.substring(0,22) + "..." : p.name} ({Math.round(p.size / 1024)} KB)
                            </a>
                          ) : (
                            <span key={p.name} className="block text-gray-400 italic text-xs mb-1 last:mb-0">
                              <PaperClipIcon /> {p.name.length > 25 ? p.name.substring(0,22) + "..." : p.name} (Recarregar p/ baixar)
                            </span>
                          )
                        ))
                      ) : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium print:hidden space-x-2">
                       <Button variant="secondary" size="sm" onClick={() => handleEditInstallment(installment)} aria-label="Editar parcela" disabled={isPrinting} className="!p-1.5">
                         <PencilIcon />
                       </Button>
                       <Button variant="danger" size="sm" onClick={() => handleRemoveInstallment(installment.id)} aria-label="Remover parcela" disabled={isPrinting} className="!p-1.5">
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
