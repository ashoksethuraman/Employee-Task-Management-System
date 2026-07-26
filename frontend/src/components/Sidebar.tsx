import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar() {
  const { user } = useAuth();
  const links = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Tasks', path: '/tasks' },
    { label: 'Analytics', path: '/analytics' },
  ];

  if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
    links.push({ label: 'Users', path: '/users' });
  }

  return (
    <aside className="w-60 rounded-2xl bg-white px-4 py-5 shadow-sm">
      <div className="mb-7">
        <h2 className="text-lg font-semibold">Task Portal</h2>
        <p className="text-sm text-slate-500">Enterprise task management</p>
      </div>
      <nav className="space-y-1.5">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }: { isActive: boolean }) =>
              `block rounded-xl px-4 py-2.5 text-sm font-medium ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
