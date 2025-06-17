
import React, { createContext, useReducer, useEffect, useContext, useCallback } from 'react';
import { AppState, AppAction, AppContextType, DownPaymentEntry, ConstructionProgressEntry, CaixaFinancingInstallment, APP_STATE_LOCAL_STORAGE_KEY, Proof, UpdateProofNamePayload, AiActionLogEntry, TotalsPerCategory, BudgetEntry, NotificationMessage, NotificationType } from '../types';

const MAX_AI_LOG_ENTRIES = 5;
const DEFAULT_NOTIFICATION_DURATION = 5000; // 5 seconds

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
  aiActionLog: [],
  categories: ["F/Entrada", "Evolução da Obra", "Financiamento Caixa", "Taxas Adicionais", "Alimentação", "Moradia", "Transporte", "Saúde", "Lazer", "Educação", "Vestuário", "Outros"],
  budgets: [],
  notifications: [], // Initialize notifications
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
    case 'UPDATE_DOWN_PAYMENT_ENTRY':
      return { 
        ...state, 
        downPaymentEntries: state.downPaymentEntries.map(e => e.id === action.payload.id ? action.payload : e) 
      };
    case 'REMOVE_DOWN_PAYMENT_ENTRY':
      return { ...state, downPaymentEntries: state.downPaymentEntries.filter(e => e.id !== action.payload) };

    case 'ADD_CONSTRUCTION_PROGRESS_ENTRY':
      return { ...state, constructionProgressEntries: [...state.constructionProgressEntries, action.payload] };
    case 'UPDATE_CONSTRUCTION_PROGRESS_ENTRY':
      return { 
        ...state, 
        constructionProgressEntries: state.constructionProgressEntries.map(e => e.id === action.payload.id ? action.payload : e) 
      };
    case 'REMOVE_CONSTRUCTION_PROGRESS_ENTRY':
        return { ...state, constructionProgressEntries: state.constructionProgressEntries.filter(e => e.id !== action.payload) };

    case 'ADD_CAIXA_FINANCING_INSTALLMENT':
      return { ...state, caixaFinancingInstallments: [...state.caixaFinancingInstallments, action.payload] };
    case 'UPDATE_CAIXA_FINANCING_INSTALLMENT':
      return { 
        ...state, 
        caixaFinancingInstallments: state.caixaFinancingInstallments.map(e => e.id === action.payload.id ? action.payload : e) 
      };
    case 'REMOVE_CAIXA_FINANCING_INSTALLMENT':
        return { ...state, caixaFinancingInstallments: state.caixaFinancingInstallments.filter(e => e.id !== action.payload) };
    
    case 'UPDATE_PROOF_NAME': {
      const { sourceEntryId, sourceEntryType, originalProofName, newProofName } = action.payload;
      let updatedState = { ...state };

      const updateProofInEntry = (entry: any) => {
        if (entry.id === sourceEntryId && entry.proofs) {
          const proofIndex = entry.proofs.findIndex((p: Proof) => p.name === originalProofName);
          if (proofIndex !== -1) {
            const newProofs = [...entry.proofs];
            newProofs[proofIndex] = { ...newProofs[proofIndex], name: newProofName };
            return { ...entry, proofs: newProofs };
          }
        }
        return entry;
      };

      if (sourceEntryType === 'F/Entrada') {
        updatedState.downPaymentEntries = state.downPaymentEntries.map(updateProofInEntry);
      } else if (sourceEntryType === 'Evolução da Obra') {
        updatedState.constructionProgressEntries = state.constructionProgressEntries.map(updateProofInEntry);
      } else if (sourceEntryType === 'Financiamento Caixa') {
        updatedState.caixaFinancingInstallments = state.caixaFinancingInstallments.map(updateProofInEntry);
      }
      return updatedState;
    }

    case 'ADD_AI_ACTION_LOG': {
      const newLogEntry: AiActionLogEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        summary: action.payload.summary,
      };
      const updatedLog = [newLogEntry, ...state.aiActionLog].slice(0, MAX_AI_LOG_ENTRIES);
      return { ...state, aiActionLog: updatedLog };
    }

    case 'ADD_APP_CATEGORY':
      if (state.categories.includes(action.payload) || action.payload.trim() === '') {
        return state;
      }
      return { ...state, categories: [...state.categories, action.payload.trim()].sort() };
    case 'REMOVE_APP_CATEGORY':
      const remainingBudgets = state.budgets.filter(b => b.category !== action.payload);
      return { 
        ...state, 
        categories: state.categories.filter(cat => cat !== action.payload),
        budgets: remainingBudgets 
      };
    
    case 'ADD_BUDGET_ENTRY':
      if (!state.categories.includes(action.payload.category) || 
          state.budgets.find(b => b.category === action.payload.category && b.period === action.payload.period)) {
        return state;
      }
      return { ...state, budgets: [...state.budgets, action.payload] };
    case 'UPDATE_BUDGET_ENTRY':
      return { 
        ...state, 
        budgets: state.budgets.map(b => b.id === action.payload.id ? action.payload : b) 
      };
    case 'REMOVE_BUDGET_ENTRY':
      return { ...state, budgets: state.budgets.filter(b => b.id !== action.payload) };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, { ...action.payload, id: crypto.randomUUID() }],
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };

    case 'LOAD_STATE':
      return { 
        ...initialAppState, 
        ...action.payload, 
        aiActionLog: action.payload.aiActionLog || [],
        categories: action.payload.categories || initialAppState.categories,
        budgets: action.payload.budgets || [],
        notifications: [], // Notifications are transient, don't load from storage
      };
    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const prepareStateForStorage = (currentState: AppState): any => {
  const { notifications, ...stateToSave } = currentState; // Exclude notifications

  const clonedStateToSave = JSON.parse(JSON.stringify(stateToSave)); 

  const transformProofsForStorage = (proofs: Proof[] | undefined) => {
    if (!proofs) return undefined;
    return proofs.map(p => {
      const { dataUrl, ...restOfProof } = p; 
      return restOfProof;
    });
  };

  const processEntries = (entries: any[]) => {
    return entries.map(entry => ({
      ...entry,
      proofs: transformProofsForStorage(entry.proofs),
    }));
  };

  if (clonedStateToSave.downPaymentEntries) {
    clonedStateToSave.downPaymentEntries = processEntries(clonedStateToSave.downPaymentEntries);
  }
  if (clonedStateToSave.constructionProgressEntries) {
    clonedStateToSave.constructionProgressEntries = processEntries(clonedStateToSave.constructionProgressEntries);
  }
  if (clonedStateToSave.caixaFinancingInstallments) {
    clonedStateToSave.caixaFinancingInstallments = processEntries(clonedStateToSave.caixaFinancingInstallments);
  }
  return clonedStateToSave;
};


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialAppState, (initial) => {
    try {
      const storedState = localStorage.getItem(APP_STATE_LOCAL_STORAGE_KEY);
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        return { 
          ...initial, 
          ...parsedState, 
          aiActionLog: parsedState.aiActionLog || [],
          categories: parsedState.categories && parsedState.categories.length > 0 ? parsedState.categories : initial.categories,
          budgets: parsedState.budgets || [],
          notifications: [], // Always start with empty notifications
        };
      }
      return initial;
    } catch (error) {
      console.error("Erro ao carregar estado do localStorage:", error);
      return initial;
    }
  });

  useEffect(() => {
    try {
      const stateForStorage = prepareStateForStorage(state);
      localStorage.setItem(APP_STATE_LOCAL_STORAGE_KEY, JSON.stringify(stateForStorage));
    } catch (error) { 
      console.error("Erro ao salvar estado automaticamente no localStorage:", error);
      // Consider dispatching a notification here
      // addNotification("Erro crítico ao salvar dados. Verifique o console.", 'error');
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
      const stateForStorage = prepareStateForStorage(state);
      localStorage.setItem(APP_STATE_LOCAL_STORAGE_KEY, JSON.stringify(stateForStorage));
      return true;
    } catch (error) {
      console.error("Erro ao salvar estado manualmente no localStorage:", error);
      return false; 
    }
  }, [state]);

  const getTotalsPaidPerCategory = useCallback((): TotalsPerCategory => {
    const totals: TotalsPerCategory = {};
    
    const processEntriesWithValueProperty = (entries: (DownPaymentEntry | ConstructionProgressEntry)[]) => {
      entries.forEach(entry => {
        if (entry.category) {
          totals[entry.category] = (totals[entry.category] || 0) + entry.value;
        } else {
          totals["Sem Categoria"] = (totals["Sem Categoria"] || 0) + entry.value;
        }
      });
    };
    
    const processCaixaEntries = (entries: CaixaFinancingInstallment[]) => {
        entries.forEach(entry => {
            if(entry.category) {
                totals[entry.category] = (totals[entry.category] || 0) + entry.amountPaid;
            } else {
                totals["Sem Categoria"] = (totals["Sem Categoria"] || 0) + entry.amountPaid;
            }
        });
    };

    processEntriesWithValueProperty(state.downPaymentEntries);
    processEntriesWithValueProperty(state.constructionProgressEntries);
    processCaixaEntries(state.caixaFinancingInstallments);
    
    return totals;
  }, [state.downPaymentEntries, state.constructionProgressEntries, state.caixaFinancingInstallments]);

  const getNextScheduledPaymentDate = useCallback((): string | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    let futureDates: Date[] = [];
    
    const collectDates = (entries: { date?: string; paymentDate?: string }[]) => {
        entries.forEach(entry => {
            const dateStr = entry.date || entry.paymentDate;
            if (dateStr) {
                const entryDate = new Date(dateStr + "T00:00:00"); 
                if (entryDate >= today) {
                    futureDates.push(entryDate);
                }
            }
        });
    };

    collectDates(state.downPaymentEntries);
    collectDates(state.constructionProgressEntries);
    collectDates(state.caixaFinancingInstallments);

    if (futureDates.length === 0) return null;

    futureDates.sort((a, b) => a.getTime() - b.getTime());
    return futureDates[0].toLocaleDateString('pt-BR');
  }, [state.downPaymentEntries, state.constructionProgressEntries, state.caixaFinancingInstallments]);
  
  const getMonthlySpendingForCategory = useCallback((category: string, year: number, month: number): number => {
    let total = 0;
    const isTargetMonth = (dateStr: string) => {
        const entryDate = new Date(dateStr + "T00:00:00");
        return entryDate.getFullYear() === year && entryDate.getMonth() === month;
    };

    state.downPaymentEntries.forEach(e => {
        if (e.category === category && isTargetMonth(e.date)) total += e.value;
    });
    state.constructionProgressEntries.forEach(e => {
        if (e.category === category && isTargetMonth(e.date)) total += e.value;
    });
    state.caixaFinancingInstallments.forEach(e => {
        if (e.category === category && isTargetMonth(e.paymentDate)) total += e.amountPaid;
    });
    return total;
  }, [state.downPaymentEntries, state.constructionProgressEntries, state.caixaFinancingInstallments]);

  const getTotalMonthlySpending = useCallback((year: number, month: number): number => {
    let total = 0;
    const isTargetMonth = (dateStr: string) => {
        const entryDate = new Date(dateStr + "T00:00:00");
        return entryDate.getFullYear() === year && entryDate.getMonth() === month;
    };
    state.downPaymentEntries.forEach(e => { if (isTargetMonth(e.date)) total += e.value; });
    state.constructionProgressEntries.forEach(e => { if (isTargetMonth(e.date)) total += e.value; });
    state.caixaFinancingInstallments.forEach(e => { if (isTargetMonth(e.paymentDate)) total += e.amountPaid; });
    return total;
  }, [state.downPaymentEntries, state.constructionProgressEntries, state.caixaFinancingInstallments]);

  const addNotification = useCallback((message: string, type: NotificationType, duration: number = DEFAULT_NOTIFICATION_DURATION) => {
    const newNotification: Omit<NotificationMessage, 'id'> = { message, type, duration };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
  }, [dispatch]);


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
        getTotalsPaidPerCategory,
        getNextScheduledPaymentDate,
        getMonthlySpendingForCategory,
        getTotalMonthlySpending,
        saveStateToLocalStorageManually,
        addNotification
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
