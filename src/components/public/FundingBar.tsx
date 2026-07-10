export default function FundingBar({ percent, label, remaining }: { percent: number; label: string; remaining: string }) {
  return (
    <div className="flex flex-col gap-[8px] w-full">
      <div className="relative bg-[#e8e8e8] h-[4px] w-full rounded-full overflow-visible">
        <div className="absolute left-0 top-0 h-full bg-[#d4af37] rounded-full" style={{ width: `${percent}%` }} />
        <div className="absolute top-1/2 -translate-y-1/2 size-[10px] rounded-full bg-[#d4af37] border-2 border-white shadow-[0_0_0_1px_#d4af37]" style={{ left: `calc(${percent}% - 5px)` }} />
      </div>
      <div className="flex items-start justify-between">
        <span className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[10px] tracking-[0.5px] uppercase leading-[15px]">{label}</span>
        <span className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[10px] tracking-[0.5px] uppercase leading-[15px]">{remaining}</span>
      </div>
    </div>
  );
}
