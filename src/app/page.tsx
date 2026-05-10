import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, MapPin, Users, Briefcase, Calendar, Handshake } from 'lucide-react'

const communities = [
  { name: 'Kenyan', flag: '🇰🇪', members: '2.4k' },
  { name: 'Nigerian', flag: '🇳🇬', members: '3.1k' },
  { name: 'Ghanaian', flag: '🇬🇭', members: '1.8k' },
  { name: 'Zimbabwean', flag: '🇿🇼', members: '900' },
  { name: 'South African', flag: '🇿🇦', members: '1.2k' },
  { name: 'Somali', flag: '🇸🇴', members: '1.5k' },
  { name: 'Ugandan', flag: '🇺🇬', members: '780' },
  { name: 'Caribbean', flag: '🇯🇲', members: '2.8k' },
]

const ukCities = [
  { name: 'London', count: '4,200+' },
  { name: 'Birmingham', count: '1,100+' },
  { name: 'Manchester', count: '890+' },
  { name: 'Bristol', count: '520+' },
  { name: 'Leeds', count: '430+' },
  { name: 'Edinburgh', count: '310+' },
]

const recentActivity = [
  {
    type: 'job',
    text: 'Senior Developer role at Monzo — visa sponsorship available',
    time: '2h ago',
    community: '🇳🇬',
  },
  {
    type: 'event',
    text: 'Jollof & Nyama Choma Night — Manchester, 24 May',
    time: '4h ago',
    community: '🇬🇭🇰🇪',
  },
  {
    type: 'service',
    text: 'New immigration solicitor verified in Birmingham',
    time: '6h ago',
    community: '🇿🇼',
  },
  {
    type: 'connection',
    text: '23 new members joined from London this week',
    time: '1d ago',
    community: '🌍',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero — editorial, confident, warm */}
      <section className="relative overflow-hidden bg-[var(--clay)] text-[var(--clay-100)] pattern-kente">
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Message */}
            <div>
              <p className="text-[var(--gold-light)] font-medium text-sm uppercase tracking-widest mb-6">
                For diaspora communities in the UK
              </p>
              <h1 className="text-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl mb-6">
                Your people are
                <br />
                <span className="text-[var(--terracotta-light)]">already here.</span>
              </h1>
              <p className="text-lg text-[var(--clay-300)] max-w-lg mb-10 leading-relaxed">
                Find people from your hometown, your university, your field — in your UK city.
                Share experiences, attend events, help each other settle. One platform for every
                African and Caribbean community in Britain.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-[var(--terracotta)] hover:bg-[var(--terracotta-light)] text-white px-8 h-12 text-base font-semibold"
                  asChild
                >
                  <Link href="/signup">
                    Join your community
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  className="bg-transparent border border-[var(--clay-500)] text-white hover:bg-[var(--clay-700)] h-12 text-base shadow-none"
                  asChild
                >
                  <Link href="/events">Browse what&apos;s happening</Link>
                </Button>
              </div>
            </div>

            {/* Right — Live activity feed */}
            <div className="hidden lg:block">
              <div className="bg-[var(--clay-800)]/80 backdrop-blur-sm border border-[var(--clay-700)] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-[var(--clay-300)] uppercase tracking-wider">
                    Happening now
                  </h3>
                  <span className="flex items-center gap-1.5 text-xs text-[var(--forest-light)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--forest-light)] animate-pulse" />
                    Live
                  </span>
                </div>
                <div className="space-y-4">
                  {recentActivity.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--clay-700)]/50 transition-colors"
                    >
                      <span className="text-xl flex-shrink-0 mt-0.5">{item.community}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--clay-200)] leading-snug">{item.text}</p>
                        <p className="text-xs text-[var(--clay-500)] mt-1">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Diagonal cut at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[var(--clay-50)]" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }} />
      </section>

      {/* Communities strip */}
      <section className="bg-[var(--clay-50)] py-16 border-b border-[var(--clay-200)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10">
            <h2 className="text-display text-2xl sm:text-3xl text-[var(--clay)]">
              Find your community
            </h2>
            <p className="text-[var(--clay-500)] text-sm mt-2 sm:mt-0">
              8 active diaspora communities and growing
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {communities.map((community) => (
              <Link
                key={community.name}
                href={`/communities/${community.name.toLowerCase()}`}
                className="group flex flex-col items-center p-4 rounded-xl border border-[var(--clay-200)] bg-white hover:border-[var(--terracotta)]/30 hover:shadow-md transition-all duration-200"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {community.flag}
                </span>
                <span className="text-sm font-medium text-[var(--clay)] text-center">
                  {community.name}
                </span>
                <span className="text-xs text-[var(--clay-500)] mt-0.5">
                  {community.members}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What you get — asymmetric grid */}
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl mb-16">
            <h2 className="text-display text-3xl sm:text-4xl text-[var(--clay)] mb-4">
              Everything the diaspora needs,
              <br />
              <span className="text-[var(--terracotta)]">in one place.</span>
            </h2>
            <p className="text-[var(--clay-600)] text-lg">
              Built by diaspora, for diaspora. Not another generic job board.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Large card — Community Connection (primary feature) */}
            <div className="lg:col-span-2 group relative overflow-hidden rounded-2xl bg-[var(--clay)] p-8 lg:p-10 text-white">
              <div className="relative z-10">
                <Users className="h-8 w-8 text-[var(--gold-light)] mb-4" />
                <h3 className="text-display text-2xl mb-3">Find your people</h3>
                <p className="text-[var(--clay-300)] max-w-md mb-6">
                  Connect with people from your country, your city back home, or your field.
                  Whether you just arrived or you&apos;ve been here for years — your community is waiting.
                  Mentors, flatmates, football teammates, business partners.
                </p>
                <Link
                  href="/connections"
                  className="inline-flex items-center text-[var(--gold-light)] font-medium hover:text-[var(--gold)] transition-colors"
                >
                  Start connecting <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--terracotta)]/10 rounded-full blur-3xl" />
            </div>

            {/* Forums & advice */}
            <div className="group rounded-2xl border border-[var(--clay-200)] p-8 hover:border-[var(--terracotta)]/30 hover:shadow-lg transition-all">
              <svg className="h-8 w-8 text-[var(--terracotta)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <h3 className="text-display text-xl mb-3 text-[var(--clay)]">Forums & advice</h3>
              <p className="text-[var(--clay-600)] text-sm mb-4">
                Visa questions, school recommendations, sending money home, tax advice — the conversations that actually matter.
              </p>
              <Link href="/forums" className="inline-flex items-center text-[var(--terracotta)] text-sm font-medium">
                Join the conversation <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Events */}
            <div className="group rounded-2xl border border-[var(--clay-200)] p-8 hover:border-[var(--terracotta)]/30 hover:shadow-lg transition-all">
              <Calendar className="h-8 w-8 text-[var(--gold)] mb-4" />
              <h3 className="text-display text-xl mb-3 text-[var(--clay)]">Events that feel like home</h3>
              <p className="text-[var(--clay-600)] text-sm mb-4">
                Cultural nights, sports watch parties, community gatherings, professional meetups. Sorted by your city.
              </p>
              <Link href="/events" className="inline-flex items-center text-[var(--gold)] text-sm font-medium">
                See what&apos;s on <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Services */}
            <div className="group rounded-2xl border border-[var(--clay-200)] p-8 hover:border-[var(--terracotta)]/30 hover:shadow-lg transition-all">
              <Handshake className="h-8 w-8 text-[var(--forest)] mb-4" />
              <h3 className="text-display text-xl mb-3 text-[var(--clay)]">Trusted services</h3>
              <p className="text-[var(--clay-600)] text-sm mb-4">
                Immigration lawyers, accountants, driving instructors, hairdressers — vetted by the community, not algorithms.
              </p>
              <Link href="/services" className="inline-flex items-center text-[var(--forest)] text-sm font-medium">
                Find a service <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Jobs — positioned as a bonus, not the focus */}
            <div className="group rounded-2xl border border-[var(--clay-200)] p-8 hover:border-[var(--terracotta)]/30 hover:shadow-lg transition-all">
              <Briefcase className="h-8 w-8 text-[var(--indigo)] mb-4" />
              <h3 className="text-display text-xl mb-3 text-[var(--clay)]">Diaspora-friendly jobs</h3>
              <p className="text-[var(--clay-600)] text-sm mb-4">
                Employers who understand visa sponsorship and value international experience. A job board that gets it.
              </p>
              <Link href="/jobs" className="inline-flex items-center text-[var(--indigo)] text-sm font-medium">
                Browse opportunities <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* UK Cities — location matters */}
      <section className="bg-[var(--clay-100)] py-20 pattern-kente">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-display text-3xl sm:text-4xl text-[var(--clay)] mb-3">
                Across the UK
              </h2>
              <p className="text-[var(--clay-600)] text-lg">
                Your city, your people. Community is local.
              </p>
            </div>
            <Link
              href="/search"
              className="text-[var(--terracotta)] font-medium text-sm mt-4 md:mt-0 inline-flex items-center"
            >
              Find people near you <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ukCities.map((city) => (
              <Link
                key={city.name}
                href={`/search?city=${city.name.toLowerCase()}`}
                className="group bg-white rounded-xl p-5 border border-[var(--clay-200)] hover:border-[var(--terracotta)]/40 hover:shadow-md transition-all text-center"
              >
                <MapPin className="h-5 w-5 text-[var(--terracotta)] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-semibold text-[var(--clay)]">{city.name}</div>
                <div className="text-xs text-[var(--clay-500)] mt-1">{city.count} members</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof — real voices, not stock quotes */}
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-display text-3xl sm:text-4xl text-[var(--clay)] mb-12">
            From the community
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <blockquote className="border-l-4 border-[var(--terracotta)] pl-6">
              <p className="text-editorial text-lg text-[var(--clay-700)] mb-4">
                &ldquo;Found my flat, my job, and my Saturday football team through Jamii. It&apos;s basically
                what happens when you put all the WhatsApp groups in one place.&rdquo;
              </p>
              <footer className="text-sm">
                <span className="font-semibold text-[var(--clay)]">James O.</span>
                <span className="text-[var(--clay-500)]"> · Kenyan, Software Engineer, London</span>
              </footer>
            </blockquote>

            <blockquote className="border-l-4 border-[var(--gold)] pl-6">
              <p className="text-editorial text-lg text-[var(--clay-700)] mb-4">
                &ldquo;I moved to Manchester from Accra and knew nobody. Within a week I had invites
                to three events and a mentor in my field. This is what community should be.&rdquo;
              </p>
              <footer className="text-sm">
                <span className="font-semibold text-[var(--clay)]">Ama K.</span>
                <span className="text-[var(--clay-500)]"> · Ghanaian, Nurse, Manchester</span>
              </footer>
            </blockquote>

            <blockquote className="border-l-4 border-[var(--forest)] pl-6">
              <p className="text-editorial text-lg text-[var(--clay-700)] mb-4">
                &ldquo;The services directory saved me when I needed an immigration lawyer who understood
                the Zimbabwe-specific complexities. Found one in Birmingham the same day.&rdquo;
              </p>
              <footer className="text-sm">
                <span className="font-semibold text-[var(--clay)]">Tafara M.</span>
                <span className="text-[var(--clay-500)]"> · Zimbabwean, Accountant, Birmingham</span>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* CTA — bold, simple */}
      <section className="bg-[var(--clay)] text-white py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--terracotta)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-[var(--gold)]/10 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-display text-3xl sm:text-4xl lg:text-5xl mb-6">
            Home is where your
            <br />
            people are.
          </h2>
          <p className="text-[var(--clay-300)] text-lg mb-10 max-w-xl mx-auto">
            Join thousands of diaspora community members building lives in the UK — together.
            Free to join. Always will be.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[var(--terracotta)] hover:bg-[var(--terracotta-light)] text-white px-8 h-12 text-base font-semibold"
              asChild
            >
              <Link href="/signup">
                Create your profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-transparent border border-[var(--clay-500)] text-white hover:bg-[var(--clay-700)] h-12 text-base shadow-none"
              asChild
            >
              <Link href="/about">Learn how it works</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
