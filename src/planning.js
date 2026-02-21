// ─── 3-day Planning Page ──────────────────────────────────────────────────────
function PlanningPage({ orders, workflows }) {
  const [bakDate, setBakDate] = useState(new Date().toISOString().split('T')[0]);

  // Derive T-2, T-1, T0 dates
  const t0 = new Date(bakDate);
  const t1 = new Date(bakDate); t1.setDate(t1.getDate() - 1);
  const t2 = new Date(bakDate); t2.setDate(t2.getDate() - 2);

  const fmtDate = d => d.toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'short' });

  // Collect products needed from orders on bakDate
  const needed = {};
  (orders || []).forEach(o => {
    if (!(o.delivery_date || o.date || '').startsWith(bakDate)) return;
    (o.items || o.order_items || []).forEach(item => {
      const pid = matchProduct(item.name || item.product_name);
      if (!pid) return;
      needed[pid] = (needed[pid] || 0) + (item.quantity || item.qty || 1);
    });
  });

  // Build steps per day
  const daySteps = [[], [], []]; // index = day (0=T-2, 1=T-1, 2=T0)
  Object.entries(needed).forEach(([pid, qty]) => {
    const wf = workflows[pid] || DEFAULT_WORKFLOWS[pid] || [];
    wf.forEach(step => {
      daySteps[step.day].push({ ...step, pid, qty, prodName: PRODUCTS[pid]?.name || pid });
    });
  });

  const dayColors = ['t2', 't1', 't0'];
  const dayLabels = ['T-2 · Voorbereiding', 'T-1 · Rijsdag', 'T0 · Bakdag'];
  const dayDates = [t2, t1, t0];

  const fmtWindow = step => {
    if (step.min_after === null && step.max_after === null) return 'Start naar keuze';
    if (step.min_after === null) return `Max ${step.max_after} min na vorige`;
    if (step.max_after === null) return `Min ${step.min_after} min na vorige`;
    return `${step.min_after} – ${step.max_after} min na vorige`;
  };

  return <div className="page-enter">
    <div className="page-header">
      <h2>3-Daags Productieplan</h2>
      <p>Overzicht van alle stappen op T-2, T-1 en T0</p>
    </div>

    <div className="toolbar">
      <label style={{ fontSize: '12px', fontFamily: 'DM Mono', color: 'var(--text-muted)' }}>BAKDAG (T0)</label>
      <input type="date" className="search-input" value={bakDate} onChange={e => setBakDate(e.target.value)} style={{ width: '160px' }} />
      <div className="toolbar-spacer" />
      <button className="btn btn-secondary" onClick={() => window.print()}>🖨️ Afdrukken</button>
    </div>

    {Object.keys(needed).length === 0 && <div className="error-msg" style={{ background: '#FEF3C7', borderColor: '#FDE68A', color: '#92400E', marginBottom: '20px' }}>
      ⚠️ Geen bestellingen gevonden voor {new Date(bakDate).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long' })}. De demo toont een voorbeeldplan met alle producten.
    </div>}

    {/* If no orders, show demo with one of each */}
    {(() => {
      const displayNeeded = Object.keys(needed).length > 0 ? needed : { 'spelt-groot': 9, 'rogge': 15, 'wit-klein': 12, 'pistolet': 25 };
      const demoSteps = [[], [], []];
      Object.entries(displayNeeded).forEach(([pid, qty]) => {
        const wf = workflows[pid] || DEFAULT_WORKFLOWS[pid] || [];
        wf.forEach(step => { demoSteps[step.day].push({ ...step, pid, qty, prodName: PRODUCTS[pid]?.name || pid }); });
      });

      return <div className="plan3-layout">
        {[0,1,2].map(di => <div key={di} className="day-col">
          <div className={`day-col-header ${dayColors[di]}`}>
            <div className={`day-col-label ${dayColors[di]}`}>{dayLabels[di]}</div>
            <div className="day-col-date">{fmtDate(dayDates[di])}</div>
          </div>
          <div className="day-col-body">
            {demoSteps[di].length === 0 && <div className="plan-empty-day">Geen stappen op deze dag</div>}
            {demoSteps[di].map((step, i) => <div key={i} className={`plan-step-block ${step.type}`}>
              <div className="plan-step-product">{step.prodName} · {step.qty} st.</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={`step-type-dot dot-${step.type}`} />
                <div className="plan-step-name">{step.label}</div>
              </div>
              {step.duration_min > 0 && <div className="plan-step-duration">⏱ {step.duration_min} min</div>}
              <div className="plan-step-window">🕐 {fmtWindow(step)}</div>
            </div>)}
          </div>
        </div>)}
      </div>;
    })()}
  </div>;
}

