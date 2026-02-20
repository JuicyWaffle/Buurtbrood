const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT     = 8080;
const DATA_DIR = path.join(__dirname, 'data');
const HTML     = path.join(__dirname, 'index.html');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Default file contents if they don't exist yet
const DEFAULTS = {
  'settings.json':  { api_key: '' },
  'workflows.json': {},
  'links.json':     {},
  'inventory.json': [
    { id:'spelt',         name:'Speltmeel',          unit:'kg',    cost_kg:2.28, stock_kg:25, min_stock:10 },
    { id:'spelt_energy',  name:'Spelt Energy',        unit:'kg',    cost_kg:3.40, stock_kg:15, min_stock:8  },
    { id:'wit',           name:'Witte bloem',          unit:'kg',    cost_kg:0.80, stock_kg:50, min_stock:20 },
    { id:'bruin',         name:'Bruine bloem',         unit:'kg',    cost_kg:0.80, stock_kg:30, min_stock:15 },
    { id:'rogge',         name:'Roggemeel',            unit:'kg',    cost_kg:1.50, stock_kg:12, min_stock:8  },
    { id:'vijg_noot_mix', name:'Vijgen/Noten mix',     unit:'kg',    cost_kg:3.50, stock_kg:5,  min_stock:3  },
    { id:'zout',          name:'Zout',                 unit:'kg',    cost_kg:0.40, stock_kg:8,  min_stock:3  },
    { id:'desem',         name:'Zuurdesemstarter',     unit:'kg',    cost_kg:0,    stock_kg:4,  min_stock:2  },
    { id:'kaneel',        name:'Kaneelsuiker mix',     unit:'kg',    cost_kg:2.20, stock_kg:3,  min_stock:2  },
    { id:'verpakking_brood', name:'Verpakking brood',  unit:'stuks', cost_kg:0.06, stock_kg:200,min_stock:80 },
    { id:'verpakking_koek',  name:'Verpakking koek',   unit:'stuks', cost_kg:0.10, stock_kg:60, min_stock:30 },
  ],
  'orders.json': [],
  'products.json': {
    'spelt-groot':       { name:'Spelt Groot',        category:'GROOT',    type:'sourdough', price_b2c:5.50, price_b2b:3.30, flour_kg:0.50, flour_type:'spelt',        flour_cost_kg:2.28, weight_g:850, per_session:9,  session_min:50, session_cost:1.50 },
    'spelt-energy-groot':{ name:'Spelt Energy Groot', category:'GROOT',    type:'sourdough', price_b2c:5.90, price_b2b:3.50, flour_kg:0.50, flour_type:'spelt_energy', flour_cost_kg:3.40, weight_g:850, per_session:9,  session_min:50, session_cost:1.50 },
    'wit-groot':         { name:'Wit Groot',           category:'GROOT',    type:'sourdough', price_b2c:5.00, price_b2b:3.00, flour_kg:0.50, flour_type:'wit',          flour_cost_kg:0.80, weight_g:550, per_session:9,  session_min:50, session_cost:1.50 },
    'bruin-groot':       { name:'Bruin Groot',         category:'GROOT',    type:'sourdough', price_b2c:5.00, price_b2b:3.00, flour_kg:0.50, flour_type:'bruin',        flour_cost_kg:0.80, weight_g:550, per_session:9,  session_min:50, session_cost:1.50 },
    'rogge':             { name:'Rogge',               category:'GROOT',    type:'sourdough', price_b2c:5.20, price_b2b:3.10, flour_kg:0.25, flour_type:'rogge',        flour_cost_kg:1.50, weight_g:600, per_session:15, session_min:60, session_cost:1.50 },
    'spelt-klein':       { name:'Spelt Klein',         category:'KLEIN',    type:'sourdough', price_b2c:5.00, price_b2b:3.00, flour_kg:0.40, flour_type:'spelt',        flour_cost_kg:2.28, weight_g:600, per_session:12, session_min:50, session_cost:1.50 },
    'spelt-energy-klein':{ name:'Spelt Energy Klein',  category:'KLEIN',    type:'sourdough', price_b2c:5.50, price_b2b:3.10, flour_kg:0.40, flour_type:'spelt_energy', flour_cost_kg:3.40, weight_g:550, per_session:12, session_min:50, session_cost:1.50 },
    'wit-klein':         { name:'Wit Klein',           category:'KLEIN',    type:'sourdough', price_b2c:4.30, price_b2b:2.80, flour_kg:0.40, flour_type:'wit',          flour_cost_kg:0.80, weight_g:550, per_session:12, session_min:50, session_cost:1.50 },
    'bruin-klein':       { name:'Bruin Klein',         category:'KLEIN',    type:'sourdough', price_b2c:4.30, price_b2b:2.80, flour_kg:0.40, flour_type:'bruin',        flour_cost_kg:0.80, weight_g:550, per_session:12, session_min:50, session_cost:1.50 },
    'vijg-noot':         { name:'Vijg/Noot',           category:'SPECIAAL', type:'sourdough', price_b2c:5.90, price_b2b:3.50, flour_kg:0.24, flour_type:'wit',          flour_cost_kg:1.40, weight_g:550, per_session:12, session_min:30, session_cost:1.50 },
    'pistolet':          { name:'Pistolet',            category:'SPECIAAL', type:'roll',      price_b2c:0.90, price_b2b:null, flour_kg:0.08, flour_type:'wit',          flour_cost_kg:0.80, weight_g:150, per_session:25, session_min:35, session_cost:1.00 },
    'kaneelkoek':        { name:'Kaneelkoek',          category:'SPECIAAL', type:'cake',      price_b2c:2.80, price_b2b:null, flour_kg:0.05, flour_type:'wit',          flour_cost_kg:0.80, weight_g:null,per_session:21, session_min:15, session_cost:0.30 },
  },
};

