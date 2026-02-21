// Production plan
function ProductionPage({ orders, products: PRODUCTS }) {
  PRODUCTS = PRODUCTS || DEFAULT_PRODUCTS;
  const [plan, setPlan] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { buildPlan(); }, [orders, date]);

  function buildPlan() {
    // Aggregate items from orders for the selected date
    const counts = {};
    (orders || []).forEach(o => {
      const oDate = o.delivery_date || o.date || '';
      if (date && !oDate.startsWith(date)) return;
      (o.items || o.order_items || []).forEach(item => {
        const pid = matchProduct(item.name || item.product_name);
        if (!pid) return;
        counts[pid] = (counts[pid] || 0) + (item.quantity || item.qty || 1);
      });
    });

    // Group into sessions
    const sessions = [];
    Object.entries(counts).forEach(([pid, qty]) => {
      const prod = PRODUCTS[pid];
      if (!prod) return;
      const numSessions = Math.ceil(qty / prod.per_session);
      for (let s = 0; s < numSessions; s++) {
        const batchQty = s < numSessions - 1 ? prod.per_session : qty - s * prod.per_session;
        const flourNeeded = batchQty * prod.flour_kg;
        sessions.push({ pid, prod, qty: batchQty, flour: flourNeeded, session: s + 1, total_sessions: numSessions });
      }
    });

    // Group by flour type
    const grouped = {};
    sessions.forEach(s => {
      const g = s.prod.category;
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(s);
    });
    setPlan(Object.entries(grouped).map(([cat, items]) => ({ cat, items })));
  }

  // Also show full totals
  const totalFlour = {};
  plan.forEach(g => g.items.forEach(i => {
    totalFlour[i.prod.flour_type] = (totalFlour[i.prod.flour_type] || 0) + i.flour;
  }));

  const flourNames = { spelt: 'Speltmeel', spelt_energy: 'Spelt Energy', wit: 'Witte bloem', bruin: 'Bruine bloem', rogge: 'Roggemeel' };

  return <div className="page-enter">
    <div className="page-header">
      <h2>Productieplanning</h2>
      <p>Bakschema gebaseerd op bestellingen</p>
    </div>
    <div className="toolbar">
      <label style={{ fontSize: '12px', fontFamily: 'DM Mono', color: 'var(--text-muted)' }}>BAKDATUM</label>
      <input type="date" className="search-input" value={date} onChange={e => setDate(e.target.value)} style={{ width: '160px' }} />
      <div className="toolbar-spacer" />
      <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Afdrukken</button>
    </div>

    {plan.length === 0 && <div className="empty-msg"><div className="icon">🍞</div>Geen bestellingen voor deze datum.<br />Selecteer een andere datum of laad bestellingen opnieuw.</div>}

    {plan.map(({ cat, items }) => <div key={cat} className="bake-session">
      <div className="bake-session-header">
        <h3>{cat}</h3>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{items.length} baksessie(s)</span>
      </div>
      <div className="bake-session-body">
        {items.map((item, i) => <div key={i} className="bake-row">
          <div className="bake-product">{item.prod.name} {item.total_sessions > 1 && `(sessie ${item.session}/${item.total_sessions})`}</div>
          <div className="bake-qty">{item.qty} stuks</div>
          <div className="bake-flour">🌾 {item.flour.toFixed(2)} kg {flourNames[item.prod.flour_type] || item.prod.flour_type}</div>
          <div style={{ fontFamily: 'DM Mono', fontSize: '12px', color: 'var(--text-muted)' }}>⏱ {item.prod.session_min} min</div>
        </div>)}
      </div>
    </div>)}

    {Object.keys(totalFlour).length > 0 && <div className="card" style={{ marginTop: '16px' }}>
      <h3 style={{ fontFamily: 'DM Serif Display', fontSize: '18px', marginBottom: '16px' }}>Totaal bloem nodig</h3>
      {Object.entries(totalFlour).map(([type, kg]) => <div key={type} className="bake-row">
        <div className="bake-product">{flourNames[type] || type}</div>
        <div style={{ fontFamily: 'DM Mono', fontWeight: 500 }}>{kg.toFixed(2)} kg</div>
      </div>)}
    </div>}
  </div>;
}

