"use client";

import { useState, useCallback, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Check, X, ArrowRight, Loader2 } from "lucide-react";

type AuthView = "sign_in" | "sign_up";

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  day: string;
  month: string;
  year: string;
  acceptAge: boolean;
}

interface SignInFormData {
  email: string;
  password: string;
}

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [form, setForm] = useState<SignUpFormData>({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
    day: "", month: "", year: "", acceptAge: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field: keyof SignUpFormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const passwordsMatch = form.password === form.confirmPassword;
  const passwordValid = passwordRules.every(r => r.test(form.password));
  const allFieldsFilled = form.firstName && form.lastName && form.email &&
    passwordValid && passwordsMatch && form.day && form.month && form.year && form.acceptAge;
  const isOldEnough = () => {
    if (!form.year || !form.month || !form.day) return false;
    const dob = new Date(parseInt(form.year), months.indexOf(form.month), parseInt(form.day));
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age >= 18;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!allFieldsFilled) return;
    if (!isOldEnough()) {
      setError("You must be 18 or over to create an account.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      );

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
            full_name: `${form.firstName} ${form.lastName}`,
            date_of_birth: `${form.year}-${String(months.indexOf(form.month) + 1).padStart(2, "0")}-${form.day.padStart(2, "0")}`,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data?.session) {
        // Auto-confirmed — redirect
        router.replace(redirect);
      } else {
        // Email confirmation required
        router.replace("/auth?tab=signin&verified=pending");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">First name</label>
          <input
            type="text"
            value={form.firstName}
            onChange={e => updateField("firstName", e.target.value)}
            placeholder="John"
            className="w-full px-4 py-3 rounded-xl bg-[#0f1117] border border-[#1e293b] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">Last name</label>
          <input
            type="text"
            value={form.lastName}
            onChange={e => updateField("lastName", e.target.value)}
            placeholder="Smith"
            className="w-full px-4 py-3 rounded-xl bg-[#0f1117] border border-[#1e293b] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">Email address</label>
        <input
          type="email"
          value={form.email}
          onChange={e => updateField("email", e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
          className="w-full px-4 py-3 rounded-xl bg-[#0f1117] border border-[#1e293b] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={e => updateField("password", e.target.value)}
            placeholder="Create a password"
            autoComplete="new-password"
            className="w-full px-4 py-3 pr-10 rounded-xl bg-[#0f1117] border border-[#1e293b] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {/* Password requirements */}
        {form.password.length > 0 && (
          <div className="mt-2 space-y-1">
            {passwordRules.map(rule => {
              const passes = rule.test(form.password);
              return (
                <div key={rule.label} className="flex items-center gap-2 text-xs">
                  {passes ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <X className="w-3 h-3 text-gray-600" />
                  )}
                  <span className={passes ? "text-emerald-400" : "text-gray-500"}>{rule.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">Confirm password</label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={form.confirmPassword}
            onChange={e => updateField("confirmPassword", e.target.value)}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            className="w-full px-4 py-3 pr-10 rounded-xl bg-[#0f1117] border border-[#1e293b] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {form.confirmPassword.length > 0 && (
          <div className="flex items-center gap-2 mt-1.5 text-xs">
            {passwordsMatch ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Passwords match</span>
              </>
            ) : (
              <>
                <X className="w-3 h-3 text-red-400" />
                <span className="text-red-400">Passwords don&apos;t match</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">Date of birth</label>
        <div className="grid grid-cols-3 gap-2">
          <select
            value={form.day}
            onChange={e => updateField("day", e.target.value)}
            className="px-2 py-3 rounded-xl bg-[#0f1117] border border-[#1e293b] text-white text-sm focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#1a1d24]">Day</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)} className="bg-[#1a1d24]">{i + 1}</option>
            ))}
          </select>
          <select
            value={form.month}
            onChange={e => updateField("month", e.target.value)}
            className="px-2 py-3 rounded-xl bg-[#0f1117] border border-[#1e293b] text-white text-sm focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#1a1d24]">Month</option>
            {months.map(m => (
              <option key={m} value={m} className="bg-[#1a1d24]">{m}</option>
            ))}
          </select>
          <select
            value={form.year}
            onChange={e => updateField("year", e.target.value)}
            className="px-2 py-3 rounded-xl bg-[#0f1117] border border-[#1e293b] text-white text-sm focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#1a1d24]">Year</option>
            {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 18 - i).map(y => (
              <option key={y} value={String(y)} className="bg-[#1a1d24]">{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Age confirmation */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.acceptAge}
          onChange={e => updateField("acceptAge", e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-transparent text-emerald-500 focus:ring-emerald-500/20"
        />
        <span className="text-xs text-gray-400 leading-relaxed">
          I confirm that I am 18 years of age or older and agree to the{" "}
          <Link href="/terms" className="text-emerald-400 hover:underline" target="_blank">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-emerald-400 hover:underline" target="_blank">Privacy Policy</Link>.
        </span>
      </label>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!allFieldsFilled || loading || !isOldEnough()}
        className="w-full py-3 rounded-xl bg-emerald-500 text-black font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating account...
          </>
        ) : (
          <>
            Create Account
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}

function SignInForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const verified = searchParams.get("verified");
  const [form, setForm] = useState<SignInFormData>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) return;

    setLoading(true);
    setError("");

    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      );

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      router.replace(redirect);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {verified === "pending" && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-emerald-400 text-xs">
            ✅ Account created! Check your email for a confirmation link, then sign in.
          </p>
        </div>
      )}

      {verified === "confirmed" && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-emerald-400 text-xs">
            ✅ Email confirmed! Sign in to access your Racing Hub.
          </p>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">Email address</label>
        <input
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          placeholder="your@email.com"
          autoComplete="email"
          className="w-full px-4 py-3 rounded-xl bg-[#0f1117] border border-[#1e293b] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">Password</label>
        <input
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          placeholder="••••••••"
          autoComplete="current-password"
          className="w-full px-4 py-3 rounded-xl bg-[#0f1117] border border-[#1e293b] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
        />
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!form.email || !form.password || loading}
        className="w-full py-3 rounded-xl bg-emerald-500 text-black font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => {}} // Password reset — placeholder
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Forgot your password?
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Don&apos;t have an account?{" "}
          <button type="button" onClick={onSwitch} className="text-emerald-400 hover:text-emerald-300 font-medium">
            Sign up
          </button>
        </p>
      </div>
    </form>
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
              Racing Intelligence for Serious Racing Fans
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
          <div className="w-full max-w-[420px]">
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
              <p className="text-sm text-gray-400 mt-1">Racing Intelligence for Serious Racing Fans</p>
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
                  : activeTab === "sign_up"
                  ? "Get 7 days free. Cancel anytime. No commitment."
                  : ""}
              </p>
            </div>

            {/* Form card */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 lg:p-8 shadow-xl shadow-black/20">
              {activeTab === "sign_in" ? (
                <SignInForm onSwitch={() => switchTab("sign_up")} />
              ) : (
                <SignUpForm onSwitch={() => switchTab("sign_in")} />
              )}
            </div>

            {/* Legal */}
            <div className="mt-6 text-center space-y-2">
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

export { type AuthView };

import { Suspense } from "react";

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
