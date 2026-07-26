import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, CheckCircle2, Circle, AlertCircle, Users } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { TASK_DATA_REFRESH_EVENT } from '../constants/realtimeEvents';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface TaskSummary {
  id: number;
  title: string;
  status: string;
  assignee?: { name: string };
}

interface Summary {
  role?: string;
  totalTasks?: number;
  tasksAssigned?: number;
  tasksInProgress?: number;
  tasksCompleted?: number;
  teamSize?: number;
  recentTasks?: TaskSummary[];
  tasks?: Record<string, number>;
  users?: Record<string, number>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary>({ tasks: {}, users: {} });
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData(showLoader = true) {
      try {
        if (showLoader) {
          setLoading(true);
        }
        const [tasksRes, summaryRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/dashboard/summary'),
        ]);
        setTasks(tasksRes.data);
        setSummary(summaryRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Could not load dashboard');
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    }

    fetchData();

    function handleTaskDataRefresh() {
      fetchData(false);
    }

    window.addEventListener(TASK_DATA_REFRESH_EVENT, handleTaskDataRefresh as EventListener);
    return () => {
      window.removeEventListener(TASK_DATA_REFRESH_EVENT, handleTaskDataRefresh as EventListener);
    };
  }, []);

  const totalTasks = summary.totalTasks || tasks.length;
  const pending = summary.tasks?.PENDING ?? summary.tasksAssigned ?? 0;
  const inProgress = summary.tasks?.IN_PROGRESS ?? summary.tasksInProgress ?? 0;
  const completed = summary.tasks?.DONE ?? summary.tasksCompleted ?? 0;

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-full p-3 ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 xl:px-8">
        <Sidebar />
        <div className="flex-1 space-y-6">
          <Header />
          
          {/* Header Section */}
          <div className="rounded-2xl bg-white p-8 shadow-md border border-gray-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-600">Welcome back, <span className="font-semibold">{user?.name}</span></p>
              </div>
              <button
                onClick={() => navigate('/tasks')}
                className="rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md"
              >
                + New Task
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-4 border border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                  icon={BarChart3}
                  label="Total Tasks"
                  value={totalTasks}
                  color="bg-blue-600"
                />
                <StatCard 
                  icon={AlertCircle}
                  label="Pending"
                  value={pending}
                  color="bg-yellow-500"
                />
                <StatCard 
                  icon={Circle}
                  label="In Progress"
                  value={inProgress}
                  color="bg-purple-600"
                />
                <StatCard 
                  icon={CheckCircle2}
                  label="Completed"
                  value={completed}
                  color="bg-green-600"
                />
              </div>

              {/* Main Content Grid */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Task Distribution */}
                <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-md border border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Task Overview</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Pending</span>
                        <span className="text-sm font-bold text-gray-900">{pending} tasks</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${totalTasks ? (pending / totalTasks) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">In Progress</span>
                        <span className="text-sm font-bold text-gray-900">{inProgress} tasks</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${totalTasks ? (inProgress / totalTasks) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Completed</span>
                        <span className="text-sm font-bold text-gray-900">{completed} tasks</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${totalTasks ? (completed / totalTasks) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Statistics */}
                <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Users size={20} />
                    Team Stats
                  </h2>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                      <p className="text-sm text-gray-600">Admins</p>
                      <p className="text-2xl font-bold text-blue-600">{summary.users?.ADMIN ?? 0}</p>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-4 border border-purple-200">
                      <p className="text-sm text-gray-600">Managers</p>
                      <p className="text-2xl font-bold text-purple-600">{summary.users?.MANAGER ?? 0}</p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                      <p className="text-sm text-gray-600">Employees</p>
                      <p className="text-2xl font-bold text-green-600">{summary.users?.EMPLOYEE ?? 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Tasks */}
              {(summary.recentTasks && summary.recentTasks.length > 0) && (
                <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Tasks</h2>
                  <div className="space-y-3">
                    {summary.recentTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
                        <div>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-600">{task.assignee?.name}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          task.status === 'DONE' ? 'bg-green-100 text-green-700' :
                          task.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
