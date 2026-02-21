// ─── CalendarPage ─────────────────────────────────────────────────────────────
function CalendarPage({ orders, workflows, products: PRODUCTS, onNavigate }) {
  PRODUCTS = PRODUCTS || DEFAULT_PRODUCTS;
  const todayStr = new Date().toISOString().split('T')[0];
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1); // Monday
    return d.toISOString().split('T')[0];
  });
  const [selectedDay, setSelectedDay] = useState(todayStr);

  // Build 7 days from weekStart
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const DAY_NAMES = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

  function prevWeek() {
    const d = new Date(weekStart); d.setDate(d.getDate() - 7);
    setWeekStart(d.toISOString().split('T')[0]);
  }
  function nextWeek() {
    const d = new Date(weekStart); d.setDate(d.getDate() + 7);
    setWeekStart(d.toISOString().split('T')[0]);
  }

  // For each day, compute activities across all bake cycles it's part of
  // A day can be: T-2 for bakDate+2, T-1 for bakDate+1, T0 for bakDate
  function getDayActivities(dayStr) {
    const activities = []; // { bakDate, pid, qty, step, role }

    for (let offset = 0; offset <= 2; offset++) {
      const bakDate = (() => { const d = new Date(dayStr); d.setDate(d.getDate() + offset); return d.toISOString().split('T')[0]; })();
      const needed  = getNeededForBakDate(orders, bakDate);
      const dayRole = 2 - offset; // if offset=0 → this day is T-2 (day=0), offset=2 → T-0 (day=2)

      Object.entries(needed).forEach(([pid, qty]) => {
        const wf = workflows[pid] || DEFAULT_WORKFLOWS[pid] || [];
        wf.filter(s => s.day === dayRole).forEach(step => {
          activities.push({ bakDate, pid, qty, step, role: dayRole });
        });
      });
    }
    return activities;
  }

  // Build oven schedule for T0: group bakken steps, pack into sessions
  function getOvenSchedule(dayStr) {
    const needed = getNeededForBakDate(orders, dayStr);
    const sessions = [];
    let startMin = 7 * 60; // start at 07:00

    Object.entries(needed).forEach(([pid, qty]) => {
      const prod = PRODUCTS[pid];
      if (!prod) return;
      const numBatches = Math.ceil(qty / prod.per_session);
      for (let b = 0; b < numBatches; b++) {
        const batchQty = b < numBatches - 1 ? prod.per_session : qty - b * prod.per_session;
        sessions.push({ pid, prod, qty: batchQty, duration: prod.session_min, startMin });
        startMin += prod.session_min + 10; // 10 min between sessions
      }
    });

    return sessions;
  }

  function fmtMin(totalMin) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }

  const roleLabel = { 0: 'T-2', 1: 'T-1', 2: 'T0' };
  const roleCls   = { 0: 't2',  1: 't1',  2: 't0' };

  // For week card: summarise
  function getWeekCardInfo(dayStr) {
    const acts = getDayActivities(dayStr);
    const roles = [...new Set(acts.map(a => a.role))].sort();
    const hasBake = acts.some(a => a.step.type === 'bakken' && a.role === 2);
    return { acts, roles, hasBake, isEmpty: acts.length === 0 };
  }

  // Selected day full detail
  const selActivities = getDayActivities(selectedDay);
  const grouped = {};
  selActivities.forEach(a => {
    const key = `${a.role}-${a.bakDate}`;
    if (!grouped[key]) grouped[key] = { role: a.role, bakDate: a.bakDate, items: [] };
    grouped[key].items.push(a);
  });
  const ovenSessions = getOvenSchedule(selectedDay);

  const selDate = new Date(selectedDay);
  const selDateFmt = selDate.toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' });

  // Count active moments: unique "action needed" blocks (excluding passive rijzen)
  function countActiveMoments(acts) {
    return acts.filter(a => a.step.type !== 'rijzen').length;
  }

  return <div className="page-enter">
    <div className="page-header">
      <h2>Productiekalender</h2>
      <p>Weekoverzicht met geoptimaliseerd dagschema</p>
    </div>

    {/* Week navigation */}
    <div className="cal-nav">
      <button className="btn btn-secondary" onClick={prevWeek}>← Vorige week</button>
      <h3>{new Date(days[0]).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long' })} – {new Date(days[6]).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
      <button className="btn btn-secondary" onClick={nextWeek}>Volgende week →</button>
      <button className="btn btn-primary" onClick={() => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); setWeekStart(d.toISOString().split('T')[0]); setSelectedDay(todayStr); }}>Vandaag</button>
    </div>

    {/* Week summary cards */}
    <div className="cal-week-summary">
      {days.map((day, i) => {
        const info = getWeekCardInfo(day);
        const isToday = day === todayStr;
        const isSel   = day === selectedDay;
        return <div key={day}
          className={`cal-day-card ${isToday ? 'today' : ''} ${isSel ? 'selected' : ''} ${info.isEmpty ? 'empty' : ''}`}
          onClick={() => setSelectedDay(day)}>
          <div className="cal-day-name">{DAY_NAMES[i]}</div>
          <div className="cal-day-num">{new Date(day).getDate()}</div>
          <div className="cal-day-chips">
            {info.roles.map(r => {
              // Count unique bakDates for this role
              const bds = [...new Set(selActivities.filter(a => a.role === r).map(a => a.bakDate))];
              const count = getDayActivities(day).filter(a => a.role === r).length;
              return count > 0 && <span key={r} className={`cal-chip ${roleCls[r]}`}>{roleLabel[r]} · {count} stap{count > 1 ? 'pen' : ''}</span>;
            })}
            {info.hasBake && <span className="cal-chip bake">🔥 Bakken</span>}
            {info.isEmpty && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Vrij</span>}
          </div>
        </div>;
      })}
    </div>

    {/* Day detail */}
    <div className="cal-day-detail">
      <div className="cal-detail-header">
        <h3>{selDateFmt}</h3>
        {selActivities.length > 0 && <>
          <span style={{ fontFamily: 'DM Mono', fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '8px' }}>
            {countActiveMoments(selActivities)} actieve momenten
          </span>
          <span style={{ fontFamily: 'DM Mono', fontSize: '12px', background: 'rgba(200,132,10,0.3)', padding: '4px 10px', borderRadius: '8px', color: 'var(--amber-light)' }}>
            {selActivities.length} stappen totaal
          </span>
        </>}
      </div>

      <div className="cal-detail-body">
        {selActivities.length === 0 && <div className="plan-empty-day" style={{ padding: '40px' }}>
          🎉 Geen productie vandaag
        </div>}

        {/* Oven schedule (T0 only) */}
        {ovenSessions.length > 0 && <div className="cal-block-group">
          <div className="cal-block-group-header">
            <span>🔥 Ovenschema (geoptimaliseerd)</span>
            <span className={`cal-role-badge t0`}>T0</span>
          </div>
          {ovenSessions.map((s, i) => <div key={i} className="cal-oven-block">
            <strong>{fmtMin(s.startMin)} – {fmtMin(s.startMin + s.duration)}</strong>
            &nbsp;·&nbsp;{s.prod.name}
            &nbsp;·&nbsp;<span style={{ color: 'var(--text-muted)' }}>{s.qty} broden · {s.duration} min · {fmt(s.prod.session_cost)} stookkosten</span>
          </div>)}
        </div>}

        {/* Group by role & bakDate */}
        {Object.values(grouped).sort((a, b) => a.role - b.role || a.bakDate.localeCompare(b.bakDate)).map(group => {
          const bakDateFmt = new Date(group.bakDate).toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'short' });
          return <div key={`${group.role}-${group.bakDate}`} className="cal-block-group">
            <div className="cal-block-group-header">
              <span className={`cal-role-badge ${roleCls[group.role]}`}>{roleLabel[group.role]}</span>
              <span>voor bakdag {bakDateFmt}</span>
            </div>
            {group.items.map((a, i) => {
              const isActive = a.step.type !== 'rijzen';
              return <div key={i} className="cal-activity-row">
                <div className="cal-activity-time">
                  <span className={`step-type-dot dot-${a.step.type}`} style={{ marginRight: '4px' }} />
                  {a.step.duration_min > 0 ? `${a.step.duration_min} min` : 'passief'}
                </div>
                <div className="cal-activity-content">
                  <div className="cal-activity-title" style={{ color: isActive ? 'var(--dark)' : 'var(--text-muted)' }}>
                    {isActive ? '⚡ ' : '💤 '}{a.step.label}
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '12px', marginLeft: '8px' }}>— {PRODUCTS[a.pid]?.name} · {a.qty} st.</span>
                  </div>
                  {(a.step.min_after || a.step.max_after) && <div className="cal-activity-sub">
                    Venster: {a.step.min_after ?? '?'} – {a.step.max_after ?? '?'} min na vorige stap
                  </div>}
                </div>
                <div>
                  <span className={`badge ${a.step.type === 'bakken' ? 'badge-production' : 'badge-delivered'}`}>{a.step.type}</span>
                </div>
              </div>;
            })}
          </div>;
        })}
      </div>
    </div>
  </div>;
}

