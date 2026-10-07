import React, { useState } from 'react';
import { View, Modal, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp, LOW_STOCK, Product } from '../lib/store';
import { Sheet, Field, Btn, Empty, ListRow } from './kit';
import { T, Pill } from './ui';
import { colors, peso } from '../constants/theme';

function PinGate() {
  const { locked, unlock, settings } = useApp();
  const [v, setV] = useState('');
  const [err, setErr] = useState(false);
  const press = (d: string) => {
    const n = (v + d).slice(0, 4);
    setV(n); setErr(false);
    if (n.length === 4) {
      if (n === settings.pin) { setV(''); unlock(); }
      else { setErr(true); setTimeout(() => setV(''), 300); }
    }
  };
  return (
    <Modal visible={locked} animationType="fade" onRequestClose={() => {}}>
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <Ionicons name="lock-closed" size={36} color={colors.lime} />
        <T w="bold" size={22}>Enter your PIN</T>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: i < v.length ? (err ? '#FF6B6B' : colors.lime) : '#333' }} />
          ))}
        </View>
        <T size={12} color={err ? '#FF6B6B' : colors.muted}>{err ? 'Wrong PIN, try again' : 'Unlock to continue'}</T>
        <View style={{ width: 270, flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) =>
            k === '' ? <View key={i} style={{ width: 78, height: 62 }} /> : (
              <Pressable key={i} onPress={() => (k === '⌫' ? setV(v.slice(0, -1)) : press(k))}
                style={{ width: 78, height: 62, borderRadius: 31, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
                <T w="semi" size={22}>{k}</T>
              </Pressable>
            )
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function GlobalSheets() {
  const { sheet, open, products, sales, settings, update, addToCart, setSearch } = useApp();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [found, setFound] = useState<Product | null | undefined>(undefined);
  const close = () => { open(null); setCode(''); setFound(undefined); };
  const go = (path: string) => { close(); router.navigate(path as any); };

  const find = () => {
    const q = code.trim().toLowerCase();
    if (!q) return;
    setFound(products.find((p) => p.sku.toLowerCase() === q) ?? products.find((p) => p.name.toLowerCase().includes(q)) ?? null);
  };

  const low = products.filter((p) => p.stock <= LOW_STOCK);

  const links = [
    ['Home', 'home-outline', '/'], ['Products', 'cube-outline', '/products'], ['Point of Sale', 'bag-handle-outline', '/pos'],
    ['Reports', 'stats-chart-outline', '/reports'], ['Settings', 'settings-outline', '/settings'],
  ] as const;

  return (
    <>
      <PinGate />

      <Sheet visible={sheet === 'menu'} onClose={close} title="Menu">
        <T size={12} color={colors.muted} style={{ marginBottom: 6 }}>{settings.storeName} · {settings.storeLocation}</T>
        {links.map(([l, ic, path]) => (
          <ListRow key={l} title={l} onPress={() => go(path)} right={<Ionicons name={ic} size={20} color={colors.lime} />} />
        ))}
      </Sheet>

      <Sheet visible={sheet === 'scan'} onClose={close} title="Scan or enter code">
        <T size={12} color={colors.muted} style={{ marginBottom: 10 }}>
          Type a SKU or product name (a camera scanner can be added later).
        </T>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
          <Field label="SKU / barcode" value={code} onChangeText={setCode} autoCapitalize="characters" onSubmitEditing={find} returnKeyType="search" placeholder="e.g. BAT-AA4-24" />
          <Btn label="Find" onPress={find} style={{ marginBottom: 12 }} />
        </View>
        {found === null && <Empty icon="search-outline" text="No product found with that code." />}
        {found && (
          <View style={{ backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 10 }}>
            <T w="bold" size={16}>{found.name}</T>
            <T size={11} color={colors.muted}>{found.sku} · {found.stock} {found.unit} in stock</T>
            <T w="bold" size={20} color={colors.lime}>{peso(found.price)}</T>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Btn label="Add to cart" icon="add" style={{ flex: 1 }} onPress={() => { if (addToCart(found.id, 1)) go('/pos'); }} />
              <Btn label="View" variant="ghost" style={{ flex: 1 }} onPress={() => { setSearch(found.sku); go('/products'); }} />
            </View>
          </View>
        )}
      </Sheet>

      <Sheet visible={sheet === 'notif'} onClose={close} title="Notifications">
        {!settings.push ? (
          <View style={{ gap: 12 }}>
            <Empty icon="notifications-off-outline" text="Push notifications are turned off." />
            <Btn label="Turn on" onPress={() => update({ push: true })} />
          </View>
        ) : (
          <>
            <T w="semi" size={11} color={colors.muted} style={{ marginBottom: 4 }}>LOW STOCK</T>
            {low.length === 0 && <Empty icon="checkmark-circle-outline" text="All products are well stocked." />}
            {low.map((p) => (
              <ListRow key={p.id} title={p.name} sub={`${p.stock} ${p.unit} left`}
                onPress={() => { setSearch(p.name); go('/products'); }}
                right={<Pill label={p.stock === 0 ? 'OUT' : 'LOW'} color={colors.yellow} bg="#2A2A2A" size={10} />} />
            ))}
            <T w="semi" size={11} color={colors.muted} style={{ marginTop: 14, marginBottom: 4 }}>RECENT SALES</T>
            {sales.length === 0 && <Empty text="No sales yet." />}
            {sales.slice(0, 3).map((s) => (
              <ListRow key={s.id} title={peso(s.total)} sub={`${s.lines.length} item(s) · ${s.method} · ${new Date(s.date).toLocaleTimeString()}`} />
            ))}
          </>
        )}
      </Sheet>
    </>
  );
}
