import { router, usePathname } from 'expo-router';
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Home,
  Menu,
  Settings,
  UserRound,
  Users,
  X,
  ArrowLeft,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  colors,
  radii,
  shadows,
  sizes,
  spacing,
  typography,
} from '@/shared/theme';

const destinations = [
  { label: 'Início', href: '/(authenticated)/(tabs)/feed', Icon: Home },
  {
    label: 'Workshops',
    href: '/(authenticated)/(tabs)/agenda',
    Icon: CalendarDays,
  },
  {
    label: 'Calendário',
    href: '/(authenticated)/calendar',
    Icon: CalendarDays,
  },
  { label: 'Grupos', href: '/(authenticated)/groups', Icon: Users },
  {
    label: 'Avisos',
    href: '/(authenticated)/(tabs)/notifications',
    Icon: Bell,
  },
  { label: 'Perfil', href: '/(authenticated)/(tabs)/profile', Icon: UserRound },
  { label: 'Configurações', href: '/(authenticated)/settings', Icon: Settings },
] as const;

export function AppHeader({
  title,
  eyebrow,
  action,
}: Readonly<{
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
}>) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Abrir menu"
          accessibilityRole="button"
          onPress={() => setOpen(true)}
          style={({ pressed }) => [
            styles.menuButton,
            pressed && styles.pressed,
          ]}
        >
          <Menu color={colors.onBrand} size={25} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.heading}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
        </View>
        {action ?? <View style={styles.actionPlaceholder} />}
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        transparent
        visible={open}
      >
        <View style={styles.modal}>
          <View accessibilityViewIsModal style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <View>
                <Text style={styles.drawerEyebrow}>WEG WORKSHOPS</Text>
                <Text accessibilityRole="header" style={styles.drawerTitle}>
                  Menu
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Fechar menu"
                accessibilityRole="button"
                onPress={() => setOpen(false)}
                style={styles.closeButton}
              >
                <X color={colors.text} size={24} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.destinations}>
              {destinations.map(({ href, Icon, label }) => {
                const active = pathname.includes(routeSegment(href));
                return (
                  <Pressable
                    accessibilityRole="link"
                    key={href}
                    onPress={() => {
                      setOpen(false);
                      router.replace(href);
                    }}
                    style={({ pressed }) => [
                      styles.destination,
                      active && styles.destinationActive,
                      pressed && styles.destinationPressed,
                    ]}
                  >
                    <Icon
                      color={active ? colors.brand : colors.textMuted}
                      size={21}
                    />
                    <Text
                      style={[
                        styles.destinationText,
                        active && styles.destinationTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                    <ChevronRight color={colors.disabled} size={18} />
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
          <Pressable
            accessibilityLabel="Fechar menu"
            onPress={() => setOpen(false)}
            style={styles.scrim}
          />
        </View>
      </Modal>
    </>
  );
}

export function BackHeader({
  title,
  eyebrow,
  fallback = '/(authenticated)/(tabs)/agenda',
}: Readonly<{ title: string; eyebrow?: string; fallback?: string }>) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Voltar"
        accessibilityRole="link"
        onPress={() => {
          if (router.canGoBack()) router.back();
          else router.replace(fallback as never);
        }}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <ArrowLeft color={colors.text} size={23} />
      </Pressable>
      <View style={styles.heading}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
      </View>
      <View style={styles.actionPlaceholder} />
    </View>
  );
}

function routeSegment(href: string) {
  const parts = href.split('/');
  return parts.at(-1) ?? href;
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    minHeight: 56,
  },
  menuButton: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.full,
    height: 48,
    justifyContent: 'center',
    width: 48,
    ...shadows.card,
  },
  backButton: {
    alignItems: 'center',
    borderColor: colors.surface3,
    borderRadius: radii.full,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.96 }] },
  heading: { flex: 1 },
  eyebrow: {
    color: colors.textMuted,
    fontFamily: typography.familyBold,
    fontSize: typography.caption,
    fontWeight: typography.bold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.heading,
    fontWeight: typography.bold,
    lineHeight: 28,
  },
  actionPlaceholder: { width: 48 },
  modal: { flex: 1, flexDirection: 'row' },
  scrim: { backgroundColor: 'rgba(0, 18, 33, 0.48)', flex: 1 },
  drawer: {
    backgroundColor: colors.surface,
    height: '100%',
    maxWidth: 360,
    padding: spacing.lg,
    width: '84%',
    ...shadows.floating,
  },
  drawerHeader: {
    alignItems: 'center',
    borderBottomColor: colors.surface3,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
  },
  drawerEyebrow: {
    color: colors.brand,
    fontFamily: typography.familyBold,
    fontSize: typography.caption,
    fontWeight: typography.bold,
    letterSpacing: 1.2,
  },
  drawerTitle: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.title,
    fontWeight: typography.bold,
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: radii.full,
    height: sizes.touchTarget,
    justifyContent: 'center',
    width: sizes.touchTarget,
  },
  destinations: { gap: spacing.xs, paddingTop: spacing.lg },
  destination: {
    alignItems: 'center',
    borderRadius: radii.xl,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 54,
    paddingHorizontal: spacing.md,
  },
  destinationActive: { backgroundColor: colors.brandSubtle },
  destinationPressed: { backgroundColor: colors.surface2 },
  destinationText: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.familyMedium,
    fontSize: typography.body,
  },
  destinationTextActive: { color: colors.brand, fontWeight: typography.bold },
});
