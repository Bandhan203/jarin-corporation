import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Edit3, Save, ChevronDown, Check, CheckCircle, Clock,
  Building2, TrendingUp, DollarSign, Users, Lock, Unlock,
  AlertTriangle, ReceiptText, RefreshCw, ArrowUpRight, Search,
} from "lucide-react";
import { fetchAdminProjects, fetchEscrowLedger, updateAdminProject, type AdminProject } from "@/services/adminApi";
import EditProjectDrawer from "@/components/admin/EditProjectDrawer";
import { fetchProjectMatrixGrid } from "@/services/projectsApi";

// ── Types ──────────────────────────────────────────────────────────
type ProjectStatus = "crowdfunding" | "construction" | "completed" | "handover";
type UnitStatus    = "available" | "reserved" | "sold";
type EscrowStatus  = "held" | "disbursed" | "refunded" | "override_pending";
type Tab           = "projects" | "floors" | "escrow";

interface Project {
  id: string;
  name: string;
  location: string;
  katha: number;
  targetCapital: string;
  raisedPct: number;
  totalUnits: number;
  status: ProjectStatus;
  phase: string;
  completionTarget: string;
  contractor: string;
}

interface FloorUnit {
  id: string;
  floor: number;
  block: string;
  size: string;
  orient: string;
  price: number;
  status: UnitStatus;
}

interface EscrowEntry {
  id: string;
  invoiceNo: string;
  investor: string;
  unit: string;
  amount: number;
  escrow88: number;
  fee12: number;
  status: EscrowStatus;
  gateway: string;
  date: string;
  verifiedBy: string | null;
}

// ── Mock Data (escrow uses API) ──────────────────────────────────────
const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bg: string; dot: string }> = {
  crowdfunding: { label: "Crowdfunding",  color: "#735c00", bg: "#f9f6ee", dot: "#d4af37" },
  construction: { label: "Construction",  color: "#1a6b8a", bg: "#e8f4fa", dot: "#1a6b8a" },
  completed:    { label: "Completed",     color: "#2e7d32", bg: "#f0fff4", dot: "#2e7d32" },
  handover:     { label: "Handover",      color: "#5c4d8a", bg: "#f3f0ff", dot: "#5c4d8a" },
};

function buildFloors(projectId: string): FloorUnit[] {
  const statuses: UnitStatus[] = ["available", "sold", "reserved", "available", "sold", "available", "reserved", "reserved", "sold"];
  const orients = ["North-Facing", "South-Facing", "East-Facing"];
  const sizes   = ["1,200 SFT", "1,350 SFT", "1,500 SFT"];
  const units: FloorUnit[] = [];
  for (let f = 9; f >= 1; f--) {
    for (let b = 0; b < 3; b++) {
      const idx = (9 - f) * 3 + b;
      units.push({
        id: `${projectId}-${f}${["A","B","C"][b]}`,
        floor: f,
        block: ["A","B","C"][b],
        size: sizes[b],
        orient: orients[b],
        price: [7200000, 8100000, 9000000][b],
        status: statuses[idx % statuses.length],
      });
    }
  }
  return units;
}

const ESCROW_ENTRIES: EscrowEntry[] = [];

const ESCROW_STATUS_CONFIG: Record<EscrowStatus, { color: string; bg: string; label: string }> = {
  held:             { color: "#735c00", bg: "#f9f6ee", label: "Held" },
  disbursed:        { color: "#2e7d32", bg: "#f0fff4", label: "Disbursed" },
  refunded:         { color: "#9e9e9e", bg: "#f4f4f4", label: "Refunded" },
  override_pending: { color: "#dc2626", bg: "#fff1f2", label: "Override Pending" },
};

function fmt(n: number) {
  return "৳ " + n.toLocaleString("en-IN");
}


