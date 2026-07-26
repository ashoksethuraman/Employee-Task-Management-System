import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Enterprise Task Management</p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900">Manage tasks with role-based control and modern UI.</h1>
            <p className="mt-5 text-slate-600">A full stack solution using React, TypeScript, Node.js, Prisma, MySQL and Tailwind CSS.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/login" className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                Login
              </Link>
              <Link to="/register" className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                Register
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] bg-slate-50 p-8 text-slate-800 shadow-sm">
            <h2 className="text-xl font-semibold">Features</h2>
            <ul className="mt-6 space-y-3 text-slate-600">
              <li>Role-based dashboards for Admin, Manager, Employee</li>
              <li>Task assignment, status tracking, user management</li>
              <li>JWT authentication and API authorization</li>
              <li>Prisma ORM with MySQL for enterprise data models</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
