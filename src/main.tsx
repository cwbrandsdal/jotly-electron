import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthKitProvider } from "@workos-inc/authkit-react";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

const clientId = import.meta.env.VITE_WORKOS_CLIENT_ID || "";
const redirectUri =
  import.meta.env.VITE_WORKOS_REDIRECT_URI || "http://localhost:5173/auth/callback";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthKitProvider clientId={clientId} redirectUri={redirectUri} devMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AuthKitProvider>
  </StrictMode>,
);
