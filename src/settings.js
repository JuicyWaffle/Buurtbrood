// ─── SettingsPage ─────────────────────────────────────────────────────────────
function SettingsPage() {
  const [key, setKey] = useState('');
  useEffect(() => { LOCAL.load('settings').then(d => { if (d?.api_key) { setKey(d.api_key); API_KEY = d.api_key; } }); }, []);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [show, setShow] = useState(false);

  function save() {
    API_KEY = key.trim();
    LOCAL.save('settings', { api_key: API_KEY });
    setSaved(true);
    setTestResult(null);
    setTimeout(() => setSaved(false), 2500);
  }

  async function test() {
    setTesting(true); setTestResult(null);
    try {
      const data = await apiGet('/me');
      setTestResult({ ok: true, msg: `✓ Verbonden als: ${data.name || data.email || 'onbekend'}` });
    } catch (e) {
      setTestResult({ ok: false, msg: `✗ Fout: ${e.message}` });
    } finally { setTesting(false); }
  }

  function clear() {
    setKey(''); API_KEY = '';
    LOCAL.save('settings', { api_key: '' });
    setTestResult(null);
  }

  const hasKey = key.trim().length > 0;

  return <div className="page-enter">
    <div className="page-header">
      <h2>Instellingen</h2>
      <p>Take App API-configuratie</p>
    </div>

    <div style={{ maxWidth: '560px' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--dark)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🔑</div>
          <div>
            <div style={{ fontWeight: 500, fontSize: '15px' }}>Take App API-sleutel</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Vind je sleutel via Instellingen → Integraties in Take App</div>
          </div>
        </div>

        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <input
            type={show ? 'text' : 'password'}
            value={key}
            onChange={e => { setKey(e.target.value); setTestResult(null); }}
            placeholder="Plak hier je API-sleutel…"
            style={{
              width: '100%', padding: '10px 44px 10px 14px',
              border: `1px solid ${hasKey ? 'var(--sage)' : 'var(--border)'}`,
              borderRadius: '8px', fontSize: '13px', fontFamily: 'DM Mono, monospace',
              background: 'var(--cream)', color: 'var(--dark)', outline: 'none',
              letterSpacing: show ? '0.02em' : '0.12em'
            }}
            onKeyDown={e => e.key === 'Enter' && save()}
          />
          <button onClick={() => setShow(s => !s)} style={{
            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
            border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-muted)'
          }}>{show ? '🙈' : '👁️'}</button>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={save} disabled={!hasKey}>
            {saved ? '✓ Opgeslagen' : 'Opslaan'}
          </button>
          <button className="btn btn-secondary" onClick={test} disabled={!hasKey || testing}>
            {testing ? '…' : '🔌 Verbinding testen'}
          </button>
          {hasKey && <button className="btn btn-danger" onClick={clear}>Verwijderen</button>}
        </div>

        {testResult && <div style={{
          marginTop: '14px', padding: '10px 14px', borderRadius: '8px',
          background: testResult.ok ? '#D1FAE5' : '#FEE2E2',
          color: testResult.ok ? '#065F46' : '#991B1B',
          border: `1px solid ${testResult.ok ? '#6EE7B7' : '#FECACA'}`,
          fontFamily: 'DM Mono, monospace', fontSize: '13px'
        }}>{testResult.msg}</div>}
      </div>

      <div className="card" style={{ marginTop: '16px' }}>
        <div style={{ fontWeight: 500, marginBottom: '10px', fontSize: '14px' }}>ℹ️ Over de opslag</div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Je sleutel wordt opgeslagen in de <strong>sessie</strong> van je browser — hij verdwijnt automatisch wanneer je het tabblad sluit.
          Hij wordt nooit naar een externe server gestuurd, enkel rechtstreeks naar de Take App API.
        </p>
      </div>
    </div>
  </div>;
}

