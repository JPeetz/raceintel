import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | RaceIntel",
  description:
    "RaceIntel privacy policy — how we collect, use, store, and protect your personal data in compliance with GDPR and UK data protection law.",
};

export default function PrivacyPage() {
  const lastUpdated = "30 May 2026";

  return (
    <main className="min-h-screen bg-[#0a0d14]">
      <section className="border-b border-white/[0.06] px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="prose prose-invert prose-gray max-w-none space-y-12 text-gray-300 leading-relaxed">
          {/* 1. Introduction */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
            <p>
              RaceIntel ("we," "our," or "us") is committed to protecting your privacy. This policy explains how we
              collect, use, store, share, and protect your personal data when you use our website, mobile applications,
              and services (collectively, the "Platform").
            </p>
            <p>
              RaceIntel is a trading name operated from Ireland. For data protection purposes, we act as the Data
              Controller. If you have questions about this policy, contact us at{" "}
              <strong className="text-white">privacy@raceintel.com</strong>.
            </p>
            <p>
              This policy is governed by the EU General Data Protection Regulation (GDPR), the Irish Data Protection Act
              2018, and the UK GDPR / Data Protection Act 2018 where applicable.
            </p>
          </div>

          {/* 2. What We Collect */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">2. Data We Collect</h2>

            <h3 className="text-lg font-semibold text-white mt-6 mb-2">2.1 Account Data (Required)</h3>
            <p>When you create an account, we collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Email address</strong> — used for authentication, account recovery, subscription management, and service announcements</li>
              <li><strong>Authentication credentials</strong> — stored securely by Supabase Auth; we never see your raw password</li>
              <li><strong>Display name</strong> (optional) — shown on your profile within the Platform</li>
              <li><strong>Date of birth</strong> — used solely to verify you are 18+; stored but not shared</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-6 mb-2">2.2 Platform Usage Data</h3>
            <p>When you use RaceIntel, we collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Racing preferences</strong> — favourite tracks, followed horses/trainers/jockeys ("My Stables")</li>
              <li><strong>Bet tracking data</strong> — bets you manually log (P&L, ROI, strike rate, bookmaker, odds)</li>
              <li><strong>Notification preferences</strong> — which alerts you want, quiet hours, channels (push/email)</li>
              <li><strong>Subscription data</strong> — plan type, status, trial dates, payment method type (not full card details)</li>
            </ul>
            <p className="text-sm text-gray-500 mt-2">
              ⚠️ <strong>Bet tracking data is private by default.</strong> It is stored in your personal account and is
              never shared with other users, third parties, or used for marketing purposes. It exists solely for your own
              performance analysis.
            </p>

            <h3 className="text-lg font-semibold text-white mt-6 mb-2">2.3 Technical Data (Automatic)</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>IP address</strong> — logged temporarily for security, rate-limiting, and geolocation (country-level only)</li>
              <li><strong>Device information</strong> — browser type, OS, device model (for push notification routing and error debugging)</li>
              <li><strong>Push notification tokens</strong> — stored when you enable notifications (platform: iOS/Android/Web)</li>
              <li><strong>Usage analytics</strong> — anonymised page views, feature usage, and error tracking via Supabase analytics</li>
              <li><strong>Cookies</strong> — strictly necessary session cookies for authentication; analytics cookies (if you consent)</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-6 mb-2">2.4 Payment Data</h3>
            <p>
              Payment processing is handled entirely by <strong>Stripe</strong>, our payment processor. We
              never receive, store, or have access to your full credit card number, CVC, or bank details. Stripe provides
              us with:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>A customer ID</li>
              <li>Last 4 digits of your card (for display in your account)</li>
              <li>Card brand (Visa, Mastercard, etc.)</li>
              <li>Subscription status and expiry dates</li>
            </ul>
            <p>Stripe's privacy policy:{" "}
              <a href="https://stripe.com/privacy" className="text-emerald-400 underline" target="_blank" rel="noopener noreferrer">
                stripe.com/privacy
              </a>
            </p>
          </div>

          {/* 3. How We Use It */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Data</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-4 text-white">Purpose</th>
                    <th className="text-left py-2 pr-4 text-white">Data Used</th>
                    <th className="text-left py-2 text-white">Legal Basis (GDPR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-3 pr-4">Account creation &amp; authentication</td>
                    <td className="py-3 pr-4">Email, credentials</td>
                    <td className="py-3">Contractual necessity</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Subscription management &amp; billing</td>
                    <td className="py-3 pr-4">Stripe customer ID, subscription status</td>
                    <td className="py-3">Contractual necessity</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Delivering AI predictions &amp; form analysis</td>
                    <td className="py-3 pr-4">Racing preferences, followed entities</td>
                    <td className="py-3">Contractual necessity</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Push notifications &amp; alerts</td>
                    <td className="py-3 pr-4">Push tokens, notification preferences</td>
                    <td className="py-3">Consent (opt-in)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Bet tracking &amp; P&L analytics</td>
                    <td className="py-3 pr-4">Manually logged bet data</td>
                    <td className="py-3">Consent (you choose to log bets)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Platform improvement &amp; debugging</td>
                    <td className="py-3 pr-4">Anonymised usage analytics, error logs</td>
                    <td className="py-3">Legitimate interest</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Security, fraud prevention &amp; legal compliance</td>
                    <td className="py-3 pr-4">IP address, account activity</td>
                    <td className="py-3">Legal obligation / legitimate interest</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Marketing (only with consent)</td>
                    <td className="py-3 pr-4">Email address</td>
                    <td className="py-3">Consent (opt-in)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Data We Do NOT Use */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">4. Data We Do NOT Collect, Share, or Sell</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>We do not sell your data.</strong> Ever. To anyone. We have no ad network, no data broker
                relationships, and no third-party analytics providers that monetise user data.
              </li>
              <li>
                <strong>We do not share your betting history</strong> with other users, third parties, bookmakers,
                or any external entity. Your bet log is fully private to your account.
              </li>
              <li>
                <strong>We do not run targeted advertising.</strong> RaceIntel is subscription-funded. We do not
                display ads or use tracking pixels for ad retargeting.
              </li>
              <li>
                <strong>We do not profile you for automated decisions</strong> that have legal or similarly
                significant effects. Our AI provides racing predictions; it does not make credit, employment,
                or insurance decisions about you.
              </li>
              <li>
                <strong>We do not share data with bookmakers or gambling operators.</strong> RaceIntel is an
                independent analysis platform with no commercial relationships with any bookmaker.
              </li>
            </ul>
          </div>

          {/* 5. Data Sharing */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">5. Third-Party Data Processors</h2>
            <p>We use the following processors to operate the Platform. Each is GDPR-compliant and contractually bound:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-4 text-white">Processor</th>
                    <th className="text-left py-2 pr-4 text-white">Purpose</th>
                    <th className="text-left py-2 pr-4 text-white">Data Shared</th>
                    <th className="text-left py-2 text-white">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-3 pr-4 font-medium text-white">Supabase</td>
                    <td className="py-3 pr-4">Database hosting, authentication, storage</td>
                    <td className="py-3 pr-4">All account &amp; platform data</td>
                    <td className="py-3">EU (eu-west-1)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-white">Stripe</td>
                    <td className="py-3 pr-4">Payment processing</td>
                    <td className="py-3 pr-4">Email, payment method type, transaction metadata</td>
                    <td className="py-3">Global (EU data centres available)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-white">Vercel</td>
                    <td className="py-3 pr-4">Website hosting &amp; edge functions</td>
                    <td className="py-3 pr-4">IP address (logs), request data</td>
                    <td className="py-3">Global edge network</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-white">OpenRouter</td>
                    <td className="py-3 pr-4">AI model inference</td>
                    <td className="py-3 pr-4"><strong>No user data</strong> — only race data &amp; anonymised prompts</td>
                    <td className="py-3">US (model routing only)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              ⚠️ <strong>Important:</strong> When we send race data to OpenRouter for AI analysis, we send only
              anonymised horse racing data (runner names, form figures, odds). No user-identifiable information
              is included in AI prompts. OpenRouter does not train on API-submitted data.
            </p>
          </div>

          {/* 6. Data Retention */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">6. Data Retention</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account data:</strong> Retained for the lifetime of your account. Deleted within 30 days of account deletion request.</li>
              <li><strong>Bet tracking data:</strong> Retained while your account is active. Deleted with your account.</li>
              <li><strong>Push notification tokens:</strong> Retained until you disable notifications or delete your account.</li>
              <li><strong>IP address logs:</strong> Retained for a maximum of 90 days for security purposes.</li>
              <li><strong>Payment records:</strong> Retained for 7 years as required by Irish tax law. Payment method details are handled by Stripe, not stored by us.</li>
              <li><strong>Anonymised analytics:</strong> Retained indefinitely in aggregate form (cannot be linked to you).</li>
            </ul>
          </div>

          {/* 7. Your Rights */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">7. Your Rights Under GDPR</h2>
            <p>As a data subject in the EU/EEA or UK, you have the following rights:</p>
            <div className="space-y-3 mt-4">
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <strong className="text-white">Right of Access (Art. 15)</strong>
                <p className="text-sm mt-1">Request a copy of all personal data we hold about you. We respond within 30 days.</p>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <strong className="text-white">Right to Rectification (Art. 16)</strong>
                <p className="text-sm mt-1">Correct inaccurate or incomplete personal data. You can update most information directly in your account settings.</p>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <strong className="text-white">Right to Erasure — "Right to be Forgotten" (Art. 17)</strong>
                <p className="text-sm mt-1">Request deletion of your personal data. We will delete your account and all associated data within 30 days, except data we are legally required to retain (e.g., tax records).</p>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <strong className="text-white">Right to Data Portability (Art. 20)</strong>
                <p className="text-sm mt-1">Receive your data in a structured, machine-readable format (JSON/CSV). You can export your bet tracking data, followed entities, and account data on request.</p>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <strong className="text-white">Right to Object &amp; Restrict Processing (Art. 18, 21)</strong>
                <p className="text-sm mt-1">Object to processing based on legitimate interests or restrict processing in certain circumstances.</p>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <strong className="text-white">Right to Withdraw Consent (Art. 7)</strong>
                <p className="text-sm mt-1">Withdraw consent for optional processing (marketing, push notifications) at any time via your account settings or by contacting us.</p>
              </div>
            </div>
            <p className="mt-4">
              To exercise any of these rights, email{" "}
              <strong className="text-white">privacy@raceintel.com</strong>. We will verify your identity before
              processing your request. You also have the right to lodge a complaint with the{" "}
              <a href="https://www.dataprotection.ie" className="text-emerald-400 underline" target="_blank" rel="noopener noreferrer">
                Irish Data Protection Commission
              </a>{" "}
              or your local supervisory authority.
            </p>
          </div>

          {/* 8. Security */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">8. Data Security</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All data is encrypted in transit (TLS 1.3) and at rest (AES-256).</li>
              <li>Authentication is handled by Supabase Auth with bcrypt-hashed passwords.</li>
              <li>Database access is governed by Row-Level Security (RLS) policies — users can only access their own data.</li>
              <li>Service role keys are never exposed to the client; all sensitive operations use server-side API routes.</li>
              <li>We conduct regular security reviews of our infrastructure and dependencies.</li>
            </ul>
          </div>

          {/* 9. Age Restriction */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">9. Age Restriction</h2>
            <p>
              RaceIntel is intended for users aged <strong className="text-white">18 years or older</strong>. We
              collect date of birth during registration specifically to verify this. We do not knowingly collect
              data from individuals under 18. If we discover an account belonging to a minor, we will delete it
              immediately.
            </p>
          </div>

          {/* 10. Changes */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">10. Changes to This Policy</h2>
            <p>
              We will notify you of material changes to this policy via email and/or an in-app notice at least 14 days
              before they take effect. The "Last updated" date at the top of this page reflects the most recent revisions.
            </p>
          </div>

          {/* 11. Contact */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">11. Contact</h2>
            <p>
              For privacy-related inquiries or to exercise your data rights:<br />
              <strong className="text-white">Email:</strong> privacy@raceintel.com<br />
              <strong className="text-white">Data Controller:</strong> RaceIntel, Ireland
            </p>
            <p className="mt-2">
              You may also contact our EU Representative or your local Data Protection Authority. The lead supervisory
              authority for RaceIntel is the{" "}
              <a href="https://www.dataprotection.ie" className="text-emerald-400 underline" target="_blank" rel="noopener noreferrer">
                Irish Data Protection Commission (DPC)
              </a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}