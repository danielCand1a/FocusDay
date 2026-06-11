import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TaskForm from '@/components/task-form';
import { useTasks } from '@/context/tasks-context';
import { Colors, FontSize } from '@/constants/theme';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, updateTask } = useTasks();
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Tarea no encontrada.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TaskForm
        title="Editar Tarea"
        submitLabel="GUARDAR"
        initial={{ name: task.name, type: task.type, days: task.days, time: task.time, alarm: task.alarm }}
        onBack={() => router.back()}
        onSubmit={(values) => {
          updateTask(task.id, values);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  notFoundText: { fontSize: FontSize.md, color: Colors.textSecondary },
});
