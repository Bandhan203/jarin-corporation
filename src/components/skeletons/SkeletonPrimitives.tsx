/**
 * Low-level skeleton primitives that all skeleton components compose from.
 * Uses the global `.shimmer` keyframe defined in fonts.css.
 */

interface ShimmerBoxProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

/** A single shimmer block — the atomic skeleton unit */
export function ShimmerBox({ width = "100%", height = 16, className = "", style }: ShimmerBoxProps) {
  return (
    <div
      className={`shimmer ${className}`}
      style={{ width, height, ...style }}
      aria-hidden
    />
  );
}

/** Gold accent line mirroring the real page headers */
export function GoldLineSkeleton({ width = 40 }: { width?: number }) {
  return <div className="bg-[#d4af37] opacity-20 mb-[12px]" style={{ width, height: 1 }} aria-hidden />;
}

/** A metric card shell — matches the 3-column KPI card layout */
export function MetricCardSkeleton() {
  return (
    <div className="bg-white border border-[#eee] p-[28px] flex flex-col gap-[12px] relative overflow-hidden">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] shimmer" />
      <div className="flex items-center justify-between">
        <ShimmerBox width={80} height={10} />
        <ShimmerBox width={14} height={14} style={{ borderRadius: "50%" }} />
      </div>
      <ShimmerBox width={120} height={28} />
      <ShimmerBox width={160} height={10} />
      <ShimmerBox width="100%" height={2} />
    </div>
  );
}

/** A table row skeleton matching the ledger row layout */
export function TableRowSkeleton({ cols }: { cols: number[] }) {
  return (
    <div className="flex items-center px-[24px] py-[16px] gap-[16px] border-b border-[#f3f3f3]">
      {cols.map((w, i) => (
        <ShimmerBox key={i} width={w} height={11} />
      ))}
    </div>
  );
}
