import React, { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { Screen, Header, IconBtn, Card, T, Pill, SectionTitle, Stripes } from '../../components/ui';
import { useApp } from '../../lib/store';
import { colors, peso } from '../../constants/theme';

function Donut({ data, label, size = 112, stroke = 16 }: { data: { pct: number; color: string }[]; label: string; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {data.map((d, i) => {
          const len = (c * d.pct) / 100;
          const el = (
            <Circle key={i} cx={size / 2} cy={size / 2} r={r} stroke={d.color} strokeWidth={stroke} fill="none"
              strokeDasharray={`${Math.max(len - 4, 0)} ${c}`} strokeDashoffset={-offset} />
          );
          offset += len;
          return el;
        })}
      </Svg>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <T w="bold" size={13}>{label}</T>
        <T size={8} color={colors.muted}>TOTAL</T>
      </View>
    </View>
  );
}

function Metric({ title, value, sub, subColor, icon, lime }: { title: string; value: string; sub: string; subColor: string; icon: React.ReactNode; lime?: boolean }) {
  return (
    <Card style={{ flex: 1, padding: 12, paddingVertical: 14, borderRadius: 20, backgroundColor: lime ? colors.lime : colors.card, borderColor: lime ? colors.lime : colors.border, shadowColor: colors.lime, shadowOpacity: lime ? 0.35 : 0, shadowRadius: 12, elevation: lime ? 8 : 0 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <T w="semi" size={12} color={lime ? '#111' : '#BDBDBD'}>{title}</T>
        {icon}
      </View>
      <T w="bold" size={24} color={lime ? '#000' : '#fff'} style={{ marginTop: 10 }}>{value}</T>
      <T size={11} color={subColor} style={{ marginTop: 6 }}>{sub}</T>
    </Card>
  );
}

export default function Home() {
  const { sales, settings, setSearch, open } = useApp();
  const router = useRouter();
  const [q, setQ] = useState('');
  const dark = '#9A9A9A';

  // Baseline demo numbers + live sales recorded today in SQLite
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const today = sales.filter((s) => s.date >= start.getTime());
  const by = (m: string) => today.filter((s) => s.method === m).reduce((a, s) => a + s.total, 0);
  const cash = 44993.52 + by('Cash'), card = 22496.76 + by('Card'), ew = 10623.47 + by('E-wallet');
  const total = cash + card + ew;
  const todayTotal = today.reduce((a, s) => a + s.total, 0);
  const units = today.reduce((a, s) => a + s.lines.reduce((x, l) => x + l.qty, 0), 0);
  const pct = (x: number) => (x / total) * 100;
  const rp = (x: number) => Math.round(pct(x));

  const submitSearch = () => { setSearch(q.trim()); router.navigate('/products'); };

  return (
    <Screen>
      <Header sub="Welcome back" title={settings.name} right={<IconBtn name="notifications-outline" onPress={() => open('notif')} />} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ flex: 1, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 }}>
          <Ionicons name="search" size={20} color={colors.muted} />
          <TextInput
            value={q} onChangeText={setQ} onSubmitEditing={submitSearch} returnKeyType="search"
            placeholder="Search order, product..." placeholderTextColor={colors.muted}
            style={{ flex: 1, color: '#fff', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
          />
        </View>
        <Pressable onPress={() => open('scan')} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="scan-outline" size={22} color="#000" />
        </Pressable>
      </View>

      <Pressable onPress={() => router.navigate('/reports')}>
        <SectionTitle title="Performance today" action="View report" />
      </Pressable>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Card style={{ flex: 1, padding: 14, borderRadius: 20 }}>
          <T size={11} color={colors.muted}>TOTAL SALES</T>
          <T w="bold" size={26} style={{ marginTop: 10 }} adjustsFontSizeToFit numberOfLines={1}>{peso(total)}</T>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <T size={10} color={colors.muted}>{today.length} sale(s) today</T>
            <Pill label="+8.2%" color={colors.mint} bg="#1D2B24" size={11} />
          </View>
        </Card>
        <Card style={{ flex: 1, padding: 14, borderRadius: 20 }}>
          <T size={11} color={colors.muted}>PENDING PAYMENTS</T>
          <T w="bold" size={26} color={colors.yellow} style={{ marginTop: 10 }} adjustsFontSizeToFit numberOfLines={1}>₱12,498.20</T>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <T size={10} color={colors.muted}>USD</T>
            <T size={10} color={colors.yellow}>3 awaiting</T>
          </View>
        </Card>
      </View>

      <Card style={{ padding: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T size={20} color="#E8E8E8">Payment methods used</T>
          <T w="semi" size={12} color={colors.lime}>Today</T>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 18 }}>
          <Donut
            label={`₱${(total / 1000).toFixed(1)}k`}
            data={[{ pct: pct(cash), color: colors.lime }, { pct: pct(card), color: colors.yellow }, { pct: pct(ew), color: colors.mint }]}
          />
          <View style={{ flex: 1, gap: 8 }}>
            {[
              { n: 'Cash', c: colors.lime, v: `${peso(cash)} · ${rp(cash)}%` },
              { n: 'Card', c: colors.yellow, v: `${peso(card)} · ${rp(card)}%` },
              { n: 'E-wallet', c: colors.mint, v: `${peso(ew)} · ${rp(ew)}%` },
            ].map((x) => (
              <View key={x.n} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: x.c }} />
                <T size={12} color={colors.muted} style={{ width: 58, marginLeft: 8 }}>{x.n}</T>
                <Pill label={x.v} size={10} bg="#0C0C0C" style={{ paddingVertical: 5 }} />
              </View>
            ))}
          </View>
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Metric lime title="Total Revenue" value={peso(87487.4 + todayTotal)} sub="+2.9% vs last month" subColor="#2B3D00" icon={<Ionicons name="wallet" size={16} color="#111" />} />
        <Metric title="Total Orders" value={(1842 + today.length).toLocaleString()} sub="+6.4% this month" subColor={colors.mint} icon={<Ionicons name="document-text" size={16} color={dark} />} />
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Metric title="Shipments" value="324" sub="18 in transit" subColor={colors.mint} icon={<MaterialCommunityIcons name="truck" size={18} color={dark} />} />
        <Metric title="Product Sales" value={(2608 + units).toLocaleString()} sub="+4.1% this month" subColor={colors.mint} icon={<Ionicons name="cube" size={16} color={dark} />} />
      </View>

      <Card style={{ padding: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <T size={18} color="#E8E8E8">Sales target</T>
            <T size={11} color={colors.muted}>$13,800 of $20,000</T>
          </View>
          <T w="bold" size={28} color={colors.lime}>69%</T>
        </View>
        <View style={{ flexDirection: 'row', height: 12, marginTop: 12, borderRadius: 6, overflow: 'hidden' }}>
          <View style={{ flex: 69, backgroundColor: colors.lime, borderRadius: 6 }} />
          <Stripes style={{ flex: 31, height: 12 }} />
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Card style={{ flex: 1, padding: 14 }}>
          <T size={15} color="#E8E8E8">Sales overview</T>
          <T size={10} color={colors.muted}>JAN — MAY</T>
          <Pill label="+12.4%" color={colors.mint} bg="#1D2B24" size={11} style={{ position: 'absolute', right: 12, top: 12 }} />
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 150, marginTop: 10 }}>
            {[58, 88, 66, 102, 128].map((h, i) => {
              const last = i === 4;
              return (
                <View key={i} style={{ alignItems: 'center' }}>
                  {last && (
                    <View style={{ backgroundColor: colors.lime, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2, marginBottom: 3 }}>
                      <T w="bold" size={9} color="#000">₱78k</T>
                    </View>
                  )}
                  <View style={{ width: 30, height: h, borderRadius: 8, backgroundColor: last ? colors.lime : '#242424', borderWidth: last ? 0 : 1, borderColor: colors.border }} />
                </View>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            {['J', 'F', 'M', 'A', 'M'].map((m, i) => (
              <T key={i} size={9} color={i === 4 ? colors.lime : colors.muted} style={{ width: 30, textAlign: 'center' }}>{m}</T>
            ))}
          </View>
        </Card>

        <View style={{ flex: 1, gap: 10 }}>
          <Card style={{ padding: 12, borderRadius: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T size={12} color="#E8E8E8">Order time</T>
              <T size={9} color={colors.lime}>12–2 PM</T>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
              {['#262626', '#6BA512', '#A3F31B', '#6BA512', '#262626', '#6BA512', '#A3F31B',
                '#A3F31B', '#6BA512', '#262626', '#262626', '#6BA512', '#A3F31B', '#6BA512', '#A3F31B'].map((c, i) => (
                <View key={i} style={{ width: 22, height: 11, borderRadius: 4, backgroundColor: c }} />
              ))}
            </View>
          </Card>
          <Card style={{ padding: 12, borderRadius: 20 }}>
            <T size={12} color="#E8E8E8">Market demand</T>
            <View style={{ gap: 8, marginTop: 8 }}>
              {([['Essentials', 85], ['Apparel', 60], ['Snacks', 42]] as const).map(([n, p]) => (
                <View key={n} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <T size={9} color={colors.muted} style={{ width: 52 }}>{n}</T>
                  <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: '#2A2A2A' }}>
                    <View style={{ width: `${p}%`, height: 6, borderRadius: 3, backgroundColor: colors.lime }} />
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </View>
      </View>
    </Screen>
  );
}
