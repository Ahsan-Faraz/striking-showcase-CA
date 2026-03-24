'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { registerSchema } from '@/lib/validations/auth';

type RoleSelection = 'ATHLETE' | 'COACH';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [role, setRole] = useState<RoleSelection>('ATHLETE');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState('');
  const [classYear, setClassYear] = useState('2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate with Zod client-side first
      const parsed = registerSchema.safeParse({
        email,
        password,
        role,
        firstName,
        lastName,
        classYear: role === 'ATHLETE' ? parseInt(classYear) : undefined,
        school: role === 'COACH' ? school : undefined,
      });

      if (!parsed.success) {
        setError(parsed.error.errors[0].message);
        return;
      }

      // Call the server-side API route for registration
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Registration failed. Please try again.');
        return;
      }

      // Sign in via Supabase client to set the session cookie
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Account was created but auto-sign-in failed — send to login
        router.push('/login');
        return;
      }

      // Redirect based on role
      if (role === 'ATHLETE') {
        router.push('/onboarding');
      } else {
        router.push('/portal');
      }
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
      },
    });
  };

  if (step === 'role') {
    return (
      <div>
        <h1 className="font-heading text-2xl font-bold text-center mb-1 text-[var(--text-primary)]">
          Join Striking Showcase
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] text-center mb-8">
          Select your account type to get started
        </p>

        <div className="space-y-3">
          {(['ATHLETE', 'COACH'] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r);
                setStep('form');
              }}
              className={cn(
                'w-full p-5 rounded-xl text-left transition-all duration-300 group relative overflow-hidden',
                'border border-[var(--border-primary)] bg-[var(--bg-card)]',
                'hover:border-maroon/50 hover:bg-[var(--bg-card-hover)] hover:-translate-y-0.5 hover:shadow-glow-maroon'
              )}
            >
              <div className="flex items-center gap-4 relative">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                     style={{ background: r === 'ATHLETE' ? 'linear-gradient(135deg, #660033, #880044)' : 'linear-gradient(135deg, #C9A84C, #A68A3E)' }}>
                  {r === 'ATHLETE' ? (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-heading text-lg font-bold text-[var(--text-primary)]">
                    {r === 'ATHLETE' ? 'Athlete' : 'College Coach'}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {r === 'ATHLETE'
                      ? 'Build your recruiting portfolio and get discovered'
                      : 'Discover and recruit talented bowlers'}
                  </p>
                </div>
                <svg className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-gold transition-colors group-hover:translate-x-1 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm text-[var(--text-tertiary)] text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-gold hover:text-gold-light font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setStep('role')}
        className="flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] hover:text-gold mb-5 transition-colors group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back
      </button>

      <h1 className="font-heading text-2xl font-bold text-center mb-1 text-[var(--text-primary)]">
        Create {role === 'ATHLETE' ? 'Athlete' : 'Coach'} Account
      </h1>
      <p className="text-sm text-[var(--text-tertiary)] text-center mb-8">
        {role === 'ATHLETE'
          ? '30-day free trial. No credit card required.'
          : 'Free for verified college coaches.'}
      </p>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="input"
              placeholder="First"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="input"
              placeholder="Last"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="regEmail" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <input
              id="regEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-11"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="regPassword" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <input
              id="regPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-11"
              placeholder="Min. 8 characters"
              required
              minLength={8}
            />
          </div>
        </div>

        {role === 'ATHLETE' ? (
          <div>
            <label htmlFor="classYear" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Graduation Year
            </label>
            <select
              id="classYear"
              value={classYear}
              onChange={(e) => setClassYear(e.target.value)}
              className="input"
            >
              {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label htmlFor="school" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              School / University
            </label>
            <input
              id="school"
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="input"
              placeholder="e.g. Wichita State University"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full relative overflow-hidden rounded-xl px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-maroon-900 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
          style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #E0C878 50%, #C9A84C 100%)' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating Account...
            </span>
          ) : (
            role === 'ATHLETE' ? 'Start Free Trial' : 'Create Coach Account'
          )}
        </button>
      </form>

      <p className="mt-4 text-xs text-[var(--text-tertiary)] text-center">
        By signing up, you agree to our{' '}
        <Link href="/terms" className="underline hover:text-gold transition-colors">Terms</Link> and{' '}
        <Link href="/privacy" className="underline hover:text-gold transition-colors">Privacy Policy</Link>.
      </p>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-[var(--border-primary)]" />
        <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">or</span>
        <div className="flex-1 h-px bg-[var(--border-primary)]" />
      </div>

      {/* Google OAuth — role is already selected at this point */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        className="w-full flex items-center justify-center gap-3 rounded-xl px-6 py-3.5 text-sm font-semibold border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-secondary)] transition-all duration-300"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Sign up with Google as {role === 'ATHLETE' ? 'Athlete' : 'Coach'}
      </button>

      <p className="mt-4 text-sm text-[var(--text-tertiary)] text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-gold hover:text-gold-light font-semibold transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
