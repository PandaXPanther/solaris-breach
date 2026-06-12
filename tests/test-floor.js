// Headless tests for the Solaris Breach run engine.
// Run: node tests/test-floor.js
const { genFloor, computeStats, ITEMS, POOLS, makeEnemy, LAYOUTS, GRID } = require('../game.js');

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('FAIL:', msg); } else console.log('ok:', msg); };

// ── floor generation: 200 floors across depths 1-5
let genOk = true;
for (let trial = 0; trial < 200 && genOk; trial++) {
  const depth = 1 + (trial % 5);
  const f = genFloor(depth);
  const rooms = [...f.cells.values()];
  const types = rooms.map(r => r.type);
  const count = t => types.filter(x => x === t).length;

  if (count('start') !== 1 || count('boss') !== 1 || count('treasure') !== 1 || count('shop') !== 1 || count('secret') > 1) {
    genOk = false; console.log('FAIL room counts', JSON.stringify(types));
  }

  // connectivity: every non-secret room reachable from start
  const seen = new Set([f.start]);
  const stack = [f.start];
  while (stack.length) {
    const r = stack.pop();
    Object.values(r.doors).forEach(n => {
      if (n.type === 'secret' || r.type === 'secret') return;
      if (!seen.has(n)) { seen.add(n); stack.push(n); }
    });
  }
  const nonSecret = rooms.filter(r => r.type !== 'secret');
  if (seen.size !== nonSecret.length) { genOk = false; console.log('FAIL connectivity', seen.size, nonSecret.length); }

  // door symmetry
  for (const r of rooms) {
    for (const [d, n] of Object.entries(r.doors)) {
      const opp = { N: 'S', S: 'N', E: 'W', W: 'E' }[d];
      if (n.doors[opp] !== r) { genOk = false; console.log('FAIL door symmetry'); }
    }
  }

  const boss = rooms.find(r => r.type === 'boss');
  if (!boss.pendingSpawn || boss.pendingSpawn[0] !== 'ignis') { genOk = false; console.log('FAIL boss spawn'); }
  const tre = rooms.find(r => r.type === 'treasure');
  if (tre.pedestals.length !== 1) { genOk = false; console.log('FAIL treasure pedestal'); }
  const shop = rooms.find(r => r.type === 'shop');
  if (shop.pedestals.length !== 4 || shop.pedestals.some(p => !(p.cost > 0))) { genOk = false; console.log('FAIL shop'); }

  for (const r of rooms) {
    if (r.gx < 0 || r.gx >= GRID || r.gy < 0 || r.gy >= GRID) { genOk = false; console.log('FAIL bounds'); }
  }
}
ok(genOk, '200 generated floors: counts, connectivity, door symmetry, special rooms, bounds');

// ── every pooled relic exists in the catalog
const allPool = new Set(Object.values(POOLS).flat());
let poolOk = true;
allPool.forEach(id => { if (!ITEMS[id]) { poolOk = false; console.log('FAIL missing item', id); } });
ok(poolOk, `all ${allPool.size} pooled relic ids exist in catalog (${Object.keys(ITEMS).length} total relics)`);

// ── every relic applies cleanly with sane stat bounds
let statsOk = true;
for (const id of Object.keys(ITEMS)) {
  const s = computeStats([id], { roomsCleared: 3 });
  if (!(s.dmg > 0 && s.fireDelay >= 0.09 && s.speed >= 120 && s.shotSpeed >= 180)) {
    statsOk = false; console.log('FAIL stats sanity for', id, s);
  }
}
ok(statsOk, 'every relic applies cleanly with sane stat bounds');

// ── full-catalog stacked build
const s = computeStats(Object.keys(ITEMS), { roomsCleared: 10 });
ok(s.multishot >= 4 && s.homing && s.piercing && s.spectral && s.orbital >= 1,
  'full-catalog stack: multishot, homing, piercing, spectral, orbital all active');

// ── obstacle layouts keep door lanes and approaches clear
let layoutOk = true;
for (const L of LAYOUTS) {
  const blockers = [...L.rocks, ...L.pits];
  for (const [ax, ay] of [[6, 3], [6, 0], [6, 6], [0, 3], [12, 3]]) {
    if (blockers.some(([x, y]) => x === ax && y === ay)) {
      layoutOk = false; console.log('FAIL layout blocks tile', ax, ay);
    }
  }
}
ok(layoutOk, 'all obstacle layouts keep door lanes and approaches clear');

// ── enemies construct at all depths with scaling hp
let enemyOk = true;
['emberMote', 'pyreWisp', 'slagHusk', 'ventCrawler', 'ashTick', 'flareNode', 'cinderling', 'ignis'].forEach(k => {
  for (let d = 1; d <= 5; d++) {
    const e = makeEnemy(k, 100, 100, d);
    if (!(e.hp > 0 && e.r > 0)) { enemyOk = false; console.log('FAIL enemy', k, d); }
  }
});
ok(enemyOk, 'all 7 enemy kinds + Ignis construct at depths 1-5');

console.log(fails === 0 ? '\nALL TESTS PASSED' : `\n${fails} FAILURES`);
process.exit(fails ? 1 : 0);
