import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import svgPaths from "@/imports/Html→Body/svg-9svfev3e07";
import { fetchProjects } from "@/services/projectsApi";
import { fetchPublicCms } from "@/services/cmsApi";
import type { CmsBlock, CmsSection } from "@/services/pageLayoutApi";
import { findBlock, getBlockText, blocksForRender, sortBlocks, sortSections } from "@/services/pageLayoutApi";
import {
  BUILDING_IMAGES,
  resolveCmsImageUrl,
  resolveProjectHeroImage,
} from "@/assets/buildingImages";
import FundingBar from "@/components/public/FundingBar";
import CostEstimator from "@/components/public/CostEstimator";
import ChooseYourPath from "@/components/public/ChooseYourPath";
import PublicFooter from "@/components/public/PublicFooter";

function blockImageSrc(block: CmsBlock | undefined, fallback: string): string {
  return resolveCmsImageUrl(block?.content?.imageUrl, fallback);
}

export interface CmsRenderContext {
  cmsByKey?: Record<string, string>;
  preview?: boolean;
  selectedSectionId?: string | null;
  selectedBlockId?: string | null;
  onSelectSection?: (id: string) => void;
  onSelectBlock?: (sectionId: string, blockId: string) => void;
}

function resolveText(block: CmsBlock | undefined, cmsByKey: Record<string, string> | undefined, fallback: string): string {
  if (!block) return fallback;
  if (block.content.cmsKey && cmsByKey?.[block.content.cmsKey]) {
    return cmsByKey[block.content.cmsKey];
  }
  return getBlockText(block, fallback);
}

