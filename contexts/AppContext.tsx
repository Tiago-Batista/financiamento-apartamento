import React, { createContext, useReducer, useEffect, useContext, useCallback } from 'react';
import { AppState, AppAction, AppContextType, DownPaymentEntry, ConstructionProgressEntry, CaixaFinancingInstallment, APP_STATE_LOCAL_STORAGE_KEY } from '../types';

const initialAppState: AppState = {
  totalPropertyValue: 0,
  initialLoanAmount: 0,
  caixaSubsidy: 0,
  fgtsTiago: 0,
  targetDownPaymentAmount: 0,
  caixaContractSigningFee: 0,
  downPaymentEntries: [],
  constructionProgressEntries: [],
  caixaFinancingInstallments: [],
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_TOTAL_PROPERTY_VALUE':
      return { ...state, totalPropertyValue: action.payload };
    case 'SET_INITIAL_LOAN_AMOUNT':
      return { ...state, initialLoanAmount: action.payload };
    case 'SET_CAIXA_SUBSIDY':
      return { ...state, caixaSubsidy: action.payload };
    case 'SET_FGTS_TIAGO':
      return { ...state, fgtsTiago: action.payload };
    case 'SET_TARGET_DOWN_PAYMENT_AMOUNT':
      return { ...state, targetDownPaymentAmount: action.payload };
    case 'SET_CAIXA_CONTRACT_SIGNING_FEE':
      return { ...state, caixaContractSigningFee: action.payload };
    case 'ADD_DOWN_PAYMENT_ENTRY':
      return { ...state, downPaymentEntries: [...state.downPaymentEntries, action.payload] };
    case 'REMOVE_DOWN_PAYMENT_ENTRY':
      return { ...state, downPaymentEntries: state.downPaymentEntries.filter(e => e.id !== action.payload) };
    case 'ADD_CONSTRUCTION_PROGRESS_ENTRY':
      return { ...state, constructionProgressEntries: [...state.constructionProgressEntries, action.payload] };
    case 'REMOVE_CONSTRUCTION_PROGRESS_ENTRY':
        return { ...state, constructionProgressEntries: state.constructionProgressEntries.filter(e => e.id !== action.payload) };
    case 'ADD_CAIXA_FINANCING_INSTALLMENT':
      return { ...state, caixaFinancingInstallments: [...state.caixaFinancingInstallments, action.payload] };
    case 'REMOVE_CAIXA_FINANCING_INSTALLMENT':
        return { ...state, caixaFinancingInstallments: state.caixaFinancingInstallments.filter(e => e.id !== action.payload) };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialAppState, (initial) => {
    try {
      const storedState = localStorage.getItem(APP_STATE_LOCAL_STORAGE_KEY);
      return storedState ? JSON.parse(storedState) : initial;
    } catch (error) {
      console.error("Erro ao carregar estado do localStorage:", error);
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(APP_STATE_LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Erro ao salvar estado automaticamente no localStorage:", error);
    }
  }, [state]);

  const formatCurrency = useCallback((value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }, []);

  const getTotalDownPaymentPaid = useCallback((): number => {
    return state.downPaymentEntries.reduce((sum, entry) => sum + entry.value, 0);
  }, [state.downPaymentEntries]);

  const getDownPaymentRemaining = useCallback((): number => {
    return state.targetDownPaymentAmount - getTotalDownPaymentPaid();
  }, [state.targetDownPaymentAmount, getTotalDownPaymentPaid]);

  const getTotalConstructionProgressPaid = useCallback((): number => {
    return state.constructionProgressEntries.reduce((sum, entry) => sum + entry.value, 0);
  }, [state.constructionProgressEntries]);

  const getTotalCaixaFinancingPaid = useCallback((): number => {
    return state.caixaFinancingInstallments.reduce((sum, installment) => sum + installment.amountPaid, 0);
  }, [state.caixaFinancingInstallments]);

  const getTotalPrincipalPaidOnCaixaFinancing = useCallback((): number => {
    return state.caixaFinancingInstallments.reduce((sum, installment) => sum + installment.principalPaid, 0);
  }, [state.caixaFinancingInstallments]);
  
  const getTotalInterestPaidOnCaixaFinancing = useCallback((): number => {
    return state.caixaFinancingInstallments.reduce((sum, installment) => sum + installment.interestPaid, 0);
  }, [state.caixaFinancingInstallments]);

  const getCaixaFinancingOutstandingBalance = useCallback((): number => {
    return state.initialLoanAmount - getTotalPrincipalPaidOnCaixaFinancing();
  }, [state.initialLoanAmount, getTotalPrincipalPaidOnCaixaFinancing]);

  const getValorAbatido = useCallback((): number => {
    return state.caixaSubsidy + state.fgtsTiago;
  }, [state.caixaSubsidy, state.fgtsTiago]);

  const getValorPagoAteMomentoTotal = useCallback((): number => {
    return getTotalDownPaymentPaid() + getTotalConstructionProgressPaid() + getTotalCaixaFinancingPaid() + state.caixaContractSigningFee;
  }, [getTotalDownPaymentPaid, getTotalConstructionProgressPaid, getTotalCaixaFinancingPaid, state.caixaContractSigningFee]);

  const getValorRestanteProperty = useCallback((): number => {
    return state.totalPropertyValue - (getValorPagoAteMomentoTotal() + getValorAbatido());
  }, [state.totalPropertyValue, getValorPagoAteMomentoTotal, getValorAbatido]);

  const saveStateToLocalStorageManually = useCallback((): boolean => {
    try {
      localStorage.setItem(APP_STATE_LOCAL_STORAGE_KEY, JSON.stringify(state));
      return true; // Indica sucesso
    } catch (error) {
      console.error("Erro ao salvar estado manualmente no localStorage:", error);
      return false; // Indica falha
    }
  }, [state]);


  return (
    <AppContext.Provider value={{ 
        state, 
        dispatch, 
        formatCurrency,
        getTotalDownPaymentPaid,
        getDownPaymentRemaining,
        getTotalConstructionProgressPaid,
        getTotalCaixaFinancingPaid,
        getTotalPrincipalPaidOnCaixaFinancing,
        getTotalInterestPaidOnCaixaFinancing,
        getCaixaFinancingOutstandingBalance,
        getValorAbatido,
        getValorPagoAteMomentoTotal,
        getValorRestanteProperty,
        saveStateToLocalStorageManually
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};