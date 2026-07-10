/**
 * WatermarkPDFViewer — canvas-based document renderer with dynamic watermark overlay.
 *
 * Security layer:
 *   - Watermark text sourced from authenticated user context (Zustand)
 *   - SHA-256 = sha256(userId + timestamp + clientIP + salt) via Web Crypto
 *   - Repeats diagonally at 45° across the full bounding box at 13% opacity
 *   - ResizeObserver keeps canvas pixel-perfect at any zoom or window size
 *   - Download captures canvas → PNG with watermark baked in
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Download, Shield, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WatermarkConfig {
  documentTitle: string;
  documentRef:   string;
  s3Url?:        string;
}

interface WatermarkMeta {
  userId:       string;
  userName:     string;
  timestamp:    string;        // ISO-8601
  ipAddress:    string;
  securityHash: string;        // SHA-256 hex (64 chars)
}

// ── Crypto helpers ────────────────────────────────────────────────────────────

const SALT = "estate-archive-bd-v2-2024";

async function sha256(message: string): Promise<string> {
  const buf  = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function fetchClientIp(): Promise<string> {
  try {
    const res  = await fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    return data.ip ?? "IP-MASKED";
  } catch {
    return "IP-MASKED";
  }
}

async function buildWatermarkMeta(userId: string, userName: string): Promise<WatermarkMeta> {
  const timestamp = new Date().toISOString();
  const ipAddress = await fetchClientIp();
  const raw       = `${userId}::${timestamp}::${ipAddress}::${SALT}`;
  const securityHash = await sha256(raw);
  return { userId, userName, timestamp, ipAddress, securityHash };
}

// ── Watermark draw function ───────────────────────────────────────────────────

/**
 * Tiles the watermark string diagonally (45°) across the entire canvas
 * at 13% opacity. Responds to canvas size via passed width/height.
 */
function drawWatermarkOverlay(
  ctx:    CanvasRenderingContext2D,
  meta:   WatermarkMeta,
  width:  number,
  height: number,
) {
  const timestamp = new Date(meta.timestamp).toLocaleString("en-BD", {
    timeZone:     "Asia/Dhaka",
    year:         "numeric",
    month:        "2-digit",
    day:          "2-digit",
    hour:         "2-digit",
    minute:       "2-digit",
    second:       "2-digit",
    hour12:       false,
  });

  // Single watermark string — full security context
  const text = `${meta.userId}  •  ACCESSED ON ${timestamp}  •  IP: ${meta.ipAddress}  •  CONFIDENTIAL — DO NOT SHARE`;

  ctx.save();

  ctx.globalAlpha  = 0.13;
  ctx.fillStyle    = "#1a1c1c";
  ctx.font         = "bold 11px Inter, -apple-system, sans-serif";
  ctx.textAlign    = "left";
  ctx.textBaseline = "middle";

  // Measure text so we can tile precisely
  const textWidth  = ctx.measureText(text).width;
  const tileW      = textWidth + 80;   // horizontal gap between tiles
  const tileH      = 60;               // vertical gap between rows

  // Rotate around canvas centre at exactly 45°
  ctx.translate(width / 2, height / 2);
  ctx.rotate((-45 * Math.PI) / 180);
  ctx.translate(-width / 2, -height / 2);

  // Expand draw region to cover corners after rotation (√2 factor)
  const diagonal = Math.ceil(Math.sqrt(width * width + height * height));
  const startX   = -(diagonal - width) / 2 - tileW;
  const startY   = -(diagonal - height) / 2 - tileH;
  const endX     = width  + (diagonal - width) / 2  + tileW;
  const endY     = height + (diagonal - height) / 2 + tileH;

  for (let y = startY; y < endY; y += tileH) {
    for (let x = startX; x < endX; x += tileW) {
      ctx.fillText(text, x, y);
    }
  }

  ctx.restore();
}

// ── Document page renderer ────────────────────────────────────────────────────

