'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signInUser } from '@/lib/amplify/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { isSignedIn, nextStep } = await signInUser(email, password)

      if (isSignedIn) {
        toast.success('Welcome back!')
        router.push('/dashboard')
      } else if (nextStep) {
        toast.error('Additional authentication steps required')
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
            Welcome back to Jamii Connect
          </h1>
          <p className="text-[var(--clay-200)] text-lg leading-relaxed">
            Your home away from home. Reconnect with the Kenyan community in the UK,
            share experiences, and grow together.
          </p>
          <div className="pt-8 border-t border-[var(--clay-800)]">
            <p className="text-[var(--clay-300)] text-sm italic">
              &ldquo;Umoja ni nguvu&rdquo; &mdash; Unity is strength
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
              Sign in
            </h2>
            <p className="text-[var(--clay-600)]">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
                  Signing in...
                </>
              ) : (
                'Sign In'
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
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[var(--terracotta)] hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
