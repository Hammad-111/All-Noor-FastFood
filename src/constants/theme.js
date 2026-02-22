
export const COLORS = {
    primary: '#800000', // Shop's Brand Maroon
    primaryGradient: ['#3A0000', '#600000', '#900000'], // Deep rich maroon matrix
    secondary: '#FFFFFF', // High contrast white
    accent: '#FFD700', // Gold accent
    accentGradient: ['#D4AF37', '#FFD700'],
    text: '#FFFFFF',
    textDark: '#F8FAFC', // Needs to be light for dark mode cards
    textLight: '#94A3B8',
    button: '#800000',
    background: '#020617', // Very dark slate/navy
    glass: 'rgba(30, 41, 59, 0.4)', // Dark frosted glass
    glassBorder: 'rgba(128, 0, 0, 0.4)', // Maroon tinted glass border
    glassDark: 'rgba(0, 0, 0, 0.7)',
};

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
