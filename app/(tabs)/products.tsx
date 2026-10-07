import React, { useEffect, useState } from 'react';
import { View, TextInput, Pressable, ScrollView, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, T, Pill } from '../../components/ui';
import { Sheet, Field, Btn, Chip, Empty } from '../../components/kit';
import { ProductIcon } from '../../components/ProductIcon';
import { useApp, LOW_STOCK, GROUPS, Product, Group } from '../../lib/store';
import { searchProducts } from '../../src/services/db';
import { colors, peso } from '../../constants/theme';

const filters = ['Name', 'Stock', 'Price', 'Recently updated', 'Category'];

function ProductForm({ visible, onClose, editing }: { visible: boolean; onClose: () => void; editing: Product | null }) {
  const { saveProduct } = useApp();
  const [f, setF] = useState({ name: '', sku: '', category: '', unit: 'pcs', stock: '', price: '', buy: '' });
  const [group, setGroup] = useState<Group>('Essentials');

  useEffect(() => {
    if (!visible) return;
    if (editing) {
      setF({
        name: editing.name, sku: editing.sku, category: editing.category, unit: editing.unit,
        stock: String(editing.stock), price: String(editing.price), buy: String(editing.buy),
      });
      setGroup(editing.group);
    } else {
      setF({ name: '', sku: '', category: '', unit: 'pcs', stock: '', price: '', buy: '' });
      setGroup('Essentials');
    }
  }, [visible, editing]);

  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  const submit = () => {
    const price = parseFloat(f.price), buy = parseFloat(f.buy || '0'), stock = parseInt(f.stock, 10);
    if (!f.name.trim() || !f.sku.trim() || !f.category.trim() || !f.unit.trim())
      return Alert.alert('Validation Error', 'Name, SKU, category and unit are required.');
    if (isNaN(price) || price <= 0) return Alert.alert('Validation Error', 'Enter a valid selling price.');
    if (isNaN(stock) || stock < 0) return Alert.alert('Validation Error', 'Enter a valid stock quantity.');
    const err = saveProduct({
      id: editing?.id, name: f.name.trim(), sku: f.sku.trim().toUpperCase(), category: f.category.trim(),
      group, unit: f.unit.trim(), stock, price, buy: isNaN(buy) ? 0 : buy,
    });
    if (err) return Alert.alert('Error', err);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={editing ? 'Edit product' : 'New product'}>
      <Field label="Product name" value={f.name} onChangeText={set('name')} placeholder="e.g. AA Battery 4 Pack" />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Field label="SKU" value={f.sku} onChangeText={set('sku')} autoCapitalize="characters" placeholder="BAT-AA4-24" />
        <Field label="Category" value={f.category} onChangeText={set('category')} placeholder="Electronics" />
      </View>
      <T size={11} color={colors.muted} style={{ marginBottom: 6, marginLeft: 4 }}>POS group</T>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        {GROUPS.map((g) => <Chip key={g} label={g} on={group === g} onPress={() => setGroup(g)} />)}
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Field label="Stock" value={f.stock} onChangeText={set('stock')} keyboardType="numeric" placeholder="0" />
        <Field label="Unit" value={f.unit} onChangeText={set('unit')} placeholder="pcs" />
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Field label="Selling price (₱)" value={f.price} onChangeText={set('price')} keyboardType="decimal-pad" placeholder="0.00" />
        <Field label="Buy price (₱)" value={f.buy} onChangeText={set('buy')} keyboardType="decimal-pad" placeholder="0.00" />
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        <Btn label="Cancel" variant="ghost" onPress={onClose} style={{ flex: 1 }} />
        <Btn label={editing ? 'Save changes' : 'Save to SQLite'} onPress={submit} style={{ flex: 1.5 }} />
      </View>
    </Sheet>
  );
}

