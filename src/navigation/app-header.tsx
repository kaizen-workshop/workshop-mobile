import { router, usePathname, type Href } from 'expo-router';
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Home,
  LayoutDashboard,
  Menu,
  Settings,
  UserRound,
  Users,
  X,
  ArrowLeft,
} from 'lucide-react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { canManage, useRole } from '@/auth/session';
import { useKeyboardVisible } from '@/shared/hooks';
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
  { label: 'Conversas', href: '/(authenticated)/groups', Icon: Users },
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
  showBack = false,
}: Readonly<{
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
  /** Adds a back arrow, shown only when there is a real previous screen. */
  showBack?: boolean;
}>) {
  return (
    <>
      <View style={styles.header}>
        {/* The real, fixed button is FloatingMenu; this keeps the title aligned with it. */}
        <View style={styles.menuSlot} />
        {showBack && router.canGoBack() ? (
          <Pressable
            accessibilityLabel="Voltar"
            accessibilityRole="link"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <ArrowLeft color={colors.text} size={23} />
          </Pressable>
        ) : null}
        <View style={styles.heading}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
        </View>
        {action ?? <View style={styles.actionPlaceholder} />}
      </View>
    </>
  );
}

/**
 * The one menu button of the app. It is fixed on the screen (it does not scroll away with the
 * content) and opens the drawer. It steps aside while the keyboard is open so it never covers
 * the field being typed in.
 */
export function FloatingMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const role = useRole();
  const items = canManage(role)
    ? [
        ...destinations,
        {
          label: 'Gestão',
          href: '/admin',
          Icon: LayoutDashboard,
        } as const,
      ]
    : destinations;

  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();

  return (
    <>
      {keyboardVisible ? null : (
        <Pressable
          accessibilityLabel="Abrir menu"
          accessibilityRole="button"
          onPress={() => setOpen(true)}
          style={({ pressed }) => [
            styles.menuButton,
            styles.floatingMenu,
            { top: insets.top + spacing.md },
            pressed && styles.pressed,
          ]}
        >
          <Menu color={colors.onBrand} size={25} strokeWidth={2.2} />
        </Pressable>
      )}

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
              {items.map(({ href, Icon, label }) => {
                const active = pathname.includes(routeSegment(href));
                return (
                  <Pressable
                    accessibilityRole="link"
                    key={href}
                    onPress={() => {
                      setOpen(false);
                      router.navigate(href as Href);
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

/**
 * Header for secondary screens. The menu button stays visible everywhere; the back arrow
 * appears next to it only when there is a real previous screen to return to.
 */
export function BackHeader({
  title,
  eyebrow,
}: Readonly<{
  title: string;
  eyebrow?: string;
  /** Ignored: with the menu always visible no screen needs a fallback destination. */
  fallback?: string;
}>) {
  return <AppHeader eyebrow={eyebrow} showBack title={title} />;
}

/**
 * Keeps the screen header (menu or back button) visible while content is
 * loading, failed or empty, so the person is never left without a way out.
 */
export function StatePage({
  children,
  eyebrow,
  fallback,
  kind,
  title,
}: Readonly<{
  children: React.ReactNode;
  eyebrow?: string;
  fallback?: string;
  kind: 'menu' | 'back';
  title: string;
}>) {
  return (
    <View style={styles.statePage}>
      <View style={styles.stateHeader}>
        {kind === 'back' ? (
          <BackHeader eyebrow={eyebrow} fallback={fallback} title={title} />
        ) : (
          <AppHeader eyebrow={eyebrow} title={title} />
        )}
      </View>
      {children}
    </View>
  );
}

function routeSegment(href: string) {
  const parts = href.split('/');
  return parts.at(-1) ?? href;
}

const styles = StyleSheet.create({
  statePage: { flex: 1 },
  stateHeader: {
    alignSelf: 'center',
    maxWidth: sizes.contentMaxWidth,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    minHeight: 56,
  },
  menuSlot: { height: 48, width: 48 },
  floatingMenu: {
    left: spacing.md,
    position: 'absolute',
    zIndex: 1000,
    ...shadows.floating,
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
