import { apiClient } from "./apiClient";

// ── Types ─────────────────────────────────────────────────────────────

export interface ProjectListItem {
  id: string;
  title: string;
  location: string;
  totalKatha: number;
  fundingPercentage: number;
  status: string;
  phaseLabel: string | null;
  heroImage: string | null;
  availableShares: number;
  displayPrice: string | null;
  displaySft: string | null;
}

export interface ProjectDetail {
  id: string;
  title: string;
  location: string;
  totalKatha: number;
  totalShares: number;
  baseSqftRate: number;
  managementFeePct: number;
  fundingPercentage: number;
  status: string;
  phaseLabel: string | null;
  heroImage: string | null;
}

export interface MatrixUnit {
  id: number;
  unitNumber: string;
  floorNumber: number;
  sizeSft: number;
  premiumCharge: number;
  totalPrice: number;
  orientation: string | null;
  status: "available" | "reserved" | "sold";
}

export interface ProjectMatrixResponse {
  project: ProjectDetail;
  units: MatrixUnit[];
}

// ── API calls ───────────────────────────────────────────────────────

export async function fetchProjects(): Promise<ProjectListItem[]> {
  const { data } = await apiClient.get<{ data: ProjectListItem[] }>("/projects");
  return data.data;
}

export async function fetchProjectDetail(id: string): Promise<ProjectDetail> {
  const { data } = await apiClient.get<{ data: ProjectDetail }>(`/projects/${id}`);
  return data.data;
}

export async function fetchProjectMatrixGrid(id: string): Promise<ProjectMatrixResponse> {
  const { data } = await apiClient.get<ProjectMatrixResponse>(`/projects/${id}/matrix`);
  return data;
}
