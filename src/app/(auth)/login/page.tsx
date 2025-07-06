'use client'

import { useState } from 'react'

// Force dynamic rendering to avoid build-time Supabase initialization
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <Card className="w-full max-w-md bg-white border-neutral-200">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-accent-green rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">JC</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center text-text-primary">Welcome back!</CardTitle>
          <CardDescription className="text-center text-text-secondary">
            Sign in to your Jamii Connect account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-text-primary">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-neutral-300 focus:border-accent-green"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-text-primary">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-neutral-300 focus:border-accent-green"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-accent-green hover:bg-green-700 text-white"
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
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-text-muted">Or continue with</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full border-neutral-300 text-text-primary hover:bg-neutral-100" disabled>
            Continue with Google (Coming Soon)
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-accent-green hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
