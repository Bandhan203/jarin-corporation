import { useState, useRef, useCallback } from "react";
import { Upload, CheckCircle2, AlertCircle, Loader, X, Shield, Camera } from "lucide-react";

type VerifyStatus = "idle" | "uploading" | "verified" | "pending_review" | "error";

interface FileSlot {
  file: File | null;
  preview: string | null;
}

interface NidVerificationFormProps {
  onSuccess?: (verificationId: string) => void;
  onClose?: () => void;
}

import { apiClient } from "@/services/apiClient";
import { useAuthStore } from "@/store/authStore";

async function submitNidVerification(params: {
  nidNumber: string;
  frontFile: File;
  backFile: File;
}): Promise<{ success: boolean; verificationId: string; autoApproved: boolean; confidence: number; message: string }> {
  const form = new FormData();
  form.append("nid_number", params.nidNumber);
  form.append("nid_front", params.frontFile);
  form.append("nid_back", params.backFile);

  const { data } = await apiClient.post<{
    success: boolean;
    verification_id: string;
    auto_approved: boolean;
    confidence_score: number;
    message: string;
  }>("/nid/verify", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return {
    success:        data.success,
    verificationId: String(data.verification_id),
    autoApproved:   data.auto_approved,
    confidence:     data.confidence_score ?? 0,
    message:        data.message,
  };
}

export default function NidVerificationForm({ onSuccess, onClose }: NidVerificationFormProps) {
  const [nidNumber, setNidNumber] = useState("");
  const [front, setFront]         = useState<FileSlot>({ file: null, preview: null });
  const [back, setBack]           = useState<FileSlot>({ file: null, preview: null });
  const [status, setStatus]       = useState<VerifyStatus>("idle");
  const [result, setResult]       = useState<{ verificationId: string; autoApproved: boolean; confidence: number; message: string } | null>(null);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef  = useRef<HTMLInputElement>(null);

  const loadPreview = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });

  const handleFileSelect = useCallback(async (side: "front" | "back", file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, [side]: "File must be an image (JPG or PNG)." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [side]: "File must be under 5MB." }));
      return;
    }
    const preview = await loadPreview(file);
    setErrors((prev) => { const n = { ...prev }; delete n[side]; return n; });
    if (side === "front") setFront({ file, preview });
    else setBack({ file, preview });
  }, []);

  const handleDrop = useCallback((side: "front" | "back", e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(side, file);
  }, [handleFileSelect]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!/^[0-9]{10}$|^[0-9]{13}$|^[0-9]{17}$/.test(nidNumber.trim())) {
      errs.nidNumber = "Enter a valid 10, 13, or 17-digit NID number.";
    }
    if (!front.file) errs.front = "Front image is required.";
    if (!back.file)  errs.back  = "Back image is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setStatus("uploading");
    try {
      const res = await submitNidVerification({
        nidNumber: nidNumber.trim(),
        frontFile: front.file!,
        backFile:  back.file!,
      });
      setResult(res);
      setStatus(res.autoApproved ? "verified" : "pending_review");
      if (res.autoApproved) {
        useAuthStore.getState().setNidVerified(true);
        onSuccess?.(res.verificationId);
      }
    } catch {
      setStatus("error");
    }
  };

  // ── Post-submit state ──────────────────────────────────────────────
  if (status === "verified" || status === "pending_review") {
    return (
      <div className="flex flex-col items-center gap-[24px] py-[40px] px-[32px] text-center">
        {status === "verified"
          ? <CheckCircle2 size={40} color="#2e7d32" />
          : <Shield size={40} color="#d4af37" />
        }
        <div>
          <h3
            className="font-['Noto_Serif:Regular',sans-serif] font-normal text-[#1a1c1c] text-[20px] leading-[28px] mb-[8px]"
            style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}
          >
            {status === "verified" ? "Identity Verified" : "Under Review"}
          </h3>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[12px] leading-[20px]">{result?.message}</p>
        </div>
        <div className="bg-[#f9f9f9] border border-[#eee] px-[20px] py-[14px] w-full text-left flex flex-col gap-[8px]">
          {[
            { label: "Verification ID",  value: result?.verificationId ?? "—" },
            { label: "OCR Confidence",   value: result ? `${result.confidence.toFixed(1)}%` : "—" },
            { label: "Auto Approved",    value: result?.autoApproved ? "Yes" : "Pending Manual Review" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="font-['Inter:Regular',sans-serif] font-normal text-[#9e9e9e] text-[9px] tracking-[1px] uppercase">{label}</span>
              <span className="font-['Inter:Regular',sans-serif] font-normal text-[#1a1c1c] text-[10px]">{value}</span>
            </div>
          ))}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="bg-[#1a1c1c] px-[24px] py-[11px] hover:bg-[#2e2b27] transition-colors cursor-pointer"
          >
            <span className="font-['Inter:Regular',sans-serif] font-normal text-white text-[9px] tracking-[2px] uppercase">Close</span>
          </button>
        )}
      </div>
    );
  }

  // ── Upload form ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-[24px] px-[32px] py-[28px]">
      {/* NID Number */}
      <div className="flex flex-col gap-[8px]">
        <label className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[9px] tracking-[2px] uppercase leading-[14px]">
          NID Number
        </label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="10, 13, or 17 digits"
          value={nidNumber}
          onChange={(e) => {
            setNidNumber(e.target.value.replace(/\D/g, ""));
            setErrors((prev) => { const n = { ...prev }; delete n.nidNumber; return n; });
          }}
          maxLength={17}
          className="border border-[#eee] px-[14px] py-[11px] font-['Inter:Regular',sans-serif] font-normal text-[#1a1c1c] text-[13px] outline-none focus:border-[#d4af37] transition-colors"
          style={{ borderColor: errors.nidNumber ? "#dc2626" : undefined }}
        />
        {errors.nidNumber && (
          <span className="font-['Inter:Regular',sans-serif] font-normal text-red-600 text-[10px] leading-[14px]">{errors.nidNumber}</span>
        )}
        <span className="font-['Inter:Regular',sans-serif] font-normal text-[#9e9e9e] text-[9px] leading-[14px]">
          Smart Card: 10 digits · Old laminate: 13 or 17 digits
        </span>
      </div>

      {/* Image upload slots */}
      <div className="grid grid-cols-2 gap-[16px]">
        {(["front", "back"] as const).map((side) => {
          const slot = side === "front" ? front : back;
          const ref  = side === "front" ? frontRef : backRef;
          const label = side === "front" ? "NID Front" : "NID Back";

          return (
            <div key={side} className="flex flex-col gap-[8px]">
              <label className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[9px] tracking-[2px] uppercase leading-[14px]">
                {label}
              </label>
              <div
                onClick={() => ref.current?.click()}
                onDrop={(e) => handleDrop(side, e)}
                onDragOver={(e) => e.preventDefault()}
                className="relative border-2 border-dashed cursor-pointer transition-colors flex flex-col items-center justify-center"
                style={{
                  borderColor: errors[side] ? "#dc2626" : slot.preview ? "#d4af37" : "#e2e2e2",
                  minHeight: 120,
                }}
              >
                {slot.preview ? (
                  <>
                    <img src={slot.preview} alt={label} className="w-full h-[120px] object-cover" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (side === "front") setFront({ file: null, preview: null });
                        else setBack({ file: null, preview: null });
                      }}
                      className="absolute top-[6px] right-[6px] bg-white border border-[#eee] p-[3px] cursor-pointer"
                    >
                      <X size={10} color="#4d4635" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-[8px] py-[20px]">
                    <Camera size={20} color="#9e9e9e" />
                    <span className="font-['Inter:Regular',sans-serif] font-normal text-[#9e9e9e] text-[9px] tracking-[1px] uppercase leading-[14px]">
                      Tap or drag image
                    </span>
                    <span className="font-['Inter:Regular',sans-serif] font-normal text-[#ccc] text-[8px] leading-[12px]">
                      JPG / PNG · max 5MB
                    </span>
                  </div>
                )}
                <input
                  ref={ref}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(side, f);
                  }}
                />
              </div>
              {errors[side] && (
                <span className="font-['Inter:Regular',sans-serif] font-normal text-red-600 text-[10px] leading-[14px]">{errors[side]}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Security notice */}
      <div className="bg-[#f9f9f9] border border-[#eee] px-[14px] py-[10px] flex gap-[10px]">
        <Shield size={13} color="#d4af37" className="shrink-0 mt-[1px]" />
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[10px] leading-[16px]">
          Your NID images are encrypted (AES-256) and stored in a private S3 bucket. They are never shared or used for any purpose other than identity verification.
        </p>
      </div>

      {status === "error" && (
        <div className="flex items-center gap-[8px] bg-red-50 border border-red-200 px-[14px] py-[10px]">
          <AlertCircle size={13} color="#dc2626" />
          <span className="font-['Inter:Regular',sans-serif] font-normal text-red-700 text-[10px] leading-[16px]">
            Submission failed. Please check your connection and try again.
          </span>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={status === "uploading"}
        className="flex items-center justify-center gap-[8px] bg-[#1a1c1c] px-[20px] py-[13px] hover:bg-[#2e2b27] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "uploading"
          ? <Loader size={13} color="#d4af37" className="animate-spin" />
          : <Upload size={13} color="white" />
        }
        <span className="font-['Inter:Regular',sans-serif] font-normal text-white text-[9px] tracking-[2px] uppercase leading-[14px]">
          {status === "uploading" ? "Verifying…" : "Submit for Verification"}
        </span>
      </button>
    </div>
  );
}