// Init files that don't exist
Object.entries(DEFAULTS).forEach(([file, def]) => {
  const fp = path.join(DATA_DIR, file);
  if (!fs.existsSync(fp)) fs.writeFileSync(fp, JSON.stringify(def, null, 2));
});

// ── helpers ──────────────────────────────────────────────────────────────────
function readData(file) {
  try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8')); }
  catch { return DEFAULTS[file] || null; }
}

function writeData(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

function sendJSON(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid JSON')); } });
    req.on('error', reject);
  });
}

// ── server ────────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    return res.end();
  }

  // Serve index.html
  if (url === '/' || url === '/index.html') {
    try {
      const html = fs.readFileSync(HTML);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(html);
    } catch {
      res.writeHead(500); return res.end('index.html niet gevonden');
    }
  }

  // ── API routes ──────────────────────────────────────────────────────────────

  // GET /api/:file  →  read JSON file
  if (method === 'GET' && url.startsWith('/api/')) {
    const file = url.slice(5) + '.json'; // e.g. /api/settings → settings.json
    if (!DEFAULTS[file]) return sendJSON(res, { error: 'Onbekend bestand' }, 404);
    return sendJSON(res, readData(file));
  }

  // POST /api/:file  →  write JSON file
  if (method === 'POST' && url.startsWith('/api/')) {
    const file = url.slice(5) + '.json';
    if (!DEFAULTS[file]) return sendJSON(res, { error: 'Onbekend bestand' }, 404);
    try {
      const body = await parseBody(req);
      writeData(file, body);
      console.log(`[opgeslagen] ${file}`);
      return sendJSON(res, { ok: true });
    } catch (e) {
      return sendJSON(res, { error: e.message }, 400);
    }
  }

  res.writeHead(404); res.end('Niet gevonden');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🍞 Buurtbrood Planner draait op http://localhost:${PORT}`);
  console.log(`   Data map: ${DATA_DIR}\n`);
});
