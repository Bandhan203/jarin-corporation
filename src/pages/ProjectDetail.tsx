import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronLeft, ChevronRight, CheckCircle, FileText, MapPin,
  ChevronDown, ChevronUp, Eye, ArrowLeft, X,
  Compass, Ruler, TrendingUp, Calendar,
} from "lucide-react";
import { fetchProjectMatrixGrid, type MatrixUnit } from "@/services/projectsApi";
import { BUILDING_IMAGES, resolveProjectHeroImage } from "@/assets/buildingImages";
import { reserveUnit, type ReserveUnitResponse } from "@/services/bookingApi";
import QuickPayModal from "@/components/payment/QuickPayModal";
import { useAuthStore } from "@/store/authStore";

const DOCUMENTS = [
  { id: 1, label: "CS/RS Parcha", desc: "Original land ownership survey document" },
  { id: 2, label: "Land Owner Mutation", desc: "Registered mutation certificate" },
  { id: 3, label: "RAJUK Approved Layout Map", desc: "Architectural approval & building permit" },
];

interface DrawerUnit {
  flatId: string;
  floor: string;
  unit: MatrixUnit;
}

function fmt(n: number) {
  return "৳ " + n.toLocaleString("en-IN");
}

function floorLabel(n: number): string {
  if (n === 1) return "1st Floor";
  if (n === 2) return "2nd Floor";
  if (n === 3) return "3rd Floor";
  return `${n}th Floor`;
}

function unitCellStyle(status: MatrixUnit["status"]): React.CSSProperties {
  if (status === "available") {
    return { background: "white", border: "1px solid #D4AF37", cursor: "pointer" };
  }
  if (status === "reserved") {
    return { background: "#fef3c7", border: "1px solid #d97706", cursor: "default" };
  }
  return { background: "#1A1C1C", border: "1px solid #1A1C1C", cursor: "not-allowed", pointerEvents: "none" as const };
}

