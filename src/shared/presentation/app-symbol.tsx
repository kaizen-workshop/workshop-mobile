import type { ComponentProps, ReactNode } from 'react';
import type { ColorValue } from 'react-native';
import { Text } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { typography } from '@/shared/theme';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

export function AppSymbol({
  color,
  fallback,
  name,
  size = 22,
}: Readonly<{
  color: ColorValue;
  fallback: ReactNode;
  name: SymbolName;
  size?: number;
}>) {
  return (
    <SymbolView
      fallback={
        <Text
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={{ color, fontFamily: typography.familyBold, fontSize: size }}
        >
          {fallback}
        </Text>
      }
      name={name}
      size={size}
      tintColor={color}
    />
  );
}
