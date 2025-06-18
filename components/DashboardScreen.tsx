
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import Card from './ui/Card';
import Input from './ui/Input';
import Section from './ui/Section';
import StatCard from './ui/StatCard';
import PageActions from './ui/PageActions';
import Button from './ui/Button'; 
import { generatePdfFromElement } from '../utils/generatePdf';
import { BudgetEntry, TotalsPerCategory } from '../types';

// Ícones
const PropertyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 7.5h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const MoneyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>;
const DeductionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CalendarDaysIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>;
const ChartPieIcon: React.FC<{ className?: string }> = ({ className: passedClassName }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={`w-6 h-6 mr-1 ${passedClassName || ''}`}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
    </svg>
);
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.03 3.22.077m3.22-.077L10.88 5.79m5.32 0L10.88 5.79m0 0H9.25m2.25.375V4.632c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v1.14M9.25 10.5h5.5m-5.5 3h5.5m-5.5 3h5.5M3 7.5h18M3 12h18m-9 9v-9" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;


type NumericAppStateKeys = 
  | 'totalPropertyValue' 
  | 'initialLoanAmount' 
  | 'caixaSubsidy' 
  | 'fgtsTiago' 
  | 'targetDownPaymentAmount' 
  | 'caixaContractSigningFee';

const DASHBOARD_CONTENT_ID = "dashboard-print-content";

