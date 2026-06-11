import { Modal, View, Text, TouchableOpacity, StyleSheet, PanResponder } from 'react-native';
import { useRef } from 'react';
import { Task, formatDays } from '@/context/tasks-context';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

type Props = {
  task: Task;
  onClose: () => void;
};

export default function TaskDetailModal({ task, onClose }: Props) {
  const startY = useRef(0);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => { startY.current = e.nativeEvent.pageY; },
    onPanResponderRelease: (e) => {
      if (e.nativeEvent.pageY - startY.current > 60) onClose();
    },
  });

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet} {...panResponder.panHandlers}>
        <View style={styles.handle} />

        <Text style={styles.name}>{task.name}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Horario:</Text>
          <Text style={styles.value}>{formatDays(task.days)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Hora:</Text>
          <Text style={styles.value}>{task.time ?? 'No determinado'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Tipo:</Text>
          <Text style={[styles.value, task.type === 'avoidance' && styles.avoidance]}>
            {task.type === 'avoidance' ? 'Evitación' : 'Positiva'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Estado:</Text>
          <Text style={[styles.value, task.status === 'paused' && styles.paused]}>
            {task.status === 'paused' ? 'En pausa' : 'Activo'}
          </Text>
        </View>

        <Text style={styles.hint}>Desliza hacia arriba para cerrar</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    width: 70,
  },
  value: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  avoidance: {
    color: Colors.primary,
  },
  paused: {
    color: Colors.error,
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
