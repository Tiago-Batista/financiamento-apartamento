
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import Card from './ui/Card';
import Input from './ui/Input';
import Section from './ui/Section';
import StatCard from './ui/StatCard';
import PageActions from './ui/PageActions';
import Button from './ui/Button'; 
import { generatePdfFromElement } from '../utils/generatePdf';

// Ícones de placeholder (estrutura compatível com Heroicons)
const PropertyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 7.5h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const MoneyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>;
const DeductionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

type NumericAppStateKeys = 
  | 'totalPropertyValue' 
  | 'initialLoanAmount' 
  | 'caixaSubsidy' 
  | 'fgtsTiago' 
  | 'targetDownPaymentAmount' 
  | 'caixaContractSigningFee';

const DASHBOARD_CONTENT_ID = "dashboard-print-content";

const DashboardScreen: React.FC = () => {
  const { state, dispatch, formatCurrency, getValorAbatido, getValorPagoAteMomentoTotal, getValorRestanteProperty, saveStateToLocalStorageManually } = useAppContext();
  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleInputChange = (field: NumericAppStateKeys, value: string) => {
    const numericValue = parseFloat(value) || 0;
    switch (field) {
      case 'totalPropertyValue':
        dispatch({ type: 'SET_TOTAL_PROPERTY_VALUE', payload: numericValue });
        break;
      case 'caixaSubsidy':
        dispatch({ type: 'SET_CAIXA_SUBSIDY', payload: numericValue });
        break;
      case 'fgtsTiago':
        dispatch({ type: 'SET_FGTS_TIAGO', payload: numericValue });
        break;
      case 'caixaContractSigningFee':
        dispatch({ type: 'SET_CAIXA_CONTRACT_SIGNING_FEE', payload: numericValue });
        break;
      case 'initialLoanAmount':
        dispatch({ type: 'SET_INITIAL_LOAN_AMOUNT', payload: numericValue });
        break;
      case 'targetDownPaymentAmount':
        dispatch({ type: 'SET_TARGET_DOWN_PAYMENT_AMOUNT', payload: numericValue });
        break;
    }
  };

  const handleSaveData = () => {
    if (saveStateToLocalStorageManually()) {
      setSaveStatusMessage("Dados salvos com sucesso!");
    } else {
      setSaveStatusMessage("Erro ao salvar os dados.");
    }
    setTimeout(() => setSaveStatusMessage(null), 3000);
  };

  const handlePrint = async () => {
    await generatePdfFromElement({
      elementId: DASHBOARD_CONTENT_ID,
      pdfFileName: "Resumo_Geral_Financiamento.pdf",
      pdfTitle: "Resumo Geral do Financiamento",
      checkIsEmpty: () => {
        // O Dashboard nunca está verdadeiramente "vazio" no sentido de não ter seções de dados.
        // Ele sempre mostra cards de estatísticas e configurações. Então, sempre imprimimos o que está lá.
        return false; 
      },
      onStart: () => setIsPrinting(true),
      onFinish: (success) => {
        setIsPrinting(false);
        if (!success) alert("Falha ao gerar PDF do Resumo Geral.");
      }
    });
  };
  
  return (
    <div className="space-y-8">
      <PageActions 
        onPrint={handlePrint} 
        printButtonText={isPrinting ? "Gerando PDF..." : "Imprimir Resumo Geral"} 
        isPrinting={isPrinting} 
      />

      <div id={DASHBOARD_CONTENT_ID}>
        <Section title="Resumo Geral">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Valor Total do Imóvel" value={formatCurrency(state.totalPropertyValue)} icon={<PropertyIcon />} className="card-print-styling"/>
            <StatCard title="Valor Abatido" value={formatCurrency(getValorAbatido())} icon={<DeductionIcon />} valueClassName="text-accent print:text-black" className="card-print-styling"/>
            <StatCard title="Valor Pago Total" value={formatCurrency(getValorPagoAteMomentoTotal())} icon={<MoneyIcon />} valueClassName="text-green-500 print:text-black" className="card-print-styling"/>
            <StatCard title="Valor Restante do Imóvel" value={formatCurrency(getValorRestanteProperty())} icon={<MoneyIcon />} valueClassName="text-secondary print:text-black" className="card-print-styling"/>
          </div>
        </Section>

        <Section title="Configurações Globais">
          <Card className="card-print-styling">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2">
              <Input
                label="Valor Total do Imóvel (R$)"
                id="totalPropertyValue"
                type="number"
                value={state.totalPropertyValue || ''}
                onChange={(e) => handleInputChange('totalPropertyValue', e.target.value)}
                min="0"
                step="any"
                className="print:p-0 print:border-none print:shadow-none print:text-black"
              />
              <Input
                label="Subsídio da Caixa (R$)"
                id="caixaSubsidy"
                type="number"
                value={state.caixaSubsidy || ''}
                onChange={(e) => handleInputChange('caixaSubsidy', e.target.value)}
                min="0"
                step="any"
                className="print:p-0 print:border-none print:shadow-none print:text-black"
              />
              <Input
                label="FGTS (R$)"
                id="fgtsTiago"
                type="number"
                value={state.fgtsTiago || ''}
                onChange={(e) => handleInputChange('fgtsTiago', e.target.value)}
                min="0"
                step="any"
                className="print:p-0 print:border-none print:shadow-none print:text-black"
              />
              <Input
                label="Taxa Assinatura Caixa (R$)"
                id="caixaContractSigningFee"
                type="number"
                value={state.caixaContractSigningFee || ''}
                onChange={(e) => handleInputChange('caixaContractSigningFee', e.target.value)}
                min="0"
                step="any"
                className="print:p-0 print:border-none print:shadow-none print:text-black"
              />
               <Input
                label="Valor Financiamento Inicial (Caixa) (R$)"
                id="initialLoanAmount"
                type="number"
                value={state.initialLoanAmount || ''}
                onChange={(e) => handleInputChange('initialLoanAmount', e.target.value)}
                min="0"
                step="any"
                className="print:p-0 print:border-none print:shadow-none print:text-black"
              />
              <Input
                label="Meta Total da Entrada (F/Entrada) (R$)"
                id="targetDownPaymentAmount"
                type="number"
                value={state.targetDownPaymentAmount || ''}
                onChange={(e) => handleInputChange('targetDownPaymentAmount', e.target.value)}
                min="0"
                step="any"
                className="print:p-0 print:border-none print:shadow-none print:text-black"
              />
            </div>
          </Card>
        </Section>
      </div>
      
      <div className="mt-6 flex items-center space-x-3 print:hidden">
        <Button onClick={handleSaveData} variant="success" size="md">
          Salvar Dados
        </Button>
        {saveStatusMessage && (
          <p className={`text-sm font-medium ${saveStatusMessage.includes('sucesso') ? 'text-green-700' : 'text-red-700'}`}>
            {saveStatusMessage}
          </p>
        )}
      </div>

      <Section title="Categorias de Financiamento" className="print:hidden">
        <p className="text-gray-600 mb-4">
          Acesse as seções abaixo para registrar e acompanhar os detalhes de cada categoria. As informações de Subsídio, FGTS e Taxa de Assinatura são configuradas acima.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="F/Entrada" className="hover:shadow-xl transition-shadow">
                <p className="text-gray-600">Gerencie os pagamentos da entrada do imóvel.</p>
                <p className="mt-2 text-sm">Clique no menu superior para acessar.</p>
            </Card>
            <Card title="Evolução de Obra" className="hover:shadow-xl transition-shadow">
                <p className="text-gray-600">Registre os pagamentos referentes à evolução da obra.</p>
                 <p className="mt-2 text-sm">Clique no menu superior para acessar.</p>
            </Card>
            <Card title="Financiamento Caixa" className="hover:shadow-xl transition-shadow">
                <p className="text-gray-600">Acompanhe as parcelas do financiamento da Caixa.</p>
                 <p className="mt-2 text-sm">Clique no menu superior para acessar.</p>
            </Card>
        </div>
      </Section>
    </div>
  );
};

export default DashboardScreen;