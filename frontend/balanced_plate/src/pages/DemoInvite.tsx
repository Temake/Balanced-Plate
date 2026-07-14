import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DEMO_ACCESS_TOKEN_KEY } from "@/hooks/useBilling";

const DemoInvite = () => {
  const { token } = useParams<{ token: string }>();

  useEffect(() => {
    if (token) {
      localStorage.setItem(DEMO_ACCESS_TOKEN_KEY, token);
    }
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Demo access is ready</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Sign in or create an account to activate temporary full access to NutriLens features.
        </p>

        <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
          <div className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>This link expires in 5 months and will be applied after authentication.</span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/signup">Create account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DemoInvite;
