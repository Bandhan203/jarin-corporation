import { apiClient } from "./apiClient";

export interface CmsBlockContent {
  text?: string;
  title?: string;
  description?: string;
  desc?: string;
  detail?: string;
  num?: string;
  url?: string;
  cta?: string;
  eyebrow?: string;
  variant?: string;
  cmsKey?: string;
  imageKey?: string;
  imageUrl?: string;
  alt?: string;
  [key: string]: string | undefined;
}

export interface CmsBlock {
  id: string;
  sectionId: string;
  type: string;
  label: string;
  content: CmsBlockContent;
  sortOrder: number;
  isVisible: boolean;
}

export interface CmsSection {
  id: string;
  pageId: string;
  slug: string;
  title: string;
  type: string;
  sortOrder: number;
  isVisible: boolean;
  settings: Record<string, unknown>;
  blocks: CmsBlock[];
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  path: string;
  sortOrder: number;
  isPublished: boolean;
  sections: CmsSection[];
}

export async function fetchPublicPageLayout(slug: string): Promise<CmsPage> {
  const { data } = await apiClient.get<{ data: CmsPage }>(`/cms/pages/${slug}`);
  return data.data;
}

export async function fetchAdminPageLayouts(): Promise<CmsPage[]> {
  const { data } = await apiClient.get<{ data: CmsPage[] }>("/admin/cms/pages/layout");
  return data.data;
}

export async function createCmsPage(payload: { title: string; path: string; slug?: string }): Promise<CmsPage> {
  const { data } = await apiClient.post<{ data: CmsPage }>("/admin/cms/pages", payload);
  return data.data;
}

export async function updateCmsPage(id: string, payload: Partial<{ title: string; path: string; isPublished: boolean }>): Promise<CmsPage> {
  const { data } = await apiClient.patch<{ data: CmsPage }>(`/admin/cms/pages/${id}`, {
    ...payload,
    ...(payload.isPublished !== undefined ? { is_published: payload.isPublished } : {}),
  });
  return data.data;
}

export async function deleteCmsPage(id: string): Promise<void> {
  await apiClient.delete(`/admin/cms/pages/${id}`);
}

export async function createCmsSection(payload: { pageId: string; title: string; type: string; slug?: string }): Promise<CmsSection> {
  const { data } = await apiClient.post<{ data: CmsSection }>("/admin/cms/sections", {
    page_id: payload.pageId,
    title: payload.title,
    type: payload.type,
    slug: payload.slug,
  });
  return data.data;
}

export async function updateCmsSection(id: string, payload: Partial<{ title: string; type: string; settings: Record<string, unknown>; isVisible: boolean }>): Promise<CmsSection> {
  const body: Record<string, unknown> = {};
  if (payload.title !== undefined) body.title = payload.title;
  if (payload.type !== undefined) body.type = payload.type;
  if (payload.settings !== undefined) body.settings = payload.settings;
  if (payload.isVisible !== undefined) body.is_visible = payload.isVisible;
  const { data } = await apiClient.patch<{ data: CmsSection }>(`/admin/cms/sections/${id}`, body);
  return data.data;
}

export async function deleteCmsSection(id: string): Promise<void> {
  await apiClient.delete(`/admin/cms/sections/${id}`);
}

export async function createCmsBlock(payload: { sectionId: string; type: string; label: string; content?: CmsBlockContent }): Promise<CmsBlock> {
  const { data } = await apiClient.post<{ data: CmsBlock }>("/admin/cms/blocks", {
    section_id: payload.sectionId,
    type: payload.type,
    label: payload.label,
    content: payload.content ?? {},
  });
  return data.data;
}

export async function updateCmsBlock(id: string, payload: Partial<{ label: string; type: string; content: CmsBlockContent; isVisible: boolean }>): Promise<CmsBlock> {
  const body: Record<string, unknown> = {};
  if (payload.label !== undefined) body.label = payload.label;
  if (payload.type !== undefined) body.type = payload.type;
  if (payload.content !== undefined) body.content = payload.content;
  if (payload.isVisible !== undefined) body.is_visible = payload.isVisible;
  const { data } = await apiClient.patch<{ data: CmsBlock }>(`/admin/cms/blocks/${id}`, body);
  return data.data;
}

export async function deleteCmsBlock(id: string): Promise<void> {
  await apiClient.delete(`/admin/cms/blocks/${id}`);
}

export async function reorderCmsLayout(payload: {
  pages?: { id: string; sortOrder: number }[];
  sections?: { id: string; sortOrder: number; pageId?: string }[];
  blocks?: { id: string; sortOrder: number; sectionId?: string }[];
}): Promise<void> {
  await apiClient.post("/admin/cms/reorder", {
    pages: payload.pages?.map((p) => ({ id: Number(p.id), sort_order: p.sortOrder })),
    sections: payload.sections?.map((s) => ({
      id: Number(s.id),
      sort_order: s.sortOrder,
      ...(s.pageId ? { page_id: Number(s.pageId) } : {}),
    })),
    blocks: payload.blocks?.map((b) => ({
      id: Number(b.id),
      sort_order: b.sortOrder,
      ...(b.sectionId ? { section_id: Number(b.sectionId) } : {}),
    })),
  });
}

export async function uploadCmsImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post<{ url: string }>("/admin/cms/media", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
}

export function getBlockText(block: CmsBlock | undefined, fallback = ""): string {
  return block?.content?.text ?? block?.content?.title ?? fallback;
}

export function findBlock(blocks: CmsBlock[], type: string, label?: string): CmsBlock | undefined {
  return blocks.find((b) => b.type === type && (!label || b.label === label));
}

export function sortBlocks(blocks: CmsBlock[]): CmsBlock[] {
  return [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Public: visible only. Preview: all blocks sorted (hidden shown dimmed). */
export function blocksForRender(blocks: CmsBlock[], preview = false): CmsBlock[] {
  const sorted = sortBlocks(blocks);
  if (preview) return sorted;
  return sorted.filter((b) => b.isVisible);
}

export function sortSections(sections: CmsSection[]): CmsSection[] {
  return [...sections].sort((a, b) => a.sortOrder - b.sortOrder);
}
