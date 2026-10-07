import React, { useState } from 'react';
import { View, Pressable, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { Screen, Header, IconBtn, Card, T, Pill, SectionTitle, Stripes } from '../../components/ui';
import { Sheet, Btn, Empty, ListRow } from '../../components/kit';
import { useApp } from '../../lib/store';
import { colors, peso } from '../../constants/theme';

type R = { label: string; labels: string[]; values: number[]; total?: number; change: string; prev: string; onShare: number; onChg: string; offChg: string };
const RANGES: Record<string, R> = {
  Daily: { label: 'TODAY', labels: ['6a', '8a', '10a', '12p', '2p', '4p', '6p', '8p'], values: [8, 14, 22, 35, 28, 31, 40, 18], change: '+5.4%', prev: '$2,840.10', onShare: 61, onChg: '+9.8%', offChg: '−1.2%' },
  Weekly: { label: 'OCT 12 — OCT 18', labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], values: [165, 220, 172, 268, 190, 303, 224], total: 1542309.13, change: '+12.8%', prev: '$21,879.20', onShare: 68, onChg: '+14.2%', offChg: '−2.1%' },
  Monthly: { label: 'OCT 2026', labels: ['W1', 'W2', 'W3', 'W4'], values: [1180, 1460, 1630, 1890], change: '+18.3%', prev: '$88,102.00', onShare: 66, onChg: '+16.0%', offChg: '+1.4%' },
};

function ShareCard({ icon, title, tag, tagColor, tagBg, amount, share, color, change, changeColor }: any) {
  return (
    <Card style={{ flex: 1, padding: 14, borderRadius: 22 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={icon} size={18} color={color} />
          </View>
          <T w="medium" size={13}>{title}</T>
        </View>
        <Pill label={tag} color={tagColor} bg={tagBg} size={10} />
      </View>
      <T size={20} style={{ marginTop: 14 }} adjustsFontSizeToFit numberOfLines={1}>{amount}</T>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <T size={10} color={colors.muted}>Revenue share</T>
        <T w="semi" size={11} color={color}>{share}%</T>
      </View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: '#2A2A2A', marginTop: 5 }}>
        <View style={{ width: `${share}%`, height: 8, borderRadius: 4, backgroundColor: color }} />
      </View>
      <T size={10} color={changeColor} style={{ marginTop: 10 }}>{change} from last period</T>
    </Card>
  );
}

function LineChart({ values, labels, sel, onSel, height }: { values: number[]; labels: string[]; sel: number; onSel: (i: number) => void; height: number }) {
  const [w, setW] = useState(0);
  const max = Math.max(...values);
  const pts = values.map((v, i) => ({ x: 16 + ((w - 32) * i) / Math.max(values.length - 1, 1), y: height - 24 - (v / max) * (height - 60) }));
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height }}>
      {w > 0 && (
        <>
          <Svg width={w} height={height}>
            <Polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} stroke={colors.lime} strokeWidth={3} fill="none" />
            {pts.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={i === sel ? 7 : 4} fill={i === sel ? colors.lime : '#2A2A2A'} stroke={colors.lime} strokeWidth={2} />)}
          </Svg>
          {pts.map((p, i) => (
            <Pressable key={i} onPress={() => onSel(i)} style={{ position: 'absolute', left: p.x - 20, top: 0, width: 40, height }} />
          ))}
          <View style={{ position: 'absolute', left: Math.min(Math.max(pts[sel].x - 28, 0), w - 56), top: Math.max(pts[sel].y - 34, 0), backgroundColor: colors.lime, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 }}>
            <T w="bold" size={10} color="#000">₱{values[sel]}k</T>
          </View>
        </>
      )}
    </View>
  );
}

