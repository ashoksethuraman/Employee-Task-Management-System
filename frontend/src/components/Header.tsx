import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from './NotificationBell';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between gap-3 rounded-2xl bg-white px-5 py-3 shadow-sm">
      <div>
        <p className="text-sm text-slate-500">Signed in as</p>
        <p className="text-lg font-semibold">{user?.name} ({user?.role})</p>
      </div>
      
      <div className="flex items-center gap-3">
        <NotificationBell />
        <button onClick={logout} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700">
          Logout
        </button>
      </div>
    </header>
  );
}