function SelectWrap({
  id,
  type,
  selected,
  preview,
  onClick,
  children,
  className = "",
  hidden,
}: {
  id: string;
  type: "section" | "block";
  selected: boolean;
  preview?: boolean;
  hidden?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  if (!preview) return <div className={className}>{children}</div>;

  return (
    <div
      className={`relative transition-all ${className} ${hidden ? "opacity-40 grayscale" : ""} ${selected ? "ring-2 ring-[#d4af37] ring-offset-2" : "hover:ring-2 hover:ring-[#d4af37]/50 hover:ring-offset-1"}`}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      data-cms-id={id}
      data-cms-type={type}
    >
      {children}
      {hidden && (
        <div className="absolute top-2 left-2 z-20 bg-[#9e9e9e] text-white text-[9px] tracking-[1px] uppercase px-2 py-1">Hidden</div>
      )}
      {selected && (
        <div className="absolute top-2 right-2 z-20 bg-[#1a1c1c] text-white text-[9px] tracking-[1px] uppercase px-2 py-1">
          {type}
        </div>
      )}
    </div>
  );
}

function HeroSection({ section, ctx }: { section: CmsSection; ctx: CmsRenderContext }) {
  const navigate = useNavigate();
  const blocks = section.blocks;
  const headline = resolveText(findBlock(blocks, "heading", "Main Headline"), ctx.cmsByKey, "Bangladesh er Prothom Automated Real Estate Co-operative Platform.");
  const tagline = resolveText(findBlock(blocks, "text", "Sub Tagline"), ctx.cmsByKey, "");
  const primary = blocks.find((b) => b.label === "Primary CTA");
  const secondary = blocks.find((b) => b.label === "Secondary CTA");
  const imageBlock = blocks.find((b) => b.type === "image");
  const heroImageSrc = blockImageSrc(imageBlock, BUILDING_IMAGES.hero);

  return (
    <SelectWrap
      id={section.id}
      type="section"
      preview={ctx.preview}
      selected={ctx.selectedSectionId === section.id}
      onClick={() => ctx.onSelectSection?.(section.id)}
      className="relative w-full"
    >
      <div className="flex flex-col gap-[80px] items-start pb-[64px] px-[64px] pt-[40px]">
        <div className="flex flex-col gap-[24px] items-start max-w-[896px] w-full">
          <div className="bg-[#d4af37] h-px w-[64px]" />
          <SelectWrap id={findBlock(blocks, "heading")?.id ?? "h"} type="block" preview={ctx.preview} selected={ctx.selectedBlockId === findBlock(blocks, "heading")?.id} onClick={() => { const b = findBlock(blocks, "heading"); if (b) ctx.onSelectBlock?.(section.id, b.id); }}>
            <div className="font-['Noto_Serif:Regular',sans-serif] font-normal text-[#1a1c1c] text-[48px] tracking-[-0.96px] leading-[52.8px]" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>{headline}</div>
          </SelectWrap>
          <SelectWrap id={findBlock(blocks, "text")?.id ?? "t"} type="block" preview={ctx.preview} selected={ctx.selectedBlockId === findBlock(blocks, "text")?.id} onClick={() => { const b = findBlock(blocks, "text"); if (b) ctx.onSelectBlock?.(section.id, b.id); }}>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[16px] leading-[24px] max-w-[672px]">{tagline}</p>
          </SelectWrap>
          <div className="flex gap-[16px] items-start pt-[24px] flex-wrap">
            {primary && (
              <button onClick={() => !ctx.preview && navigate(primary.content.url ?? "/explore")} className="relative flex items-center justify-center px-[32px] py-[17px] bg-[#1a1c1c] hover:bg-[#2e2b27] transition-colors cursor-pointer rounded-none">
                <span className="font-['Inter:Regular',sans-serif] font-normal text-white text-[16px] text-center tracking-[1.6px] uppercase leading-[24px]">{resolveText(primary, ctx.cmsByKey, "EXPLORE")}</span>
              </button>
            )}
            {secondary && (
              <button onClick={() => !ctx.preview && navigate(secondary.content.url ?? "/submit-land")} className="group relative flex items-center justify-center px-[33px] py-[17px] hover:bg-[#1a1c1c]/5 transition-colors cursor-pointer">
                <div aria-hidden className="absolute border border-[#1a1c1c] border-solid inset-0 pointer-events-none" />
                <span className="font-['Inter:Regular',sans-serif] font-normal text-[#1a1c1c] text-[16px] text-center tracking-[1.6px] uppercase leading-[24px]">{resolveText(secondary, ctx.cmsByKey, "SUBMIT LAND")}</span>
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col h-[600px] items-start justify-center overflow-clip relative shadow-[0px_4px_16px_0px_rgba(0,0,0,0.05)] w-full">
          <div aria-hidden className="absolute inset-0 pointer-events-none z-10"><div className="absolute bg-white inset-0 mix-blend-saturation" /></div>
            <img alt={imageBlock?.content?.alt ?? ""} className="absolute h-[104.62%] left-0 max-w-none top-[-2.31%] w-full object-cover" src={heroImageSrc} />
        </div>
      </div>
    </SelectWrap>
  );
}

function QuickLinksSection({ section, ctx }: { section: CmsSection; ctx: CmsRenderContext }) {
  const navigate = useNavigate();
  const cards = blocksForRender(section.blocks, ctx.preview).filter((b) => b.type === "card");

  return (
    <SelectWrap id={section.id} type="section" preview={ctx.preview} selected={ctx.selectedSectionId === section.id} onClick={() => ctx.onSelectSection?.(section.id)} className="bg-[#f3f3f3] relative w-full" hidden={ctx.preview && !section.isVisible}>
      <div className="flex flex-col lg:flex-row gap-[32px] items-stretch p-[64px]">
        {cards.map((card, i) => (
          <SelectWrap key={card.id} id={card.id} type="block" preview={ctx.preview} selected={ctx.selectedBlockId === card.id} hidden={ctx.preview && !card.isVisible} onClick={() => ctx.onSelectBlock?.(section.id, card.id)} className="flex-1">
            <button
              onClick={() => !ctx.preview && navigate(card.content.url ?? "/")}
              className={`w-full text-left overflow-hidden cursor-pointer hover:shadow-[0px_8px_24px_rgba(0,0,0,0.06)] transition-shadow group h-full ${i === 0 ? "bg-white" : "bg-[#e2e2e2]"}`}
            >
              <div className="h-[200px] w-full overflow-hidden relative">
                <img
                  src={blockImageSrc(card, BUILDING_IMAGES.projects[i % BUILDING_IMAGES.projects.length])}
                  alt={card.content.alt ?? card.content.title ?? "Estate Archive project"}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-white/10 mix-blend-saturation pointer-events-none" />
              </div>
              <div className="p-[48px]">
              <span className="font-['Inter:Regular',sans-serif] text-[#735c00] text-[10px] tracking-[3px] uppercase">{card.content.eyebrow}</span>
              <div className="font-['Noto_Serif:Regular',sans-serif] text-[#1a1c1c] text-[24px] leading-[32px] pt-[16px] pb-[12px]" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>{card.content.title}</div>
              <p className="font-['Inter:Regular',sans-serif] text-[#4d4635] text-[14px] leading-[20px] pb-[24px]">{card.content.description}</p>
              <span className="font-['Inter:Regular',sans-serif] text-[#735c00] text-[12px] tracking-[1.5px] uppercase group-hover:underline">{card.content.cta}</span>
              </div>
            </button>
          </SelectWrap>
        ))}
      </div>
    </SelectWrap>
  );
}

function PageHeaderSection({ section, ctx }: { section: CmsSection; ctx: CmsRenderContext }) {
  const eyebrow = findBlock(section.blocks, "eyebrow");
  const heading = findBlock(section.blocks, "heading");
  const text = findBlock(section.blocks, "text");
  const headerImage = section.blocks.find((b) => b.type === "image");

  return (
    <SelectWrap id={section.id} type="section" preview={ctx.preview} selected={ctx.selectedSectionId === section.id} onClick={() => ctx.onSelectSection?.(section.id)} className="relative w-full bg-white border-b border-[#eee]">
      {headerImage && (
        <div className="w-full h-[280px] overflow-hidden relative">
          <img
            src={blockImageSrc(headerImage, BUILDING_IMAGES.hero)}
            alt={headerImage.content.alt ?? "Estate Archive"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
        </div>
      )}
      <div className="flex flex-col gap-[24px] items-start p-[64px]">
        {eyebrow && <span className="font-['Inter:Regular',sans-serif] font-normal text-[#735c00] text-[10px] tracking-[3px] uppercase leading-[15px]">{getBlockText(eyebrow)}</span>}
        {heading && <div className="font-['Noto_Serif:Regular',sans-serif] font-normal text-[#1a1c1c] text-[40px] tracking-[-0.8px] leading-[44px] max-w-[720px]" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>{getBlockText(heading)}</div>}
        {text && <p className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[16px] leading-[24px] max-w-[640px]">{getBlockText(text)}</p>}
      </div>
    </SelectWrap>
  );
}

function ProjectGridSection({ section, ctx }: { section: CmsSection; ctx: CmsRenderContext }) {
  const navigate = useNavigate();
  const { data: apiProjects = [], isLoading } = useQuery({ queryKey: ["projects"], queryFn: fetchProjects, enabled: !ctx.preview });
  const title = findBlock(section.blocks, "heading");
  const subtitle = findBlock(section.blocks, "text");

  const projects = apiProjects.map((p, index) => ({
    id: p.id,
    img: resolveProjectHeroImage(p.heroImage, index),
    locationLabel: p.location.toUpperCase(),
    name: p.title,
    price: p.displayPrice ?? "—",
    sft: p.displaySft ?? "—",
    percent: Math.round(p.fundingPercentage),
    remaining: `${p.availableShares} SHARES REMAINING`,
    phaseLabel: p.phaseLabel,
  }));

  return (
    <SelectWrap id={section.id} type="section" preview={ctx.preview} selected={ctx.selectedSectionId === section.id} onClick={() => ctx.onSelectSection?.(section.id)} className="bg-[#f9f9f9] relative w-full">
      <div className="flex flex-col gap-[48px] items-start p-[64px]">
        <div className="flex flex-col gap-[8px]">
          {title && <span className="font-['Noto_Serif:Regular',sans-serif] text-[#1a1c1c] text-[16px]">{getBlockText(title)}</span>}
          {subtitle && <span className="font-['Inter:Regular',sans-serif] text-[#4d4635] text-[16px]">{getBlockText(subtitle)}</span>}
        </div>
        {ctx.preview && projects.length === 0 && (
          <div className="grid grid-cols-3 gap-[32px] w-full">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-[#eee] h-[360px] flex items-center justify-center text-[#9e9e9e] text-[11px] uppercase tracking-[2px]">Project Card {n}</div>
            ))}
          </div>
        )}
        {!ctx.preview && isLoading && <span className="font-['Inter'] text-[12px] tracking-[2px] uppercase text-[#4d4635]">Loading projects…</span>}
        {!ctx.preview && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[48px] w-full">
            {projects.map((p) => (
              <button key={p.id} onClick={() => navigate(`/project/${p.id}`)} className="flex flex-col gap-[8px] items-start cursor-pointer text-left group">
                <div className="bg-[#eee] relative shadow-[0px_4px_16px_0px_rgba(0,0,0,0.05)] w-full overflow-hidden">
                  <div className="h-[360px] relative w-full"><img alt={p.name} className="absolute h-full left-[-64.7%] max-w-none top-0 w-[229.39%] object-cover group-hover:scale-[1.02] transition-transform duration-500" src={p.img} /><div className="absolute inset-0 bg-white mix-blend-saturation pointer-events-none" /></div>
                  <div className="absolute backdrop-blur-[4px] bg-[rgba(255,255,255,0.9)] left-[16px] px-[12px] py-[4px] top-[16px]"><span className="font-['Inter'] text-[10px] tracking-[0.5px] uppercase">{p.locationLabel}</span></div>
                </div>
                <div className="font-['Noto_Serif:Regular',sans-serif] text-[#1a1c1c] text-[16px] pt-[16px]">{p.name}</div>
                <div className="flex items-center justify-between pb-[8px] w-full"><span className="font-['Inter'] text-[#735c00] text-[16px]">{p.price}</span><span className="font-['Inter'] text-[#4d4635] text-[12px]">{p.sft}</span></div>
                <FundingBar percent={p.percent} label={`${p.percent}% Funded`} remaining={p.remaining} />
              </button>
            ))}
          </div>
        )}
      </div>
    </SelectWrap>
  );
}

function StepsSection({ section, ctx }: { section: CmsSection; ctx: CmsRenderContext }) {
  const steps = blocksForRender(section.blocks, ctx.preview).filter((b) => b.type === "step");

  return (
    <SelectWrap id={section.id} type="section" preview={ctx.preview} selected={ctx.selectedSectionId === section.id} onClick={() => ctx.onSelectSection?.(section.id)} className="relative w-full bg-white">
      <div className="flex flex-col gap-[64px] items-start p-[64px]">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[32px] w-full">
          {steps.map((step) => (
            <SelectWrap key={step.id} id={step.id} type="block" preview={ctx.preview} selected={ctx.selectedBlockId === step.id} hidden={ctx.preview && !step.isVisible} onClick={() => ctx.onSelectBlock?.(section.id, step.id)}>
              <div className="bg-[#f9f9f9] drop-shadow-[0px_4px_8px_rgba(0,0,0,0.05)] relative h-full overflow-hidden">
                {step.content.imageUrl && (
                  <div className="h-[140px] w-full overflow-hidden">
                    <img
                      src={blockImageSrc(step, BUILDING_IMAGES.hero)}
                      alt={step.content.alt ?? step.content.title ?? "Process step"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-[16px] items-center pb-[32px] pt-[48px] px-[32px]">
                  <div className="-translate-x-1/2 absolute bg-[#735c00] flex items-center justify-center left-1/2 size-[32px] top-[-16px]"><span className="font-['Inter'] font-bold text-white text-[16px]">{step.content.num}</span></div>
                  <span className="font-['Noto_Serif:Regular',sans-serif] text-[#1a1c1c] text-[16px] text-center">{step.content.title}</span>
                  <span className="font-['Inter:Regular',sans-serif] text-[#4d4635] text-[14px] text-center">{step.content.desc}</span>
                  <span className="font-['Inter:Regular',sans-serif] text-[#735c00] text-[12px] text-center opacity-80">{step.content.detail}</span>
                </div>
              </div>
            </SelectWrap>
          ))}
        </div>
      </div>
    </SelectWrap>
  );
}

function TrustPillarsSection({ section, ctx }: { section: CmsSection; ctx: CmsRenderContext }) {
  const cards = blocksForRender(section.blocks, ctx.preview).filter((b) => b.type === "card");

  return (
    <SelectWrap id={section.id} type="section" preview={ctx.preview} selected={ctx.selectedSectionId === section.id} onClick={() => ctx.onSelectSection?.(section.id)} className="relative w-full">
      <div className="flex flex-col gap-[48px] items-start p-[64px]">
        <span className="font-['Noto_Serif:Regular',sans-serif] text-[#1a1c1c] text-[16px]">Built on Institutional Safeguards</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[32px] w-full">
          {cards.map((card) => (
            <SelectWrap key={card.id} id={card.id} type="block" preview={ctx.preview} selected={ctx.selectedBlockId === card.id} hidden={ctx.preview && !card.isVisible} onClick={() => ctx.onSelectBlock?.(section.id, card.id)}>
              <div className="bg-white flex flex-col shadow-[0px_4px_16px_0px_rgba(0,0,0,0.05)] h-full overflow-hidden">
                {card.content.imageUrl && (
                  <div className="h-[160px] w-full overflow-hidden">
                    <img
                      src={blockImageSrc(card, BUILDING_IMAGES.hero)}
                      alt={card.content.alt ?? card.content.title ?? "Trust pillar"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-[32px] flex flex-col gap-[12px]">
                <div className="h-[22px] w-[30px]"><svg className="block w-full h-full" fill="none" viewBox="0 0 30.4614 22.0383"><path d={svgPaths.p2af9b080} fill="#735C00" /></svg></div>
                <span className="font-['Noto_Serif:Regular',sans-serif] text-[#1a1c1c] text-[16px]">{card.content.title}</span>
                <span className="font-['Inter:Regular',sans-serif] text-[#4d4635] text-[14px]">{card.content.description}</span>
                </div>
              </div>
            </SelectWrap>
          ))}
        </div>
      </div>
    </SelectWrap>
  );
}

function CtaBannerSection({ section, ctx }: { section: CmsSection; ctx: CmsRenderContext }) {
  const navigate = useNavigate();
  const heading = findBlock(section.blocks, "heading");
  const text = findBlock(section.blocks, "text");
  const buttons = blocksForRender(section.blocks, ctx.preview).filter((b) => b.type === "button");

  return (
    <SelectWrap id={section.id} type="section" preview={ctx.preview} selected={ctx.selectedSectionId === section.id} onClick={() => ctx.onSelectSection?.(section.id)} className="bg-[#1a1c1c] relative w-full">
      <div className="flex flex-col md:flex-row gap-[32px] items-center justify-between p-[64px]">
        <div className="flex flex-col gap-[12px]">
          {heading && <span className="font-['Noto_Serif:Regular',sans-serif] text-white text-[24px]">{getBlockText(heading)}</span>}
          {text && <span className="font-['Inter:Regular',sans-serif] text-[#d0c5af] text-[14px] max-w-[480px]">{getBlockText(text)}</span>}
        </div>
        <div className="flex gap-[16px] flex-wrap">
          {buttons.map((btn) => (
            <button key={btn.id} onClick={() => !ctx.preview && navigate(btn.content.url ?? "/")} className={`relative px-[32px] py-[17px] cursor-pointer transition-colors ${btn.content.variant === "gold" ? "bg-[#d4af37] hover:bg-[#c4a030]" : "hover:bg-white/5"}`}>
              {btn.content.variant !== "gold" && <div aria-hidden className="absolute border border-white/40 border-solid inset-0 pointer-events-none" />}
              <span className={`font-['Inter:Regular',sans-serif] text-[14px] tracking-[1.4px] uppercase ${btn.content.variant === "gold" ? "text-[#1a1c1c]" : "text-white"}`}>{getBlockText(btn)}</span>
            </button>
          ))}
        </div>
      </div>
    </SelectWrap>
  );
}

export function CmsSectionRenderer({ section, ctx }: { section: CmsSection; ctx: CmsRenderContext }) {
  if (!section.isVisible && !ctx.preview) return null;

  switch (section.type) {
    case "hero": return <HeroSection section={section} ctx={ctx} />;
    case "quick_links": return <QuickLinksSection section={section} ctx={ctx} />;
    case "page_header": return <PageHeaderSection section={section} ctx={ctx} />;
    case "project_grid": return <ProjectGridSection section={section} ctx={ctx} />;
    case "cost_estimator": return <SelectWrap id={section.id} type="section" preview={ctx.preview} selected={ctx.selectedSectionId === section.id} onClick={() => ctx.onSelectSection?.(section.id)}><CostEstimator /></SelectWrap>;
    case "steps": return <StepsSection section={section} ctx={ctx} />;
    case "choose_path": return <SelectWrap id={section.id} type="section" preview={ctx.preview} selected={ctx.selectedSectionId === section.id} onClick={() => ctx.onSelectSection?.(section.id)}><ChooseYourPath /></SelectWrap>;
    case "trust_pillars": return <TrustPillarsSection section={section} ctx={ctx} />;
    case "cta_banner": return <CtaBannerSection section={section} ctx={ctx} />;
    case "footer": return <SelectWrap id={section.id} type="section" preview={ctx.preview} selected={ctx.selectedSectionId === section.id} onClick={() => ctx.onSelectSection?.(section.id)}><PublicFooter /></SelectWrap>;
    default: return null;
  }
}

export function CmsPageView({
  sections,
  ctx,
  className = "",
}: {
  sections: CmsSection[];
  ctx: CmsRenderContext;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-start w-full ${className}`} style={{ background: "linear-gradient(90deg, rgb(249,249,249) 0%, rgb(249,249,249) 100%)" }}>
      {sortSections(sections).filter((s) => s.isVisible || ctx.preview).map((section) => (
        <CmsSectionRenderer key={section.id} section={{ ...section, blocks: sortBlocks(section.blocks) }} ctx={ctx} />
      ))}
    </div>
  );
}

export function useCmsByKey() {
  const { data } = useQuery({ queryKey: ["cms"], queryFn: fetchPublicCms });
  return data?.byKey ?? {};
}
