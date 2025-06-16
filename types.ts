export interface Proof {
  name: string;
  type: string;
  dataUrl: string;
  size: number;
}

export interface DownPaymentEntry {
  id: string;
  date: string;
  value: number;
  description?: string;
  proof?: Proof;
}

export interface ConstructionProgressEntry {
  id: string;
  date: string;
  value: number;
  description?: string;
  proof?: Proof;
}

export interface CaixaFinancingInstallment {
  id: string;
  paymentDate: string;
  amountPaid: number;
  interestPaid: number;
  principalPaid: number;
  description?: string;
  proof?: Proof;
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
}

export type AppAction =
  | { type: 'SET_TOTAL_PROPERTY_VALUE'; payload: number }
  | { type: 'SET_INITIAL_LOAN_AMOUNT'; payload: number }
  | { type: 'SET_CAIXA_SUBSIDY'; payload: number }
  | { type: 'SET_FGTS_TIAGO'; payload: number }
  | { type: 'SET_TARGET_DOWN_PAYMENT_AMOUNT'; payload: number }
  | { type: 'SET_CAIXA_CONTRACT_SIGNING_FEE'; payload: number }
  | { type: 'ADD_DOWN_PAYMENT_ENTRY'; payload: DownPaymentEntry }
  | { type: 'REMOVE_DOWN_PAYMENT_ENTRY'; payload: string } // id
  | { type: 'ADD_CONSTRUCTION_PROGRESS_ENTRY'; payload: ConstructionProgressEntry }
  | { type: 'REMOVE_CONSTRUCTION_PROGRESS_ENTRY'; payload: string } // id
  | { type: 'ADD_CAIXA_FINANCING_INSTALLMENT'; payload: CaixaFinancingInstallment }
  | { type: 'REMOVE_CAIXA_FINANCING_INSTALLMENT'; payload: string } // id
  | { type: 'LOAD_STATE'; payload: AppState };

export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  formatCurrency: (value: number) => string;
  // Valores calculados
  getTotalDownPaymentPaid: () => number;
  getDownPaymentRemaining: () => number;
  getTotalConstructionProgressPaid: () => number;
  getTotalCaixaFinancingPaid: () => number; // Valor total pago (principal + juros)
  getTotalPrincipalPaidOnCaixaFinancing: () => number;
  getTotalInterestPaidOnCaixaFinancing: () => number;
  getCaixaFinancingOutstandingBalance: () => number;
  // Cálculos específicos do Dashboard
  getValorAbatido: () => number;
  getValorPagoAteMomentoTotal: () => number;
  getValorRestanteProperty: () => number;
  // Função de salvamento manual
  saveStateToLocalStorageManually: () => boolean;
}

export const APP_STATE_LOCAL_STORAGE_KEY = 'financiamentoApartamentoState';
export const MAX_PROOF_FILE_SIZE_MB = 2;
export const MAX_PROOF_FILE_SIZE_BYTES = MAX_PROOF_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_PROOF_FILE_TYPES = ['application/pdf', 'image/png'];