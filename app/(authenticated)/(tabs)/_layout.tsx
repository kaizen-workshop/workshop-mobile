import { Tabs } from 'expo-router';

import { colors } from '@/shared/theme';

export default function MainTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          display: 'none',
        },
      }}
    >
      <Tabs.Screen name="feed" options={{ title: 'Início' }} />
      <Tabs.Screen name="agenda" options={{ title: 'Workshops' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Avisos' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
