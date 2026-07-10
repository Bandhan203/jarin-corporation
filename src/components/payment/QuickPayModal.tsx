import { useState } from "react";
import { useNavigate } from "react-router";
import { X, CheckCircle, CreditCard, Smartphone } from "lucide-react";
import { initiatePayment } from "@/services/bookingApi";

type PayMethod = "bkash" | "nagad" | "bank" | null;

interface QuickPayModalProps {
  open: boolean;
  onClose: () => void;
  invoiceNumber: string;
  amountBdt: number;
  label?: string;
}

export default function QuickPayModal({ open, onClose, invoiceNumber, amountBdt, label }: QuickPayModalProps) {
  const navigate = useNavigate();
  const [payMethod, setPayMethod] = useState<PayMethod>(null);
  const [payStep, setPayStep] = useState<"method" | "form" | "done">("method");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  function fmt(n: number) {
    return "৳ " + n.toLocaleString("en-BD");
  }

  async function handleConfirm() {
    if (!payMethod) return;
    setLoading(true);
    try {
      const res = await initiatePayment(invoiceNumber, payMethod);
      setPayStep("done");
      setTimeout(() => {
        onClose();
        navigate(res.redirectUrl);
      }, 1200);
    } catch {
      setPayStep("done");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white w-[380px] h-full shadow-[-4px_0_24px_rgba(0,0,0,0.08)] flex flex-col rounded-none">
        <div className="flex items-center justify-between px-[28px] py-[24px] border-b border-[#eee]">
          <div>
            <div className="bg-[#D4AF37] h-px w-[24px] mb-[8px]" />
            <h3 className="font-['Noto_Serif'] font-normal text-[#1A1C1C] text-[18px] leading-[24px]">Quick Payment</h3>
          </div>
          <button onClick={onClose} className="p-[4px] hover:bg-[#FAFAFA] transition-colors cursor-pointer rounded-none">
            <X size={16} color="#4d4635" />
          </button>
        </div>

        {payStep === "method" && (
          <div className="flex-1 px-[28px] py-[28px] flex flex-col gap-[16px]">
            <div className="border border-[#D4AF37] bg-[#D4AF37]/5 px-[16px] py-[12px] flex flex-col gap-[4px] rounded-none">
              <span className="font-['Inter'] text-[#4d4635] text-[9px] tracking-[2px] uppercase">Amount Due</span>
              <span className="font-['Noto_Serif'] text-[#735c00] text-[22px] leading-[28px]">{fmt(amountBdt)}</span>
              {label && <span className="font-['Inter'] text-[#4d4635] text-[9px] tracking-[1px] uppercase">{label}</span>}
            </div>

            <span className="font-['Inter'] text-[#4d4635] text-[10px] tracking-[2px] uppercase mt-[8px]">Select Payment Method</span>

            {([
              { id: "bkash" as PayMethod, label: "bKash", sub: "Mobile Banking", color: "#e2136e" },
              { id: "nagad" as PayMethod, label: "Nagad", sub: "Mobile Banking", color: "#f37021" },
              { id: "bank" as PayMethod, label: "Electronic Bank Wire", sub: "BEFTN / RTGS", color: "#1A1C1C" },
            ]).map(({ id, label: mLabel, sub, color }) => (
              <button
                key={id}
                onClick={() => setPayMethod(id)}
                className="flex items-center gap-[16px] px-[16px] py-[14px] border transition-all cursor-pointer text-left rounded-none"
                style={{ borderColor: payMethod === id ? "#D4AF37" : "#eee", background: payMethod === id ? "rgba(212,175,55,0.04)" : "white" }}
              >
                <div className="w-[32px] h-[32px] flex items-center justify-center shrink-0 rounded-none" style={{ background: color }}>
                  <Smartphone size={14} color="white" />
                </div>
                <div>
                  <span className="font-['Inter'] text-[#1A1C1C] text-[12px] block">{mLabel}</span>
                  <span className="font-['Inter'] text-[#9e9e9e] text-[10px]">{sub}</span>
                </div>
              </button>
            ))}

            <button
              disabled={!payMethod}
              onClick={() => setPayStep("form")}
              className="mt-auto py-[14px] flex items-center justify-center transition-colors cursor-pointer rounded-none disabled:opacity-40"
              style={{ background: payMethod ? "#1A1C1C" : "#e2e2e2", color: "white" }}
            >
              <span className="font-['Inter'] text-[10px] tracking-[2px] uppercase">Proceed to Payment</span>
            </button>
          </div>
        )}

        {payStep === "form" && (
          <div className="flex-1 px-[28px] py-[28px] flex flex-col gap-[16px]">
            <span className="font-['Inter'] text-[#4d4635] text-[10px] tracking-[2px] uppercase">
              {payMethod === "bkash" ? "bKash Details" : payMethod === "nagad" ? "Nagad Details" : "Bank Wire Details"}
            </span>
            {payMethod !== "bank" ? (
              <>
                <input placeholder="017XXXXXXXX" className="w-full border border-[#e2e2e2] px-[14px] py-[10px] font-['Inter'] text-[13px] outline-none focus:border-[#D4AF37] rounded-none" />
                <input type="password" placeholder="PIN" className="w-full border border-[#e2e2e2] px-[14px] py-[10px] font-['Inter'] text-[13px] outline-none focus:border-[#D4AF37] rounded-none" />
              </>
            ) : (
              <div className="bg-[#FAFAFA] px-[16px] py-[14px] border border-[#eee] rounded-none text-[10px] font-['Inter'] text-[#4d4635]">
                Account: Estate Archive Ltd. · 1030112345678 · Dutch-Bangla Bank
              </div>
            )}
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="mt-auto py-[14px] bg-[#1A1C1C] text-white font-['Inter'] text-[10px] tracking-[2px] uppercase hover:bg-[#2e2b27] cursor-pointer rounded-none disabled:opacity-50"
            >
              {loading ? "Processing…" : "Confirm Payment"}
            </button>
          </div>
        )}

        {payStep === "done" && (
          <div className="flex-1 px-[28px] py-[28px] flex flex-col items-center justify-center gap-[16px] text-center">
            <div className="w-[48px] h-[48px] bg-[#D4AF37] flex items-center justify-center rounded-none">
              <CheckCircle size={24} color="white" />
            </div>
            <h3 className="font-['Noto_Serif'] text-[#1A1C1C] text-[20px]">Payment Initiated</h3>
            <p className="font-['Inter'] text-[#4d4635] text-[12px]">Redirecting to receipt…</p>
          </div>
        )}
      </div>
    </div>
  );
}
