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
import Checkbox from 'expo-checkbox';
import { useAuth } from '@/context/auth-context';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa tu correo y contraseña.');
      return;
    }
    if (!accepted) {
      Alert.alert('Términos', 'Debes aceptar los términos y condiciones.');
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password);
      router.replace('/dashboard');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo crear la cuenta.');
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
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>

        {/* Logo */}
        <Text style={styles.logo}>
          <Text style={styles.logoFocus}>Focus</Text>Day
        </Text>
        <Text style={styles.subtitle}>ENFOCA · PLANIFICA · LOGRA</Text>

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

        {/* Terms */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAccepted((v) => !v)}
          activeOpacity={0.7}
        >
          <Checkbox
            value={accepted}
            onValueChange={setAccepted}
            color={accepted ? Colors.primary : undefined}
            style={styles.checkbox}
          />
          <Text style={styles.termsText}>
            Estoy de acuerdo con los{' '}
            <Text style={styles.termsLink}>términos y servicio</Text>
            {' '}y{' '}
            <Text style={styles.termsLink}>política de privacidad</Text>.
          </Text>
        </TouchableOpacity>

        {/* Register button */}
        <TouchableOpacity
          style={[styles.registerBtn, (!accepted || loading) && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={!accepted || loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.registerBtnText}>REGÍSTRATE AHORA</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.separator}>o puedes</Text>

        {/* Google */}
        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} disabled={loading}>
          <Ionicons name="logo-google" size={18} color="#4285F4" />
          <Text style={styles.googleText}>Iniciar sesión con Google</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
    padding: Spacing.xs,
  },
  logo: {
    fontSize: 42,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  logoFocus: {
    fontWeight: '800',
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 2,
    marginBottom: Spacing.xl,
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
    marginBottom: Spacing.md,
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  checkbox: {
    marginTop: 2,
    borderRadius: 3,
  },
  termsText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
  registerBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  registerBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 1,
  },
  separator: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
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
});
