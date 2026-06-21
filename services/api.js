import * as SecureStore from 'expo-secure-store';

// Change this to your Flask backend URL when ready
// e.g. "http://192.168.70.121:5000/api"
const API_BASE_URL = null; // null = use mock data

const TOKEN_KEY = 'auth_token';

async function getToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function apiFetch(endpoint, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('MOCK_MODE');
  }
  const token = await getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_BASE_URL + endpoint, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export async function login(email, password) {
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return data;
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockLogin(email, password);
    throw e;
  }
}

export async function register(name, email, password) {
  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    return data;
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockRegister(name, email, password);
    throw e;
  }
}

// ── Bags ─────────────────────────────────────────────────────────────────────
export async function getBags(filters = {}) {
  try {
    const params = new URLSearchParams(filters).toString();
    return await apiFetch('/bags' + (params ? '?' + params : ''));
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockGetBags(filters);
    throw e;
  }
}

export async function getBagById(id) {
  try {
    return await apiFetch('/bags/' + id);
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockGetBagById(id);
    throw e;
  }
}

// ── Orders ───────────────────────────────────────────────────────────────────
export async function getOrders() {
  try {
    return await apiFetch('/orders');
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockGetOrders();
    throw e;
  }
}

export async function createOrder(bagId) {
  try {
    return await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({ bag_id: bagId }),
    });
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockCreateOrder(bagId);
    throw e;
  }
}

// ── Profile ──────────────────────────────────────────────────────────────────
export async function getProfile() {
  try {
    return await apiFetch('/user/profile');
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockGetProfile();
    throw e;
  }
}

