// ─── Default product catalog (overridden by products.json) ──────────────────
const DEFAULT_PRODUCTS = {
  // GROOT B2C
  'spelt-groot': { name: 'Spelt Groot', category: 'GROOT', type: 'sourdough', price_b2c: 5.50, price_b2b: 3.30, flour_kg: 0.5, flour_type: 'spelt', flour_cost_kg: 2.28, weight_g: 850, per_session: 9, session_min: 50, session_cost: 1.50 },
  'spelt-energy-groot': { name: 'Spelt Energy Groot', category: 'GROOT', type: 'sourdough', price_b2c: 5.90, price_b2b: 3.50, flour_kg: 0.5, flour_type: 'spelt_energy', flour_cost_kg: 3.40, weight_g: 850, per_session: 9, session_min: 50, session_cost: 1.50 },
  'wit-groot': { name: 'Wit Groot', category: 'GROOT', type: 'sourdough', price_b2c: 5.00, price_b2b: 3.00, flour_kg: 0.5, flour_type: 'wit', flour_cost_kg: 0.80, weight_g: 550, per_session: 9, session_min: 50, session_cost: 1.50 },
  'bruin-groot': { name: 'Bruin Groot', category: 'GROOT', type: 'sourdough', price_b2c: 5.00, price_b2b: 3.00, flour_kg: 0.5, flour_type: 'bruin', flour_cost_kg: 0.80, weight_g: 550, per_session: 9, session_min: 50, session_cost: 1.50 },
  'rogge': { name: 'Rogge', category: 'GROOT', type: 'sourdough', price_b2c: 5.20, price_b2b: 3.10, flour_kg: 0.25, flour_type: 'rogge', flour_cost_kg: 1.50, weight_g: 600, per_session: 15, session_min: 60, session_cost: 1.50 },
  // KLEIN B2C
  'spelt-klein': { name: 'Spelt Klein', category: 'KLEIN', type: 'sourdough', price_b2c: 5.00, price_b2b: 3.00, flour_kg: 0.4, flour_type: 'spelt', flour_cost_kg: 2.28, weight_g: 600, per_session: 12, session_min: 50, session_cost: 1.50 },
  'spelt-energy-klein': { name: 'Spelt Energy Klein', category: 'KLEIN', type: 'sourdough', price_b2c: 5.50, price_b2b: 3.10, flour_kg: 0.4, flour_type: 'spelt_energy', flour_cost_kg: 3.40, weight_g: 550, per_session: 12, session_min: 50, session_cost: 1.50 },
  'wit-klein': { name: 'Wit Klein', category: 'KLEIN', type: 'sourdough', price_b2c: 4.30, price_b2b: 2.80, flour_kg: 0.4, flour_type: 'wit', flour_cost_kg: 0.80, weight_g: 550, per_session: 12, session_min: 50, session_cost: 1.50 },
  'bruin-klein': { name: 'Bruin Klein', category: 'KLEIN', type: 'sourdough', price_b2c: 4.30, price_b2b: 2.80, flour_kg: 0.4, flour_type: 'bruin', flour_cost_kg: 0.80, weight_g: 550, per_session: 12, session_min: 50, session_cost: 1.50 },
  'vijg-noot': { name: 'Vijg/Noot', category: 'SPECIAAL', type: 'sourdough', price_b2c: 5.90, price_b2b: 3.50, flour_kg: 0.24, flour_type: 'wit', flour_cost_kg: 1.40, weight_g: 550, per_session: 12, session_min: 30, session_cost: 1.50 },
  'pistolet': { name: 'Pistolet', category: 'SPECIAAL', type: 'roll', price_b2c: 0.90, price_b2b: null, flour_kg: 0.08, flour_type: 'wit', flour_cost_kg: 0.80, weight_g: 150, per_session: 25, session_min: 35, session_cost: 1.00 },
  'kaneelkoek': { name: 'Kaneelkoek', category: 'SPECIAAL', type: 'cake', price_b2c: 2.80, price_b2b: null, flour_kg: 0.05, flour_type: 'wit', flour_cost_kg: 0.80, weight_g: null, per_session: 21, session_min: 15, session_cost: 0.30 },
};

