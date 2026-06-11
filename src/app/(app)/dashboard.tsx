import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth-context';
import { useTasks } from '@/context/tasks-context';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import quotes from '@/data/quotes.json';

function getFirstName(nameOrEmail: string) {
  const base = nameOrEmail.split('@')[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function DisciplineRing({ percent }: { percent: number }) {
  const color =
    percent >= 80 ? Colors.success : percent >= 50 ? Colors.chartBlue : Colors.error;
  return (
    <View style={ring.container}>
      <View style={[ring.circle, { borderColor: color }]}>
        <Text style={ring.percent}>{percent}%</Text>
      </View>
    </View>
  );
}

// ── User modal ──────────────────────────────────────────────
function UserModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();

  const initial = (user?.name ?? user?.email ?? 'U').charAt(0).toUpperCase();

  async function handleLogout() {
    onClose();
    await logout();
  }

  async function handleSwitchAccount() {
    onClose();
    await logout();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={modal.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={modal.sheet}>
        <View style={modal.handle} />
        <View style={modal.avatar}>
          <Text style={modal.avatarText}>{initial}</Text>
        </View>
        <Text style={modal.name}>{user?.name ?? ''}</Text>
        <Text style={modal.email}>{user?.email ?? ''}</Text>

        <TouchableOpacity style={modal.row} onPress={handleSwitchAccount}>
          <Text style={modal.rowLabel}>cambiar cuenta</Text>
          <Ionicons name="person-circle-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={modal.divider} />

        <TouchableOpacity style={modal.row} onPress={handleLogout}>
          <Text style={[modal.rowLabel, { color: Colors.error }]}>cerrar sesión</Text>
          <Ionicons name="exit-outline" size={22} color={Colors.error} />
        </TouchableOpacity>

        <Text style={modal.hint}>Desliza hacia arriba para cerrar</Text>
      </View>
    </Modal>
  );
}

// ── Notifications modal ──────────────────────────────────────
function NotificationsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [list, setList] = useState<{ id: string; text: string; time: string }[]>([]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={modal.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={modal.sheet}>
        <View style={modal.handle} />
        <Text style={notif.title}>NOTIFICACIONES</Text>
        {list.length === 0 && (
          <Text style={notif.empty}>Sin notificaciones</Text>
        )}
        {list.map((n) => (
          <View key={n.id} style={notif.row}>
            <Text style={notif.text} numberOfLines={3}>{n.text}</Text>
            <View style={notif.right}>
              <Text style={notif.time}>{n.time}</Text>
              <TouchableOpacity
                style={notif.trashBtn}
                onPress={() => setList((prev) => prev.filter((x) => x.id !== n.id))}
              >
                <Ionicons name="trash-outline" size={16} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <Text style={modal.hint}>Desliza hacia arriba para cerrar</Text>
      </View>
    </Modal>
  );
}

// ── Dashboard ────────────────────────────────────────────────
export default function DashboardScreen() {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const [showUser, setShowUser] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const quote = useMemo(() => {
    const idx = new Date().getDate() % quotes.length;
    return quotes[idx];
  }, []);

  const firstName = getFirstName(user?.name ?? 'Usuario');

  const activeTasks = tasks.filter((t) => t.status === 'active');
  const totalPercent =
    activeTasks.length === 0 ? 0 : Math.round((activeTasks.length / tasks.length) * 100);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowUser(true)} style={styles.avatarBtn}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.name ?? user?.email ?? 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.logo}>
            <Text style={styles.logoFocus}>Focus</Text>Day
          </Text>
          <TouchableOpacity onPress={() => setShowNotif(true)} style={styles.bellBtn}>
            <Ionicons name="notifications-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <Text style={styles.greeting}>HOLA, {firstName.toUpperCase()}</Text>
        <Text style={styles.welcome}>BIENVENIDO A FOCUSDAY</Text>

        {/* Quick actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/tasks')}
          >
            <Ionicons name="list" size={32} color={Colors.text} />
            <Text style={styles.actionLabel}>MIS TAREAS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/calendar')}
          >
            <Ionicons name="calendar" size={32} color={Colors.text} />
            <Text style={styles.actionLabel}>CALENDARIO</Text>
          </TouchableOpacity>
        </View>

        {/* Tracking summary */}
        <Text style={styles.sectionTitle}>RESUMEN TOTAL DE SEGUIMIENTO</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/stats')}>
          <DisciplineRing percent={totalPercent} />
        </TouchableOpacity>

        {/* Quote */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>"{quote.text}"</Text>
          <Text style={styles.quoteAuthor}>--{quote.author}</Text>
        </View>
      </ScrollView>

      <UserModal visible={showUser} onClose={() => setShowUser(false)} />
      <NotificationsModal visible={showNotif} onClose={() => setShowNotif(false)} />
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────
const ring = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', marginVertical: Spacing.md },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  percent: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
});

const modal = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: Colors.overlay },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center', marginBottom: Spacing.sm,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center',
  },
  avatarText: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  name: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  email: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: -Spacing.xs },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: Spacing.xs,
  },
  rowLabel: { fontSize: FontSize.md, color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border },
  hint: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.sm },
});

const notif = StyleSheet.create({
  title: {
    fontSize: FontSize.sm, fontWeight: '700',
    color: Colors.textSecondary, letterSpacing: 1,
    textAlign: 'center',
  },
  empty: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
  },
  text: { flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  right: { alignItems: 'flex-end', gap: Spacing.xs, minWidth: 44 },
  time: { fontSize: 10, color: Colors.textMuted },
  trashBtn: { padding: Spacing.xs },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: Spacing.md,
  },
  avatarBtn: { padding: Spacing.xs },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  logo: { fontSize: 26, fontWeight: '500', color: Colors.text, letterSpacing: -0.5 },
  logoFocus: { fontWeight: '800' },
  bellBtn: { padding: Spacing.xs },
  greeting: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  welcome: {
    fontSize: FontSize.xs, fontWeight: '500',
    color: Colors.textSecondary, letterSpacing: 1, marginBottom: Spacing.lg,
  },
  actionsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  actionCard: {
    flex: 1, backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing.lg,
    alignItems: 'center', gap: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  actionLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.text, letterSpacing: 0.5 },
  sectionTitle: {
    fontSize: FontSize.xs, fontWeight: '700',
    color: Colors.textSecondary, letterSpacing: 1,
    textAlign: 'center', marginBottom: Spacing.xs,
  },
  quoteCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, marginTop: Spacing.md,
  },
  quoteText: {
    fontFamily: 'Caveat_700Bold', fontSize: 20,
    color: Colors.text, lineHeight: 28,
    marginBottom: Spacing.sm, textAlign: 'center',
  },
  quoteAuthor: {
    fontFamily: 'Caveat_700Bold', fontSize: 16,
    color: Colors.textSecondary, textAlign: 'center', fontStyle: 'italic',
  },
});
