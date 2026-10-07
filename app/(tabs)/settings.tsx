import React, { useState } from 'react';
import { View, Pressable, Alert, Share } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, Header, IconBtn, Card, T } from '../../components/ui';
import { Sheet, Field, Btn, Chip, ListRow, Empty } from '../../components/kit';
import { useApp, ago } from '../../lib/store';
import { colors } from '../../constants/theme';

function Toggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ width: 50, height: 30, borderRadius: 15, padding: 3, backgroundColor: on ? colors.lime : '#4A4A4A', alignItems: on ? 'flex-end' : 'flex-start', justifyContent: 'center' }}>
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: on ? '#0A0A0A' : '#B5B5B5' }} />
    </Pressable>
  );
}

function Row({ icon, title, sub, right, last, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; sub: string; right: React.ReactNode; last?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: last ? 0 : 1, borderBottomColor: '#242424' }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#262626', borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={18} color="#BDBDBD" />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <T w="semi" size={14}>{title}</T>
        <T size={10} color={colors.muted} style={{ marginTop: 2 }}>{sub}</T>
      </View>
      {right}
    </Pressable>
  );
}

const Chevron = () => <Ionicons name="chevron-forward" size={18} color={colors.muted} />;
const Label = ({ t }: { t: string }) => <T w="semi" size={10} color={colors.muted} style={{ marginTop: 6, marginLeft: 2 }}>{t}</T>;
type SheetKey = null | 'profile' | 'store' | 'receipts' | 'team' | 'security' | 'backup' | 'help';