export default function Reports() {
  const { sales, voidSale, settings } = useApp();
  const [range, setRange] = useState('Weekly');
  const [sel, setSel] = useState(5);
  const [mode, setMode] = useState<'line' | 'bar'>('bar');
  const [detailsOpen, setDetailsOpen] = useState(false);

  const r = RANGES[range];
  const si = Math.min(sel, r.values.length - 1);
  const live = sales.reduce((a, s) => a + s.total, 0);
  const total = (r.total ?? r.values.reduce((a, b) => a + b, 0) * 1000) + (range === 'Weekly' ? live : 0);
  const online = total * (r.onShare / 100);
  const MAX_H = 240;
  const maxV = Math.max(...r.values);

  const exportCsv = () => {
    const rows = [
      `Report,${range},${r.label}`, `Total revenue,${total.toFixed(2)}`, '', 'Period,Revenue (k PHP)',
      ...r.labels.map((l, i) => `${l},${r.values[i]}`), '', 'Sale ID,Date,Method,Total',
      ...sales.map((s) => `${s.id},${new Date(s.date).toISOString()},${s.method},${s.total.toFixed(2)}`),
    ];
    Share.share({ title: `${settings.storeName} report`, message: rows.join('\n') });
  };

  return (
    <Screen>
      <Header sub="Business intelligence" title="Reports" right={<IconBtn name="download-outline" onPress={exportCsv} />} />

      <View style={{ flexDirection: 'row', backgroundColor: '#0A0A0A', borderRadius: 28, borderWidth: 1, borderColor: colors.border, padding: 4, height: 50 }}>
        {Object.keys(RANGES).map((k) => {
          const on = k === range;
          return (
            <Pressable key={k} onPress={() => { setRange(k); setSel(RANGES[k].values.indexOf(Math.max(...RANGES[k].values))); }}
              style={{ flex: 1, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.lime : 'transparent' }}>
              <T w={on ? 'semi' : 'regular'} size={12} color={on ? '#000' : '#BDBDBD'}>{k}</T>
            </Pressable>
          );
        })}
      </View>

      <Card style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T w="semi" size={11} color={colors.muted}>TOTAL REVENUE · {range === 'Daily' ? 'TODAY' : range === 'Weekly' ? 'THIS WEEK' : 'THIS MONTH'}</T>
          <Pill label={r.change} color={colors.mint} bg="#1D2B24" borderColor="#2C2C2C" size={12} />
        </View>
        <T size={34} style={{ marginTop: 14 }} adjustsFontSizeToFit numberOfLines={1}>{peso(total)}</T>
        <T size={9} color={colors.muted} style={{ marginTop: 6 }}>vs {r.prev} previous period</T>
      </Card>

      <Card style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <T w="bold" size={17}>Revenue activity</T>
            <T size={10} color={colors.muted} style={{ marginTop: 2 }}>{r.label}</T>
          </View>
          <View style={{ flexDirection: 'row', backgroundColor: '#0A0A0A', borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 3, height: 34 }}>
            {(['line', 'bar'] as const).map((m) => (
              <Pressable key={m} onPress={() => setMode(m)} style={{ width: 38, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: mode === m ? colors.lime : 'transparent' }}>
                <Ionicons name={m === 'line' ? 'analytics-outline' : 'stats-chart'} size={16} color={mode === m ? '#000' : '#BDBDBD'} />
              </Pressable>
            ))}
          </View>
        </View>

        {mode === 'bar' ? (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: MAX_H + 40, marginTop: 6 }}>
            {r.values.map((v, i) => {
              const h = (v / maxV) * MAX_H;
              const on = i === si;
              const bw = r.values.length > 6 ? 30 : 40;
              return (
                <Pressable key={i} onPress={() => setSel(i)} style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                  {on && (
                    <View style={{ backgroundColor: colors.lime, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 }}>
                      <T w="bold" size={10} color="#000">₱{v}k</T>
                    </View>
                  )}
                  {on ? (
                    <LinearGradient colors={['#B5F53A', '#5E9C0B']} style={{ width: bw, height: h, borderRadius: 10, borderWidth: 1, borderColor: colors.lime }} />
                  ) : (
                    <Stripes style={{ width: bw, height: h, borderRadius: 10, borderWidth: 1, borderColor: '#333' }} />
                  )}
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={{ marginTop: 6 }}>
            <LineChart values={r.values} labels={r.labels} sel={si} onSel={setSel} height={MAX_H + 40} />
          </View>
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
          {r.labels.map((d, i) => (
            <T key={i} size={11} color={i === si ? colors.lime : colors.muted} w={i === si ? 'semi' : 'regular'} style={{ width: 36, textAlign: 'center' }}>{d}</T>
          ))}
        </View>
      </Card>

      <Pressable onPress={() => setDetailsOpen(true)}>
        <SectionTitle title="Sales performance" action="See details" />
      </Pressable>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <ShareCard icon="globe-outline" title="Online" tag="HIGH" tagColor={colors.mint} tagBg="#1D2B24" amount={peso(online)} share={r.onShare} color={colors.lime} change={r.onChg} changeColor={colors.mint} />
        <ShareCard icon="storefront-outline" title="Offline" tag="LOW" tagColor={colors.yellow} tagBg="#2A2A2A" amount={peso(total - online)} share={100 - r.onShare} color={colors.yellow} change={r.offChg} changeColor={colors.muted} />
      </View>

      <Sheet visible={detailsOpen} onClose={() => setDetailsOpen(false)} title="Sales history">
        {sales.length === 0 ? (
          <Empty icon="receipt-outline" text="No sales recorded yet. Complete a sale in POS and it will appear here (saved in SQLite)." />
        ) : (
          sales.map((s) => (
            <ListRow
              key={s.id}
              title={`${peso(s.total)} · ${s.method}`}
              sub={`#${s.id} · ${new Date(s.date).toLocaleString()} · ${s.lines.map((l) => `${l.name} ×${l.qty}`).join(', ')}`}
              right={
                <Pressable
                  hitSlop={8}
                  onPress={() => Alert.alert('Void sale', 'Delete this sale and return the items to stock?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Void', style: 'destructive', onPress: () => voidSale(s.id) },
                  ])}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                </Pressable>
              }
            />
          ))
        )}
        <Btn label="Export CSV" icon="download-outline" variant="ghost" onPress={exportCsv} style={{ marginTop: 14 }} />
      </Sheet>
    </Screen>
  );
}
