// ─── Components ──────────────────────────────────────────────────────────────

function NavBtn({ icon, label, active, onClick }) {
  return <button className={`nav-btn ${active ? 'active' : ''}`} onClick={onClick}>
    <span className="icon">{icon}</span> {label}
  </button>;
}

// ─── Shared order helpers ─────────────────────────────────────────────────────
const getCustomer = o => o.customer?.name || o.customerName || o.customer_name || o.name || 'Onbekend';
const getTotal    = o => {
  // Take App returns totalAmount in cents
  const raw = o.totalAmount ?? o.total_price ?? o.total ?? 0;
  // Manual B2B orders store euros directly (small numbers), Take App sends cents (large numbers)
  return o.source === 'manual' ? raw : raw / 100;
};
const getType     = o => o.customer_type === 'b2b' || o.is_b2b ? 'b2b' : 'b2c';
const getItems    = o => (o.items || o.order_items || []).map(i => `${i.quantity||i.qty||1}× ${i.name||i.product_name||'?'}`).join(', ');
// Normalize Take App status to our internal status
const normalizeStatus = s => {
  if (!s) return 'new';
  const map = {
    'ORDER_STATUS_PENDING':   'new',
    'ORDER_STATUS_CONFIRMED': 'confirmed',
    'ORDER_STATUS_FULFILLED': 'delivered',
    'ORDER_STATUS_CANCELLED': 'cancelled',
    'new': 'new', 'confirmed': 'confirmed', 'ready': 'ready',
    'delivered': 'delivered', 'pending': 'new', 'cancelled': 'cancelled',
  };
  return map[s] || 'new';
};

function StatusBadge({ s }) {
  const norm = normalizeStatus(s);
  const m = { new:'badge-new', confirmed:'badge-production', ready:'badge-ready', delivered:'badge-delivered', cancelled:'badge-delivered' };
  const l = { new:'Nieuw', confirmed:'Bevestigd', ready:'Klaar', delivered:'Geleverd', cancelled:'Geannuleerd' };
  return <span className={`badge ${m[norm]||'badge-new'}`}>{l[norm]||s}</span>;
}

// Empty B2B order form state
function emptyB2bOrder() {
  return {
    customer_name: '', phone: '', email: '',
    delivery_date: new Date(Date.now()+86400000).toISOString().split('T')[0],
    note: '', status: 'new', customer_type: 'b2b', source: 'manual',
    items: [{ pid: 'spelt-groot', qty: 1 }],
  };
}

