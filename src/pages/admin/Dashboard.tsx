import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle, TrendingUp, Users, FileSearch, Edit3, Save, X, Lock, ShieldAlert } from "lucide-react";
import {
  fetchAdminStats,
  fetchLandPipeline,
  fetchPlatformCosts,
  updatePlatformCost,
  assignLandLawyer,
  approveLandSubmission,
  type PlatformCost,
} from "@/services/adminApi";

function fmtCrore(bdt: number) {
  return `৳ ${(bdt / 10_000_000).toFixed(1)} Crore`;
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [editingCost, setEditingCost] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");
  const [saved, setSaved] = useState(false);
  const [lockWarning, setLockWarning] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn:  fetchAdminStats,
  });

  const { data: pipeline = [], isLoading: pipelineLoading } = useQuery({
    queryKey: ["admin-land-pipeline"],
    queryFn:  fetchLandPipeline,
  });

  const { data: costData, isLoading: costsLoading } = useQuery({
    queryKey: ["admin-costs"],
    queryFn:  fetchPlatformCosts,
  });

  const costs = costData?.costs ?? [];
  const runningProjectCount = costData?.runningProjectCount ?? 0;
  const hasRunningProjects = runningProjectCount > 0;

  const assignMutation = useMutation({
    mutationFn: assignLandLawyer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-land-pipeline"] }),
  });

  const approveMutation = useMutation({
    mutationFn: approveLandSubmission,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-land-pipeline"] }),
  });

  const costMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: number }) => updatePlatformCost(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-costs"] });
      queryClient.invalidateQueries({ queryKey: ["cms"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  function isParamLocked(cost: PlatformCost): boolean {
    return hasRunningProjects && cost.lockWhenRunning;
  }

  function startEdit(cost: PlatformCost) {
    if (isParamLocked(cost)) {
      setLockWarning(cost.key);
      setTimeout(() => setLockWarning(null), 4000);
      return;
    }
    setEditingCost(cost.key);
    setEditVal(String(cost.value));
    setLockWarning(null);
  }

  async function saveEdit() {
    if (!editingCost) return;
    await costMutation.mutateAsync({ key: editingCost, value: Number(editVal) });
    setEditingCost(null);
  }

  const goldLine = <div className="bg-[#d4af37] h-px w-[40px] mb-[12px] rounded-none" />;

  const health = [
    {
      label: "Total Platform Revenue",
      value: statsLoading ? "…" : fmtCrore(stats?.revenueBdt ?? 0),
      sub: "FY 2026",
      accent: "#d4af37",
      trend: "+22%",
    },
    {
      label: "Running Projects",
      value: statsLoading ? "…" : `${stats?.runningProjects ?? 0} Active`,
      sub: "Live construction",
      accent: "#1a1c1c",
      trend: "",
    },
    {
      label: "Default Risk Alerts",
      value: statsLoading ? "…" : `${stats?.defaultRiskFlags ?? 0} Flags`,
      sub: "Action Required",
      accent: "#dc2626",
      trend: "",
    },
  ];

  function statusBadge(status: string) {
    if (status === "approved") return (
      <span className="flex items-center gap-[4px] bg-charcoal px-[8px] py-[2px] rounded-none">
        <CheckCircle size={8} color="#d4af37" />
        <span className="font-['Inter'] font-medium text-white text-[8px] tracking-[1px] uppercase">Approved</span>
      </span>
    );
    if (status === "lawyer_assigned") return (
      <span className="flex items-center gap-[4px] border border-[#735c00] px-[8px] py-[2px] rounded-none">
        <FileSearch size={8} color="#735c00" />
        <span className="font-['Inter'] font-medium text-warm-brown text-[8px] tracking-[1px] uppercase">In Review</span>
      </span>
    );
    return (
      <span className="flex items-center gap-[4px] border border-[#d0c5af] px-[8px] py-[2px] rounded-none">
        <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[8px] tracking-[1px] uppercase">Pending</span>
      </span>
    );
  }

  return (
    <div className="p-[40px] min-h-full bg-premium-bg">
      <div className="mb-[40px]">
        {goldLine}
        <h1 className="font-['Noto_Serif'] font-semibold text-charcoal text-[28px] leading-[36px] tracking-[-0.4px]">
          Command Center
        </h1>
        <p className="font-['Inter'] font-medium text-text-secondary text-[13px] leading-[20px] mt-[4px]">
          Super Admin · Estate Archive Platform — Full System Access
        </p>
      </div>

      <div className="grid grid-cols-3 gap-[16px] mb-[32px]">
        {health.map(({ label, value, sub, accent, trend }) => (
          <div key={label} className="bg-card-bg border border-neutral-200 px-[24px] py-[20px] flex flex-col gap-[8px] relative overflow-hidden shadow-[var(--shadow-premium-sm)] rounded-none">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: accent }} />
            <div className="flex items-center justify-between">
              <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[2px] uppercase leading-[14px]">{label}</span>
              {accent === "#dc2626" && <AlertTriangle size={13} color="#dc2626" />}
              {accent === "#d4af37" && <TrendingUp size={13} color="#d4af37" />}
              {accent === "#1a1c1c" && <Users size={13} color="#1a1c1c" />}
            </div>
            <span className="font-['Noto_Serif'] font-bold text-charcoal text-[22px] leading-[28px] count-up">{value}</span>
            <div className="flex items-center gap-[8px]">
              <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[1px] uppercase leading-[14px]">{sub}</span>
              {trend && <span className="bg-[#d4af37]/15 font-['Inter'] font-medium text-warm-brown text-[8px] tracking-[0.5px] uppercase px-[5px] py-[1px] rounded-none">{trend}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_380px] gap-[20px] mb-[24px]">
        <div className="bg-card-bg border border-neutral-200 shadow-[var(--shadow-premium-sm)] rounded-none">
          <div className="px-[24px] py-[20px] border-b border-neutral-200 flex items-center gap-[16px]">
            <div className="bg-[#d4af37] h-px w-[24px]" />
            <h2 className="font-['Noto_Serif'] font-semibold text-charcoal text-[16px] leading-[22px]">
              Land Submission Pipeline
            </h2>
            <span className="ml-auto bg-neutral-100 font-['Inter'] font-medium text-text-secondary text-[9px] tracking-[1.5px] uppercase px-[8px] py-[3px] rounded-none">
              {pipeline.filter((p) => p.status === "pending").length} PENDING
            </span>
          </div>

          {pipelineLoading && (
            <div className="px-[24px] py-[32px] font-['Inter'] text-[12px] text-[#4d4635]">Loading pipeline…</div>
          )}

          {!pipelineLoading && pipeline.map((item, i) => (
            <div
              key={item.id}
              className={`px-[24px] py-[18px] flex gap-[16px] items-start hover:bg-premium-bg transition-colors rounded-none ${i < pipeline.length - 1 ? "border-b border-neutral-100" : ""}`}
            >
              <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                <div className="flex items-center gap-[8px] mb-[2px]">
                  <span className="font-['Inter'] font-medium text-warm-brown text-[9px] tracking-[1px] uppercase leading-[14px]">{item.id}</span>
                  {statusBadge(item.status)}
                </div>
                <span className="font-['Noto_Serif'] font-semibold text-charcoal text-[14px] leading-[20px]">{item.name}</span>
                <span className="font-['Inter'] font-normal text-text-secondary text-[11px] leading-[16px]">{item.location}</span>
                <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[0.5px] uppercase leading-[14px] mt-[2px]">Submitted {item.submitted}</span>
              </div>
              <div className="flex flex-col gap-[6px] shrink-0">
                {item.status === "pending" && (
                  <button
                    onClick={() => assignMutation.mutate(item.dbId)}
                    disabled={assignMutation.isPending}
                    className="flex items-center gap-[5px] px-[10px] py-[6px] border border-[#735c00] hover:bg-[#735c00]/8 transition-colors cursor-pointer rounded-none"
                  >
                    <FileSearch size={9} color="#735c00" />
                    <span className="font-['Inter'] font-medium text-warm-brown text-[8px] tracking-[1px] uppercase leading-[12px]">Assign Lawyer</span>
                  </button>
                )}
                {item.status === "lawyer_assigned" && (
                  <button
                    onClick={() => approveMutation.mutate(item.dbId)}
                    disabled={approveMutation.isPending}
                    className="flex items-center gap-[5px] px-[10px] py-[6px] bg-charcoal hover:bg-[#2e2b27] transition-colors cursor-pointer rounded-none"
                  >
                    <CheckCircle size={9} color="#d4af37" />
                    <span className="font-['Inter'] font-medium text-white text-[8px] tracking-[1px] uppercase leading-[12px]">Approve to Engine</span>
                  </button>
                )}
                {item.status === "approved" && (
                  <span className="font-['Inter'] font-medium text-text-secondary text-[8px] tracking-[0.5px] uppercase leading-[12px] opacity-50">Approved</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card-bg border border-neutral-200 flex flex-col shadow-[var(--shadow-premium-sm)] rounded-none">
          <div className="px-[24px] py-[20px] border-b border-neutral-200 flex items-center gap-[12px]">
            <div className="bg-[#d4af37] h-px w-[24px]" />
            <h2 className="font-['Noto_Serif'] font-semibold text-charcoal text-[16px] leading-[22px]">
              Cost Override Console
            </h2>
          </div>

          {hasRunningProjects && (
            <div className="mx-[24px] mt-[16px] bg-[#fff8e6] border border-[#e0c97a] px-[12px] py-[10px] flex gap-[8px] rounded-none">
              <ShieldAlert size={13} color="#c09000" className="shrink-0 mt-[1px]" />
              <div className="flex flex-col gap-[2px]">
                <span className="font-['Inter'] font-medium text-warm-brown text-[9px] tracking-[1.5px] uppercase leading-[14px]">
                  {runningProjectCount} Active Construction Project{runningProjectCount > 1 ? "s" : ""}
                </span>
                <span className="font-['Inter'] font-normal text-warm-brown text-[10px] leading-[16px]">
                  Rate parameters are locked while projects are under construction. Only fee percentages may be adjusted.
                </span>
              </div>
            </div>
          )}

          {lockWarning && (
            <div className="mx-[24px] mt-[10px] border border-red-300 bg-red-50 px-[12px] py-[10px] flex gap-[8px] rounded-none">
              <Lock size={12} color="#dc2626" className="shrink-0 mt-[1px]" />
              <span className="font-['Inter'] font-normal text-red-700 text-[10px] leading-[16px]">
                This parameter is locked while construction projects are active.
              </span>
            </div>
          )}

          {saved && (
            <div className="mx-[24px] mt-[16px] bg-[#d4af37]/10 border border-[#d4af37] px-[12px] py-[8px] flex items-center gap-[6px] rounded-none">
              <CheckCircle size={10} color="#735c00" />
              <span className="font-['Inter'] font-medium text-warm-brown text-[9px] tracking-[1.5px] uppercase leading-[14px]">Global variables updated</span>
            </div>
          )}

          <div className="flex-1 px-[24px] py-[20px] flex flex-col gap-0">
            <p className="font-['Inter'] font-normal text-text-secondary text-[11px] leading-[18px] mb-[16px]">
              Editing these values will immediately recalculate all cost estimators across the platform.
            </p>

            {costsLoading && (
              <span className="font-['Inter'] text-[12px] text-[#4d4635]">Loading costs…</span>
            )}

            {!costsLoading && costs.map((cost, i) => {
              const locked = isParamLocked(cost);
              const isPct = cost.key.includes("pct");
              return (
                <div
                  key={cost.key}
                  className={`flex items-center justify-between py-[14px] rounded-none ${i < costs.length - 1 ? "border-b border-neutral-100" : ""}`}
                >
                  <div className="flex-1 pr-[12px] flex items-center gap-[6px]">
                    {locked && <Lock size={9} color="#b0b0b0" />}
                    <span className="font-['Inter'] font-medium text-[10px] tracking-[0.5px] uppercase leading-[14px] block" style={{ color: locked ? "#b0b0b0" : "#4d4635" }}>
                      {cost.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-[6px]">
                    {editingCost === cost.key ? (
                      <>
                        <input
                          autoFocus
                          type="number"
                          value={editVal}
                          onChange={(e) => setEditVal(e.target.value)}
                          className="w-[80px] border border-[#D4AF37] px-[8px] py-[4px] font-['Noto_Serif'] font-semibold text-charcoal text-[13px] outline-none text-right rounded-none"
                        />
                        <button onClick={saveEdit} disabled={costMutation.isPending} className="p-[4px] bg-charcoal cursor-pointer hover:bg-[#2e2b27] transition-colors rounded-none">
                          <Save size={10} color="#d4af37" />
                        </button>
                        <button onClick={() => setEditingCost(null)} className="p-[4px] cursor-pointer hover:bg-neutral-100 transition-colors rounded-none">
                          <X size={10} color="#9e9e9e" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="font-['Noto_Serif'] font-bold text-[14px] leading-[20px] text-right" style={{ color: locked ? "#b0b0b0" : "#735c00" }}>
                          {isPct ? `${cost.value}%` : cost.value.toLocaleString()}
                        </span>
                        <button
                          onClick={() => startEdit(cost)}
                          className="flex items-center gap-[4px] px-[8px] py-[4px] bg-[#1A1C1C] hover:bg-[#2e2b27] transition-colors cursor-pointer rounded-none"
                          title={locked ? "Locked — active construction project" : "Edit cost"}
                        >
                          <Edit3 size={9} color="#D4AF37" />
                          <span className="font-['Inter'] font-medium text-[#D4AF37] text-[7px] tracking-[1px] uppercase">[Edit Cost]</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-neutral-200 px-[24px] py-[16px]">
            <div className="bg-neutral-100 px-[12px] py-[8px] rounded-none">
              <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[1.5px] uppercase leading-[14px]">
                Live from platform_cost_settings · All changes logged
              </span>
            </div>
          </div>
        </div>
      </div>

      {(stats?.defaultRiskFlags ?? 0) > 0 && (
        <div className="bg-card-bg border border-red-200 shadow-[var(--shadow-premium-sm)] rounded-none">
          <div className="px-[24px] py-[16px] border-b border-red-100 flex items-center gap-[12px]">
            <AlertTriangle size={14} color="#dc2626" />
            <h3 className="font-['Noto_Serif'] font-semibold text-charcoal text-[14px] leading-[20px]">
              Active Default Risk Flags ({stats?.defaultRiskFlags})
            </h3>
          </div>
          <div className="px-[24px] py-[18px]">
            <span className="font-['Inter'] text-[11px] text-text-secondary">
              Review overdue installments in the Investor Ledger and Escrow Vault tabs.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
