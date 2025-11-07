import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Briefcase, Calendar, Home, ChevronRight, UserPlus, Search, MessageSquare } from 'lucide-react'

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

  const howItWorksSteps = [
    {
      icon: <UserPlus className="w-8 h-8 text-accent-green" />,
      title: "1. Create Your Profile",
      description: "Sign up in minutes and tell us about yourself, your interests, and where you are in the UK."
    },
    {
      icon: <Search className="w-8 h-8 text-accent-green" />,
      title: "2. Explore & Discover",
      description: "Browse job listings, upcoming events, trusted services, and connect with other members."
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-accent-green" />,
      title: "3. Engage & Grow",
      description: "Participate in forums, share your experiences, and contribute to a thriving diaspora community."
    },
  ];

  const featuredContent = [
    {
      type: "Article",
      title: "Navigating UK Immigration as a Kenyan",
      description: "An essential guide for new arrivals and those looking to extend their stay.",
      link: "#",
      image: "/placeholder-article.jpg"
    },
    {
      type: "Event",
      title: "Annual Kenyan Diaspora Gala 2025",
      description: "Join us for a night of celebration, networking, and cultural showcase.",
      link: "#",
      image: "/placeholder-event.jpg"
    },
    {
      type: "Job Success Story",
      title: "From Nairobi to NHS: My Journey as a Nurse",
      description: "Hear from Sarah Wanjiru on her successful transition to working in the UK healthcare system.",
      link: "#",
      image: "/placeholder-job.jpg"
    },
    {
      type: "Community Story",
      title: "Building a Home Away From Home: The Kenyan Community Garden",
      description: "Discover how a group of volunteers transformed an unused plot into a vibrant community space.",
      link: "#",
      image: "/placeholder-community-garden.jpg"
    },
    {
      type: "Volunteer Spotlight",
      title: "Meet John: Bridging Gaps Through Mentorship",
      description: "John shares his passion for guiding new Kenyan graduates in the UK job market.",
      link: "/blog/meet-john-mentorship",
      image: "/placeholder-john.jpg"
    },
  ];

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

      {/* How It Works Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12 text-text-primary">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center p-6">
                <div className="mb-4 p-4 rounded-full bg-blue-100 text-blue-600">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-text-primary">{step.title}</h3>
                <p className="text-text-secondary">{step.description}</p>
              </div>
            ))}
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

      {/* Featured Content Section */}
      <section className="bg-neutral-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-text-primary">Featured Content & Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredContent.map((item, index) => (
              <Card key={index} className="bg-white border-neutral-200 hover:shadow-lg transition-shadow">
                <img src={item.image} alt={item.title} className="w-full h-48 object-cover rounded-t-lg" />
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-2 bg-accent-green/20 text-accent-green">{item.type}</Badge>
                  <h3 className="text-xl font-semibold mb-2 text-text-primary">{item.title}</h3>
                  <p className="text-text-secondary mb-4">{item.description}</p>
                  <Link href={item.link} passHref>
                    <Button variant="link" className="p-0 text-accent-green hover:text-green-700">
                      Read More <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
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