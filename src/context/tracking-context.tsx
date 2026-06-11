import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { useAuth } from './auth-context';
import { DayKey, TaskType, Task } from './tasks-context';

export type TrackingStatus = 'completed' | 'failed' | 'pending';

export type TrackingLog = {
  id: string;
  taskId: string;
  date: string; // YYYY-MM-DD
  status: 'completed' | 'failed';
};

type TrackingContextType = {
  logs: TrackingLog[];
  toggle: (taskId: string, date: string, taskType: TaskType) => void;
  getStatus: (taskId: string, date: string, taskType: TaskType) => TrackingStatus;
  isCompleted: (taskId: string, date: string, taskType: TaskType) => boolean;
  getDayPercent: (date: string, tasks: Task[]) => number | null;
};

const TrackingContext = createContext<TrackingContextType | null>(null);

const JS_DAY_TO_KEY: Record<number, DayKey> = {
  0: 'D', 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S',
};

export function getWeekdayKey(dateStr: string): DayKey {
  const [y, m, d] = dateStr.split('-').map(Number);
  return JS_DAY_TO_KEY[new Date(y, m - 1, d).getDay()];
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Start of current year — enough range for all stats views
function yearStart(): string {
  return `${new Date().getFullYear()}-01-01`;
}

export function TrackingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<TrackingLog[]>([]);

  useEffect(() => {
    if (user) {
      fetchLogs();
    } else {
      setLogs([]);
    }
  }, [user]);

  async function fetchLogs() {
    try {
      const data = await api.get<TrackingLog[]>(`/api/tracking?from=${yearStart()}&to=${todayStr()}`);
      // Normalize id to composite key for consistent lookups
      setLogs(data.map(l => ({ ...l, id: `${l.taskId}-${l.date}` })));
    } catch (err) {
      console.error('Error cargando registros:', err);
    }
  }

  function getStatus(taskId: string, date: string, taskType: TaskType): TrackingStatus {
    const log = logs.find(l => l.id === `${taskId}-${date}`);
    if (log) return log.status;
    if (taskType === 'avoidance') return 'completed';
    return date < todayStr() ? 'failed' : 'pending';
  }

  function toggle(taskId: string, date: string, taskType: TaskType) {
    const id = `${taskId}-${date}`;
    const existing = logs.find(l => l.id === id);

    const shouldRemove =
      (taskType === 'positive'  && existing?.status === 'completed') ||
      (taskType === 'avoidance' && existing?.status === 'failed');
    const newStatus: 'completed' | 'failed' =
      taskType === 'positive' ? 'completed' : 'failed';

    // Optimistic update
    setLogs(prev => {
      if (shouldRemove) return prev.filter(l => l.id !== id);
      if (existing) return prev.map(l => l.id === id ? { ...l, status: newStatus } : l);
      return [...prev, { id, taskId, date, status: newStatus }];
    });

    // Sync with server in background
    if (shouldRemove) {
      api.delete(`/api/tracking/${taskId}/${date}`).catch(console.error);
    } else {
      api.post('/api/tracking', { taskId, date, status: newStatus }).catch(console.error);
    }
  }

  function isCompleted(taskId: string, date: string, taskType: TaskType): boolean {
    return getStatus(taskId, date, taskType) === 'completed';
  }

  function getDayPercent(date: string, tasks: Task[]): number | null {
    const weekday = getWeekdayKey(date);
    const scheduled = tasks.filter(t => t.status === 'active' && t.days.includes(weekday));
    if (scheduled.length === 0) return null;
    const done = scheduled.filter(t => isCompleted(t.id, date, t.type)).length;
    return Math.round((done / scheduled.length) * 100);
  }

  return (
    <TrackingContext.Provider value={{ logs, toggle, getStatus, isCompleted, getDayPercent }}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const ctx = useContext(TrackingContext);
  if (!ctx) throw new Error('useTracking must be used inside TrackingProvider');
  return ctx;
}
