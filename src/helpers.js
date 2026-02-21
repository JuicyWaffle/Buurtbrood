// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n) { return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(n); }
function fmtTime(secs) {
  if (secs <= 0) return '00:00';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// Match Take App product names to our catalog
function matchProduct(name) {
  if (!name) return null;
  const n = name.toLowerCase();
  if (n.includes('spelt energy') && (n.includes('groot') || n.includes('large'))) return 'spelt-energy-groot';
  if (n.includes('spelt energy')) return 'spelt-energy-klein';
  if (n.includes('spelt') && (n.includes('groot') || n.includes('large'))) return 'spelt-groot';
  if (n.includes('spelt')) return 'spelt-klein';
  if (n.includes('wit') && (n.includes('groot') || n.includes('large'))) return 'wit-groot';
  if (n.includes('wit')) return 'wit-klein';
  if (n.includes('bruin') && (n.includes('groot') || n.includes('large'))) return 'bruin-groot';
  if (n.includes('bruin')) return 'bruin-klein';
  if (n.includes('rogge')) return 'rogge';
  if (n.includes('vijg') || n.includes('noot')) return 'vijg-noot';
  if (n.includes('pistolet')) return 'pistolet';
  if (n.includes('kaneel')) return 'kaneelkoek';
  return null;
}

// ─── API (via server proxy — geen CORS problemen) ────────────────────────────
async function apiGet(endpoint) {
  const r = await fetch(`/proxy${endpoint}`);
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.error || `API fout: ${r.status}`);
  }
  return r.json();
}
async function apiPut(endpoint, body) {
  const r = await fetch(`/proxy${endpoint}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.error || `API fout: ${r.status}`);
  }
  return r.json();
}
