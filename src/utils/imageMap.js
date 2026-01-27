// AL NOOR FAST FOOD - Premium Image Mapping
// Professional Mapping for all 50+ Menu Items

export const FOOD_IMAGES = {
    // --- BURGERS (IDs: b1 to b7) ---
    'b1': require('../../assets/food/burger_premium.png'),
    'b2': require('../../assets/food/burger_premium.png'),
    'b2_p': require('../../assets/food/burger_premium.png'),
    'b6': require('../../assets/food/burger_premium.png'),

    // --- PIZZA (IDs: p1 to p3) ---
    'p1': require('../../assets/food/pizza_premium.png'), // Tikka
    'p2': require('../../assets/food/pizza_premium.png'), // Fajita
    'p3': require('../../assets/food/pizza_premium.png'), // Special

    // --- KARAHI & HANDI (IDs: k1 to k7) ---
    'k1_h': require('../../assets/food/karahi_premium.png'), // Karahi Half
    'k1_f': require('../../assets/food/karahi_premium.png'), // Karahi Full
    'k2_h': require('../../assets/food/karahi_premium.png'), // Handi
    'k7': require('../../assets/food/karahi_premium.png'),   // Makhni

    // --- SHAWARMA (IDs: s1 to s4) ---
    's1': require('../../assets/food/shawarma_premium.png'), // Chicken
    's2': require('../../assets/food/shawarma_premium.png'), // Zinger
    's3': require('../../assets/food/shawarma_premium.png'), // Paratha

    // --- RICE (IDs: r1 to r3) ---
    'r1_s': require('../../assets/food/karahi_premium.png'), // Best fit: Main Dish style

    // --- CHICKEN BROAST (IDs: c1 to c6) ---
    'c3': require('../../assets/food/shawarma_premium.png'),  // Roast/Wrap style fit

    // --- DRINKS & SIDES ---
    'sd1_r': require('../../assets/food/fries_premium.png'),
    'd1_r': require('../../assets/food/drink_premium.png'),
};

/**
 * Enhanced Image Selector
 * Checks for Specific Item ID first, then falls back to Category, then Default.
 */
export const getImage = (id, category = '') => {
    // 1. Try Specific ID
    if (FOOD_IMAGES[id]) return FOOD_IMAGES[id];

    // 2. Logic Fallbacks (Category-based)
    const lowerCat = category.toLowerCase();
    if (lowerCat.includes('pizza')) return FOOD_IMAGES['p1'];
    if (lowerCat.includes('burger')) return FOOD_IMAGES['b1'];
    if (lowerCat.includes('karahi')) return FOOD_IMAGES['k1_h'];
    if (lowerCat.includes('handi')) return FOOD_IMAGES['k1_h'];
    if (lowerCat.includes('shawarma')) return FOOD_IMAGES['s1'];
    if (lowerCat.includes('roll')) return FOOD_IMAGES['s3'];
    if (lowerCat.includes('drink')) return FOOD_IMAGES['d1_r'];
    if (lowerCat.includes('fries')) return FOOD_IMAGES['sd1_r'];

    return FOOD_IMAGES['b1']; // Global Fallback
};
