import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { portalPathForRole, useAuthStore } from "@/store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginAction = useAuthStore((s) => s.loginAction);
  const isLoading   = useAuthStore((s) => s.isLoading);
  const error       = useAuthStore((s) => s.error);
  const clearError  = useAuthStore((s) => s.clearError);

  const [email, setEmail]       = useState("rafiqul@example.com");
  const [password, setPassword] = useState("password");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    try {
      await loginAction({ email, password });
      const role = useAuthStore.getState().role!;
      const redirect = searchParams.get("redirect");
      navigate(redirect ?? portalPathForRole(role), { replace: true });
    } catch {
      // error stored in auth store
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-[32px]">
      <div className="w-full max-w-[440px] bg-white border border-neutral-200 p-[48px] relative shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />
        <div className="bg-[#D4AF37] h-px w-[40px] mb-[16px]" />
        <h1 className="font-['Noto_Serif'] font-semibold text-[#1A1C1C] text-[24px] leading-[32px] mb-[8px]">
          Estate Archive
        </h1>
        <p className="font-['Inter'] text-[#4d4635] text-[13px] leading-[20px] mb-[32px]">
          Sign in to access your investor, landowner, or admin portal.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
          <label className="flex flex-col gap-[6px]">
            <span className="font-['Inter'] font-medium text-[9px] tracking-[2px] uppercase text-[#9e9e9e]">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-neutral-200 px-[14px] py-[12px] font-['Inter'] text-[14px] text-[#1A1C1C] focus:outline-none focus:border-[#D4AF37]"
            />
          </label>
          <label className="flex flex-col gap-[6px]">
            <span className="font-['Inter'] font-medium text-[9px] tracking-[2px] uppercase text-[#9e9e9e]">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-neutral-200 px-[14px] py-[12px] font-['Inter'] text-[14px] text-[#1A1C1C] focus:outline-none focus:border-[#D4AF37]"
            />
          </label>

          {error && (
            <p className="font-['Inter'] text-red-600 text-[12px] leading-[18px] border border-red-200 bg-red-50 px-[12px] py-[8px]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#1A1C1C] text-white font-['Inter'] font-medium text-[11px] tracking-[2px] uppercase py-[14px] hover:bg-[#2e2b27] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-[24px] font-['Inter'] text-[11px] text-[#9e9e9e] leading-[18px]">
          Demo: <span className="text-[#4d4635]">rafiqul@example.com</span> · <span className="text-[#4d4635]">hasina@example.com</span> · <span className="text-[#4d4635]">admin@estatearchive.bd</span> — password: <span className="text-[#4d4635]">password</span>
        </p>

        <Link to="/" className="block mt-[20px] font-['Inter'] text-[10px] tracking-[1.5px] uppercase text-[#735c00] hover:underline">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
