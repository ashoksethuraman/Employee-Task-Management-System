import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface Project {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  assignee: { id: number; name: string };
  creator: { id: number; name: string };
  project: Project;
}

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState<number>(0);
  const [projectId, setProjectId] = useState<number>(0);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const tasksRes = await api.get('/tasks');
        setTasks(tasksRes.data);

        if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
          const [usersRes, projectsRes] = await Promise.all([api.get('/users'), api.get('/projects')]);
          setUsers(usersRes.data);
          setProjects(projectsRes.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Could not load data');
      }
    }
    loadData();
  }, [user]);

  async function handleCreate() {
    try {
      const response = await api.post('/tasks', { title, description, assigneeId, projectId: projectId || undefined });
      setTasks((prev: Task[]) => [...prev, response.data]);
      setTitle('');
      setDescription('');
      setAssigneeId(0);
      setProjectId(0);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not create task');
    }
  }

  async function handleCreateProject() {
    try {
      const response = await api.post('/projects', { name: projectName, description: projectDescription });
      // refresh projects list from server to ensure consistency
      const projectsRes = await api.get('/projects');
      setProjects(projectsRes.data);
      setProjectId(response.data.id);
      setProjectName('');
      setProjectDescription('');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not create project');
    }
  }

  async function handleStatusChange(taskId: number, status: string) {
    try {
      const response = await api.put(`/tasks/${taskId}`, { status });
      setTasks((prev: Task[]) => prev.map((task) => (task.id === taskId ? response.data : task)));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not update status');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 xl:px-8">
        <Sidebar />
        <div className="flex-1 space-y-6">
          <Header />
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Tasks</h1>
                <p className="text-sm text-slate-500">Create, assign, and track task progress.</p>
              </div>
            </div>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-xl font-semibold">Create Project</h2>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Project name"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  />
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Project description"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  />
                </div>
                <button
                  className="mt-4 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  onClick={handleCreateProject}
                >
                  Create Project
                </button>
              </div>
            )}


            {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-xl font-semibold">Create Task</h2>
                <div className="mt-4 grid gap-4 lg:grid-cols-4">
                  <input
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task title"
                  />
                  <textarea
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Task description"
                  />
                  <select
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(Number(e.target.value))}
                  >
                    <option value={0}>Assign to</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <select
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    value={projectId}
                    onChange={(e) => setProjectId(Number(e.target.value))}
                  >
                    <option value={0}>Select project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  className="mt-4 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  onClick={handleCreate}
                >
                  Create Task
                </button>
              </div>
            )}


            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Task List</h2>
              <div className="mt-4 space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="rounded-3xl border border-slate-200 p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{task.title}</h3>
                        <p className="mt-2 text-sm text-slate-600">{task.description}</p>
                        <p className="mt-2 text-sm text-slate-500">
                          Project: {task.project.name} · Assignee: {task.assignee.name} · Created by: {task.creator.name}
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <select
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                        </select>
                        <Link
                          to={`/tasks/${task.id}`}
                          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
