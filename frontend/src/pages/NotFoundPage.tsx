import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-950">Page not found</h1>
        <Link className="mt-4 inline-flex text-sm font-medium text-brand-600" to="/dashboard">
          Go to dashboard
        </Link>
      </section>
    </main>
  );
}
