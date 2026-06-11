import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { useAuth } from './auth-context';
import {
  requestNotificationPermissions,
  scheduleTaskNotifications,
  cancelTaskNotifications,
  syncAllNotifications,
} from '@/services/notifications';

export type DayKey = 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D';
export type TaskType = 'positive' | 'avoidance';

export type Task = {
  id: string;
  name: string;
  type: TaskType;
  days: DayKey[];
  time?: string;
  alarm: boolean;
  status: 'active' | 'paused';
  createdAt: string;
};

type TasksContextType = {
  tasks: Task[];
  isLoading: boolean;
  addTask: (data: Omit<Task, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, data: Partial<Omit<Task, 'id' | 'createdAt'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  togglePause: (id: string) => Promise<void>;
};

const TasksContext = createContext<TasksContextType | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      requestNotificationPermissions().catch(console.error);
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [user]);

  async function fetchTasks() {
    setIsLoading(true);
    try {
      const data = await api.get<Task[]>('/api/tasks');
      setTasks(data);
      syncAllNotifications(data).catch(console.error);
    } catch (err) {
      console.error('Error cargando tareas:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function addTask(data: Omit<Task, 'id' | 'status' | 'createdAt'>) {
    const task = await api.post<Task>('/api/tasks', data);
    setTasks(prev => [task, ...prev]);
    scheduleTaskNotifications(task).catch(console.error);
  }

  async function updateTask(id: string, data: Partial<Omit<Task, 'id' | 'createdAt'>>) {
    const updated = await api.put<Task>(`/api/tasks/${id}`, data);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    cancelTaskNotifications(id)
      .then(() => scheduleTaskNotifications(updated))
      .catch(console.error);
  }

  async function deleteTask(id: string) {
    await api.delete(`/api/tasks/${id}`);
    setTasks(prev => prev.filter(t => t.id !== id));
    cancelTaskNotifications(id).catch(console.error);
  }

  async function togglePause(id: string) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'active' ? 'paused' : 'active';
    await updateTask(id, { status: newStatus });

    // Reorder: paused tasks go to the end
    setTasks(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, status: newStatus } as Task : t);
      return [
        ...updated.filter(t => t.status === 'active'),
        ...updated.filter(t => t.status === 'paused'),
      ];
    });
  }

  return (
    <TasksContext.Provider value={{ tasks, isLoading, addTask, updateTask, deleteTask, togglePause }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used inside TasksProvider');
  return ctx;
}

// Helpers
export const DAY_LABELS: Record<DayKey, string> = {
  L: 'Lun', M: 'Mar', X: 'Mié', J: 'Jue', V: 'Vie', S: 'Sáb', D: 'Dom',
};

export const ALL_DAYS: DayKey[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function formatDays(days: DayKey[]): string {
  if (days.length === 7) return 'Todos los días';
  if (days.length === 2 && days.includes('S') && days.includes('D')) return 'Fin de semana';
  return days.map((d) => DAY_LABELS[d]).join(' - ');
}
