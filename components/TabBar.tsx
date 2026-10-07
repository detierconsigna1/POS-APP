import React from 'react';
import { View, Pressable } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from './ui';
import { colors } from '../constants/theme';

const items: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  index: { label: 'Home', icon: 'home' },
  products: { label: 'Products', icon: 'cube' },
  pos: { label: 'POS', icon: 'bag-handle-outline' },
  reports: { label: 'Reports', icon: 'stats-chart' },
  settings: { label: 'Settings', icon: 'settings' },
};

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        position: 'absolute',
        left: 10,
        right: 10,
        bottom: Math.max(insets.bottom, 10),
        height: 78,
        borderRadius: 34,
        backgroundColor: '#121212',
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
      }}
    >
      {state.routes.map((route, index) => {
        const cfg = items[route.name];
        if (!cfg) return null;
        const focused = state.index === index;
        const press = () => {
          const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
        };

        if (route.name === 'pos') {
          const size = focused ? 64 : 56;
          return (
            <View key={route.key} style={{ flex: 1, alignItems: 'center' }}>
              <Pressable
                onPress={press}
                style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: colors.lime,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: focused ? -14 : 0,
                  shadowColor: colors.lime,
                  shadowOpacity: 0.6,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 10,
                }}
              >
                <Ionicons name="bag-handle-outline" size={28} color="#000" />
              </Pressable>
              {focused && (
                <T size={11} color={colors.muted} style={{ marginTop: 3 }}>
                  POS
                </T>
              )}
            </View>
          );
        }

        return (
          <Pressable key={route.key} onPress={press} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: '#050505',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={cfg.icon} size={19} color={focused ? colors.lime : '#9A9A9A'} />
            </View>
            <T size={11} color={focused ? colors.lime : colors.muted} w={focused ? 'semi' : 'regular'}>
              {cfg.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}
