import { Building2, TrendingUp, Clock, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchLandownerAnalytics } from "@/services/analyticsApi";
import { useAuthStore } from "@/store/authStore";
import ValuationLineChart from "@/components/charts/ValuationLineChart";

const STATUS_COLORS: Record<string, string> = {
  "Under Foundation": "#9e9e9e",
  "Column Stage":     "#735c00",
  "Finishing Stage":  "#d4af37",
  "Handover Ready":   "#1a1c1c",
};

function statusLabel(progressPct: number): string {
  if (progressPct >= 100) return "Handover Ready";
  if (progressPct >= 70) return "Finishing Stage";
  if (progressPct >= 30) return "Column Stage";
  return "Under Foundation";
}

export default function LandownerDashboard() {
  const user = useAuthStore((s) => s.user);
  const landownerId = user?.id ?? "";

  const { data: analytics, isLoading, isError, refetch, dataUpdatedAt, isFetching } = useQuery({
    queryKey: ["landowner-analytics", landownerId],
    queryFn:  () => fetchLandownerAnalytics(landownerId),
    enabled:  Boolean(landownerId),
  });

  const goldLine = <div className="bg-[#d4af37] h-px w-[40px] mb-[12px]" />;

  const staticUnits = (analytics?.swapUnits ?? []).map((u) => ({
    flat:   u.unitCode,
    size:   `${u.sizeSqft.toLocaleString()} SFT`,
    status: statusLabel(u.progressPct),
    stage:  u.progressPct,
  }));

  const totalUnits    = staticUnits.length;
  const handoverReady = staticUnits.filter((u) => u.status === "Handover Ready").length;
  const lastFetched   = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  return (
    <div className="p-[40px] min-h-full bg-premium-bg">
      <div className="mb-[40px]">
        {goldLine}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-['Noto_Serif'] font-semibold text-charcoal text-[28px] leading-[36px] tracking-[-0.4px]">
              Portfolio Management Hub
            </h1>
            <p className="font-['Inter'] font-medium text-text-secondary text-[13px] leading-[20px] mt-[4px]">
              Live portfolio data · Landowner ID: {landownerId}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-[6px] border border-neutral-200 px-[12px] py-[8px] hover:border-[#d4af37] transition-colors cursor-pointer disabled:opacity-40 mt-[8px] bg-card-bg shadow-[var(--shadow-premium-xs)]"
          >
            <RefreshCw size={11} color="#4d4635" className={isFetching ? "animate-spin" : ""} />
            <span className="font-['Inter'] font-medium text-text-secondary text-[9px] tracking-[1.5px] uppercase leading-[14px]">
              {lastFetched ? `Updated ${lastFetched.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}` : "Refresh"}
            </span>
          </button>
        </div>
      </div>

      {isError && (
        <div className="mb-[24px] bg-red-50 border border-red-200 px-[16px] py-[12px] flex items-center gap-[10px]">
          <span className="font-['Inter'] font-medium text-red-700 text-[11px] leading-[18px]">Failed to load analytics. Check your connection and retry.</span>
          <button onClick={() => refetch()} className="ml-auto font-['Inter'] font-medium text-red-600 text-[9px] tracking-[1.5px] uppercase underline cursor-pointer">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-[16px] mb-[32px]">
        {[
          { label: "Total Units Awarded",  value: `${totalUnits} Units`, icon: Building2,  accent: "#d4af37" },
          { label: "Handover Ready",       value: `${handoverReady} Units`, icon: TrendingUp, accent: "#1a1c1c" },
          { label: "Portfolio Valuation",  value: isLoading ? "—" : `৳ ${analytics?.totalValueL}Cr`, icon: TrendingUp, accent: "#735c00" },
          { label: "Active Projects",      value: isLoading ? "—" : String(analytics?.activeProjects ?? 0), icon: Clock, accent: "#4d4635" },
        ].map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="bg-card-bg border border-neutral-200 px-[20px] py-[20px] flex flex-col gap-[8px] relative overflow-hidden shadow-[var(--shadow-premium-sm)]">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: accent }} />
            <div className="flex items-center justify-between">
              <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[2px] uppercase leading-[14px]">{label}</span>
              <Icon size={13} color={accent} />
            </div>
            <span className="font-['Noto_Serif'] font-bold text-charcoal text-[22px] leading-[28px] count-up">{value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-[20px] mb-[32px]">
        <div className="bg-card-bg border border-neutral-200 shadow-[var(--shadow-premium-sm)]">
          <div className="px-[24px] py-[20px] border-b border-neutral-200 flex items-center gap-[16px]">
            <div className="bg-[#d4af37] h-px w-[24px]" />
            <h2 className="font-['Noto_Serif'] font-semibold text-charcoal text-[16px] leading-[22px]">Swap Unit Tracker</h2>
          </div>
          <div className="grid grid-cols-[80px_1fr_1fr_80px] px-[24px] py-[10px] border-b border-neutral-100">
            {["Flat", "Size", "Status", "Progress"].map((h) => (
              <span key={h} className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[2px] uppercase leading-[14px]">{h}</span>
            ))}
          </div>
          {isLoading && (
            <div className="px-[24px] py-[32px] font-['Inter'] text-[12px] text-[#4d4635]">Loading units…</div>
          )}
          {!isLoading && staticUnits.map((u) => (
            <div key={u.flat} className="grid grid-cols-[80px_1fr_1fr_80px] px-[24px] py-[14px] border-b border-neutral-50 items-center hover:bg-[#fafafa] transition-colors">
              <span className="font-['Noto_Serif'] font-semibold text-charcoal text-[13px]">{u.flat}</span>
              <span className="font-['Inter'] font-medium text-text-secondary text-[12px]">{u.size}</span>
              <div className="flex items-center gap-[6px]">
                <div className="w-[6px] h-[6px] rounded-full" style={{ background: STATUS_COLORS[u.status] ?? "#9e9e9e" }} />
                <span className="font-['Inter'] font-medium text-[11px]" style={{ color: STATUS_COLORS[u.status] ?? "#4d4635" }}>{u.status}</span>
              </div>
              <div className="flex items-center gap-[6px]">
                <div className="flex-1 bg-neutral-200 h-[3px]">
                  <div className="bg-[#d4af37] h-full" style={{ width: `${u.stage}%` }} />
                </div>
                <span className="font-['Inter'] font-medium text-[9px] text-[#9e9e9e]">{u.stage}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#1A1C1C] p-[28px] flex flex-col gap-[16px] shadow-[var(--shadow-premium-md)]">
          <div className="bg-[#D4AF37] h-px w-[32px]" />
          <span className="font-['Inter'] font-medium text-white/50 text-[9px] tracking-[2px] uppercase">Projected Portfolio Value</span>
          <span className="font-['Noto_Serif'] font-bold text-[#D4AF37] text-[32px] leading-[40px]">
            {isLoading ? "—" : `৳ ${analytics?.projectedValueL}Cr`}
          </span>
          <span className="font-['Inter'] font-medium text-white/70 text-[11px]">
            {isLoading ? "" : `+${analytics?.growthPct}% projected growth`}
          </span>
        </div>
      </div>

      {analytics?.valuation && (
        <ValuationLineChart data={analytics.valuation} />
      )}
    </div>
  );
}
