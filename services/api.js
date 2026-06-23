import * as SecureStore from 'expo-secure-store';
import { addNotification } from './notifications';

// Backend URL - set to null for mock data, or the deployed URL for real backend
// Mock data (local): null
// Real backend: "https://foodloop-api-jolk.onrender.com"
const API_BASE_URL = "https://foodloop-api-jolk.onrender.com";

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
export async function login(email, password, role) {
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    return data;
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockLogin(email, password, role);
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

export async function getOrderById(id) {
  try {
    return await apiFetch('/orders/' + id);
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockGetOrderById(id);
    throw e;
  }
}

export async function updateOrderStatus(orderId, newStatus) {
  try {
    return await apiFetch('/orders/' + orderId + '/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockUpdateOrderStatus(orderId, newStatus);
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

export async function getVendorProducts(vendorId) {
  try {
    const params = vendorId ? '?vendorId=' + vendorId : '';
    return await apiFetch('/vendor/products' + params);
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockGetVendorProducts(vendorId);
    throw e;
  }
}

export async function getVendorById(vendorId) {
  try {
    return await apiFetch('/vendors/' + vendorId);
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockGetVendorById(vendorId);
    throw e;
  }
}

export async function getVendorProfile() {
  try {
    return await apiFetch('/vendor/profile');
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockGetVendorProfile();
    throw e;
  }
}

export async function getPayouts() {
  try {
    return await apiFetch('/vendor/payouts');
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockGetPayouts();
    throw e;
  }
}

export async function requestPayout(amount) {
  try {
    return await apiFetch('/vendor/payouts/request', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockRequestPayout(amount);
    throw e;
  }
}

export async function updateVendorProfile(updates) {
  try {
    return await apiFetch('/vendor/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockUpdateVendorProfile(updates);
    throw e;
  }
}

export async function updateProduct(bagId, updates) {
  try {
    return await apiFetch('/vendor/bags/' + bagId, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockUpdateProduct(bagId, updates);
    throw e;
  }
}

export async function deleteProduct(bagId) {
  try {
    return await apiFetch('/vendor/bags/' + bagId, {
      method: 'DELETE',
    });
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockDeleteProduct(bagId);
    throw e;
  }
}

// ── Vendor: Add Product ──────────────────────────────────────────────────────
export async function addProduct(productData) {
  try {
    return await apiFetch('/vendor/bags', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  } catch (e) {
    if (e.message === 'MOCK_MODE') return mockAddProduct(productData);
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
    views: 234, orders: 47,
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
    views: 189, orders: 31,
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
    views: 156, orders: 22,
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
    views: 312, orders: 68,
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
  { id: 'FL-2843', buyerName: 'Ahmad Nabil', initials: 'AN', color: '#E1F5EE', textColor: '#085041', price: 6, status: 'paid', time: '7:30 PM' },
  { id: 'FL-2841', buyerName: 'Siti Rahimah', initials: 'SR', color: '#E6F1FB', textColor: '#0C447C', price: 6, status: 'pickup', time: '7:30 PM' },
  { id: 'FL-2839', buyerName: 'Lee Wei Han', initials: 'LW', color: '#FBEAF0', textColor: '#72243E', price: 6, status: 'done', time: 'Collected' },
];

const MOCK_PAYOUTS = [
  { id: 'PAY-001', date: 'Jun 15, 2026', amount: 245.70, status: 'completed', ref: 'BK-20260615-001' },
  { id: 'PAY-002', date: 'Jun 1, 2026', amount: 198.40, status: 'completed', ref: 'BK-20260601-001' },
  { id: 'PAY-003', date: 'May 15, 2026', amount: 312.80, status: 'completed', ref: 'BK-20260515-001' },
  { id: 'PAY-004', date: 'May 1, 2026', amount: 176.50, status: 'completed', ref: 'BK-20260501-001' },
  { id: 'PAY-005', date: 'Apr 15, 2026', amount: 220.00, status: 'completed', ref: 'BK-20260415-001' },
];

const MOCK_WEEKLY_EARNINGS = [
  { day: 'Mon', amount: 34.20 },
  { day: 'Tue', amount: 48.60 },
  { day: 'Wed', amount: 28.80 },
  { day: 'Thu', amount: 52.40 },
  { day: 'Fri', amount: 66.00 },
  { day: 'Sat', amount: 58.20 },
  { day: 'Sun', amount: 22.40 },
];

const MOCK_VENDORS = [
  {
    id: 'vendor-001', name: 'Sunrise Bakery', address: 'Jalan Dunlop, Tawau, Sabah',
    rating: 4.2, reviewCount: 138, initials: 'SB', color: '#1D9E75',
    lat: 4.2985, lng: 117.8831,
    phone: '+6012-345-6789', email: 'hello@sunrisebakery.my',
    hours: 'Mon-Sat 7AM-9PM, Sun 8AM-6PM',
  },
  {
    id: 'vendor-002', name: 'Kopi Senja Cafe', address: 'Jalan Habib Hussein, Tawau, Sabah',
    rating: 4.5, reviewCount: 92, initials: 'KS', color: '#BA7517',
    lat: 4.2960, lng: 117.8900,
    phone: '+6012-456-7890', email: 'hello@kopisenja.my',
    hours: 'Daily 8AM-10PM',
  },
  {
    id: 'vendor-003', name: 'Grand Promenade Hotel', address: 'Jalan Utama, Tawau, Sabah',
    rating: 4.0, reviewCount: 55, initials: 'GP', color: '#D85A30',
    lat: 4.2910, lng: 117.8950,
    phone: '+6012-567-8901', email: 'info@grandpromenade.my',
    hours: '24 hours',
  },
  {
    id: 'vendor-004', name: 'Kedai Roti Mak Timah', address: 'Jalan Bunga, Tawau, Sabah',
    rating: 4.8, reviewCount: 201, initials: 'KM', color: '#994AB7',
    lat: 4.3010, lng: 117.8870,
    phone: '+6012-678-9012', email: 'maktimah@gmail.com',
    hours: 'Daily 6AM-6PM',
  },
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

async function mockLogin(email, password, role) {
  await delay();
  if (!email || !password) throw new Error('Please fill in all fields');
  return { token: 'mock_token_' + Date.now(), user: { name: 'Witschi', email, role: role || 'buyer' } };
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

  // Notify vendor
  addNotification({
    userId: bag.vendorId,
    title: 'New order: ' + order.id,
    message: 'A customer reserved ' + bag.name + ' for RM ' + bag.priceNow,
    type: 'order_placed',
  });

  return { order };
}

async function mockGetOrderById(id) {
  await delay();
  const order = MOCK_ORDERS.find(o => o.id === id);
  if (!order) throw new Error('Order not found');
  return { order };
}

async function mockUpdateOrderStatus(orderId, newStatus) {
  await delay();
  const order = MOCK_ORDERS.find(o => o.id === orderId);
  if (!order) throw new Error('Order not found');
  order.status = newStatus;

  if (newStatus === 'ready') {
    addNotification({
      userId: 'buyer',
      title: 'Your order is ready!',
      message: order.bagName + ' is ready for pickup. Don\'t forget your pickup code!',
      type: 'order_ready',
    });
  }

  if (newStatus === 'collected') {
    addNotification({
      userId: 'buyer',
      title: 'Order collected!',
      message: order.id + ' collected. Thank you for saving food!',
      type: 'order_collected',
    });
    addNotification({
      userId: order.vendor || 'vendor-001',
      title: 'Order collected: ' + order.id,
      message: 'Order ' + order.id + ' has been collected by the customer.',
      type: 'order_collected',
    });
  }

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

async function mockAddProduct(productData) {
  await delay();
  const newBag = {
    id: 'bag-' + Date.now(),
    vendorId: productData.vendorId || 'vendor-001',
    name: productData.name,
    vendor: productData.vendor || 'Sunrise Bakery',
    category: productData.category || 'Bakery',
    halal: productData.halal || 'halal',
    description: productData.description,
    contents: productData.contents,
    tags: productData.tags || [],
    priceNow: productData.priceNow,
    priceOriginal: productData.priceOriginal,
    pickupStart: productData.pickupStart,
    pickupEnd: productData.pickupEnd,
    pickupAddress: productData.pickupAddress || 'Tawau, Sabah',
    distance: 0.5,
    quantityTotal: productData.quantityTotal,
    quantityLeft: productData.quantityTotal,
    rating: 0,
    reviewCount: 0,
    imageColor: '#1D9E75',
    icon: 'bread',
    active: true,
    lat: 4.2985,
    lng: 117.8831,
    views: 0,
    orders: 0,
  };
  MOCK_BAGS.unshift(newBag);
  return { success: true, bag: newBag };
}

async function mockGetVendorProducts(vendorId) {
  await delay();
  let products = MOCK_BAGS.filter(b => b.active !== false);
  if (vendorId) {
    products = products.filter(b => b.vendorId === vendorId || b.vendor === 'Sunrise Bakery');
  }
  return { products };
}

async function mockGetVendorById(vendorId) {
  await delay();
  const vendor = MOCK_VENDORS.find(v => v.id === vendorId);
  if (!vendor) throw new Error('Vendor not found');
  return { vendor };
}

async function mockGetVendorProfile() {
  await delay();
  const vendor = MOCK_VENDORS.find(v => v.id === 'vendor-001') || MOCK_VENDORS[0];
  return { vendor };
}

async function mockUpdateVendorProfile(updates) {
  await delay();
  const vendor = MOCK_VENDORS.find(v => v.id === 'vendor-001') || MOCK_VENDORS[0];
  Object.assign(vendor, updates);
  return { vendor };
}

async function mockGetPayouts() {
  await delay();
  return { payouts: MOCK_PAYOUTS };
}

async function mockRequestPayout(amount) {
  await delay();
  const newPayout = {
    id: 'PAY-' + String(MOCK_PAYOUTS.length + 1).padStart(3, '0'),
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    amount: parseFloat(amount),
    status: 'pending',
    ref: 'BK-' + Date.now(),
  };
  MOCK_PAYOUTS.unshift(newPayout);
  return { success: true, payout: newPayout };
}

async function mockUpdateProduct(bagId, updates) {
  await delay();
  const bag = MOCK_BAGS.find(b => b.id === bagId);
  if (!bag) throw new Error('Bag not found');
  Object.assign(bag, updates);
  return { success: true, bag };
}

async function mockDeleteProduct(bagId) {
  await delay();
  const idx = MOCK_BAGS.findIndex(b => b.id === bagId);
  if (idx === -1) throw new Error('Bag not found');
  MOCK_BAGS.splice(idx, 1);
  return { success: true };
}
