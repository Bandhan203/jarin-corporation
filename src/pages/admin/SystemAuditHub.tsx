import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2, Clock4, AlertCircle, ChevronDown, ChevronRight,
  Globe, User, Building2, Server, RefreshCw, Download,
  BarChart2, FileText, Database, MessageSquare, CreditCard,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
type ItemStatus = "complete" | "draft" | "missing";
type FrameKey   = "web" | "investor" | "landowner" | "backend";

interface AuditItem {
  id: string;
  label: string;
  detail: string;
  status: ItemStatus;
  lastChecked: string;
  owner: string;
}

interface AuditFrame {
  key: FrameKey;
  label: string;
  icon: React.FC<{ size: number; color: string }>;
  items: AuditItem[];
}

// ── Mock Data ──────────────────────────────────────────────────────
const FRAMES: AuditFrame[] = [
  {
    key: "web",
    label: "Frame A — General Web Flows",
    icon: Globe,
    items: [
      { id: "w1", label: "Landing Page Assets",          detail: "Hero section, project cards, stat counters, CTA buttons", status: "complete", lastChecked: "2026-07-10", owner: "frontend" },
      { id: "w2", label: "Active Filter System Grid",    detail: "Project listing with filter by status, location, katha size", status: "complete", lastChecked: "2026-07-08", owner: "frontend" },
      { id: "w3", label: "Project Single View Detail",   detail: "Gallery carousel, floor matrix, document vault, booking CTA", status: "complete", lastChecked: "2026-07-09", owner: "frontend" },
      { id: "w4", label: "Submit Land Form",             detail: "Multi-step landowner submission flow with file upload", status: "complete", lastChecked: "2026-07-06", owner: "frontend" },
      { id: "w5", label: "Floor Matrix Drawer Panel",    detail: "Click-to-open unit detail drawer with pricing, reserve CTA", status: "complete", lastChecked: "2026-07-10", owner: "frontend" },
      { id: "w6", label: "Public SEO & OG Meta Tags",    detail: "og:title, og:image, og:description per route", status: "draft", lastChecked: "2026-07-01", owner: "frontend" },
      { id: "w7", label: "404 & Error Boundary Screens", detail: "RouteErrorBoundary, NotFound component, fallback UI", status: "complete", lastChecked: "2026-07-05", owner: "frontend" },
      { id: "w8", label: "Mobile Responsive Breakpoints",detail: "Responsive grid collapse at ≤1024px across all pages", status: "draft", lastChecked: "2026-06-28", owner: "frontend" },
    ],
  },
  {
    key: "investor",
    label: "Frame B — Investor Portal Modules",
    icon: User,
    items: [
      { id: "i1", label: "Investor Dashboard Overview",  detail: "Asset value KPI, installment countdown, legal standing card", status: "complete", lastChecked: "2026-07-10", owner: "product" },
      { id: "i2", label: "Accounts & Ledger View",       detail: "Full installment schedule, payment history table, summary strip", status: "complete", lastChecked: "2026-07-08", owner: "product" },
      { id: "i3", label: "Payment Success + Downloader", detail: "88/12 split receipt, progress bar, print + download invoice", status: "complete", lastChecked: "2026-07-10", owner: "product" },
      { id: "i4", label: "Performance Metrics Wheels",   detail: "Radial bar chart for milestone progress, structural completion", status: "complete", lastChecked: "2026-07-09", owner: "product" },
      { id: "i5", label: "Watermarked PDF Deed Viewer",  detail: "SHA-256 watermark, canvas overlay, download PNG, resize observer", status: "complete", lastChecked: "2026-07-08", owner: "security" },
      { id: "i6", label: "NID OCR Verification Banner",  detail: "Persistent banner, drag-drop NID upload, 3-state result UI", status: "complete", lastChecked: "2026-07-07", owner: "compliance" },
      { id: "i7", label: "Role-Protected Route Guard",   detail: "Zustand auth, RoleProtectedRoute, 403 screen, demo seeder", status: "complete", lastChecked: "2026-07-06", owner: "security" },
      { id: "i8", label: "bKash / Nagad Payment Gateway",detail: "Real payment integration with 88/12 escrow webhook routing", status: "missing", lastChecked: "2026-06-15", owner: "payments" },
    ],
  },
  {
    key: "landowner",
    label: "Frame C — Landowner Portal Modules",
    icon: Building2,
    items: [
      { id: "l1", label: "Portfolio Management Hub",     detail: "4-KPI grid, property overview, contract summary card", status: "complete", lastChecked: "2026-07-10", owner: "product" },
      { id: "l2", label: "Swap Unit Tracker Table",      detail: "7-unit table, per-unit stage progress bars, status dots", status: "complete", lastChecked: "2026-07-08", owner: "product" },
      { id: "l3", label: "Historical Valuation Chart",   detail: "Recharts ComposedChart, dual actual/projected lines, premium tooltip", status: "complete", lastChecked: "2026-07-09", owner: "analytics" },
      { id: "l4", label: "Analytics API Integration",    detail: "fetchLandownerAnalytics() mock → real VITE_API_BASE_URL endpoint", status: "draft", lastChecked: "2026-07-01", owner: "backend" },
      { id: "l5", label: "Projected Portfolio Value",    detail: "Dark charcoal card with growth % from API response", status: "complete", lastChecked: "2026-07-08", owner: "product" },
      { id: "l6", label: "Landowner Legal Documents",    detail: "CS/RS deed viewer, mutation document download section", status: "missing", lastChecked: "2026-06-10", owner: "legal" },
    ],
  },
  {
    key: "backend",
    label: "Frame D — Global Backend Engine Status",
    icon: Server,
    items: [
      { id: "b1", label: "bKash / Nagad Webhook Handler",   detail: "Laravel WebhookController, HMAC signature verification, 88/12 DB split", status: "complete", lastChecked: "2026-07-08", owner: "backend" },
      { id: "b2", label: "Overdue Invoice Cron Scanner",    detail: "ProcessOverdueInvoices command, 3-month lockout, dry-run flag", status: "complete", lastChecked: "2026-07-07", owner: "backend" },
      { id: "b3", label: "SMS Gateway Triggers",            detail: "SSL Wireless / Mimsms adapter, normalised BD phone numbers", status: "complete", lastChecked: "2026-07-06", owner: "infra" },
      { id: "b4", label: "Dynamic Payment Cron Logs",       detail: "Cron schedule, InvestorDefaulted event broadcast, admin.risk-flags", status: "complete", lastChecked: "2026-07-05", owner: "backend" },
      { id: "b5", label: "OCR Data Parser (NID)",           detail: "AWS Textract adapter, 10/13/17-digit NID validation, S3 storage", status: "complete", lastChecked: "2026-07-04", owner: "ml" },
      { id: "b6", label: "Payment Ledger DB Schema",        detail: "5-table migration: payment_ledger, project_escrow, corporate_profit, nid_verifications, inventory_units", status: "complete", lastChecked: "2026-07-03", owner: "data" },
      { id: "b7", label: "Sanctum Auth + Role Middleware",  detail: "auth:sanctum, throttle:60,1, role:super_admin guard on cost routes", status: "draft", lastChecked: "2026-07-02", owner: "backend" },
      { id: "b8", label: "Landowner Analytics Endpoint",   detail: "GET /api/landowner/{id}/analytics — currently returns 501", status: "missing", lastChecked: "2026-06-20", owner: "backend" },
      { id: "b9", label: "Email Notification Templates",   detail: "Blade mail templates for payment confirmation, overdue notices", status: "missing", lastChecked: "2026-06-10", owner: "backend" },
      { id: "b10", label: "Production S3 Configuration",   detail: "AWS S3 bucket, AES-256 SSE, lifecycle policies, CDN origin", status: "draft", lastChecked: "2026-07-01", owner: "infra" },
    ],
  },
];

