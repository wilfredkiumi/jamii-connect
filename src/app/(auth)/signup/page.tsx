'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signUpUser } from '@/lib/amplify/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { userId, isSignUpComplete, nextStep } = await signUpUser(email, password, firstName, lastName)

      if (isSignUpComplete) {
        toast.success('Account created successfully! Welcome to Jamii Connect.')
        router.push('/dashboard')
      } else if (nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
        toast.success('Account created! Please check your email to verify your account.')
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
      } else {
        toast.error('Account creation requires additional steps')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--clay)] flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 bg-[var(--terracotta)] rounded-full flex items-center justify-center mb-8">
            <span className="text-white font-bold text-3xl">JC</span>
          </div>
          <h1 className="text-display text-4xl font-bold text-white">
            Karibu! Join the community
          </h1>
          <p className="text-[var(--clay-200)] text-lg leading-relaxed">
            Become part of a vibrant network of Kenyans in the UK. Find events,
            connect with professionals, and stay rooted in your heritage.
          </p>
          <div className="pt-8 border-t border-[var(--clay-800)]">
            <p className="text-[var(--clay-300)] text-sm italic">
              &ldquo;Mtu ni watu&rdquo; &mdash; A person is people
            </p>
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center bg-[var(--clay-50)] px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile branding */}
          <div className="lg:hidden flex justify-center mb-4">
            <div className="w-16 h-16 bg-[var(--terracotta)] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">JC</span>
            </div>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-display text-3xl font-bold text-[var(--clay)]">
              Create your account
            </h2>
            <p className="text-[var(--clay-600)]">
              Connect with the Kenyan community in the UK
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[var(--clay-800)]">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="border-[var(--clay-200)] focus:border-[var(--terracotta)] focus:ring-[var(--terracotta)]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[var(--clay-800)]">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Kamau"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="border-[var(--clay-200)] focus:border-[var(--terracotta)] focus:ring-[var(--terracotta)]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--clay-800)]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-[var(--clay-200)] focus:border-[var(--terracotta)] focus:ring-[var(--terracotta)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[var(--clay-800)]">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="border-[var(--clay-200)] focus:border-[var(--terracotta)] focus:ring-[var(--terracotta)]"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[var(--terracotta)] hover:bg-[var(--terracotta-light)] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--clay-200)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--clay-50)] px-2 text-[var(--clay-400)]">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" className="w-full border-[var(--clay-200)] text-[var(--clay-800)] hover:bg-[var(--clay-100)]" disabled>
            Continue with Google (Coming Soon)
          </Button>

          <p className="text-sm text-[var(--clay-600)] text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--terracotta)] hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
