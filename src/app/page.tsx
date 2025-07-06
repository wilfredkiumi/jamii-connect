import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Briefcase, Calendar, Home, ChevronRight } from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: <Users className="w-8 h-8 text-accent-green" />,
      title: "Connect with Community",
      description: "Join thousands of Kenyans in the UK. Share experiences, ask questions, and build lasting friendships."
    },
    {
      icon: <Briefcase className="w-8 h-8 text-accent-green" />,
      title: "Find Opportunities",
      description: "Discover jobs from diaspora-friendly employers who value your unique background and skills."
    },
    {
      icon: <Calendar className="w-8 h-8 text-accent-green" />,
      title: "Attend Events",
      description: "From nyama choma gatherings to professional networking, never miss out on community events."
    },
    {
      icon: <Home className="w-8 h-8 text-accent-green" />,
      title: "Trusted Services",
      description: "Find verified Kenyan professionals - lawyers, accountants, and businesses you can trust."
    }
  ]

  const testimonials = [
    {
      name: "Sarah Wanjiru",
      role: "NHS Nurse, Manchester",
      quote: "Finally, a place where I can connect with other Kenyans who understand the journey. Found my current flat through a connection here!"
    },
    {
      name: "James Ochieng",
      role: "Software Engineer, London",
      quote: "The job board helped me find a company that actually values diversity. Plus, I've made genuine friends through the meetups."
    }
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section - 60% neutral background */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-accent-green rounded-full flex items-center justify-center">
            <span className="text-white font-bold">JC</span>
          </div>
          <span className="text-xl font-bold text-text-primary">Jamii Connect</span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="text-text-secondary hover:text-text-primary" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button className="bg-accent-green hover:bg-green-700 text-white" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-text-primary">
          Karibu to Your UK
          <span className="text-accent-green"> Kenyan Community</span>
        </h1>
        <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
          Connect with fellow Kenyans, find opportunities, and build your life in the UK with the support of your community.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-accent-green hover:bg-green-700 text-white" asChild>
            <Link href="/signup">
              Join the Community
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-neutral-300 text-text-primary hover:bg-neutral-100" asChild>
            <Link href="#features">Learn More</Link>
          </Button>
        </div>

        {/* Stats - Using secondary colors */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
          <div className="bg-secondary-green rounded-lg p-4">
            <div className="text-3xl font-bold text-accent-green">2,500+</div>
            <div className="text-text-secondary">Active Members</div>
          </div>
          <div className="bg-secondary-green rounded-lg p-4">
            <div className="text-3xl font-bold text-accent-green">150+</div>
            <div className="text-text-secondary">Monthly Jobs</div>
          </div>
          <div className="bg-secondary-green rounded-lg p-4">
            <div className="text-3xl font-bold text-accent-green">50+</div>
            <div className="text-text-secondary">Events Monthly</div>
          </div>
        </div>
      </section>

      {/* Features Section - 30% secondary background */}
      <section id="features" className="bg-secondary-warmth py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-text-primary">Everything You Need in One Place</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white border-neutral-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-text-primary">{feature.title}</h3>
                  <p className="text-text-secondary">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Back to neutral */}
      <section className="bg-neutral-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-text-primary">What Our Community Says</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border-neutral-200">
                <CardContent className="p-6">
                  <p className="text-text-secondary mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div>
                    <div className="font-semibold text-text-primary">{testimonial.name}</div>
                    <div className="text-sm text-text-muted">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Secondary background for contrast */}
      <section className="bg-secondary-green py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-text-primary">Ready to Join Your Community?</h2>
          <p className="text-xl text-text-secondary mb-8">
            Start connecting with fellow Kenyans in the UK today.
          </p>
          <Button size="lg" className="bg-accent-green hover:bg-green-700 text-white" asChild>
            <Link href="/signup">
              Create Your Free Account
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}