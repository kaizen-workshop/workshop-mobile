jest.mock('expo-router', () => ({
  Stack: () => null,
  router: {
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
    push: jest.fn(),
    replace: jest.fn(),
  },
  usePathname: jest.fn(() => '/'),
}));

jest.mock('lucide-react-native', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return new Proxy(
    { __esModule: true },
    {
      get(target, property) {
        if (property === '__esModule') return true;
        if (property in target) return target[property as keyof typeof target];
        return (props: Record<string, unknown>) =>
          React.createElement(View, {
            ...props,
            testID: `icon-${String(property)}`,
          });
      },
    },
  );
});
