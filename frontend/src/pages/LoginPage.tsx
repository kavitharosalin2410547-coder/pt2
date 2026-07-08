import { AuthForm } from '../components/forms/AuthForm';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LoginPage() {
  return (
    <main className="flex min-h-screen bg-[#07070f]">
      {/* Left — hero panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-brand-gradient p-12 lg:flex" style={{background:'linear-gradient(145deg,#1e1b4b 0%,#312e81 40%,#4338ca 80%,#6366f1 100%)'}}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Placement Tracker Pro</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-300">Your edge in campus placements</p>
          </div>
        </div>

        <div>
          <h2 className="text-5xl font-black leading-tight tracking-tight text-white">
            Land your<br />
            <span className="text-indigo-200">dream job.</span>
          </h2>
          <p className="mt-6 max-w-sm text-base text-indigo-200/80">
            Track DSA, Core CS, placements, mock interviews, and resume scoring — all in one intelligent workspace.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            {['DSA Tracker', 'AI Assistant', 'ATS Scoring', 'Mock Interviews'].map((f) => (
              <span key={f} className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur">
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-indigo-300/50">© 2025 Placement Tracker Pro</p>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <p className="text-base font-bold text-white">Placement Tracker Pro</p>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to your workspace</p>

          <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6 backdrop-blur">
            <AuthForm mode="login" />
          </div>

          <p className="mt-5 text-center text-sm text-slate-500">
            No account?{' '}
            <Link to="/signup" className="font-semibold text-brand-400 hover:text-brand-300">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
