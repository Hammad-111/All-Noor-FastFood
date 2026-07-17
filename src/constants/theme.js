
export const DEFAULT_THEME_ID = 'noor-maroon';

export const THEMES = {
    'noor-maroon': {
        id: 'noor-maroon',
        name: 'Noor Maroon',
        description: 'Classic Al Noor identity',
        colors: {
            primary: '#800000',
            primaryDark: '#3A0000',
            primaryGradient: ['#3A0000', '#600000', '#900000'],
            secondary: '#FFFFFF',
            accent: '#FFD700',
            accentGradient: ['#D4AF37', '#FFD700'],
            text: '#FFFFFF',
            textDark: '#F8FAFC',
            textLight: '#94A3B8',
            button: '#800000',
            background: '#020617',
            surface: '#0F172A',
            surfaceElevated: '#1E293B',
            glass: 'rgba(30, 41, 59, 0.4)',
            glassBorder: 'rgba(128, 0, 0, 0.4)',
            glassDark: 'rgba(0, 0, 0, 0.7)',
            muted: 'rgba(255,255,255,0.6)',
            subtle: 'rgba(255,255,255,0.1)',
            danger: '#FF5252',
            success: '#4CAF50',
        },
    },
    'midnight-navy': {
        id: 'midnight-navy',
        name: 'Midnight Navy',
        description: 'Cool, refined and modern',
        colors: {
            primary: '#1D4ED8',
            primaryDark: '#071A3D',
            primaryGradient: ['#071A3D', '#0F2D64', '#1D4ED8'],
            secondary: '#FFFFFF',
            accent: '#60A5FA',
            accentGradient: ['#2563EB', '#7DD3FC'],
            text: '#FFFFFF',
            textDark: '#F8FAFC',
            textLight: '#A8B6CC',
            button: '#1D4ED8',
            background: '#030A18',
            surface: '#0B172A',
            surfaceElevated: '#14243D',
            glass: 'rgba(20, 36, 61, 0.62)',
            glassBorder: 'rgba(96, 165, 250, 0.32)',
            glassDark: 'rgba(1, 6, 18, 0.76)',
            muted: 'rgba(226,232,240,0.64)',
            subtle: 'rgba(148,163,184,0.13)',
            danger: '#FF5252',
            success: '#4CAF50',
        },
    },
    'emerald-luxe': {
        id: 'emerald-luxe',
        name: 'Emerald Luxe',
        description: 'Rich emerald with warm gold',
        colors: {
            primary: '#047857',
            primaryDark: '#022C22',
            primaryGradient: ['#022C22', '#065F46', '#059669'],
            secondary: '#FFFFFF',
            accent: '#F6C453',
            accentGradient: ['#C9972E', '#F6C453'],
            text: '#FFFFFF',
            textDark: '#F0FDF4',
            textLight: '#A7C7B8',
            button: '#047857',
            background: '#02120D',
            surface: '#08251C',
            surfaceElevated: '#12382C',
            glass: 'rgba(18, 56, 44, 0.58)',
            glassBorder: 'rgba(52, 211, 153, 0.3)',
            glassDark: 'rgba(1, 15, 11, 0.76)',
            muted: 'rgba(220,252,231,0.64)',
            subtle: 'rgba(167,243,208,0.12)',
            danger: '#FF5252',
            success: '#4CAF50',
        },
    },
};

export const THEME_OPTIONS = Object.values(THEMES).map(({ id, name, description, colors }) => ({
    id,
    name,
    description,
    swatches: [colors.primary, colors.background, colors.accent],
}));

// Backwards-compatible default for code outside React components.
export const COLORS = THEMES[DEFAULT_THEME_ID].colors;

export const SIZES = {
    padding: 16,
    radius: 12,
    h1: 30,
    h2: 24,
    h3: 20,
    body: 16,
};

export const FONTS = {
    // We'll use default system fonts for now, can be updated later
    h1: { fontSize: SIZES.h1, fontWeight: 'bold' },
    h2: { fontSize: SIZES.h2, fontWeight: 'bold' },
    h3: { fontSize: SIZES.h3, fontWeight: 'bold' },
    body: { fontSize: SIZES.body },
};
