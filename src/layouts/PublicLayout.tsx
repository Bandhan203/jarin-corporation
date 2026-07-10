import { Outlet, Link, useNavigate } from "react-router";

export default function PublicLayout() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-start relative w-full min-h-screen bg-[#f9f9f9]">
      {/* Top Nav */}
      <nav className="fixed backdrop-blur-[6px] bg-[rgba(249,249,249,0.92)] flex items-center justify-between left-0 right-0 px-[64px] py-[24px] top-0 z-50 border-b border-[#eee]">
        <div className="flex gap-[32px] items-center">
          <Link to="/" className="no-underline">
            <span className="font-['Noto_Serif:Display_Regular',sans-serif] font-normal text-[#735c00] text-[22px] tracking-[-1px] uppercase leading-[28px]" style={{ fontVariationSettings: '"CTGR" 100, "wdth" 100' }}>
              ESTATE ARCHIVE
            </span>
          </Link>
          <div className="flex gap-[28px] items-center">
            {[
              { label: "EXPLORE PROJECTS", to: "/explore" },
              { label: "SUBMIT LAND", to: "/submit-land" },
              { label: "HOW IT WORKS", to: "/how-it-works" },
            ].map((l) => (
              <Link key={l.label} to={l.to} className="no-underline font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[10px] tracking-[2px] uppercase leading-[15px] hover:text-[#735c00] transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex gap-[12px] items-center">
          <button onClick={() => navigate("/login")} className="relative flex items-center justify-center px-[20px] py-[9px] cursor-pointer hover:bg-[#d4af37]/10 transition-colors">
            <div aria-hidden className="absolute border border-[#d4af37] border-solid inset-0 pointer-events-none" />
            <span className="font-['Inter:Regular',sans-serif] font-normal text-[#735c00] text-[10px] tracking-[1.5px] uppercase leading-[15px]">SIGN IN</span>
          </button>
          <button onClick={() => navigate("/login?redirect=/portal/landowner")} className="relative flex items-center justify-center px-[20px] py-[9px] cursor-pointer hover:bg-[#1a1c1c]/5 transition-colors">
            <div aria-hidden className="absolute border border-[#1a1c1c] border-solid inset-0 pointer-events-none" />
            <span className="font-['Inter:Regular',sans-serif] font-normal text-[#1a1c1c] text-[10px] tracking-[1.5px] uppercase leading-[15px]">LANDOWNER PORTAL</span>
          </button>
        </div>
      </nav>
      <div className="w-full pt-[72px]">
        <Outlet />
      </div>
    </div>
  );
}