function renderDocumentPage(
  ctx:    CanvasRenderingContext2D,
  meta:   WatermarkMeta,
  config: WatermarkConfig,
  w:      number,
  h:      number,
) {
  // White page
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  // Charcoal header band
  ctx.fillStyle = "#1a1c1c";
  ctx.fillRect(0, 0, w, 68);

  // Gold accent line below header
  ctx.fillStyle = "#d4af37";
  ctx.fillRect(0, 68, w, 3);

  // Header typography
  ctx.fillStyle  = "#ffffff";
  ctx.font       = "bold 16px Georgia, serif";
  ctx.textAlign  = "left";
  ctx.fillText("ESTATE ARCHIVE CO-OPERATIVE", 40, 28);

  ctx.font      = "10px Inter, sans-serif";
  ctx.fillStyle = "#d4af37";
  ctx.fillText("REGISTERED LAND DEED — CERTIFIED COPY", 40, 50);

  // Metadata table
  ctx.fillStyle  = "#f9f9f9";
  ctx.fillRect(40, 96, w - 80, 116);
  ctx.strokeStyle = "#eeeeee";
  ctx.lineWidth   = 0.5;
  ctx.strokeRect(40, 96, w - 80, 116);

  const rows: [string, string][] = [
    ["Document Reference", config.documentRef],
    ["Document Type",      config.documentTitle],
    ["Authorized User",    `${meta.userId} — ${meta.userName}`],
    ["Access Timestamp",   new Date(meta.timestamp).toLocaleString("en-BD", { timeZone: "Asia/Dhaka" })],
    ["Client IP Address",  meta.ipAddress],
    ["Security Hash",      meta.securityHash.slice(0, 40) + "…"],
  ];

  ctx.font      = "9px Inter, sans-serif";
  ctx.textAlign = "left";
  rows.forEach(([label, value], i) => {
    const y = 112 + i * 17;
    ctx.fillStyle = "#9e9e9e";
    ctx.fillText(label + ":", 56, y);
    ctx.fillStyle = "#1a1c1c";
    ctx.fillText(value, 220, y);
  });

  // Body text (simulated deed copy)
  ctx.fillStyle = "#1a1c1c";
  ctx.font      = "10px Georgia, serif";
  [
    "This Deed of Conveyance is executed between the cooperative members as Vendors and the",
    "registered investor as Purchaser, in respect of property at Diabari, Sector 15, Dhaka North",
    "City Corporation, described by CS Dag No. 118, RS Dag No. 214, Mouza: Diabari, JL No. 41.",
    "",
    "The Vendor conveys all that piece of land admeasuring 850 square feet being Flat No. 7B on",
    "the 7th Floor of 'The Archive Residence I' together with proportionate undivided share of land.",
    "",
    "Consideration amount paid in full per the cooperative agreement registered under the",
    "Cooperative Societies Act, 2001 (Act No. XLVII of 2001), Sub-Registry Office, Dhaka.",
  ].forEach((line, i) => {
    ctx.fillText(line, 40, 240 + i * 18);
  });

  // Signature blocks
  ctx.strokeStyle = "#cccccc";
  ctx.lineWidth   = 0.5;
  ctx.font        = "9px Inter, sans-serif";
  ctx.textAlign   = "center";
  ctx.fillStyle   = "#9e9e9e";
  [{ x: w * 0.22, label: "Authorised Signatory" }, { x: w * 0.65, label: "Sub-Registrar Seal" }].forEach(({ x, label }) => {
    ctx.beginPath();
    ctx.moveTo(x, h - 100);
    ctx.lineTo(x + 120, h - 100);
    ctx.stroke();
    ctx.fillText(label, x + 60, h - 88);
  });

  // Footer strip
  ctx.fillStyle = "#f3f3f3";
  ctx.fillRect(0, h - 36, w, 36);
  ctx.fillStyle = "#9e9e9e";
  ctx.font      = "7.5px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    `ESTATE ARCHIVE PLATFORM — ENCRYPTED DOCUMENT · HASH: ${meta.securityHash.slice(0, 32).toUpperCase()}`,
    w / 2,
    h - 16,
  );

  // ── Apply watermark on top ────────────────────────────────────────
  drawWatermarkOverlay(ctx, meta, w, h);
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  config:   WatermarkConfig;
  onClose:  () => void;
}