export default function Products() {
  const { version, search, setSearch, deleteProduct, adjustStock, open } = useApp();
  const [sort, setSort] = useState('Category');
  const [rows, setRows] = useState<Product[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [menuId, setMenuId] = useState<number | null>(null);

  // SQL-level search + sort (parameterized LIKE ?)
  useEffect(() => { setRows(searchProducts(search, sort)); }, [search, sort, version]);

  const menuP = rows.find((r) => r.id === menuId) ?? null;

  const confirmDelete = (p: Product) =>
    Alert.alert('Delete Confirmation', `Remove ${p.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { setMenuId(null); deleteProduct(p.id); } },
    ]);

  const header = (
    <View style={{ gap: 10 }}>
      <View style={{ marginTop: 4 }}>
        <T size={9} color={colors.muted}>SEARCH, SORT, AND MANAGE YOUR SELLABLE CATALOG</T>
        <T w="semi" size={32} style={{ marginTop: 2 }}>Products</T>
      </View>
      <Pressable
        onPress={() => { setEditing(null); setFormOpen(true); }}
        style={{
          position: 'absolute', right: 0, top: 8, flexDirection: 'row', alignItems: 'center', gap: 8,
          backgroundColor: colors.lime, borderRadius: 26, paddingHorizontal: 18, height: 42,
          shadowColor: colors.lime, shadowOpacity: 0.5, shadowRadius: 14, elevation: 10,
        }}
      >
        <Ionicons name="add" size={20} color="#000" />
        <T w="bold" size={14} color="#000">Add</T>
      </Pressable>

      <View style={{ height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10, marginTop: 6 }}>
        <Ionicons name="search" size={20} color={colors.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search name, SKU, or barcode"
          placeholderTextColor={colors.muted}
          style={{ flex: 1, color: '#fff', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
        />
        {search ? (
          <Pressable onPress={() => setSearch('')} hitSlop={8}><Ionicons name="close-circle" size={18} color={colors.muted} /></Pressable>
        ) : null}
        <Pressable onPress={() => open('scan')} hitSlop={8}><Ionicons name="scan-outline" size={22} color={colors.lime} /></Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {filters.map((f) => <Chip key={f} label={f} on={f === sort} onPress={() => setSort(f)} />)}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <FlatList
        data={rows}
        keyExtractor={(i) => String(i.id)}
        ListHeaderComponent={header}
        ListEmptyComponent={<Empty icon="search-outline" text="No products found in SQLite database." />}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 150, gap: 10 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        renderItem={({ item: p }) => {
          const low = p.stock <= LOW_STOCK;
          return (
            <Card style={{ padding: 10, flexDirection: 'row', gap: 14, borderRadius: 22 }}>
              <Pressable
                onPress={() => { setEditing(p); setFormOpen(true); }}
                style={{ width: 116, height: 132, borderRadius: 18, backgroundColor: colors.card2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
              >
                <ProductIcon category={p.category} color={low ? colors.yellow : colors.lime} />
              </Pressable>
              <View style={{ flex: 1, paddingTop: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <T w="bold" size={16} style={{ flex: 1 }} numberOfLines={1}>{p.name}</T>
                  <Pressable onPress={() => confirmDelete(p)} hitSlop={8} style={{ marginHorizontal: 8 }}>
                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                  </Pressable>
                  <Pressable onPress={() => setMenuId(p.id)} hitSlop={8}>
                    <Ionicons name="ellipsis-horizontal" size={18} color={colors.muted} />
                  </Pressable>
                </View>
                <T size={10} color={colors.muted} style={{ marginTop: 2 }}>{p.sku} | {p.category}</T>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <Pill label={`${p.stock} ${p.unit}`} color={low ? colors.yellow : colors.mint} bg={low ? '#2A2A2A' : '#1C1F1D'} borderColor={low ? undefined : '#2C2C2C'} />
                  {low && <T w="semi" size={10} color={colors.yellow}>{p.stock === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}</T>}
                </View>
                <T size={9} color={colors.muted} style={{ marginTop: 8 }}>SELLING PRICE</T>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <T w="extra" size={22}>{peso(p.price)}</T>
                  <T size={11} color={colors.muted} style={{ marginBottom: 4 }}>Buy {peso(p.buy)}</T>
                </View>
              </View>
            </Card>
          );
        }}
      />

      <ProductForm visible={formOpen} onClose={() => setFormOpen(false)} editing={editing} />

      <Sheet visible={!!menuP} onClose={() => setMenuId(null)} title={menuP?.name ?? ''}>
        {menuP && (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 12 }}>
              <View>
                <T size={11} color={colors.muted}>Stock on hand</T>
                <T w="bold" size={20}>{menuP.stock} {menuP.unit}</T>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable onPress={() => adjustStock(menuP.id, -1)} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="remove" size={22} color="#fff" />
                </Pressable>
                <Pressable onPress={() => adjustStock(menuP.id, 1)} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="add" size={22} color="#000" />
                </Pressable>
              </View>
            </View>
            <Btn label="Edit product" icon="create-outline" variant="ghost" onPress={() => { setEditing(menuP); setMenuId(null); setFormOpen(true); }} />
            <Btn label="Delete product" icon="trash-outline" variant="danger" onPress={() => confirmDelete(menuP)} />
          </View>
        )}
      </Sheet>
    </SafeAreaView>
  );
}
