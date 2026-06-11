import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TaskForm from '@/components/task-form';
import { useTasks } from '@/context/tasks-context';
import { Colors } from '@/constants/theme';

export default function CreateTaskScreen() {
  const { addTask } = useTasks();

  return (
    <SafeAreaView style={styles.safe}>
      <TaskForm
        title="Nueva Tarea"
        submitLabel="CREAR"
        onBack={() => router.back()}
        onSubmit={(values) => {
          addTask(values);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
});
