import { apiClient } from "./apiClient";

export interface LedgerRow {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "paid" | "overdue" | "upcoming" | "defaulted";
  installmentNumber: number;
  projectName?: string;
  unitNumber?: string;
}

export interface LedgerSummary {
  totalPaid: number;
  outstandingBalance: number;
  installmentsComplete: string;
}

export interface LedgerResponse {
  summary: LedgerSummary;
  rows: LedgerRow[];
}

export interface InvoiceDetail {
  invoiceNumber: string;
  installment: number;
  projectName: string;
  projectLocation: string;
  investorName: string;
  transactionId: string | null;
  gateway: string | null;
  paymentDate: string | null;
  dueDate: string;
  amountTotal: number;
  amountEscrow: number;
  amountFee: number;
  status: string;
}

export async function fetchInvestorLedger(): Promise<LedgerResponse> {
  const { data } = await apiClient.get<LedgerResponse>("/investor/ledger");
  return data;
}

export async function fetchInvoiceDetail(invoiceNumber: string): Promise<InvoiceDetail> {
  const { data } = await apiClient.get<InvoiceDetail>(`/investor/ledger/${invoiceNumber}`);
  return data;
}