export async function updateProfile(updates) {
  try {
    return await apiFetch('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockUpdateProfile(updates);
    throw e;
  }
}

// ── Vendor ───────────────────────────────────────────────────────────────────
export async function getVendorStats() {
  try {
    return await apiFetch('/vendor/stats');
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockGetVendorStats();
    throw e;
  }
}

export async function getVendorOrders() {
  try {
    return await apiFetch('/vendor/orders');
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockGetVendorOrders();
    throw e;
  }
}

export async function toggleBagActive(bagId, active) {
  try {
    return await apiFetch('/vendor/bags/' + bagId + '/toggle', {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    });
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockToggleBag(bagId, active);
    throw e;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// MOCK DATA & FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════

// Food item pictures
const IMAGES = {
  bakery: require('../assets/pictures/Bakery.jpg'),
  kuih: require('../assets/pictures/Malay_Kuih.jpg'),
  kuihTraditional: require('../assets/pictures/kuih_traditional.jpeg'),
};

const MOCK_BAGS = [
  {
    id: 'bag-001', vendorId: 'vendor-001', name: 'Sunrise Bakery Surprise Bag',
    vendor: 'Sunrise Bakery', category: 'Bakery', halal: 'halal',
    description: "A surprise selection of today's fresh leftovers - typically 3-5 items including bread, pastries, or buns. Contents change daily.",
    contents: 'Bread, pastries, buns - mixed selection',
    tags: ['Vegetarian-friendly', 'No nuts', 'Fresh today'],
    priceNow: 6, priceOriginal: 18, pickupStart: '19:30', pickupEnd: '20:30',
    pickupAddress: 'Jalan Dunlop, Tawau, Sabah', distance: 0.4,
    quantityTotal: 10, quantityLeft: 3, rating: 4.2, reviewCount: 138,
    imageColor: '#1D9E75', icon: 'bread', active: true,
    image: IMAGES.bakery,
    lat: 4.2985, lng: 117.8831,
  },
  {
    id: 'bag-002', vendorId: 'vendor-002', name: 'Kopi Senja Cafe Bag',
    vendor: 'Kopi Senja Cafe', category: 'Cafe', halal: 'halal',
    description: "Mix of today's cafe drinks and light bites - kuih, sandwiches, and a bottled drink.",
    contents: 'Kuih, sandwiches, 1 bottled drink',
    tags: ['Vegetarian options', 'Drinks included'],
    priceNow: 8, priceOriginal: 22, pickupStart: '20:00', pickupEnd: '21:00',
    pickupAddress: 'Jalan Habib Hussein, Tawau, Sabah', distance: 0.8,
    quantityTotal: 10, quantityLeft: 7, rating: 4.5, reviewCount: 92,
    imageColor: '#BA7517', icon: 'coffee', active: true,
    image: IMAGES.kuihTraditional,
    lat: 4.2960, lng: 117.8900,
  },
  {
    id: 'bag-003', vendorId: 'vendor-003', name: 'Grand Promenade Hotel Bag',
    vendor: 'Grand Promenade Hotel', category: 'Hotel', halal: 'mixed',
    description: 'End-of-day buffet surplus - a generous mixed selection of hotel-quality dishes.',
    contents: 'Rice, 2-3 sides, dessert, mixed buffet items',
    tags: ['Generous portion', 'Hotel quality', 'Mixed kitchen'],
    priceNow: 12, priceOriginal: 38, pickupStart: '21:00', pickupEnd: '22:00',
    pickupAddress: 'Jalan Utama, Tawau, Sabah', distance: 1.2,
    quantityTotal: 8, quantityLeft: 2, rating: 4.0, reviewCount: 55,
    imageColor: '#D85A30', icon: 'chef-hat', active: true,
    image: IMAGES.kuih,
    lat: 4.2910, lng: 117.8950,
  },
  {
    id: 'bag-004', vendorId: 'vendor-004', name: 'Kedai Roti Mak Timah Bag',
    vendor: 'Kedai Roti Mak Timah', category: 'Bakery', halal: 'halal',
    description: "Traditional Malay kuih and roti from a beloved local favourite.",
    contents: 'Kuih-muih assorted, roti, possible kek lapis',
    tags: ['Traditional', 'Halal certified', 'Local favourite'],
    priceNow: 5, priceOriginal: 15, pickupStart: '17:00', pickupEnd: '18:00',
    pickupAddress: 'Jalan Bunga, Tawau, Sabah', distance: 0.6,
    quantityTotal: 12, quantityLeft: 5, rating: 4.8, reviewCount: 201,
    imageColor: '#994AB7', icon: 'cookie', active: true,
    image: IMAGES.kuihTraditional,
    lat: 4.3010, lng: 117.8870,
  },
];

const MOCK_ORDERS = [
  { id: 'FL-2841', bagId: 'bag-001', bagName: 'Sunrise Bakery Surprise Bag', vendor: 'Sunrise Bakery', vendorInitials: 'SB', vendorColor: '#E1F5EE', vendorTextColor: '#085041', price: 6, status: 'paid', date: 'Today', pickupWindow: '7:30\u20138:30 PM' },
  { id: 'FL-2799', bagId: 'bag-002', bagName: 'Kopi Senja Cafe Bag', vendor: 'Kopi Senja Cafe', vendorInitials: 'KS', vendorColor: '#FAEEDA', vendorTextColor: '#633806', price: 8, status: 'collected', date: 'Yesterday', pickupWindow: '8:00\u20139:00 PM' },
  { id: 'FL-2710', bagId: 'bag-003', bagName: 'Grand Promenade Hotel Bag', vendor: 'Grand Promenade Hotel', vendorInitials: 'GP', vendorColor: '#FAECE7', vendorTextColor: '#712B13', price: 12, status: 'collected', date: '2 days ago', pickupWindow: '9:00\u201310:00 PM' },
];

const MOCK_PROFILE = {
  name: 'Witschi', email: 'witschi@email.com', memberSince: 'June 2026',
  greenPoints: 470, mealsSaved: 47, foodRescued: 14, co2Saved: 28,
  badges: ['Food hero', '47 meals saved', 'Community saver'],
};

const MOCK_VENDOR_STATS = {
  todaySold: 3, todayRemaining: 7, todayEarnings: 14.40,
  monthSold: 238, monthEarnings: 1142, monthFoodRescued: 238, monthCO2Saved: 476,
  sellThroughRate: 82, avgRating: 4.2, totalReviews: 138,
};

const MOCK_VENDOR_ORDERS = [
  { id: 'FL-2841', buyerName: 'Ahmad Nabil', initials: 'AN', color: '#E1F5EE', textColor: '#085041', price: 6, status: 'pickup', time: '7:30 PM' },
  { id: 'FL-2839', buyerName: 'Siti Rahimah', initials: 'SR', color: '#E6F1FB', textColor: '#0C447C', price: 6, status: 'done', time: 'Collected' },
  { id: 'FL-2836', buyerName: 'Lee Wei Han', initials: 'LW', color: '#FBEAF0', textColor: '#72243E', price: 6, status: 'done', time: 'Collected' },
];

let mockOrderCounter = 2842;

function delay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatPickupWindow(start, end) {
  const to12h = (t) => {
    const [hStr, m] = t.split(':');
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${ampm}`;
  };
  const s = to12h(start);
  const e = to12h(end);
  // If same AM/PM, only show suffix once on the end time
  if (s.slice(-2) === e.slice(-2)) {
    return `${s.replace(/ [AP]M/, '')}\u2013${e}`;
  }
  return `${s}\u2013${e}`;
}

async function mockLogin(email, password) {
  await delay();
  if (!email || !password) throw new Error('Please fill in all fields');
  return { token: 'mock_token_' + Date.now(), user: { name: 'Witschi', email, role: 'buyer' } };
}

async function mockRegister(name, email, password) {
  await delay();
  if (!name || !email || !password) throw new Error('Please fill in all fields');
  if (password.length < 6) throw new Error('Password must be at least 6 characters');
  return { token: 'mock_token_' + Date.now(), user: { name, email, role: 'buyer' } };
}

async function mockGetBags(filters = {}) {
  await delay();
  let bags = [...MOCK_BAGS];
  if (filters.halal === 'halal') bags = bags.filter(b => b.halal === 'halal');
  if (filters.category && filters.category !== 'All') bags = bags.filter(b => b.category === filters.category);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    bags = bags.filter(b => b.name.toLowerCase().includes(q) || b.vendor.toLowerCase().includes(q));
  }
  return { bags };
}

async function mockGetBagById(id) {
  await delay();
  const bag = MOCK_BAGS.find(b => b.id === id);
  if (!bag) throw new Error('Bag not found');
  return { bag };
}

async function mockGetOrders() {
  await delay();
  return { orders: MOCK_ORDERS };
}

async function mockCreateOrder(bagId) {
  await delay();
  const bag = MOCK_BAGS.find(b => b.id === bagId);
  if (!bag) throw new Error('Bag not found');
  if (bag.quantityLeft <= 0) throw new Error('No bags remaining');
  bag.quantityLeft -= 1;
  const order = {
    id: 'FL-' + mockOrderCounter++,
    bagId: bag.id, bagName: bag.name, vendor: bag.vendor,
    vendorInitials: bag.vendor.split(' ').map(w => w[0]).join(''),
    vendorColor: '#E1F5EE', vendorTextColor: '#085041',
    price: bag.priceNow, status: 'paid', date: 'Today',
    pickupWindow: formatPickupWindow(bag.pickupStart, bag.pickupEnd),
  };
  MOCK_ORDERS.unshift(order);
  return { order };
}

async function mockGetProfile() {
  await delay();
  return { profile: MOCK_PROFILE };
}

async function mockUpdateProfile(updates) {
  await delay();
  Object.assign(MOCK_PROFILE, updates);
  return { profile: MOCK_PROFILE };
}

async function mockGetVendorStats() {
  await delay();
  return { stats: MOCK_VENDOR_STATS };
}

async function mockGetVendorOrders() {
  await delay();
  return { orders: MOCK_VENDOR_ORDERS };
}

async function mockToggleBag(bagId, active) {
  await delay();
  const bag = MOCK_BAGS.find(b => b.id === bagId);
  if (bag) bag.active = active;
  return { success: true };
}
