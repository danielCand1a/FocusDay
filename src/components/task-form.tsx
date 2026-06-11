import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DayKey, TaskType, ALL_DAYS, Task } from '@/context/tasks-context';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

const DAY_DISPLAY: Record<DayKey, string> = {
  L: 'L', M: 'M', X: 'X', J: 'J', V: 'V', S: 'S', D: 'D',
};

type FormValues = {
  name: string;
  type: TaskType;
  days: DayKey[];
  time?: string;
  alarm: boolean;
};

type Props = {
  initial?: Partial<FormValues>;
  submitLabel: string;
  onSubmit: (values: FormValues) => void;
  onBack: () => void;
  title: string;
};

export default function TaskForm({ initial, submitLabel, onSubmit, onBack, title }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<TaskType>(initial?.type ?? 'positive');
  const [days, setDays] = useState<DayKey[]>(initial?.days ?? []);
  const [showExtra, setShowExtra] = useState(!!(initial?.time || initial?.alarm));
  const [time, setTime] = useState(initial?.time ?? '');
  const [alarm, setAlarm] = useState(initial?.alarm ?? false);

  const canSubmit = name.trim().length > 0 && days.length > 0;

  function toggleDay(day: DayKey) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({ name: name.trim(), type, days, time: time || undefined, alarm });
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Type selector */}
        <Text style={styles.label}>Tipo de tarea:</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'positive' && styles.typeBtnPositive]}
            onPress={() => setType('positive')}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={type === 'positive' ? Colors.white : Colors.textSecondary}
            />
            <Text style={[styles.typeText, type === 'positive' && styles.typeTextActive]}>
              Positiva
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeBtn, type === 'avoidance' && styles.typeBtnAvoidance]}
            onPress={() => setType('avoidance')}
          >
            <Ionicons
              name="ban-outline"
              size={18}
              color={type === 'avoidance' ? Colors.white : Colors.textSecondary}
            />
            <Text style={[styles.typeText, type === 'avoidance' && styles.typeTextActive]}>
              Evitación
            </Text>
          </TouchableOpacity>
        </View>

        {type === 'avoidance' && (
          <Text style={styles.typeHint}>
            Empieza como ✓ cumplida cada día. Toca si rompiste la regla.
          </Text>
        )}

        {/* Name */}
        <Text style={styles.label}>Nombre:</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nombre de la tarea"
          placeholderTextColor={Colors.placeholder}
          maxLength={60}
        />

        {/* Days */}
        <Text style={styles.label}>Horario:</Text>
        <View style={styles.daysRow}>
          {ALL_DAYS.map((day) => (
            <TouchableOpacity
              key={day}
              style={[styles.dayBtn, days.includes(day) && styles.dayBtnActive]}
              onPress={() => toggleDay(day)}
            >
              <Text style={[styles.dayText, days.includes(day) && styles.dayTextActive]}>
                {DAY_DISPLAY[day]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ajustes adicionales toggle */}
        <TouchableOpacity
          style={styles.extraToggle}
          onPress={() => setShowExtra((v) => !v)}
        >
          <Text style={styles.extraLabel}>Ajustes Adicionales</Text>
          <Ionicons
            name={showExtra ? 'remove' : 'add'}
            size={20}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>

        {showExtra && (
          <View style={styles.extraPanel}>
            {/* Time */}
            <Text style={styles.label}>Establecer hora</Text>
            <View style={styles.timeRow}>
              <TextInput
                style={styles.timeInput}
                value={time}
                onChangeText={(t) => {
                  // Auto-format HH:MM
                  const digits = t.replace(/\D/g, '').slice(0, 4);
                  const formatted = digits.length > 2
                    ? `${digits.slice(0, 2)}:${digits.slice(2)}`
                    : digits;
                  setTime(formatted);
                }}
                placeholder="00:00"
                placeholderTextColor={Colors.placeholder}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            {/* Alarm */}
            <View style={styles.alarmRow}>
              <Text style={styles.label}>Alarma de recordatorio</Text>
              <TouchableOpacity
                style={[styles.alarmBtn, alarm && styles.alarmBtnOn]}
                onPress={() => setAlarm((v) => !v)}
              >
                <Ionicons
                  name={alarm ? 'alarm' : 'alarm-outline'}
                  size={20}
                  color={alarm ? Colors.white : Colors.textSecondary}
                />
                <Text style={[styles.alarmText, alarm && styles.alarmTextOn]}>
                  {alarm ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          <Text style={styles.submitText}>{submitLabel}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  backBtn: { padding: Spacing.xs, width: 36 },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  daysRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  dayBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  dayBtnActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  dayText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  dayTextActive: {
    color: Colors.white,
  },
  extraToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.md,
  },
  extraLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  extraPanel: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  timeRow: {
    alignItems: 'flex-start',
  },
  timeInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    minWidth: 120,
    letterSpacing: 4,
  },
  alarmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  alarmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  alarmBtnOn: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  alarmText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  alarmTextOn: {
    color: Colors.white,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 1,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeBtnPositive: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  typeBtnAvoidance: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeTextActive: {
    color: Colors.white,
  },
  typeHint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
});