export default function WatermarkPDFViewer({ config, onClose }: Props) {
  const authUser = useAuthStore((s) => s.user);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);

  const [meta, setMeta]       = useState<WatermarkMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // Effective user (fallback for demo/unauthenticated)
  const userId   = authUser?.id   ?? "GUEST";
  const userName = authUser?.name ?? "Guest User";

  // Build watermark meta once
  useEffect(() => {
    buildWatermarkMeta(userId, userName).then((m) => {
      setMeta(m);
      setLoading(false);
    });
  }, [userId, userName]);

  // ── Canvas render + ResizeObserver ────────────────────────────────
  const paint = useCallback(() => {
    if (!meta || !canvasRef.current || !containerRef.current) return;
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    const ctx       = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas resolution to container (respects devicePixelRatio)
    const dpr = window.devicePixelRatio ?? 1;
    const cw  = container.clientWidth;
    const ch  = Math.round(cw * (297 / 210)); // A4 aspect ratio

    canvas.width  = cw  * dpr;
    canvas.height = ch  * dpr;
    canvas.style.width  = `${cw}px`;
    canvas.style.height = `${ch}px`;
    ctx.scale(dpr, dpr);

    renderDocumentPage(ctx, meta, config, cw, ch);
  }, [meta, config]);

  // Initial paint when meta arrives
  useEffect(() => { paint(); }, [paint]);

  // Re-paint on container resize
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(() => { paint(); });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [paint]);

  // Re-paint on window zoom (devicePixelRatio change)
  useEffect(() => {
    const mq      = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const handler = () => paint();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [paint]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const a   = document.createElement("a");
    a.download = `${config.documentRef}-watermarked.png`;
    a.href     = canvasRef.current.toDataURL("image/png");
    a.click();
  };

  const displayTs = meta
    ? new Date(meta.timestamp).toLocaleTimeString("en-BD", { timeZone: "Asia/Dhaka", hour12: false })
    : "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(26,28,28,0.84)" }}
    >
      <div
        className="bg-white flex flex-col estate-fade-in"
        style={{ width: "min(720px, 96vw)", maxHeight: "94vh" }}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-[28px] py-[18px] border-b border-[#eee] shrink-0">
          <div className="flex items-center gap-[12px]">
            <Shield size={15} color="#d4af37" />
            <div>
              <h2
                className="font-['Noto_Serif:Regular',sans-serif] font-normal text-[#1a1c1c] text-[16px] leading-[22px]"
                style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}
              >
                {config.documentTitle}
              </h2>
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[#9e9e9e] text-[9px] tracking-[1.2px] uppercase leading-[14px] mt-[2px]">
                AES-256 Encrypted · Watermarked · Access Logged
              </p>
            </div>
          </div>
          <div className="flex items-center gap-[8px]">
            <button
              onClick={handleDownload}
              disabled={loading}
              className="flex items-center gap-[6px] bg-[#1a1c1c] px-[14px] py-[8px] hover:bg-[#2e2b27] transition-colors cursor-pointer disabled:opacity-40"
            >
              <Download size={11} color="#d4af37" />
              <span className="font-['Inter:Regular',sans-serif] font-normal text-white text-[8px] tracking-[1.5px] uppercase">Download</span>
            </button>
            <button onClick={onClose} className="p-[8px] hover:bg-[#f3f3f3] transition-colors cursor-pointer">
              <X size={15} color="#4d4635" />
            </button>
          </div>
        </div>

        {/* ── Security meta strip ─────────────────────────────────────── */}
        {meta && (
          <div className="bg-[#f9f9f9] border-b border-[#eee] px-[28px] py-[10px] flex items-center gap-[20px] overflow-x-auto shrink-0">
            {[
              { label: "User",      value: meta.userId },
              { label: "Time",      value: displayTs },
              { label: "IP",        value: meta.ipAddress },
              { label: "SHA-256",   value: meta.securityHash.slice(0, 16) + "…" },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-[1px] shrink-0">
                <span className="font-['Inter:Regular',sans-serif] font-normal text-[#9e9e9e] text-[8px] tracking-[1px] uppercase">{label}</span>
                <span className="font-['Inter:Regular',sans-serif] font-normal text-[#1a1c1c] text-[10px] leading-[14px]" style={{ fontVariant: "tabular-nums" }}>{value}</span>
              </div>
            ))}
            <button
              onClick={() => {
                setLoading(true);
                buildWatermarkMeta(userId, userName).then((m) => { setMeta(m); setLoading(false); });
              }}
              className="ml-auto flex items-center gap-[5px] border border-[#eee] px-[10px] py-[5px] hover:border-[#d4af37] transition-colors cursor-pointer shrink-0"
              title="Regenerate watermark timestamp"
            >
              <RefreshCw size={10} color="#4d4635" />
              <span className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[8px] tracking-[1px] uppercase">Refresh</span>
            </button>
          </div>
        )}

        {/* ── Canvas document ─────────────────────────────────────────── */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto flex justify-center bg-[#e2e2e2] p-[20px]"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center w-full min-h-[400px] gap-[16px]">
              <div className="w-[32px] h-[32px] border-[2px] border-[#d4af37] border-t-transparent rounded-full animate-spin" />
              <span className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[10px] tracking-[2px] uppercase">
                Generating Watermark…
              </span>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="shadow-xl estate-fade-in"
              style={{ display: "block", maxWidth: "100%" }}
            />
          )}
        </div>

        {/* ── Footer disclaimer ───────────────────────────────────────── */}
        <div className="shrink-0 border-t border-[#eee] px-[28px] py-[10px] flex items-center gap-[8px]">
          <Shield size={11} color="#9e9e9e" />
          <span className="font-['Inter:Regular',sans-serif] font-normal text-[#9e9e9e] text-[9px] leading-[14px]">
            This document is access-controlled and watermarked with your identity. Unauthorized distribution is a violation of the Cooperative Agreement.
          </span>
        </div>
      </div>
    </div>
  );
}
