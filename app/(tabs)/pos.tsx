import React, { useState } from 'react';
import { View, Pressable, ScrollView, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, IconBtn, Card, T } from '../../components/ui';
import { Sheet, Field, Btn, Empty } from '../../components/kit';
import { ProductIcon } from '../../components/ProductIcon';
import { useApp, GROUPS, receiptText, Method, Sale } from '../../lib/store';
import { colors, peso } from '../../constants/theme';

export default function POS() {
  const { products, cart, cartLines, totals, settings, addToCart, clearCart, checkout, open } = useApp();
  const [cat, setCat] = useState<string>('All');
  const [pay, setPay] = useState<Method>('Card');
  const [chargeOpen, setChargeOpen] = useState(false);
  const [received, setReceived] = useState('');
  const [receipt, setReceipt] = useState<Sale | null>(null);

  const visible = products.filter((p) => cat === 'All' || p.group === cat);
  const rec = parseFloat(received);
  const change = isNaN(rec) ? 0 : rec - totals.total;

  const startCharge = () => {
    if (totals.count === 0) return Alert.alert('Cart is empty', 'Tap a product to add it to the cart first.');
    setReceived(totals.total.toFixed(2));
    setChargeOpen(true);
  };

  const confirm = () => {
    if (pay === 'Cash' && (isNaN(rec) || rec < totals.total - 0.001))
      return Alert.alert('Not enough cash', 'Cash received must cover the total.');
    const sale = checkout(pay);
    setChargeOpen(false);
    setReceipt(sale);
  };

  return (
    <Screen>
      <Header sub="New sale" title="Point of Sale" right={<IconBtn name="scan-outline" onPress={() => open('scan')} />} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {['All', ...GROUPS].map((c) => {
          const on = c === cat;
          return (
            <Pressable key={c} onPress={() => setCat(c)} style={{ backgroundColor: on ? colors.lime : colors.chip, borderRadius: 20, paddingHorizontal: 16, height: 30, justifyContent: 'center' }}>
              <T w="semi" size={12} color={on ? '#000' : '#C8C8C8'}>{c}</T>
            </Pressable>
          );
        })}
      </ScrollView>

      {visible.length === 0 && <Empty text="No products in this group. Add some in the Products tab." />}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {visible.map((p) => {
          const q = cart[p.id] ?? 0;
          const sel = q > 0;
          const out = p.stock === 0;
          return (
            <Pressable
              key={p.id}
              onPress={() => (out ? Alert.alert('Out of stock', `${p.name} has no stock left.`) : addToCart(p.id, 1))}
              style={{
                width: '48.5%', borderRadius: 22, padding: 8, backgroundColor: colors.card, opacity: out ? 0.45 : 1,
                borderWidth: sel ? 2 : 1, borderColor: sel ? colors.lime : colors.border,
                shadowColor: colors.lime, shadowOpacity: sel ? 0.4 : 0, shadowRadius: 10, elevation: sel ? 6 : 0,
              }}
            >
              <View style={{ height: 86, borderRadius: 16, backgroundColor: colors.card2, alignItems: 'center', justifyContent: 'center' }}>
                <ProductIcon category={p.category} size={34} color={sel ? colors.lime : '#8C8C8C'} />
                {sel && (
                  <View style={{ position: 'absolute', right: 8, top: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }}>
                    <T w="bold" size={12} color="#000">{q}</T>
                  </View>
                )}
              </View>
              <T w="semi" size={12} style={{ marginTop: 10 }} numberOfLines={1}>{p.name}</T>
              <T w="bold" size={15} color={colors.lime} style={{ marginTop: 6, marginBottom: 6 }}>{peso(p.price)}</T>
            </Pressable>
          );
        })}
      </View>

      <Card style={{ padding: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T size={20} color="#E8E8E8">Checkout · {totals.count} items</T>
          <Pressable onPress={clearCart} hitSlop={8}><T w="semi" size={12} color={colors.lime}>Clear</T></Pressable>
        </View>

        {cartLines.length === 0 && <Empty icon="cart-outline" text="Your cart is empty." />}
        <View style={{ gap: 14, marginTop: 14 }}>
          {cartLines.map((l) => (
            <View key={l.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <T w="semi" size={12} numberOfLines={1}>{l.name}</T>
                <T size={10} color={colors.muted}>{peso(l.price)}{l.qty > 1 ? ` × ${l.qty}` : ''}</T>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0C0C0C', borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 3, gap: 10 }}>
                <Pressable onPress={() => addToCart(l.id, -1)} style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="remove" size={16} color="#fff" />
                </Pressable>
                <T w="semi" size={13}>{l.qty}</T>
                <Pressable onPress={() => addToCart(l.id, 1)} style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="add" size={16} color="#000" />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 12 }} />
        {[
          ['Subtotal', peso(totals.subtotal), '#fff'],
          [`Tax · ${settings.taxRate}%`, peso(totals.tax), '#fff'],
          ['Discount', '−' + peso(totals.discount), colors.mint],
        ].map(([l, v, c]) => (
          <View key={l} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <T size={11} color={colors.muted}>{l}</T>
            <T w="semi" size={11} color={c}>{v}</T>
          </View>
        ))}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <T w="bold" size={14}>Total</T>
          <T w="bold" size={26} color={colors.lime}>{peso(totals.total)}</T>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {([['Cash', 'cash-outline'], ['Card', 'card-outline'], ['E-wallet', 'phone-portrait-outline']] as const).map(([n, ic]) => {
            const on = pay === n;
            return (
              <Pressable key={n} onPress={() => setPay(n)} style={{ flex: 1, height: 42, borderRadius: 21, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: on ? '#0F1A05' : colors.chip, borderWidth: on ? 1.5 : 0, borderColor: colors.lime }}>
                <Ionicons name={ic} size={15} color={on ? colors.lime : '#BDBDBD'} />
                <T w="semi" size={11} color={on ? colors.lime : '#BDBDBD'}>{n}</T>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 26 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 22, paddingLeft: 12 }}>
          <T w="bold" size={13} color={colors.lime}>{totals.count}</T>
          <View>
            <T size={9} color={colors.muted}>CART TOTAL</T>
            <T w="bold" size={20}>{peso(totals.total)}</T>
          </View>
        </View>
        <Pressable onPress={startCharge} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.lime, borderRadius: 30, paddingHorizontal: 28, height: 52, shadowColor: colors.lime, shadowOpacity: 0.5, shadowRadius: 14, elevation: 10 }}>
          <T w="bold" size={16} color="#000">Charge</T>
          <Ionicons name="arrow-forward" size={18} color="#000" />
        </Pressable>
      </Card>

      <Sheet visible={chargeOpen} onClose={() => setChargeOpen(false)} title="Confirm payment">
        <View style={{ gap: 6, marginBottom: 14 }}>
          <T size={12} color={colors.muted}>{totals.count} item(s) · {pay}</T>
          <T w="extra" size={32} color={colors.lime}>{peso(totals.total)}</T>
        </View>
        {pay === 'Cash' && (
          <>
            <Field label="Cash received (₱)" value={received} onChangeText={setReceived} keyboardType="decimal-pad" />
            <T size={13} color={change >= 0 ? colors.mint : '#FF6B6B'} style={{ marginBottom: 14 }}>
              {change >= 0 ? `Change: ${peso(change)}` : `Short by ${peso(-change)}`}
            </T>
          </>
        )}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Btn label="Cancel" variant="ghost" onPress={() => setChargeOpen(false)} style={{ flex: 1 }} />
          <Btn label="Confirm" icon="checkmark" onPress={confirm} style={{ flex: 1.4 }} />
        </View>
      </Sheet>

      <Sheet visible={!!receipt} onClose={() => setReceipt(null)} title="Payment successful">
        {receipt && (
          <View style={{ gap: 6 }}>
            <T w="bold" size={15}>{settings.storeName}</T>
            <T size={11} color={colors.muted}>Receipt #{receipt.id} · {new Date(receipt.date).toLocaleString()}</T>
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />
            {receipt.lines.map((l) => (
              <View key={l.id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T size={12}>{l.name} × {l.qty}</T>
                <T size={12}>{peso(l.price * l.qty)}</T>
              </View>
            ))}
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T w="bold" size={15}>Total ({receipt.method})</T>
              <T w="bold" size={18} color={colors.lime}>{peso(receipt.total)}</T>
            </View>
            <T size={11} color={colors.muted} style={{ marginTop: 8 }}>{settings.footer}</T>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Btn label="Share" icon="share-outline" variant="ghost" style={{ flex: 1 }} onPress={() => Share.share({ message: receiptText(receipt, settings) })} />
              <Btn label="Done" style={{ flex: 1 }} onPress={() => setReceipt(null)} />
            </View>
          </View>
        )}
      </Sheet>
    </Screen>
  );
}
