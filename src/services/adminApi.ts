import { apiClient } from "./apiClient";

export interface AdminProject {
  id: string;
  name: string;
  location: string;
  katha: number;
  targetCapital: string;
  raisedPct: number;
  totalUnits: number;
  status: string;
  phase: string | null;
  completionTarget: string | null;
  contractor: string | null;
  baseSqftRate: number;
  managementFeePct: number;
}

export interface LandPipelineRow {
  dbId: number;
  id: string;
  name: string;
  location: string;
  katha: number;
  submitted: string;
  status: string;
}

export interface PlatformCost {
  key: string;
  label: string;
  value: number;
  lockWhenRunning: boolean;
  isLocked: boolean;
}

export interface AdminStats {
  revenueBdt: number;
  runningProjects: number;
  defaultRiskFlags: number;
}

export interface EscrowRow {
  id: string;
  invoiceNo: string;
  investor: string;
  unit: string;
  amount: number;
  escrow88: number;
  fee12: number;
  status: string;
  gateway: string;
  date: string;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const { data } = await apiClient.get<AdminStats>("/admin/stats");
  return data;
}

export async function fetchAdminProjects(): Promise<AdminProject[]> {
  const { data } = await apiClient.get<{ data: AdminProject[] }>("/admin/projects");
  return data.data;
}

export async function updateAdminProject(id: string, payload: Partial<{
  base_sqft_rate: number;
  management_fee_percentage: number;
  status: string;
  phase_label: string;
  funding_percentage: number;
  contractor: string;
  completion_target: string;
}>): Promise<void> {
  await apiClient.patch(`/admin/projects/${id}`, payload);
}

export async function fetchLandPipeline(): Promise<LandPipelineRow[]> {
  const { data } = await apiClient.get<{ data: LandPipelineRow[] }>("/admin/land-submissions");
  return data.data;
}

export async function assignLandLawyer(dbId: number): Promise<void> {
  await apiClient.post(`/admin/land-submissions/${dbId}/assign-lawyer`);
}

export async function approveLandSubmission(dbId: number): Promise<void> {
  await apiClient.post(`/admin/land-submissions/${dbId}/approve`);
}

export async function fetchPlatformCosts(): Promise<{ costs: PlatformCost[]; runningProjectCount: number }> {
  const { data } = await apiClient.get<{ data: PlatformCost[]; runningProjectCount: number }>("/admin/costs");
  return { costs: data.data, runningProjectCount: data.runningProjectCount };
}

export async function updatePlatformCost(key: string, value: number): Promise<void> {
  await apiClient.patch(`/admin/costs/${key}`, { value });
}

export async function fetchEscrowLedger(): Promise<EscrowRow[]> {
  const { data } = await apiClient.get<{ data: EscrowRow[] }>("/admin/escrow");
  return data.data;
}
