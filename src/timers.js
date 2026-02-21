// Timers page
function TimersPage() {
  const [timers, setTimers] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimers(prev => prev.map(t => {
        if (!t.running || t.remaining <= 0) return t;
        const remaining = Math.max(0, t.remaining - 1);
        if (remaining === 0 && t.running) {
          // Play notification sound conceptually; show alert
          setTimeout(() => alert(`⏰ Timer klaar: ${t.label}!`), 100);
        }
        return { ...t, remaining, running: remaining > 0 };
      }));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  function addTimer(preset) {
    setTimers(prev => [...prev, {
      id: Date.now(),
      label: preset.label,
      phase: preset.phase,
      total: preset.duration_min * 60,
      remaining: preset.duration_min * 60,
      running: false,
      color: preset.color,
    }]);
  }

  function toggle(id) { setTimers(prev => prev.map(t => t.id === id ? { ...t, running: !t.running } : t)); }
  function reset(id) { setTimers(prev => prev.map(t => t.id === id ? { ...t, remaining: t.total, running: false } : t)); }
  function remove(id) { setTimers(prev => prev.filter(t => t.id !== id)); }

  return <div className="page-enter">
    <div className="page-header">
      <h2>Fermentatie Timers</h2>
      <p>Beheer al je rijs- en baktijden</p>
    </div>

    <div className="card" style={{ marginBottom: '24px' }}>
      <h3 style={{ fontFamily: 'DM Serif Display', fontSize: '18px', marginBottom: '16px' }}>Voeg timer toe</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {TIMER_PRESETS.map(p => <button key={p.id} className="btn btn-secondary" onClick={() => addTimer(p)}>
          + {p.label} ({p.duration_min >= 60 ? p.duration_min / 60 + 'u' : p.duration_min + 'min'})
        </button>)}
      </div>
    </div>

    {timers.length === 0 && <div className="empty-msg"><div className="icon">⏱️</div>Nog geen timers. Voeg er een toe hierboven.</div>}

    <div className="timers-grid">
      {timers.map(t => {
        const pct = t.total > 0 ? ((t.total - t.remaining) / t.total) * 100 : 0;
        const done = t.remaining === 0;
        return <div key={t.id} className={`timer-card ${t.running ? 'running' : ''} ${done ? 'done' : ''}`}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: done ? 'var(--sage)' : t.color, opacity: t.running ? 1 : 0.4 }} />
          <h3>{t.label}</h3>
          <div className="phase">{t.phase}</div>
          <div className={`timer-display ${t.running ? 'running' : ''} ${done ? 'done' : ''}`}>
            {done ? '✓ Klaar' : fmtTime(t.remaining)}
          </div>
          <div className="timer-progress">
            <div className={`timer-progress-fill ${done ? 'done' : ''}`} style={{ width: pct + '%', background: done ? 'var(--sage)' : t.color }} />
          </div>
          <div className="timer-btns">
            {!done && <button className="btn btn-primary" style={{ background: t.color }} onClick={() => toggle(t.id)}>
              {t.running ? '⏸' : '▶'} {t.running ? 'Pauzeer' : 'Start'}
            </button>}
            <button className="btn btn-secondary" onClick={() => reset(t.id)}>↺</button>
            <button className="btn btn-danger" onClick={() => remove(t.id)}>✕</button>
          </div>
        </div>;
      })}
    </div>
  </div>;
}

