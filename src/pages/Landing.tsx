import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicCms } from "@/services/cmsApi";
import { BUILDING_IMAGES } from "@/assets/buildingImages";
import PublicFooter from "@/components/public/PublicFooter";
import CmsDrivenPage from "@/components/cms/CmsDrivenPage";

function LandingFallback() {
  const navigate = useNavigate();

  const { data: cms } = useQuery({
    queryKey: ["cms"],
    queryFn: fetchPublicCms,
  });

  const heroHeadline = cms?.byKey?.hero_main_headline
    ?? "Bangladesh er Prothom Automated Real Estate Co-operative Platform.";
  const heroTagline = cms?.byKey?.hero_sub_tagline
    ?? "Shorashori jomiyer malikana shoho building er construction cost installment e din, flat kinun market price er ordhek e.";
  const heroCta = cms?.byKey?.hero_cta_label ?? "EXPLORE ACTIVE PROJECT SHARES";

  return (
    <div className="flex flex-col items-start w-full" style={{ background: "linear-gradient(90deg, rgb(249,249,249) 0%, rgb(249,249,249) 100%)" }}>
      <div className="relative w-full">
        <div className="flex flex-col gap-[80px] items-start pb-[64px] px-[64px] pt-[40px]">
          <div className="flex flex-col gap-[24px] items-start max-w-[896px] w-full">
            <div className="bg-[#d4af37] h-px w-[64px]" />
            <div className="font-['Noto_Serif:Regular',sans-serif] font-normal text-[#1a1c1c] text-[48px] tracking-[-0.96px] leading-[52.8px]" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>{heroHeadline}</div>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[16px] leading-[24px] max-w-[672px]">{heroTagline}</p>
            <div className="flex gap-[16px] items-start pt-[24px] flex-wrap">
              <button onClick={() => navigate("/explore")} className="relative flex items-center justify-center px-[32px] py-[17px] bg-[#1a1c1c] hover:bg-[#2e2b27] transition-colors cursor-pointer rounded-none">
                <span className="font-['Inter:Regular',sans-serif] font-normal text-white text-[16px] text-center tracking-[1.6px] uppercase leading-[24px]">{heroCta}</span>
              </button>
              <button onClick={() => navigate("/submit-land")} className="group relative flex items-center justify-center px-[33px] py-[17px] hover:bg-[#1a1c1c]/5 transition-colors cursor-pointer">
                <div aria-hidden className="absolute border border-[#1a1c1c] border-solid inset-0 pointer-events-none" />
                <span className="font-['Inter:Regular',sans-serif] font-normal text-[#1a1c1c] text-[16px] text-center tracking-[1.6px] uppercase leading-[24px]">SUBMIT LAND FOR JOINT VENTURE</span>
              </button>
            </div>
          </div>
          <div className="flex flex-col h-[600px] items-start justify-center overflow-clip relative shadow-[0px_4px_16px_0px_rgba(0,0,0,0.05)] w-full">
            <div aria-hidden className="absolute inset-0 pointer-events-none z-10"><div className="absolute bg-white inset-0 mix-blend-saturation" /></div>
            <img alt="The Mirage Rosetum — Estate Archive" className="absolute h-[104.62%] left-0 max-w-none top-[-2.31%] w-full object-cover" src={BUILDING_IMAGES.hero} />
          </div>
        </div>
      </div>
      <div className="bg-[#f3f3f3] relative w-full">
        <div className="flex flex-col lg:flex-row gap-[32px] items-stretch p-[64px]">
          <button onClick={() => navigate("/explore")} className="bg-white flex-1 text-left overflow-hidden cursor-pointer hover:shadow-[0px_8px_24px_rgba(0,0,0,0.06)] transition-shadow group">
            <div className="h-[200px] overflow-hidden"><img src={BUILDING_IMAGES.parkviewCoOp} alt="Modernizen — Parkview Co-Op" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" /></div>
            <div className="p-[48px]">
            <span className="font-['Inter:Regular',sans-serif] text-[#735c00] text-[10px] tracking-[3px] uppercase">Explore Projects</span>
            <div className="font-['Noto_Serif:Regular',sans-serif] text-[#1a1c1c] text-[24px] leading-[32px] pt-[16px] pb-[12px]" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>Browse Active Ventures</div>
            <p className="font-['Inter:Regular',sans-serif] text-[#4d4635] text-[14px] leading-[20px] pb-[24px]">Compare co-operative projects, funding progress, and reserve land shares at institutional pricing.</p>
            <span className="font-['Inter:Regular',sans-serif] text-[#735c00] text-[12px] tracking-[1.5px] uppercase group-hover:underline">View Portfolio →</span>
            </div>
          </button>
          <button onClick={() => navigate("/how-it-works")} className="bg-[#e2e2e2] flex-1 text-left overflow-hidden cursor-pointer hover:shadow-[0px_8px_24px_rgba(0,0,0,0.06)] transition-shadow group">
            <div className="h-[200px] overflow-hidden"><img src={BUILDING_IMAGES.luminaEstate} alt="The Zurana — Lumina Estate" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" /></div>
            <div className="p-[48px]">
            <span className="font-['Inter:Regular',sans-serif] text-[#735c00] text-[10px] tracking-[3px] uppercase">How It Works</span>
            <div className="font-['Noto_Serif:Regular',sans-serif] text-[#1a1c1c] text-[24px] leading-[32px] pt-[16px] pb-[12px]" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>Understand the Journey</div>
            <p className="font-['Inter:Regular',sans-serif] text-[#4d4635] text-[14px] leading-[20px] pb-[24px]">Learn how land verification, registry assignment, and interest-free installments work on the platform.</p>
            <span className="font-['Inter:Regular',sans-serif] text-[#735c00] text-[12px] tracking-[1.5px] uppercase group-hover:underline">See the Process →</span>
            </div>
          </button>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}

export default function Landing() {
  return <CmsDrivenPage slug="home" fallback={<LandingFallback />} />;
}
