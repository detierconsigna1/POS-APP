import React from 'react';
import { View, Text, TextProps, ViewProps, ViewStyle, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, Pattern, Line, Rect } from 'react-native-svg';
import { colors, font, radius } from '../constants/theme';
import { useApp } from '../lib/store';

type TProps = TextProps & { w?: keyof typeof font; size?: number; color?: string };
export function T({ w = 'regular', size = 14, color = colors.white, style, ...p }: TProps) {
  return <Text {...p} style={[{ fontFamily: font[w], fontSize: size, color }, style]} />;
}

export function Card({ style, ...p }: ViewProps) {
  return (
    <View
      {...p}
      style={[
        {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.card,
          padding: 16,
        },
        style,
      ]}
    />
  );
}

export function IconBtn({
  name,
  onPress,
  size = 44,
  bg = colors.black,
  color = colors.white,
}: {
  name: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  bg?: string;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={name} size={size * 0.5} color={color} />
    </Pressable>
  );
}

export function Pill({
  label,
  color = colors.white,
  bg = colors.chip,
  borderColor,
  style,
  size = 12,
}: {
  label: string;
  color?: string;
  bg?: string;
  borderColor?: string;
  style?: ViewStyle;
  size?: number;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: radius.pill,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderWidth: borderColor ? 1 : 0,
          borderColor,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <T w="semi" size={size} color={color}>
        {label}
      </T>
    </View>
  );
}

export function Header({
  sub,
  title,
  right,
  left,
}: {
  sub: string;
  title: string;
  right?: React.ReactNode;
  left?: React.ReactNode;
}) {
  const { open } = useApp();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, marginBottom: 6 }}>
      {left ?? <IconBtn name="menu" onPress={() => open('menu')} />}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <T size={12} color={colors.muted}>
          {sub}
        </T>
        <T w="bold" size={22}>
          {title}
        </T>
      </View>
      {right}
    </View>
  );
}

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 150, gap: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Diagonal-striped fill (used for empty progress and inactive chart bars). */
export function Stripes({
  color = '#3A3A3A',
  bg = '#1E1E1E',
  gap = 7,
  style,
}: {
  color?: string;
  bg?: string;
  gap?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="stripes" width={gap} height={gap} patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
            <Rect width={gap} height={gap} fill={bg} />
            <Line x1="0" y1="0" x2={gap} y2="0" stroke={color} strokeWidth="2" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#stripes)" />
      </Svg>
    </View>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2, marginTop: 4 }}>
      <T size={20} color="#E8E8E8">
        {title}
      </T>
      {action ? (
        <T w="semi" size={13} color={colors.lime}>
          {action}
        </T>
      ) : null}
    </View>
  );
}
