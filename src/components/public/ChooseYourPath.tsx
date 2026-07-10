import { useNavigate } from "react-router";
import CheckIcon from "./CheckIcon";

export default function ChooseYourPath() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f3f3f3] relative w-full">
      <div className="flex flex-col items-start p-[64px]">
        <div className="flex flex-col lg:flex-row h-auto items-stretch justify-center w-full">
          <div className="bg-white flex-1 min-w-px relative self-stretch">
            <div className="flex flex-col gap-[16px] items-start p-[48px] h-full">
              <div className="font-['Noto_Serif:Regular',sans-serif] font-normal text-[#1a1c1c] text-[16px] leading-[24px] pt-[8px]" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>For Investors</div>
              <div className="bg-[#d4af37] h-px w-[64px]" />
              <div className="flex flex-col gap-[16px] items-start pt-[8px] w-full">
                {["Land Share = Guaranteed Flat", "48 Months Interest-Free Installments", "50% Below Market Rate Pricing"].map((item) => (
                  <div key={item} className="flex gap-[12px] items-center w-full">
                    <CheckIcon />
                    <span className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[16px] leading-[24px]">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-[24px]">
                <button onClick={() => navigate("/explore")} className="group flex items-center gap-[6px] font-['Inter:Regular',sans-serif] font-normal text-[#735c00] text-[14px] tracking-[0.5px] uppercase leading-[20px] hover:gap-[10px] transition-all cursor-pointer">
                  Browse Active Shares <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>
          </div>
          <div className="bg-[#e2e2e2] flex-1 min-w-px relative self-stretch">
            <div className="flex flex-col gap-[16px] items-start p-[48px] h-full">
              <div className="font-['Noto_Serif:Regular',sans-serif] font-normal text-[#1a1c1c] text-[16px] leading-[24px] pt-[8px]" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>For Landowners</div>
              <div className="bg-[#d4af37] h-px w-[64px]" />
              <div className="flex flex-col gap-[16px] items-start pt-[8px] w-full">
                {["Turn land into premium flats", "Zero construction capital required", "Automated revenue sharing"].map((item) => (
                  <div key={item} className="flex gap-[12px] items-center w-full">
                    <CheckIcon />
                    <span className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[16px] leading-[24px]">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-[24px]">
                <button onClick={() => navigate("/submit-land")} className="group flex items-center gap-[6px] font-['Inter:Regular',sans-serif] font-normal text-[#735c00] text-[14px] tracking-[0.5px] uppercase leading-[20px] hover:gap-[10px] transition-all cursor-pointer">
                  Submit Land Portfolio <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
