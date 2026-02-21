// Labels page
function LabelsPage({ products: PRODUCTS }) {
  PRODUCTS = PRODUCTS || DEFAULT_PRODUCTS;
  const [selected, setSelected] = useState([]);
  const [qty, setQty] = useState({});

  function toggle(pid) {
    setSelected(s => s.includes(pid) ? s.filter(x => x !== pid) : [...s, pid]);
    if (!qty[pid]) setQty(q => ({ ...q, [pid]: 1 }));
  }

  function printLabels() {
    const labelsHtml = selected.flatMap(pid => {
      const prod = PRODUCTS[pid];
      const n = qty[pid] || 1;
      return Array(n).fill(0).map((_, i) => `
        <div style="display:inline-block;width:240px;height:140px;border:2px solid #1A1410;border-radius:8px;padding:16px;margin:8px;font-family:serif;position:relative;overflow:hidden;vertical-align:top;page-break-inside:avoid;">
          <div style="position:absolute;top:0;left:0;right:0;height:6px;background:#C8840A;"></div>
          <div style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#8B7355;margin-top:8px;">Zuurdesem Bakkerij</div>
          <div style="font-size:20px;font-weight:bold;margin-top:2px;">${prod.name}</div>
          <div style="font-size:11px;color:#8B7355;">${prod.weight_g ? prod.weight_g + 'g' : ''} · Artisanaal zuurdesem</div>
          <div style="font-size:24px;font-weight:bold;color:#C8840A;position:absolute;bottom:12px;right:16px;">€${prod.price_b2c?.toFixed(2)}</div>
          <div style="font-size:9px;color:#8B7355;position:absolute;bottom:12px;left:16px;">BTW incl. 6%</div>
        </div>`);
    }).join('');
    const w = window.open('', '_blank');
    w.document.write(`<html><body style="background:white;padding:16px;">${labelsHtml}</body></html>`);
    w.document.close();
    w.print();
  }

  return <div className="page-enter">
    <div className="page-header">
      <h2>Etiketten & Bonnen</h2>
      <p>Selecteer producten en druk etiketten af</p>
    </div>
    <div className="toolbar">
      <div className="toolbar-spacer" />
      {selected.length > 0 && <button className="btn btn-primary" onClick={printLabels}>🖨️ Druk {selected.reduce((a,p)=>a+(qty[p]||1),0)} etiketten af</button>}
    </div>

    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0' }}>
      {Object.entries(PRODUCTS).map(([pid, prod]) => {
        const sel = selected.includes(pid);
        return <div key={pid} style={{ position: 'relative', display: 'inline-block' }} onClick={() => toggle(pid)}>
          <div className="label-preview" style={sel ? { border: '2px solid var(--amber)', boxShadow: '0 0 0 3px rgba(200,132,10,0.2)' } : {}}>
            <div className="bakery-name">Zuurdesem Bakkerij</div>
            <h4>{prod.name}</h4>
            <div className="weight">{prod.weight_g ? prod.weight_g + 'g ·' : ''} {prod.category}</div>
            <div className="price">{prod.price_b2c ? `€${prod.price_b2c.toFixed(2)}` : 'B2B'}</div>
            {sel && <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--amber)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>✓</div>}
          </div>
          {sel && <div style={{ textAlign: 'center', marginTop: '-4px', marginBottom: '4px' }} onClick={e => e.stopPropagation()}>
            <input type="number" min="1" max="100" value={qty[pid] || 1} onChange={e => setQty(q => ({ ...q, [pid]: parseInt(e.target.value) || 1 }))}
              style={{ width: '60px', textAlign: 'center', border: '1px solid var(--border)', borderRadius: '6px', padding: '2px 6px', fontFamily: 'DM Mono' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>stuks</span>
          </div>}
        </div>;
      })}
    </div>
  </div>;
}

