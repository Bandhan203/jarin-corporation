import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Plus, Trash2, Eye, EyeOff, GripVertical, Save, ChevronUp, ChevronDown,
  Layout, Layers, Box, ExternalLink, Upload, Image as ImageIcon, Loader2, RotateCcw,
} from "lucide-react";
import {
  fetchAdminPageLayouts,
  createCmsSection,
  createCmsBlock,
  updateCmsSection,
  updateCmsBlock,
  deleteCmsSection,
  deleteCmsBlock,
  reorderCmsLayout,
  uploadCmsImage,
  resetCmsPage,
  resetAllCmsPages,
  sortSections,
  sortBlocks,
  type CmsPage,
  type CmsSection,
  type CmsBlock,
  type CmsBlockContent,
} from "@/services/pageLayoutApi";
import { getApiErrorMessage } from "@/services/apiClient";
import { CmsPageView, useCmsByKey } from "@/components/cms/CmsSectionRenderer";
import { DraggableRow } from "./DraggableRow";
import { Toaster } from "@/app/components/ui/sonner";

const SECTION_TYPES = [
  { value: "hero", label: "Hero" },
  { value: "quick_links", label: "Quick Links" },
  { value: "page_header", label: "Page Header" },
  { value: "project_grid", label: "Project Grid" },
  { value: "cost_estimator", label: "Cost Estimator" },
  { value: "steps", label: "Steps" },
  { value: "choose_path", label: "Choose Your Path" },
  { value: "trust_pillars", label: "Trust Pillars" },
  { value: "cta_banner", label: "CTA Banner" },
  { value: "footer", label: "Footer" },
];

const BLOCK_TYPES = [
  { value: "heading", label: "Heading" },
  { value: "text", label: "Text" },
  { value: "eyebrow", label: "Eyebrow" },
  { value: "button", label: "Button" },
  { value: "card", label: "Card" },
  { value: "step", label: "Step" },
  { value: "image", label: "Image" },
];

