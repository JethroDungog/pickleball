import Link from 'next/link'
import { ShieldCheck, ArrowLeft, Footprints, Clock, CloudRain, AlertTriangle, CreditCard, UserCheck } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service & Facility Rules | PickCourt',
  description: 'Official PickCourt facility rules, booking terms, cancellation policies, and liability waivers.',
}

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Facility Agreement & Policy</span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight">
            TERMS OF SERVICE & COURT RULES
          </h1>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-2xl">
            Effective Date: October 10, 2026. By accessing PickCourt facilities, website, or reserving a court, you
            agree to comply strictly with the following facility standards and regulations.
          </p>
        </div>

        {/* Quick Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="p-4 rounded-xl bg-court-card border border-white/10">
            <Footprints className="w-5 h-5 text-neon-green mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider text-white">Footwear Directive</p>
            <p className="text-xs text-slate-400 mt-1">Non-marking court shoes mandatory on all hard & synthetic courts.</p>
          </div>
          <div className="p-4 rounded-xl bg-court-card border border-white/10">
            <Clock className="w-5 h-5 text-neon-cyan mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider text-white">24-Hour Cutoff</p>
            <p className="text-xs text-slate-400 mt-1">Full cancellation refund permitted up to 24 hours prior to start time.</p>
          </div>
          <div className="p-4 rounded-xl bg-court-card border border-white/10">
            <CloudRain className="w-5 h-5 text-amber-400 mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider text-white">Weather Guarantee</p>
            <p className="text-xs text-slate-400 mt-1">Automated facility credits issued for rain holds on outdoor courts.</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12 text-sm leading-relaxed text-slate-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <span className="text-neon-green">01.</span> Court Rules & Equipment Standards
            </h2>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <p>
                <strong>Non-Marking Footwear Policy:</strong> All players must wear clean, dry, non-marking athletic
                court shoes. Running shoes, cleated footwear, work boots, or any black-soled shoes that scuff acrylic
                resurfacing are strictly forbidden. Players found wearing improper footwear will be required to change
                or forfeit their reservation without refund.
              </p>
              <p>
                <strong>Permitted Gear:</strong> Only USA Pickleball (USAP) approved paddles and official indoor/outdoor
                pickleballs may be used during open and reserved play.
              </p>
              <p>
                <strong>Food & Beverages:</strong> Only sealed water bottles and sports drinks in shatterproof
                containers are allowed on the playing surface. Chewing gum, open foods, glass bottles, and alcoholic
                beverages are strictly prohibited on courts.
              </p>
              <p>
                <strong>Court Capacity:</strong> Maximum four (4) active players per court at any time, with up to two (2)
                designated rotational substitutes waiting in the sideline player bench zone.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <span className="text-neon-green">02.</span> Reservation & Cancellation Cutoffs
            </h2>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <p>
                <strong>Advance Booking:</strong> Registered members and public patrons may reserve courts up to fourteen
                (14) calendar days in advance via our digital booking system. Bookings are confirmed on a first-come,
                first-served basis with real-time atomic concurrency locking.
              </p>
              <p>
                <strong>Duration Constraints:</strong> Reservations can be made in one-hour increments, up to a maximum
                of four (4) consecutive hours per booking block per user.
              </p>
              <p>
                <strong>24-Hour Self-Service Cancellation:</strong> Cancellations completed at least twenty-four (24)
                hours before the scheduled start time receive a 100% full refund or facility credit. Cancellations made
                under 24 hours from start time are non-refundable to protect facility operations and scheduling integrity.
              </p>
              <p>
                <strong>No-Show Policy:</strong> If a court is unoccupied 15 minutes past the reserved start hour
                without prior notice, PickCourt reserves the right to release the court to standby players. Repeated
                no-shows (3 within 60 days) will incur account booking restrictions.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <span className="text-neon-green">03.</span> Inclement Weather & Rain Guarantees
            </h2>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <p>
                <strong>Indoor Courts (Courts 1 & 2):</strong> Indoor play is fully climate-controlled and operates 24/7
                regardless of meteorological conditions. Weather-based cancellation requests are not granted for indoor
                courts.
              </p>
              <p>
                <strong>Outdoor Courts (Courts 3 & 4):</strong> If outdoor courts become wet or hazardous due to rain,
                snow, lightning, or court moisture, PickCourt management will issue a facility Rain Hold. In such events,
                users receive an automatic full credit towards future reservations. If play has commenced and rain forces
                stoppage before 30 minutes of the session, a full 1-hour credit is granted.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <span className="text-neon-green">04.</span> Assumption of Risk & Liability Waiver
            </h2>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <p>
                Pickleball is an active sport involving rapid acceleration, lateral movements, and athletic competition.
                By booking or entering the facility, you voluntarily assume all inherent risks of physical injury,
                illness, slip and falls, or property damage.
              </p>
              <p>
                PickCourt, its directors, employees, and affiliates shall not be liable for any direct, indirect, or
                consequential injuries sustained on facility premises. Users are solely responsible for ensuring they are
                in adequate physical condition for athletic exertion.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <span className="text-neon-green">05.</span> Payments, Fees & Disputed Charges
            </h2>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <p>
                All court fees are due in full at the time of reservation. Standard hourly rates are governed by posted
                facility rates ($25/hr for standard outdoor, $35/hr for premium indoor air-conditioned courts). Rates are
                subject to adjustment by management with prior public disclosure.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <span className="text-neon-green">06.</span> Code of Conduct & Account Suspension
            </h2>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <p>
                PickCourt enforces zero tolerance for abusive language, paddle-throwing, unsportsmanlike conduct, or
                harassment toward staff or other patrons. Violation of facility conduct rules results in immediate removal
                without refund and potential permanent revocation of booking privileges.
              </p>
            </div>
          </section>
        </div>

        {/* Contact info footer */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-xs text-slate-500">
          For policy inquiries, weather updates, or group bookings, contact{' '}
          <a href="mailto:support@pickcourt.com" className="text-neon-green hover:underline">
            support@pickcourt.com
          </a>
          .
        </div>
      </div>
    </div>
  )
}