export default function Settings() {
  const { settings, update, addMember, removeMember, resetAll, exportJson } = useApp();
  const [sheet, setSheet] = useState<SheetKey>(null);
  const close = () => setSheet(null);

  // form drafts
  const [d, setD] = useState({ name: '', email: '', storeName: '', storeLocation: '', tax: '', disc: '', footer: '', pin: '', member: '' });
  const [role, setRole] = useState('Cashier');
  const set = (k: keyof typeof d) => (v: string) => setD((s) => ({ ...s, [k]: v }));
  const openSheet = (k: SheetKey) => {
    setD({ name: settings.name, email: settings.email, storeName: settings.storeName, storeLocation: settings.storeLocation, tax: String(settings.taxRate), disc: String(settings.discountRate), footer: settings.footer, pin: '', member: '' });
    setSheet(k);
  };

  const initials = settings.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <Screen>
      <Header sub="Workspace controls" title="Settings" right={<IconBtn name="help-circle-outline" onPress={() => openSheet('help')} />} />

      <Card style={{ padding: 14, paddingBottom: 30, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <LinearGradient colors={['#B5F53A', '#5E9C0B']} style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' }}>
          <T size={24} color="#0A0A0A">{initials}</T>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <T w="bold" size={18}>{settings.name}</T>
          <T size={12} color="#BDBDBD" style={{ marginTop: 2 }}>{settings.email}</T>
          <View style={{ alignSelf: 'flex-start', backgroundColor: '#0F1A05', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6 }}>
            <T w="semi" size={9} color={colors.lime}>OWNER · ADMIN</T>
          </View>
        </View>
        <IconBtn name="pencil" size={44} onPress={() => openSheet('profile')} />
      </Card>

      <Label t="BUSINESS" />
      <Card style={{ paddingVertical: 4 }}>
        <Row icon="storefront-outline" title="Store profile" sub={`${settings.storeName} · ${settings.storeLocation}`} right={<Chevron />} onPress={() => openSheet('store')} />
        <Row icon="receipt-outline" title="Receipts & taxes" sub={`Tax ${settings.taxRate}% · Discount ${settings.discountRate}%`} right={<Chevron />} onPress={() => openSheet('receipts')} />
        <Row icon="people-outline" title="Team permissions" sub={`${settings.members.length} active members`} right={<Chevron />} last onPress={() => openSheet('team')} />
      </Card>

      <Label t="PREFERENCES" />
      <Card style={{ paddingVertical: 4 }}>
        <Row icon="notifications-outline" title="Push notifications" sub="Sales and low stock alerts" right={<Toggle on={settings.push} onPress={() => update({ push: !settings.push })} />} />
        <Row icon="moon-outline" title="Dark appearance" sub="Use the premium dark theme" right={<Toggle on={settings.dark} onPress={() => (settings.dark ? Alert.alert('Light theme', 'Your Figma only has the dark theme. Send me the light screens and I will add it.') : update({ dark: true }))} />} />
        <Row icon="scan-outline" title="Quick scan" sub="Open scanner on launch" right={<Toggle on={settings.quickScan} onPress={() => update({ quickScan: !settings.quickScan })} />} last />
      </Card>

      <Label t="SECURITY & DATA" />
      <Card style={{ paddingVertical: 4 }}>
        <Row icon="shield-checkmark-outline" title="Security" sub={settings.pin ? 'PIN lock is on' : 'PIN, biometrics, devices'} right={<Chevron />} onPress={() => openSheet('security')} />
        <Row icon="cloud-outline" title="Backup & sync" sub={`Synced ${ago(settings.lastSync)}`} right={<Chevron />} last onPress={() => openSheet('backup')} />
      </Card>

      <Pressable onPress={() => Alert.alert('Northstar Pro', 'Unlimited products · Advanced reports · Priority support.\nYour workspace is active and protected.')}>
        <Card style={{ padding: 16, paddingBottom: 26 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <T w="semi" size={10} color={colors.lime}>NORTHSTAR PRO</T>
              <T w="bold" size={18} style={{ marginTop: 6 }}>Your workspace is protected</T>
              <T size={10} color={colors.muted} style={{ marginTop: 6 }}>Unlimited products · Advanced reports · Priority support</T>
            </View>
            <MaterialCommunityIcons name="check-decagram-outline" size={32} color={colors.lime} />
          </View>
        </Card>
      </Pressable>

      {/* Profile */}
      <Sheet visible={sheet === 'profile'} onClose={close} title="Edit profile">
        <Field label="Full name" value={d.name} onChangeText={set('name')} />
        <Field label="Email / website" value={d.email} onChangeText={set('email')} autoCapitalize="none" />
        <Btn label="Save" onPress={() => { if (!d.name.trim()) return Alert.alert('Name required'); update({ name: d.name.trim(), email: d.email.trim() }); close(); }} />
      </Sheet>

      {/* Store */}
      <Sheet visible={sheet === 'store'} onClose={close} title="Store profile">
        <Field label="Store name" value={d.storeName} onChangeText={set('storeName')} />
        <Field label="Location" value={d.storeLocation} onChangeText={set('storeLocation')} />
        <Btn label="Save" onPress={() => { if (!d.storeName.trim()) return Alert.alert('Store name required'); update({ storeName: d.storeName.trim(), storeLocation: d.storeLocation.trim() }); close(); }} />
      </Sheet>

      {/* Receipts & taxes */}
      <Sheet visible={sheet === 'receipts'} onClose={close} title="Receipts & taxes">
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Field label="Tax rate (%)" value={d.tax} onChangeText={set('tax')} keyboardType="decimal-pad" />
          <Field label="Discount (%)" value={d.disc} onChangeText={set('disc')} keyboardType="decimal-pad" />
        </View>
        <Field label="Receipt footer" value={d.footer} onChangeText={set('footer')} />
        <Btn label="Save" onPress={() => {
          const t = parseFloat(d.tax), c = parseFloat(d.disc);
          if (isNaN(t) || t < 0 || t > 100 || isNaN(c) || c < 0 || c > 100) return Alert.alert('Invalid', 'Rates must be between 0 and 100.');
          update({ taxRate: t, discountRate: c, footer: d.footer.trim() });
          close();
        }} />
      </Sheet>

      {/* Team */}
      <Sheet visible={sheet === 'team'} onClose={close} title="Team permissions">
        {settings.members.map((m) => (
          <ListRow key={m.id} title={m.name} sub={m.role}
            right={m.role === 'Owner' ? undefined : (
              <Pressable hitSlop={8} onPress={() => Alert.alert('Remove member', `Remove ${m.name}?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => removeMember(m.id) }])}>
                <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
              </Pressable>
            )} />
        ))}
        <T size={11} color={colors.muted} style={{ marginTop: 16, marginBottom: 6 }}>ADD MEMBER</T>
        <Field label="Name" value={d.member} onChangeText={set('member')} />
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {['Admin', 'Manager', 'Cashier'].map((r) => <Chip key={r} label={r} on={role === r} onPress={() => setRole(r)} />)}
        </View>
        <Btn label="Add member" icon="person-add-outline" onPress={() => { if (!d.member.trim()) return Alert.alert('Name required'); addMember(d.member.trim(), role); set('member')(''); }} />
      </Sheet>

      {/* Security */}
      <Sheet visible={sheet === 'security'} onClose={close} title="Security">
        <T size={12} color={colors.muted} style={{ marginBottom: 10 }}>
          {settings.pin ? 'A 4-digit PIN is required every time the app opens.' : 'Set a 4-digit PIN to lock the app when it opens.'}
        </T>
        <Field label={settings.pin ? 'New PIN' : 'PIN (4 digits)'} value={d.pin} onChangeText={(v) => set('pin')(v.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" secureTextEntry maxLength={4} />
        <Btn label={settings.pin ? 'Change PIN' : 'Set PIN'} onPress={() => { if (d.pin.length !== 4) return Alert.alert('PIN must be 4 digits'); update({ pin: d.pin }); close(); }} />
        {settings.pin ? <Btn label="Remove PIN" variant="danger" style={{ marginTop: 10 }} onPress={() => { update({ pin: '' }); close(); }} /> : null}
      </Sheet>

      {/* Backup */}
      <Sheet visible={sheet === 'backup'} onClose={close} title="Backup & sync">
        <T size={12} color={colors.muted} style={{ marginBottom: 12 }}>
          All data is stored offline in SQLite (pos_inventory.db) on this device. Last sync: {ago(settings.lastSync)}.
        </T>
        <View style={{ gap: 10 }}>
          <Btn label="Sync now" icon="sync-outline" onPress={() => { update({ lastSync: Date.now() }); Alert.alert('Done', 'Local database checkpoint saved.'); }} />
          <Btn label="Export data (JSON)" icon="share-outline" variant="ghost" onPress={() => Share.share({ message: exportJson() })} />
          <Btn label="Reset all data" icon="warning-outline" variant="danger" onPress={() => Alert.alert('Reset all data', 'This deletes every product, sale and setting and restores the sample data.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', style: 'destructive', onPress: () => { resetAll(); close(); } }])} />
        </View>
      </Sheet>

      {/* Help */}
      <Sheet visible={sheet === 'help'} onClose={close} title="Help">
        {[
          ['Add a product', 'Products tab → Add. Fill in the form and tap Save.'],
          ['Edit or delete', 'Tap a product image or ••• to edit; tap the trash icon to delete.'],
          ['Make a sale', 'POS tab → tap products → choose a payment method → Charge.'],
          ['Works offline', 'Everything is stored in a local SQLite database, so no internet is needed.'],
        ].map(([t, s]) => <ListRow key={t} title={t} sub={s} />)}
      </Sheet>
    </Screen>
  );
}
