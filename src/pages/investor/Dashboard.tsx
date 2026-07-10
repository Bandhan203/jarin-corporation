import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { TrendingUp, Clock, Shield, FileText, Camera, ChevronRight, AlertCircle, CheckCircle2, ExternalLink, X } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";
import WatermarkPDFViewer from "@/components/watermark/WatermarkPDFViewer";
import { BUILDING_IMAGES } from "@/assets/buildingImages";

const CONSTRUCTION_UPDATES = [
  { date: "2024-07-05", type: "photo", label: "Foundation pour completed", tag: "STRUCTURAL" },
  { date: "2024-06-28", type: "photo", label: "Column reinforcement inspection passed", tag: "STRUCTURAL" },
  { date: "2024-06-15", type: "video", label: "Weekly site walkthrough uploaded", tag: "PROGRESS VIDEO" },
  { date: "2024-06-01", type: "photo", label: "Excavation & sub-soil testing complete", tag: "CIVIL" },
  { date: "2024-05-20", type: "photo", label: "RAJUK site approval signage installed", tag: "LEGAL" },
];

const MILESTONE_DATA = [
  { name: "Foundation", value: 100, fill: "#1a1c1c" },
  { name: "Structure",  value: 68,  fill: "#735c00" },
  { name: "Finishing",  value: 12,  fill: "#d4af37" },
  { name: "Handover",   value: 0,   fill: "#e8e8e8" },
];

const COUNTDOWN = { days: 14, hours: 6, mins: 32 };

type LegalStatus = "pending" | "registered";

const LEGAL_STATES: Record<LegalStatus, {
  topBarColor: string;
  headline: string;
  badgeText: string;
  badgeDotColor: string;
  badgeBorderColor: string;
  badgeTextColor: string;
  docLabel: string;
  Icon: typeof AlertCircle;
  iconColor: string;
}> = {
  pending: {
    topBarColor: "#c09000",
    headline: "Crowdfund Active",
    badgeText: "Pending Land Crowdfund Funding",
    badgeDotColor: "#c09000",
    badgeBorderColor: "#e0c97a",
    badgeTextColor: "#735c00",
    docLabel: "View Interim Protection",
    Icon: AlertCircle,
    iconColor: "#c09000",
  },
  registered: {
    topBarColor: "#4d4635",
    headline: "Deed Registered",
    badgeText: "CS/RS Mutation — Registered",
    badgeDotColor: "#2e7d32",
    badgeBorderColor: "#b5d6b7",
    badgeTextColor: "#2e7d32",
    docLabel: "View Registered Deed",
    Icon: CheckCircle2,
    iconColor: "#2e7d32",
  },
};


