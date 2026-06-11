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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth-context';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

function WeekPreview() {
  const days = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
  return (
    <View style={preview.container}>
      <View style={preview.header}>
        <Text style={preview.tab}>PROGRESO DIARIO</Text>
        <Text style={[preview.tab, preview.tabActive]}>DISCIPLINA SEMANAL</Text>
      </View>
      <View style={preview.daysRow}>
        {days.map((d) => (
          <Text key={d} style={preview.dayLabel}>{d}</Text>
        ))}
      </View>
      <View style={preview.cells}>
        {[true, true, false, true, false, true, true].map((done, i) => (
          <View key={i} style={[preview.cell, done && preview.cellDone]} />
        ))}
      </View>
      <View style={preview.checks}>
        {[true, true, false, true, false, true, true].map((done, i) => (
          <Ionicons
            key={i}
            name={done ? 'checkmark-circle' : 'ellipse-outline'}
            size={14}
            color={done ? Colors.success : Colors.border}
          />
        ))}
      </View>
    </View>
  );
}

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa tu correo y contraseña.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/dashboard');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    Alert.alert('Próximamente', 'El acceso con Google estará disponible pronto.');
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <Text style={styles.logo}>
          <Text style={styles.logoFocus}>Focus</Text>Day
        </Text>

        {/* Mini preview */}
        <WeekPreview />

        {/* Tagline */}
        <Text style={styles.tagline}>
          Si llegaste hasta aquí, ya hiciste la mitad del trabajo.
        </Text>

        {/* Google */}
        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} disabled={loading}>
          <Ionicons name="logo-google" size={18} color="#4285F4" />
          <Text style={styles.googleText}>Iniciar sesión con Google</Text>
        </TouchableOpacity>

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico / Teléfono *"
          placeholderTextColor={Colors.placeholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Password */}
        <View style={styles.passwordRow}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Contraseña *"
            placeholderTextColor={Colors.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Forgot */}
        <TouchableOpacity style={styles.forgotRow}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        {/* Login button */}
        <TouchableOpacity
          style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.loginBtnText}>INGRESAR</Text>
          )}
        </TouchableOpacity>

        {/* Register link */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>si no tienes cuenta, </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.registerLink}>regístrate aquí</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const preview = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    width: '100%',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  tab: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  tabActive: {
    color: Colors.text,
    fontWeight: '700',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.xs,
  },
  dayLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  cells: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 4,
    marginBottom: Spacing.xs,
  },
  cell: {
    flex: 1,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.border,
  },
  cellDone: {
    backgroundColor: Colors.chartBlue,
    opacity: 0.7,
  },
  checks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  logo: {
    fontSize: 42,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Spacing.lg,
    letterSpacing: -0.5,
  },
  logoFocus: {
    fontWeight: '800',
  },
  tagline: {
    fontSize: FontSize.md,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    width: '100%',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.sm,
    color: Colors.text,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  eyeBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  forgotRow: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  forgotText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  loginBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 1,
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  registerText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