function ImageBlockFields({
  content,
  onChange,
  onUpload,
  uploading,
}: {
  content: CmsBlockContent;
  onChange: (content: CmsBlockContent) => void;
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-[10px]">
      <div>
        <label className="font-['Inter'] text-[9px] tracking-[1.5px] uppercase text-[#9e9e9e]">Image URL</label>
        <input
          value={content.imageUrl ?? ""}
          onChange={(e) => onChange({ ...content, imageUrl: e.target.value })}
          placeholder="https://… or upload below"
          className="w-full mt-1 px-[12px] py-[8px] border border-neutral-200 font-['Inter'] text-[12px] outline-none focus:border-[#d4af37]"
        />
      </div>
      <div>
        <label className="font-['Inter'] text-[9px] tracking-[1.5px] uppercase text-[#9e9e9e]">Alt Text</label>
        <input
          value={content.alt ?? ""}
          onChange={(e) => onChange({ ...content, alt: e.target.value })}
          className="w-full mt-1 px-[12px] py-[8px] border border-neutral-200 font-['Inter'] text-[12px] outline-none focus:border-[#d4af37]"
        />
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center justify-center gap-[6px] px-[14px] py-[10px] border border-[#d4af37] text-[#735c00] font-['Inter'] text-[10px] tracking-[1.5px] uppercase cursor-pointer hover:bg-[#f9f6ee] disabled:opacity-50"
      >
        {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
        {uploading ? "Uploading…" : "Upload Image"}
      </button>
      {content.imageUrl && (
        <div className="relative border border-neutral-200 overflow-hidden h-[120px] bg-neutral-100">
          <img src={content.imageUrl} alt={content.alt ?? "preview"} className="w-full h-full object-cover" />
        </div>
      )}
      {!content.imageUrl && (
        <div className="flex items-center justify-center h-[80px] border border-dashed border-neutral-300 text-[#9e9e9e]">
          <ImageIcon size={20} />
        </div>
      )}
    </div>
  );
}

function BlockEditor({
  block,
  draft,
  onDraftChange,
  onSave,
  saving,
  onImageUpload,
  imageUploading,
}: {
  block: CmsBlock;
  draft: { content: CmsBlockContent; label: string } | null;
  onDraftChange: (content: CmsBlockContent, label?: string) => void;
  onSave: () => void;
  saving: boolean;
  onImageUpload: (file: File) => void;
  imageUploading: boolean;
}) {
  const current = draft ?? { content: block.content, label: block.label };
  const c = current.content;

  const fields: { key: keyof CmsBlockContent; label: string; rows?: number }[] = useMemo(() => {
    switch (block.type) {
      case "image":
        return [];
      case "step":
        return [
          { key: "num", label: "Step Number" },
          { key: "title", label: "Title" },
          { key: "desc", label: "Description", rows: 3 },
          { key: "detail", label: "Detail", rows: 3 },
          { key: "imageUrl", label: "Image URL" },
          { key: "alt", label: "Image Alt Text" },
        ];
      case "card":
        return [
          { key: "eyebrow", label: "Eyebrow" },
          { key: "title", label: "Title" },
          { key: "description", label: "Description", rows: 3 },
          { key: "cta", label: "CTA Label" },
          { key: "url", label: "URL" },
          { key: "imageUrl", label: "Image URL" },
          { key: "alt", label: "Image Alt Text" },
        ];
      case "button":
        return [
          { key: "text", label: "Button Text" },
          { key: "url", label: "URL" },
          { key: "variant", label: "Variant (gold / outline / outline-light)" },
        ];
      default:
        return [{ key: "text", label: "Text", rows: block.type === "text" ? 3 : 1 }];
    }
  }, [block.type]);

  return (
    <div className="flex flex-col gap-[12px]">
      <div>
        <label className="font-['Inter'] text-[9px] tracking-[1.5px] uppercase text-[#9e9e9e]">Block Label</label>
        <input
          value={current.label}
          onChange={(e) => onDraftChange(c, e.target.value)}
          className="w-full mt-1 px-[12px] py-[8px] border border-neutral-200 font-['Inter'] text-[12px] outline-none focus:border-[#d4af37]"
        />
      </div>

      {block.type === "image" ? (
        <ImageBlockFields
          content={c}
          onChange={(content) => onDraftChange(content, current.label)}
          onUpload={onImageUpload}
          uploading={imageUploading}
        />
      ) : (
        fields.map(({ key, label, rows }) => (
          <div key={key}>
            <label className="font-['Inter'] text-[9px] tracking-[1.5px] uppercase text-[#9e9e9e]">{label}</label>
            <textarea
              value={c[key] ?? ""}
              onChange={(e) => onDraftChange({ ...c, [key]: e.target.value }, current.label)}
              rows={rows ?? 1}
              className="w-full mt-1 px-[12px] py-[8px] border border-neutral-200 font-['Inter'] text-[12px] outline-none focus:border-[#d4af37] resize-y"
            />
          </div>
        ))
      )}

      <button
        type="button"
        onClick={onSave}
        disabled={saving || imageUploading}
        className="flex items-center justify-center gap-[6px] px-[16px] py-[10px] bg-[#1a1c1c] text-white font-['Inter'] text-[10px] tracking-[1.5px] uppercase cursor-pointer disabled:opacity-50"
      >
        <Save size={12} />
        {saving ? "Saving…" : "Save Block"}
      </button>
    </div>
  );
}

const DEFAULT_PAGE_SLUGS = new Set(["home", "explore", "how-it-works"]);

function applyPagesUpdate(pages: CmsPage[], updater: (pages: CmsPage[]) => CmsPage[]): CmsPage[] {
  return updater(pages);
}

function patchBlockInPages(pages: CmsPage[], blockId: string, patch: Partial<CmsBlock>): CmsPage[] {
  return pages.map((p) => ({
    ...p,
    sections: p.sections.map((s) => ({
      ...s,
      blocks: s.blocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b)),
    })),
  }));
}

function patchSectionInPages(pages: CmsPage[], sectionId: string, patch: Partial<CmsSection>): CmsPage[] {
  return pages.map((p) => ({
    ...p,
    sections: p.sections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)),
  }));
}