// ── Status Config ──────────────────────────────────────────────────
const STATUS_CONFIG: Record<ItemStatus, {
  color: string; bg: string; border: string; dotColor: string;
  label: string; Icon: React.FC<{ size: number; color: string }>;
}> = {
  complete: {
    color: "#2e7d32", bg: "#f0fff4", border: "#b5d6b7", dotColor: "#2e7d32",
    label: "Complete", Icon: CheckCircle2,
  },
  draft: {
    color: "#c09000", bg: "#fffbeb", border: "#e0c97a", dotColor: "#d4af37",
    label: "Under Dev / Draft", Icon: Clock4,
  },
  missing: {
    color: "#dc2626", bg: "#fff1f2", border: "#fca5a5", dotColor: "#dc2626",
    label: "Missing Hook", Icon: AlertCircle,
  },
};

// ── Status Badge ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: ItemStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-[5px] px-[8px] py-[3px] font-['Inter'] font-medium text-[8px] tracking-[1.2px] uppercase shrink-0 border"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
    >
      <cfg.Icon size={9} color={cfg.color} />
      {cfg.label}
    </span>
  );
}

// ── Audit Frame Column ─────────────────────────────────────────────
function AuditColumn({ frame, onToggleStatus }: {
  frame: AuditFrame;
  onToggleStatus: (frameKey: FrameKey, itemId: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const counts = {
    complete: frame.items.filter(i => i.status === "complete").length,
    draft:    frame.items.filter(i => i.status === "draft").length,
    missing:  frame.items.filter(i => i.status === "missing").length,
  };

  const headerColor = frame.key === "web"      ? "#735c00"
    : frame.key === "investor"  ? "#1a6b8a"
    : frame.key === "landowner" ? "#2e7d32"
    : "#5c4d8a";

  return (
    <div className="flex flex-col bg-card-bg border border-neutral-200 shadow-[var(--shadow-premium-sm)] min-w-0">
      {/* Column header */}
      <div
        className="px-[18px] py-[16px] border-b border-neutral-200 cursor-pointer hover:bg-premium-bg transition-colors"
        style={{ borderLeft: `3px solid ${headerColor}` }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center justify-between mb-[10px]">
          <div className="flex items-center gap-[8px]">
            <frame.icon size={14} color={headerColor} />
            <span className="font-['Noto_Serif'] font-semibold text-charcoal text-[12px] leading-[16px]">{frame.label}</span>
          </div>
          <motion.div animate={{ rotate: collapsed ? -90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={13} color="#4d4635" />
          </motion.div>
        </div>
        {/* Mini scoreboard */}
        <div className="flex gap-[6px]">
          <span className="px-[6px] py-[2px] text-[8px] font-['Inter'] font-medium tracking-[1px] uppercase bg-[#f0fff4] text-[#2e7d32]">{counts.complete} done</span>
          {counts.draft > 0 && <span className="px-[6px] py-[2px] text-[8px] font-['Inter'] font-medium tracking-[1px] uppercase bg-[#fffbeb] text-[#c09000]">{counts.draft} draft</span>}
          {counts.missing > 0 && <span className="px-[6px] py-[2px] text-[8px] font-['Inter'] font-medium tracking-[1px] uppercase bg-[#fff1f2] text-[#dc2626]">{counts.missing} missing</span>}
        </div>
      </div>

      {/* Items */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.24 }}
            className="overflow-hidden"
          >
            {frame.items.map((item, i) => {
              const cfg = STATUS_CONFIG[item.status];
              const isExpanded = expandedId === item.id;
              return (
                <motion.div
                  key={item.id}
                  className="border-b border-neutral-100 last:border-b-0"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  {/* Item row */}
                  <div
                    className="flex items-start gap-[10px] px-[16px] py-[12px] cursor-pointer hover:bg-premium-bg transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    {/* Status dot */}
                    <div
                      className="w-[8px] h-[8px] rounded-full mt-[5px] shrink-0 border"
                      style={{ background: cfg.dotColor, borderColor: cfg.border }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-[6px]">
                        <span className="font-['Inter'] font-semibold text-charcoal text-[11px] leading-[16px]">{item.label}</span>
                        <StatusBadge status={item.status} />
                      </div>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-[8px] flex flex-col gap-[8px]"
                        >
                          <p className="font-['Inter'] font-normal text-text-secondary text-[10px] leading-[16px]">
                            {item.detail}
                          </p>
                          <div className="flex items-center gap-[12px]">
                            <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[0.5px] uppercase">Checked: {item.lastChecked}</span>
                            <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[0.5px] uppercase">Owner: {item.owner}</span>
                          </div>
                          {/* Status toggle buttons */}
                          <div className="flex gap-[4px] flex-wrap">
                            {(["complete", "draft", "missing"] as ItemStatus[]).map((s) => (
                              <button
                                key={s}
                                onClick={(e) => { e.stopPropagation(); onToggleStatus(frame.key, item.id); }}
                                className="px-[8px] py-[3px] font-['Inter'] font-medium text-[8px] tracking-[1px] uppercase border transition-colors cursor-pointer"
                                style={{
                                  borderColor: item.status === s ? STATUS_CONFIG[s].border : "#e8e8e8",
                                  background: item.status === s ? STATUS_CONFIG[s].bg : "white",
                                  color: item.status === s ? STATUS_CONFIG[s].color : "#9e9e9e",
                                }}
                              >
                                {STATUS_CONFIG[s].label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.15 }}
                      className="shrink-0 mt-[2px]"
                    >
                      <ChevronRight size={11} color="#9e9e9e" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────
const STATUS_CYCLE: ItemStatus[] = ["complete", "draft", "missing"];

export default function SystemAuditHub() {
  const [frames, setFrames] = useState<AuditFrame[]>(FRAMES);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [view, setView]   = useState<"grid" | "roadmap">("grid");

  function toggleStatus(frameKey: FrameKey, itemId: string) {
    setFrames((prev) => prev.map((f) => {
      if (f.key !== frameKey) return f;
      return {
        ...f,
        items: f.items.map((item) => {
          if (item.id !== itemId) return item;
          const idx = STATUS_CYCLE.indexOf(item.status);
          return { ...item, status: STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length] };
        }),
      };
    }));
  }

  const allItems    = frames.flatMap((f) => f.items);
  const totalItems  = allItems.length;
  const complete    = allItems.filter((i) => i.status === "complete").length;
  const draft       = allItems.filter((i) => i.status === "draft").length;
  const missing     = allItems.filter((i) => i.status === "missing").length;
  const completePct = Math.round((complete / totalItems) * 100);

  function handleRefresh() {
    setLastRefresh(new Date());
  }

  function exportReport() {
    const lines: string[] = [
      "ESTATE ARCHIVE — PLATFORM COMPLETION INTEGRITY REPORT",
      "=".repeat(56),
      `Generated: ${new Date().toISOString()}`,
      `Overall: ${complete}/${totalItems} complete (${completePct}%)`,
      "",
    ];
    frames.forEach((f) => {
      lines.push(`── ${f.label}`);
      f.items.forEach((item) => {
        lines.push(`  [${item.status.toUpperCase().padEnd(8)}] ${item.label}`);
      });
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `estate-audit-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-[40px] min-h-full bg-premium-bg">
      {/* Header */}
      <div className="mb-[32px]">
        <div className="bg-[#d4af37] h-px w-[40px] mb-[12px]" />
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-['Noto_Serif'] font-semibold text-charcoal text-[28px] leading-[36px] tracking-[-0.4px]">
              Platform Completion Integrity Hub
            </h1>
            <p className="font-['Inter'] font-medium text-text-secondary text-[13px] leading-[20px] mt-[4px]">
              System-wide UX audit, feature status tracking, and backend engine health for all modules.
            </p>
          </div>
          <div className="flex items-center gap-[8px] mt-[4px]">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-[6px] px-[12px] py-[8px] border border-neutral-200 bg-card-bg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <RefreshCw size={11} color="#4d4635" />
              <span className="font-['Inter'] font-medium text-text-secondary text-[9px] tracking-[1.5px] uppercase">Refresh</span>
            </button>
            <button
              onClick={exportReport}
              className="flex items-center gap-[6px] px-[12px] py-[8px] bg-charcoal hover:bg-[#2a2a2a] transition-colors cursor-pointer"
            >
              <Download size={11} color="white" />
              <span className="font-['Inter'] font-semibold text-white text-[9px] tracking-[1.5px] uppercase">Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overall Health Bar */}
      <div className="bg-card-bg border border-neutral-200 p-[24px] mb-[28px] shadow-[var(--shadow-premium-sm)]">
        <div className="flex items-center justify-between mb-[12px]">
          <div>
            <span className="font-['Noto_Serif'] font-bold text-charcoal text-[32px] leading-[36px] tracking-[-0.8px]">{completePct}%</span>
            <span className="font-['Inter'] font-medium text-text-secondary text-[12px] ml-[10px]">Platform Completion</span>
          </div>
          <div className="flex gap-[16px]">
            {[
              { label: "Complete",    count: complete, color: "#2e7d32", bg: "#f0fff4" },
              { label: "In Progress", count: draft,    color: "#c09000", bg: "#fffbeb" },
              { label: "Missing",     count: missing,  color: "#dc2626", bg: "#fff1f2" },
            ].map(({ label, count, color, bg }) => (
              <div key={label} className="flex items-center gap-[8px] px-[12px] py-[8px]" style={{ background: bg }}>
                <span className="font-['Noto_Serif'] font-bold text-[18px]" style={{ color }}>{count}</span>
                <span className="font-['Inter'] font-medium text-[10px] tracking-[1px] uppercase" style={{ color }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Health bar */}
        <div className="h-[6px] w-full bg-neutral-200 rounded-full overflow-hidden flex">
          <motion.div
            className="h-full bg-[#2e7d32] rounded-l-full"
            initial={{ width: 0 }}
            animate={{ width: `${(complete / totalItems) * 100}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <motion.div
            className="h-full bg-[#d4af37]"
            initial={{ width: 0 }}
            animate={{ width: `${(draft / totalItems) * 100}%` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
          />
          <motion.div
            className="h-full bg-[#dc2626] rounded-r-full"
            initial={{ width: 0 }}
            animate={{ width: `${(missing / totalItems) * 100}%` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          />
        </div>

        <p className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[0.5px] uppercase mt-[8px]">
          Last refreshed: {lastRefresh.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} · {totalItems} total checkpoints
        </p>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-[8px] mb-[20px]">
        {(["grid", "roadmap"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="px-[14px] py-[8px] border transition-colors cursor-pointer font-['Inter'] font-medium text-[10px] tracking-[1px] uppercase"
            style={{
              borderColor: view === v ? "#d4af37" : "#e8e8e8",
              background: view === v ? "#f9f6ee" : "white",
              color: view === v ? "#735c00" : "#9e9e9e",
            }}
          >
            {v === "grid" ? "Column Grid View" : "Sequential Roadmap"}
          </button>
        ))}
      </div>

      {/* Grid View — 4 columns */}
      {view === "grid" && (
        <div className="grid grid-cols-2 gap-[16px]">
          {frames.map((frame) => (
            <AuditColumn
              key={frame.key}
              frame={frame}
              onToggleStatus={toggleStatus}
            />
          ))}
        </div>
      )}

      {/* Roadmap View — sequential checklist */}
      {view === "roadmap" && (
        <div className="flex flex-col gap-[4px]">
          {frames.map((frame) => {
            const headerColor = frame.key === "web"      ? "#735c00"
              : frame.key === "investor"  ? "#1a6b8a"
              : frame.key === "landowner" ? "#2e7d32"
              : "#5c4d8a";

            return (
              <div key={frame.key} className="flex flex-col">
                {/* Frame header */}
                <div
                  className="flex items-center gap-[10px] px-[20px] py-[12px] bg-card-bg border border-neutral-200 mb-[2px]"
                  style={{ borderLeft: `4px solid ${headerColor}` }}
                >
                  <frame.icon size={14} color={headerColor} />
                  <span className="font-['Noto_Serif'] font-semibold text-charcoal text-[14px]">{frame.label}</span>
                  <div className="ml-auto flex gap-[6px]">
                    <span className="px-[6px] py-[2px] bg-[#f0fff4] text-[#2e7d32] font-['Inter'] font-medium text-[8px] tracking-[1px] uppercase">
                      {frame.items.filter(i => i.status === "complete").length}/{frame.items.length}
                    </span>
                  </div>
                </div>

                {/* Items in roadmap style */}
                {frame.items.map((item, i) => {
                  const cfg = STATUS_CONFIG[item.status];
                  const isLast = i === frame.items.length - 1;
                  return (
                    <div
                      key={item.id}
                      className="flex gap-[0px]"
                    >
                      {/* Timeline spine */}
                      <div className="flex flex-col items-center w-[40px] shrink-0 ml-[28px]">
                        <div
                          className="w-[10px] h-[10px] rounded-full border-2 z-10 mt-[16px]"
                          style={{ background: cfg.bg, borderColor: cfg.dotColor }}
                        />
                        {!isLast && <div className="w-px flex-1 bg-neutral-200 mt-[2px]" />}
                      </div>

                      {/* Content */}
                      <motion.div
                        className="flex-1 flex items-start gap-[12px] px-[16px] py-[12px] border-b border-neutral-100 ml-[4px] hover:bg-premium-bg transition-colors cursor-pointer"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        onClick={() => toggleStatus(frame.key, item.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <span className="font-['Inter'] font-semibold text-charcoal text-[12px] leading-[18px]">{item.label}</span>
                          <p className="font-['Inter'] font-normal text-text-secondary text-[10px] leading-[16px] mt-[2px] line-clamp-1">{item.detail}</p>
                          <div className="flex items-center gap-[10px] mt-[4px]">
                            <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] uppercase tracking-[0.5px]">{item.owner}</span>
                            <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] uppercase tracking-[0.5px]">{item.lastChecked}</span>
                          </div>
                        </div>
                        <StatusBadge status={item.status} />
                      </motion.div>
                    </div>
                  );
                })}
                <div className="mb-[16px]" />
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-[28px] flex items-center gap-[20px] px-[20px] py-[14px] bg-card-bg border border-neutral-200">
        <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[2px] uppercase">Status Key:</span>
        {(["complete", "draft", "missing"] as ItemStatus[]).map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <div key={s} className="flex items-center gap-[6px]">
              <div className="w-[8px] h-[8px] rounded-full" style={{ background: cfg.dotColor }} />
              <span className="font-['Inter'] font-medium text-text-secondary text-[10px]">{cfg.label}</span>
            </div>
          );
        })}
        <span className="ml-auto font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[0.5px]">
          Click any item to cycle status · Click expand arrow for detail
        </span>
      </div>
    </div>
  );
}
