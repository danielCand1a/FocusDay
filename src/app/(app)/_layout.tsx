import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/auth-context';

export default function AppLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/login" />;
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
