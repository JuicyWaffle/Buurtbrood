// ─── WorkflowPage ─────────────────────────────────────────────────────────────
function WorkflowPage({ workflows, setWorkflows, productLinks, setProductLinks, products: PRODUCTS }) {
  PRODUCTS = PRODUCTS || DEFAULT_PRODUCTS;
  const [activePid, setActivePid]     = useState(null);
  const [inventory, setInventory]     = useState([]);
  const [invLoading, setInvLoading]   = useState(false);
  const [invError, setInvError]       = useState(null);

  // Load inventory from Take App
  async function loadInventory() {
    setInvLoading(true); setInvError(null);
    try {
      const data = await apiGet('/inventory');
      setInventory(data.products || data.inventory || data || []);
    } catch (e) {
      setInvError(e.message);
      // Mock fallback
      setInventory(MOCK_INVENTORY);
    } finally { setInvLoading(false); }
  }

  useEffect(() => { loadInventory(); }, []);

  const steps = activePid ? (workflows[activePid] || DEFAULT_WORKFLOWS[activePid] || []) : [];

  function save(newSteps) { setWorkflows(w => ({ ...w, [activePid]: newSteps })); }
  function addStep() {
    const maxId = steps.reduce((m,s) => Math.max(m,s.id), 0);
    save([...steps, { id:maxId+1, type:'rijzen', label:'Nieuwe stap', duration_min:30, day:0, min_after:60, max_after:120 }]);
  }
  function updateStep(id, field, value) { save(steps.map(s => s.id===id ? {...s,[field]:value} : s)); }
  function removeStep(id)               { save(steps.filter(s => s.id!==id)); }
  function moveStep(id, dir) {
    const idx = steps.findIndex(s => s.id===id);
    const ns = [...steps]; const si = idx+dir;
    if (si<0||si>=ns.length) return;
    [ns[idx],ns[si]] = [ns[si],ns[idx]]; save(ns);
  }

  return <div className="page-enter">
    <div className="page-header">
      <h2>Bakinstructies</h2>
      <p>Koppel Take App producten aan een bakworkflow</p>
    </div>

    {/* ── Inventory from Take App ── */}
    <div style={{ marginBottom:'28px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'14px' }}>
        <h3 style={{ fontFamily:'DM Serif Display', fontSize:'20px', flex:1 }}>Take App producten</h3>
        <button className="btn btn-secondary" onClick={loadInventory} disabled={invLoading}>
          {invLoading ? '…' : '↻ Vernieuwen'}
        </button>
      </div>

      {invError && <div className="error-msg" style={{marginBottom:'12px'}}>⚠️ {invError} — demo getoond</div>}

      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {(invLoading && inventory.length===0) && <div className="spinner" />}
        {inventory.map(inv => {
          const linkedPid = productLinks[inv.id];
          const linked = linkedPid ? PRODUCTS[linkedPid] : null;
          const wfSteps = linkedPid ? (workflows[linkedPid]||DEFAULT_WORKFLOWS[linkedPid]||[]).length : 0;
          return <div key={inv.id} style={{
            display:'grid', gridTemplateColumns:'1fr 160px 200px 36px',
            gap:'14px', alignItems:'center',
            background:'var(--warm-white)', border:`1px solid ${linked?'var(--sage)':'var(--border)'}`,
            borderRadius:'10px', padding:'12px 18px', transition:'border-color 0.15s'
          }}>
            <div>
              <div style={{ fontWeight:500, fontSize:'14px' }}>{inv.name||inv.title||'Product'}</div>
              <div style={{ fontSize:'11px', fontFamily:'DM Mono', color:'var(--text-muted)', marginTop:'2px' }}>
                SKU: {inv.sku||inv.id||'—'} · Voorraad: {inv.quantity??inv.stock??'?'} stuks
              </div>
            </div>

            {/* Link to our workflow */}
            <select
              value={linkedPid||''}
              onChange={e => setProductLinks(l => ({...l,[inv.id]:e.target.value||undefined}))}
              style={{ padding:'6px 10px', border:'1px solid var(--border)', borderRadius:'7px', fontSize:'12px', fontFamily:'DM Sans', background:'var(--cream)', outline:'none', cursor:'pointer' }}>
              <option value="">— Geen workflow —</option>
              {Object.entries(PRODUCTS).map(([pid,p]) => <option key={pid} value={pid}>{p.name}</option>)}
            </select>

            {/* Workflow status */}
            <div style={{ fontSize:'12px', color: linked ? 'var(--sage)' : 'var(--text-muted)', display:'flex', alignItems:'center', gap:'6px' }}>
              {linked ? <>
                <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--sage)', display:'inline-block' }} />
                {linked.name} · {wfSteps} stappen
              </> : <span style={{ color:'var(--text-muted)' }}>Niet gekoppeld</span>}
            </div>

            {/* Quick-edit button */}
            <button
              disabled={!linkedPid}
              onClick={() => { if (linkedPid) setActivePid(linkedPid); window.scrollTo({top:999999,behavior:'smooth'}); }}
              title="Bewerk workflow"
              style={{ border:'none', background: linkedPid?'var(--amber)':'var(--flour)', color: linkedPid?'white':'var(--text-muted)', borderRadius:'7px', width:'32px', height:'32px', cursor: linkedPid?'pointer':'default', fontSize:'14px' }}>
              ✎
            </button>
          </div>;
        })}
        {!invLoading && inventory.length===0 && <div className="empty-msg" style={{padding:'30px'}}><div className="icon">📦</div>Geen producten geladen</div>}
      </div>
    </div>

    <div className="divider" />

    {/* ── Workflow editor ── */}
    <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'20px 0 16px' }}>
      <h3 style={{ fontFamily:'DM Serif Display', fontSize:'20px', flex:1 }}>Workflows per product</h3>
    </div>

    <div className="wf-product-list">
      {Object.entries(PRODUCTS).map(([pid, prod]) => {
        const wf = workflows[pid] || DEFAULT_WORKFLOWS[pid] || [];
        const isLinked = Object.values(productLinks).includes(pid);
        return <div key={pid} className={`wf-product-row ${activePid===pid?'active':''}`} onClick={()=>setActivePid(pid===activePid?null:pid)}>
          <div className={`step-type-dot dot-${wf[0]?.type||'kneden'}`} />
          <div className="wf-product-name">{prod.name}</div>
          <div className="wf-product-steps">{wf.length} stappen</div>
          {isLinked && <span style={{ fontSize:'10px', fontFamily:'DM Mono', background:'#D1FAE5', color:'#065F46', padding:'2px 7px', borderRadius:'10px' }}>gekoppeld</span>}
          <div style={{ display:'flex', gap:'4px' }}>
            {['T-2','T-1','T0'].map((d,i) => {
              const has = wf.some(s=>s.day===i);
              return <span key={d} style={{ fontSize:'10px', fontFamily:'DM Mono', padding:'2px 6px', borderRadius:'10px', background:has?'var(--amber)':'var(--flour)', color:has?'white':'var(--text-muted)' }}>{d}</span>;
            })}
          </div>
          <span style={{ color:'var(--text-muted)', fontSize:'16px' }}>{activePid===pid?'▾':'›'}</span>
        </div>;
      })}
    </div>

    {/* Inline editor */}
    {activePid && <div className="wf-editor" style={{ marginTop:'8px' }}>
      <div className="wf-editor-header">
        <h3>{PRODUCTS[activePid]?.name}</h3>
        <button className="btn btn-primary" onClick={()=>setWorkflows(w=>({...w,[activePid]:DEFAULT_WORKFLOWS[activePid]||[]}))}>↺ Herstel standaard</button>
        <button className="btn btn-secondary" onClick={()=>setActivePid(null)}>Sluiten ✕</button>
      </div>
      <div className="wf-editor-body">
        <div className="wf-step-col-headers">
          <div /><div style={{fontSize:'11px',fontFamily:'DM Mono',color:'var(--text-muted)',textTransform:'uppercase'}}>Stap</div>
          <div style={{fontSize:'11px',fontFamily:'DM Mono',color:'var(--text-muted)',textTransform:'uppercase'}}>Duurtijd</div>
          <div style={{fontSize:'11px',fontFamily:'DM Mono',color:'var(--text-muted)',textTransform:'uppercase'}}>Dag</div>
          <div style={{fontSize:'11px',fontFamily:'DM Mono',color:'var(--text-muted)',textTransform:'uppercase'}}>Venster na vorige</div>
          <div />
        </div>

        {steps.map((step,idx) => <div key={step.id} className="wf-step">
          <div className={`wf-step-num ${step.type}`}>{idx+1}</div>
          <div>
            <select className="wf-step-type-select" value={step.type} onChange={e=>updateStep(step.id,'type',e.target.value)} style={{marginBottom:'4px'}}>
              {STEP_TYPES.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </select>
            <input className="wf-step-input" value={step.label} onChange={e=>updateStep(step.id,'label',e.target.value)} placeholder="Label…" style={{fontSize:'12px',padding:'4px 8px'}} />
          </div>
          <div>
            <div className="wf-step-label">minuten</div>
            <input className="wf-step-input" type="number" min="0" value={step.duration_min} onChange={e=>updateStep(step.id,'duration_min',parseInt(e.target.value)||0)} />
          </div>
          <div>
            <div className="wf-step-label">Dag</div>
            <select className="wf-step-type-select" value={step.day} onChange={e=>updateStep(step.id,'day',parseInt(e.target.value))}>
              <option value={0}>T-2</option><option value={1}>T-1</option><option value={2}>T0 (bakdag)</option>
            </select>
          </div>
          <div>
            <div className="wf-step-label">Min / Max (min)</div>
            <div style={{display:'flex',gap:'4px',alignItems:'center'}}>
              <input className="wf-step-input" type="number" min="0" value={step.min_after??''} placeholder="min" onChange={e=>updateStep(step.id,'min_after',e.target.value===''?null:parseInt(e.target.value))} style={{fontSize:'12px',padding:'4px 6px'}} />
              <span style={{color:'var(--text-muted)',fontSize:'12px',flexShrink:0}}>–</span>
              <input className="wf-step-input" type="number" min="0" value={step.max_after??''} placeholder="max" onChange={e=>updateStep(step.id,'max_after',e.target.value===''?null:parseInt(e.target.value))} style={{fontSize:'12px',padding:'4px 6px'}} />
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'3px'}}>
            <button onClick={()=>moveStep(step.id,-1)} style={{border:'none',background:'none',cursor:'pointer',fontSize:'13px',color:'var(--text-muted)',padding:'2px'}}>▲</button>
            <button onClick={()=>moveStep(step.id,1)}  style={{border:'none',background:'none',cursor:'pointer',fontSize:'13px',color:'var(--text-muted)',padding:'2px'}}>▼</button>
            <button onClick={()=>removeStep(step.id)}  style={{border:'none',background:'none',cursor:'pointer',fontSize:'13px',color:'#DC2626',padding:'2px'}}>✕</button>
          </div>
        </div>)}

        <button className="wf-add-btn" onClick={addStep}>+ Stap toevoegen</button>
      </div>
    </div>}
  </div>;
}

