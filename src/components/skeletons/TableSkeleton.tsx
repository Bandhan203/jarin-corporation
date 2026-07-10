/**
 * TableSkeleton — mirrors the exact column/row structure of the
 * Investor Ledger (/portal/investor/ledger) invoice table.
 *
 * Columns: Invoice # | Date | Description | Amount | Status | Action
 * Widths:  100       | 80   | flex-1      | 80     | 60     | 64
 */

import { ShimmerBox, GoldLineSkeleton } from "./SkeletonPrimitives";

interface TableSkeletonProps {
  rows?: number;
  /** When true, fades the skeleton out (use when real data arrives) */
  fadeOut?: boolean;
}

// Column widths in px (except description which is flex-1)
const COLS = [100, 80, "flex-1", 80, 60, 64] as const;

function SkeletonBadge() {
  return <ShimmerBox width={56} height={20} style={{ borderRadius: 2 }} />;
}

export default function TableSkeleton({ rows = 6, fadeOut = false }: TableSkeletonProps) {
  return (
    <div
      className="bg-white border border-[#eee] transition-opacity duration-500"
      style={{ opacity: fadeOut ? 0 : 1 }}
      aria-label="Loading invoice data…"
      aria-busy
    >
      {/* ── Panel header ─────────────────────────────────────────────── */}
      <div className="px-[28px] pt-[28px] pb-[20px] border-b border-[#eee]">
        <GoldLineSkeleton width={28} />
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-[8px]">
            <ShimmerBox width={160} height={18} />
            <ShimmerBox width={120} height={10} />
          </div>
          {/* Export button ghost */}
          <ShimmerBox width={96} height={34} />
        </div>
      </div>

      {/* ── Summary strip (3 pill stats) ─────────────────────────────── */}
      <div className="px-[28px] py-[16px] border-b border-[#eee] flex items-center gap-[12px]">
        {[80, 100, 90].map((w, i) => (
          <ShimmerBox key={i} width={w} height={28} />
        ))}
        <div className="ml-auto">
          <ShimmerBox width={180} height={10} />
        </div>
      </div>

      {/* ── Table header row ─────────────────────────────────────────── */}
      <div className="flex items-center px-[24px] py-[10px] gap-[16px] border-b border-[#f3f3f3]">
        {[100, 80, 220, 80, 60, 64].map((w, i) => (
          <ShimmerBox key={i} width={w} height={9} />
        ))}
      </div>

      {/* ── Data rows ────────────────────────────────────────────────── */}
      {Array.from({ length: rows }, (_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center px-[24px] py-[18px] gap-[16px] border-b border-[#f3f3f3] last:border-b-0"
        >
          {/* Invoice # — monospace pill */}
          <ShimmerBox width={100} height={11} />
          {/* Date */}
          <ShimmerBox width={80} height={10} />
          {/* Description — variable width */}
          <div className="flex-1 flex flex-col gap-[5px]">
            <ShimmerBox width="85%" height={11} />
            <ShimmerBox width="55%" height={9} />
          </div>
          {/* Amount */}
          <ShimmerBox width={80} height={13} />
          {/* Status badge */}
          <SkeletonBadge />
          {/* Action button */}
          <ShimmerBox width={64} height={28} />
        </div>
      ))}

      {/* ── Pagination strip ─────────────────────────────────────────── */}
      <div className="px-[24px] py-[16px] border-t border-[#eee] flex items-center justify-between">
        <ShimmerBox width={140} height={10} />
        <div className="flex items-center gap-[8px]">
          {[32, 32, 32].map((w, i) => (
            <ShimmerBox key={i} width={w} height={28} />
          ))}
        </div>
      </div>
    </div>
  );
}
