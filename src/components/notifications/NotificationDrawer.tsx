import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, X, CheckCircle, AlertCircle, FileText, Building2, ChevronRight } from "lucide-react";

type Category = "all" | "construction" | "payment" | "legal";

interface Notification {
  id: string;
  category: Exclude<Category, "all">;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL: Notification[] = [
  { id: "n1", category: "construction", title: "Pile Foundation Complete", body: "The Archive Residence I — Diabari, Sector 15. Phase 1 milestone reached. Next: Ground floor slab.", time: "2h ago", read: false },
  { id: "n2", category: "payment", title: "Installment #7 Due in 3 Days", body: "Invoice INV-2024-001234 for ৳ 42,000 will auto-charge on 13 Jul 2026.", time: "5h ago", read: false },
  { id: "n3", category: "legal", title: "CS/RS Parcha Uploaded", body: "Admin has uploaded the latest mutation deed for Parkview Co-Op. Review in Document Vault.", time: "1d ago", read: false },
  { id: "n4", category: "construction", title: "Contractor Inspection Passed", body: "RAJUK site inspection passed with zero deficiencies. Certificate archived.", time: "2d ago", read: true },
  { id: "n5", category: "payment", title: "Payment Confirmed — ৳ 42,000", body: "bKash transaction TXN-882341 cleared. 88% routed to project escrow.", time: "3d ago", read: true },
  { id: "n6", category: "legal", title: "Investor Legal Standing: Registered", body: "Your investor record is now legally registered for The Archive Residence I.", time: "5d ago", read: true },
  { id: "n7", category: "construction", title: "Material Delivery Scheduled", body: "3rd floor MS rod delivery confirmed for 15 Jul 2026. Progress: 38%.", time: "6d ago", read: true },
];

const CATEGORY_ICONS: Record<Exclude<Category, "all">, React.FC<{ size: number; color: string }>> = {
  construction: Building2,
  payment: CheckCircle,
  legal: FileText,
};

const CATEGORY_COLOR: Record<Exclude<Category, "all">, string> = {
  construction: "#735c00",
  payment: "#1a1c1c",
  legal: "#d4af37",
};

const CATEGORY_BG: Record<Exclude<Category, "all">, string> = {
  construction: "#f9f6ee",
  payment: "#f0f0f0",
  legal: "#fffbeb",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Notification[]>(INITIAL);
  const unread = notes.filter((n) => !n.read).length;

  const markAll = () => setNotes((prev) => prev.map((n) => ({ ...n, read: true })));
  const markOne = (id: string) => setNotes((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      {/* Bell trigger */}
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center justify-center w-[34px] h-[34px] hover:bg-[#f4f4f4] transition-colors rounded-none cursor-pointer"
        aria-label="Open notifications"
      >
        <Bell size={15} color="#4d4635" />
        {unread > 0 && (
          <span className="absolute top-[6px] right-[6px] w-[8px] h-[8px] rounded-full bg-[#d4af37] border border-white" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              className="fixed right-0 top-0 h-full w-[400px] bg-white z-50 flex flex-col shadow-[var(--shadow-premium-lg)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 36 }}
            >
              {/* Header */}
              <div className="px-[28px] py-[24px] border-b border-[#eee] flex items-center justify-between shrink-0">
                <div>
                  <h2 className="font-['Noto_Serif'] font-semibold text-[#111111] text-[18px] leading-[24px] tracking-[-0.3px]">
                    Notifications
                  </h2>
                  {unread > 0 && (
                    <p className="font-['Inter'] font-medium text-[#4d4635] text-[11px] tracking-[0.5px] mt-[2px]">
                      {unread} unread
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-[12px]">
                  {unread > 0 && (
                    <button
                      onClick={markAll}
                      className="font-['Inter'] font-medium text-[#735c00] text-[10px] tracking-[1px] uppercase hover:text-[#d4af37] transition-colors cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center w-[28px] h-[28px] hover:bg-[#f4f4f4] transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={14} color="#4d4635" />
                  </button>
                </div>
              </div>

              {/* Category tabs */}
              <NotificationTabs notes={notes} markOne={markOne} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NotificationTabs({
  notes,
  markOne,
}: {
  notes: Notification[];
  markOne: (id: string) => void;
}) {
  const [active, setActive] = useState<Category>("all");
  const tabs: { key: Category; label: string }[] = [
    { key: "all", label: "All" },
    { key: "construction", label: "Construction" },
    { key: "payment", label: "Payments" },
    { key: "legal", label: "Legal" },
  ];

  const filtered = active === "all" ? notes : notes.filter((n) => n.category === active);

  return (
    <>
      {/* Tabs */}
      <div className="flex border-b border-[#eee] shrink-0 px-[12px]">
        {tabs.map(({ key, label }) => {
          const categoryUnread = key === "all"
            ? notes.filter((n) => !n.read).length
            : notes.filter((n) => n.category === key && !n.read).length;
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              className="relative px-[12px] py-[14px] font-['Inter'] font-medium text-[11px] tracking-[0.5px] uppercase cursor-pointer transition-colors"
              style={{ color: active === key ? "#111111" : "#4d4635" }}
            >
              {label}
              {categoryUnread > 0 && (
                <span className="ml-[5px] inline-flex items-center justify-center w-[14px] h-[14px] rounded-full bg-[#d4af37] text-white text-[7px] font-bold leading-none">
                  {categoryUnread}
                </span>
              )}
              {active === key && (
                <motion.div
                  className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#d4af37]"
                  layoutId="tab-underline"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-[8px]">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-[12px] opacity-60">
            <AlertCircle size={28} color="#4d4635" />
            <span className="font-['Inter'] font-medium text-[#4d4635] text-[12px] tracking-[0.5px]">
              No notifications here
            </span>
          </div>
        )}
        {filtered.map((note, i) => {
          const Icon = CATEGORY_ICONS[note.category];
          const accent = CATEGORY_COLOR[note.category];
          const bg = CATEGORY_BG[note.category];
          return (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.28 }}
              onClick={() => markOne(note.id)}
              className="group flex gap-[14px] px-[24px] py-[18px] cursor-pointer border-b border-[#f4f4f4] transition-colors hover:bg-[#FAFAFA] relative"
            >
              {/* Unread pip */}
              {!note.read && (
                <div className="absolute left-[10px] top-1/2 -translate-y-1/2 w-[4px] h-[4px] rounded-full bg-[#d4af37]" />
              )}

              {/* Icon */}
              <div
                className="shrink-0 w-[36px] h-[36px] flex items-center justify-center mt-[2px]"
                style={{ background: bg }}
              >
                <Icon size={14} color={accent} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-[8px]">
                  <span
                    className="font-['Inter'] text-[12px] leading-[18px] tracking-[0.2px]"
                    style={{ fontWeight: note.read ? 400 : 600, color: "#111111" }}
                  >
                    {note.title}
                  </span>
                  <span className="font-['Inter'] font-medium text-[#4d4635] text-[9px] tracking-[0.5px] uppercase shrink-0 mt-[2px]">
                    {note.time}
                  </span>
                </div>
                <p className="font-['Inter'] font-normal text-[#4d4635] text-[11px] leading-[17px] mt-[4px] line-clamp-2">
                  {note.body}
                </p>
                <div className="flex items-center gap-[4px] mt-[8px]">
                  <span
                    className="font-['Inter'] font-medium text-[9px] tracking-[1.2px] uppercase px-[6px] py-[2px]"
                    style={{ background: bg, color: accent }}
                  >
                    {note.category}
                  </span>
                </div>
              </div>

              <ChevronRight size={12} color="#4d4635" className="shrink-0 mt-[4px] opacity-0 group-hover:opacity-60 transition-opacity" />
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-[24px] py-[16px] border-t border-[#eee] shrink-0">
        <p className="font-['Inter'] font-medium text-[#4d4635] text-[10px] tracking-[0.5px] text-center">
          Showing {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>
    </>
  );
}
