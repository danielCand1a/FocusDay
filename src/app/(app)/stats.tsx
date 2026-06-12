import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTasks } from '@/context/tasks-context';
import { useTracking, getWeekdayKey } from '@/context/tracking-context';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

type Period = 'semanal' | 'mensual' | 'anual';

// ── Date helpers ──────────────────────────────────────────────
function toStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getMondayOf(d: Date) {
  const day = d.getDay();
  const diff = (day + 6) % 7;
  const mon = new Date(d);
  mon.setDate(d.getDate() - diff);
  return mon;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function addWeeks(d: Date, n: number) { return addDays(d, n * 7); }
function addMonths(d: Date, n: number) {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}
function addYears(d: Date, n: number) {
  const r = new Date(d);
  r.setFullYear(r.getFullYear() + n);
  return r;
}

function weekLabel(monday: Date) {
  const sunday = addDays(monday, 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

function monthLabel(d: Date) {
  return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

function yearLabel(d: Date) {
  return String(d.getFullYear());
}

// Returns all date strings in a range [start, end] inclusive
function dateRange(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(toStr(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

// ── Bar chart ─────────────────────────────────────────────────
const CHART_H = 160;

function BarChart({ data }: { data: { label: string; percent: number; color: string }[] }) {
  const yLabels = [100, 80, 60, 40, 20, 0];

  return (
    <View style={chart.wrapper}>
      {/* Y axis */}
      <View style={chart.yAxis}>
        {yLabels.map((v) => (
          <Text key={v} style={chart.yLabel}>{v}%</Text>
        ))}
      </View>

      {/* Chart body */}
      <View style={chart.body}>
        {/* Grid lines sit behind the scroll (rendered first = lower z) */}
        <View style={chart.gridLines} pointerEvents="none">
          {yLabels.map((v) => <View key={v} style={chart.gridLine} />)}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={chart.barsRow}>
            {data.map((item, i) => {
              const barH = Math.max(Math.round((item.percent / 100) * CHART_H), 2);
              return (
                <View key={i} style={chart.barWrapper}>
                  {/* Fixed-height space anchors bar at bottom */}
                  <View style={chart.barSpace}>
                    <Text style={[chart.barPct, { bottom: barH + 2 }]}>{item.percent}%</Text>
                    <View style={[chart.bar, { height: barH, backgroundColor: item.color }]} />
                  </View>
                  <Text style={chart.barLabel}>{i + 1}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────
export default function StatsScreen() {
  const { tasks } = useTasks();
  const { isCompleted, getDayPercent } = useTracking();

  const [period, setPeriod] = useState<Period>('semanal');
  const [showPicker, setShowPicker] = useState(false);
  const [offset, setOffset] = useState(0); // 0 = current period

  const activeTasks = tasks.filter((t) => t.status === 'active');

  // Anchor dates for navigation
  const now = new Date();

  const { rangeLabel, dates } = useMemo(() => {
    if (period === 'semanal') {
      const monday = addWeeks(getMondayOf(now), offset);
      const sunday = addDays(monday, 6);
      return { rangeLabel: weekLabel(monday), dates: dateRange(monday, sunday) };
    }
    if (period === 'mensual') {
      const base = addMonths(new Date(now.getFullYear(), now.getMonth(), 1), offset);
      const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
      return { rangeLabel: monthLabel(base), dates: dateRange(base, end) };
    }
    // anual
    const base = addYears(new Date(now.getFullYear(), 0, 1), offset);
    const end = new Date(base.getFullYear(), 11, 31);
    return { rangeLabel: yearLabel(base), dates: dateRange(base, end) };
  }, [period, offset]);

  // Promedio de porcentajes diarios del período (solo días pasados con tareas)
  const effectivenessPercent = useMemo(() => {
    const todayStr = toStr(new Date());
    const pastDates = dates.filter(d => d <= todayStr);
    const dayPercentages: number[] = [];
    for (const d of pastDates) {
      const tasksOnDate = tasks.filter(t => t.createdAt <= d);
      const p = getDayPercent(d, tasksOnDate);
      if (p !== null) dayPercentages.push(p);
    }
    if (dayPercentages.length === 0) return null;
    return Math.round(dayPercentages.reduce((a, b) => a + b, 0) / dayPercentages.length);
  }, [dates, tasks, getDayPercent]);

  // Calculate % per active task over the selected range
  const chartData = useMemo(() =>
    activeTasks.map((task, i) => {
      const scheduled = dates.filter((d) => task.days.includes(getWeekdayKey(d)));
      if (scheduled.length === 0) return { label: task.name, percent: 0, color: Colors.chartBlue };
      const done = scheduled.filter((d) => isCompleted(task.id, d, task.type)).length;
      const percent = Math.round((done / scheduled.length) * 100);
      const colors = [Colors.chartBlue, Colors.success, Colors.progressStart, Colors.error, '#F39C12'];
      return { label: task.name, percent, color: colors[i % colors.length] };
    }),
    [activeTasks, dates, isCompleted]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Resumen Gráfico</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Period selector */}
        <View style={styles.periodRow}>
          <Text style={styles.periodPrefix}>Período:</Text>
          <TouchableOpacity
            style={styles.periodBtn}
            onPress={() => setShowPicker((v) => !v)}
          >
            <Text style={styles.periodBtnText}>{period.toUpperCase()}</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Picker dropdown */}
        {showPicker && (
          <View style={styles.picker}>
            {(['semanal', 'mensual', 'anual'] as Period[]).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.pickerItem, p === period && styles.pickerItemActive]}
                onPress={() => { setPeriod(p); setOffset(0); setShowPicker(false); }}
              >
                <Text style={[styles.pickerText, p === period && styles.pickerTextActive]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Range navigation */}
        <View style={styles.rangeRow}>
          <TouchableOpacity onPress={() => setOffset((o) => o - 1)} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={18} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.rangeLabel} numberOfLines={1}>{rangeLabel}</Text>
          <TouchableOpacity
            onPress={() => setOffset((o) => o + 1)}
            disabled={offset >= 0}
            style={styles.navBtn}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={offset >= 0 ? Colors.border : Colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          {activeTasks.length === 0 ? (
            <Text style={styles.emptyMsg}>Sin tareas activas para mostrar.</Text>
          ) : (
            <BarChart data={chartData} />
          )}
        </View>

        {/* Efectividad promedio del período */}
        {effectivenessPercent !== null && (
          <View style={styles.effectCard}>
            <Text style={styles.effectLabel}>EFECTIVIDAD DEL PERÍODO</Text>
            <Text style={[
              styles.effectValue,
              { color: effectivenessPercent >= 80 ? Colors.success : effectivenessPercent >= 50 ? Colors.chartBlue : Colors.error }
            ]}>
              {effectivenessPercent}%
            </Text>
          </View>
        )}

        {/* Legend */}
        {activeTasks.length > 0 && (
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>LEYENDA</Text>
            {chartData.map((item, i) => (
              <View key={i} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>
                  {i + 1} = {item.label}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────
const chart = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'flex-start' },
  yAxis: {
    width: 36,
    height: CHART_H,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 4,
  },
  yLabel: { fontSize: 9, color: Colors.textMuted },
  body: { flex: 1, position: 'relative' },
  gridLines: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: CHART_H,
    justifyContent: 'space-between',
  },
  gridLine: { height: 1, backgroundColor: Colors.border, opacity: 0.5 },
  barsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xs,
    gap: Spacing.sm,
  },
  barWrapper: { alignItems: 'center', gap: 4 },
  barSpace: {
    height: CHART_H,
    width: 44,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  bar: { width: 28, borderRadius: 4 },
  barPct: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    textAlign: 'center',
    width: 44,
  },
  barLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.text },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: Spacing.sm,
  },
  backBtn: { padding: Spacing.xs, width: 36 },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  periodRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.sm, marginBottom: Spacing.sm,
  },
  periodPrefix: { fontSize: FontSize.sm, color: Colors.textSecondary },
  periodBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: Colors.surface, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderWidth: 1, borderColor: Colors.border,
  },
  periodBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  picker: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm, borderWidth: 1,
    borderColor: Colors.border, marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  pickerItem: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  pickerItemActive: { backgroundColor: Colors.surfacePressed },
  pickerText: { fontSize: FontSize.sm, color: Colors.text },
  pickerTextActive: { fontWeight: '700', color: Colors.primary },
  rangeRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.md,
  },
  navBtn: { padding: Spacing.sm },
  rangeLabel: {
    fontSize: FontSize.sm, fontWeight: '600',
    color: Colors.text, flex: 1, textAlign: 'center',
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  emptyMsg: {
    fontSize: FontSize.sm, color: Colors.textMuted,
    textAlign: 'center', paddingVertical: Spacing.lg,
  },
  effectCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.md,
    alignItems: 'center', gap: Spacing.xs,
  },
  effectLabel: {
    fontSize: FontSize.xs, fontWeight: '700',
    color: Colors.textSecondary, letterSpacing: 1,
  },
  effectValue: {
    fontSize: 48, fontWeight: '800', lineHeight: 56,
  },
  legend: { gap: Spacing.xs },
  legendTitle: {
    fontSize: FontSize.xs, fontWeight: '700',
    color: Colors.textSecondary, letterSpacing: 1, marginBottom: Spacing.xs,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: FontSize.sm, color: Colors.text },
});
