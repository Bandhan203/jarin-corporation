import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { loginRequest, logoutRequest, meRequest } from "@/services/authApi";
import { getApiErrorMessage } from "@/services/apiClient";

// ── Domain types ─────────────────────────────────────────────────────────────

export type UserRole = "admin" | "investor" | "landowner";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarInitials: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  role: UserRole | null;
  isNidVerified: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  loginAction: (credentials: LoginCredentials) => Promise<void>;
  logoutAction: () => Promise<void>;
  hydrateSession: () => Promise<void>;
  setNidVerified: (verified: boolean) => void;
  setUser: (partial: Partial<AuthUser>) => void;
  clearError: () => void;
}

const PORTAL_BY_ROLE: Record<UserRole, string> = {
  investor:  "/portal/investor",
  landowner: "/portal/landowner",
  admin:     "/portal/admin",
};

export function portalPathForRole(role: UserRole): string {
  return PORTAL_BY_ROLE[role];
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:            null,
      token:           null,
      role:            null,
      isNidVerified:   false,
      isAuthenticated: false,
      isLoading:       false,
      error:           null,

      async loginAction(credentials) {
        set({ isLoading: true, error: null });
        try {
          const data = await loginRequest(credentials);
          set({
            user:            data.user,
            token:           data.token,
            role:            data.user.role,
            isNidVerified:   data.user.isNidVerified,
            isAuthenticated: true,
            isLoading:       false,
            error:           null,
          });
        } catch (err) {
          set({
            isLoading:       false,
            isAuthenticated: false,
            error:           getApiErrorMessage(err),
          });
          throw err;
        }
      },

      async logoutAction() {
        const token = get().token;
        set({
          user:            null,
          token:           null,
          role:            null,
          isNidVerified:   false,
          isAuthenticated: false,
          error:           null,
        });
        if (token) {
          try {
            await logoutRequest(token);
          } catch {
            // Session cleared locally regardless
          }
        }
      },

      async hydrateSession() {
        const { token, isAuthenticated } = get();
        if (!token || !isAuthenticated) return;

        set({ isLoading: true });
        try {
          const user = await meRequest(token);
          set({
            user,
            role:            user.role,
            isNidVerified:   user.isNidVerified,
            isAuthenticated: true,
            isLoading:       false,
          });
        } catch {
          set({
            user:            null,
            token:           null,
            role:            null,
            isNidVerified:   false,
            isAuthenticated: false,
            isLoading:       false,
          });
        }
      },

      setNidVerified(verified) {
        set({ isNidVerified: verified });
      },

      setUser(partial) {
        set((s) => ({
          user: s.user ? { ...s.user, ...partial } : null,
        }));
      },

      clearError() {
        set({ error: null });
      },
    }),
    {
      name:    "estate-archive-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        user:            s.user,
        token:           s.token,
        role:            s.role,
        isNidVerified:   s.isNidVerified,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);

export const selectUser            = (s: AuthState) => s.user;
export const selectRole            = (s: AuthState) => s.role;
export const selectIsAuthenticated = (s: AuthState) => s.isAuthenticated;
export const selectIsNidVerified   = (s: AuthState) => s.isNidVerified;
