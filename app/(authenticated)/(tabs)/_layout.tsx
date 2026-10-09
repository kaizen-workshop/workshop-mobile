import { Tabs } from 'expo-router';
import { Bell, CalendarDays, Home, UserRound } from 'lucide-react-native';

import { colors, spacing, typography } from '@/shared/theme';

/** Bottom navigation between the main areas, so no section needs the menu first. */
export default function MainTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.brand,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: typography.familyMedium,
          fontSize: typography.caption,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surface3,
          minHeight: 60,
          paddingBottom: spacing.xxs,
          paddingTop: spacing.xxs,
        },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Workshops',
          tabBarIcon: ({ color, size }) => (
            <CalendarDays color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Avisos',
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <UserRound color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
