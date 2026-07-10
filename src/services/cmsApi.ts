import { apiClient } from "./apiClient";

export interface CmsEntry {
  id: string;
  group: string;
  key: string;
  type: string;
  value: string;
  updatedAt: string;
  updatedBy: string;
}

export interface PublicCms {
  data: CmsEntry[];
  byKey: Record<string, string>;
}

export async function fetchPublicCms(): Promise<PublicCms> {
  const { data } = await apiClient.get<PublicCms>("/cms");
  return data;
}

export async function fetchAdminCms(): Promise<CmsEntry[]> {
  const { data } = await apiClient.get<{ data: CmsEntry[] }>("/admin/cms");
  return data.data;
}

export async function updateCmsEntry(id: string, value: string): Promise<CmsEntry> {
  const { data } = await apiClient.patch<{ data: CmsEntry }>(`/admin/cms/${id}`, { value });
  return data.data;
}
