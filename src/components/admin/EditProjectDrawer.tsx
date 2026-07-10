import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Save } from "lucide-react";
import type { AdminProject } from "@/services/adminApi";

const STATUSES = ["crowdfunding", "construction", "completed", "handover"] as const;

interface EditProjectDrawerProps {
  project: AdminProject | null;
  onClose: () => void;
  onSave: (id: string, payload: Record<string, unknown>) => Promise<void>;
}

export default function EditProjectDrawer({ project, onClose, onSave }: EditProjectDrawerProps) {
  const [form, setForm] = useState<Partial<AdminProject>>({});
  const [saving, setSaving] = useState(false);

  if (!project) return null;

  const current = { ...project, ...form };

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(project.id, {
        base_sqft_rate:            current.baseSqftRate,
        management_fee_percentage: current.managementFeePct,
        status:                    current.status,
        phase_label:               current.phase,
        funding_percentage:        current.raisedPct,
        contractor:                current.contractor,
        completion_target:         current.completionTarget,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full border border-neutral-200 px-[12px] py-[10px] font-['Inter'] text-[13px] text-[#1A1C1C] outline-none focus:border-[#D4AF37] rounded-none";

  return (
    <AnimatePresence>
      <motion.div key="edit-project-backdrop" className="fixed inset-0 bg-black/20 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside
        key="edit-project-drawer"
        className="fixed right-0 top-0 h-full w-[480px] bg-white z-50 flex flex-col shadow-[-8px_0_32px_rgba(0,0,0,0.08)] rounded-none"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      >
        <div className="px-[32px] py-[28px] border-b border-neutral-200 flex items-start justify-between">
          <div>
            <div className="bg-[#D4AF37] h-px w-[32px] mb-[8px]" />
            <span className="font-['Inter'] text-[9px] tracking-[2px] uppercase text-[#9e9e9e]">Edit Project Details</span>
            <h2 className="font-['Noto_Serif'] font-semibold text-[#1A1C1C] text-[20px] mt-[4px]">{project.name}</h2>
          </div>
          <button onClick={onClose} className="p-[6px] hover:bg-[#FAFAFA] cursor-pointer rounded-none"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-[32px] py-[24px] flex flex-col gap-[16px]">
          {[
            { label: "Base SFT Rate (BDT)", key: "baseSqftRate" as const, type: "number" },
            { label: "Management Fee (%)", key: "managementFeePct" as const, type: "number" },
            { label: "Funding Raised (%)", key: "raisedPct" as const, type: "number" },
            { label: "Contractor", key: "contractor" as const, type: "text" },
            { label: "Completion Target", key: "completionTarget" as const, type: "text" },
          ].map(({ label, key, type }) => (
            <label key={key} className="flex flex-col gap-[6px]">
              <span className="font-['Inter'] text-[9px] tracking-[2px] uppercase text-[#9e9e9e]">{label}</span>
              <input
                type={type}
                className={inputClass}
                value={String(current[key] ?? "")}
                onChange={(e) => setForm((f) => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
              />
            </label>
          ))}
          <label className="flex flex-col gap-[6px]">
            <span className="font-['Inter'] text-[9px] tracking-[2px] uppercase text-[#9e9e9e]">Construction Phase Status</span>
            <select
              className={inputClass}
              value={current.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-[6px]">
            <span className="font-['Inter'] text-[9px] tracking-[2px] uppercase text-[#9e9e9e]">Phase Label</span>
            <input className={inputClass} value={current.phase ?? ""} onChange={(e) => setForm((f) => ({ ...f, phase: e.target.value }))} />
          </label>
        </div>

        <div className="px-[32px] py-[20px] border-t border-neutral-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-[8px] bg-[#1A1C1C] text-white py-[14px] font-['Inter'] text-[10px] tracking-[2px] uppercase hover:bg-[#2e2b27] cursor-pointer rounded-none disabled:opacity-50"
          >
            <Save size={12} color="#D4AF37" />
            {saving ? "Saving…" : "Update & Push Live"}
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
