// AL NOOR FAST FOOD - Premium Image Mapping
// Professional Mapping for all 50+ Menu Items

export const FOOD_IMAGES = {
    // --- BURGERS (IDs: b1 to b7) ---
    'b1': require('../../assets/food/Foodies Burgers.png'),
    'b2': require('../../assets/food/Foodies Burgers.png'),
    'b2_p': require('../../assets/food/Foodies Burgers.png'),
    'b3': require('../../assets/food/Foodies Burgers.png'),
    'b3_p': require('../../assets/food/Foodies Burgers.png'),
    'b4': require('../../assets/food/Foodies Burgers.png'),
    'b5': require('../../assets/food/Foodies Burgers.png'),
    'b6': require('../../assets/food/Foodies Burgers.png'), // Special
    'b7': require('../../assets/food/Foodies Burgers.png'), // Chapli
    'burger_lava': require('../../assets/food/burger_lava.png'),
    'burger_zinger_premium': require('../../assets/food/burger_zinger_premium.png'),
    // Direct ID Mappings
    'b_lv': require('../../assets/food/burger_lava.png'),
    'b_zg': require('../../assets/food/burger_zinger_premium.png'),
    'b_zgc': require('../../assets/food/burger_zinger_premium.png'),

    // --- PIZZA (IDs: p1 to p3) ---
    'p1': require('../../assets/food/Pizza.png'), // Tikka
    'p2': require('../../assets/food/Pizza.png'), // Fajita
    'p3': require('../../assets/food/Pizza.png'), // Special
    'pizza_crown': require('../../assets/food/pizza_crown.png'),
    'pizza_matka': require('../../assets/food/pizza_matka.png'),
    // Direct ID Mappings
    'p_cc': require('../../assets/food/pizza_crown.png'),
    'sp_mp': require('../../assets/food/pizza_matka.png'),

    // --- KARAHI & HANDI (IDs: k1 to k7) ---
    'k1_h': require('../../assets/food/karahi_premium.png'),
    'k1_f': require('../../assets/food/karahi_premium.png'),
    'k2_h': require('../../assets/food/karahi_premium.png'),
    'k2_f': require('../../assets/food/karahi_premium.png'),
    'k3_h': require('../../assets/food/karahi_premium.png'),
    'k3_f': require('../../assets/food/karahi_premium.png'),
    'k4_h': require('../../assets/food/karahi_premium.png'),
    'k4_f': require('../../assets/food/karahi_premium.png'),
    'k5_h': require('../../assets/food/karahi_premium.png'),
    'k5_f': require('../../assets/food/karahi_premium.png'),
    'k6': require('../../assets/food/karahi_premium.png'),
    'k7': require('../../assets/food/karahi_premium.png'),

    // --- SHAWARMA & ROLLS (IDs: s1 to s4) ---
    's1': require('../../assets/food/Shawarma.png'),    // Chicken
    's2': require('../../assets/food/Shawarma.png'),    // Zinger
    's3': require('../../assets/food/Foodies Roll.png'), // Paratha
    's4': require('../../assets/food/Foodies Roll.png'), // Zinger Paratha

    // --- RICE (IDs: r1 to r3) ---
    'r1_s': require('../../assets/food/foodies Rice.png'),
    'r1_l': require('../../assets/food/foodies Rice.png'),
    'r2_s': require('../../assets/food/foodies Rice.png'),
    'r2_l': require('../../assets/food/foodies Rice.png'),
    'r3': require('../../assets/food/foodies Rice.png'),
    'rice_special': require('../../assets/food/rice_special.png'),
    // Direct ID Mappings
    'r_ans': require('../../assets/food/rice_special.png'),

    // --- CHICKEN BROAST / WINGS / NUGGETS (IDs: c1 to c6) ---
    'c1': require('../../assets/food/Foodies Broost.png'), // Leg
    'c2': require('../../assets/food/Foodies Broost.png'), // Chest
    'c3': require('../../assets/food/Foodies Broost.png'), // Sajji
    'chicken_sajji': require('../../assets/food/chicken_sajji.png'),
    // Direct ID Mappings
    'sp_sj': require('../../assets/food/chicken_sajji.png'),
    'c4_5': require('../../assets/food/Hot Wings.png'),
    'c4_10': require('../../assets/food/Hot Wings.png'),
    'c5': require('../../assets/food/Chicken Nuggets.png'), // Hot Shot
    'c6_5': require('../../assets/food/Chicken Nuggets.png'), // Nuggets
    'c6_10': require('../../assets/food/Chicken Nuggets.png'),

    // --- DRINKS & SIDES ---
    'sd1_r': require('../../assets/food/Fires.png'), // Reg Fries
    'sd1_l': require('../../assets/food/Fires.png'), // Large Fries
    'd1_r': require('../../assets/food/Drink.png'),
    'd1_500': require('../../assets/food/Drink.png'),
    'd1_1': require('../../assets/food/Drink.png'),
    'd1_15': require('../../assets/food/Drink.png'),
    'w_s': require('../../assets/food/Drink.png'), // Water
    'w_l': require('../../assets/food/Drink.png'),

    // --- SALADS & SOUPS ---
    'sl1': require('../../assets/food/salad.jpg'),
    'sl2': require('../../assets/food/salad.jpg'),
    'sl3': require('../../assets/food/salad.jpg'),
    'sl4': require('../../assets/food/salad.jpg'),
    'sp1_s': require('../../assets/food/salad.jpg'), // Soup fallback
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
    if (lowerCat.includes('water')) return FOOD_IMAGES['d1_r'];
    if (lowerCat.includes('fries')) return FOOD_IMAGES['sd1_r'];
    if (lowerCat.includes('chicken')) return FOOD_IMAGES['c1'];
    if (lowerCat.includes('rice')) return FOOD_IMAGES['r1_s'];
    if (lowerCat.includes('salad')) return FOOD_IMAGES['sl1'];
    if (lowerCat.includes('soup')) return FOOD_IMAGES['sl1'];

    return FOOD_IMAGES['b1']; // Global Fallback
};
