import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';

interface Comment {
  id: number;
  body: string;
  createdAt: string;
  user: { id: number; name: string };
}

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
  comments: Comment[];
}

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusSaving, setStatusSaving] = useState(false);

  const statusOptions = ['PENDING', 'IN_PROGRESS', 'DONE'];

  useEffect(() => {
    async function loadTask() {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/tasks/${id}`);
        setTask(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to load task details');
      } finally {
        setLoading(false);
      }
    }
    loadTask();
  }, [id]);

  async function handleCommentSubmit() {
    if (!comment.trim() || !task) return;
    try {
      const response = await api.post('/comments', { taskId: task.id, body: comment });
      setTask({ ...task, comments: [response.data, ...task.comments] });
      setComment('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to add comment');
    }
  }

  async function handleStatusChange(status: string) {
    if (!task || status === task.status) return;

    try {
      setStatusSaving(true);
      setError('');
      const response = await api.put(`/tasks/${task.id}`, { status });
      setTask(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to update task status');
    } finally {
      setStatusSaving(false);
    }
  }

  function renderStatusBadge(status: string) {
    const classes = {
      PENDING: 'bg-amber-100 text-amber-700',
      IN_PROGRESS: 'bg-sky-100 text-sky-700',
      DONE: 'bg-emerald-100 text-emerald-700',
    };
    return <span className={`rounded-full px-3 py-1 text-sm font-semibold ${classes[status as keyof typeof classes] || 'bg-slate-100 text-slate-700'}`}>{status.replace('_', ' ')}</span>;
  }

  const canChangeStatus = Boolean(user && task && (user.role === 'ADMIN' || user.role === 'MANAGER' || user.id === task.assignee.id));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-[1400px] gap-4 px-3 py-4 xl:px-6">
        <Sidebar />
        <div className="flex-1 space-y-4">
          <Header />
          <section className="space-y-5 rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Task Details</h1>
                <p className="text-sm text-slate-500">Review task progress and participate in comments.</p>
              </div>
              <button
                onClick={() => navigate('/tasks')}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Back to tasks
              </button>
            </div>

            {loading && <p className="mt-4 text-slate-600">Loading task...</p>}
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            {!loading && task && (
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.75fr)_320px]">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-4">
                    <div className="flex flex-col gap-4 rounded-[1.5rem] bg-white p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-2xl font-semibold text-slate-900">{task.title}</h2>
                            {renderStatusBadge(task.status)}
                          </div>
                          <p className="text-sm text-slate-500">Created by {task.creator.name}</p>
                        </div>
                        <div className="min-w-[180px] rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Status</p>
                          <select
                            value={task.status}
                            disabled={!canChangeStatus || statusSaving}
                            onChange={(event) => handleStatusChange(event.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status.replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                          <p className="mt-2 text-xs text-slate-500">
                            {canChangeStatus ? 'Update status directly from this view.' : 'Only task owner, manager, or admin can change status.'}
                          </p>
                        </div>
                      </div>
                      <p className="text-base leading-7 text-slate-700">{task.description}</p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-slate-100 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Project</p>
                          <p className="mt-2 text-lg font-semibold text-slate-900">{task.project.name}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-100 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Assignee</p>
                          <p className="mt-2 text-lg font-semibold text-slate-900">{task.assignee.name}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-100 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Your role</p>
                          <p className="mt-2 text-lg font-semibold text-slate-900">{user?.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">Add comment</h3>
                      <p className="text-sm text-slate-500">Share progress, blockers, or task updates.</p>
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                      placeholder="Share progress or blockers"
                    />
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handleCommentSubmit}
                        className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Post comment
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">Task insights</h3>
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                        <span>Status</span>
                        <span className="font-medium text-slate-900">{task.status.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                        <span>Comments</span>
                        <span className="font-medium text-slate-900">{task.comments.length}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                        <span>Assigned to</span>
                        <span className="font-medium text-slate-900">{task.assignee.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">Activity</h3>
                    {task.comments.length === 0 ? (
                      <p className="mt-4 text-sm text-slate-500">No comments yet.</p>
                    ) : (
                      <ul className="relative mt-4 space-y-4 before:absolute before:bottom-2 before:left-[14px] before:top-2 before:w-px before:bg-slate-200">
                        {task.comments.map((comment) => (
                          <li key={comment.id} className="relative pl-10">
                            <span className="absolute left-0 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                              {comment.user.name.slice(0, 1).toUpperCase()}
                            </span>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-900">{comment.user.name}</p>
                                <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-slate-700">{comment.body}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
