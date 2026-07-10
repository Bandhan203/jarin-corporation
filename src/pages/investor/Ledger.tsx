import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, AlertTriangle, CreditCard } from "lucide-react";
import { fetchInvestorLedger } from "@/services/ledgerApi";
import QuickPayModal from "@/components/payment/QuickPayModal";

export default function InvestorLedger() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["investor-ledger"],
    queryFn:  fetchInvestorLedger,
  });

  const ledgerRows = data?.rows ?? [];
  const summary    = data?.summary;
  const [showPay, setShowPay] = useState(false);

  const payTarget = useMemo(() => {
    return ledgerRows.find((r) => r.status === "overdue")
      ?? ledgerRows.find((r) => r.status === "upcoming");
  }, [ledgerRows]);

  const headerMeta = useMemo(() => {
    const row = ledgerRows[0];
    if (!row?.projectName) return "Installment Ledger";
    return `${row.projectName}${row.unitNumber ? ` · Unit ${row.unitNumber}` : ""} · 48-Month Installment Plan`;
  }, [ledgerRows]);

  function fmt(n: number) {
    return n.toLocaleString("en-BD") + " ৳";
  }

  function StatusBadge({ status }: { status: string }) {
    if (status === "paid") return (
      <span className="flex items-center gap-[5px] bg-[#1a1c1c] px-[10px] py-[3px] rounded-none">
        <CheckCircle size={9} color="#d4af37" />
        <span className="font-['Inter'] font-normal text-white text-[8px] tracking-[1.5px] uppercase leading-[12px]">Paid</span>
      </span>
    );
    if (status === "overdue") return (
      <span className="flex items-center gap-[5px] border border-red-400 px-[10px] py-[3px] rounded-none">
        <AlertTriangle size={9} color="#dc2626" />
        <span className="font-['Inter'] font-normal text-red-600 text-[8px] tracking-[1.5px] uppercase leading-[12px]">Overdue</span>
      </span>
    );
    return (
      <span className="flex items-center gap-[5px] border border-[#d0c5af] px-[10px] py-[3px] rounded-none">
        <span className="font-['Inter'] font-normal text-[#9e9e9e] text-[8px] tracking-[1.5px] uppercase leading-[12px]">Upcoming</span>
      </span>
    );
  }

  return (
    <div className="p-[40px] min-h-full relative bg-[#FAFAFA]">
      <div className="mb-[32px] flex items-end justify-between">
        <div>
          <div className="bg-[#d4af37] h-px w-[40px] mb-[12px]" />
          <h1 className="font-['Noto_Serif'] font-normal text-[#1a1c1c] text-[28px] leading-[36px]">
            Accounts & Ledger
          </h1>
          <p className="font-['Inter'] font-normal text-[#4d4635] text-[13px] leading-[20px] mt-[4px]">
            {headerMeta}
          </p>
        </div>
        <button
          onClick={() => setShowPay(true)}
          disabled={!payTarget}
          className="bg-[#1a1c1c] flex items-center gap-[10px] px-[20px] py-[12px] hover:bg-[#2e2b27] transition-colors cursor-pointer rounded-none disabled:opacity-40"
        >
          <CreditCard size={12} color="#d4af37" />
          <span className="font-['Inter'] font-normal text-white text-[10px] tracking-[2px] uppercase leading-[15px]">QUICK PAY</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-[16px] mb-[32px]">
        {[
          { label: "Total Paid", value: fmt(summary?.totalPaid ?? 0), accent: "#4d4635" },
          { label: "Outstanding Balance", value: fmt(summary?.outstandingBalance ?? 0), accent: "#d4af37" },
          { label: "Installments Complete", value: summary?.installmentsComplete ?? "—", accent: "#1a1c1c" },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-white border border-[#eee] px-[20px] py-[16px] flex flex-col gap-[4px] relative overflow-hidden rounded-none">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: accent }} />
            <span className="font-['Inter'] font-normal text-[#9e9e9e] text-[9px] tracking-[2px] uppercase leading-[14px]">{label}</span>
            <span className="font-['Noto_Serif'] font-normal text-[#1a1c1c] text-[20px] leading-[28px]">{value}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#eee] rounded-none">
        <div className="grid grid-cols-[auto_140px_1fr_140px_120px] gap-0 border-b border-[#eee] px-[24px] py-[12px]">
          {["Invoice ID", "Due Date", "Description", "Amount BDT", "Status"].map((h) => (
            <span key={h} className="font-['Inter'] font-normal text-[#9e9e9e] text-[9px] tracking-[2px] uppercase leading-[14px]">{h}</span>
          ))}
        </div>
        {isLoading && (
          <div className="px-[24px] py-[32px] font-['Inter'] text-[12px] text-[#4d4635]">Loading ledger…</div>
        )}
        {isError && (
          <div className="px-[24px] py-[32px] font-['Inter'] text-[12px] text-red-600">Failed to load ledger data.</div>
        )}
        {!isLoading && ledgerRows.map((row, i) => (
          <div
            key={row.id}
            className={`grid grid-cols-[auto_140px_1fr_140px_120px] gap-0 px-[24px] py-[16px] items-center transition-colors hover:bg-[#f9f9f9] rounded-none ${i < ledgerRows.length - 1 ? "border-b border-[#f3f3f3]" : ""} ${row.status === "overdue" ? "bg-red-50/30" : ""}`}
          >
            <span className="font-['Inter'] font-normal text-[#735c00] text-[10px] tracking-[0.5px] leading-[16px] pr-[16px]">{row.id}</span>
            <span className="font-['Inter'] font-normal text-[#4d4635] text-[11px] leading-[16px]">{row.date}</span>
            <span className="font-['Inter'] font-normal text-[#1a1c1c] text-[12px] leading-[18px]">{row.description}</span>
            <span className="font-['Noto_Serif'] font-normal text-[#1a1c1c] text-[13px] leading-[18px]">{fmt(row.amount)}</span>
            <div className="flex">
              <StatusBadge status={row.status} />
            </div>
          </div>
        ))}
      </div>

      {payTarget && (
        <QuickPayModal
          open={showPay}
          onClose={() => setShowPay(false)}
          invoiceNumber={payTarget.id}
          amountBdt={payTarget.amount}
          label={`${payTarget.description} · ${payTarget.status === "overdue" ? "Overdue" : "Due"}`}
        />
      )}
    </div>
  );
}
