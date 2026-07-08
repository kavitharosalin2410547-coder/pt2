import { AuthForm } from '../components/forms/AuthForm';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07070f] px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="mt-1 text-sm text-slate-400">Start your placement preparation journey</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6 backdrop-blur">
          <AuthForm mode="signup" />
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
