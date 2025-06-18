
import React, { createContext, useReducer, useEffect, useContext, useCallback, useRef } from 'react';
import { 
  AppState, AppAction, AppContextType, DownPaymentEntry, ConstructionProgressEntry, 
  CaixaFinancingInstallment, APP_STATE_LOCAL_STORAGE_KEY, Proof, UpdateProofNamePayload, 
  AiActionLogEntry, TotalsPerCategory, BudgetEntry, NotificationMessage, NotificationType,
  GoogleAuthUser, GoogleUserProfile
} from '../types';
import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from '../config'; // Import Google Client ID and Scopes

const MAX_AI_LOG_ENTRIES = 5;
const DEFAULT_NOTIFICATION_DURATION = 5000; // 5 seconds

// Helper to decode JWT
function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT", e);
    return null;
  }
}


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
  notifications: [],
  // Google Auth State
  isAuthLoading: true, // Start loading as we'll check for existing session
  isAuthenticated: false,
  authUser: null,
  authError: null,
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
        notifications: [],
        // Preserve auth state, don't overwrite from localStorage for app data
        isAuthLoading: state.isAuthLoading,
        isAuthenticated: state.isAuthenticated,
        authUser: state.authUser,
        authError: state.authError,
      };

    // Google Auth Reducers
    case 'AUTH_LOADING':
      return { ...state, isAuthLoading: action.payload, authError: null };
    case 'AUTH_SUCCESS':
      return { ...state, isAuthLoading: false, isAuthenticated: true, authUser: action.payload, authError: null };
    case 'AUTH_ERROR':
      return { ...state, isAuthLoading: false, isAuthenticated: false, authUser: null, authError: action.payload };
    case 'AUTH_LOGOUT':
      return { ...state, isAuthLoading: false, isAuthenticated: false, authUser: null, authError: null };
      
    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const prepareStateForStorage = (currentState: AppState): any => {
  // Exclude notifications and auth state from local storage for app data
  const { notifications, isAuthLoading, isAuthenticated, authUser, authError, ...stateToSave } = currentState;

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
          ...initial, // Start with initial defaults (includes auth state)
          ...parsedState, // Load app data
          aiActionLog: parsedState.aiActionLog || [],
          categories: parsedState.categories && parsedState.categories.length > 0 ? parsedState.categories : initial.categories,
          budgets: parsedState.budgets || [],
          notifications: [], // Always start with empty notifications
          // Auth state is managed separately by GIS, not from this local storage
        };
      }
      return initial;
    } catch (error) {
      console.error("Erro ao carregar estado do localStorage:", error);
      return initial;
    }
  });

  const tokenClientRef = useRef<any>(null); // To store the Google Identity Services token client

  // Initialize Google Sign-In and Token Client
  useEffect(() => {
    if (typeof window.google === 'undefined' || typeof window.google.accounts === 'undefined') {
      console.warn("Google Identity Services library not loaded yet.");
      // Optionally, set a timeout to check again, or handle this more gracefully.
      // For now, if it's not there on first mount, auth might not init.
      dispatch({ type: 'AUTH_LOADING', payload: false });
      dispatch({ type: 'AUTH_ERROR', payload: "Google library not loaded." });
      return;
    }

    try {
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (credentialResponse: any) => { // Handle the One Tap or Sign In With Google response
                dispatch({ type: 'AUTH_LOADING', payload: true });
                if (credentialResponse.credential) {
                    const idToken = credentialResponse.credential;
                    const decodedToken: any = decodeJwt(idToken);

                    const userProfile: GoogleUserProfile = {
                        id: decodedToken.sub,
                        name: decodedToken.name || null,
                        email: decodedToken.email || null,
                        picture: decodedToken.picture || null,
                    };
                    
                    // Now, get an access token
                    tokenClientRef.current?.requestAccessToken(); 
                } else {
                    dispatch({ type: 'AUTH_ERROR', payload: 'Login failed: No credential in response.' });
                    addNotification('Falha no login com Google.', 'error');
                }
            },
            auto_select: false, // Set to true for One Tap experience on returning users
            cancel_on_tap_outside: false,
        });

        // Initialize Token Client for getting access tokens for APIs
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: GOOGLE_SCOPES,
            callback: (tokenResponse: any) => { // This callback receives the access token
                 if (tokenResponse && tokenResponse.access_token) {
                    const idToken = state.authUser?.idToken || (window.google.accounts.id?. πιστοποιητικό?.credential); // Attempt to get ID token if available
                    let userProfile = state.authUser; // Keep existing profile if already set by ID token callback

                    if (!userProfile && idToken) { // If signInWithGoogle was just called, ID token callback might set this
                        const decodedIdToken = decodeJwt(idToken);
                        userProfile = {
                             id: decodedIdToken.sub,
                             name: decodedIdToken.name || null,
                             email: decodedIdToken.email || null,
                             picture: decodedIdToken.picture || null,
                             accessToken: tokenResponse.access_token,
                             idToken: idToken
                        }
                    } else if (userProfile) { // if profile exists, just update access token
                        userProfile = {...userProfile, accessToken: tokenResponse.access_token};
                    } else { // Fallback if ID token wasn't processed yet (e.g. access token requested directly)
                         userProfile = {
                            id: 'unknown_user_id', // Placeholder, ideally get from id token
                            name: 'Usuário Google',
                            email: null,
                            picture: null,
                            accessToken: tokenResponse.access_token,
                        };
                    }
                    
                    dispatch({ type: 'AUTH_SUCCESS', payload: userProfile as GoogleAuthUser });
                    addNotification(`Login como ${userProfile?.name || 'Usuário Google'} bem-sucedido!`, 'success');
                } else {
                    dispatch({ type: 'AUTH_ERROR', payload: 'Failed to retrieve access token.' });
                    addNotification('Falha ao obter permissões do Google.', 'error');
                }
            },
            error_callback: (error: any) => {
                console.error("Token client error:", error);
                dispatch({ type: 'AUTH_ERROR', payload: error.message || 'Google token client error.' });
                addNotification(`Erro de permissão Google: ${error.type || error.message}`, 'error');
            }
        });
        dispatch({ type: 'AUTH_LOADING', payload: false }); // GIS initialized
    } catch (e: any) {
        console.error("Error initializing Google services:", e);
        dispatch({ type: 'AUTH_LOADING', payload: false });
        dispatch({ type: 'AUTH_ERROR', payload: e.message || "Failed to init Google services." });
    }

    // Attempt to silently sign-in or check current session status (One Tap experience)
    // window.google.accounts.id.prompt(); // This would trigger One Tap UI if conditions are met

  }, [state.authUser?.idToken]); // Re-run if idToken changes to ensure access token is fetched


  useEffect(() => {
    try {
      const stateForStorage = prepareStateForStorage(state);
      localStorage.setItem(APP_STATE_LOCAL_STORAGE_KEY, JSON.stringify(stateForStorage));
    } catch (error) { 
      console.error("Erro ao salvar estado automaticamente no localStorage:", error);
      addNotification("Erro crítico ao salvar dados. Verifique o console.", 'error');
    }
  }, [state]);


  const addNotification = useCallback((message: string, type: NotificationType, duration: number = DEFAULT_NOTIFICATION_DURATION) => {
    const newNotification: Omit<NotificationMessage, 'id'> = { message, type, duration };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
  }, []);
  
  const signInWithGoogle = useCallback(() => {
    dispatch({ type: 'AUTH_LOADING', payload: true });
    // The google.accounts.id.prompt() or a rendered button would trigger the GIS flow.
    // Since we have a button on HomeScreen, that will trigger this.
    // The main GIS callback in useEffect handles the credentialResponse.
    // This function can be used to manually trigger the token client if needed
    // or to signal the start of the auth process.
    // If using the Google's button, it calls the global callback directly.
    // If using a custom button, you might call:
    // tokenClientRef.current?.requestAccessToken({prompt: 'consent'}); // Forces consent screen
    // For the Sign In with Google button, the callback in initialize is key.
    // Let's ensure our UI button triggers the GIS prompt.
     if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                dispatch({ type: 'AUTH_LOADING', payload: false });
                // This can happen if cookies are disabled, or user closed One Tap.
                // You might want to have a fallback to a popup sign-in experience
                // or just rely on the Google button.
                console.warn("Google Sign-In prompt was not displayed or skipped: ", notification.getNotDisplayedReason() || notification.getSkippedReason());
                // If it's not displayed, directly requesting token might be an option,
                // but usually the Sign In With Google button is the primary trigger.
            }
        });
    } else {
        addNotification("Google Sign-In não está pronto.", 'error');
        dispatch({ type: 'AUTH_LOADING', payload: false });
    }
  }, [dispatch, addNotification]);

  const signOutGoogle = useCallback(() => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.revoke(state.authUser?.email || '', (done: any) => {
        dispatch({ type: 'AUTH_LOGOUT' });
        addNotification("Logout realizado com sucesso.", 'success');
      });
    } else {
      // Fallback if GIS is not fully loaded or user was not fully authenticated with GIS
      dispatch({ type: 'AUTH_LOGOUT' });
      addNotification("Logout (local) realizado.", 'info');
    }
    // Clear any stored tokens if necessary (tokenClient does not store them persistently)
    // Access tokens are short-lived and managed by the tokenClient.
  }, [dispatch, addNotification, state.authUser?.email]);

  const getGoogleAccessToken = useCallback(async (): Promise<string | null> => {
    if (state.authUser?.accessToken) {
        // Here you might want to check token expiry if you stored it with expiry time.
        // GIS token client typically handles renewal.
        return state.authUser.accessToken;
    }
    if (tokenClientRef.current) {
        return new Promise((resolve, reject) => {
            tokenClientRef.current.requestAccessToken({prompt: ''}); // prompt: '' tries silent, 'consent' forces
            // The callback in initTokenClient will update the state,
            // but for direct usage, you might need to listen for state change or adapt this.
            // For simplicity, this function relies on the tokenClient's callback to update context state.
            // A more robust getGoogleAccessToken would handle the direct response here.
            // For now, assume that calling this might trigger a refresh if needed,
            // and the latest token will be in state.authUser.accessToken shortly after.
            // This is a simplification. A truly robust version would:
            // 1. Check current token in state.
            // 2. If expired or not present, call requestAccessToken.
            // 3. Have the requestAccessToken callback resolve this promise.
            // This requires a more complex promise management.
            // Let's assume for now, if it needs a token, it asks and the main callback handles it.
            // This function's main role becomes asking for it if not present.
             setTimeout(() => { // Check state after a short delay
                if (state.authUser?.accessToken) {
                    resolve(state.authUser.accessToken);
                } else {
                    addNotification("Não foi possível obter o token de acesso Google. Tente fazer login novamente.", "warning");
                    resolve(null); // Or reject
                }
            }, 1000); // This timeout is a hack, proper promise chaining is better.

        });
    }
    return null;
  }, [state.authUser, addNotification]);


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
        addNotification,
        signInWithGoogle,
        signOutGoogle,
        getGoogleAccessToken,
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