export default function InvestorDashboard() {
  const navigate = useNavigate();
  const [loaded, setLoaded]               = useState(false);
  const [activeTab, setActiveTab]         = useState<"updates" | "gallery">("updates");
  const [legalStatus, setLegalStatus]     = useState<LegalStatus>("pending");
  const [docModal, setDocModal]           = useState(false);
  const [watermarkOpen, setWatermarkOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const goldLine = <div className="bg-[#d4af37] h-px w-[32px] mb-[12px]" />;

  return (
    <DashboardSkeleton loaded={loaded}>
    <div className="p-[40px] min-h-full bg-premium-bg">
      {/* Page header */}
      <div className="mb-[40px]">
        <div className="bg-[#d4af37] h-px w-[40px] mb-[12px]" />
        <h1 className="font-['Noto_Serif'] font-semibold text-charcoal text-[28px] leading-[36px] tracking-[-0.4px]">
          Portfolio Overview
        </h1>
        <p className="font-['Inter'] font-medium text-text-secondary text-[13px] leading-[20px] mt-[4px]">
          The Archive Residence I · Unit 7B · Diabari, Sector 15
        </p>
      </div>

      {/* ── Top: 3 Metric Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-[20px] mb-[32px]">

        {/* Card 1: Asset Value */}
        <div className="bg-card-bg border border-neutral-200 p-[28px] flex flex-col gap-[12px] relative overflow-hidden shadow-[var(--shadow-premium-sm)]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#d4af37]" />
          <div className="flex items-center justify-between">
            <span className="font-['Inter'] font-medium text-text-secondary text-[9px] tracking-[2px] uppercase leading-[14px]">Asset Value</span>
            <TrendingUp size={14} color="#d4af37" />
          </div>
          <div>
            <span className="font-['Noto_Serif'] font-bold text-[#d4af37] text-[28px] leading-[36px] tracking-[-0.5px] count-up">
              ৳ 82.5L
            </span>
          </div>
          <div className="flex items-center gap-[6px]">
            <span className="font-['Inter'] font-medium text-text-secondary text-[9px] tracking-[1px] uppercase leading-[14px]">Market Estimation</span>
            <span className="bg-charcoal text-white font-['Inter'] font-medium text-[8px] tracking-[0.5px] uppercase px-[6px] py-[2px]">+18.3%</span>
          </div>
          <div className="bg-neutral-200 h-[2px] w-full mt-[4px]">
            <div className="bg-[#d4af37] h-full" style={{ width: "72%" }} />
          </div>
        </div>

        {/* Card 2: Next Installment */}
        <div className="bg-card-bg border border-neutral-200 p-[28px] flex flex-col gap-[12px] relative overflow-hidden shadow-[var(--shadow-premium-sm)]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-charcoal" />
          <div className="flex items-center justify-between">
            <span className="font-['Inter'] font-medium text-text-secondary text-[9px] tracking-[2px] uppercase leading-[14px]">Next Installment</span>
            <Clock size={14} color="#1a1c1c" />
          </div>
          <div>
            <span className="font-['Noto_Serif'] font-bold text-charcoal text-[28px] leading-[36px] tracking-[-0.5px] count-up">
              ৳ 98,438
            </span>
          </div>
          <div className="flex items-center gap-[6px]">
            <span className="font-['Inter'] font-medium text-text-secondary text-[9px] tracking-[1px] uppercase leading-[14px]">Due In</span>
          </div>
          <div className="flex gap-[8px]">
            {[{ v: COUNTDOWN.days, l: "Days" }, { v: COUNTDOWN.hours, l: "Hrs" }, { v: COUNTDOWN.mins, l: "Min" }].map(({ v, l }) => (
              <div key={l} className="flex-1 bg-neutral-100 py-[8px] flex flex-col items-center gap-[2px]">
                <span className="font-['Noto_Serif'] font-bold text-charcoal text-[16px] leading-[20px]">
                  {String(v).padStart(2, "0")}
                </span>
                <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[8px] tracking-[1px] uppercase leading-[12px]">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Legal Standing */}
        {(() => {
          const s = LEGAL_STATES[legalStatus];
          return (
            <div className="bg-card-bg border border-neutral-200 p-[28px] flex flex-col gap-[12px] relative overflow-hidden shadow-[var(--shadow-premium-sm)]">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: s.topBarColor }} />
              <div className="flex items-center justify-between">
                <span className="font-['Inter'] font-medium text-text-secondary text-[9px] tracking-[2px] uppercase leading-[14px]">Legal Standing</span>
                <s.Icon size={14} color={s.iconColor} />
              </div>
              <div>
                <span className="font-['Noto_Serif'] font-semibold text-charcoal text-[22px] leading-[30px]">
                  {s.headline}
                </span>
              </div>
              <div className="border px-[10px] py-[6px] flex items-center gap-[6px]" style={{ borderColor: s.badgeBorderColor }}>
                <div className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: s.badgeDotColor }} />
                <span
                  className="font-['Inter'] font-medium text-[9px] tracking-[0.5px] uppercase leading-[14px]"
                  style={{ color: s.badgeTextColor }}
                >
                  {s.badgeText}
                </span>
              </div>
              <button onClick={() => setDocModal(true)} className="flex items-center justify-between mt-[4px] group cursor-pointer">
                <span className="font-['Inter'] font-medium text-warm-brown text-[9px] tracking-[1.5px] uppercase leading-[14px]">{s.docLabel}</span>
                <ExternalLink size={10} color="#735c00" />
              </button>
              <button
                onClick={() => setLegalStatus(legalStatus === "pending" ? "registered" : "pending")}
                className="mt-[2px] border border-dashed border-[#ccc] px-[8px] py-[4px] text-[8px] tracking-[1px] uppercase text-[#9e9e9e] hover:border-[#d4af37] hover:text-[#735c00] transition-colors cursor-pointer font-['Inter']"
              >
                [Demo] Toggle Status
              </button>
            </div>
          );
        })()}
      </div>

      {/* ── Bottom: Updates + Progress ──────────────────────────── */}
      <div className="grid grid-cols-[1fr_340px] gap-[20px]">

        {/* Left: Construction updates */}
        <div className="bg-card-bg border border-neutral-200 flex flex-col shadow-[var(--shadow-premium-sm)]">
          <div className="px-[28px] pt-[28px] pb-[0] border-b border-neutral-200">
            <div className="flex items-center gap-[16px] mb-[16px]">
              {(["updates", "gallery"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="pb-[12px] font-['Inter'] font-medium text-[10px] tracking-[2px] uppercase leading-[15px] transition-colors cursor-pointer relative"
                  style={{ color: activeTab === tab ? "#111111" : "#9e9e9e" }}
                >
                  {tab === "updates" ? "Construction Updates" : "Photo Gallery"}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d4af37]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-[28px] flex flex-col gap-0">
            {activeTab === "updates" && CONSTRUCTION_UPDATES.map((u, i) => (
              <div
                key={u.date}
                className={`flex gap-[16px] pb-[20px] ${i > 0 ? "pt-[20px]" : ""} ${i < CONSTRUCTION_UPDATES.length - 1 ? "border-b border-neutral-100" : ""}`}
              >
                <div className="flex flex-col items-center">
                  <div className="w-[8px] h-[8px] rounded-full mt-[4px]" style={{ background: u.type === "video" ? "#735c00" : "#d4af37" }} />
                  {i < CONSTRUCTION_UPDATES.length - 1 && <div className="w-px flex-1 bg-neutral-200 mt-[4px]" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-[8px] mb-[4px]">
                    <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[1px] uppercase leading-[14px]">{u.date}</span>
                    <span className="bg-neutral-100 font-['Inter'] font-medium text-text-secondary text-[8px] tracking-[1px] uppercase px-[6px] py-[2px]">{u.tag}</span>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    {u.type === "video" ? <Camera size={12} color="#735c00" /> : <FileText size={12} color="#d4af37" />}
                    <span className="font-['Inter'] font-normal text-charcoal text-[12px] leading-[18px]">{u.label}</span>
                  </div>
                </div>
                <button className="shrink-0 flex items-center gap-[4px] px-[10px] py-[5px] border border-neutral-200 hover:border-[#d4af37] transition-colors cursor-pointer self-start">
                  <span className="font-['Inter'] font-medium text-text-secondary text-[8px] tracking-[1px] uppercase leading-[12px]">View</span>
                </button>
              </div>
            ))}

            {activeTab === "gallery" && (
              <div className="grid grid-cols-3 gap-[8px]">
                {BUILDING_IMAGES.gallery.map((img, i) => (
                  <div key={i} className="relative overflow-hidden bg-neutral-200" style={{ paddingBottom: "66%" }}>
                    <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-white mix-blend-saturation pointer-events-none" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Structural progress radial */}
        <div className="bg-card-bg border border-neutral-200 p-[28px] flex flex-col gap-[20px] shadow-[var(--shadow-premium-sm)]">
          {goldLine}
          <h3 className="font-['Noto_Serif'] font-semibold text-charcoal text-[16px] leading-[22px]">
            Structural Progress
          </h3>

          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius={30} outerRadius={90}
                data={MILESTONE_DATA}
                startAngle={90} endAngle={-270}
              >
                <RadialBar dataKey="value" cornerRadius={2} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-card-bg border border-neutral-200 px-[10px] py-[6px] shadow-[var(--shadow-premium-sm)]">
                        <span className="font-['Inter'] font-medium text-charcoal text-[10px] tracking-[1px] uppercase">{d.name}: {d.value}%</span>
                      </div>
                    );
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-[10px]">
            {MILESTONE_DATA.map((m) => (
              <div key={m.name} className="flex items-center justify-between">
                <div className="flex items-center gap-[8px]">
                  <div className="w-[8px] h-[8px] rounded-full" style={{ background: m.fill }} />
                  <span className="font-['Inter'] font-medium text-text-secondary text-[10px] tracking-[0.5px] uppercase leading-[14px]">{m.name}</span>
                </div>
                <span className="font-['Noto_Serif'] font-semibold text-charcoal text-[12px] leading-[18px]">
                  {m.value}%
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-200 pt-[16px]">
            <div className="bg-premium-bg px-[12px] py-[10px] flex flex-col gap-[2px]">
              <span className="font-['Inter'] font-medium text-text-secondary text-[9px] tracking-[2px] uppercase leading-[14px]">Estimated Completion</span>
              <span className="font-['Noto_Serif'] font-semibold text-charcoal text-[14px] leading-[20px]">
                Q3 2026 · 24 months
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Legal Document Modal ─────────────────────────────────── */}
      {docModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(17,17,17,0.72)" }}>
          <div className="bg-card-bg w-full max-w-[560px] mx-[24px] flex flex-col shadow-[var(--shadow-premium-lg)]" style={{ maxHeight: "90vh" }}>
            <div className="flex items-center justify-between px-[32px] pt-[28px] pb-[20px] border-b border-neutral-200">
              <div>
                <div className="bg-[#d4af37] h-px w-[28px] mb-[10px]" />
                <h2 className="font-['Noto_Serif'] font-semibold text-charcoal text-[18px] leading-[26px]">
                  {legalStatus === "pending" ? "Interim Legal Protection" : "Registered Title Deed"}
                </h2>
              </div>
              <button onClick={() => setDocModal(false)} className="p-[8px] hover:bg-neutral-100 transition-colors cursor-pointer">
                <X size={16} color="#4d4635" />
              </button>
            </div>

            <div className="overflow-y-auto px-[32px] py-[28px] flex flex-col gap-[20px]">
              {legalStatus === "pending" ? (
                <>
                  <div className="bg-[#fffbeb] border border-[#e0c97a] px-[16px] py-[12px] flex gap-[10px]">
                    <AlertCircle size={14} color="#c09000" className="shrink-0 mt-[1px]" />
                    <p className="font-['Inter'] font-normal text-warm-brown text-[11px] leading-[18px]">
                      CS/RS mutation deed will be issued automatically upon 100% crowdfund completion. Your investment is protected under cooperative agreement until then.
                    </p>
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <span className="font-['Inter'] font-medium text-text-secondary text-[9px] tracking-[2px] uppercase leading-[14px]">Crowdfund Progress</span>
                    <div className="bg-neutral-100 h-[6px] w-full relative">
                      <div className="bg-[#d4af37] h-full" style={{ width: "67%" }} />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-charcoal" />
                    </div>
                    <div className="flex justify-between">
                      <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[1px] uppercase leading-[14px]">67% Funded</span>
                      <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[1px] uppercase leading-[14px]">Target: ৳ 4.2 Cr</span>
                    </div>
                  </div>
                  <div className="border border-neutral-200 divide-y divide-neutral-100">
                    {[
                      { label: "Protection Type",      value: "Cooperative Share Agreement" },
                      { label: "Cooperative Reg. No.", value: "CRB-2024-00417" },
                      { label: "Agreement Date",       value: "15 March 2024" },
                      { label: "Governing Law",        value: "Cooperative Societies Act 2001" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between px-[14px] py-[10px]">
                        <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[10px] leading-[16px]">{label}</span>
                        <span className="font-['Inter'] font-normal text-charcoal text-[10px] leading-[16px]">{value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-[#f0fff4] border border-[#b5d6b7] px-[16px] py-[12px] flex gap-[10px]">
                    <CheckCircle2 size={14} color="#2e7d32" className="shrink-0 mt-[1px]" />
                    <p className="font-['Inter'] font-normal text-[#2e7d32] text-[11px] leading-[18px]">
                      CS/RS mutation complete. Your unit deed is registered with the Sub-Registrar's Office, Dhaka. Document is legally binding.
                    </p>
                  </div>

                  <button
                    onClick={() => { setDocModal(false); setWatermarkOpen(true); }}
                    className="relative bg-premium-bg border border-neutral-200 flex flex-col items-center justify-center gap-[10px] py-[32px] w-full cursor-pointer hover:border-[#d4af37] transition-colors group"
                  >
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style={{ opacity: 0.08 }}>
                      <span className="font-['Noto_Serif'] text-charcoal text-[48px] font-bold tracking-widest rotate-[-20deg]">
                        CERTIFIED
                      </span>
                    </div>
                    <FileText size={32} color="#d4af37" />
                    <span className="font-['Inter'] font-medium text-text-secondary text-[11px] tracking-[1px] uppercase leading-[16px]">
                      Open Watermarked Deed Viewer
                    </span>
                    <span className="font-['Inter'] font-normal text-[#9e9e9e] text-[9px] leading-[14px]">
                      Unit 7B · The Archive Residence I — Click to view with access watermark
                    </span>
                  </button>

                  <div className="border border-neutral-200 divide-y divide-neutral-100">
                    {[
                      { label: "Deed No.",          value: "DHK-SUB-2025-38819" },
                      { label: "Mouza / Plot",       value: "Diabari, JL No. 41, Plot 118" },
                      { label: "Registration Date",  value: "02 January 2025" },
                      { label: "Storage",            value: "AWS S3 · AES-256 Encrypted" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between px-[14px] py-[10px]">
                        <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[10px] leading-[16px]">{label}</span>
                        <span className="font-['Inter'] font-normal text-charcoal text-[10px] leading-[16px]">{value}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => { setDocModal(false); setWatermarkOpen(true); }}
                    className="flex items-center justify-center gap-[8px] bg-charcoal px-[20px] py-[11px] hover:bg-[#2e2b27] transition-colors cursor-pointer"
                  >
                    <ExternalLink size={12} color="white" />
                    <span className="font-['Inter'] font-semibold text-white text-[9px] tracking-[2px] uppercase leading-[14px]">Open Encrypted Deed Viewer</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Watermark PDF Viewer ─────────────────────────────────── */}
      {watermarkOpen && (
        <WatermarkPDFViewer
          config={{
            documentTitle: "Registered Title Deed — Unit 7B",
            documentRef:   "DHK-SUB-2025-38819",
          }}
          onClose={() => setWatermarkOpen(false)}
        />
      )}
    </div>
    </DashboardSkeleton>
  );
}
