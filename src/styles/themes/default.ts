/** Cinza com roxo. Verde e vermelho ficam só para entradas e saídas. */
export const defaultTheme = {
  white: '#fff',

  'gray-100': '#E1E1E6',
  'gray-300': '#C4C4CC',
  'gray-400': '#8D8D99',
  'gray-500': '#7C7C8A',
  'gray-600': '#323238',
  'gray-700': '#29292E',
  'gray-800': '#202024',
  'gray-900': '#121214',

  'purple-300': '#996DFF',
  'purple-500': '#8257E5',
  'purple-700': '#633BBC',

  'green-300': '#00B37E',
  'green-500': '#00875F',

  'red-300': '#F75A68',
  'red-500': '#AB222E',
} as const;

/** Até onde o layout é de celular. */
export const MOBILE = '@media (max-width: 640px)';
