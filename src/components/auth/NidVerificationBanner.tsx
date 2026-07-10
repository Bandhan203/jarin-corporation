import { useState } from "react";
import { AlertCircle, ChevronRight, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import NidVerificationForm from "@/components/nid/NidVerificationForm";

/**
 * Persistent top-of-portal banner shown to investors whose NID is not yet verified.
 * Non-blocking — content remains accessible underneath.
 * Can be temporarily dismissed (returns on next page navigation).
 */
export default function NidVerificationBanner() {
  const setNidVerified = useAuthStore((s) => s.setNidVerified);
  const [dismissed, setDismissed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  if (dismissed) return null;

  return (
    <>
      {/* ── Banner strip ─────────────────────────────────────────────── */}
      <div
        className="relative flex items-center gap-[12px] px-[32px] py-[11px] z-30"
        style={{ background: "linear-gradient(90deg, #1a1c1c 0%, #2e2b27 100%)" }}
      >
        {/* Gold left accent */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#d4af37]" />

        <AlertCircle size={14} color="#d4af37" className="shrink-0" />

        <div className="flex-1 flex items-center gap-[8px] flex-wrap">
          <span className="font-['Inter:Regular',sans-serif] font-normal text-white text-[11px] leading-[16px]">
            Your identity has not been verified.
          </span>
          <span className="font-['Inter:Regular',sans-serif] font-normal text-white/60 text-[11px] leading-[16px]">
            Complete NID verification to unlock full investment features and legal documents.
          </span>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-[6px] border border-[#d4af37] px-[14px] py-[6px] hover:bg-[#d4af37]/10 transition-colors cursor-pointer shrink-0"
        >
          <span className="font-['Inter:Regular',sans-serif] font-normal text-[#d4af37] text-[9px] tracking-[2px] uppercase leading-[14px]">
            Verify Now
          </span>
          <ChevronRight size={10} color="#d4af37" />
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="p-[4px] hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss"
        >
          <X size={13} color="#9e9e9e" />
        </button>
      </div>

      {/* ── NID verification modal ────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(26,28,28,0.75)" }}
        >
          <div
            className="bg-white w-full flex flex-col"
            style={{ maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-[32px] pt-[28px] pb-[20px] border-b border-[#eee]">
              <div>
                <div className="bg-[#d4af37] h-px w-[28px] mb-[10px]" />
                <h2
                  className="font-['Noto_Serif:Regular',sans-serif] font-normal text-[#1a1c1c] text-[18px] leading-[26px]"
                  style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}
                >
                  NID Verification
                </h2>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[11px] leading-[18px] mt-[2px]">
                  Required to access investment documents and register ownership
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-[8px] hover:bg-[#f3f3f3] transition-colors cursor-pointer"
              >
                <X size={16} color="#4d4635" />
              </button>
            </div>

            {/* Form */}
            <NidVerificationForm
              onSuccess={(verificationId) => {
                setNidVerified(true);
                setModalOpen(false);
                console.info("NID verified:", verificationId);
              }}
              onClose={() => setModalOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
