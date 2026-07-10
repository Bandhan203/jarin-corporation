import { apiClient } from "./apiClient";

export interface ValuationPoint {
  year: string;
  actual: number | null;
  projected: number | null;
}

export interface SwapUnit {
  unitCode: string;
  block: string;
  floorNumber: number;
  sizeSqft: number;
  currentValuationL: number;
  progressPct: number;
  status: "on_track" | "ahead" | "delayed";
}

export interface LandownerAnalytics {
  landownerId: string;
  valuation: ValuationPoint[];
  swapUnits: SwapUnit[];
  totalValueL: number;
  projectedValueL: number;
  growthPct: number;
  activeProjects: number;
}

export async function fetchLandownerAnalytics(landownerId: string): Promise<LandownerAnalytics> {
  const { data } = await apiClient.get<LandownerAnalytics>(`/landowner/${landownerId}/analytics`);
  return data;
}
