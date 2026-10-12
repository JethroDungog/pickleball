import Link from 'next/link'
import { ShieldCheck, ArrowLeft, Footprints, Clock, CloudRain } from 'lucide-react'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Terms of Service & Facility Rules | PickCourt',
  description: 'Official PickCourt facility rules, booking terms, cancellation policies, and liability waivers.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--apple-bg)] text-[var(--apple-text)] pt-24 pb-16 font-body antialiased transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--apple-subtext)] hover:text-[var(--apple-text)] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Facility</span>
        </Link>

        {/* Header */}
        <div className="border-b border-[var(--apple-border)] pb-8 mb-10 space-y-4">
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-[var(--apple-text)] tracking-tight">
            Terms of Service & Court Rules
          </h1>
          <p className="text-sm text-[var(--apple-subtext)] leading-relaxed max-w-2xl">
            Effective Date: October 10, 2026. By accessing PickCourt facilities, website, or reserving a court, you
            agree to comply strictly with the following facility standards and regulations.
          </p>
        </div>

        {/* Quick Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12">
          <div className="p-5 rounded-2xl bg-[var(--apple-card)] border border-[var(--apple-border)] shadow-sm space-y-2">
            <Footprints className="w-5 h-5 text-[#34c759]" />
            <p className="text-xs font-semibold text-[var(--apple-text)]">Footwear Directive</p>
            <p className="text-xs text-[var(--apple-subtext)] leading-relaxed">Non-marking court shoes mandatory on all acrylic and cushioned courts.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[var(--apple-card)] border border-[var(--apple-border)] shadow-sm space-y-2">
            <Clock className="w-5 h-5 text-[#0071e3]" />
            <p className="text-xs font-semibold text-[var(--apple-text)]">24-Hour Cutoff</p>
            <p className="text-xs text-[var(--apple-subtext)] leading-relaxed">Full cancellation refund permitted up to 24 hours prior to reserved start time.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[var(--apple-card)] border border-[var(--apple-border)] shadow-sm space-y-2">
            <CloudRain className="w-5 h-5 text-[#ff9f0a]" />
            <p className="text-xs font-semibold text-[var(--apple-text)]">Weather Guarantee</p>
            <p className="text-xs text-[var(--apple-subtext)] leading-relaxed">Automated facility credits issued for weather holds on outdoor courts.</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-[var(--apple-subtext)]">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-[var(--apple-text)] flex items-center gap-2">
              <span className="text-[#34c759] font-mono text-xs">01</span> Court Rules & Equipment Standards
            </h2>
            <div className="p-6 rounded-2xl bg-[var(--apple-card)] border border-[var(--apple-border)] space-y-3 shadow-sm text-xs sm:text-sm">
              <p>
                <strong className="text-[var(--apple-text)]">Non-Marking Footwear Policy:</strong> All players must wear clean, dry, non-marking athletic
                court shoes. Running shoes, cleated footwear, work boots, or any black-soled shoes that scuff acrylic
                resurfacing are strictly forbidden. Players found wearing improper footwear will be required to change
                or forfeit their reservation without refund.
              </p>
              <p>
                <strong className="text-[var(--apple-text)]">Permitted Gear:</strong> Only USA Pickleball (USAP) approved paddles and official indoor/outdoor
                pickleballs may be used during open and reserved play.
              </p>
              <p>
                <strong className="text-[var(--apple-text)]">Food & Beverages:</strong> Only sealed water bottles and sports drinks in shatterproof
                containers are allowed on the playing surface. Chewing gum, open foods, glass bottles, and alcoholic
                beverages are strictly prohibited on courts.
              </p>
              <p>
                <strong className="text-[var(--apple-text)]">Court Capacity:</strong> Maximum four (4) active players per court at any time, with up to two (2)
                designated rotational substitutes waiting in the sideline player bench zone.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-[var(--apple-text)] flex items-center gap-2">
              <span className="text-[#34c759] font-mono text-xs">02</span> Reservation & Cancellation Cutoffs
            </h2>
            <div className="p-6 rounded-2xl bg-[var(--apple-card)] border border-[var(--apple-border)] space-y-3 shadow-sm text-xs sm:text-sm">
              <p>
                <strong className="text-[var(--apple-text)]">Advance Booking:</strong> Registered members and public patrons may reserve courts up to fourteen
                (14) calendar days in advance via our digital booking system. Bookings are confirmed on a first-come,
                first-served basis with real-time atomic concurrency locking.
              </p>
              <p>
                <strong className="text-[var(--apple-text)]">Duration Constraints:</strong> Reservations can be made in one-hour increments, up to a maximum
                of four (4) consecutive hours per booking block per user.
              </p>
              <p>
                <strong className="text-[var(--apple-text)]">24-Hour Self-Service Cancellation:</strong> Cancellations completed at least twenty-four (24)
                hours before the scheduled start time receive a 100% full refund or facility credit. Cancellations made
                under 24 hours from start time are non-refundable to protect facility operations and scheduling integrity.
              </p>
              <p>
                <strong className="text-[var(--apple-text)]">No-Show Policy:</strong> If a court is unoccupied 15 minutes past the reserved start hour
                without prior notice, PickCourt reserves the right to release the court to standby players. Repeated
                no-shows (3 within 60 days) will incur account booking restrictions.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-[var(--apple-text)] flex items-center gap-2">
              <span className="text-[#34c759] font-mono text-xs">03</span> Inclement Weather & Rain Guarantees
            </h2>
            <div className="p-6 rounded-2xl bg-[var(--apple-card)] border border-[var(--apple-border)] space-y-3 shadow-sm text-xs sm:text-sm">
              <p>
                <strong className="text-[var(--apple-text)]">Indoor Courts (Courts 1 & 2):</strong> Indoor play is fully climate-controlled and operates 24/7
                regardless of meteorological conditions. Weather-based cancellation requests are not granted for indoor
                courts.
              </p>
              <p>
                <strong className="text-[var(--apple-text)]">Outdoor Courts (Courts 3 & 4):</strong> If outdoor courts become wet or hazardous due to rain,
                typhoon, or heavy moisture, PickCourt management will issue a facility Weather Hold. In such events,
                users receive an automatic full credit towards future reservations.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-[var(--apple-text)] flex items-center gap-2">
              <span className="text-[#34c759] font-mono text-xs">04</span> Assumption of Risk & Liability Waiver
            </h2>
            <div className="p-6 rounded-2xl bg-[var(--apple-card)] border border-[var(--apple-border)] space-y-3 shadow-sm text-xs sm:text-sm">
              <p>
                Pickleball is an active sport involving rapid acceleration, lateral movements, and athletic competition.
                By booking or entering the facility, you voluntarily assume all inherent risks of physical injury,
                illness, slips, or property damage.
              </p>
              <p>
                PickCourt, its directors, employees, and affiliates shall not be liable for any direct or indirect
                injuries sustained on facility premises. Users are solely responsible for ensuring they are in adequate
                physical condition for athletic exertion.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-[var(--apple-text)] flex items-center gap-2">
              <span className="text-[#34c759] font-mono text-xs">05</span> Payments & Facility Pricing in Philippine Peso (₱)
            </h2>
            <div className="p-6 rounded-2xl bg-[var(--apple-card)] border border-[var(--apple-border)] space-y-3 shadow-sm text-xs sm:text-sm">
              <p>
                All court fees are due in full at the time of reservation in Philippine Peso (₱). Standard hourly rates are governed by posted
                facility rates (₱350/hr for standard outdoor, ₱500/hr for premium indoor air-conditioned courts). Peak hours and holiday rates
                are subject to dynamic schedule adjustments as approved by management.
              </p>
            </div>
          </section>
        </div>

        {/* Contact info footer */}
        <div className="mt-16 pt-8 border-t border-[var(--apple-border)] text-center text-xs text-[var(--apple-subtext)]">
          For policy inquiries, weather updates, or group reservations, contact{' '}
          <a href="mailto:support@pickcourt.com" className="text-[#0071e3] hover:underline font-medium">
            support@pickcourt.com
          </a>
          .
        </div>
      </div>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  )
}
