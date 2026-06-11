import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';

import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTasks } from '@/context/tasks-context';
import { useTracking, getWeekdayKey } from '@/context/tracking-context';
import type { TrackingStatus } from '@/context/tracking-context';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

const CELL_SIZE = Math.floor((Dimensions.get('window').width - Spacing.md * 2) / 7);

const MONTH_NAMES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
];
const DAY_HEADERS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function today() {
  const d = new Date();
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

function isFuture(dateStr: string) {
  return dateStr > today();
}

function isPast(dateStr: string) {
  return dateStr < today();
}

// Returns cells for a month grid (Mon-first), with null for empty slots
function buildMonthGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  // Convert Sunday-first to Monday-first offset
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CalendarScreen() {
  const todayStr = today();
  const nowDate = new Date();

  const [year, setYear] = useState(nowDate.getFullYear());
  const [month, setMonth] = useState(nowDate.getMonth());
  const [selected, setSelected] = useState<string>(todayStr);

  const { tasks } = useTasks();
  const { toggle, getStatus, getDayPercent } = useTracking();

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  // Tasks scheduled for the selected date
  const selectedWeekday = getWeekdayKey(selected);
  const scheduledTasks = tasks.filter(
    (t) => t.status === 'active' && t.days.includes(selectedWeekday)
  );
  const isToday = selected === todayStr;
  const isFutureDay = isFuture(selected);
  const isPastDay = isPast(selected);

  function percentColor(p: number) {
    if (p >= 80) return Colors.success;
    if (p >= 50) return Colors.chartBlue;
    return Colors.error;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Calendario</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Month navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>
            {MONTH_NAMES[month]} {year}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={styles.gridRow}>
          {DAY_HEADERS.map((d) => (
            <Text key={d} style={styles.dayHeader} numberOfLines={1}>
              {d.slice(0, 3)}
            </Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {grid.map((day, idx) => {
            if (!day) return <View key={`empty-${idx}`} style={styles.cell} />;
            const dateStr = toDateStr(year, month, day);
            const percent = getDayPercent(dateStr, tasks);
            const isSelected = dateStr === selected;
            const isCurrentDay = dateStr === todayStr;

            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.cell,
                  isSelected && styles.cellSelected,
                  isCurrentDay && !isSelected && styles.cellToday,
                ]}
                onPress={() => setSelected(dateStr)}
              >
                <Text style={[styles.cellDay, isSelected && styles.cellDaySelected]}>
                  {day}
                </Text>
                {percent !== null && !isFuture(dateStr) && (
                  <Text style={[styles.cellPercent, { color: isSelected ? Colors.white : percentColor(percent) }]}>
                    {percent}%
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Day detail */}
        <View style={styles.detailSection}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailDate}>
              {new Date(year, month, parseInt(selected.split('-')[2])).toLocaleDateString('es-ES', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </Text>
            {!isFutureDay && (
              <Text style={styles.detailStatus}>
                {isToday ? 'en curso' : 'completado'}
              </Text>
            )}
          </View>

          {isFutureDay && (
            <Text style={styles.emptyMsg}>No hay registros para días futuros.</Text>
          )}

          {!isFutureDay && scheduledTasks.length === 0 && (
            <Text style={styles.emptyMsg}>Sin tareas programadas para este día.</Text>
          )}

          {!isFutureDay && scheduledTasks.map((task) => {
            const status = getStatus(task.id, selected, task.type);
            const isAvoidance = task.type === 'avoidance';

            return (
              <View key={task.id} style={styles.taskRow}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskName}>{task.name}</Text>
                  {isAvoidance && (
                    <Text style={styles.taskTypeTag}>evitación</Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => isToday ? toggle(task.id, selected, task.type) : undefined}
                  disabled={!isToday}
                  style={styles.checkBtn}
                >
                  {status === 'completed' ? (
                    <Ionicons name="checkmark-circle" size={26} color={Colors.success} />
                  ) : status === 'failed' ? (
                    <Ionicons name="close-circle" size={26} color={Colors.error} />
                  ) : (
                    // pending — only positive tasks today
                    <Ionicons name="square-outline" size={26} color={Colors.border} />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: Spacing.sm,
  },
  backBtn: { padding: Spacing.xs, width: 36 },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  monthNav: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  navBtn: { padding: Spacing.sm },
  monthLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  gridRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  dayHeader: {
    flex: 1, textAlign: 'center',
    fontSize: 10, fontWeight: '700',
    color: Colors.textSecondary,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
  },
  cellSelected: { backgroundColor: Colors.text },
  cellToday: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  cellDay: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text },
  cellDaySelected: { color: Colors.white },
  cellPercent: { fontSize: 8, fontWeight: '700', marginTop: 1 },

  detailSection: {
    marginTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  detailHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  detailDate: {
    fontSize: FontSize.sm, fontWeight: '600', color: Colors.text,
    textTransform: 'capitalize', flex: 1,
  },
  detailStatus: {
    fontSize: FontSize.xs, color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyMsg: {
    fontSize: FontSize.sm, color: Colors.textMuted,
    textAlign: 'center', paddingVertical: Spacing.md,
  },
  taskRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  taskInfo: { flex: 1, gap: 2 },
  taskName: { fontSize: FontSize.sm, color: Colors.text },
  taskTypeTag: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkBtn: { padding: Spacing.xs },
});
