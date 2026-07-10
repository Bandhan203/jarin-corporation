/**
 * ValuationLineChart
 * Renders a unified 2022–2028 timeline with:
 *   - Solid gold line: actual historical data (2022–2025)
 *   - Dashed gold line: projected future data (2025–2028)
 *   - Animated entry (strokeDashoffset trick via CSS)
 *   - Premium custom tooltip (charcoal border, gold value, Inter font)
 *   - "Today" reference line at the data join point
 */

import { useCallback } from "react";
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { ValuationPoint } from "@/services/analyticsApi";

// ── Premium Tooltip ───────────────────────────────────────────────────────────

interface PremiumTooltipPayloadItem {
  dataKey: string;
  value: number | null;
  payload: ValuationPoint & { displayYear: string };
}

function PremiumTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;

  // Pick the non-null value from whichever series is active at this x
  const item = (payload as unknown as PremiumTooltipPayloadItem[]).find((p) => p.value != null);
  if (!item) return null;

  const isProjected = item.dataKey === "projected";
  const year        = label as string;
  const value       = item.value as number;

  return (
    <div
      style={{
        background:   "#ffffff",
        border:       "1px solid #1a1c1c",
        padding:      "12px 16px",
        minWidth:     140,
        boxShadow:    "0 4px 24px rgba(26,28,28,0.10)",
        fontFamily:   "Inter, sans-serif",
        pointerEvents: "none",
      }}
    >
      {/* Year + type label */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          gap:            8,
          marginBottom:   8,
        }}
      >
        <span
          style={{
            fontFamily:     "Inter, sans-serif",
            fontSize:       9,
            letterSpacing:  "0.12em",
            textTransform:  "uppercase",
            color:          "#9e9e9e",
          }}
        >
          {year}
        </span>
        <span
          style={{
            background:    isProjected ? "transparent" : "#1a1c1c",
            border:        isProjected ? "1px solid #d4af37" : "none",
            color:         isProjected ? "#d4af37" : "#ffffff",
            fontSize:       8,
            letterSpacing:  "0.1em",
            textTransform:  "uppercase",
            padding:       "1px 6px",
            fontFamily:    "Inter, sans-serif",
          }}
        >
          {isProjected ? "Projected" : "Actual"}
        </span>
      </div>

      {/* Gold value */}
      <div
        style={{
          fontFamily:   "'Georgia', 'Noto Serif', serif",
          fontSize:     22,
          fontWeight:   400,
          color:        "#d4af37",
          lineHeight:   1.2,
          letterSpacing: "-0.5px",
        }}
      >
        ৳ {value.toFixed(1)}L
        <span
          style={{
            fontFamily:  "Inter, sans-serif",
            fontSize:    10,
            color:       "#4d4635",
            marginLeft:  4,
            fontWeight:  400,
          }}
        >
          / katha
        </span>
      </div>

      {/* Sub label */}
      <div
        style={{
          fontFamily:   "Inter, sans-serif",
          fontSize:     9,
          color:        "#9e9e9e",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginTop:    6,
        }}
      >
        {isProjected ? "Est. market valuation" : "Verified market rate"}
      </div>
    </div>
  );
}

// ── Custom dot renderers ──────────────────────────────────────────────────────

interface DotProps {
  cx?: number;
  cy?: number;
  index?: number;
  value?: number | null;
}

// Solid gold dot for actual line
function ActualDot({ cx = 0, cy = 0, value }: DotProps) {
  if (value == null) return null;
  return (
    <g key={`ad-${cx}-${cy}`}>
      <circle cx={cx} cy={cy} r={4}   fill="#d4af37" stroke="#d4af37" strokeWidth={0} />
      <circle cx={cx} cy={cy} r={7}   fill="none"    stroke="#d4af37" strokeWidth={1} opacity={0.3} />
    </g>
  );
}

// Hollow gold dot for projected line — open centre to signal estimation
function ProjectedDot({ cx = 0, cy = 0, value }: DotProps) {
  if (value == null) return null;
  return (
    <circle
      key={`pd-${cx}-${cy}`}
      cx={cx} cy={cy} r={4}
      fill="white"
      stroke="#d4af37"
      strokeWidth={1.5}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface ValuationLineChartProps {
  data: ValuationPoint[];
  /** Height of the chart container (default 240) */
  height?: number;
}

export default function ValuationLineChart({ data, height = 240 }: ValuationLineChartProps) {
  // Split into two series — recharts renders them as separate <Line> elements
  // so we can use different strokeDasharray without function props
  const actualSeries    = data.map((d) => ({ year: d.year, actual: d.actual }));
  const projectedSeries = data.map((d) => ({ year: d.year, projected: d.projected }));

  const tickFormatter = useCallback((v: number) => `৳${v}L`, []);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart margin={{ top: 12, right: 28, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="2 4"
          stroke="#f0f0f0"
          vertical={false}
        />

        <XAxis
          dataKey="year"
          type="category"
          allowDuplicatedCategory={false}
          tick={{
            fontFamily:    "Inter, sans-serif",
            fontSize:      10,
            fill:          "#9e9e9e",
            letterSpacing: 1,
          }}
          axisLine={{ stroke: "#eeeeee", strokeWidth: 1 }}
          tickLine={false}
          padding={{ left: 20, right: 20 }}
        />

        <YAxis
          tickFormatter={tickFormatter}
          tick={{
            fontFamily: "Inter, sans-serif",
            fontSize:   10,
            fill:       "#9e9e9e",
          }}
          axisLine={false}
          tickLine={false}
          domain={[0, "dataMax + 0.5"]}
          width={52}
        />

        <Tooltip content={<PremiumTooltip />} cursor={{ stroke: "#1a1c1c", strokeWidth: 1, strokeDasharray: "3 3" }} />

        {/* "Today" reference line at 2025 — the handoff between actual & projected */}
        <ReferenceLine
          x="2025"
          stroke="#d4af37"
          strokeDasharray="4 4"
          strokeWidth={1}
          label={{
            value:      "TODAY",
            position:   "insideTopRight",
            fontSize:   8,
            fill:       "#d4af37",
            fontFamily: "Inter, sans-serif",
            letterSpacing: 1.5,
            offset:     6,
          }}
        />

        {/* ── Actual: solid gold ─────────────────────────────────────── */}
        <Line
          data={actualSeries}
          type="monotone"
          dataKey="actual"
          name="actual"
          stroke="#d4af37"
          strokeWidth={2}
          dot={<ActualDot />}
          activeDot={{ r: 5, fill: "#d4af37", stroke: "#735c00", strokeWidth: 1.5 }}
          connectNulls={false}
          isAnimationActive
          animationDuration={800}
          animationEasing="ease-out"
        />

        {/* ── Projected: dashed gold ─────────────────────────────────── */}
        <Line
          data={projectedSeries}
          type="monotone"
          dataKey="projected"
          name="projected"
          stroke="#d4af37"
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={<ProjectedDot />}
          activeDot={{ r: 5, fill: "white", stroke: "#d4af37", strokeWidth: 2 }}
          connectNulls={false}
          isAnimationActive
          animationDuration={1100}
          animationEasing="ease-out"
          animationBegin={400}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
