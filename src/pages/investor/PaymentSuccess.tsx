import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { CheckCircle, Download, Printer, ArrowLeft, Building2, Receipt } from "lucide-react";
import { Link } from "react-router";
import { fetchInvoiceDetail } from "@/services/ledgerApi";

function fmt(n: number) {
  return "৳ " + n.toLocaleString("en-IN");
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const invoiceNumber = searchParams.get("invoice") ?? "INV-2024-007";
  const [printed, setPrinted] = useState(false);

  const { data: inv, isLoading, isError } = useQuery({
    queryKey: ["invoice-detail", invoiceNumber],
    queryFn:  () => fetchInvoiceDetail(invoiceNumber),
    enabled:  Boolean(invoiceNumber),
  });

  useEffect(() => {
    if (!inv || isLoading || isError) return;
    const duration = 2000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: ["#D4AF37", "#1A1C1C", "#FAFAFA"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: ["#D4AF37", "#1A1C1C", "#FAFAFA"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [inv, isLoading, isError]);

  function handlePrint() {
    setPrinted(true);
    setTimeout(() => window.print(), 120);
  }

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-[#FAFAFA]">
        <span className="font-['Inter'] text-[11px] tracking-[2px] uppercase text-[#4d4635]">Loading receipt…</span>
      </div>
    );
  }

  if (isError || !inv) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-[12px] bg-[#FAFAFA]">
        <span className="font-['Inter'] text-[13px] text-[#4d4635]">Receipt not found.</span>
        <Link to="/portal/investor/ledger" className="font-['Inter'] text-[10px] tracking-[2px] uppercase text-[#735c00]">← Back to ledger</Link>
      </div>
    );
  }

  const totalInstallments = 48;
  const progress = Math.round((inv.installment / totalInstallments) * 100);

  return (
    <div className="p-[40px] min-h-full bg-[#FAFAFA] print:p-0 print:bg-white">
      <div className="max-w-[720px] mx-auto">
        <Link to="/portal/investor/ledger" className="inline-flex items-center gap-[8px] text-text-secondary hover:text-warm-brown transition-colors mb-[32px] print:hidden">
          <ArrowLeft size={14} />
          <span className="font-['Inter'] font-medium text-[10px] tracking-[2px] uppercase">Back to Ledger</span>
        </Link>

        <motion.div
          className="bg-white border border-neutral-200 relative overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.05)]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#D4AF37]" />

          <div className="p-[48px] flex flex-col gap-[32px]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-[10px] mb-[12px]">
                  <CheckCircle size={20} color="#2e7d32" />
                  <span className="font-['Inter'] font-medium text-[#2e7d32] text-[10px] tracking-[2px] uppercase">Payment Confirmed</span>
                </div>
                <h1 className="font-['Noto_Serif'] font-semibold text-[#1A1C1C] text-[24px] leading-[32px]">Installment Receipt</h1>
                <p className="font-['Inter'] text-[#4d4635] text-[13px] mt-[4px]">{inv.invoiceNumber}</p>
              </div>
              <Receipt size={32} color="#D4AF37" className="opacity-40" />
            </div>

            <div className="grid grid-cols-2 gap-[16px]">
              {[
                { label: "Project", value: inv.projectName },
                { label: "Location", value: inv.projectLocation },
                { label: "Investor", value: inv.investorName },
                { label: "Gateway", value: inv.gateway ?? "—" },
                { label: "Transaction ID", value: inv.transactionId ?? "—" },
                { label: "Payment Date", value: inv.paymentDate ?? inv.dueDate },
              ].map(({ label, value }) => (
                <div key={label} className="border border-neutral-100 px-[16px] py-[12px]">
                  <span className="font-['Inter'] font-medium text-[#9e9e9e] text-[9px] tracking-[2px] uppercase block mb-[4px]">{label}</span>
                  <span className="font-['Inter'] font-medium text-[#1A1C1C] text-[12px]">{value}</span>
                </div>
              ))}
            </div>

            <div className="bg-[#1A1C1C] p-[24px] flex flex-col gap-[16px]">
              <span className="font-['Inter'] font-medium text-white/50 text-[9px] tracking-[2px] uppercase">88 / 12 Escrow Split</span>
              <div className="flex items-end justify-between">
                <div>
                  <span className="font-['Inter'] text-white/60 text-[10px] uppercase tracking-[1px]">Total Paid</span>
                  <div className="font-['Noto_Serif'] font-bold text-[#D4AF37] text-[28px]">{fmt(inv.amountTotal)}</div>
                </div>
                <div className="text-right">
                  <div className="font-['Inter'] text-white/70 text-[11px]">Escrow 88%: {fmt(inv.amountEscrow)}</div>
                  <div className="font-['Inter'] text-white/70 text-[11px]">Mgmt Fee 12%: {fmt(inv.amountFee)}</div>
                </div>
              </div>
              <div className="bg-white/10 h-[4px] w-full">
                <div className="bg-[#D4AF37] h-full" style={{ width: `${progress}%` }} />
              </div>
              <span className="font-['Inter'] text-white/50 text-[10px]">Installment {inv.installment} of {totalInstallments} · {progress}% complete</span>
            </div>

            <div className="flex gap-[12px] print:hidden">
              <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-[8px] bg-[#1A1C1C] py-[12px] hover:bg-[#2e2b27] transition-colors cursor-pointer">
                <Printer size={12} color="#D4AF37" />
                <span className="font-['Inter'] text-white text-[10px] tracking-[2px] uppercase">{printed ? "Printing…" : "Print Receipt"}</span>
              </button>
              <button className="flex items-center justify-center gap-[8px] border border-neutral-200 px-[20px] py-[12px] hover:border-[#D4AF37] transition-colors cursor-pointer">
                <Download size={12} color="#4d4635" />
                <span className="font-['Inter'] text-[#4d4635] text-[10px] tracking-[2px] uppercase">Download</span>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="mt-[24px] flex items-center gap-[8px] text-[#4d4635] print:hidden">
          <Building2 size={12} />
          <span className="font-['Inter'] text-[10px] tracking-[1px]">Estate Archive · Cooperative Real Estate Platform</span>
        </div>
      </div>
    </div>
  );
}
