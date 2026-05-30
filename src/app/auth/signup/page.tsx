"use client";

import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function SignupForm() {
  const supabase = createClient();
  const router = useRouter();
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/dashboard");
    });
    return () => subscription.unsubscribe();
  }, [router, supabase]);

  return (
    <main className="min-h-screen bg-[#0a0d14] flex">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to RaceIntel
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-gray-400 mb-8">Start your 7-day free trial — cancel anytime</p>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
            {origin ? (
              <Auth
                supabaseClient={supabase}
                view="sign_up"
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: "#10b981",
                        brandAccent: "#059669",
                        inputBackground: "#1a1d24",
                        inputBorder: "#2a2d34",
                        inputText: "#fff",
                        inputPlaceholder: "#6b7280",
                      },
                    },
                  },
                  className: {
                    button: "!rounded-xl !text-sm !font-semibold",
                    input: "!rounded-lg !text-sm",
                    label: "!text-gray-300",
                  },
                }}
                providers={[]}
                redirectTo={`${origin}/auth/callback`}
              />
            ) : (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            )}
          </div>
          <p className="text-gray-500 text-sm text-center mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0d14] flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>}>
      <SignupForm />
    </Suspense>
  );
}