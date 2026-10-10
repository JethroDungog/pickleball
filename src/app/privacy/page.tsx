import Link from 'next/link'
import { Lock, ArrowLeft, Database, Eye, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | PickCourt',
  description: 'How PickCourt collects, protects, and handles your booking data and personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-court-dark text-slate-200 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-neon-green transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Facility</span>
        </Link>

        {/* Header */}
        <div className="border-b border-white/10 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-bold uppercase tracking-wider mb-4">
            <Lock className="w-4 h-4" />
            <span>Data Protection Standards</span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight">
            PRIVACY POLICY
          </h1>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-2xl">
            Last Updated: October 10, 2026. PickCourt values your trust and is committed to protecting your personal
            and transactional information. This policy describes how we collect, store, and safeguard your data.
          </p>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12 text-sm leading-relaxed text-slate-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <span className="text-neon-cyan">01.</span> Information We Collect
            </h2>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <p>
                <strong>Account Information:</strong> When you register on PickCourt, we collect your full name, email
                address, encrypted authentication credentials, and optional telephone contact number.
              </p>
              <p>
                <strong>Reservation & Play History:</strong> We record court booking selections, chosen time slots, court
                locations, total amounts paid, booking notes, and cancellation records to maintain facility operations.
              </p>
              <p>
                <strong>Payment Credentials:</strong> Payment transactions are handled directly by PCI-DSS compliant
                payment providers (such as Stripe). PickCourt never stores or processes raw credit or debit card numbers
                on our local servers.
              </p>
              <p>
                <strong>Technical Diagnostics:</strong> We automatically receive basic request logs, device user agent, IP
                address, and session cookies necessary for authenticated state persistence.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <span className="text-neon-cyan">02.</span> How Your Information Is Used
            </h2>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <p>
                Your information is strictly utilized to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>Generate and deliver your interactive digital court access passes and QR confirmation codes.</li>
                <li>Prevent double-bookings and maintain real-time slot availability for other facility patrons.</li>
                <li>Issue critical facility updates, such as outdoor weather delays or emergency maintenance alerts.</li>
                <li>Process self-service cancellations and automated refunds according to facility rules.</li>
                <li>Enforce our athletic code of conduct, non-marking shoe compliance, and community safety.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <span className="text-neon-cyan">03.</span> Infrastructure & Third-Party Service Providers
            </h2>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <p>
                We do not sell, rent, or monetize your personal data. We partner exclusively with high-security
                infrastructure providers:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <div className="p-3 rounded-xl bg-court-dark border border-white/10">
                  <p className="font-semibold text-white text-xs">Supabase (PostgreSQL & Auth)</p>
                  <p className="text-xs text-slate-400 mt-0.5">Encrypted database storage, Row-Level Security (RLS), and authentication token management.</p>
                </div>
                <div className="p-3 rounded-xl bg-court-dark border border-white/10">
                  <p className="font-semibold text-white text-xs">Vercel Edge Network</p>
                  <p className="text-xs text-slate-400 mt-0.5">Global edge hosting and secure SSL/TLS server session termination.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <span className="text-neon-cyan">04.</span> Data Retention & Deletion Rights
            </h2>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <p>
                <strong>Retention Periods:</strong> Active account data is retained while your membership is valid.
                Completed reservation records and financial transactions are retained for three (3) years to comply with
                taxation, insurance audits, and legal accounting requirements.
              </p>
              <p>
                <strong>Right to Deletion:</strong> You may request immediate deletion of your user profile and marketing
                identifiers by emailing <a href="mailto:privacy@pickcourt.com" className="text-neon-cyan hover:underline">privacy@pickcourt.com</a>.
                Non-financial personal records will be purged within thirty (30) business days.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <span className="text-neon-cyan">05.</span> Cookie & Session Policy
            </h2>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <p>
                PickCourt utilizes essential, encrypted HTTP-only session cookies to authenticate users across server
                requests and maintain your reservation draft state. We do not deploy third-party advertising tracking
                pixels or invasive cross-site fingerprinting scripts.
              </p>
            </div>
          </section>
        </div>

        {/* Contact info footer */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-xs text-slate-500">
          Questions regarding data handling or privacy rights? Contact our Data Officer at{' '}
          <a href="mailto:privacy@pickcourt.com" className="text-neon-cyan hover:underline">
            privacy@pickcourt.com
          </a>
          .
        </div>
      </div>
    </div>
  )
}
