export default function PublicFooter() {
  return (
    <div className="bg-white relative w-full">
      <div className="flex flex-col gap-[48px] items-start px-[64px] py-[80px]">
        <div className="flex items-center justify-between pb-[49px] relative w-full">
          <div aria-hidden className="absolute border-[#eee] border-b border-solid inset-0 pointer-events-none" />
          <div className="flex flex-col gap-[16px] items-start">
            <span className="font-['Inter:Italic',sans-serif] font-normal italic text-[#1a1c1c] text-[24px] leading-[32px]">ESTATE ARCHIVE</span>
            <span className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[14px] leading-[20px] max-w-[320px]">Re-imagining ownership through collective architectural integrity and radical transparency.</span>
          </div>
          <div className="flex gap-[48px] items-start">
            {[{ title: "LEGAL", links: ["PRIVACY", "ADVISORY"] }, { title: "COMPANY", links: ["CAREERS", "CONTACT"] }].map((col) => (
              <div key={col.title} className="flex flex-col gap-[8px] items-start">
                <span className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[10px] tracking-[1px] uppercase leading-[15px]">{col.title}</span>
                {col.links.map((l) => <span key={l} className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[10px] tracking-[2px] uppercase leading-[15px] cursor-pointer hover:text-[#735c00] transition-colors">{l}</span>)}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between w-full">
          <span className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[10px] tracking-[2px] uppercase leading-[15px]">© 2024 ESTATE ARCHIVE. ALL RIGHTS RESERVED.</span>
          <div className="flex gap-[32px] items-start opacity-40">
            {["RAJUK CERTIFIED", "LEGAL SECURED"].map((badge) => (
              <div key={badge} className="relative">
                <div aria-hidden className="absolute border border-[#4d4635] border-solid inset-0 pointer-events-none" />
                <div className="flex flex-col items-start px-[9px] py-[5px]">
                  <span className="font-['Inter:Regular',sans-serif] font-normal text-[#1a1c1c] text-[10px] uppercase leading-[15px]">{badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