const DEFAULT_INVENTORY = [
  { id: 'spelt', name: 'Speltmeel', unit: 'kg', cost_kg: 2.28, stock_kg: 25, min_stock: 10 },
  { id: 'spelt_energy', name: 'Spelt Energy', unit: 'kg', cost_kg: 3.40, stock_kg: 15, min_stock: 8 },
  { id: 'wit', name: 'Witte bloem', unit: 'kg', cost_kg: 0.80, stock_kg: 50, min_stock: 20 },
  { id: 'bruin', name: 'Bruine bloem', unit: 'kg', cost_kg: 0.80, stock_kg: 30, min_stock: 15 },
  { id: 'rogge', name: 'Roggemeel', unit: 'kg', cost_kg: 1.50, stock_kg: 12, min_stock: 8 },
  { id: 'vijg_noot_mix', name: 'Vijgen/Noten mix', unit: 'kg', cost_kg: 3.50, stock_kg: 5, min_stock: 3 },
  { id: 'zout', name: 'Zout', unit: 'kg', cost_kg: 0.40, stock_kg: 8, min_stock: 3 },
  { id: 'desem', name: 'Zuurdesemstarter', unit: 'kg', cost_kg: 0, stock_kg: 4, min_stock: 2 },
  { id: 'kaneel', name: 'Kaneelsuiker mix', unit: 'kg', cost_kg: 2.20, stock_kg: 3, min_stock: 2 },
  { id: 'verpakking_brood', name: 'Verpakking brood', unit: 'stuks', cost_kg: 0.06, stock_kg: 200, min_stock: 80 },
  { id: 'verpakking_koek', name: 'Verpakking koek', unit: 'stuks', cost_kg: 0.10, stock_kg: 60, min_stock: 30 },
];


// ─── TIMER PRESETS ───────────────────────────────────────────────────────────
const TIMER_PRESETS = [
  { id: 'autolyse', label: 'Autolyse', duration_min: 60, phase: 'Mengen', color: '#C8840A' },
  { id: 'bulkrise', label: 'Bulk Fermentatie', duration_min: 240, phase: 'Rijzen', color: '#5C3D2E' },
  { id: 'retard', label: 'Koelkast Rijs', duration_min: 720, phase: 'Koud rijzen', color: '#7A8C6E' },
  { id: 'proof', label: 'Tweede Rijs', duration_min: 90, phase: 'Rijzen', color: '#A0522D' },
  { id: 'preheat', label: 'Oven Voorverwarmen', duration_min: 45, phase: 'Bakken', color: '#DC2626' },
  { id: 'bake1', label: 'Bakken (met stoom)', duration_min: 20, phase: 'Bakken', color: '#DC2626' },
  { id: 'bake2', label: 'Bakken (zonder stoom)', duration_min: 30, phase: 'Bakken', color: '#DC2626' },
  { id: 'cool', label: 'Afkoelen', duration_min: 90, phase: 'Afkoelen', color: '#7A8C6E' },
];


// ─── Default workflows per product ───────────────────────────────────────────
// Each step: { id, type, label, duration_min, day (0=T-2,1=T-1,2=T0), min_after, max_after }
const DEFAULT_WORKFLOWS = {
  'spelt-groot': [
    { id: 1, type: 'kneden',  label: 'Kneden',           duration_min: 20, day: 0, min_after: null, max_after: null },
    { id: 2, type: 'vouwen',  label: 'Vouwen (1)',        duration_min: 5,  day: 0, min_after: 30,  max_after: 60  },
    { id: 3, type: 'vouwen',  label: 'Vouwen (2)',        duration_min: 5,  day: 0, min_after: 30,  max_after: 60  },
    { id: 4, type: 'vouwen',  label: 'Vouwen (3)',        duration_min: 5,  day: 0, min_after: 30,  max_after: 60  },
    { id: 5, type: 'rijzen',  label: 'Bulk rijs',         duration_min: 0,  day: 0, min_after: 120, max_after: 240 },
    { id: 6, type: 'rijzen',  label: 'Koelkast rijs',     duration_min: 0,  day: 0, min_after: 30,  max_after: 90  },
    { id: 7, type: 'bakken',  label: 'Bakken',            duration_min: 50, day: 2, min_after: 720, max_after: 960 },
  ],
  'rogge': [
    { id: 1, type: 'kneden',  label: 'Kneden',            duration_min: 15, day: 0, min_after: null, max_after: null },
    { id: 2, type: 'rijzen',  label: 'Bulk rijs',         duration_min: 0,  day: 0, min_after: 180, max_after: 300 },
    { id: 3, type: 'rijzen',  label: 'Koelkast rijs',     duration_min: 0,  day: 0, min_after: 30,  max_after: 60  },
    { id: 4, type: 'bakken',  label: 'Bakken',            duration_min: 60, day: 2, min_after: 600, max_after: 960 },
  ],
};
// Fallback: copy spelt workflow for similar products
['spelt-energy-groot','wit-groot','bruin-groot','spelt-klein','spelt-energy-klein','wit-klein','bruin-klein','vijg-noot'].forEach(pid => {
  if (!DEFAULT_WORKFLOWS[pid]) DEFAULT_WORKFLOWS[pid] = DEFAULT_WORKFLOWS['spelt-groot'].map(s => ({ ...s }));
});
DEFAULT_WORKFLOWS['pistolet'] = [
  { id: 1, type: 'kneden', label: 'Kneden',       duration_min: 15, day: 1, min_after: null, max_after: null },
  { id: 2, type: 'rijzen', label: 'Eerste rijs',  duration_min: 0,  day: 1, min_after: 60,  max_after: 120 },
  { id: 3, type: 'vouwen', label: 'Opbollen',     duration_min: 10, day: 1, min_after: 5,   max_after: 30  },
  { id: 4, type: 'rijzen', label: 'Tweede rijs',  duration_min: 0,  day: 2, min_after: 60,  max_after: 90  },
  { id: 5, type: 'bakken', label: 'Bakken',       duration_min: 35, day: 2, min_after: 5,   max_after: 30  },
];
DEFAULT_WORKFLOWS['kaneelkoek'] = [
  { id: 1, type: 'kneden', label: 'Deeg maken',   duration_min: 20, day: 1, min_after: null, max_after: null },
  { id: 2, type: 'rijzen', label: 'Rijs',         duration_min: 0,  day: 1, min_after: 120, max_after: 180 },
  { id: 3, type: 'vouwen', label: 'Oprollen',     duration_min: 15, day: 1, min_after: 5,   max_after: 30  },
  { id: 4, type: 'rijzen', label: 'Koelkast',     duration_min: 0,  day: 1, min_after: 30,  max_after: 60  },
  { id: 5, type: 'bakken', label: 'Bakken',       duration_min: 15, day: 2, min_after: 420, max_after: 720 },
];

