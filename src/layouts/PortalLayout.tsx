import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { LayoutDashboard, FileText, Building2, Settings, LogOut, ChevronRight, Database, FolderKanban, ShieldCheck } from "lucide-react";
import { NotificationBell } from "../components/notifications/NotificationDrawer";
import { useAuthStore } from "@/store/authStore";

const investorLinks = [
  { to: "/portal/investor", label: "Overview", icon: LayoutDashboard },
  { to: "/portal/investor/ledger", label: "Accounts & Ledger", icon: FileText },
];

const landownerLinks = [
  { to: "/portal/landowner", label: "Portfolio Hub", icon: Building2 },
];

const adminLinks = [
  { to: "/portal/admin",          label: "Command Center", icon: Settings },
  { to: "/portal/admin/cms",      label: "CMS Manager",    icon: Database },
  { to: "/portal/admin/projects", label: "Project Hub",    icon: FolderKanban },
  { to: "/portal/admin/audit",    label: "System Audit",   icon: ShieldCheck },
];

function roleFromPath(path: string) {
  if (path.startsWith("/portal/investor")) return { label: "Investor", links: investorLinks, accent: "#735c00" };
  if (path.startsWith("/portal/landowner")) return { label: "Landowner", links: landownerLinks, accent: "#1a1c1c" };
  if (path.startsWith("/portal/admin")) return { label: "Super Admin", links: adminLinks, accent: "#d4af37" };
  return { label: "Portal", links: [], accent: "#735c00" };
}

export default function PortalLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logoutAction = useAuthStore((s) => s.logoutAction);
  const role = roleFromPath(location.pathname);

  async function handleExit() {
    await logoutAction();
    navigate("/");
  }

  return (
    <div className="flex h-screen w-full bg-premium-bg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] bg-card-bg border-r border-neutral-200 flex flex-col shrink-0 shadow-[var(--shadow-premium-sm)]">
        {/* Brand */}
        <div className="px-[28px] py-[28px] border-b border-neutral-200">
          <Link to="/" className="no-underline">
            <span className="font-['Noto_Serif'] font-semibold text-warm-brown text-[15px] tracking-[-0.5px] uppercase leading-[22px]">
              ESTATE ARCHIVE
            </span>
          </Link>
          <div className="mt-[6px] flex items-center gap-[6px]">
            <div className="w-[6px] h-[6px] rounded-full" style={{ background: role.accent }} />
            <span className="font-['Inter'] font-medium text-text-secondary text-[10px] tracking-[1.5px] uppercase leading-[14px]">
              {role.label} Portal
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-[16px] py-[20px] flex flex-col gap-[2px] overflow-y-auto">
          {role.links.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="no-underline group flex items-center gap-[10px] px-[12px] py-[10px] rounded-none transition-colors relative"
                style={{ background: active ? `${role.accent}10` : "transparent" }}
              >
                {active && <div className="absolute left-0 top-[4px] bottom-[4px] w-[2px]" style={{ background: role.accent }} />}
                <Icon size={14} color={active ? role.accent : "#4d4635"} />
                <span
                  className="font-['Inter'] font-medium text-[12px] leading-[18px] tracking-[0.5px]"
                  style={{ color: active ? role.accent : "#4d4635" }}
                >
                  {label}
                </span>
              </Link>
            );
          })}

          {/* Portal switcher */}
          <div className="mt-[24px] border-t border-neutral-200 pt-[16px] flex flex-col gap-[2px]">
            <span className="px-[12px] font-['Inter'] font-medium text-text-secondary/50 text-[9px] tracking-[2px] uppercase leading-[14px] mb-[6px]">Switch Portal</span>
            {[
              { to: "/portal/investor", label: "Investor View" },
              { to: "/portal/landowner", label: "Landowner View" },
              { to: "/portal/admin", label: "Admin Center" },
            ].map(({ to, label }) => (
              <Link key={to} to={to} className="no-underline flex items-center justify-between px-[12px] py-[8px] hover:bg-neutral-100 transition-colors">
                <span className="font-['Inter'] font-medium text-text-secondary text-[10px] tracking-[1px] uppercase leading-[14px]">{label}</span>
                <ChevronRight size={10} color="#4d4635" />
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-[16px] py-[20px] border-t border-neutral-200">
          <button onClick={handleExit} className="flex items-center gap-[8px] px-[12px] py-[8px] w-full hover:bg-neutral-100 transition-colors cursor-pointer">
            <LogOut size={12} color="#4d4635" />
            <span className="font-['Inter'] font-medium text-text-secondary text-[10px] tracking-[1.5px] uppercase leading-[14px]">Exit Portal</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-[48px] bg-card-bg border-b border-neutral-200 flex items-center justify-end px-[28px] shrink-0 shadow-[var(--shadow-premium-xs)]">
          <NotificationBell />
        </header>

        <main className={`flex-1 overflow-hidden ${location.pathname.includes("/admin/cms") ? "" : "overflow-y-auto"}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
