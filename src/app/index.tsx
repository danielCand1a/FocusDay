import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';

import { useAuth } from '@/context/auth-context';
import { Colors, FontSize, Spacing } from '@/constants/theme';

const MIN_DISPLAY_MS = 1800;

export default function SplashScreen() {
  const { user, isLoading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const [minDelayDone, setMinDelayDone] = useState(false);

  // Animate in
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const t = setTimeout(() => setMinDelayDone(true), MIN_DISPLAY_MS);
    return () => clearTimeout(t);
  }, []);

  // Redirect once auth is resolved AND minimum display time has passed
  useEffect(() => {
    if (minDelayDone && !isLoading) {
      router.replace(user ? '/dashboard' : '/login');
    }
  }, [minDelayDone, isLoading, user]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.center, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
      >
        <Text style={styles.logo}>
          <Text style={styles.focus}>Focus</Text>Day
        </Text>
        <Text style={styles.tagline}>"Disciplina que se mide."</Text>
      </Animated.View>

      <Animated.Text style={[styles.version, { opacity: fadeAnim }]}>v0.1.0</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logo: {
    fontSize: 52,
    fontWeight: '500',
    color: Colors.text,
    letterSpacing: -1,
  },
  focus: {
    fontWeight: '800',
  },
  tagline: {
    fontFamily: 'Caveat_400Regular',
    fontSize: 22,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  version: {
    position: 'absolute',
    bottom: Spacing.xl,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
});
