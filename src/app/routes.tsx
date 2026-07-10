import { createBrowserRouter } from "react-router";
import PublicLayout from "../layouts/PublicLayout";
import PortalLayout from "../layouts/PortalLayout";
import Landing from "../pages/Landing";
import ExploreProjects from "../pages/ExploreProjects";
import HowItWorks from "../pages/HowItWorks";
import ProjectDetail from "../pages/ProjectDetail";
import SubmitLand from "../pages/SubmitLand";
import InvestorDashboard from "../pages/investor/Dashboard";
import InvestorLedger from "../pages/investor/Ledger";
import LandownerDashboard from "../pages/landowner/Dashboard";
import AdminDashboard from "../pages/admin/Dashboard";
import PaymentSuccess from "../pages/investor/PaymentSuccess";
import CmsManager from "../pages/admin/CmsManager";
import ProjectControlHub from "../pages/admin/ProjectControlHub";
import SystemAuditHub from "../pages/admin/SystemAuditHub";
import Login from "../pages/Login";
import { NotFound, RouteErrorBoundary } from "../pages/NotFound";
import RoleProtectedRoute from "../components/auth/RoleProtectedRoute";

// ── Portal children wrapped with role guards ──────────────────────────────────

function InvestorDashboardGuarded() {
  return (
    <RoleProtectedRoute allowedRoles={["investor"]}>
      <InvestorDashboard />
    </RoleProtectedRoute>
  );
}

function InvestorLedgerGuarded() {
  return (
    <RoleProtectedRoute allowedRoles={["investor"]}>
      <InvestorLedger />
    </RoleProtectedRoute>
  );
}

function LandownerDashboardGuarded() {
  return (
    <RoleProtectedRoute allowedRoles={["landowner"]}>
      <LandownerDashboard />
    </RoleProtectedRoute>
  );
}

function AdminDashboardGuarded() {
  return (
    <RoleProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </RoleProtectedRoute>
  );
}

function CmsManagerGuarded() {
  return (
    <RoleProtectedRoute allowedRoles={["admin"]}>
      <CmsManager />
    </RoleProtectedRoute>
  );
}

function ProjectControlHubGuarded() {
  return (
    <RoleProtectedRoute allowedRoles={["admin"]}>
      <ProjectControlHub />
    </RoleProtectedRoute>
  );
}

function SystemAuditHubGuarded() {
  return (
    <RoleProtectedRoute allowedRoles={["admin"]}>
      <SystemAuditHub />
    </RoleProtectedRoute>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: PublicLayout,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      { index: true, Component: Landing },
      { path: "explore", Component: ExploreProjects },
      { path: "how-it-works", Component: HowItWorks },
      { path: "project/:id", Component: ProjectDetail },
      { path: "submit-land", Component: SubmitLand },
      { path: "login", Component: Login },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/portal",
    Component: PortalLayout,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      { path: "investor",                Component: InvestorDashboardGuarded },
      { path: "investor/ledger",         Component: InvestorLedgerGuarded },
      { path: "investor/payment-success", Component: PaymentSuccess },
      { path: "landowner",        Component: LandownerDashboardGuarded },
      { path: "admin",            Component: AdminDashboardGuarded },
      { path: "admin/cms",        Component: CmsManagerGuarded },
      { path: "admin/projects",   Component: ProjectControlHubGuarded },
      { path: "admin/audit",      Component: SystemAuditHubGuarded },
      { path: "*",               Component: NotFound },
    ],
  },
  { path: "*", Component: NotFound },
]);
