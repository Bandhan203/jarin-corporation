import { useState } from "react";

export default function CostEstimator() {
  const [area, setArea] = useState(1500);
  const [location, setLocation] = useState<"standard" | "prime">("standard");

  const baseRate = location === "standard" ? 3500 : 4500;
  const totalCost = area * baseRate;
  const downPayment = totalCost * 0.15;
  const monthly = (totalCost - downPayment) / 48;

  function fmt(n: number) { return (n / 100000).toFixed(2) + " LAKH"; }

  return (
    <div className="bg-white relative w-full">
      <div className="flex flex-col items-start px-[64px] md:px-[192px] py-[64px]">
        <div className="max-w-[896px] relative w-full mx-auto">
          <div aria-hidden className="absolute border border-[#d0c5af] border-solid inset-0 pointer-events-none" />
          <div className="absolute bg-[#735c00] left-[-15px] size-[32px] top-[-15px]" />
          <div className="flex flex-col gap-[48px] items-start max-w-[inherit] p-[65px]">
            <div className="w-full text-center">
              <span className="font-['Noto_Serif:Display_Regular',sans-serif] font-normal text-[#1a1c1c] text-[16px] text-center leading-[24px]" style={{ fontVariationSettings: '"CTGR" 100, "wdth" 100' }}>Institutional Grade Cost Estimator</span>
            </div>
            <div className="flex flex-col lg:flex-row gap-[64px] items-start justify-center w-full">
              <div className="flex flex-1 flex-col gap-[48px] items-start min-w-px pb-[53px] w-full">
                <div className="flex flex-col gap-[14px] items-start w-full">
                  <span className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[16px] tracking-[1.6px] uppercase leading-[24px]">PREFERRED AREA (SFT)</span>
                  <input type="range" min={500} max={3000} step={50} value={area} onChange={(e) => setArea(Number(e.target.value))} className="w-full cursor-pointer" style={{ accentColor: "#d4af37" }} />
                  <div className="flex h-[24px] items-start justify-between w-full">
                    <span className="font-['Inter:Regular',sans-serif] font-normal text-[#735c00] text-[16px] leading-[24px]">{area.toLocaleString()} SFT</span>
                    <span className="font-['Inter:Regular',sans-serif] font-normal text-[#735c00] text-[16px] leading-[24px]">3,000 SFT</span>
                  </div>
                </div>
                <div className="flex flex-col gap-[24px] items-start w-full">
                  <span className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[16px] tracking-[1.6px] uppercase leading-[24px]">LOCATION PREMIUM</span>
                  <div className="flex gap-[16px] items-start flex-wrap">
                    {(["standard", "prime"] as const).map((loc) => (
                      <button key={loc} onClick={() => setLocation(loc)} className="relative flex flex-col items-center justify-center px-[32px] py-[9px] cursor-pointer transition-colors" style={{ background: location === loc ? "rgba(115,92,0,0.06)" : "transparent" }}>
                        <div aria-hidden className="absolute border border-solid inset-0 pointer-events-none" style={{ borderColor: location === loc ? "#735c00" : "#7f7663" }} />
                        <span className="font-['Inter:Regular',sans-serif] font-normal text-[10px] text-center uppercase leading-[15px]" style={{ color: location === loc ? "#735c00" : "#1a1c1c" }}>
                          {loc === "standard" ? "STANDARD (DIABARI)" : "PRIME (UTTARA)"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-[#f3f3f3] flex-1 min-w-px relative w-full">
                <div className="flex flex-col justify-center p-[32px] h-full">
                  <div className="flex flex-col items-start pb-[32px] w-full">
                    <span className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[16px] uppercase leading-[24px]">ESTIMATED DOWN-PAYMENT</span>
                    <span className="font-['Noto_Serif:Regular',sans-serif] font-normal text-[#1a1c1c] text-[30px] leading-[36px]" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>{fmt(downPayment)}</span>
                  </div>
                  <div className="flex flex-col items-start pb-[32px] w-full">
                    <span className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[16px] uppercase leading-[24px]">MONTHLY INSTALLMENT</span>
                    <span className="font-['Noto_Serif:Regular',sans-serif] font-normal text-[#735c00] text-[30px] leading-[36px]" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>{Math.round(monthly).toLocaleString()} BDT</span>
                  </div>
                  <div className="flex flex-col items-start opacity-50 w-full">
                    <span className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[10px] tracking-[-0.5px] uppercase leading-[15px]">ESTIMATED BASED ON CURRENT CONSTRUCTION MATERIAL<br />INDEX. 48-MONTH TENOR.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
