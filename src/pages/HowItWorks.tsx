import { useNavigate } from "react-router";
import svgPaths from "@/imports/Html→Body/svg-9svfev3e07";
import ChooseYourPath from "@/components/public/ChooseYourPath";
import PublicFooter from "@/components/public/PublicFooter";
import CmsDrivenPage from "@/components/cms/CmsDrivenPage";

const STEPS = [
  { num: "1", title: "Select & Verify", desc: "Browse vetted land opportunities and legal documentation directly on the platform.", detail: "Every project is pre-screened for RAJUK compliance, title clarity, and co-operative structure before listing." },
  { num: "2", title: "Lock Land Share", desc: "Secure your physical land registry share with an initial booking amount.", detail: "Your booking reserves a proportional land share and unlocks the installment schedule for construction costs." },
  { num: "3", title: "Registry Assignment", desc: "Direct legal deed transfer to your name as a part-owner of the property.", detail: "Ownership is recorded through formal registry assignment — not a paper promise, but a legal land share." },
  { num: "4", title: "Smart Installments", desc: "Automated construction cost distribution over 48 interest-free months.", detail: "Escrow-managed disbursements release funds to contractors only when milestone verification is complete." },
];

const TRUST_PILLARS = [
  { title: "Escrow Protection", desc: "Investor capital is held in segregated escrow accounts until verified construction milestones are met." },
  { title: "Legal Transparency", desc: "Title deeds, survey maps, and co-operative agreements are available for review before commitment." },
  { title: "Automated Compliance", desc: "Installment schedules, default handling, and revenue distribution run through the platform ledger." },
];

function HowItWorksFallback() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-start w-full bg-[#f9f9f9]">
      <div className="relative w-full bg-white border-b border-[#eee]">
        <div className="flex flex-col gap-[24px] items-start p-[64px]">
          <span className="font-['Inter'] text-[#735c00] text-[10px] tracking-[3px] uppercase">PROCESS ARCHITECTURE</span>
          <div className="font-['Noto_Serif'] text-[#1a1c1c] text-[40px] tracking-[-0.8px] leading-[44px] max-w-[720px]">How the Co-operative Platform Works</div>
          <p className="font-['Inter'] text-[#4d4635] text-[16px] max-w-[640px]">From land verification to registry assignment and interest-free installments — every step is designed for radical transparency and automated governance.</p>
        </div>
      </div>
      <div className="relative w-full bg-white">
        <div className="flex flex-col gap-[64px] items-start p-[64px]">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[32px] w-full">
            {STEPS.map(({ num, title, desc, detail }) => (
              <div key={num} className="bg-[#f9f9f9] drop-shadow-[0px_4px_8px_rgba(0,0,0,0.05)] relative">
                <div className="flex flex-col gap-[16px] items-center pb-[32px] pt-[48px] px-[32px]">
                  <div className="-translate-x-1/2 absolute bg-[#735c00] flex items-center justify-center left-1/2 size-[32px] top-[-16px]"><span className="font-['Inter'] font-bold text-white text-[16px]">{num}</span></div>
                  <span className="font-['Noto_Serif'] text-[#1a1c1c] text-[16px] text-center">{title}</span>
                  <span className="font-['Inter'] text-[#4d4635] text-[14px] text-center">{desc}</span>
                  <span className="font-['Inter'] text-[#735c00] text-[12px] text-center opacity-80">{detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ChooseYourPath />
      <div className="relative w-full">
        <div className="flex flex-col gap-[48px] items-start p-[64px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[32px] w-full">
            {TRUST_PILLARS.map(({ title, desc }) => (
              <div key={title} className="bg-white p-[32px] flex flex-col gap-[12px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.05)]">
                <div className="h-[22px] w-[30px]"><svg className="block w-full h-full" fill="none" viewBox="0 0 30.4614 22.0383"><path d={svgPaths.p2af9b080} fill="#735C00" /></svg></div>
                <span className="font-['Noto_Serif'] text-[#1a1c1c] text-[16px]">{title}</span>
                <span className="font-['Inter'] text-[#4d4635] text-[14px]">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-[#1a1c1c] relative w-full">
        <div className="flex flex-col md:flex-row gap-[32px] items-center justify-between p-[64px]">
          <div className="flex flex-col gap-[12px]">
            <span className="font-['Noto_Serif'] text-white text-[24px]">Ready to begin?</span>
            <span className="font-['Inter'] text-[#d0c5af] text-[14px] max-w-[480px]">Explore open ventures or submit your land for a joint-venture partnership.</span>
          </div>
          <div className="flex gap-[16px] flex-wrap">
            <button onClick={() => navigate("/explore")} className="px-[32px] py-[17px] bg-[#d4af37] hover:bg-[#c4a030] transition-colors cursor-pointer"><span className="font-['Inter'] text-[#1a1c1c] text-[14px] tracking-[1.4px] uppercase">Explore Projects</span></button>
            <button onClick={() => navigate("/submit-land")} className="relative px-[32px] py-[17px] cursor-pointer hover:bg-white/5 transition-colors"><div aria-hidden className="absolute border border-white/40 border-solid inset-0 pointer-events-none" /><span className="font-['Inter'] text-white text-[14px] tracking-[1.4px] uppercase">Submit Land</span></button>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}

export default function HowItWorks() {
  return <CmsDrivenPage slug="how-it-works" fallback={<HowItWorksFallback />} />;
}
