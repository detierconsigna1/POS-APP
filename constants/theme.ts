export const colors = {
  bg: '#000000',
  card: '#171717',
  card2: '#202020',
  chip: '#262626',
  border: '#2C2C2C',
  lime: '#A3F31B',
  limeDark: '#6BA512',
  yellow: '#FFE14D',
  mint: '#4ADE9F',
  mintBg: '#16251D',
  white: '#FFFFFF',
  muted: '#8C8C8C',
  dim: '#5E5E5E',
  black: '#0A0A0A',
};

// Plus Jakarta Sans (closest Google font to the Figma). Change here if your Figma uses another font.
export const font = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semi: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extra: 'PlusJakartaSans_800ExtraBold',
};

export const radius = { card: 24, pill: 999, sm: 12 };

export const peso = (n: number) =>
  '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
