import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { Loader2 } from "lucide-react";

export function AuthCallbackPage() {
  const { isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/app", { replace: true });
    }
  }, [isLoading, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-page">
      <div className="flex flex-col items-center gap-4 text-ink-muted">
        <Loader2 size={32} className="animate-spin text-accent" />
        <p className="text-sm font-display">Signing you in...</p>
      </div>
    </div>
  );
}