const DashboardScreen: React.FC = () => {
  const { 
    state, dispatch, formatCurrency, 
    getValorAbatido, getValorPagoAteMomentoTotal, getValorRestanteProperty, 
    getTotalsPaidPerCategory, getNextScheduledPaymentDate,
    getMonthlySpendingForCategory, getTotalMonthlySpending,
    getTotalPrincipalPaidOnCaixaFinancing,
    saveStateToLocalStorageManually,
    addNotification
  } = useAppContext();

  const [isPrinting, setIsPrinting] = useState(false);
  
  // Category Management
  const [newCategoryName, setNewCategoryName] = useState('');

  // Budget Management
  const [editingBudget, setEditingBudget] = useState<BudgetEntry | null>(null);
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const previousMonth = previousMonthDate.getMonth();
  const previousMonthYear = previousMonthDate.getFullYear();

  const totalsPaidPerCategory = useMemo(() => getTotalsPaidPerCategory(), [getTotalsPaidPerCategory]);
  const nextScheduledPayment = useMemo(() => getNextScheduledPaymentDate(), [getNextScheduledPaymentDate]);
  
  const totalSpentThisMonth = useMemo(() => getTotalMonthlySpending(currentYear, currentMonth), [getTotalMonthlySpending, currentYear, currentMonth]);
  const totalSpentLastMonth = useMemo(() => getTotalMonthlySpending(previousMonthYear, previousMonth), [getTotalMonthlySpending, previousMonthYear, previousMonth]);


  const handleInputChange = (field: NumericAppStateKeys, value: string) => {
    const numericValue = parseFloat(value) || 0;
    switch (field) {
      case 'totalPropertyValue': dispatch({ type: 'SET_TOTAL_PROPERTY_VALUE', payload: numericValue }); break;
      case 'caixaSubsidy': dispatch({ type: 'SET_CAIXA_SUBSIDY', payload: numericValue }); break;
      case 'fgtsTiago': dispatch({ type: 'SET_FGTS_TIAGO', payload: numericValue }); break;
      case 'caixaContractSigningFee': dispatch({ type: 'SET_CAIXA_CONTRACT_SIGNING_FEE', payload: numericValue }); break;
      case 'initialLoanAmount': dispatch({ type: 'SET_INITIAL_LOAN_AMOUNT', payload: numericValue }); break;
      case 'targetDownPaymentAmount': dispatch({ type: 'SET_TARGET_DOWN_PAYMENT_AMOUNT', payload: numericValue }); break;
    }
  };

  const handleSaveData = () => {
    if (saveStateToLocalStorageManually()) {
      addNotification("Dados salvos com sucesso!", 'success');
    } else {
      addNotification("Erro ao salvar os dados.", 'error');
    }
  };

  const handlePrint = async () => {
    await generatePdfFromElement({
      elementId: DASHBOARD_CONTENT_ID,
      pdfFileName: "Resumo_Geral_Financiamento.pdf",
      pdfTitle: "Resumo Geral do Financiamento",
      checkIsEmpty: () => false, 
      addNotification, // Pass addNotification
      onStart: () => setIsPrinting(true),
      onFinish: (success) => {
        setIsPrinting(false);
        if (success) {
            addNotification("PDF do Resumo Geral gerado com sucesso!", 'success');
        } else {
            // Error notification is handled within generatePdfFromElement
        }
      }
    });
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() === '') { addNotification('Nome da categoria não pode ser vazio.', 'warning'); return; }
    if (state.categories.includes(newCategoryName.trim())) { addNotification('Esta categoria já existe.', 'warning'); return; }
    dispatch({ type: 'ADD_APP_CATEGORY', payload: newCategoryName.trim() });
    setNewCategoryName('');
    addNotification(`Categoria "${newCategoryName.trim()}" adicionada.`, 'success');
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    if (window.confirm(`Tem certeza que deseja remover a categoria "${categoryToRemove}"? Esta ação removerá a categoria de todas as entradas e orçamentos associados.`)) {
      dispatch({ type: 'REMOVE_APP_CATEGORY', payload: categoryToRemove });
      addNotification(`Categoria "${categoryToRemove}" removida.`, 'success');
    }
  };

  const handleBudgetFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetCategory || !budgetAmount || parseFloat(budgetAmount) <= 0) {
      addNotification("Selecione uma categoria e insira um valor de orçamento válido.", 'warning');
      return;
    }
    const amount = parseFloat(budgetAmount);
    if (editingBudget) {
      dispatch({ type: 'UPDATE_BUDGET_ENTRY', payload: { ...editingBudget, category: budgetCategory, amount } });
      addNotification("Orçamento atualizado!", 'success');
    } else {
      if (state.budgets.find(b => b.category === budgetCategory && b.period === 'monthly')) {
        addNotification("Já existe um orçamento mensal para esta categoria. Edite o existente ou remova-o primeiro.", 'warning');
        return;
      }
      dispatch({ type: 'ADD_BUDGET_ENTRY', payload: { id: crypto.randomUUID(), category: budgetCategory, amount, period: 'monthly' } });
      addNotification("Orçamento adicionado!", 'success');
    }
    setBudgetCategory('');
    setBudgetAmount('');
    setEditingBudget(null);
  };

  const handleEditBudget = (budget: BudgetEntry) => {
    setEditingBudget(budget);
    setBudgetCategory(budget.category);
    setBudgetAmount(String(budget.amount));
  };

  const handleRemoveBudget = (budgetId: string) => {
    if (window.confirm("Tem certeza que deseja remover este orçamento?")) {
      dispatch({ type: 'REMOVE_BUDGET_ENTRY', payload: budgetId });
      addNotification("Orçamento removido.", 'success');
    }
  };

  const handleCancelEditBudget = () => {
    setEditingBudget(null);
    setBudgetCategory('');
    setBudgetAmount('');
  };
  
  return (
    <div className="space-y-8">
      <PageActions 
        onPrint={handlePrint} 
        printButtonText={isPrinting ? "Gerando PDF..." : "Imprimir Resumo Geral"} 
        isPrinting={isPrinting} 
      />

      <div id={DASHBOARD_CONTENT_ID}>
        <Section title="Resumo Geral e Indicadores Chave">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <StatCard title="Valor Total do Imóvel" value={formatCurrency(state.totalPropertyValue)} icon={<PropertyIcon />} className="card-print-styling"/>
            <StatCard title="Valor Total Pago" value={formatCurrency(getValorPagoAteMomentoTotal())} icon={<MoneyIcon />} valueClassName="text-green-500 print:text-black" className="card-print-styling"/>
            <StatCard title="Valor Total Abatido (Subsídio+FGTS)" value={formatCurrency(getValorAbatido())} icon={<DeductionIcon />} valueClassName="text-accent print:text-black" className="card-print-styling"/>
            <StatCard title="Saldo Devedor Caixa" value={formatCurrency(state.initialLoanAmount > 0 ? state.initialLoanAmount - getTotalPrincipalPaidOnCaixaFinancing() : 0)} icon={<MoneyIcon />} valueClassName="text-secondary print:text-black" className="card-print-styling"/>
            <StatCard title="Próximo Pagamento Agendado" value={nextScheduledPayment || "N/A"} icon={<CalendarDaysIcon />} className="card-print-styling"/>
          </div>
        </Section>
        
        <Section title="Análise Financeira Rápida">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Gastos por Categoria (Total)" className="card-print-styling">
                    {Object.keys(totalsPaidPerCategory).length > 0 ? (
                        <ul className="space-y-2 text-sm max-h-60 overflow-y-auto">
                        {Object.entries(totalsPaidPerCategory)
                            .sort(([,aValue], [,bValue]) => bValue - aValue) 
                            .map(([category, total]) => (
                            <li key={category} className="flex justify-between">
                                <span><ChartPieIcon className="inline mr-1 text-gray-400"/>{category}:</span>
                                <span className="font-semibold">{formatCurrency(total)}</span>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">Nenhum gasto registrado ou categorizado.</p>
                    )}
                </Card>
                <Card title="Comparativo Mensal de Gastos" className="card-print-styling">
                    <div className="space-y-3">
                        <StatCard title="Total Gasto Mês Atual" value={formatCurrency(totalSpentThisMonth)} className="shadow-none border p-3"/>
                        <StatCard title="Total Gasto Mês Anterior" value={formatCurrency(totalSpentLastMonth)} className="shadow-none border p-3"/>
                        {totalSpentLastMonth > 0 && (
                             <p className="text-sm text-gray-600">
                                Variação: 
                                <span className={`font-semibold ${totalSpentThisMonth >= totalSpentLastMonth ? 'text-red-500' : 'text-green-500'}`}>
                                    {(((totalSpentThisMonth - totalSpentLastMonth) / totalSpentLastMonth) * 100).toFixed(1)}%
                                </span>
                            </p>
                        )}
                    </div>
                </Card>
            </div>
        </Section>

        <Section title="Orçamento vs. Realizado (Mês Atual)" className="print:hidden">
            <Card>
                {state.budgets.length === 0 && state.categories.length > 0 && (
                    <p className="text-gray-500">Nenhum orçamento mensal definido. Adicione orçamentos na seção "Gerenciar Orçamentos Mensais" abaixo.</p>
                )}
                {state.budgets.length === 0 && state.categories.length === 0 && (
                     <p className="text-gray-500">Adicione categorias primeiro na seção "Gerenciar Categorias de Despesa" para então definir orçamentos.</p>
                )}
                {state.budgets.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Categoria</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Orçado (Mês)</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Gasto (Mês Atual)</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Saldo</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Progresso</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {state.budgets.map(budget => {
                                    const spentThisMonth = getMonthlySpendingForCategory(budget.category, currentYear, currentMonth);
                                    const balance = budget.amount - spentThisMonth;
                                    const progress = budget.amount > 0 ? (spentThisMonth / budget.amount) * 100 : 0;
                                    const progressClamped = Math.min(progress, 100);
                                    return (
                                        <tr key={budget.id}>
                                            <td className="px-4 py-2 whitespace-nowrap">{budget.category}</td>
                                            <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(budget.amount)}</td>
                                            <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(spentThisMonth)}</td>
                                            <td className={`px-4 py-2 whitespace-nowrap ${balance < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                {formatCurrency(balance)} {balance < 0 ? '(Excedido)' : '(Restante)'}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div 
                                                        className={`h-2.5 rounded-full ${progress > 100 ? 'bg-red-500' : 'bg-green-500'}`} 
                                                        style={{ width: `${progressClamped}%`}}
                                                        title={`${progress.toFixed(0)}%`}
                                                    ></div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </Section>

        <Section title="Configurações Globais">
          <Card className="card-print-styling">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2">
              <Input label="Valor Total do Imóvel (R$)" id="totalPropertyValue" type="number" value={state.totalPropertyValue || ''} onChange={(e) => handleInputChange('totalPropertyValue', e.target.value)} min="0" step="any" className="print:p-0 print:border-none print:shadow-none print:text-black" />
              <Input label="Subsídio da Caixa (R$)" id="caixaSubsidy" type="number" value={state.caixaSubsidy || ''} onChange={(e) => handleInputChange('caixaSubsidy', e.target.value)} min="0" step="any" className="print:p-0 print:border-none print:shadow-none print:text-black" />
              <Input label="FGTS (R$)" id="fgtsTiago" type="number" value={state.fgtsTiago || ''} onChange={(e) => handleInputChange('fgtsTiago', e.target.value)} min="0" step="any" className="print:p-0 print:border-none print:shadow-none print:text-black" />
              <Input label="Taxa Assinatura Caixa (R$)" id="caixaContractSigningFee" type="number" value={state.caixaContractSigningFee || ''} onChange={(e) => handleInputChange('caixaContractSigningFee', e.target.value)} min="0" step="any" className="print:p-0 print:border-none print:shadow-none print:text-black" />
              <Input label="Valor Financiamento Inicial (Caixa) (R$)" id="initialLoanAmount" type="number" value={state.initialLoanAmount || ''} onChange={(e) => handleInputChange('initialLoanAmount', e.target.value)} min="0" step="any" className="print:p-0 print:border-none print:shadow-none print:text-black" />
              <Input label="Meta Total da Entrada (F/Entrada) (R$)" id="targetDownPaymentAmount" type="number" value={state.targetDownPaymentAmount || ''} onChange={(e) => handleInputChange('targetDownPaymentAmount', e.target.value)} min="0" step="any" className="print:p-0 print:border-none print:shadow-none print:text-black" />
            </div>
          </Card>
        </Section>
      </div> 

      <Section title="Gerenciar Categorias de Despesa" className="print:hidden">
        <Card>
          <div className="mb-4">
            <Input 
              label="Nova Categoria" 
              id="newCategoryName" 
              type="text" 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)} 
              placeholder="Ex: Material de Construção"
              containerClassName="max-w-md"
            />
            <Button onClick={handleAddCategory} variant="primary" size="sm" className="mt-2">Adicionar Categoria</Button>
          </div>
          {state.categories.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-2">Categorias Existentes:</h4>
              <ul className="space-y-1 max-h-48 overflow-y-auto border rounded p-2">
                {state.categories.sort().map(cat => (
                  <li key={cat} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                    <span>{cat}</span>
                    <Button onClick={() => handleRemoveCategory(cat)} variant="danger" size="sm" className="!p-1">
                      <TrashIcon />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </Section>

      <Section title="Gerenciar Orçamentos Mensais" className="print:hidden">
        <Card>
            <form onSubmit={handleBudgetFormSubmit} className="space-y-4 mb-6 p-4 border rounded-md bg-gray-50">
                <h4 className="text-lg font-medium">{editingBudget ? "Editar Orçamento" : "Adicionar Novo Orçamento Mensal"}</h4>
                <div>
                    <label htmlFor="budgetCategory" className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select 
                        id="budgetCategory" 
                        value={budgetCategory} 
                        onChange={(e) => setBudgetCategory(e.target.value)} 
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        required
                        disabled={editingBudget !== null && state.budgets.some(b => b.id === editingBudget.id && b.category !== budgetCategory)}
                    >
                        <option value="">Selecione uma categoria</option>
                        {state.categories.map(cat => (
                            <option key={cat} value={cat} disabled={!editingBudget && state.budgets.some(b => b.category === cat && b.period === 'monthly')}>
                                {cat} {(!editingBudget && state.budgets.some(b => b.category === cat && b.period === 'monthly')) ? '(Orçamento já existe)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
                <Input 
                    label="Valor Orçado (R$)" 
                    id="budgetAmount" 
                    type="number" 
                    value={budgetAmount} 
                    onChange={(e) => setBudgetAmount(e.target.value)} 
                    min="0.01" 
                    step="any" 
                    placeholder="Ex: 500,00" 
                    required 
                />
                <div className="flex space-x-2">
                    <Button type="submit" variant="primary">{editingBudget ? "Salvar Alterações" : "Adicionar Orçamento"}</Button>
                    {editingBudget && <Button type="button" variant="secondary" onClick={handleCancelEditBudget}>Cancelar Edição</Button>}
                </div>
            </form>

            {state.budgets.length > 0 && (
                 <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Orçamentos Definidos:</h4>
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {state.budgets.sort((a,b) => a.category.localeCompare(b.category)).map(budget => (
                        <li key={budget.id} className="flex justify-between items-center p-3 bg-white border rounded-md shadow-sm text-sm">
                            <div>
                                <span className="font-semibold">{budget.category}</span>: {formatCurrency(budget.amount)} / {budget.period === 'monthly' ? 'mês' : budget.period}
                            </div>
                            <div className="space-x-2">
                                <Button onClick={() => handleEditBudget(budget)} variant="secondary" size="sm" className="!p-1"><PencilIcon /></Button>
                                <Button onClick={() => handleRemoveBudget(budget.id)} variant="danger" size="sm" className="!p-1"><TrashIcon /></Button>
                            </div>
                        </li>
                        ))}
                    </ul>
                </div>
            )}
        </Card>
      </Section>
      
      <div className="mt-6 flex items-center space-x-3 print:hidden">
        <Button onClick={handleSaveData} variant="success" size="md">
          Salvar Todas as Configurações e Dados
        </Button>
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