const STEP_TYPES = ['kneden', 'vouwen', 'rijzen', 'bakken'];
const DAY_LABELS = ['T-2', 'T-1', 'T0'];


// Mock inventory for when API fails
const MOCK_INVENTORY = [
  { id: 'inv-1', name: 'Spelt Groot',       sku: 'SG-001', quantity: 18 },
  { id: 'inv-2', name: 'Spelt Energy Groot', sku: 'SEG-001', quantity: 9 },
  { id: 'inv-3', name: 'Wit Groot',          sku: 'WG-001', quantity: 27 },
  { id: 'inv-4', name: 'Bruin Groot',        sku: 'BG-001', quantity: 18 },
  { id: 'inv-5', name: 'Rogge',              sku: 'RG-001', quantity: 15 },
  { id: 'inv-6', name: 'Spelt Klein',        sku: 'SK-001', quantity: 12 },
  { id: 'inv-7', name: 'Wit Klein',          sku: 'WK-001', quantity: 24 },
  { id: 'inv-8', name: 'Vijg/Noot',          sku: 'VN-001', quantity: 12 },
  { id: 'inv-9', name: 'Pistolet',           sku: 'PS-001', quantity: 50 },
  { id: 'inv-10',name: 'Kaneelkoek',         sku: 'KK-001', quantity: 21 },
];

// Mock orders for when API fails
const MOCK_ORDERS = [
  { id: 'ORD-0001', customer_name: 'Marie Janssen', delivery_date: new Date().toISOString().split('T')[0], status: 'new', items: [{ name: 'Spelt Groot', quantity: 2, price: 5.50 }, { name: 'Rogge', quantity: 1, price: 5.20 }], total: 16.20 },
  { id: 'ORD-0002', customer_name: 'Bakkerij De Molen', delivery_date: new Date().toISOString().split('T')[0], status: 'confirmed', customer_type: 'b2b', items: [{ name: 'Wit Groot', quantity: 10, price: 3.00 }, { name: 'Bruin Groot', quantity: 5, price: 3.00 }], total: 45.00 },
  { id: 'ORD-0003', customer_name: 'Pieter De Smet', delivery_date: new Date().toISOString().split('T')[0], status: 'ready', items: [{ name: 'Vijg/Noot', quantity: 1, price: 5.90 }, { name: 'Kaneelkoek', quantity: 2, price: 2.80 }], total: 11.50 },
  { id: 'ORD-0004', customer_name: 'Restaurant Het Anker', delivery_date: new Date().toISOString().split('T')[0], status: 'new', customer_type: 'b2b', items: [{ name: 'Pistolet', quantity: 30, price: 0.90 }], total: 27.00 },
  { id: 'ORD-0005', customer_name: 'Els Vermeersch', delivery_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], status: 'new', items: [{ name: 'Spelt Energy Groot', quantity: 1, price: 5.90 }], total: 5.90 },
];

