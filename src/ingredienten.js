// ─── Shared helper: build needed products from orders for a given bakDate ─────
function getNeededForBakDate(orders, bakDate) {
  const needed = {};
  (orders || []).forEach(o => {
    if (!(o.delivery_date || o.date || '').startsWith(bakDate)) return;
    (o.items || o.order_items || []).forEach(item => {
      const pid = matchProduct(item.name || item.product_name);
      if (!pid) return;
      needed[pid] = (needed[pid] || 0) + (item.quantity || item.qty || 1);
    });
  });
  return needed;
}

// ─── FLOUR / INGREDIENT BREAKDOWN ────────────────────────────────────────────
const FLOUR_NAMES = { spelt: 'Speltmeel', spelt_energy: 'Spelt Energy meel', wit: 'Witte bloem', bruin: 'Bruine bloem', rogge: 'Roggemeel' };

// For a product, compute full ingredient list with amounts
function getIngredientsForProduct(pid, qty) {
  const prod = PRODUCTS[pid];
  if (!prod) return [];
  const flourKg = prod.flour_kg * qty;
  const waterKg = flourKg * 0.75; // typical hydration 75%
  const saltKg  = flourKg * 0.02;
  const desemKg = flourKg * 0.20;
  const rows = [
    { name: FLOUR_NAMES[prod.flour_type] || prod.flour_type, amount: flourKg, unit: 'kg', cost_kg: prod.flour_cost_kg },
    { name: 'Water',       amount: waterKg, unit: 'kg', cost_kg: 0 },
    { name: 'Zout',        amount: saltKg,  unit: 'kg', cost_kg: 0.40 },
    { name: 'Zuurdesem',   amount: desemKg, unit: 'kg', cost_kg: 0 },
  ];
  if (pid === 'vijg-noot') rows.push({ name: 'Vijgen/Noten mix', amount: flourKg * 0.30, unit: 'kg', cost_kg: 3.50 });
  if (pid === 'kaneelkoek') rows.push({ name: 'Kaneelsuiker', amount: flourKg * 0.40, unit: 'kg', cost_kg: 2.20 });
  return rows;
}

