import React from 'react';
import { View, Modal, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T } from './ui';
import { colors, font } from '../constants/theme';

export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={{ backgroundColor: '#121212', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: colors.border, padding: 18, paddingBottom: 28, maxHeight: '90%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <T w="bold" size={20}>{title}</T>
            <Pressable onPress={onClose} hitSlop={10} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close" size={18} color="#fff" />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Field({ label, style, ...p }: TextInputProps & { label: string }) {
  return (
    <View style={{ marginBottom: 12, flex: 1 }}>
      <T size={11} color={colors.muted} style={{ marginBottom: 6, marginLeft: 4 }}>{label}</T>
      <TextInput
        placeholderTextColor={colors.dim}
        {...p}
        style={[{ height: 46, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, color: '#fff', fontFamily: font.regular, fontSize: 14 }, style]}
      />
    </View>
  );
}

export function Btn({ label, onPress, variant = 'primary', icon, style }: { label: string; onPress: () => void; variant?: 'primary' | 'ghost' | 'danger'; icon?: keyof typeof Ionicons.glyphMap; style?: any }) {
  const bg = variant === 'primary' ? colors.lime : variant === 'danger' ? '#2A1212' : colors.chip;
  const fg = variant === 'primary' ? '#000' : variant === 'danger' ? '#FF6B6B' : '#fff';
  return (
    <Pressable onPress={onPress} style={[{ height: 48, borderRadius: 24, backgroundColor: bg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20, borderWidth: variant === 'danger' ? 1 : 0, borderColor: '#4A2020' }, style]}>
      {icon && <Ionicons name={icon} size={18} color={fg} />}
      <T w="bold" size={14} color={fg}>{label}</T>
    </Pressable>
  );
}

export function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ backgroundColor: on ? colors.lime : colors.chip, borderRadius: 20, paddingHorizontal: 14, height: 32, justifyContent: 'center' }}>
      <T w="semi" size={12} color={on ? '#000' : '#C8C8C8'}>{label}</T>
    </Pressable>
  );
}

export function Empty({ icon = 'file-tray-outline', text }: { icon?: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={{ alignItems: 'center', padding: 30, gap: 10 }}>
      <Ionicons name={icon} size={36} color={colors.dim} />
      <T size={13} color={colors.muted} style={{ textAlign: 'center' }}>{text}</T>
    </View>
  );
}

export function ListRow({ title, sub, right, onPress }: { title: string; sub?: string; right?: React.ReactNode; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#242424' }}>
      <View style={{ flex: 1 }}>
        <T w="semi" size={14}>{title}</T>
        {sub ? <T size={11} color={colors.muted} style={{ marginTop: 2 }}>{sub}</T> : null}
      </View>
      {right}
    </Pressable>
  );
}