export default function VisualCmsEditor() {
  const queryClient = useQueryClient();
  const cmsByKey = useCmsByKey();

  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [localPages, setLocalPages] = useState<CmsPage[] | null>(null);
  const [draftBlock, setDraftBlock] = useState<{ content: CmsBlockContent; label: string } | null>(null);
  const [sectionTitleDraft, setSectionTitleDraft] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const pagesRef = useRef<CmsPage[]>([]);

  const { data: pages = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin-cms-pages"],
    queryFn: fetchAdminPageLayouts,
    retry: 1,
  });

  const displayPages = localPages ?? pages;
  pagesRef.current = displayPages;
  const activePage = displayPages.find((p) => p.id === activePageId) ?? displayPages[0] ?? null;

  const selectedSection = activePage?.sections.find((s) => s.id === selectedSectionId) ?? null;
  const selectedBlock = selectedSection?.blocks.find((b) => b.id === selectedBlockId) ?? null;

  useEffect(() => {
    setDraftBlock(null);
  }, [selectedBlockId]);

  useEffect(() => {
    setSectionTitleDraft(selectedSection?.title ?? "");
  }, [selectedSection?.id, selectedSection?.title]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-cms-pages"] });
    await queryClient.invalidateQueries({ queryKey: ["cms-page"] });
    await queryClient.invalidateQueries({ queryKey: ["cms"] });
    setLocalPages(null);
  }, [queryClient]);

  const persistBlockOrder = useCallback(async (blocks: CmsBlock[]) => {
    try {
      await reorderCmsLayout({
        blocks: sortBlocks(blocks).map((b, i) => ({ id: b.id, sortOrder: i })),
      });
      toast.success("Block order saved");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
      await refresh();
    }
  }, [refresh]);

  const persistSectionOrder = useCallback(async (sections: CmsSection[]) => {
    try {
      await reorderCmsLayout({
        sections: sortSections(sections).map((s, i) => ({ id: s.id, sortOrder: i })),
      });
      toast.success("Section order saved");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
      await refresh();
    }
  }, [refresh]);

  const moveSectionLocal = useCallback((from: number, to: number) => {
    if (!activePage) return;
    const sections = sortSections(activePage.sections);
    const [moved] = sections.splice(from, 1);
    sections.splice(to, 0, moved);
    const updated = sections.map((s, i) => ({ ...s, sortOrder: i }));
    setLocalPages(applyPagesUpdate(displayPages, (all) => all.map((p) => (p.id === activePage.id ? { ...p, sections: updated } : p))));
    return updated;
  }, [activePage, displayPages]);

  const moveBlockLocal = useCallback((from: number, to: number) => {
    if (!selectedSection || !activePage) return;
    const blocks = sortBlocks(selectedSection.blocks);
    const [moved] = blocks.splice(from, 1);
    blocks.splice(to, 0, moved);
    const updated = blocks.map((b, i) => ({ ...b, sortOrder: i }));
    setLocalPages(applyPagesUpdate(displayPages, (all) => all.map((p) => ({
      ...p,
      sections: p.sections.map((s) => (s.id === selectedSection.id ? { ...s, blocks: updated } : s)),
    }))));
    return updated;
  }, [selectedSection, activePage, displayPages]);

  const handleSectionDragEnd = useCallback(() => {
    const page = pagesRef.current.find((p) => p.id === (activePageId ?? pagesRef.current[0]?.id));
    if (!page) return;
    void persistSectionOrder(page.sections);
  }, [activePageId, persistSectionOrder]);

  const handleBlockDragEnd = useCallback(() => {
    const page = pagesRef.current.find((p) => p.id === (activePageId ?? pagesRef.current[0]?.id));
    const section = page?.sections.find((s) => s.id === selectedSectionId);
    if (!section) return;
    void persistBlockOrder(section.blocks);
  }, [activePageId, selectedSectionId, persistBlockOrder]);

  const saveBlockMutation = useMutation({
    mutationFn: ({ id, content, label }: { id: string; content: CmsBlockContent; label: string }) =>
      updateCmsBlock(id, { content, label }),
    onSuccess: async () => {
      setDraftBlock(null);
      await refresh();
      toast.success("Block saved");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const handleAddSection = async () => {
    if (!activePage) return;
    try {
      const created = await createCmsSection({ pageId: activePage.id, title: "New Section", type: "page_header" });
      await refresh();
      setSelectedSectionId(created.id);
      setSelectedBlockId(null);
      toast.success("Section added");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const handleAddBlock = async () => {
    if (!selectedSection) return;
    try {
      const created = await createCmsBlock({
        sectionId: selectedSection.id,
        type: "text",
        label: "New Block",
        content: { text: "New content" },
      });
      await refresh();
      setSelectedBlockId(created.id);
      toast.success("Block added");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm("Delete this section and all its blocks?")) return;
    try {
      await deleteCmsSection(id);
      if (selectedSectionId === id) { setSelectedSectionId(null); setSelectedBlockId(null); }
      await refresh();
      toast.success("Section deleted");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm("Delete this block?")) return;
    try {
      await deleteCmsBlock(id);
      if (selectedBlockId === id) setSelectedBlockId(null);
      await refresh();
      toast.success("Block deleted");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const handleToggleSectionVisibility = async (section: CmsSection) => {
    const next = !section.isVisible;
    setLocalPages(patchSectionInPages(displayPages, section.id, { isVisible: next }));
    try {
      await updateCmsSection(section.id, { isVisible: next });
      toast.success(next ? "Section visible" : "Section hidden");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
      await refresh();
    }
  };

  const handleToggleBlockVisibility = async (block: CmsBlock) => {
    const next = !block.isVisible;
    setLocalPages(patchBlockInPages(displayPages, block.id, { isVisible: next }));
    try {
      await updateCmsBlock(block.id, { isVisible: next });
      toast.success(next ? "Block visible" : "Block hidden");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
      await refresh();
    }
  };

  const handleSaveSectionTitle = async () => {
    if (!selectedSection || sectionTitleDraft === selectedSection.title) return;
    try {
      await updateCmsSection(selectedSection.id, { title: sectionTitleDraft });
      await refresh();
      toast.success("Section updated");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const handleSectionTypeChange = async (type: string) => {
    if (!selectedSection) return;
    try {
      await updateCmsSection(selectedSection.id, { type });
      await refresh();
      toast.success("Section type updated");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const handleBlockTypeChange = async (type: string) => {
    if (!selectedBlock) return;
    try {
      await updateCmsBlock(selectedBlock.id, { type });
      await refresh();
      toast.success("Block type updated");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const handleImageUpload = async (file: File) => {
    setImageUploading(true);
    try {
      const url = await uploadCmsImage(file);
      const base = draftBlock ?? { content: selectedBlock?.content ?? {}, label: selectedBlock?.label ?? "Image" };
      setDraftBlock({ ...base, content: { ...base.content, imageUrl: url } });
      toast.success("Image uploaded — click Save Block to apply");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setImageUploading(false);
    }
  };

  const canResetActivePage = activePage ? DEFAULT_PAGE_SLUGS.has(activePage.slug) : false;

  const handleResetPage = async () => {
    if (!activePage || !canResetActivePage) return;
    if (!confirm(`Reset "${activePage.title}" to default design? All your changes on this page will be lost.`)) return;

    setResetting(true);
    try {
      const updated = await resetCmsPage(activePage.id);
      setSelectedSectionId(null);
      setSelectedBlockId(null);
      setDraftBlock(null);
      setLocalPages((prev) => {
        const base = prev ?? pages;
        return base.map((p) => (p.id === updated.id ? updated : p));
      });
      queryClient.setQueryData<CmsPage[]>(["admin-cms-pages"], (old) =>
        old ? old.map((p) => (p.id === updated.id ? updated : p)) : [updated],
      );
      await refresh();
      toast.success("Page reset to default design");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setResetting(false);
    }
  };

  const handleResetAllPages = async () => {
    if (!confirm("Reset ALL pages (Home, Explore, How It Works) to default design? This cannot be undone.")) return;

    setResetting(true);
    try {
      const updatedPages = await resetAllCmsPages();
      setSelectedSectionId(null);
      setSelectedBlockId(null);
      setDraftBlock(null);
      queryClient.setQueryData<CmsPage[]>(["admin-cms-pages"], updatedPages);
      setLocalPages(updatedPages);
      await refresh();
      toast.success("All pages reset to default design");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full min-h-0 flex items-center justify-center bg-[#FAFAFA]">
        <span className="font-['Inter'] text-[11px] tracking-[2px] uppercase text-[#4d4635]">Loading Visual CMS…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full min-h-0 flex flex-col items-center justify-center gap-3 bg-[#FAFAFA] p-8">
        <span className="font-['Inter'] text-[13px] text-[#c62828]">Failed to load CMS: {getApiErrorMessage(error)}</span>
        <button onClick={() => refresh()} className="px-4 py-2 bg-[#1a1c1c] text-white text-[11px] uppercase cursor-pointer">Retry</button>
      </div>
    );
  }

  if (!displayPages.length) {
    return (
      <div className="h-full min-h-0 flex flex-col items-center justify-center gap-3 bg-[#FAFAFA] p-8">
        <span className="font-['Inter'] text-[13px] text-[#4d4635]">No CMS pages found. Run: php artisan db:seed --class=CmsPageLayoutSeeder</span>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Toaster position="bottom-right" richColors />
      <div className="h-full min-h-0 flex flex-col bg-[#f0f0f0] overflow-hidden">
        <div className="flex items-center justify-between px-[24px] py-[14px] bg-white border-b border-neutral-200 shrink-0">
          <div className="flex items-center gap-[16px]">
            <div className="bg-[#d4af37] h-px w-[32px]" />
            <div>
              <h1 className="font-['Noto_Serif'] font-semibold text-[#1a1c1c] text-[18px]">Visual Page Builder</h1>
              <p className="font-['Inter'] text-[#9e9e9e] text-[11px]">Drag ⋮⋮ handle · Edit right panel · Save to publish live</p>
            </div>
          </div>
          {activePage && (
            <div className="flex items-center gap-[8px]">
              <button
                type="button"
                onClick={handleResetPage}
                disabled={resetting || !canResetActivePage}
                title={canResetActivePage ? "Reset this page to default design" : "No default layout for this page"}
                className="flex items-center gap-[6px] px-[12px] py-[8px] border border-neutral-200 text-[#4d4635] font-['Inter'] text-[10px] tracking-[1px] uppercase hover:border-[#c62828] hover:text-[#c62828] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {resetting ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                Reset Page
              </button>
              <button
                type="button"
                onClick={handleResetAllPages}
                disabled={resetting}
                title="Reset Home, Explore, and How It Works to default"
                className="flex items-center gap-[6px] px-[12px] py-[8px] border border-neutral-200 text-[#9e9e9e] font-['Inter'] text-[10px] tracking-[1px] uppercase hover:border-[#c62828] hover:text-[#c62828] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Reset All
              </button>
              <a href={activePage.path} target="_blank" rel="noreferrer" className="flex items-center gap-[6px] px-[12px] py-[8px] border border-neutral-200 text-[#4d4635] font-['Inter'] text-[10px] tracking-[1px] uppercase hover:border-[#d4af37]">
                <ExternalLink size={12} /> Live Page
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center gap-[4px] px-[24px] py-[10px] bg-white border-b border-neutral-200 shrink-0 overflow-x-auto">
          <Layout size={14} color="#735c00" className="mr-2 shrink-0" />
          {displayPages.map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={() => { setActivePageId(page.id); setSelectedSectionId(null); setSelectedBlockId(null); }}
              className="px-[16px] py-[8px] font-['Inter'] text-[10px] tracking-[1.5px] uppercase whitespace-nowrap cursor-pointer transition-colors"
              style={{ background: activePage?.id === page.id ? "#1a1c1c" : "transparent", color: activePage?.id === page.id ? "#fff" : "#4d4635" }}
            >
              {page.title}
            </button>
          ))}
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto bg-[#e8e8e8] p-[24px]">
            <div className="max-w-[1200px] mx-auto bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08)]" style={{ transform: "scale(0.85)", transformOrigin: "top center" }}>
              {activePage && (
                <CmsPageView
                  sections={[...activePage.sections].sort((a, b) => a.sortOrder - b.sortOrder)}
                  ctx={{
                    cmsByKey,
                    preview: true,
                    selectedSectionId,
                    selectedBlockId,
                    onSelectSection: (id) => { setSelectedSectionId(id); setSelectedBlockId(null); },
                    onSelectBlock: (sectionId, blockId) => { setSelectedSectionId(sectionId); setSelectedBlockId(blockId); },
                  }}
                />
              )}
            </div>
          </div>

          <div className="w-[380px] shrink-0 bg-white border-l border-neutral-200 flex flex-col overflow-hidden">
            <div className="px-[20px] py-[16px] border-b border-neutral-200">
              <span className="font-['Inter'] font-semibold text-[#1a1c1c] text-[12px] tracking-[1px] uppercase">Properties Panel</span>
            </div>

            <div className="flex-1 overflow-y-auto p-[16px] flex flex-col gap-[20px]">
              <div>
                <div className="flex items-center justify-between mb-[10px]">
                  <div className="flex items-center gap-[6px]">
                    <Layers size={13} color="#735c00" />
                    <span className="font-['Inter'] text-[10px] tracking-[1.5px] uppercase text-[#4d4635]">Sections</span>
                  </div>
                  <button type="button" onClick={handleAddSection} className="flex items-center gap-[4px] px-[8px] py-[4px] text-[#735c00] font-['Inter'] text-[9px] tracking-[1px] uppercase cursor-pointer hover:bg-[#f9f6ee]">
                    <Plus size={11} /> Add
                  </button>
                </div>
                <div className="flex flex-col gap-[6px]">
                  {activePage?.sections.slice().sort((a, b) => a.sortOrder - b.sortOrder).map((section, index) => (
                    <DraggableRow
                      key={section.id}
                      id={section.id}
                      index={index}
                      kind="section"
                      selected={selectedSectionId === section.id}
                      onSelect={() => { setSelectedSectionId(section.id); setSelectedBlockId(null); }}
                      onMove={moveSectionLocal}
                      onDragEnd={handleSectionDragEnd}
                      actions={
                        <div className="flex items-center gap-[4px]">
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleToggleSectionVisibility(section); }} className="p-1 cursor-pointer hover:bg-neutral-100" title={section.isVisible ? "Hide" : "Show"}>
                            {section.isVisible ? <Eye size={12} color="#4d4635" /> : <EyeOff size={12} color="#9e9e9e" />}
                          </button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }} className="p-1 cursor-pointer hover:bg-red-50" title="Delete">
                            <Trash2 size={12} color="#c62828" />
                          </button>
                        </div>
                      }
                    >
                      <div className="flex flex-col">
                        <span className="font-['Inter'] font-medium text-[#1a1c1c] text-[11px] truncate">{section.title}</span>
                        <span className="font-['Inter'] text-[#9e9e9e] text-[9px] uppercase tracking-[1px]">{section.type.replace(/_/g, " ")}{!section.isVisible ? " · hidden" : ""}</span>
                      </div>
                    </DraggableRow>
                  ))}
                </div>
              </div>

              {selectedSection && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-neutral-200 p-[14px] flex flex-col gap-[12px]">
                  <span className="font-['Inter'] text-[10px] tracking-[1.5px] uppercase text-[#735c00]">Section Settings</span>
                  <input
                    value={sectionTitleDraft}
                    onChange={(e) => setSectionTitleDraft(e.target.value)}
                    onBlur={handleSaveSectionTitle}
                    className="w-full px-[12px] py-[8px] border border-neutral-200 font-['Inter'] text-[12px] outline-none focus:border-[#d4af37]"
                  />
                  <select
                    value={selectedSection.type}
                    onChange={(e) => handleSectionTypeChange(e.target.value)}
                    className="w-full px-[12px] py-[8px] border border-neutral-200 font-['Inter'] text-[12px] outline-none"
                  >
                    {SECTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <div className="flex gap-[6px]">
                    <button type="button" onClick={() => { const s = sortSections(activePage!.sections); const i = s.findIndex((x) => x.id === selectedSection.id); if (i > 0) { const updated = moveSectionLocal(i, i - 1); if (updated) void persistSectionOrder(updated); } }} className="flex-1 flex items-center justify-center gap-1 py-[6px] border border-neutral-200 text-[9px] uppercase cursor-pointer hover:bg-neutral-50"><ChevronUp size={12} /> Up</button>
                    <button type="button" onClick={() => { const s = sortSections(activePage!.sections); const i = s.findIndex((x) => x.id === selectedSection.id); if (i < s.length - 1) { const updated = moveSectionLocal(i, i + 1); if (updated) void persistSectionOrder(updated); } }} className="flex-1 flex items-center justify-center gap-1 py-[6px] border border-neutral-200 text-[9px] uppercase cursor-pointer hover:bg-neutral-50"><ChevronDown size={12} /> Down</button>
                  </div>
                </motion.div>
              )}

              {selectedSection && (
                <div>
                  <div className="flex items-center justify-between mb-[10px]">
                    <div className="flex items-center gap-[6px]">
                      <Box size={13} color="#735c00" />
                      <span className="font-['Inter'] text-[10px] tracking-[1.5px] uppercase text-[#4d4635]">Blocks</span>
                    </div>
                    <button type="button" onClick={handleAddBlock} className="flex items-center gap-[4px] px-[8px] py-[4px] text-[#735c00] font-['Inter'] text-[9px] tracking-[1px] uppercase cursor-pointer hover:bg-[#f9f6ee]">
                      <Plus size={11} /> Add
                    </button>
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    {selectedSection.blocks.slice().sort((a, b) => a.sortOrder - b.sortOrder).map((block, index) => (
                      <DraggableRow
                        key={block.id}
                        id={block.id}
                        index={index}
                        kind="block"
                        sectionId={selectedSection.id}
                        selected={selectedBlockId === block.id}
                        onSelect={() => setSelectedBlockId(block.id)}
                        onMove={moveBlockLocal}
                        onDragEnd={handleBlockDragEnd}
                        actions={
                          <div className="flex items-center gap-[4px]">
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleToggleBlockVisibility(block); }} className="p-1 cursor-pointer hover:bg-neutral-100">
                              {block.isVisible ? <Eye size={12} color="#4d4635" /> : <EyeOff size={12} color="#9e9e9e" />}
                            </button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteBlock(block.id); }} className="p-1 cursor-pointer hover:bg-red-50">
                              <Trash2 size={12} color="#c62828" />
                            </button>
                          </div>
                        }
                      >
                        <div className="flex flex-col">
                          <span className="font-['Inter'] font-medium text-[#1a1c1c] text-[11px] truncate">{block.label}</span>
                          <span className="font-['Inter'] text-[#9e9e9e] text-[9px] uppercase">{block.type}{!block.isVisible ? " · hidden" : ""}</span>
                        </div>
                      </DraggableRow>
                    ))}
                    {selectedSection.blocks.length === 0 && (
                      <p className="font-['Inter'] text-[#9e9e9e] text-[11px] text-center py-[12px]">No blocks — click Add</p>
                    )}
                  </div>
                  {selectedSection.blocks.length > 0 && (
                    <div className="flex gap-[6px] mt-[8px]">
                      <button
                        type="button"
                        onClick={() => {
                          const blocks = sortBlocks(selectedSection.blocks);
                          const i = selectedBlockId ? blocks.findIndex((b) => b.id === selectedBlockId) : -1;
                          if (i > 0) {
                            const updated = moveBlockLocal(i, i - 1);
                            if (updated) void persistBlockOrder(updated);
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-1 py-[6px] border border-neutral-200 text-[9px] uppercase cursor-pointer hover:bg-neutral-50"
                      >
                        <ChevronUp size={12} /> Block Up
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const blocks = sortBlocks(selectedSection.blocks);
                          const i = selectedBlockId ? blocks.findIndex((b) => b.id === selectedBlockId) : -1;
                          if (i >= 0 && i < blocks.length - 1) {
                            const updated = moveBlockLocal(i, i + 1);
                            if (updated) void persistBlockOrder(updated);
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-1 py-[6px] border border-neutral-200 text-[9px] uppercase cursor-pointer hover:bg-neutral-50"
                      >
                        <ChevronDown size={12} /> Block Down
                      </button>
                    </div>
                  )}
                </div>
              )}

              <AnimatePresence>
                {selectedBlock && (
                  <motion.div key={selectedBlock.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border border-[#d4af37] p-[14px] bg-[#f9f6ee]">
                    <div className="flex items-center gap-[6px] mb-[12px]">
                      <GripVertical size={13} color="#735c00" />
                      <span className="font-['Inter'] font-semibold text-[#735c00] text-[10px] tracking-[1.5px] uppercase">Edit Block</span>
                    </div>
                    <select
                      value={selectedBlock.type}
                      onChange={(e) => handleBlockTypeChange(e.target.value)}
                      className="w-full mb-3 px-[12px] py-[8px] border border-neutral-200 font-['Inter'] text-[12px]"
                    >
                      {BLOCK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <BlockEditor
                      block={selectedBlock}
                      draft={draftBlock}
                      onDraftChange={(content, label) => setDraftBlock({ content, label: label ?? selectedBlock.label })}
                      onSave={() => {
                        const payload = draftBlock ?? { content: selectedBlock.content, label: selectedBlock.label };
                        saveBlockMutation.mutate({ id: selectedBlock.id, ...payload });
                      }}
                      saving={saveBlockMutation.isPending}
                      onImageUpload={handleImageUpload}
                      imageUploading={imageUploading}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