export default function ProjectDetail() {
  const { id = "1" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, role } = useAuthStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["project-matrix", id],
    queryFn:  () => fetchProjectMatrixGrid(id!),
    enabled:  Boolean(id),
  });

  const project = data?.project;
  const units   = data?.units ?? [];

  const images = useMemo(() => {
    const primary = resolveProjectHeroImage(project?.heroImage, Number(id) - 1);
    return [primary, ...BUILDING_IMAGES.gallery.filter((img) => img !== primary)];
  }, [project?.heroImage, id]);

  const floors = useMemo(() => {
    const nums = [...new Set(units.map((u) => u.floorNumber))].sort((a, b) => b - a);
    return nums.map(floorLabel);
  }, [units]);

  const floorNumbers = useMemo(() => {
    return [...new Set(units.map((u) => u.floorNumber))].sort((a, b) => b - a);
  }, [units]);

  const blocks = ["Flat A", "Flat B", "Flat C"];

  function unitAt(floorNum: number, blockLetter: string): MatrixUnit | undefined {
    return units.find(
      (u) => u.floorNumber === floorNum && u.unitNumber.endsWith(blockLetter)
    );
  }

  const [slide, setSlide] = useState(0);
  const [openDocs, setOpenDocs] = useState<number[]>([]);
  const [docPreview, setDocPreview] = useState<number | null>(null);
  const [drawerUnit, setDrawerUnit] = useState<DrawerUnit | null>(null);
  const [booking, setBooking] = useState<ReserveUnitResponse | null>(null);
  const [showQuickPay, setShowQuickPay] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);

  function toggleDoc(docId: number) {
    setOpenDocs((prev) => prev.includes(docId) ? prev.filter((x) => x !== docId) : [...prev, docId]);
  }

  useEffect(() => {
    if (!drawerUnit) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && setDrawerUnit(null);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [drawerUnit]);

  const goldBar = "bg-[#d4af37] h-px w-[40px]";

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center bg-[#FAFAFA]">
        <span className="font-['Inter'] text-[11px] tracking-[2px] uppercase text-[#4d4635]">Loading project matrix…</span>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-[16px] bg-[#FAFAFA]">
        <span className="font-['Inter'] text-[13px] text-[#4d4635]">Failed to load project data.</span>
        <button onClick={() => navigate("/")} className="font-['Inter'] text-[10px] tracking-[2px] uppercase text-[#735c00]">← Back home</button>
      </div>
    );
  }

  return (
    <div className="w-full bg-premium-bg">
      {/* Back */}
      <div className="px-[64px] pt-[40px] pb-[8px]">
        <button onClick={() => navigate(-1)} className="flex items-center gap-[8px] text-text-secondary hover:text-warm-brown transition-colors cursor-pointer">
          <ArrowLeft size={14} />
          <span className="font-['Inter'] font-medium text-[10px] tracking-[2px] uppercase leading-[15px]">Back to Projects</span>
        </button>
      </div>

      {/* ── Section A: Master Identity ─────────────────────────────── */}
      <section className="flex gap-0 items-stretch px-[64px] py-[48px]">
        {/* Left: Carousel */}
        <div className="flex-1 relative overflow-hidden min-h-[480px] bg-[#eee]">
          <img
            src={images[slide]}
            alt={`View ${slide + 1}`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-white mix-blend-saturation pointer-events-none" />
          <button
            onClick={() => setSlide((s) => (s - 1 + images.length) % images.length)}
            className="absolute left-[16px] top-1/2 -translate-y-1/2 bg-white/90 size-[36px] flex items-center justify-center hover:bg-white transition-colors cursor-pointer shadow-[var(--shadow-premium-sm)]"
          >
            <ChevronLeft size={16} color="#1a1c1c" />
          </button>
          <button
            onClick={() => setSlide((s) => (s + 1) % images.length)}
            className="absolute right-[16px] top-1/2 -translate-y-1/2 bg-white/90 size-[36px] flex items-center justify-center hover:bg-white transition-colors cursor-pointer shadow-[var(--shadow-premium-sm)]"
          >
            <ChevronRight size={16} color="#1a1c1c" />
          </button>
          <div className="absolute bottom-[16px] left-1/2 -translate-x-1/2 flex gap-[6px]">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className="transition-all cursor-pointer"
                style={{ width: i === slide ? 20 : 6, height: 6, background: i === slide ? "#d4af37" : "rgba(255,255,255,0.6)", borderRadius: 3 }}
              />
            ))}
          </div>
          <div className="absolute top-[16px] left-[16px] backdrop-blur-[4px] bg-white/90 px-[12px] py-[4px]">
            <span className="font-['Inter'] font-medium text-charcoal text-[10px] tracking-[0.5px] uppercase leading-[15px]">
              {["Exterior Render", "Interior Common Space", "Community Hall Lounge"][slide]}
            </span>
          </div>
        </div>

        {/* Right: Fixed panel */}
        <div className="w-[380px] shrink-0 bg-card-bg border-l border-neutral-200 flex flex-col p-[40px] gap-[24px] shadow-[var(--shadow-premium-sm)]">
          <div className={goldBar} />
          <div>
            <h1 className="font-['Noto_Serif'] font-semibold text-charcoal text-[28px] leading-[34px] tracking-[-0.5px]">
              {project.title}
            </h1>
          </div>
          <div className="flex items-start gap-[8px]">
            <MapPin size={13} color="#735c00" className="mt-[2px] shrink-0" />
            <span className="font-['Inter'] font-normal text-text-secondary text-[13px] leading-[20px]">{project.location}</span>
          </div>
          <div className="flex flex-col gap-[12px]">
            {[
              { label: "Total Land Area", value: `${project.totalKatha} Katha` },
              { label: "Total Shares", value: `${project.totalShares} Units` },
              { label: "Base Rate", value: `৳ ${project.baseSqftRate.toLocaleString()} / SFT` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-[12px] border-b border-neutral-200">
                <span className="font-['Inter'] font-medium text-text-secondary text-[10px] tracking-[1.5px] uppercase leading-[15px]">{label}</span>
                <span className="font-['Noto_Serif'] font-semibold text-charcoal text-[14px] leading-[20px]">{value}</span>
              </div>
            ))}
          </div>
          <div className="border border-[#d4af37] p-[16px] flex flex-col gap-[8px]">
            <span className="font-['Inter'] font-medium text-text-secondary text-[9px] tracking-[2px] uppercase leading-[14px]">Current Phase Status</span>
            <div className="flex items-center gap-[8px]">
              <div className="w-[6px] h-[6px] rounded-full bg-[#d4af37] animate-pulse shrink-0" />
              <span className="font-['Noto_Serif'] font-semibold text-warm-brown text-[13px] leading-[18px] tracking-[0.5px] uppercase">
                {project.phaseLabel ?? project.status.toUpperCase()}
              </span>
            </div>
            <div className="mt-[4px] bg-neutral-200 h-[2px] w-full relative rounded-full">
              <div className="absolute left-0 top-0 h-full bg-[#d4af37] rounded-full" style={{ width: `${project.fundingPercentage}%` }} />
            </div>
            <span className="font-['Inter'] font-medium text-text-secondary text-[9px] tracking-[1px] uppercase leading-[14px]">
              {Math.round(project.fundingPercentage)}% of Target Capital Raised
            </span>
          </div>
          <button className="bg-charcoal flex items-center justify-center py-[14px] hover:bg-[#2e2b27] transition-colors cursor-pointer mt-auto">
            <span className="font-['Inter'] font-semibold text-white text-[11px] tracking-[2px] uppercase leading-[16px]">BOOK A SHARE</span>
          </button>
        </div>
      </section>

      {/* ── Section B: Interactive Floor Map ─────────────────────────── */}
      <section className="px-[64px] pb-[64px]">
        <div className="bg-card-bg border border-neutral-200 p-[48px] shadow-[var(--shadow-premium-sm)]">
          <div className="flex items-center gap-[16px] mb-[8px]">
            <div className={goldBar} />
          </div>
          <h2 className="font-['Noto_Serif'] font-semibold text-charcoal text-[20px] leading-[28px] mb-[4px]">
            Interactive Floor Plan Matrix
          </h2>
          <p className="font-['Inter'] font-normal text-text-secondary text-[13px] leading-[20px] mb-[32px]">
            Click available units to view full details and initiate booking.
          </p>

          {/* Legend */}
          <div className="flex gap-[24px] mb-[32px]">
            {[
              { color: "border-[#d4af37] bg-white", label: "Available — Click to View" },
              { color: "bg-[#6b6b6b]", label: "Reserved / Pending" },
              { color: "bg-[#1a1c1c]", label: "Sold / Registered" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-[8px]">
                <div className={`w-[14px] h-[14px] ${color} border`} style={label.startsWith("Available") ? { borderColor: "#d4af37" } : { borderColor: "transparent" }} />
                <span className="font-['Inter'] font-medium text-text-secondary text-[10px] tracking-[1px] uppercase leading-[14px]">{label}</span>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[0px]">
            <div className="flex flex-col w-[100px] shrink-0 mt-[32px]">
              {floors.map((f) => (
                <div key={f} className="h-[52px] flex items-center">
                  <span className="font-['Inter'] font-medium text-text-secondary text-[10px] tracking-[0.5px] leading-[14px]">{f}</span>
                </div>
              ))}
            </div>

            <div className="flex-1">
              <div className="flex mb-[4px]">
                {blocks.map((b) => (
                  <div key={b} className="flex-1 text-center">
                    <span className="font-['Inter'] font-medium text-text-secondary text-[10px] tracking-[1.5px] uppercase leading-[14px]">{b}</span>
                  </div>
                ))}
              </div>
              {floors.map((floor, fi) => (
                <div key={floor} className="flex gap-[8px] mb-[8px]">
                  {blocks.map((block) => {
                    const blockLetter = block.split(" ")[1];
                    const floorNum = floorNumbers[fi];
                    const unit = unitAt(floorNum, blockLetter);
                    const status = unit?.status ?? "sold";
                    const flatId = unit?.unitNumber ?? `${floorNum}${blockLetter}`;
                    const isAvailable = status === "available";
                    const isReserved = status === "reserved";
                    const isSold = status === "sold";

                    return (
                      <div key={block} className="flex-1 relative">
                        <motion.div
                          className="h-[44px] flex items-center justify-center transition-all relative rounded-none"
                          style={unitCellStyle(status)}
                          whileHover={isAvailable ? { scale: 1.04, boxShadow: "0 4px 16px rgba(212,175,55,0.22)" } : {}}
                          whileTap={isAvailable ? { scale: 0.97 } : {}}
                          onClick={() => isAvailable && unit && setDrawerUnit({ flatId, floor, unit })}
                        >
                          {isSold && <CheckCircle size={14} color="white" />}
                          {isReserved && (
                            <span className="font-['Inter'] font-medium text-[#92400e] text-[8px] tracking-[0.5px] uppercase">Reserved</span>
                          )}
                          {isAvailable && (
                            <span className="font-['Inter'] font-semibold text-warm-brown text-[9px] tracking-[0.5px] uppercase">{flatId}</span>
                          )}
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section C: Document Vault ─────────────────────────────────── */}
      <section className="px-[64px] pb-[80px]">
        <div className="bg-card-bg border border-neutral-200 p-[48px] shadow-[var(--shadow-premium-sm)]">
          <div className={goldBar + " mb-[16px]"} />
          <h2 className="font-['Noto_Serif'] font-semibold text-charcoal text-[20px] leading-[28px] mb-[4px]">
            Vetted Document Vault
          </h2>
          <p className="font-['Inter'] font-normal text-text-secondary text-[13px] leading-[20px] mb-[32px]">
            All legal documents are independently verified. View-only previews available.
          </p>

          <div className="flex flex-col gap-0 border border-neutral-200">
            {DOCUMENTS.map((doc, i) => {
              const isOpen = openDocs.includes(doc.id);
              return (
                <div key={doc.id} className={i > 0 ? "border-t border-neutral-200" : ""}>
                  <button
                    onClick={() => toggleDoc(doc.id)}
                    className="w-full flex items-center justify-between px-[24px] py-[20px] hover:bg-premium-bg transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-[16px]">
                      <FileText size={14} color="#735c00" />
                      <div>
                        <span className="font-['Inter'] font-semibold text-charcoal text-[12px] tracking-[1px] uppercase leading-[18px] block">{i + 1}. {doc.label}</span>
                        <span className="font-['Inter'] font-normal text-text-secondary text-[11px] leading-[16px]">{doc.desc}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-[12px]">
                      <span className="font-['Inter'] font-medium text-warm-brown text-[9px] tracking-[1.5px] uppercase leading-[14px] bg-[#735c00]/8 px-[8px] py-[3px]">VERIFIED</span>
                      {isOpen ? <ChevronUp size={14} color="#4d4635" /> : <ChevronDown size={14} color="#4d4635" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-[24px] pb-[24px] bg-premium-bg border-t border-neutral-200">
                      {docPreview === doc.id ? (
                        <div className="relative mt-[16px] border border-[#d0c5af] overflow-hidden">
                          <div className="bg-neutral-100 h-[200px] flex items-center justify-center relative">
                            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                              {Array.from({ length: 4 }).map((_, r) =>
                                Array.from({ length: 3 }).map((_, c) => (
                                  <span key={`${r}-${c}`} className="absolute font-['Inter'] font-bold text-charcoal text-[24px] tracking-[8px] uppercase select-none"
                                    style={{ top: `${r * 55 + 10}px`, left: `${c * 180 - 40}px`, transform: "rotate(-20deg)" }}>
                                    VIEW ONLY
                                  </span>
                                ))
                              )}
                            </div>
                            <div className="flex flex-col items-center gap-[8px]">
                              <FileText size={32} color="#d0c5af" />
                              <span className="font-['Noto_Serif'] font-semibold text-charcoal text-[14px] leading-[20px]">{doc.label}</span>
                              <span className="font-['Inter'] font-medium text-text-secondary text-[10px] tracking-[1px] uppercase">DOCUMENT PREVIEW — VIEW ONLY</span>
                            </div>
                          </div>
                          <button onClick={() => setDocPreview(null)} className="w-full py-[10px] bg-white border-t border-neutral-200 font-['Inter'] font-medium text-text-secondary text-[10px] tracking-[1.5px] uppercase hover:bg-neutral-100 transition-colors cursor-pointer">
                            CLOSE PREVIEW
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDocPreview(doc.id)}
                          className="mt-[16px] flex items-center gap-[8px] px-[20px] py-[10px] hover:bg-white transition-colors cursor-pointer border border-[#d0c5af]"
                        >
                          <Eye size={12} color="#735c00" />
                          <span className="font-['Inter'] font-medium text-warm-brown text-[10px] tracking-[1.5px] uppercase leading-[15px]">VIEW WATERMARK PREVIEW</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Floor Unit Detail Drawer ─────────────────────────────────── */}
      <AnimatePresence>
        {drawerUnit && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/25 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setDrawerUnit(null)}
            />

            <motion.aside
              className="fixed right-0 top-0 h-full w-[440px] bg-card-bg z-50 flex flex-col shadow-[var(--shadow-premium-lg)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 38 }}
            >
              {/* Drawer Header */}
              <div className="px-[32px] py-[28px] border-b border-neutral-200 flex items-start justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-[8px] mb-[6px]">
                    <div className="w-[3px] h-[20px] bg-[#d4af37]" />
                    <span className="font-['Inter'] font-medium text-text-secondary text-[9px] tracking-[2px] uppercase">
                      Unit Detail
                    </span>
                  </div>
                  <h2 className="font-['Noto_Serif'] font-semibold text-charcoal text-[24px] leading-[30px] tracking-[-0.4px]">
                    Flat {drawerUnit.flatId}
                  </h2>
                  <p className="font-['Inter'] font-medium text-text-secondary text-[12px] mt-[4px]">
                    {drawerUnit.floor} · Available
                  </p>
                </div>
                <button
                  onClick={() => setDrawerUnit(null)}
                  className="flex items-center justify-center w-[32px] h-[32px] hover:bg-neutral-100 transition-colors cursor-pointer mt-[4px]"
                >
                  <X size={15} color="#4d4635" />
                </button>
              </div>

              {/* Unit Specs */}
              <div className="flex-1 overflow-y-auto px-[32px] py-[28px] flex flex-col gap-[24px]">
                {/* Key metrics */}
                <div className="grid grid-cols-2 gap-[12px]">
                  {[
                    { icon: Ruler,    label: "Size",        value: `${drawerUnit.unit.sizeSft.toLocaleString()} SFT`, color: "#735c00", bg: "#f9f6ee" },
                    { icon: Compass,  label: "Orientation", value: drawerUnit.unit.orientation ?? "—", color: "#111111", bg: "#f4f4f4" },
                    { icon: TrendingUp, label: "Floor Premium", value: `+${drawerUnit.unit.premiumCharge.toLocaleString()} BDT`, color: "#d4af37", bg: "#fffbeb" },
                    { icon: Calendar, label: "Unit Number", value: drawerUnit.unit.unitNumber, color: "#4d4635", bg: "#f4f4f4" },
                  ].map(({ icon: Icon, label, value, color, bg }, i) => (
                    <motion.div
                      key={label}
                      className="p-[16px] flex flex-col gap-[8px]"
                      style={{ background: bg }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 + 0.12, duration: 0.28 }}
                    >
                      <Icon size={13} color={color} />
                      <span className="font-['Inter'] font-medium text-text-secondary text-[9px] tracking-[1.5px] uppercase">{label}</span>
                      <span className="font-['Inter'] font-semibold text-charcoal text-[13px] leading-[18px]">{value}</span>
                    </motion.div>
                  ))}
                </div>

                {/* View */}
                <div className="border border-neutral-200 px-[20px] py-[16px] flex items-center justify-between">
                  <span className="font-['Inter'] font-medium text-text-secondary text-[10px] tracking-[1.5px] uppercase">Floor</span>
                  <span className="font-['Inter'] font-semibold text-charcoal text-[13px]">{drawerUnit.floor}</span>
                </div>

                {/* Pricing breakdown from live SQL variables */}
                <div className="bg-soft-gold p-[24px] flex flex-col gap-[12px] rounded-none">
                  <span className="font-['Inter'] font-medium text-text-secondary text-[9px] tracking-[2px] uppercase">Unit Price Calculation</span>
                  <div className="flex justify-between font-['Inter'] text-[11px] text-[#4d4635]">
                    <span>{drawerUnit.unit.sizeSft.toLocaleString()} SFT × ৳{project.baseSqftRate.toLocaleString()}</span>
                    <span>৳ {(drawerUnit.unit.sizeSft * project.baseSqftRate).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-['Inter'] text-[11px] text-[#4d4635]">
                    <span>Floor Premium Charge</span>
                    <span>+৳ {drawerUnit.unit.premiumCharge.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-[#d4af37]/30 w-full" />
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.32 }}>
                    <span className="font-['Noto_Serif'] font-bold text-charcoal text-[30px] leading-[36px] tracking-[-0.8px]">
                      {fmt(drawerUnit.unit.totalPrice)}
                    </span>
                  </motion.div>
                </div>

                {/* Crowdfund note */}
                <div className="bg-neutral-100 px-[16px] py-[14px]">
                  <p className="font-['Inter'] font-medium text-text-secondary text-[11px] leading-[17px]">
                    CS/RS Mutation Deed will be issued in your name after 100% crowdfund target is cleared. Unit is now available for reservation.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="px-[32px] py-[24px] border-t border-neutral-200 flex flex-col gap-[10px] shrink-0">
                {reserveError && (
                  <p className="font-['Inter'] text-red-600 text-[11px]">{reserveError}</p>
                )}
                <motion.button
                  className="w-full flex items-center justify-center py-[15px] bg-[#1A1C1C] hover:bg-[#2a2a2a] transition-colors cursor-pointer rounded-none disabled:opacity-50"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={reserving}
                  onClick={async () => {
                    if (!isAuthenticated || role !== "investor") {
                      navigate("/login", { state: { from: `/project/${id}` } });
                      return;
                    }
                    setReserving(true);
                    setReserveError(null);
                    try {
                      const res = await reserveUnit(drawerUnit.unit.id, id);
                      setBooking(res);
                      setShowQuickPay(true);
                      queryClient.invalidateQueries({ queryKey: ["project-matrix", id] });
                    } catch {
                      setReserveError("Reservation failed. Unit may no longer be available.");
                    } finally {
                      setReserving(false);
                    }
                  }}
                >
                  <span className="font-['Inter'] font-semibold text-white text-[11px] tracking-[2.5px] uppercase">
                    {reserving ? "Reserving…" : "Proceed to Payment"}
                  </span>
                </motion.button>
                <button
                  onClick={() => setDrawerUnit(null)}
                  className="w-full flex items-center justify-center py-[12px] border border-neutral-200 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <span className="font-['Inter'] font-medium text-text-secondary text-[10px] tracking-[1.5px] uppercase">
                    View Another Unit
                  </span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <QuickPayModal
        open={showQuickPay && Boolean(booking)}
        onClose={() => { setShowQuickPay(false); setBooking(null); }}
        invoiceNumber={booking?.invoiceNumber ?? ""}
        amountBdt={booking?.amountBdt ?? 0}
        label={booking ? `Booking · ${booking.unitNumber} · ${booking.projectName}` : undefined}
      />
    </div>
  );
}
