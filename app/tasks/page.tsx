"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  LogOut,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  User,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

type Role = "ADMIN" | "USER";

interface UserType {
  userId: string;
  email: string;
  fullname: string;
  role: Role;
}

interface TaskUser {
  name: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  user: TaskUser;
}

interface TaskForm {
  title: string;
  content: string;
  completed: boolean;
}

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function parseJwt(token: string): UserType | null {
  try {
    const base64 = token.split(".")[1];
    const decoded = JSON.parse(atob(base64));
    return decoded;
  } catch {
    return null;
  }
}

async function fetchWithAuth(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  let accessToken = getAccessToken();

  const makeRequest = async (token: string | null) =>
    fetch(input, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

  let response = await makeRequest(accessToken);

  if (response.status !== 403 && response.status !== 401) return response;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  const refreshRes = await fetch("/api/v1/auth/refresh", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  if (!refreshRes.ok) {
    clearTokens();
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  const refreshData = await refreshRes.json();

  setTokens(refreshData.accessToken, refreshData.refreshToken);

  return makeRequest(refreshData.accessToken);
}

export default function TasksPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserType | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState<TaskForm>({
    title: "",
    content: "",
    completed: false,
  });

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      router.push("/login");
      return;
    }

    const parsedUser = parseJwt(token);

    if (!parsedUser) {
      clearTokens();
      router.push("/login");
      return;
    }

    setUser(parsedUser);
  }, [router]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetchWithAuth("/api/v1/tasks");

      if (!res.ok) throw new Error("Failed to fetch tasks");

      const data = await res.json();

      setTasks(data || []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch tasks";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user, fetchTasks]);

  function validateForm(): string | null {
    if (!formData.title.trim()) return "Title required";
    if (!formData.content.trim()) return "Content required";
    return null;
  }

  const handleCreateTask = async () => {
    if (user?.role !== "ADMIN") {
      toast.error("Only admins can create tasks");
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const res = await fetchWithAuth("/api/v1/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          completed: formData.completed,
        }),
      });

      if (!res.ok) throw new Error("Failed to create task");

      toast.success("Task created successfully");

      setIsCreateModalOpen(false);

      fetchTasks();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create task");
    }
  };

  const handleUpdateTask = async () => {
    if (!currentTask) return;

    if (user?.role !== "ADMIN") {
      toast.error("Only admins can update tasks");
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const res = await fetchWithAuth(`/api/v1/tasks/${currentTask.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          completed: formData.completed,
        }),
      });

      if (!res.ok) throw new Error("Failed to update task");

      toast.success("Task updated successfully");

      setIsEditModalOpen(false);

      fetchTasks();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (user?.role !== "ADMIN") {
      toast.error("Only admins can delete tasks");
      return;
    }

    try {
      const res = await fetchWithAuth(`/api/v1/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete task");

      toast.success("Task deleted");

      fetchTasks();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  const handleSignOut = () => {
    clearTokens();
    router.push("/login");
  };

  const openEditModal = (task: Task) => {
    setCurrentTask(task);

    setFormData({
      title: task.title,
      content: task.content,
      completed: task.completed,
    });

    setIsEditModalOpen(true);
  };

  const openCreateModal = () => {
    setFormData({
      title: "",
      content: "",
      completed: false,
    });

    setIsCreateModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-xl">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(147,51,234,0.1),transparent_40%)]" />
        
      <div className="relative max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <CheckCircle2 className="w-10 h-10 text-blue-400" />
              Task Tracker
            </h1>
            <p className="text-slate-300">
              Welcome back, {user?.fullname || user?.email}
            </p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {error && (
          <Alert className="bg-red-500/10 border-red-500/50 text-red-200 mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">All Tasks</h2>
          <Button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No tasks yet
            </h3>
            <p className="text-slate-300 mb-6">
              Create your first task to get started!
            </p>
            <Button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                    <h3
                      className={`text-lg font-semibold ${
                        task.completed
                          ? "text-slate-400 line-through"
                          : "text-white"
                      }`}
                    >
                      {task.title}
                    </h3>
                  </div>
                </div>

                <p className="text-slate-300 mb-4 line-clamp-3">
                  {task.content}
                </p>

                <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                  <User className="w-4 h-4" />
                  <span>{task.user.name || "Unknown User"}</span>
                </div>

                {user?.role === "ADMIN" && (
                  <div className="flex gap-2 pt-4 border-t border-white/10">
                    <Button
                      onClick={() => openEditModal(task)}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteTask(task.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-slate-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-title">Title</Label>
              <Input
                id="create-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Task title"
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-content">Content</Label>
              <Textarea
                id="create-content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Task description"
                rows={4}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create-completed"
                checked={formData.completed}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, completed: checked as boolean })
                }
              />
              <Label htmlFor="create-completed" className="cursor-pointer">
                Mark as completed
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-slate-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Task</DialogTitle>
          </DialogHeader>
          {JSON.stringify({
          title: formData.title,
          content: formData.content,
          is_completed: formData.completed,
        })}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Task title"
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Task description"
                rows={4}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-completed"
                checked={formData.completed}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, completed: checked as boolean })
                }
              />
              <Label htmlFor="edit-completed" className="cursor-pointer">
                Mark as completed
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTask}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
