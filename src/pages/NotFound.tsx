import { useNavigate, useRouteError } from "react-router";

export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center px-[64px]">
      <div className="flex flex-col items-center gap-[24px] text-center max-w-[400px]">
        <div className="bg-[#d4af37] h-px w-[40px]" />
        <span
          className="font-['Noto_Serif:Regular',sans-serif] font-normal text-[#d4af37] text-[72px] leading-[80px] tracking-[-2px]"
          style={{ fontVariationSettings: '"CTGR" 100, "wdth" 100' }}
        >
          404
        </span>
        <h1
          className="font-['Noto_Serif:Regular',sans-serif] font-normal text-[#1a1c1c] text-[24px] leading-[32px]"
          style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}
        >
          Page not found
        </h1>
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[13px] leading-[22px]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Navigate back to the main site.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#1a1c1c] flex items-center justify-center px-[28px] py-[13px] hover:bg-[#2e2b27] transition-colors cursor-pointer"
        >
          <span className="font-['Inter:Regular',sans-serif] font-normal text-white text-[10px] tracking-[2px] uppercase leading-[15px]">Return to Home</span>
        </button>
      </div>
    </div>
  );
}

export function RouteErrorBoundary() {
  const error = useRouteError() as { message?: string; status?: number } | null;
  const navigate = useNavigate();

  if ((error as any)?.status === 404) return <NotFound />;

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center px-[64px]">
      <div className="flex flex-col items-center gap-[20px] text-center max-w-[480px]">
        <div className="bg-red-400 h-px w-[40px]" />
        <h1
          className="font-['Noto_Serif:Regular',sans-serif] font-normal text-[#1a1c1c] text-[22px] leading-[30px]"
          style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}
        >
          Something went wrong
        </h1>
        {error?.message && (
          <div className="bg-[#f3f3f3] border border-[#e2e2e2] px-[16px] py-[12px] w-full text-left">
            <span className="font-['Inter:Regular',sans-serif] font-normal text-[#4d4635] text-[11px] leading-[18px] font-mono">{error.message}</span>
          </div>
        )}
        <button
          onClick={() => navigate("/")}
          className="bg-[#1a1c1c] flex items-center justify-center px-[24px] py-[12px] hover:bg-[#2e2b27] transition-colors cursor-pointer"
        >
          <span className="font-['Inter:Regular',sans-serif] font-normal text-white text-[10px] tracking-[2px] uppercase leading-[15px]">Return Home</span>
        </button>
      </div>
    </div>
  );
}
