// Inventory page
function InventoryPage({ ingredients, setIngredients }) {
  const [stock, setStock] = useState((ingredients || DEFAULT_INVENTORY).map(i => ({ ...i })));
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');

  function startEdit(id, val) { setEditing(id); setEditVal(String(val)); }
  function saveEdit(id) {
    const val = parseFloat(editVal);
    if (!isNaN(val)) setStock(s => { const ns = s.map(i => i.id === id ? { ...i, stock_kg: val } : i); if (setIngredients) setIngredients(ns); return ns; });
    setEditing(null);
  }

  const lowItems = stock.filter(i => i.stock_kg < i.min_stock);

  return <div className="page-enter">
    <div className="page-header">
      <h2>Ingrediënten & Voorraad</h2>
      <p>Klik op een voorraad om te wijzigen</p>
    </div>

    {lowItems.length > 0 && <div className="error-msg" style={{ marginBottom: '20px', background: '#FEF3C7', borderColor: '#FDE68A', color: '#92400E' }}>
      ⚠️ Lage voorraad: {lowItems.map(i => i.name).join(', ')}
    </div>}

    <div className="inventory-grid">
      {stock.map(item => {
        const pct = Math.min(100, (item.stock_kg / (item.min_stock * 3)) * 100);
        const low = item.stock_kg < item.min_stock;
        return <div key={item.id} className={`ingredient-card ${low ? 'low' : ''}`}>
          <div className="name">{item.name}</div>
          {editing === item.id ? (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
              <input autoFocus type="number" value={editVal} onChange={e => setEditVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveEdit(item.id); if (e.key === 'Escape') setEditing(null); }}
                style={{ width: '80px', padding: '4px 8px', border: '1px solid var(--amber)', borderRadius: '6px', fontFamily: 'DM Mono' }} />
              <button className="btn btn-primary" style={{ padding: '4px 10px' }} onClick={() => saveEdit(item.id)}>✓</button>
            </div>
          ) : (
            <div className={`stock ${low ? 'low' : ''}`} onClick={() => startEdit(item.id, item.stock_kg)} style={{ cursor: 'pointer' }} title="Klik om te wijzigen">
              {item.stock_kg} <span className="unit">{item.unit}</span>
            </div>
          )}
          <div className="stock-bar">
            <div className="stock-bar-fill" style={{ width: pct + '%', background: low ? '#DC2626' : pct > 60 ? 'var(--sage)' : 'var(--amber)' }} />
          </div>
          <div className="cost">Min: {item.min_stock} {item.unit} · {item.cost_kg > 0 ? `€${item.cost_kg}/${item.unit}` : 'Gratis'}</div>
        </div>;
      })}
    </div>
  </div>;
}

