import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">404 error</p>
        <h1 className="mt-6 text-5xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-4 text-slate-600">The page you are looking for does not exist or has moved.</p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-3xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
