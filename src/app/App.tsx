import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { useEffect } from "react";
import { router } from "./routes.tsx";
import { useAuthStore } from "@/store/authStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:    30_000,
      retry:        1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hydrateSession = useAuthStore((s) => s.hydrateSession);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrator>
        <RouterProvider router={router} />
      </AuthHydrator>
    </QueryClientProvider>
  );
}
