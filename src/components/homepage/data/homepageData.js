const PRODUCT_IMAGES = [
  '/pet_product_images/202510282119/display/display_202510282117_01_800x800.jpg',
  '/pet_product_images/202510282119/display/display_202510282117_02_800x800.jpg',
  '/pet_product_images/202510282119/display/display_202510282117_03_800x800.jpg',
  '/pet_product_images/202510282119/display/display_202510282117_04_800x800.jpg',
  '/pet_product_images/202510282119/display/display_202510282117_05_800x800.jpg',
  '/pet_product_images/202510282119/display/display_202510282117_06_800x800.jpg',
  '/pet_product_images/202510282119/display/display_202510282117_07_800x800.jpg',
];

export const HOME_CATEGORY_ITEMS = [
  {
    id: 'c1000000-0000-0000-0000-000000000000',
    name: 'Pet Bowls & Feeders',
    keywords: 'Stainless / Ceramic / Slow Feeder',
  },
  {
    id: 'c4000000-0000-0000-0000-000000000000',
    name: 'Pet Cleaning & Grooming',
    keywords: 'Brushes / Shampoo / Nail / Dental',
  },
  {
    id: 'c6000000-0000-0000-0000-000000000000',
    name: 'Pet Toys',
    keywords: 'Plush / Interactive / Chew / Rope',
  },
  {
    id: 'c7100000-0000-0000-0000-000000000000',
    name: 'Pet Foods',
    keywords: 'Dry / Wet / Treats / Supplements',
  },
  {
    id: 'c8000000-0000-0000-0000-000000000000',
    name: 'Aquatic Accessories',
    keywords: 'Filters / Pumps / Food / Decor',
  },
  {
    id: 'c9000000-0000-0000-0000-000000000000',
    name: 'Pet Beds & Accessories',
    keywords: 'Mats / Blankets / Nest / Towels',
  },
  {
    id: 'e72cbf4e-8ffa-4aea-9f34-7d33d787d8a3',
    name: 'Small Pet Supplies',
    keywords: 'Hamster / Rodent / Cage / Travel',
  },
  {
    id: 'c3000000-0000-0000-0000-000000000000',
    name: 'Pet Carriers & Travel',
    keywords: 'Carrier / Seat Cover / Leash / Harness',
  },
  {
    id: 'c5000000-0000-0000-0000-000000000000',
    name: 'Litter & Disposal',
    keywords: 'Cleaning / Litter Box / Odor / Stain',
  },
  {
    id: 'c7700000-0000-0000-0000-000000000000',
    name: 'Horse Supplies',
    keywords: 'Foods / Grooming / Utility',
  },
  {
    id: 'c7800000-0000-0000-0000-000000000000',
    name: 'Bird Supplies',
    keywords: 'Cages / Foods / Feeder',
  },
];

const BASE_PRODUCTS = [
  {
    name: 'Premium Automatic Pet Water Fountain with Filter',
    priceFrom: 10.5,
    priceTo: 14.5,
    moq: 50,
    rating: 4.8,
  },
  {
    name: 'Anti Spill Tilt Safe Ceramic Feeder Set for Dogs',
    priceFrom: 8.2,
    priceTo: 12.7,
    moq: 120,
    rating: 4.7,
  },
  {
    name: 'Dual Layer Pet Grooming Glove for Daily Shedding',
    priceFrom: 1.8,
    priceTo: 3.1,
    moq: 300,
    rating: 4.6,
  },
  {
    name: 'Travel Ready Soft Shell Carrier with Vent Window',
    priceFrom: 9.9,
    priceTo: 16.9,
    moq: 80,
    rating: 4.9,
  },
  {
    name: 'Natural Fiber Cat Scratcher Board with Refill Pack',
    priceFrom: 2.8,
    priceTo: 5.6,
    moq: 150,
    rating: 4.5,
  },
  {
    name: 'Insulated Food Storage Bin with Scoop and Clip Lid',
    priceFrom: 6.4,
    priceTo: 10.4,
    moq: 100,
    rating: 4.6,
  },
];

const HOME_CATEGORY_IDS = HOME_CATEGORY_ITEMS.map((item) => item.id);

const buildProduct = (seedIndex) => {
  const base = BASE_PRODUCTS[seedIndex % BASE_PRODUCTS.length];
  const image = PRODUCT_IMAGES[seedIndex % PRODUCT_IMAGES.length];
  const categoryId = HOME_CATEGORY_IDS[seedIndex % HOME_CATEGORY_IDS.length];

  return {
    id: `home-product-${seedIndex + 1}`,
    categoryId,
    name: base.name,
    priceFrom: base.priceFrom,
    priceTo: base.priceTo,
    moq: base.moq,
    rating: base.rating,
    image,
  };
};

export const HOME_PRODUCTS = Array.from({ length: 24 }, (_, index) =>
  buildProduct(index),
);

export const RECOMMENDATION_ITEMS = Array.from({ length: 6 }, (_, index) => {
  const item = buildProduct(index);
  return {
    id: `rec-${index + 1}`,
    image: item.image,
    price: item.priceFrom,
    moq: item.moq,
  };
});

export const NEW_ARRIVAL_ITEMS = Array.from({ length: 6 }, (_, index) => {
  const item = buildProduct(index + 2);
  return {
    id: `new-${index + 1}`,
    image: item.image,
    price: item.priceFrom,
    moq: item.moq,
  };
});

export const LOW_PRICE_DEALS = [
  { id: 'deal-1', image: PRODUCT_IMAGES[4], price: 0.5 },
  { id: 'deal-2', image: PRODUCT_IMAGES[5], price: 0.5 },
  { id: 'deal-3', image: PRODUCT_IMAGES[6], price: 0.5 },
];

export const USER_SHORTCUTS = [
  { id: 'carts', label: 'Carts', icon: 'cart' },
  { id: 'favorites', label: 'Favorites', icon: 'heart' },
  { id: 'quotations', label: 'Quotations', icon: 'doc' },
  { id: 'history', label: 'History', icon: 'clock' },
];

export const USER_STATS = [
  { id: 'pending-receive', value: 0, label: 'Pending Receive' },
  { id: 'pending-payment', value: 1, label: 'Pending Payment' },
  { id: 'pending-shipment', value: 5, label: 'Pending Shipment' },
  { id: 'returns', value: 1, label: 'Returns / Refunds' },
];
