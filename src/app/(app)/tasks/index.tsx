import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTasks, Task, formatDays } from '@/context/tasks-context';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import TaskDetailModal from '@/components/task-detail-modal';

export default function TasksScreen() {
  const { tasks, togglePause, deleteTask } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  function confirmDelete(task: Task) {
    Alert.alert(
      'Eliminar tarea',
      `¿Seguro que quieres eliminar "${task.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteTask(task.id) },
      ]
    );
  }

  function confirmPause(task: Task) {
    const isPaused = task.status === 'paused';
    Alert.alert(
      isPaused ? 'Reactivar tarea' : 'Pausar tarea',
      isPaused
        ? `¿Reactivar "${task.name}"?`
        : `¿Pausar "${task.name}"? No contará en las estadísticas mientras esté pausada.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: isPaused ? 'Reactivar' : 'Pausar', onPress: () => togglePause(task.id) },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Mis Tareas</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Create link */}
      <TouchableOpacity
        style={styles.createRow}
        onPress={() => router.push('/tasks/create')}
      >
        <Ionicons name="add" size={16} color={Colors.primary} />
        <Text style={styles.createText}>Crear nueva tarea</Text>
      </TouchableOpacity>

      {/* Column headers */}
      <View style={styles.colHeaders}>
        <View style={{ flex: 1 }} />
        <Text style={styles.colLabel}>pausar</Text>
        <Text style={styles.colLabel}>editar</Text>
        <Text style={styles.colLabel}>borrar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {tasks.length === 0 && (
          <Text style={styles.empty}>No tienes tareas aún. ¡Crea una!</Text>
        )}
        {tasks.map((task) => (
          <View key={task.id} style={styles.row}>
            {/* Task name — opens detail modal */}
            <TouchableOpacity
              style={styles.taskNameBtn}
              onPress={() => setSelectedTask(task)}
            >
              <Text
                style={[styles.taskName, task.status === 'paused' && styles.taskNamePaused]}
                numberOfLines={1}
              >
                {task.name}
              </Text>
            </TouchableOpacity>

            {/* Pause */}
            <TouchableOpacity style={styles.actionBtn} onPress={() => confirmPause(task)}>
              {task.status === 'paused' ? (
                <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
              ) : (
                <Ionicons name="pause-circle-outline" size={22} color={Colors.textSecondary} />
              )}
            </TouchableOpacity>

            {/* Edit */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push(`/tasks/edit?id=${task.id}`)}
            >
              <Ionicons name="pencil-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity style={styles.actionBtn} onPress={() => confirmDelete(task)}>
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Task detail modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
    width: 36,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  createText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  colHeaders: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
    gap: 4,
  },
  colLabel: {
    width: 44,
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xs,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  taskNameBtn: {
    flex: 1,
    paddingRight: Spacing.xs,
  },
  taskName: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '500',
  },
  taskNamePaused: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  actionBtn: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  empty: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginTop: Spacing.xxl,
  },
});
