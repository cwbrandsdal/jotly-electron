import { useAuth } from "@workos-inc/authkit-react";
import { setTokenProvider } from "@/api/client";

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const { getAccessToken } = useAuth();

  // Set synchronously on every render so it's available before children mount
  setTokenProvider(async () => {
    try {
      return (await getAccessToken()) || "";
    } catch (e) {
      console.error("Failed to get access token:", e);
      return "";
    }
  });

  return <>{children}</>;
}