// ─── IngredientsPage ──────────────────────────────────────────────────────────
function IngredientsPage({ orders, workflows, products: PRODUCTS }) {
  PRODUCTS = PRODUCTS || DEFAULT_PRODUCTS;
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Products starting production on T-2 for this bakdate = need their kneden step today
  // We show all products whose T-2 day = selected date (i.e. bakDate = date+2)
  const bakDate = (() => { const d = new Date(date); d.setDate(d.getDate() + 2); return d.toISOString().split('T')[0]; })();
  const needed  = getNeededForBakDate(orders, bakDate);

  // Also check T-1 products starting on selected date
  const bakDateT1 = (() => { const d = new Date(date); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })();
  const neededT1  = getNeededForBakDate(orders, bakDateT1);

  // Filter to products whose first step is on day 0 (T-2) → kneden starts today
  function getStartingToday(neededMap, dayOffset) {
    return Object.entries(neededMap).filter(([pid]) => {
      const wf = workflows[pid] || DEFAULT_WORKFLOWS[pid] || [];
      const firstKneden = wf.find(s => s.type === 'kneden');
      return firstKneden && firstKneden.day === dayOffset;
    });
  }

  const startingT2 = getStartingToday(needed, 0);   // day=0 = T-2
  const startingT1 = getStartingToday(neededT1, 1); // day=1 = T-1 (pistolets, kaneelkoek)

  // Grand totals across all flour types
  const grandTotals = {};
  [...startingT2, ...startingT1].forEach(([pid, qty]) => {
    getIngredientsForProduct(pid, qty).forEach(ing => {
      grandTotals[ing.name] = (grandTotals[ing.name] || { amount: 0, unit: ing.unit });
      grandTotals[ing.name].amount += ing.amount;
    });
  });

  const allProducts = [...startingT2.map(e => ({ ...e, label: 'T-2', cls: 't2' })),
                       ...startingT1.map(e => ({ ...e, label: 'T-1', cls: 't1' }))];

  const fmtKg = n => n < 0.1 ? (n * 1000).toFixed(0) + ' g' : n.toFixed(3) + ' kg';

  return <div className="page-enter">
    <div className="page-header">
      <h2>Ingrediëntenlijst</h2>
      <p>Afweeglijst voor broden die vandaag starten met kneden</p>
    </div>

    <div className="toolbar">
      <label style={{ fontSize: '12px', fontFamily: 'DM Mono', color: 'var(--text-muted)' }}>DATUM</label>
      <input type="date" className="search-input" value={date} onChange={e => setDate(e.target.value)} style={{ width: '160px' }} />
      <div className="toolbar-spacer" />
      <button className="btn btn-secondary" onClick={() => window.print()}>🖨️ Afdrukken</button>
    </div>

    {allProducts.length === 0 && <div className="empty-msg"><div className="icon">⚖️</div>
      Geen broden starten vandaag met productie.<br/>
      <span style={{fontSize:'13px'}}>Selecteer een dag waarop T-2 of T-1 knedewerk gepland staat.</span>
    </div>}

    {allProducts.map(([pid, qty, , , label, cls]) => {
      // destructure correctly
      return null;
    })}

    {allProducts.map(({ 0: pid, 1: qty, label, cls }) => {
      const prod = PRODUCTS[pid];
      const ings = getIngredientsForProduct(pid, qty);
      const totalCost = ings.reduce((s, i) => s + i.amount * i.cost_kg, 0);
      return <div key={pid} className="ing-section">
        <div className="ing-section-header">
          <span className={`cal-role-badge ${cls}`}>{label}</span>
          <h3>{prod.name}</h3>
          <span className="qty-badge">{qty} broden</span>
          <span style={{ fontFamily: 'DM Mono', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
            ≈ {fmt(totalCost)} ingrediënten
          </span>
        </div>
        <table className="ing-table">
          <thead>
            <tr>
              <th>Ingrediënt</th>
              <th>Per brood</th>
              <th>Totaal ({qty} broden)</th>
              <th>Kost</th>
              <th>☑</th>
            </tr>
          </thead>
          <tbody>
            {ings.map((ing, i) => <tr key={i}>
              <td style={{ fontWeight: 500 }}>{ing.name}</td>
              <td className="ing-amount">{fmtKg(ing.amount / qty)}</td>
              <td className="ing-amount" style={{ color: 'var(--amber)' }}>{fmtKg(ing.amount)}</td>
              <td style={{ fontFamily: 'DM Mono', fontSize: '12px', color: 'var(--text-muted)' }}>
                {ing.cost_kg > 0 ? fmt(ing.amount * ing.cost_kg) : '—'}
              </td>
              <td>
                <input type="checkbox" style={{ accentColor: 'var(--amber)', width: '16px', height: '16px' }} />
              </td>
            </tr>)}
            <tr className="ing-subtotal-row">
              <td colSpan={2}>Subtotaal</td>
              <td colSpan={2}>{fmt(totalCost)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>;
    })}

    {Object.keys(grandTotals).length > 0 && <>
      <h3 style={{ fontFamily: 'DM Serif Display', fontSize: '20px', marginBottom: '12px', marginTop: '8px' }}>Eindtotalen</h3>
      <div className="ing-grand-total">
        {Object.entries(grandTotals).map(([name, { amount, unit }]) => <div key={name} className="ing-grand-total-item">
          <div className="label">{name}</div>
          <div className="val">{amount < 0.1 ? (amount * 1000).toFixed(0) : amount.toFixed(2)}</div>
          <div className="unit">{amount < 0.1 ? 'g' : 'kg'}</div>
        </div>)}
      </div>
    </>}
  </div>;
}

