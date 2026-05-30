import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | RaceIntel",
  description:
    "RaceIntel terms of service — subscription terms, acceptable use, intellectual property, limitation of liability, and governing law.",
};

export default function TermsPage() {
  const lastUpdated = "30 May 2026";

  return (
    <main className="min-h-screen bg-[#0a0d14]">
      <section className="border-b border-white/[0.06] px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-gray-400">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="prose prose-invert prose-gray max-w-none space-y-12 text-gray-300 leading-relaxed">

          {/* 1. Acceptance */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using RaceIntel ("the Platform"), you agree to be bound by these Terms of Service
              ("Terms"). If you do not agree, do not use the Platform. These Terms form a legally binding agreement
              between you and RaceIntel ("we," "us," or "our").
            </p>
            <p>
              We may update these Terms from time to time. Material changes will be communicated via email or in-app
              notice at least 14 days before they take effect. Continued use after changes constitutes acceptance.
            </p>
          </div>

          {/* 2. Eligibility */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">2. Eligibility</h2>
            <p>
              You must be <strong className="text-white">at least 18 years old</strong> to use RaceIntel. By creating
              an account, you represent and warrant that you are 18 or older. We reserve the right to request proof of
              age and to suspend or terminate accounts that violate this requirement.
            </p>
          </div>

          {/* 3. Account */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">3. Accounts &amp; Security</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>You must provide accurate and complete registration information and keep it up to date.</li>
              <li>You may not share your account, transfer it to another person, or use another person's account.</li>
              <li>Notify us immediately at{" "}
                <strong className="text-white">support@raceintel.com</strong> if you suspect unauthorised access.</li>
            </ul>
          </div>

          {/* 4. Subscription & Payment */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">4. Subscriptions &amp; Payments</h2>

            <h3 className="text-lg font-semibold text-white mt-6 mb-2">4.1 Free Tier</h3>
            <p>
              RaceIntel offers a free tier with access to basic race cards, live odds, and limited form data (last 3 runs).
              No payment is required for the free tier.
            </p>

            <h3 className="text-lg font-semibold text-white mt-6 mb-2">4.2 RaceIntel Pro</h3>
            <p>
              The Pro tier provides full access to GG Score rankings, daily AI selections, pace simulations, bet tracking,
              smart alerts, and the Festival Hub. Pro is available as a monthly (£9.99/mo) or annual (£80/yr) subscription.
            </p>

            <h3 className="text-lg font-semibold text-white mt-6 mb-2">4.3 Free Trial</h3>
            <p>
              New subscribers receive a <strong className="text-white">7-day free trial</strong>. No charges apply
              during the trial. At the end of the trial, your chosen payment method will be charged automatically.
              You may cancel anytime during the trial and incur no charges.
            </p>

            <h3 className="text-lg font-semibold text-white mt-6 mb-2">4.4 Billing &amp; Cancellation</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Subscriptions auto-renew at the end of each billing period unless cancelled.</li>
              <li>You can cancel anytime via your account settings. Cancellation takes effect at the end of the current billing period.</li>
              <li>No refunds are provided for partial billing periods, except as required by applicable law.</li>
              <li>If you reside in the EU/EEA, you have a 14-day right of withdrawal from the date of purchase. By starting your free trial, you acknowledge that the service begins immediately and you waive this right for the trial period.</li>
              <li>Price changes will be communicated at least 30 days in advance. Your continued subscription after the notice period constitutes acceptance of the new price.</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-6 mb-2">4.5 Payment Processing</h3>
            <p>
              Payments are processed securely by Stripe. We do not store full payment card details. Stripe's terms
              and privacy policy also apply to your payment transactions.
            </p>
          </div>

          {/* 5. Acceptable Use */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Platform for any unlawful purpose or in violation of any applicable law or regulation</li>
              <li>Reverse-engineer, decompile, or extract the source code of the Platform</li>
              <li>Scrape, crawl, or systematically extract data from the Platform without our express written permission</li>
              <li>Use automated means (bots, scripts) to create accounts or access the Platform</li>
              <li>Attempt to bypass subscription paywalls or access Pro features without a valid subscription</li>
              <li>Upload malicious code, attempt to breach security, or interfere with the Platform's operation</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Use the Platform to promote or facilitate illegal gambling activities</li>
              <li>Resell, redistribute, or commercially exploit Platform content without a written licence</li>
            </ul>
            <p className="mt-3">
              Violation of these terms may result in immediate account suspension or termination without refund.
            </p>
          </div>

          {/* 6. Intellectual Property */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">6. Intellectual Property</h2>
            <p>
              <strong className="text-white">Our Content:</strong> The RaceIntel name, logo, "GG Score" methodology,
              AI-generated predictions, race analysis, UI/UX design, codebase, and all original content are the exclusive
              intellectual property of RaceIntel. All rights reserved.
            </p>
            <p>
              <strong className="text-white">Third-Party Data:</strong> Race data (horse names, form, results) is
              sourced from The Racing API and other public racing data providers. This data remains the property of
              its respective owners. We use it under licence or fair use for analysis purposes.
            </p>
            <p>
              <strong className="text-white">User-Generated Content:</strong> Any content you submit (bet logs, notes,
              community posts) remains yours. By submitting it, you grant RaceIntel a non-exclusive, royalty-free licence
              to display and process it solely for the purpose of providing the Platform's features to you.
            </p>
            <p>
              <strong className="text-white">AI-Generated Content:</strong> Predictions, scores, and analysis generated
              by our AI models are the intellectual property of RaceIntel. They are provided for your personal,
              non-commercial use only.
            </p>
          </div>

          {/* 7. Disclaimers */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">7. Disclaimers &amp; No Gambling Advice</h2>

            <div className="p-5 rounded-lg bg-amber-500/10 border border-amber-500/20 my-4">
              <p className="text-amber-300 font-semibold">⚠️ Critical Disclaimer — Please Read Carefully</p>
              <ul className="list-disc pl-6 space-y-2 mt-2 text-sm">
                <li><strong>RaceIntel does not provide gambling or financial advice.</strong> All AI-generated predictions,
                  GG Scores, daily selections, and form analysis are provided for{" "}
                  <strong className="text-white">informational and entertainment purposes only</strong>.
                </li>
                <li>AI predictions are <strong className="text-white">not guarantees</strong> of future performance.
                  Horse racing outcomes are inherently uncertain. Past AI accuracy does not guarantee future accuracy.
                </li>
                <li>You are <strong className="text-white">solely responsible</strong> for your own betting decisions
                  and any financial outcomes. Never bet more than you can afford to lose.
                </li>
                <li>RaceIntel has <strong className="text-white">no commercial relationship</strong> with any bookmaker
                  or gambling operator. We do not receive commissions on bets placed.
                </li>
              </ul>
            </div>
          </div>

          {/* 8. Limitation of Liability */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>RaceIntel is provided "as is" without warranties of any kind, express or implied.</li>
              <li>We do not warrant that the Platform will be uninterrupted, error-free, or free of harmful components.</li>
              <li>We do not warrant the accuracy, completeness, or reliability of AI-generated predictions, scores, or analysis.</li>
              <li>
                <strong className="text-white">We are not liable for any gambling losses, financial losses,
                indirect damages, consequential damages, or lost profits</strong> arising from your use of the
                Platform or reliance on AI predictions.
              </li>
              <li>Our total liability for any claim arising from these Terms or the Platform shall not exceed the amount
                you paid us in the 12 months preceding the claim, or £100, whichever is greater.</li>
              <li>Nothing in these Terms limits liability for death, personal injury, fraud, or any liability that
                cannot be excluded by law.</li>
            </ul>
          </div>

          {/* 9. Termination */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">9. Termination</h2>
            <p>
              You may terminate your account at any time via your account settings or by contacting support. Upon
              termination, your access to Pro features ceases at the end of your current billing period. Your data
              is handled per our{" "}
              <a href="/privacy" className="text-emerald-400 underline">Privacy Policy</a>.
            </p>
            <p>
              We may suspend or terminate your account immediately for violation of these Terms, fraudulent activity,
              or as required by law. In the event of termination for violation, no refund will be provided for the
              current billing period.
            </p>
          </div>

          {/* 10. Governing Law */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">10. Governing Law &amp; Disputes</h2>
            <p>
              These Terms are governed by the laws of <strong className="text-white">Ireland</strong>. Any disputes
              shall be subject to the exclusive jurisdiction of the Irish courts. If you are a consumer in the EU/EEA,
              you may also bring proceedings in your country of residence.
            </p>
            <p>
              We encourage amicable resolution. Please contact us at{" "}
              <strong className="text-white">support@raceintel.com</strong> before initiating formal proceedings.
            </p>
          </div>

          {/* 11. Miscellaneous */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">11. Miscellaneous</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in effect.</li>
              <li><strong>No Waiver:</strong> Failure to enforce any provision does not constitute a waiver.</li>
              <li><strong>Assignment:</strong> You may not assign these Terms. We may assign them in connection with a merger, acquisition, or sale of assets.</li>
              <li><strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy and Responsible Gambling page, constitute the entire agreement between you and RaceIntel.</li>
              <li><strong>Force Majeure:</strong> We are not liable for delays or failures caused by events beyond our reasonable control.</li>
            </ul>
          </div>

          <div className="pt-8 border-t border-white/[0.06]">
            <h2 className="text-xl font-bold text-white mb-3">12. Contact</h2>
            <p>
              <strong className="text-white">Email:</strong> support@raceintel.com<br />
              <strong className="text-white">Legal notices:</strong> legal@raceintel.com<br />
              <strong className="text-white">Registered in:</strong> Ireland
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}