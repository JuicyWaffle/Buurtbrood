// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const [page, setPage]               = useState('bestellingen');
  const [orders, setOrders]           = useState([]);
  const [workflows, setWorkflows]     = useState({});
  const [products, setProducts]       = useState(null);
  const [inventory, setInventory]     = useState(null);
  const [productLinks, setProductLinks] = useState({});
  const [loaded, setLoaded]           = useState(false);

  // ── Boot: load everything from server ──────────────────────────────────────
  useEffect(() => {
    async function boot() {
      // Load settings (API key)
      const settings = await LOCAL.load('settings');
      if (settings?.api_key) API_KEY = settings.api_key;

      // Load persistent data
      const [wf, prods, inv, manualOrders, links] = await Promise.all([
        LOCAL.load('workflows'),
        LOCAL.load('products'),
        LOCAL.load('inventory'),
        LOCAL.load('orders'),
        LOCAL.load('links'),
      ]);

      if (wf)           setWorkflows(wf);
      if (prods)        setProducts(prods);
      if (inv)          setInventory(inv);
      if (links)        setProductLinks(links);

      // Merge manual orders + Take App orders
      const manual = (manualOrders || []).map(o => ({ ...o, source: 'manual' }));
      setOrders(manual);

      setLoaded(true);

      // Then try Take App
      if (API_KEY) {
        apiGet('/orders').then(data => {
          const apiOrders = (data.orders || data || []).map(o => ({ ...o, source: 'takeapp' }));
          setOrders(prev => [...apiOrders, ...prev.filter(o => o.source === 'manual')]);
        }).catch(() => {});
      }
    }
    boot();
  }, []);

  // ── Auto-save whenever data changes ────────────────────────────────────────
  const isFirst = React.useRef(true);
  useEffect(() => {
    if (!loaded) return;
    if (isFirst.current) { isFirst.current = false; return; }
    LOCAL.save('workflows', workflows);
  }, [workflows]);

  useEffect(() => {
    if (!loaded) return;
    const manual = orders.filter(o => o.source === 'manual');
    LOCAL.save('orders', manual);
  }, [orders]);

  useEffect(() => {
    if (!loaded) return;
    LOCAL.save('links', productLinks);
  }, [productLinks]);

  const PRODUCTS = products || DEFAULT_PRODUCTS;
  const INGREDIENTS_DATA = inventory || DEFAULT_INVENTORY;

  const pages = {
    bestellingen: <BestellingenPage orders={orders} setOrders={setOrders} products={PRODUCTS} />,
    kalender:     <CalendarPage orders={orders} workflows={workflows} products={PRODUCTS} onNavigate={setPage} />,
    ingredienten: <IngredientsPage orders={orders} workflows={workflows} products={PRODUCTS} />,
    workflows:    <WorkflowPage workflows={workflows} setWorkflows={setWorkflows}
                    productLinks={productLinks} setProductLinks={setProductLinks}
                    products={PRODUCTS} />,
    timers:       <TimersPage />,
    inventory:    <InventoryPage ingredients={INGREDIENTS_DATA} setIngredients={data => { setInventory(data); LOCAL.save('inventory', data); }} />,
    labels:       <LabelsPage products={PRODUCTS} />,
    settings:     <SettingsPage />,
  };

  if (!loaded) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'DM Serif Display, serif', fontSize:'24px', color:'var(--text-muted)', flexDirection:'column', gap:'16px' }}>
    <div className="spinner" />
    Buurtbrood laden…
  </div>;

  return <div className="app">
    <nav className="sidebar">
      <div className="sidebar-brand">
        <img className="sidebar-logo" src="https://emofly.b-cdn.net/hbd_exvhac6ayb3ZKT/width:640/plain/https://storage.googleapis.com/takeapp/media/cmhuetmcl000f04jv2xro1r81.jpg" alt="Buurtbrood" />
        <h1>Buurtbrood<br />planner</h1>
        <p>Artisanaal Zuurdesem</p>
      </div>
      <div className="sidebar-nav">
        <div className="nav-section-label">Orders</div>
        <NavBtn icon="📋" label="Bestellingen"       active={page==='bestellingen'} onClick={()=>setPage('bestellingen')} />

        <div className="nav-section-label">Productie</div>
        <NavBtn icon="📅" label="Kalender"           active={page==='kalender'}     onClick={()=>setPage('kalender')} />
        <NavBtn icon="⚖️" label="Ingrediëntenlijst"  active={page==='ingredienten'} onClick={()=>setPage('ingredienten')} />
        <NavBtn icon="🍞" label="Bakinstructies"     active={page==='workflows'}    onClick={()=>setPage('workflows')} />
        <NavBtn icon="⏱️" label="Timers"             active={page==='timers'}       onClick={()=>setPage('timers')} />

        <div className="nav-section-label">Beheer</div>
        <NavBtn icon="🌾" label="Voorraad"           active={page==='inventory'}    onClick={()=>setPage('inventory')} />
        <NavBtn icon="🏷️" label="Etiketten"          active={page==='labels'}       onClick={()=>setPage('labels')} />
        <NavBtn icon="⚙️" label="Instellingen"       active={page==='settings'}     onClick={()=>setPage('settings')} />
      </div>
      <div style={{ padding:'16px 24px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize:'10px', fontFamily:'DM Mono', color:'rgba(255,255,255,0.2)', lineHeight:1.5 }}>
          Take App API<br />
          <span style={{ color: API_KEY ? 'rgba(100,220,120,0.7)' : 'rgba(255,100,100,0.6)' }}>
            {API_KEY ? '● verbonden' : '○ geen sleutel'}
          </span>
        </div>
      </div>
    </nav>
    <main className="main">
      {pages[page]}
    </main>
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
</script>
</body>
</html>
