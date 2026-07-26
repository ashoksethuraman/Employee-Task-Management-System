import { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [savingUserId, setSavingUserId] = useState<number | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to load users');
      }
    }
    loadUsers();
  }, []);

  async function handleRoleChange(userId: number, role: string) {
    try {
      setSavingUserId(userId);
      setError('');
      setSuccess('');

      const response = await api.put(`/users/${userId}/role`, { role });
      setUsers((current) => current.map((entry) => (entry.id === userId ? response.data : entry)));
      setSuccess('User role updated successfully.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to update role');
    } finally {
      setSavingUserId(null);
    }
  }

  const canManageRoles = currentUser?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 xl:px-8">
        <Sidebar />
        <div className="flex-1 space-y-6">
          <Header />
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 pb-6">
              <div>
                <h1 className="text-2xl font-semibold">User Directory</h1>
                <p className="text-sm text-slate-500">Manage employee accounts and roles.</p>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Joined</th>
                    {canManageRoles && <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 text-sm text-slate-700">{user.name}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{user.email}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{user.role}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{new Date(user.createdAt).toLocaleDateString()}</td>
                      {canManageRoles && (
                        <td className="px-4 py-4 text-sm text-slate-700">
                          <select
                            value={user.role}
                            disabled={savingUserId === user.id || user.id === currentUser?.id}
                            onChange={(event) => handleRoleChange(user.id, event.target.value)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                          >
                            <option value="EMPLOYEE">Employee</option>
                            <option value="MANAGER">Manager / HR</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {canManageRoles && (
              <p className="pt-4 text-sm text-slate-500">
                New users always register as Employee. Promote them here after review. The currently signed-in admin account cannot change its own role from this screen.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
