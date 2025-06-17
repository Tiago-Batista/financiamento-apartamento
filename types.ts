
export interface Proof {
  name: string;
  type: string;
  dataUrl?: string; // Made optional
  size: number;
}

export interface DownPaymentEntry {
  id: string;
  date: string;
  value: number;
  description?: string;
  proofs?: Proof[];
  category?: string; 
}

export interface ConstructionProgressEntry {
  id:string;
  date: string;
  value: number;
  description?: string;
  proofs?: Proof[];
  category?: string; 
}

export interface CaixaFinancingInstallment {
  id: string;
  paymentDate: string;
  amountPaid: number;
  interestPaid: number;
  principalPaid: number;
  description?: string;
  proofs?: Proof[];
  category?: string; 
}

export interface AiActionLogEntry {
  id: string;
  timestamp: string; // ISO string
  summary: string;
}

export interface BudgetEntry {
  id: string;
  category: string; // Links to a category in AppState.categories
  amount: number;
  period: 'monthly'; // For now, only monthly budgets
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationMessage {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number; // Optional duration in ms for auto-dismiss
}

export interface AppState {
  totalPropertyValue: number;
  initialLoanAmount: number; 
  caixaSubsidy: number;
  fgtsTiago: number;
  targetDownPaymentAmount: number;
  caixaContractSigningFee: number;
  downPaymentEntries: DownPaymentEntry[];
  constructionProgressEntries: ConstructionProgressEntry[];
  caixaFinancingInstallments: CaixaFinancingInstallment[];
  aiActionLog: AiActionLogEntry[];
  categories: string[]; 
  budgets: BudgetEntry[]; 
  notifications: NotificationMessage[]; // New: For in-app notifications
}

export interface UpdateProofNamePayload {
  sourceEntryId: string;
  sourceEntryType: string; // 'F/Entrada', 'Evolução Obra', 'Financiamento Caixa'
  originalProofName: string;
  newProofName: string;
}

export type AppAction =
  | { type: 'SET_TOTAL_PROPERTY_VALUE'; payload: number }
  | { type: 'SET_INITIAL_LOAN_AMOUNT'; payload: number }
  | { type: 'SET_CAIXA_SUBSIDY'; payload: number }
  | { type: 'SET_FGTS_TIAGO'; payload: number }
  | { type: 'SET_TARGET_DOWN_PAYMENT_AMOUNT'; payload: number }
  | { type: 'SET_CAIXA_CONTRACT_SIGNING_FEE'; payload: number }
  | { type: 'ADD_DOWN_PAYMENT_ENTRY'; payload: DownPaymentEntry }
  | { type: 'UPDATE_DOWN_PAYMENT_ENTRY'; payload: DownPaymentEntry } 
  | { type: 'REMOVE_DOWN_PAYMENT_ENTRY'; payload: string } // id
  | { type: 'ADD_CONSTRUCTION_PROGRESS_ENTRY'; payload: ConstructionProgressEntry }
  | { type: 'UPDATE_CONSTRUCTION_PROGRESS_ENTRY'; payload: ConstructionProgressEntry } 
  | { type: 'REMOVE_CONSTRUCTION_PROGRESS_ENTRY'; payload: string } // id
  | { type: 'ADD_CAIXA_FINANCING_INSTALLMENT'; payload: CaixaFinancingInstallment }
  | { type: 'UPDATE_CAIXA_FINANCING_INSTALLMENT'; payload: CaixaFinancingInstallment } 
  | { type: 'REMOVE_CAIXA_FINANCING_INSTALLMENT'; payload: string } // id
  | { type: 'UPDATE_PROOF_NAME'; payload: UpdateProofNamePayload }
  | { type: 'ADD_AI_ACTION_LOG'; payload: { summary: string } }
  | { type: 'ADD_APP_CATEGORY'; payload: string } 
  | { type: 'REMOVE_APP_CATEGORY'; payload: string } 
  | { type: 'ADD_BUDGET_ENTRY'; payload: BudgetEntry } 
  | { type: 'UPDATE_BUDGET_ENTRY'; payload: BudgetEntry } 
  | { type: 'REMOVE_BUDGET_ENTRY'; payload: string } // id of BudgetEntry
  | { type: 'ADD_NOTIFICATION'; payload: Omit<NotificationMessage, 'id'> } // New
  | { type: 'REMOVE_NOTIFICATION'; payload: string } // id of NotificationMessage // New
  | { type: 'LOAD_STATE'; payload: AppState };

export interface TotalsPerCategory {
  [category: string]: number;
}

export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  formatCurrency: (value: number) => string;
  // Valores calculados
  getTotalDownPaymentPaid: () => number;
  getDownPaymentRemaining: () => number;
  getTotalConstructionProgressPaid: () => number;
  getTotalCaixaFinancingPaid: () => number; 
  getTotalPrincipalPaidOnCaixaFinancing: () => number;
  getTotalInterestPaidOnCaixaFinancing: () => number;
  getCaixaFinancingOutstandingBalance: () => number;
  // Cálculos específicos do Dashboard
  getValorAbatido: () => number;
  getValorPagoAteMomentoTotal: () => number;
  getValorRestanteProperty: () => number;
  getTotalsPaidPerCategory: () => TotalsPerCategory; 
  getNextScheduledPaymentDate: () => string | null; 
  getMonthlySpendingForCategory: (category: string, year: number, month: number) => number; 
  getTotalMonthlySpending: (year: number, month: number) => number; 
  // Função de salvamento manual
  saveStateToLocalStorageManually: () => boolean;
  addNotification: (message: string, type: NotificationType, duration?: number) => void; // New
}

export const APP_STATE_LOCAL_STORAGE_KEY = 'financiamentoApartamentoState';
export const WELCOME_MODAL_DISMISSED_KEY = 'financiamentoWelcomeModalDismissed'; // New for onboarding
export const MAX_PROOF_FILE_SIZE_MB = 2;
export const MAX_PROOF_FILE_SIZE_BYTES = MAX_PROOF_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_PROOF_FILE_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']; 

// AI Analysis Related Types
export type AiDocumentType = "BANK_SLIP" | "PAYMENT_RECEIPT" | "INVOICE" | "OTHER_DOCUMENT" | "UNCERTAIN";

export interface AiKeyInfo {
  payerName?: string;
  payeeName?: string; 
  documentDate?: string; 
  dueDate?: string; 
  paymentDate?: string; 
  referenceDueDate?: string;
  totalAmount?: string;
  referenceNumber?: string;
  transactionId?: string;
  bank?: string;
  [key: string]: string | undefined; 
}

export interface AiAnalysisContent {
  documentType: AiDocumentType;
  confidence: number;
  keyInfo: AiKeyInfo;
  summary: string;
}
export interface DocumentForAnalysis {
  id: string; 
  sourceEntryId: string;
  sourceEntryType: string; 
  sourceEntryDescription: string;
  proof: Proof; 
  analysisStatus: 'pending' | 'analyzing' | 'analyzed' | 'renamed' | 'error' | 'cancelled' | 'user_edited';
  analysisResult?: AiAnalysisContent;
  errorMessage?: string;
  newNameSuggestion?: string; 
  isUserCancelled?: boolean;
  userAssignedCategory?: string; 
}
