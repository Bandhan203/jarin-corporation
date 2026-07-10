import { Navigate, useLocation } from "react-router";
import { AlertCircle, ShieldOff, Home } from "lucide-react";
import { useAuthStore, type UserRole } from "@/store/authStore";
import NidVerificationBanner from "./NidVerificationBanner";

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

function ForbiddenScreen() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-[64px]">
      <div className="flex flex-col items-center gap-[24px] text-center max-w-[420px]">
        <div className="bg-[#D4AF37] h-px w-[40px]" />
        <ShieldOff size={40} color="#4d4635" />
        <h1 className="font-['Noto_Serif'] font-normal text-[#1A1C1C] text-[24px] leading-[32px]">
          Access Restricted
        </h1>
        <p className="font-['Inter'] font-normal text-[#4d4635] text-[13px] leading-[22px]">
          Your account role does not have permission to access{" "}
          <span className="text-[#1A1C1C] font-medium">{location.pathname}</span>.
        </p>
        <a href="/" className="flex items-center gap-[8px] bg-[#1A1C1C] px-[24px] py-[12px] hover:bg-[#2e2b27] transition-colors">
          <Home size={12} color="white" />
          <span className="font-['Inter'] font-normal text-white text-[9px] tracking-[2px] uppercase">Return to Home</span>
        </a>
        <div className="flex items-center gap-[6px]">
          <AlertCircle size={11} color="#9e9e9e" />
          <span className="font-['Inter'] font-normal text-[#9e9e9e] text-[10px]">Error 403 — Forbidden</span>
        </div>
      </div>
    </div>
  );
}

export default function RoleProtectedRoute({ allowedRoles, children }: RoleProtectedRouteProps) {
  const { isAuthenticated, role, isNidVerified, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <span className="font-['Inter'] text-[11px] tracking-[2px] uppercase text-[#4d4635]">Loading session…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!allowedRoles.includes(role!)) {
    return <ForbiddenScreen />;
  }

  const showNidBanner = role === "investor" && !isNidVerified;

  return (
    <>
      {showNidBanner && <NidVerificationBanner />}
      {children}
    </>
  );
}
