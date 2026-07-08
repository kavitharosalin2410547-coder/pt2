import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

type AuthFormProps = {
  mode: 'login' | 'signup';
};

function DarkInput({
  label,
  type = 'text',
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'name'}
      />
    </div>
  );
}

export function AuthForm({ mode }: AuthFormProps) {
  const { login, signup } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === 'signup';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSignup && name.trim().length < 2) {
      notify('Name must be at least 2 characters.', 'error');
      return;
    }
    if (!email.includes('@')) {
      notify('Enter a valid email address.', 'error');
      return;
    }
    if (password.length < (isSignup ? 8 : 1)) {
      notify(isSignup ? 'Password must be at least 8 characters.' : 'Enter your password.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSignup) {
        await signup({ name, email, password });
      } else {
        await login({ email, password });
      }
      notify(isSignup ? 'Account created.' : 'Signed in.', 'success');
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from || '/dashboard', { replace: true });
    } catch {
      notify(isSignup ? 'Unable to create account.' : 'Invalid email or password.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {isSignup && (
        <DarkInput label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
      )}
      <DarkInput label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <DarkInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      <Button className="mt-2 w-full" type="submit" isLoading={isSubmitting}>
        {isSignup ? 'Create account' : 'Sign in →'}
      </Button>

      {!isSignup && (
        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-brand-400 hover:text-brand-300">
            Sign up free
          </Link>
        </p>
      )}
    </form>
  );
}
