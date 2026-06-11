import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/auth-context';

export default function AuthLayout() {
  const { user } = useAuth();
  if (user) return <Redirect href="/dashboard" />;
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
