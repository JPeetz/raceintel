"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export type AuthView = "sign_in" | "sign_up";

function AuthForm({ view }: { view: AuthView }) {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace(redirect);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace(redirect);
    });
    return () => subscription.unsubscribe();
  }, [router, redirect, supabase.auth]);

  if (!origin) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 text-sm mt-4">Loading...</p>
      </div>
    );
  }

  return (
    <Auth
      supabaseClient={supabase}
      view={view}
      appearance={{
        theme: ThemeSupa,
        variables: {
          default: {
            colors: {
              brand: "#10b981",
              brandAccent: "#059669",
              brandButtonText: "#000",
              inputBackground: "#0f1117",
              inputBorder: "#1e293b",
              inputBorderHover: "#334155",
              inputBorderFocus: "#10b981",
              inputText: "#f1f5f9",
              inputPlaceholder: "#64748b",
              defaultButtonBackground: "#1e293b",
              defaultButtonBackgroundHover: "#334155",
              defaultButtonBorder: "#334155",
              defaultButtonText: "#e2e8f0",
              anchorTextColor: "#10b981",
              anchorTextHoverColor: "#34d399",
              messageText: "#94a3b8",
              messageTextDanger: "#ef4444",
            },
            radii: {
              borderRadiusButton: "12px",
              buttonBorderRadius: "12px",
              inputBorderRadius: "10px",
            },
            fonts: {
              bodyFontFamily: "system-ui, -apple-system, sans-serif",
              buttonFontFamily: "system-ui, -apple-system, sans-serif",
              inputFontFamily: "system-ui, -apple-system, sans-serif",
              labelFontFamily: "system-ui, -apple-system, sans-serif",
            },
          },
        },
        className: {
          container: "!gap-5",
          button: "!text-sm !font-semibold !py-3 !h-auto !px-4",
          input: "!text-sm !py-3 !h-auto !px-4",
          label: "!text-gray-300 !text-xs !mb-1.5 !font-medium",
          anchor: "!text-emerald-400 !text-xs !font-medium",
          message: "!text-xs",
          divider: "!my-2",
        },
      }}
      providers={[]}
      redirectTo={`${origin}/auth/callback`}
      localization={{
        variables: {
          sign_in: {
            email_label: "Email address",
            password_label: "Password",
            email_input_placeholder: "your@email.com",
            password_input_placeholder: "",
            button_label: "Sign In",
            loading_button_label: "Signing in...",
            link_text: "Don't have an account? Sign up",
          },
          sign_up: {
            email_label: "Email address",
            password_label: "Password",
            email_input_placeholder: "your@email.com",
            password_input_placeholder: "Create a password",
            button_label: "Create Account",
            loading_button_label: "Creating account...",
            link_text: "Already have an account? Sign in",
          },
        },
      }}
    />
  );
}

function AuthPageInner() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<AuthView>(
    tabParam === "signup" ? "sign_up" : "sign_in"
  );
  const router = useRouter();

  const switchTab = useCallback((tab: AuthView) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab === "sign_up" ? "signup" : "signin");
    router.replace(`/auth?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-[#0a0d14] flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left: Branding panel (desktop only) */}
        <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-emerald-950/40 via-[#0a0d14] to-[#0a0d14] items-center justify-center p-12 border-r border-white/[0.04]">
          <div className="max-w-sm text-center">
            <Image
              src="/logo-shield.svg"
              alt="RaceIntel"
              width={72}
              height={72}
              className="mx-auto mb-6 opacity-90"
            />
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              RaceIntel
            </h1>
            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              UK & Irish Horse Racing Intelligence
            </p>
            <div className="space-y-4 text-left">
              {[
                { icon: "🧠", title: "AI-Powered Analysis", desc: "13-factor GG Score for every runner" },
                { icon: "📊", title: "Daily Selections", desc: "Top Pick, Main Danger, Value Pick, Outsider" },
                { icon: "🏇", title: "Live Race Cards", desc: "Full declarations, form, odds — every UK & IE meeting" },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3 p-3 rounded-lg">
                  <span className="text-xl mt-0.5">{item.icon}</span>
                  <div>
                    <div className="text-white font-medium text-sm">{item.title}</div>
                    <div className="text-gray-500 text-xs">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form panel */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-[400px]">
            {/* Mobile branding */}
            <div className="lg:hidden text-center mb-8">
              <Image
                src="/logo-shield.svg"
                alt="RaceIntel"
                width={48}
                height={48}
                className="mx-auto mb-4 opacity-90"
              />
              <h1 className="text-2xl font-bold text-white">RaceIntel</h1>
              <p className="text-sm text-gray-400 mt-1">UK & Irish Horse Racing Intelligence</p>
            </div>

            {/* Tab switcher */}
            <div className="flex p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-8">
              <button
                onClick={() => switchTab("sign_in")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "sign_in"
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/10"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchTab("sign_up")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "sign_up"
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/10"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">
                {activeTab === "sign_in" ? "Welcome back" : "Start your free trial"}
              </h2>
              <p className="text-sm text-gray-400">
                {activeTab === "sign_in"
                  ? "Sign in to access your Racing Hub"
                  : "7 days free. Cancel anytime. No commitment."}
              </p>
            </div>

            {/* Form card */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 lg:p-8 shadow-xl shadow-black/20">
              <Suspense fallback={
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto" />
                </div>
              }>
                <AuthForm view={activeTab} />
              </Suspense>
            </div>

            {/* Legal */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-gray-600 text-xs leading-relaxed">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="text-gray-500 hover:text-gray-300 underline underline-offset-2">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-gray-500 hover:text-gray-300 underline underline-offset-2">
                  Privacy Policy
                </Link>.
              </p>
              <p className="text-gray-700 text-[11px]">
                18+ only. Please gamble responsibly ·{" "}
                <a href="https://www.begambleaware.org" className="text-gray-600 hover:text-gray-400 underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                  BeGambleAware.org
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Page footer */}
      <footer className="border-t border-white/[0.04] px-6 py-4">
        <div className="flex justify-center gap-6 text-xs text-gray-600">
          <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
          <Link href="/responsible-gambling" className="hover:text-gray-400 transition-colors">Responsible Gambling</Link>
        </div>
      </footer>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0d14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      </main>
    }>
      <AuthPageInner />
    </Suspense>
  );
}
