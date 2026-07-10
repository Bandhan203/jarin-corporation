/**
 * DashboardSkeleton — full-page placeholder for the Investor Dashboard
 * while the API response is in-flight.
 *
 * Mirrors: 3 metric cards → construction updates panel → radial progress card
 * Transitions to real content via CSS opacity fade once `loaded` flips true.
 */

import { useEffect, useState } from "react";
import { ShimmerBox, GoldLineSkeleton, MetricCardSkeleton } from "./SkeletonPrimitives";

interface DashboardSkeletonProps {
  /** Set to true once real data is ready — triggers fade-out */
  loaded?: boolean;
  children?: React.ReactNode;
}

// ── Radial circle placeholder ────────────────────────────────────────────────
function RadialSkeleton({ size = 180 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        className="shimmer rounded-full"
        style={{ width: size, height: size }}
        aria-hidden
      />
    </div>
  );
}

// ── Timeline item placeholder ────────────────────────────────────────────────
function TimelineRowSkeleton() {
  return (
    <div className="flex gap-[16px] py-[20px] border-b border-[#f3f3f3] last:border-b-0">
      <div className="flex flex-col items-center gap-[4px]">
        <ShimmerBox width={8} height={8} style={{ borderRadius: "50%", marginTop: 4 }} />
        <ShimmerBox width={1} height={40} />
      </div>
      <div className="flex-1 flex flex-col gap-[6px]">
        <div className="flex items-center gap-[8px]">
          <ShimmerBox width={70} height={9} />
          <ShimmerBox width={50} height={16} />
        </div>
        <ShimmerBox width="75%" height={12} />
      </div>
      <ShimmerBox width={44} height={26} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DashboardSkeleton({ loaded = false, children }: DashboardSkeletonProps) {
  const [visible, setVisible] = useState(!loaded);
  const [childrenVisible, setChildrenVisible] = useState(loaded);

  useEffect(() => {
    if (loaded) {
      // Step 1: fade skeleton out
      const fadeOut = setTimeout(() => setVisible(false), 320);
      // Step 2: fade real content in (slight overlap for smoothness)
      const fadeIn  = setTimeout(() => setChildrenVisible(true), 240);
      return () => { clearTimeout(fadeOut); clearTimeout(fadeIn); };
    }
  }, [loaded]);

  return (
    <div className="relative p-[40px] min-h-full">
      {/* ── Skeleton layer ──────────────────────────────────────────── */}
      {visible && (
        <div
          className="transition-opacity duration-[320ms]"
          style={{ opacity: loaded ? 0 : 1 }}
          aria-label="Loading dashboard…"
          aria-busy
        >
          {/* Page header */}
          <div className="mb-[40px]">
            <GoldLineSkeleton width={40} />
            <ShimmerBox width={220} height={28} className="mb-[8px]" />
            <ShimmerBox width={300} height={13} />
          </div>

          {/* ── 3 KPI metric cards ──────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-[20px] mb-[32px]">
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            {/* Legal Standing card — slightly different inner layout */}
            <div className="bg-white border border-[#eee] p-[28px] flex flex-col gap-[12px] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] shimmer" />
              <div className="flex items-center justify-between">
                <ShimmerBox width={90} height={10} />
                <ShimmerBox width={14} height={14} style={{ borderRadius: "50%" }} />
              </div>
              <ShimmerBox width={140} height={22} />
              <ShimmerBox width="100%" height={30} />
              <ShimmerBox width={100} height={10} />
            </div>
          </div>

          {/* ── Bottom section: updates + radial ────────────────────── */}
          <div className="grid grid-cols-[1fr_340px] gap-[20px]">
            {/* Construction updates panel */}
            <div className="bg-white border border-[#eee] flex flex-col">
              {/* Tab bar */}
              <div className="px-[28px] pt-[28px] pb-[0] border-b border-[#eee]">
                <div className="flex items-center gap-[24px] mb-[16px]">
                  <ShimmerBox width={140} height={10} />
                  <ShimmerBox width={100} height={10} />
                </div>
              </div>
              <div className="flex-1 p-[28px] flex flex-col gap-0">
                {Array.from({ length: 4 }, (_, i) => (
                  <TimelineRowSkeleton key={i} />
                ))}
              </div>
            </div>

            {/* Radial progress card */}
            <div className="bg-white border border-[#eee] p-[28px] flex flex-col gap-[20px]">
              <GoldLineSkeleton width={32} />
              <ShimmerBox width={140} height={16} />

              {/* Radial chart */}
              <div className="flex justify-center">
                <RadialSkeleton size={200} />
              </div>

              {/* Legend rows */}
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-[8px]">
                    <ShimmerBox width={8} height={8} style={{ borderRadius: "50%" }} />
                    <ShimmerBox width={70} height={10} />
                  </div>
                  <ShimmerBox width={30} height={12} />
                </div>
              ))}

              {/* Completion strip */}
              <div className="border-t border-[#eee] pt-[16px]">
                <ShimmerBox width="100%" height={48} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Real content layer (fades in) ──────────────────────────── */}
      {children && (
        <div
          className="transition-opacity duration-[350ms] estate-fade-in"
          style={{
            opacity:   childrenVisible ? 1 : 0,
            position:  visible ? "absolute" : "relative",
            top:       visible ? 0 : undefined,
            left:      visible ? 0 : undefined,
            right:     visible ? 0 : undefined,
            pointerEvents: childrenVisible ? "auto" : "none",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
