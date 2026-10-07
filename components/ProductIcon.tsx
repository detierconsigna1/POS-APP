import React from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export function ProductIcon({ category, size = 44, color }: { category: string; size?: number; color: string }) {
  const c = category.toLowerCase();
  if (c.includes('electr')) return <MaterialCommunityIcons name="battery-charging-outline" size={size} color={color} />;
  if (c.includes('care') || c.includes('soap')) return <Ionicons name="sparkles-outline" size={size} color={color} />;
  if (c.includes('apparel') || c.includes('cloth')) return <Ionicons name="shirt-outline" size={size} color={color} />;
  if (c.includes('snack') || c.includes('food')) return <MaterialCommunityIcons name="cookie-outline" size={size} color={color} />;
  return <Ionicons name="cube-outline" size={size} color={color} />;
}
