// ─── BestellingenPage ─────────────────────────────────────────────────────────
function BestellingenPage({ orders, setOrders, products: PRODUCTS }) {
  PRODUCTS = PRODUCTS || DEFAULT_PRODUCTS;
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType]   = useState('all');
  const [showB2bForm, setShowB2bForm] = useState(false);
  const [b2bForm, setB2bForm]         = useState(emptyB2bOrder());
  const [saving, setSaving]           = useState(false);

  async function loadOrders() {
    setLoading(true); setError(null);
    try {
      const data = await apiGet('/orders');
      const apiOrders = (data.orders || data || []).map(o => ({ ...o, source: 'takeapp' }));
      // Merge: keep manual B2B orders, replace Take App ones
      setOrders(prev => {
        const manual = prev.filter(o => o.source === 'manual');
        return [...apiOrders, ...manual];
      });
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function updateStatus(orderId, status) {
    // For manual orders, just update locally
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    if (selected?.id === orderId) setSelected(s => ({ ...s, status }));
    // Also try API for Take App orders
    const order = orders.find(o => o.id === orderId);
    if (order?.source === 'takeapp') {
      try { await apiPut(`/orders/${orderId}`, { status }); } catch (_) {}
    }
  }

  // Compute totals from items for B2B form
  function calcB2bTotal(items) {
    return items.reduce((sum, item) => {
      const prod = PRODUCTS[item.pid];
      if (!prod) return sum;
      return sum + (prod.price_b2b || prod.price_b2c || 0) * item.qty;
    }, 0);
  }

  function addB2bItem() { setB2bForm(f => ({ ...f, items: [...f.items, { pid: 'spelt-groot', qty: 1 }] })); }
  function removeB2bItem(i) { setB2bForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) })); }
  function updateB2bItem(i, field, val) {
    setB2bForm(f => { const items = [...f.items]; items[i] = { ...items[i], [field]: val }; return { ...f, items }; });
  }

  function saveB2bOrder() {
    setSaving(true);
    const total = calcB2bTotal(b2bForm.items);
    const newOrder = {
      ...b2bForm,
      id: 'B2B-' + Date.now(),
      total,
      items: b2bForm.items.map(item => ({
        pid: item.pid,
        name: PRODUCTS[item.pid]?.name || item.pid,
        quantity: item.qty,
        qty: item.qty,
        price: PRODUCTS[item.pid]?.price_b2b || 0,
      })),
    };
    setOrders(prev => [newOrder, ...prev]);
    setShowB2bForm(false);
    setB2bForm(emptyB2bOrder());
    setSaving(false);
  }

  function deleteManualOrder(id) {
    if (!confirm('Bestelling verwijderen?')) return;
    setOrders(prev => prev.filter(o => o.id !== id));
    setSelected(null);
  }

  const filtered = orders.filter(o => {
    const name = getCustomer(o).toLowerCase();
    const matchQ = !search || name.includes(search.toLowerCase());
    const matchS = filterStatus === 'all' || normalizeStatus(o.status) === filterStatus;
    const matchT = filterType   === 'all' || getType(o) === filterType;
    return matchQ && matchS && matchT;
  });

  const newCount = orders.filter(o => normalizeStatus(o.status) === 'new').length;
  const b2bRevenue = orders.filter(o => getType(o)==='b2b').reduce((s,o) => s+getTotal(o), 0);
  const b2cRevenue = orders.filter(o => getType(o)==='b2c').reduce((s,o) => s+getTotal(o), 0);

  // Input style helper
  const inp = (extra={}) => ({ padding:'8px 12px', border:'1px solid var(--border)', borderRadius:'8px', fontSize:'13px', fontFamily:'DM Sans, sans-serif', background:'var(--cream)', color:'var(--dark)', outline:'none', width:'100%', ...extra });

  return <div className="page-enter">
    <div className="page-header">
      <h2>Bestellingen</h2>
      <p>{orders.length} bestellingen · {fmt(b2bRevenue + b2cRevenue)} totale omzet</p>
    </div>

    {/* Stats */}
    <div className="stats-grid" style={{ marginBottom:'20px' }}>
      {[
        { label:'Nieuw', value: newCount, sub:'te verwerken', color:'#1D4ED8' },
        { label:'B2C omzet', value: fmt(b2cRevenue), sub:`${orders.filter(o=>getType(o)==='b2c').length} orders` },
        { label:'B2B omzet', value: fmt(b2bRevenue), sub:`${orders.filter(o=>getType(o)==='b2b').length} orders` },
        { label:'Totaal', value: orders.length, sub:'bestellingen' },
      ].map((s,i) => <div key={i} className="stat-card">
        <div className="label">{s.label}</div>
        <div className="value" style={{ fontSize: typeof s.value==='string'?'22px':'36px', color: s.color||'var(--dark)' }}>{s.value}</div>
        <div className="sub">{s.sub}</div>
      </div>)}
    </div>

    {/* Toolbar */}
    <div className="toolbar">
      <input className="search-input" placeholder="Zoek klant…" value={search} onChange={e=>setSearch(e.target.value)} />
      <select className="select-input" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
        <option value="all">Alle statussen</option>
        <option value="new">Nieuw</option>
        <option value="confirmed">Bevestigd</option>
        <option value="ready">Klaar</option>
        <option value="delivered">Geleverd</option>
        <option value="cancelled">Geannuleerd</option>
      </select>
      <select className="select-input" value={filterType} onChange={e=>setFilterType(e.target.value)}>
        <option value="all">B2B + B2C</option>
        <option value="b2b">Alleen B2B</option>
        <option value="b2c">Alleen B2C</option>
      </select>
      <div className="toolbar-spacer" />
      {loading
        ? <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'11px', fontFamily:'DM Mono', color:'var(--text-muted)' }}>
            <div className="spinner" style={{ width:14, height:14, margin:0, border:'2px solid var(--border)', borderTopColor:'var(--amber)' }} />
            syncing…
          </div>
        : <div style={{ fontSize:'10px', fontFamily:'DM Mono', color:'var(--text-muted)' }}>↻ elke 15 min</div>
      }
      <button className="btn btn-primary" onClick={()=>setShowB2bForm(true)}>+ B2B bestelling</button>
    </div>

    {error && <div className="error-msg" style={{marginBottom:'16px'}}>⚠️ Take App: {error}</div>}

    {/* Orders list */}
    <div className="orders-grid">
      {filtered.length===0 && <div className="empty-msg"><div className="icon">📭</div>Geen bestellingen gevonden</div>}
      {filtered.map(o => <div key={o.id} className={`order-card ${selected?.id===o.id?'selected':''}`} onClick={()=>setSelected(o)}>
        <div className="order-num" style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
          <span style={{ fontFamily:'DM Mono', fontSize:'11px', color:'var(--text-muted)' }}>#{o.number || String(o.id).slice(-5)}</span>
          {o.source==='manual' && <span style={{ fontSize:'9px', background:'#F3E8FF', color:'#6B21A8', padding:'1px 5px', borderRadius:'4px', fontFamily:'DM Mono' }}>manueel</span>}
        </div>
        <div className="order-customer">
          <strong>{getCustomer(o)}</strong>
          <span>{o.deliveryDate||o.delivery_date||o.date||(o.createdAt ? new Date(o.createdAt).toLocaleDateString('nl-BE') : '—')}</span>
        </div>
        <div className="order-items" style={{ fontSize:'12px', color:'var(--text-muted)' }}>{getItems(o)||'—'}</div>
        <span className={`badge badge-${getType(o)}`}>{getType(o).toUpperCase()}</span>
        <StatusBadge s={o.status||'new'} />
        <div className="order-total">{fmt(getTotal(o))}</div>
      </div>)}
    </div>

    {/* Order detail modal */}
    {selected && <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
      <div className="modal">
        <div style={{ display:'flex', alignItems:'flex-start', gap:'12px', marginBottom:'4px' }}>
          <div style={{ flex:1 }}>
            <h3 style={{ marginBottom:'6px' }}>{getCustomer(selected)}</h3>
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
              <StatusBadge s={selected.status||'new'} />
              <span className={`badge badge-${getType(selected)}`}>{getType(selected).toUpperCase()}</span>
              {selected.source==='manual'&&<span className="badge" style={{background:'#F3E8FF',color:'#6B21A8',border:'1px solid #DDD6FE'}}>Manueel</span>}
            </div>
          </div>
          <button onClick={()=>setSelected(null)} style={{ border:'none', background:'none', fontSize:'20px', cursor:'pointer', color:'var(--text-muted)' }}>✕</button>
          {selected.paymentStatus && <span className="badge" style={{ background: selected.paymentStatus==='PAYMENT_STATUS_PAID'?'#D1FAE5':'#FEF3C7', color: selected.paymentStatus==='PAYMENT_STATUS_PAID'?'#065F46':'#92400E', border:'none', fontSize:'10px' }}>
            {selected.paymentStatus==='PAYMENT_STATUS_PAID'?'✓ Betaald':selected.paymentStatus==='PAYMENT_STATUS_PENDING'?'⏳ Onbetaald':'💳 '+selected.paymentStatus.replace('PAYMENT_STATUS_','')}
          </span>}
        </div>

        {(selected.customer?.phone||selected.customerPhone||selected.phone) && <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'6px' }}>📞 {selected.customer?.phone||selected.customerPhone||selected.phone}</div>}
        {(selected.customer?.email||selected.customerEmail||selected.email) && <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>✉️ {selected.customer?.email||selected.customerEmail||selected.email}</div>}
        <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>📅 {selected.deliveryDate||selected.delivery_date ? 'Levering: '+(selected.deliveryDate||selected.delivery_date) : 'Besteld op: '+new Date(selected.createdAt||Date.now()).toLocaleDateString('nl-BE')}</div>

        <div className="divider" />

        {(selected.items||selected.order_items||[]).map((item,i) => {
          const pid = item.pid || matchProduct(item.name||item.product_name);
          const prod = pid ? PRODUCTS[pid] : null;
          const rawPrice = item.price||item.unit_price||0;
          const price = rawPrice > 100 && Number.isInteger(rawPrice) ? rawPrice / 100 : rawPrice;
          const qty = item.quantity||item.qty||1;
          return <div key={i} className="order-detail-item">
            <span>{qty}× {item.name||item.product_name||'?'}</span>
            <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
              {prod && <span className="profit-pill profit-high">{Math.round((prod.price_b2c - prod.flour_kg*prod.flour_cost_kg)/prod.price_b2c*100)}% marge</span>}
              <span style={{ fontFamily:'DM Mono', fontSize:'13px' }}>{fmt(price*qty)}</span>
            </div>
          </div>;
        })}

        <div className="divider" />
        <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'DM Serif Display', fontSize:'22px' }}>
          <span>Totaal</span><span style={{ color:'var(--amber)' }}>{fmt(getTotal(selected))}</span>
        </div>

        {(selected.note || selected.remark) && <div style={{ marginTop:'12px', background:'var(--flour)', borderRadius:'8px', padding:'10px 14px', fontSize:'13px', color:'var(--text-muted)' }}>📝 {selected.note || selected.remark}</div>}

        <div className="modal-footer">
          <div style={{ flex:1 }}>
            <label style={{ fontSize:'11px', fontFamily:'DM Mono', color:'var(--text-muted)', display:'block', marginBottom:'4px' }}>STATUS</label>
            <select className="status-select" value={normalizeStatus(selected.status)} onChange={e=>updateStatus(selected.id, e.target.value)}>
              <option value="new">Nieuw</option>
              <option value="confirmed">Bevestigd</option>
              <option value="ready">Klaar</option>
              <option value="delivered">Geleverd</option>
              <option value="cancelled">Geannuleerd</option>
            </select>
          </div>
          {selected.source==='manual' && <button className="btn btn-danger" onClick={()=>deleteManualOrder(selected.id)}>Verwijderen</button>}
          <button className="btn btn-secondary" onClick={()=>setSelected(null)}>Sluiten</button>
        </div>
      </div>
    </div>}

    {/* B2B form modal */}
    {showB2bForm && <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowB2bForm(false)}>
      <div className="modal" style={{ width:'580px' }}>
        <h3>Nieuwe B2B bestelling</h3>

        {/* Customer info */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
          {[
            ['Klantnaam *','customer_name','text','bv. Bakkerij De Molen'],
            ['Telefoon','phone','tel','bv. 0478 12 34 56'],
            ['E-mail','email','email','bv. info@bakkerij.be'],
            ['Leveringsdatum *','delivery_date','date',''],
          ].map(([label,field,type,placeholder]) => <div key={field}>
            <div style={{ fontSize:'11px', fontFamily:'DM Mono', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'4px' }}>{label}</div>
            <input type={type} value={b2bForm[field]} placeholder={placeholder}
              onChange={e=>setB2bForm(f=>({...f,[field]:e.target.value}))}
              style={inp()} />
          </div>)}
        </div>

        {/* Items */}
        <div style={{ fontSize:'11px', fontFamily:'DM Mono', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px' }}>Producten</div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 80px 80px 28px', gap:'8px', marginBottom:'6px', padding:'0 4px' }}>
          {['Product','Aantal','B2B prijs',''].map(h=><div key={h} style={{ fontSize:'10px', fontFamily:'DM Mono', color:'var(--text-muted)', textTransform:'uppercase' }}>{h}</div>)}
        </div>

        {b2bForm.items.map((item, i) => {
          const prod = PRODUCTS[item.pid];
          return <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 80px 80px 28px', gap:'8px', marginBottom:'6px', alignItems:'center' }}>
            <select value={item.pid} onChange={e=>updateB2bItem(i,'pid',e.target.value)} style={inp()}>
              {Object.entries(PRODUCTS).filter(([,p])=>p.price_b2b).map(([pid,p])=>
                <option key={pid} value={pid}>{p.name}</option>)}
            </select>
            <input type="number" min="1" value={item.qty} onChange={e=>updateB2bItem(i,'qty',parseInt(e.target.value)||1)} style={inp({ textAlign:'center' })} />
            <div style={{ fontFamily:'DM Mono', fontSize:'13px', padding:'8px 0', color:'var(--amber)' }}>{fmt((prod?.price_b2b||0)*item.qty)}</div>
            <button onClick={()=>removeB2bItem(i)} style={{ border:'none', background:'none', cursor:'pointer', color:'#DC2626', fontSize:'16px' }}>✕</button>
          </div>;
        })}

        <button className="wf-add-btn" onClick={addB2bItem}>+ Product toevoegen</button>

        <div style={{ marginTop:'12px' }}>
          <div style={{ fontSize:'11px', fontFamily:'DM Mono', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'4px' }}>Opmerking</div>
          <textarea value={b2bForm.note} onChange={e=>setB2bForm(f=>({...f,note:e.target.value}))} rows={2}
            style={{ ...inp(), resize:'vertical' }} placeholder="Speciale wensen, afleverinstructies…" />
        </div>

        <div style={{ background:'var(--flour)', borderRadius:'8px', padding:'12px 16px', marginTop:'12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:'13px', color:'var(--text-muted)' }}>Totaal ({b2bForm.items.reduce((s,i)=>s+i.qty,0)} broden)</span>
          <span style={{ fontFamily:'DM Serif Display', fontSize:'22px', color:'var(--amber)' }}>{fmt(calcB2bTotal(b2bForm.items))}</span>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={()=>setShowB2bForm(false)}>Annuleren</button>
          <button className="btn btn-primary" onClick={saveB2bOrder} disabled={!b2bForm.customer_name||saving}>
            {saving ? 'Opslaan…' : '✓ Bestelling opslaan'}
          </button>
        </div>
      </div>
    </div>}
  </div>;
}

