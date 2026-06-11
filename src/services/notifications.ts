import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { Task } from '@/context/tasks-context';

// expo-notifications breaks in Expo Go on Android (SDK 53+).
// Use lazy require so the module never loads in Expo Go.
const isExpoGo =
  Constants.appOwnership === 'expo' ||
  (Constants.executionEnvironment as string) === 'storeClient';

type NotificationsModule = typeof import('expo-notifications');
let _mod: NotificationsModule | null = null;

function getN(): NotificationsModule | null {
  if (isExpoGo) return null;
  if (_mod) return _mod;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    _mod = require('expo-notifications') as NotificationsModule;
    _mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  } catch {
    _mod = null;
  }
  return _mod;
}

const DAY_TO_WEEKDAY: Record<string, number> = {
  D: 1, L: 2, M: 3, X: 4, J: 5, V: 6, S: 7,
};

export async function requestNotificationPermissions(): Promise<boolean> {
  const n = getN();
  if (!n) return false;
  try {
    if (Platform.OS === 'android') {
      await n.setNotificationChannelAsync('task-reminders', {
        name: 'Recordatorios de tareas',
        importance: n.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
    const { status } = await n.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleTaskNotifications(task: Task): Promise<void> {
  const n = getN();
  if (!n || !task.time || !task.alarm || task.status !== 'active') return;
  try {
    const [hour, minute] = task.time.split(':').map(Number);
    if (isNaN(hour) || isNaN(minute)) return;
    await Promise.all(
      task.days.map((day) =>
        n.scheduleNotificationAsync({
          identifier: `task-${task.id}-${day}`,
          content: { title: 'FocusDay', body: task.name, data: { taskId: task.id } },
          trigger: {
            type: n.SchedulableTriggerInputTypes.WEEKLY,
            weekday: DAY_TO_WEEKDAY[day],
            hour,
            minute,
          },
        })
      )
    );
  } catch (err) {
    console.error('Error agendando notificación:', err);
  }
}

export async function cancelTaskNotifications(taskId: string): Promise<void> {
  const n = getN();
  if (!n) return;
  try {
    const scheduled = await n.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((x) => x.identifier.startsWith(`task-${taskId}-`))
        .map((x) => n.cancelScheduledNotificationAsync(x.identifier))
    );
  } catch {
    // silent
  }
}

export async function syncAllNotifications(tasks: Task[]): Promise<void> {
  const n = getN();
  if (!n) return;
  try {
    const scheduled = await n.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((x) => x.identifier.startsWith('task-'))
        .map((x) => n.cancelScheduledNotificationAsync(x.identifier))
    );
    await Promise.all(tasks.map((t) => scheduleTaskNotifications(t)));
  } catch {
    // silent
  }
}
