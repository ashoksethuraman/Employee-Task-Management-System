import { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface Summary {
  tasks: Record<string, number>;
  users: Record<string, number>;
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<Summary>({ tasks: {}, users: {} });
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSummary() {
      try {
        const response = await api.get('/dashboard/summary');
        setSummary(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to load analytics');
      }
    }
    loadSummary();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 xl:px-8">
        <Sidebar />
        <div className="flex-1 space-y-6">
          <Header />
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Analytics</h1>
                <p className="text-sm text-slate-500">Team performance and task distribution overview.</p>
              </div>
            </div>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-6">
                <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Pending</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{summary.tasks.PENDING ?? 0}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-6">
                <p className="text-sm uppercase tracking-[0.16em] text-slate-500">In Progress</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{summary.tasks.IN_PROGRESS ?? 0}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-6">
                <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Completed</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{summary.tasks.DONE ?? 0}</p>
              </div>
            </div>
            <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">User roles</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Admins</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{summary.users.ADMIN ?? 0}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Managers</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{summary.users.MANAGER ?? 0}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Employees</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{summary.users.EMPLOYEE ?? 0}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