// ── Floor Configurator ─────────────────────────────────────────────
const STATUS_OPTS: UnitStatus[] = ["available", "reserved", "sold"];
const STATUS_STYLE: Record<UnitStatus, { bg: string; border: string; text: string; label: string }> = {
  available: { bg: "white",   border: "#d4af37", text: "#735c00",  label: "Available" },
  reserved:  { bg: "#9e9e9e", border: "transparent", text: "white", label: "Reserved" },
  sold:      { bg: "#1a1c1c", border: "transparent", text: "white", label: "Sold" },
};

function FloorConfigurator() {
  const [editMode, setEditMode]   = useState(false);
  const [units, setUnits]         = useState<FloorUnit[]>(() => buildFloors("p1"));
  const [editingUnit, setEditingUnit] = useState<string | null>(null);

  const floors  = Array.from({ length: 9 }, (_, i) => 9 - i);
  const blocks  = ["A", "B", "C"];

  function updateUnit(id: string, patch: Partial<FloorUnit>) {
    setUnits((prev) => prev.map((u) => u.id === id ? { ...u, ...patch } : u));
  }

  function unitAt(floor: number, block: string) {
    return units.find((u) => u.floor === floor && u.block === block)!;
  }

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Configurator toolbar */}
      <div className="bg-card-bg border border-neutral-200 px-[24px] py-[16px] flex items-center justify-between shadow-[var(--shadow-premium-sm)]">
        <div>
          <h2 className="font-['Noto_Serif'] font-semibold text-charcoal text-[16px]">Interactive Floor & Unit Configurator</h2>
          <p className="font-['Inter'] font-medium text-text-secondary text-[11px] mt-[2px]">
            The Archive Residence I · 9 Floors · 3 Blocks · 27 Units
          </p>
        </div>
        <motion.button
          onClick={() => { setEditMode(!editMode); setEditingUnit(null); }}
          className="flex items-center gap-[8px] px-[16px] py-[10px] border transition-all cursor-pointer"
          style={{
            borderColor: editMode ? "#d4af37" : "#e8e8e8",
            background: editMode ? "#f9f6ee" : "white",
          }}
          whileTap={{ scale: 0.97 }}
        >
          {editMode ? <Unlock size={12} color="#735c00" /> : <Lock size={12} color="#4d4635" />}
          <span className="font-['Inter'] font-medium text-[10px] tracking-[1.5px] uppercase" style={{ color: editMode ? "#735c00" : "#4d4635" }}>
            {editMode ? "Exit Layout Edit Mode" : "[Modify Layout Scheme]"}
          </span>
        </motion.button>
      </div>

      {/* Edit mode notice */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            className="flex items-center gap-[10px] px-[16px] py-[12px] bg-[#f9f6ee] border border-[#d4af37]"
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            <Edit3 size={12} color="#735c00" />
            <span className="font-['Inter'] font-medium text-warm-brown text-[11px] leading-[17px]">
              Edit mode active — click any unit cell to configure pricing, availability status, and orientation. Changes apply immediately.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="bg-card-bg border border-neutral-200 p-[32px] shadow-[var(--shadow-premium-sm)]">
        {/* Legend */}
        <div className="flex gap-[20px] mb-[24px]">
          {Object.entries(STATUS_STYLE).map(([status, style]) => (
            <div key={status} className="flex items-center gap-[6px]">
              <div className="w-[12px] h-[12px] border" style={{ background: style.bg, borderColor: style.border === "transparent" ? style.bg : style.border }} />
              <span className="font-['Inter'] font-medium text-text-secondary text-[10px] tracking-[0.5px] uppercase">{style.label}</span>
            </div>
          ))}
          {editMode && (
            <div className="ml-auto flex items-center gap-[6px] px-[10px] py-[4px] bg-[#f9f6ee] border border-[#d4af37]">
              <span className="font-['Inter'] font-medium text-warm-brown text-[9px] tracking-[1px] uppercase">Edit Mode ON</span>
            </div>
          )}
        </div>

        <div className="flex gap-0">
          {/* Floor labels */}
          <div className="flex flex-col w-[90px] shrink-0 mt-[28px]">
            {floors.map((f) => (
              <div key={f} className="h-[56px] flex items-center">
                <span className="font-['Inter'] font-medium text-text-secondary text-[10px] tracking-[0.5px]">
                  {f === 1 ? "1st" : f === 2 ? "2nd" : f === 3 ? "3rd" : `${f}th`} Floor
                </span>
              </div>
            ))}
          </div>

          <div className="flex-1">
            {/* Block headers */}
            <div className="flex mb-[4px]">
              {blocks.map((b) => (
                <div key={b} className="flex-1 text-center">
                  <span className="font-['Inter'] font-semibold text-charcoal text-[10px] tracking-[1.5px] uppercase">Block {b}</span>
                </div>
              ))}
            </div>

            {/* Cells */}
            {floors.map((floor) => (
              <div key={floor} className="flex gap-[6px] mb-[6px]">
                {blocks.map((block) => {
                  const unit = unitAt(floor, block);
                  const style = STATUS_STYLE[unit.status];
                  const isEditing = editingUnit === unit.id;

                  return (
                    <div key={block} className="flex-1 relative">
                      <motion.div
                        className="h-[50px] flex flex-col items-center justify-center cursor-pointer transition-all"
                        style={{
                          background: style.bg,
                          border: `1.5px solid ${style.border}`,
                          cursor: editMode ? "pointer" : "default",
                        }}
                        whileHover={editMode ? { scale: 1.04, boxShadow: "0 4px 16px rgba(212,175,55,0.18)" } : {}}
                        whileTap={editMode ? { scale: 0.96 } : {}}
                        onClick={() => editMode && setEditingUnit(isEditing ? null : unit.id)}
                      >
                        <span className="font-['Inter'] font-semibold text-[9px] tracking-[0.5px]" style={{ color: style.text }}>
                          {floor}{block}
                        </span>
                        {editMode && (
                          <span className="font-['Inter'] font-medium text-[7px] opacity-70 tracking-[0.5px]" style={{ color: style.text }}>
                            {style.label}
                          </span>
                        )}
                        {!editMode && unit.status === "sold" && <Check size={10} color="white" />}
                      </motion.div>

                      {/* Edit popup */}
                      <AnimatePresence>
                        {isEditing && (
                          <motion.div
                            className="absolute top-[calc(100%+6px)] left-0 z-30 w-[220px] bg-card-bg border border-[#d4af37] shadow-[var(--shadow-premium-md)] p-[14px] flex flex-col gap-[10px]"
                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.18 }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-['Inter'] font-semibold text-charcoal text-[11px]">Unit {floor}{block}</span>
                              <button onClick={() => setEditingUnit(null)}><X size={11} color="#4d4635" /></button>
                            </div>

                            {/* Status dropdown */}
                            <div className="flex flex-col gap-[4px]">
                              <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[1.5px] uppercase">Availability</span>
                              {STATUS_OPTS.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => updateUnit(unit.id, { status: s })}
                                  className="flex items-center gap-[6px] px-[8px] py-[5px] border transition-colors cursor-pointer text-left"
                                  style={{
                                    borderColor: unit.status === s ? "#d4af37" : "#e8e8e8",
                                    background: unit.status === s ? "#f9f6ee" : "white",
                                  }}
                                >
                                  <div className="w-[6px] h-[6px] rounded-full" style={{ background: STATUS_STYLE[s].bg === "white" ? "#d4af37" : STATUS_STYLE[s].bg }} />
                                  <span className="font-['Inter'] font-medium text-charcoal text-[10px]">{STATUS_STYLE[s].label}</span>
                                  {unit.status === s && <Check size={9} color="#d4af37" className="ml-auto" />}
                                </button>
                              ))}
                            </div>

                            {/* Price edit */}
                            <div className="flex flex-col gap-[4px]">
                              <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[1.5px] uppercase">Unit Price (৳)</span>
                              <input
                                type="number"
                                value={unit.price}
                                onChange={(e) => updateUnit(unit.id, { price: Number(e.target.value) })}
                                className="px-[8px] py-[6px] border border-neutral-200 focus:border-[#d4af37] outline-none font-['Noto_Serif'] font-bold text-charcoal text-[13px] bg-premium-bg transition-colors"
                              />
                            </div>

                            {/* Orientation */}
                            <div className="flex flex-col gap-[4px]">
                              <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[1.5px] uppercase">Orientation</span>
                              <input
                                value={unit.orient}
                                onChange={(e) => updateUnit(unit.id, { orient: e.target.value })}
                                className="px-[8px] py-[6px] border border-neutral-200 focus:border-[#d4af37] outline-none font-['Inter'] font-normal text-charcoal text-[11px] bg-premium-bg transition-colors"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Escrow Vault ───────────────────────────────────────────────────
function EscrowVault() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-escrow"],
    queryFn:  fetchEscrowLedger,
  });
  const [overrides, setOverrides] = useState<Record<string, Partial<EscrowEntry>>>({});
  const [overrideId, setOverrideId] = useState<string | null>(null);
  const [auditNote, setAuditNote] = useState("");

  const localEntries = useMemo((): EscrowEntry[] => {
    return (data ?? []).map((row) => ({
      ...row,
      status: (overrides[row.id]?.status ?? row.status) as EscrowStatus,
      verifiedBy: overrides[row.id]?.verifiedBy ?? null,
    }));
  }, [data, overrides]);

  if (isLoading) {
    return <div className="py-[32px] font-['Inter'] text-[12px] text-[#4d4635]">Loading escrow ledger…</div>;
  }

  function handleOverride(id: string) {
    if (!auditNote.trim()) return;
    setOverrides((prev) => ({
      ...prev,
      [id]: {
        status: "disbursed",
        verifiedBy: `admin — ${new Date().toISOString().slice(0, 16)}`,
      },
    }));
    setOverrideId(null);
    setAuditNote("");
  }

  const totalHeld = localEntries.filter(e => e.status === "held").reduce((s, e) => s + e.escrow88, 0);
  const totalDisbursed = localEntries.filter(e => e.status === "disbursed").reduce((s, e) => s + e.escrow88, 0);
  const flagged = localEntries.filter(e => e.status === "override_pending").length;

  return (
    <div className="flex flex-col gap-[20px]">
      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-[16px]">
        {[
          { label: "Total Escrow Held (88%)", value: fmt(totalHeld), accent: "#d4af37", icon: DollarSign },
          { label: "Total Disbursed",         value: fmt(totalDisbursed), accent: "#2e7d32", icon: TrendingUp },
          { label: "Override Flags",          value: `${flagged} Pending`, accent: flagged > 0 ? "#dc2626" : "#9e9e9e", icon: AlertTriangle },
        ].map(({ label, value, accent, icon: Icon }) => (
          <div key={label} className="bg-card-bg border border-neutral-200 px-[20px] py-[16px] flex flex-col gap-[6px] relative overflow-hidden shadow-[var(--shadow-premium-sm)]">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: accent }} />
            <div className="flex items-center justify-between">
              <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[2px] uppercase">{label}</span>
              <Icon size={13} color={accent} />
            </div>
            <span className="font-['Noto_Serif'] font-bold text-charcoal text-[20px] leading-[26px] count-up">{value}</span>
          </div>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="bg-card-bg border border-neutral-200 shadow-[var(--shadow-premium-sm)]">
        <div className="px-[24px] py-[18px] border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-[12px]">
            <div className="bg-[#d4af37] h-px w-[24px]" />
            <h2 className="font-['Noto_Serif'] font-semibold text-charcoal text-[16px]">Investor Wallet & Escrow Log Vault</h2>
          </div>
          <div className="flex items-center gap-[8px] px-[10px] py-[5px] border border-neutral-200 bg-neutral-100">
            <span className="font-['Inter'] font-medium text-text-secondary text-[9px] tracking-[1.5px] uppercase">88/12 Split Active</span>
          </div>
        </div>

        {/* Table header */}
        <div className="grid px-[20px] py-[10px] border-b border-neutral-200 bg-neutral-100 gap-[8px]"
          style={{ gridTemplateColumns: "140px 1fr 100px 90px 90px 80px 110px 52px" }}>
          {["Invoice No.", "Investor · Unit", "Gateway", "Escrow 88%", "Fee 12%", "Date", "Status", ""].map((h) => (
            <span key={h} className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[1.5px] uppercase">{h}</span>
          ))}
        </div>

        {localEntries.map((entry, i) => {
          const sCfg = ESCROW_STATUS_CONFIG[entry.status];
          const isOverride = entry.status === "override_pending";
          return (
            <div key={entry.id}>
              <div
                className="grid px-[20px] py-[14px] gap-[8px] items-center transition-colors hover:bg-premium-bg"
                style={{
                  gridTemplateColumns: "140px 1fr 100px 90px 90px 80px 110px 52px",
                  borderBottom: i < localEntries.length - 1 ? "1px solid #f4f4f4" : undefined,
                  background: isOverride ? "#fff8f8" : undefined,
                }}
              >
                <span className="font-['Inter'] font-medium text-charcoal text-[10px]">{entry.invoiceNo}</span>
                <div className="min-w-0">
                  <span className="font-['Inter'] font-semibold text-charcoal text-[11px] block truncate">{entry.investor}</span>
                  <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] truncate block">{entry.unit}</span>
                </div>
                <span className="font-['Inter'] font-medium text-text-secondary text-[10px]">{entry.gateway}</span>
                <span className="font-['Noto_Serif'] font-bold text-[#735c00] text-[11px]">{fmt(entry.escrow88)}</span>
                <span className="font-['Noto_Serif'] font-bold text-text-secondary text-[11px]">{fmt(entry.fee12)}</span>
                <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[10px]">{entry.date}</span>
                <span
                  className="inline-flex items-center px-[8px] py-[3px] font-['Inter'] font-medium text-[8px] tracking-[1px] uppercase"
                  style={{ background: sCfg.bg, color: sCfg.color }}
                >
                  {sCfg.label}
                </span>
                <button
                  onClick={() => setOverrideId(overrideId === entry.id ? null : entry.id)}
                  title="Manual override / audit verification"
                  className="flex items-center justify-center w-[32px] h-[32px] border transition-colors cursor-pointer hover:border-[#d4af37]"
                  style={{
                    borderColor: overrideId === entry.id ? "#d4af37" : "#e8e8e8",
                    background: overrideId === entry.id ? "#f9f6ee" : "white",
                  }}
                >
                  <ReceiptText size={12} color={overrideId === entry.id ? "#735c00" : "#4d4635"} />
                </button>
              </div>

              {/* Override / Audit Panel */}
              <AnimatePresence>
                {overrideId === entry.id && (
                  <motion.div
                    className="px-[20px] py-[16px] bg-[#fffbeb] border-b border-[#e0c97a] flex flex-col gap-[12px]"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <div className="flex items-center gap-[8px]">
                      <AlertTriangle size={12} color="#c09000" />
                      <span className="font-['Inter'] font-semibold text-warm-brown text-[11px] tracking-[0.5px]">
                        Manual Ledger Override — Audit Verification Required
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-[12px] text-[10px]">
                      {[
                        { label: "Invoice",     value: entry.invoiceNo },
                        { label: "Total",       value: fmt(entry.amount) },
                        { label: "Verified by", value: entry.verifiedBy ?? "Unverified" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex flex-col gap-[2px]">
                          <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[1px] uppercase">{label}</span>
                          <span className="font-['Inter'] font-semibold text-charcoal text-[11px]">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-[6px]">
                      <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[1.5px] uppercase">Audit Override Reason / Log Note</span>
                      <textarea
                        value={auditNote}
                        onChange={(e) => setAuditNote(e.target.value)}
                        rows={2}
                        placeholder="Describe discrepancy reason and resolution action…"
                        className="px-[10px] py-[8px] border border-[#e0c97a] focus:border-[#d4af37] outline-none font-['Inter'] font-normal text-charcoal text-[11px] resize-none bg-white transition-colors"
                      />
                    </div>
                    <div className="flex gap-[8px]">
                      <button
                        onClick={() => handleOverride(entry.id)}
                        disabled={!auditNote.trim()}
                        className="flex items-center gap-[6px] px-[14px] py-[8px] bg-charcoal hover:bg-[#2a2a2a] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Check size={10} color="#d4af37" />
                        <span className="font-['Inter'] font-semibold text-white text-[9px] tracking-[1.5px] uppercase">Force Verify & Disburse</span>
                      </button>
                      <button
                        onClick={() => { setOverrideId(null); setAuditNote(""); }}
                        className="px-[14px] py-[8px] border border-neutral-200 hover:bg-neutral-100 transition-colors cursor-pointer"
                      >
                        <span className="font-['Inter'] font-medium text-text-secondary text-[9px] tracking-[1.5px] uppercase">Cancel</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export default function ProjectControlHub() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab]   = useState<Tab>("projects");
  const [editProject, setEditProject] = useState<AdminProject | null>(null);
  const [search, setSearch]         = useState("");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn:  fetchAdminProjects,
  });

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  const totalCapital = "৳ 15.7 Cr";
  const totalUnits   = projects.reduce((s, p) => s + p.totalUnits, 0);
  const avgFunded    = projects.length ? Math.round(projects.reduce((s, p) => s + p.raisedPct, 0) / projects.length) : 0;

  if (isLoading) {
    return (
      <div className="p-[40px] min-h-full bg-[#FAFAFA] flex items-center justify-center">
        <span className="font-['Inter'] text-[11px] tracking-[2px] uppercase text-[#4d4635]">Loading projects…</span>
      </div>
    );
  }

  return (
    <div className="p-[40px] min-h-full bg-premium-bg">
      {/* Header */}
      <div className="mb-[32px]">
        <div className="bg-[#d4af37] h-px w-[40px] mb-[12px]" />
        <h1 className="font-['Noto_Serif'] font-semibold text-charcoal text-[28px] leading-[36px] tracking-[-0.4px]">
          Project Control Hub
        </h1>
        <p className="font-['Inter'] font-medium text-text-secondary text-[13px] leading-[20px] mt-[4px]">
          Lifecycle registry, floor configurator, and investor escrow vault management.
        </p>
      </div>

      {/* Financial Summary KPIs */}
      <div className="grid grid-cols-4 gap-[16px] mb-[28px]">
        {[
          { label: "Total Platform Capital",  value: totalCapital,        accent: "#d4af37", icon: DollarSign },
          { label: "Active Projects",         value: `${projects.length}`, accent: "#1a1c1c", icon: Building2 },
          { label: "Total Inventory Units",   value: `${totalUnits}`,      accent: "#735c00", icon: Users },
          { label: "Avg. Crowdfund Progress", value: `${avgFunded}%`,      accent: "#2e7d32", icon: TrendingUp },
        ].map(({ label, value, accent, icon: Icon }) => (
          <div key={label} className="bg-card-bg border border-neutral-200 px-[20px] py-[18px] flex flex-col gap-[8px] relative overflow-hidden shadow-[var(--shadow-premium-sm)]">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: accent }} />
            <div className="flex items-center justify-between">
              <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[2px] uppercase">{label}</span>
              <Icon size={12} color={accent} />
            </div>
            <span className="font-['Noto_Serif'] font-bold text-charcoal text-[22px] leading-[28px] count-up">{value}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 mb-[28px]">
        {([
          { key: "projects", label: "Project Lifecycle Registry" },
          { key: "floors",   label: "Floor & Unit Configurator" },
          { key: "escrow",   label: "Escrow Vault" },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="relative px-[20px] py-[14px] font-['Inter'] font-medium text-[11px] tracking-[1px] uppercase cursor-pointer transition-colors"
            style={{ color: activeTab === key ? "#111111" : "#9e9e9e" }}
          >
            {label}
            {activeTab === key && (
              <motion.div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#d4af37]" layoutId="hub-tab" />
            )}
          </button>
        ))}
      </div>

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <div className="flex flex-col gap-[16px]">
          <div className="flex items-center gap-[12px]">
            <div className="flex-1 relative">
              <Search size={13} color="#9e9e9e" className="absolute left-[14px] top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects by name or location…"
                className="w-full pl-[38px] pr-[14px] py-[10px] bg-card-bg border border-neutral-200 font-['Inter'] font-normal text-charcoal text-[12px] outline-none focus:border-[#d4af37] transition-colors"
              />
            </div>
          </div>

          {/* Project Table */}
          <div className="bg-card-bg border border-neutral-200 shadow-[var(--shadow-premium-sm)]">
            <div className="grid px-[20px] py-[11px] border-b border-neutral-200 bg-neutral-100 gap-[12px]"
              style={{ gridTemplateColumns: "1fr 120px 90px 100px 90px 120px 80px" }}>
              {["Project", "Status", "Katha", "Capital", "Progress", "Completion", ""].map((h) => (
                <span key={h} className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[1.5px] uppercase">{h}</span>
              ))}
            </div>

            {filtered.map((project, i) => {
              const sCfg = STATUS_CONFIG[project.status as ProjectStatus] ?? STATUS_CONFIG.crowdfunding;
              return (
                <motion.div
                  key={project.id}
                  className="grid px-[20px] py-[16px] gap-[12px] items-center hover:bg-premium-bg transition-colors"
                  style={{
                    gridTemplateColumns: "1fr 120px 90px 100px 90px 120px 80px",
                    borderBottom: i < filtered.length - 1 ? "1px solid #f4f4f4" : undefined,
                  }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="min-w-0">
                    <span className="font-['Noto_Serif'] font-semibold text-charcoal text-[14px] block">{project.name}</span>
                    <span className="font-['Inter'] font-medium text-text-secondary text-[10px]">{project.location}</span>
                  </div>
                  <span
                    className="inline-flex items-center gap-[5px] px-[8px] py-[3px] font-['Inter'] font-medium text-[8px] tracking-[1px] uppercase"
                    style={{ background: sCfg.bg, color: sCfg.color }}
                  >
                    <div className="w-[4px] h-[4px] rounded-full" style={{ background: sCfg.dot }} />
                    {sCfg.label}
                  </span>
                  <span className="font-['Noto_Serif'] font-bold text-charcoal text-[13px]">{project.katha} Katha</span>
                  <span className="font-['Noto_Serif'] font-bold text-warm-brown text-[13px]">{project.targetCapital}</span>
                  <div className="flex flex-col gap-[4px]">
                    <div className="h-[3px] bg-neutral-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#d4af37] rounded-full" style={{ width: `${project.raisedPct}%` }} />
                    </div>
                    <span className="font-['Inter'] font-medium text-text-secondary text-[9px]">{project.raisedPct}%</span>
                  </div>
                  <span className="font-['Inter'] font-medium text-text-secondary text-[11px]">{project.completionTarget}</span>
                  <button
                    onClick={() => setEditProject(project)}
                    className="flex items-center gap-[4px] px-[10px] py-[6px] border border-[#d4af37] hover:bg-soft-gold transition-colors cursor-pointer"
                  >
                    <Edit3 size={9} color="#735c00" />
                    <span className="font-['Inter'] font-medium text-warm-brown text-[8px] tracking-[1px] uppercase">[Edit Project Details]</span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "floors" && <FloorConfigurator />}
      {activeTab === "escrow" && <EscrowVault />}

      <EditProjectDrawer
        project={editProject}
        onClose={() => setEditProject(null)}
        onSave={async (id, payload) => {
          await updateAdminProject(id, payload);
          queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
          queryClient.invalidateQueries({ queryKey: ["projects"] });
        }}
      />
    </div>
  );
}
