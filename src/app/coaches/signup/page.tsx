'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { coachSignupSchema } from '@/lib/validations/coach';
import { signupCoach } from './actions';

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  school: string;
  title: string;
  division: string;
  conference: string;
};

const initialForm: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  school: '',
  title: '',
  division: '',
  conference: '',
};

export default function CoachSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      // Client-side validation
      const parsed = coachSignupSchema.safeParse(form);
      if (!parsed.success) {
        const errors: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const field = issue.path[0]?.toString();
          if (field && !errors[field]) errors[field] = issue.message;
        }
        setFieldErrors(errors);
        setLoading(false);
        return;
      }

      // Server action
      const result = await signupCoach(parsed.data);

      if (result.error) {
        if (result.error.includes('.edu')) {
          setFieldErrors({ email: result.error });
        } else {
          setError(result.error);
        }
        setLoading(false);
        return;
      }

      // Sign in to set session cookie
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) {
        router.push('/login');
        return;
      }

      router.push('/coaches/verify');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0A10] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/coaches" className="text-[#C9A84C] text-sm font-semibold tracking-wider uppercase hover:text-[#E0C878] transition-colors">
            ← Back to Coaches
          </Link>
          <h1 className="font-heading text-3xl font-bold text-white mt-4 mb-2">
            Create Coach Account
          </h1>
          <p className="text-sm text-gray-400">
            Free for verified college coaches. .edu email required.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 md:p-8">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">First Name</label>
                <input className="input" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required />
                {fieldErrors.firstName && <p className="text-xs text-red-400 mt-1">{fieldErrors.firstName}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Last Name</label>
                <input className="input" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required />
                {fieldErrors.lastName && <p className="text-xs text-red-400 mt-1">{fieldErrors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Email (.edu required)</label>
              <input type="email" className="input" placeholder="you@university.edu" value={form.email} onChange={(e) => update('email', e.target.value)} required />
              {fieldErrors.email && <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Password</label>
              <input type="password" className="input" placeholder="Min 8 chars, 1 uppercase, 1 number" value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={8} />
              {fieldErrors.password && <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>}
            </div>

            {/* School */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">School / University</label>
              <input className="input" placeholder="e.g. Wichita State University" value={form.school} onChange={(e) => update('school', e.target.value)} required />
              {fieldErrors.school && <p className="text-xs text-red-400 mt-1">{fieldErrors.school}</p>}
            </div>

            {/* Title + Division */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Title</label>
                <select className="input" value={form.title} onChange={(e) => update('title', e.target.value)} required>
                  <option value="">Select title</option>
                  <option value="Head Coach">Head Coach</option>
                  <option value="Assistant Coach">Assistant Coach</option>
                  <option value="Volunteer Coach">Volunteer Coach</option>
                </select>
                {fieldErrors.title && <p className="text-xs text-red-400 mt-1">{fieldErrors.title}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Division</label>
                <select className="input" value={form.division} onChange={(e) => update('division', e.target.value)} required>
                  <option value="">Select division</option>
                  <option value="D1">D1</option>
                  <option value="D2">D2</option>
                  <option value="D3">D3</option>
                  <option value="NAIA">NAIA</option>
                  <option value="JUCO">JUCO</option>
                </select>
                {fieldErrors.division && <p className="text-xs text-red-400 mt-1">{fieldErrors.division}</p>}
              </div>
            </div>

            {/* Conference */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Conference <span className="text-gray-600">(optional)</span></label>
              <input className="input" placeholder="e.g. American Athletic Conference" value={form.conference} onChange={(e) => update('conference', e.target.value)} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-[#1C0A14] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(201,168,76,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
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
                'Create Coach Account'
              )}
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-500 text-center">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-[#C9A84C] transition-colors">Terms</Link> and{' '}
            <Link href="/privacy" className="underline hover:text-[#C9A84C] transition-colors">Privacy Policy</Link>.
          </p>
        </div>

        <p className="mt-6 text-sm text-gray-500 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-[#C9A84C] hover:text-[#E0C878] font-semibold transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
