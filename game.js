// ═══════════════════════════════════════════════════════════════════
//  SOLARIS BREACH — run engine
//  Top-down twin-stick roguelike floor: THE CORONA
//  All art is original, drawn with canvas primitives in the same
//  vector style as the title-screen Helio Knight.
// ═══════════════════════════════════════════════════════════════════
(function () {
'use strict';

// ───────────────────────────────────────
//  SHARED KNIGHT MODEL (title + in-game)
//  This is the existing Solaris Breach character model.
// ───────────────────────────────────────
const Knight = {
  draw(ctx, t, state) {
    const gp = 0.7 + 0.3 * Math.sin(state.glowPulse);
    state.capePhase += 0.03;
    state.glowPulse += 0.04;
    const capeWave = Math.sin(state.capePhase) * 8;

    // Cape
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-10, -30);
    ctx.bezierCurveTo(-22, 0, -28 + capeWave, 20, -18 + capeWave * 0.5, 45);
    ctx.bezierCurveTo(-8, 50, 0, 40, 4, 30);
    ctx.lineTo(0, -20);
    ctx.closePath();
    const capeGrad = ctx.createLinearGradient(-28, -30, 0, 50);
    capeGrad.addColorStop(0, 'rgba(40,20,80,0.9)');
    capeGrad.addColorStop(1, 'rgba(80,20,120,0.3)');
    ctx.fillStyle = capeGrad;
    ctx.fill();
    ctx.restore();

    // Body glow
    const bodyGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 50);
    bodyGlow.addColorStop(0, `rgba(255,200,60,${0.15 * gp})`);
    bodyGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bodyGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = '#1a0a2e';
    ctx.fillRect(-8, 20, 7, 22);
    ctx.fillRect(1, 20, 7, 22);
    // Boots
    ctx.fillStyle = '#0d0819';
    ctx.fillRect(-10, 38, 10, 6);
    ctx.fillRect(-1, 38, 10, 6);

    // Torso
    const torsoGrad = ctx.createLinearGradient(-10, -30, 10, 20);
    torsoGrad.addColorStop(0, '#2a1050');
    torsoGrad.addColorStop(1, '#180830');
    ctx.fillStyle = torsoGrad;
    ctx.beginPath();
    ctx.roundRect(-11, -28, 22, 50, 3);
    ctx.fill();

    // Chest emblem (sun sigil)
    ctx.fillStyle = `rgba(255,180,40,${0.8 * gp})`;
    ctx.beginPath();
    ctx.arc(0, -8, 5, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 6, Math.sin(a) * 6 - 8);
      ctx.lineTo(Math.cos(a) * 9, Math.sin(a) * 9 - 8);
      ctx.strokeStyle = `rgba(255,200,80,${0.6 * gp})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Pauldrons
    ctx.fillStyle = '#0d0819';
    ctx.beginPath(); ctx.ellipse(-13, -18, 7, 5, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(13, -18, 7, 5, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(100,40,200,${0.4 * gp})`;
    ctx.beginPath(); ctx.ellipse(-13, -18, 4, 3, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(13, -18, 4, 3, -0.3, 0, Math.PI * 2); ctx.fill();

    // Neck / head
    ctx.fillStyle = '#c8a060';
    ctx.fillRect(-3, -35, 6, 8);
    ctx.fillStyle = '#1a0a2e';
    ctx.beginPath();
    ctx.ellipse(0, -46, 12, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Visor
    const visorGrad = ctx.createLinearGradient(-8, -52, 8, -38);
    visorGrad.addColorStop(0, `rgba(255,200,80,${0.9 * gp})`);
    visorGrad.addColorStop(1, `rgba(200,100,20,${0.6 * gp})`);
    ctx.fillStyle = visorGrad;
    ctx.beginPath();
    ctx.ellipse(0, -46, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Horns
    ctx.fillStyle = '#0d0819';
    ctx.beginPath();
    ctx.moveTo(-8, -56); ctx.lineTo(-14, -68); ctx.lineTo(-4, -58);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(8, -56); ctx.lineTo(14, -68); ctx.lineTo(4, -58);
    ctx.fill();

    // Sword
    ctx.save();
    ctx.translate(18, -5);
    ctx.rotate(state.swordAngle !== undefined ? state.swordAngle : 0.25 + Math.sin(t * 0.001) * 0.05);
    const bladeGrad = ctx.createLinearGradient(-2, 0, 2, 50);
    bladeGrad.addColorStop(0, `rgba(255,220,100,${gp})`);
    bladeGrad.addColorStop(0.5, 'rgba(180,80,20,0.9)');
    bladeGrad.addColorStop(1, 'rgba(60,20,10,0.7)');
    ctx.fillStyle = bladeGrad;
    ctx.beginPath();
    ctx.moveTo(-2, 0); ctx.lineTo(2, 0); ctx.lineTo(0.5, 52); ctx.lineTo(-0.5, 52);
    ctx.fill();
    ctx.fillStyle = '#a06020';
    ctx.fillRect(-6, -2, 12, 4);
    ctx.fillStyle = '#3a1a08';
    ctx.fillRect(-2, 2, 4, 16);
    ctx.restore();
  }
};

// ───────────────────────────────────────
//  SAVE SYSTEM — 3 sol-records
// ───────────────────────────────────────
const SAVE_KEY = 'solaris.breach.saves.v1';
const Saves = {
  all() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      const arr = raw ? JSON.parse(raw) : [null, null, null];
      while (arr.length < 3) arr.push(null);
      return arr.slice(0, 3);
    } catch (e) { return [null, null, null]; }
  },
  write(idx, data) {
    const arr = Saves.all();
    arr[idx] = data;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(arr)); } catch (e) {}
  },
  clear(idx) { Saves.write(idx, null); }
};

// ───────────────────────────────────────
//  CONSTANTS
// ───────────────────────────────────────
const TILE = 64;
const COLS = 13, ROWS = 7;
const RW = COLS * TILE;          // 832 room interior width
const RH = ROWS * TILE;          // 448 room interior height
const WALL = 64;
const GRID = 9;                  // floor cell grid
const FLOOR_NAMES = ['The Corona', 'The Chromosphere', 'The Radiative Deep', 'The Convective Maw', 'The Core Sanctum'];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
const OPP = { N: 'S', S: 'N', E: 'W', W: 'E' };

function floorTitle(depth) {
  const name = FLOOR_NAMES[(depth - 1) % FLOOR_NAMES.length];
  const cycle = Math.floor((depth - 1) / FLOOR_NAMES.length);
  return `DEPTH ${ROMAN[(depth - 1) % 10]}${cycle ? '+' : ''} — ${name.toUpperCase()}`;
}
function floorShort(depth) {
  return `Depth ${ROMAN[(depth - 1) % 10]} · ${FLOOR_NAMES[(depth - 1) % FLOOR_NAMES.length]}`;
}

const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ───────────────────────────────────────
//  RELIC CATALOG (all original)
//  mod(s): stat modifier, re-applied on recompute
//  instant(run): one-shot effect at pickup
// ───────────────────────────────────────
const ITEMS = {
  'corona-shard':   { name: 'Corona Shard',   desc: 'A splinter of the burning crown. Damage up.', mod: s => { s.dmg += 1.2; } },
  'pulse-engine':   { name: 'Pulse Engine',   desc: 'Your bolts arrive in waves. Fire rate up.', mod: s => { s.fireDelay *= 0.78; } },
  'solar-wind':     { name: 'Solar Wind',     desc: 'It pushes you onward. Speed up.', mod: s => { s.speed += 55; } },
  'photon-sail':    { name: 'Photon Sail',    desc: 'Catch the light. Range and shot speed up.', mod: s => { s.range += 0.25; s.shotSpeed += 80; } },
  'twin-flare':     { name: 'Twin Flare',     desc: 'Two tongues of fire. Double bolts.', mod: s => { s.multishot += 1; s.dmg *= 0.85; } },
  'trine-prism':    { name: 'Trine Prism',    desc: 'Light divides three ways.', mod: s => { s.multishot += 2; s.dmg *= 0.72; } },
  'magnet-core':    { name: 'Magnet Core',    desc: 'Your bolts hunger. Homing shots.', mod: s => { s.homing = true; } },
  'lance-of-dawn':  { name: 'Lance of Dawn',  desc: 'Nothing stops the morning. Piercing shots.', mod: s => { s.piercing = true; s.dmg += 0.4; } },
  'void-fragment':  { name: 'Void Fragment',  desc: 'Matter is a suggestion. Spectral shots.', mod: s => { s.spectral = true; s.range += 0.1; } },
  'mercury-boots':  { name: 'Mercury Boots',  desc: 'Quicksilver soles. Speed way up.', mod: s => { s.speed += 90; } },
  'comet-tail':     { name: 'Comet Tail',     desc: 'Leave a streak across the dark.', mod: s => { s.shotSpeed += 140; s.dmg += 0.5; } },
  'dwarf-star':     { name: 'Dwarf Star',     desc: 'Small. Heavy. Furious.', mod: s => { s.dmg += 1.8; s.boltR += 4; s.shotSpeed -= 90; } },
  'prism-visor':    { name: 'Prism Visor',    desc: 'Death refracts. Kills burst into bolts.', mod: s => { s.splitOnKill = true; } },
  'ember-cloak':    { name: 'Ember Cloak',    desc: 'Wound it and it burns back.', mod: s => { s.onHitNova = true; } },
  'aurora-veil':    { name: 'Aurora Veil',    desc: 'Sometimes the light steps in front.', mod: s => { s.guardChance += 0.2; } },
  'gravity-sink':   { name: 'Gravity Sink',   desc: 'Your bolts hit like falling moons.', mod: s => { s.knockback += 220; s.boltR += 2; } },
  'breach-lens':    { name: 'Breach Lens',    desc: 'Each cleared chamber sharpens the beam.', mod: (s, ctx) => { s.dmg += 0.35 * (ctx ? ctx.roomsCleared : 0); } },
  'sun-sigil':      { name: 'Sun Sigil',      desc: 'A loyal mote of the old fire orbits you.', mod: s => { s.orbital += 1; } },
  'kindled-iris':   { name: 'Kindled Iris',   desc: 'You see where to burn.', mod: s => { s.fireDelay *= 0.85; s.dmg += 0.4; } },
  'star-heart':     { name: 'Star Heart',     desc: 'It still beats. Health up.', mod: () => {}, instant: r => { r.maxHearts += 1; r.hearts = Math.min(r.hearts + 2, r.maxHearts * 2); } },
  'crown-of-dawn':  { name: 'Crown of Dawn',  desc: 'Heavy is the morning. HP way up, speed down.', mod: s => { s.speed -= 40; }, instant: r => { r.maxHearts += 2; r.hearts = Math.min(r.hearts + 4, r.maxHearts * 2); } },
  'warden-plate':   { name: 'Warden Plate',   desc: 'Mercury remembers its keeper.', mod: s => { s.guardChance += 0.15; }, instant: r => { r.maxHearts += 1; r.hearts = Math.min(r.hearts + 2, r.maxHearts * 2); } },
  'nova-satchel':   { name: 'Nova Satchel',   desc: 'Five more charges. Bigger blasts.', mod: s => { s.bombPower += 40; }, instant: r => { r.bombs += 5; } },
  'sigil-ring':     { name: 'Sigil Ring',     desc: 'Keys to doors not yet found.', mod: () => {}, instant: r => { r.keys += 5; } },
  'midas-fragment': { name: 'Midas Fragment', desc: 'Everything it touches gleams.', mod: s => { s.coinLuck += 0.15; }, instant: r => { r.coins += 15; } },
  'umbral-core':    { name: 'Umbral Core',    desc: 'The dark side of the sun. Damage way up.', mod: s => { s.dmg *= 1.6; }, eclipse: true },
  'eclipse-mantle': { name: 'Eclipse Mantle', desc: 'Wear the shadow of the moon.', mod: s => { s.multishot += 1; s.homing = true; }, eclipse: true },
};

const POOLS = {
  treasure: ['corona-shard', 'pulse-engine', 'solar-wind', 'photon-sail', 'twin-flare', 'trine-prism', 'magnet-core',
    'lance-of-dawn', 'void-fragment', 'mercury-boots', 'comet-tail', 'dwarf-star', 'prism-visor', 'ember-cloak',
    'aurora-veil', 'gravity-sink', 'breach-lens', 'sun-sigil', 'kindled-iris', 'star-heart'],
  boss: ['star-heart', 'crown-of-dawn', 'warden-plate', 'corona-shard', 'dwarf-star', 'kindled-iris'],
  shop: ['nova-satchel', 'sigil-ring', 'midas-fragment', 'solar-wind', 'pulse-engine', 'photon-sail'],
  eclipse: ['umbral-core', 'eclipse-mantle', 'dwarf-star', 'trine-prism'],
};

function baseStats() {
  return {
    dmg: 3.5, fireDelay: 0.36, shotSpeed: 420, range: 0.62, speed: 240,
    multishot: 1, boltR: 7, homing: false, piercing: false, spectral: false,
    knockback: 60, onHitNova: false, guardChance: 0, splitOnKill: false,
    orbital: 0, bombPower: 110, coinLuck: 0,
  };
}
function computeStats(itemIds, ctx) {
  const s = baseStats();
  itemIds.forEach(id => { const it = ITEMS[id]; if (it) it.mod(s, ctx); });
  s.fireDelay = Math.max(0.09, s.fireDelay);
  s.speed = clamp(s.speed, 120, 460);
  s.shotSpeed = Math.max(180, s.shotSpeed);
  return s;
}

// ───────────────────────────────────────
//  ROOM OBSTACLE LAYOUTS
//  Tile coords, interior is 13x7. Door lanes (col 6, row 3) stay clear.
// ───────────────────────────────────────
const LAYOUTS = [
  { rocks: [], pits: [], spikes: [] },
  { rocks: [[2, 1], [2, 2], [10, 1], [10, 2], [2, 4], [2, 5], [10, 4], [10, 5]], pits: [], spikes: [] },
  { rocks: [[4, 2], [8, 2], [4, 4], [8, 4]], pits: [[6, 2], [6, 4]], spikes: [] },
  { rocks: [[1, 1], [11, 1], [1, 5], [11, 5]], pits: [], spikes: [[4, 3], [8, 3]] },
  { rocks: [[3, 1], [3, 5], [9, 1], [9, 5], [5, 3], [7, 3]], pits: [], spikes: [] },
  { rocks: [], pits: [[2, 2], [3, 2], [9, 2], [10, 2], [2, 4], [3, 4], [9, 4], [10, 4]], spikes: [] },
  { rocks: [[2, 3], [10, 3]], pits: [[5, 1], [7, 1], [5, 5], [7, 5]], spikes: [[6, 3]] },
  { rocks: [[1, 2], [2, 1], [10, 1], [11, 2], [1, 4], [2, 5], [10, 5], [11, 4]], pits: [], spikes: [] },
];

// ───────────────────────────────────────
//  FLOOR GENERATION (room-grid roguelike floor)
// ───────────────────────────────────────
function genFloor(depth) {
  const cells = new Map();
  const key = (x, y) => x + ',' + y;
  const inGrid = (x, y) => x >= 0 && x < GRID && y >= 0 && y < GRID;
  const mk = (x, y, type) => {
    const r = {
      gx: x, gy: y, type, cleared: type === 'start', visited: false, seen: false,
      enemies: [], pickups: [], pedestals: [], bombsLive: [], rocks: [], pits: [], spikes: [],
      doors: {}, layout: 0, revealed: type !== 'secret', trapdoor: null,
    };
    cells.set(key(x, y), r);
    return r;
  };
  const neighborsOf = (x, y) => Object.entries(DIRS)
    .map(([d, [dx, dy]]) => ({ d, x: x + dx, y: y + dy, room: cells.get(key(x + dx, y + dy)) }))
    .filter(n => inGrid(n.x, n.y));
  const roomNeighborCount = (x, y) => neighborsOf(x, y).filter(n => n.room).length;

  const start = mk(4, 4, 'start');
  const targetNormals = Math.min(5 + depth * 2, 12);
  let made = 0, guard = 0;
  while (made < targetNormals && guard++ < 600) {
    const from = pick([...cells.values()].filter(r => r.type === 'start' || r.type === 'normal'));
    const opts = neighborsOf(from.gx, from.gy).filter(n => !n.room && roomNeighborCount(n.x, n.y) === 1);
    if (!opts.length) continue;
    const spot = pick(opts);
    mk(spot.x, spot.y, 'normal');
    made++;
  }

  // Special rooms attach to empty cells with exactly one room neighbor, far from start first
  function attachSpecial(type, preferFar) {
    let candidates = [];
    cells.forEach(r => {
      neighborsOf(r.gx, r.gy).forEach(n => {
        if (!n.room && roomNeighborCount(n.x, n.y) === 1 && (r.type === 'normal' || r.type === 'start')) {
          candidates.push({ x: n.x, y: n.y, d: Math.abs(n.x - 4) + Math.abs(n.y - 4) });
        }
      });
    });
    if (!candidates.length) { // relax
      cells.forEach(r => {
        neighborsOf(r.gx, r.gy).forEach(n => {
          if (!n.room && (r.type === 'normal' || r.type === 'start')) {
            candidates.push({ x: n.x, y: n.y, d: Math.abs(n.x - 4) + Math.abs(n.y - 4) });
          }
        });
      });
    }
    candidates.sort((a, b) => preferFar ? b.d - a.d : a.d - b.d);
    const c = preferFar ? candidates[0] : candidates[Math.floor(candidates.length / 2)] || candidates[0];
    return mk(c.x, c.y, type);
  }
  attachSpecial('boss', true);
  attachSpecial('treasure', false);
  attachSpecial('shop', false);

  // Secret room: empty cell adjacent to the most non-boss rooms
  let best = null, bestN = 0;
  for (let x = 0; x < GRID; x++) for (let y = 0; y < GRID; y++) {
    if (cells.has(key(x, y))) continue;
    const ns = neighborsOf(x, y).filter(n => n.room && n.room.type !== 'boss' && n.room.type !== 'secret');
    if (ns.length > bestN) { bestN = ns.length; best = { x, y }; }
  }
  if (best && bestN >= 1) mk(best.x, best.y, 'secret');

  // Wire doors
  cells.forEach(r => {
    Object.entries(DIRS).forEach(([d, [dx, dy]]) => {
      const n = cells.get(key(r.gx + dx, r.gy + dy));
      if (n) r.doors[d] = n;
    });
  });

  // Populate rooms
  cells.forEach(r => populateRoom(r, depth));
  return { cells, start, depth, secretRevealed: false };
}

// ───────────────────────────────────────
//  ENEMY DEFINITIONS (original designs)
// ───────────────────────────────────────
function makeEnemy(kind, x, y, depth) {
  const hpMul = 1 + (depth - 1) * 0.45;
  const base = {
    kind, x, y, vx: 0, vy: 0, t: rand(0, 6), hitFlash: 0, dead: false,
    flying: false, contactDmg: 1, wob: rand(0, Math.PI * 2),
  };
  switch (kind) {
    case 'emberMote': return Object.assign(base, { hp: 4 * hpMul, r: 13, flying: true, speed: 72 });
    case 'pyreWisp':  return Object.assign(base, { hp: 6 * hpMul, r: 14, flying: true, speed: 64, shotT: rand(1, 2.5) });
    case 'slagHusk':  return Object.assign(base, { hp: 16 * hpMul, r: 20, speed: 46, lunge: 0 });
    case 'ventCrawler': return Object.assign(base, { hp: 9 * hpMul, r: 15, speed: 150, dir: pick(['N', 'E', 'S', 'W']), turnT: rand(0.5, 1.5) });
    case 'ashTick':   return Object.assign(base, { hp: 7 * hpMul, r: 13, speed: 0, hopT: rand(0.4, 1.1), hopping: 0 });
    case 'flareNode': return Object.assign(base, { hp: 12 * hpMul, r: 18, speed: 0, shotT: rand(1.2, 2.4) });
    case 'cinderling': return Object.assign(base, { hp: 3 * hpMul, r: 10, speed: 165 });
    case 'ignis': return Object.assign(base, {
      hp: 300 + (depth - 1) * 130, maxHp: 300 + (depth - 1) * 130, r: 46, flying: true, speed: 55,
      boss: true, spin: 0, atkT: 2, mode: 'drift', modeT: 0, dashes: 0, spiralA: 0, contactDmg: 2,
    });
  }
}

const ROOM_SPAWNS = [
  ['emberMote', 'emberMote', 'emberMote'],
  ['emberMote', 'emberMote', 'pyreWisp'],
  ['slagHusk', 'emberMote', 'emberMote'],
  ['slagHusk', 'slagHusk'],
  ['ashTick', 'ashTick', 'ashTick'],
  ['ventCrawler', 'ventCrawler'],
  ['flareNode', 'ashTick', 'ashTick'],
  ['flareNode', 'flareNode', 'emberMote'],
  ['pyreWisp', 'pyreWisp', 'ashTick'],
  ['slagHusk', 'ashTick', 'pyreWisp'],
];

function populateRoom(r, depth) {
  if (r.type === 'normal') {
    const L = pick(LAYOUTS);
    r.rocks = L.rocks.map(([tx, ty]) => ({ tx, ty, hp: 1 }));
    r.pits = L.pits.slice();
    r.spikes = L.spikes.slice();
    let spawn = pick(ROOM_SPAWNS).slice();
    if (depth > 1) spawn = spawn.concat(pick(ROOM_SPAWNS).slice(0, Math.min(2, depth - 1)));
    r.pendingSpawn = spawn;
  } else if (r.type === 'boss') {
    r.pendingSpawn = ['ignis'];
  } else if (r.type === 'treasure') {
    r.pedestals.push({ x: RW / 2, y: RH / 2, item: pickFromPool('treasure'), cost: 0, kind: 'item' });
  } else if (r.type === 'shop') {
    const items = [pickFromPool('shop'), pickFromPool('shop')];
    r.pedestals.push({ x: RW * 0.3, y: RH / 2, item: items[0], cost: 15, kind: 'item' });
    r.pedestals.push({ x: RW * 0.45, y: RH / 2, item: items[1], cost: 15, kind: 'item' });
    r.pedestals.push({ x: RW * 0.6, y: RH / 2, pickup: 'heart', cost: 3, kind: 'pickup' });
    r.pedestals.push({ x: RW * 0.75, y: RH / 2, pickup: pick(['novaCharge', 'sigil']), cost: 5, kind: 'pickup' });
  } else if (r.type === 'secret') {
    const roll = Math.random();
    if (roll < 0.35) r.pedestals.push({ x: RW / 2, y: RH / 2, item: pickFromPool('treasure'), cost: 0, kind: 'item' });
    else {
      r.pickups.push({ x: RW / 2 - 40, y: RH / 2, type: 'solari5', t: 0 });
      r.pickups.push({ x: RW / 2 + 40, y: RH / 2, type: pick(['heart', 'novaCharge', 'sigil']), t: 0 });
    }
  }
}

const seenItems = new Set();
function pickFromPool(pool) {
  const opts = POOLS[pool].filter(id => !seenItems.has(id));
  const id = pick(opts.length ? opts : POOLS[pool]);
  seenItems.add(id);
  return id;
}

// ───────────────────────────────────────
//  SFX
// ───────────────────────────────────────
const SFX = {
  ctx() { return window.SolarisAudio && window.SolarisAudio.ctx; },
  out() { return window.SolarisAudio && window.SolarisAudio.master; },
  tone(freq, dur, type, vol, slideTo) {
    const ctx = this.ctx(); if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'square'; o.frequency.value = freq;
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
    g.gain.setValueAtTime(vol || 0.05, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(this.out());
    o.start(); o.stop(ctx.currentTime + dur + 0.05);
  },
  noise(dur, vol, freq) {
    const ctx = this.ctx(); if (!ctx) return;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = freq || 800;
    src.buffer = buf;
    g.gain.setValueAtTime(vol || 0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(f); f.connect(g); g.connect(this.out());
    src.start();
  },
  shoot()    { this.tone(620, 0.08, 'square', 0.025, 240); },
  hit()      { this.noise(0.06, 0.05, 1600); },
  die()      { this.tone(300, 0.25, 'sawtooth', 0.05, 60); },
  hurt()     { this.tone(110, 0.3, 'sawtooth', 0.09, 55); this.noise(0.15, 0.08, 500); },
  pickup()   { this.tone(660, 0.09, 'sine', 0.06); setTimeout(() => this.tone(880, 0.12, 'sine', 0.06), 70); },
  itemGet()  { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.3, 'sine', 0.06), i * 110)); },
  boom()     { this.noise(0.5, 0.2, 300); this.tone(70, 0.5, 'sine', 0.15, 30); },
  door()     { this.tone(140, 0.18, 'square', 0.05, 90); },
  coin()     { this.tone(988, 0.07, 'square', 0.04); setTimeout(() => this.tone(1319, 0.15, 'square', 0.04), 60); },
  denied()   { this.tone(160, 0.15, 'square', 0.05, 140); },
  descend()  { this.tone(220, 0.8, 'sawtooth', 0.06, 40); },
  bossRoar() { this.tone(60, 1.2, 'sawtooth', 0.12, 35); this.noise(0.8, 0.1, 250); },
};

// ───────────────────────────────────────
//  GAME STATE
// ───────────────────────────────────────
let canvas = null, ctx = null;
const G = {
  active: false, slot: 0, depth: 1,
  floor: null, room: null,
  run: null,          // hearts, maxHearts, coins, bombs, keys, items[]
  stats: null,
  px: RW / 2, py: RH / 2, pvx: 0, pvy: 0,
  fireT: 0, iframes: 0, aim: { x: 1, y: 0 },
  bolts: [], ebolts: [], fx: [], floats: [],
  knight: { capePhase: 0, glowPulse: 0, swordAngle: 0.25 },
  state: 'play',      // play | transition | paused | dead | descend
  transT: 0, transDir: null, deadT: 0, descendT: 0,
  banner: null, bannerT: 0, titleCardT: 0,
  roomsCleared: 0, killCount: 0,
  shake: 0, time: 0,
  pendingEclipse: false,
  orbitalA: 0,
};

const keys = {};

function newRun() {
  return { character: 'The Helio Knight', hearts: 6, maxHearts: 3, coins: 3, bombs: 1, keys: 1, items: [] };
}

function recompute() {
  G.stats = computeStats(G.run.items, { roomsCleared: G.roomsCleared });
}

function saveGame() {
  Saves.write(G.slot, {
    character: G.run.character, depth: G.depth, floorName: floorShort(G.depth),
    hearts: G.run.hearts, maxHearts: G.run.maxHearts,
    coins: G.run.coins, bombs: G.run.bombs, keys: G.run.keys,
    items: G.run.items.slice(), ts: Date.now(),
  });
}

function startGame(slotIdx) {
  if (!canvas) initCanvas();
  G.slot = slotIdx;
  const save = Saves.all()[slotIdx];
  if (save && !save.fallen) {
    G.depth = save.depth;
    G.run = {
      character: save.character, hearts: save.hearts, maxHearts: save.maxHearts,
      coins: save.coins, bombs: save.bombs, keys: save.keys, items: save.items.slice(),
    };
  } else {
    G.depth = 1;
    G.run = newRun();
    Saves.write(slotIdx, null);
  }
  G.roomsCleared = 0; G.killCount = 0;
  seenItems.clear();
  G.run.items.forEach(id => seenItems.add(id));
  recompute();
  G.floor = genFloor(G.depth);
  enterRoom(G.floor.start, null);
  G.bolts = []; G.ebolts = []; G.fx = []; G.floats = [];
  G.state = 'play';
  G.titleCardT = 3;
  G.active = true;
  saveGame();
  requestAnimationFrame(gameLoop);
}

function exitToTitle() {
  G.active = false;
  window.SolarisExitToTitle();
}

// ───────────────────────────────────────
//  ROOM FLOW
// ───────────────────────────────────────
function enterRoom(room, fromDir) {
  G.room = room;
  room.visited = true;
  room.seen = true;
  Object.values(room.doors).forEach(n => { n.seen = true; });
  G.bolts = []; G.ebolts = [];

  // Spawn enemies on first hostile entry
  if (room.pendingSpawn && !room.cleared) {
    room.enemies = room.pendingSpawn.map(kind => {
      let x, y, tries = 0;
      do {
        x = rand(TILE * 2, RW - TILE * 2);
        y = rand(TILE * 1.5, RH - TILE * 1.5);
        tries++;
      } while (tries < 30 && (Math.hypot(x - G.px, y - G.py) < 180 || solidAt(room, x, y)));
      return makeEnemy(kind, x, y, G.depth);
    });
    room.pendingSpawn = null;
    if (room.type === 'boss') { SFX.bossRoar(); G.shake = 14; }
  }

  // Position player at entry door
  if (fromDir === 'N') { G.px = RW / 2; G.py = TILE * 0.7; }
  else if (fromDir === 'S') { G.px = RW / 2; G.py = RH - TILE * 0.7; }
  else if (fromDir === 'W') { G.px = TILE * 0.7; G.py = RH / 2; }
  else if (fromDir === 'E') { G.px = RW - TILE * 0.7; G.py = RH / 2; }
  else { G.px = RW / 2; G.py = RH * 0.62; }
}

function roomHostile(room) {
  return room.enemies.some(e => !e.dead);
}

function doorOpen(room, dir) {
  const n = room.doors[dir];
  if (!n) return false;
  if (roomHostile(room)) return false;
  if (n.type === 'secret' && !n.revealed) return false;
  if (room.type === 'secret' && !room.revealed) return false;
  if (n.type === 'shop' && !n.unlocked) return 'keyed';
  if (n.type === 'treasure' && G.depth > 1 && !n.unlocked) return 'keyed';
  return true;
}

function tryDoorCross() {
  const m = 26;
  let dir = null;
  if (G.py < -m * 0.2 && Math.abs(G.px - RW / 2) < TILE * 0.8) dir = 'N';
  else if (G.py > RH + m * 0.2 && Math.abs(G.px - RW / 2) < TILE * 0.8) dir = 'S';
  else if (G.px < -m * 0.2 && Math.abs(G.py - RH / 2) < TILE * 0.8) dir = 'W';
  else if (G.px > RW + m * 0.2 && Math.abs(G.py - RH / 2) < TILE * 0.8) dir = 'E';
  if (!dir) return;
  const st = doorOpen(G.room, dir);
  if (st === true) {
    G.state = 'transition';
    G.transDir = dir;
    G.transT = 0;
    SFX.door();
  } else {
    // shove back in
    G.px = clamp(G.px, 16, RW - 16);
    G.py = clamp(G.py, 16, RH - 16);
  }
}

function onRoomCleared(room) {
  room.cleared = true;
  G.roomsCleared++;
  SFX.door();
  recompute();
  // Reward drop
  const roll = Math.random();
  const luck = G.stats.coinLuck;
  if (roll < 0.32 + luck) room.pickups.push({ x: RW / 2, y: RH / 2, type: roll < 0.1 ? 'solari5' : pick(['solari', 'solari', 'heart', 'novaCharge', 'sigil']), t: 0 });
  if (room.type === 'boss') {
    // Boss rewards: relic pedestal, trapdoor, possible eclipse bargain
    room.pedestals.push({ x: RW / 2 - 90, y: RH / 2 - 40, item: pickFromPool('boss'), cost: 0, kind: 'item' });
    room.trapdoor = { x: RW / 2, y: RH / 2 + 70 };
    if (Math.random() < 0.45 && G.run.maxHearts > 1) {
      room.pedestals.push({ x: RW / 2 + 90, y: RH / 2 - 40, item: pickFromPool('eclipse'), cost: 0, kind: 'item', eclipse: true });
      if (G.bannerT <= 0) banner('AN ECLIPSE BARGAIN MANIFESTS', 'it asks for a piece of your sun');
    }
  }
  saveGame();
}

function banner(big, small) {
  G.banner = { big, small };
  G.bannerT = 3;
}

// ───────────────────────────────────────
//  SOLIDS / COLLISION
// ───────────────────────────────────────
function solidAt(room, x, y, forFlyer, forBolt, spectral) {
  const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
  if (tx < 0 || tx >= COLS || ty < 0 || ty >= ROWS) return false;
  if (room.rocks.some(r => r.hp > 0 && r.tx === tx && r.ty === ty)) return forBolt ? !spectral : true;
  if (!forBolt && !forFlyer && room.pits.some(([px, py]) => px === tx && py === ty)) return true;
  return false;
}

function tryMove(room, obj, dx, dy, r, flying, isPlayer) {
  const minB = r, maxBX = RW - r, maxBY = RH - r;
  const nx = obj.x + dx;
  if (!collidesTiles(room, nx, obj.y, r, flying)) obj.x = nx;
  const ny = obj.y + dy;
  if (!collidesTiles(room, obj.x, ny, r, flying)) obj.y = ny;
  if (!isPlayer) {
    obj.x = clamp(obj.x, minB, maxBX);
    obj.y = clamp(obj.y, minB, maxBY);
  } else {
    // walls except door lanes
    const inDoorLaneX = Math.abs(obj.x - RW / 2) < TILE * 0.55;
    const inDoorLaneY = Math.abs(obj.y - RH / 2) < TILE * 0.55;
    if (!(inDoorLaneX)) obj.y = clamp(obj.y, minB, maxBY);
    if (!(inDoorLaneY)) obj.x = clamp(obj.x, minB, maxBX);
    obj.x = clamp(obj.x, -TILE * 0.4, RW + TILE * 0.4);
    obj.y = clamp(obj.y, -TILE * 0.4, RH + TILE * 0.4);
  }
}

function collidesTiles(room, x, y, r, flying) {
  for (const rock of room.rocks) {
    if (rock.hp <= 0) continue;
    if (circleRect(x, y, r, rock.tx * TILE, rock.ty * TILE, TILE, TILE)) return true;
  }
  if (!flying) {
    for (const [px, py] of room.pits) {
      if (circleRect(x, y, r * 0.6, px * TILE + 8, py * TILE + 8, TILE - 16, TILE - 16)) return true;
    }
  }
  return false;
}

function circleRect(cx, cy, cr, rx, ry, rw, rh) {
  const nx = clamp(cx, rx, rx + rw), ny = clamp(cy, ry, ry + rh);
  return (cx - nx) ** 2 + (cy - ny) ** 2 < cr * cr;
}

// ───────────────────────────────────────
//  PLAYER
// ───────────────────────────────────────
function hurtPlayer(n) {
  if (G.iframes > 0 || G.state !== 'play') return;
  if (G.stats.guardChance > 0 && Math.random() < G.stats.guardChance) {
    addFloat(G.px, G.py - 40, 'GUARDED', '#8fd0ff');
    G.iframes = 0.6;
    return;
  }
  G.run.hearts -= n;
  G.iframes = 1.1;
  G.shake = 10;
  SFX.hurt();
  burst(G.px, G.py, 14, '#f5c842');
  if (G.stats.onHitNova) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      G.bolts.push(mkBolt(G.px, G.py, Math.cos(a), Math.sin(a)));
    }
  }
  if (G.run.hearts <= 0) {
    G.state = 'dead';
    G.deadT = 0;
    Saves.write(G.slot, { fallen: true, floorName: floorShort(G.depth), ts: Date.now() });
  }
}

function mkBolt(x, y, dx, dy) {
  const s = G.stats;
  return {
    x, y, vx: dx * s.shotSpeed + G.pvx * 0.25, vy: dy * s.shotSpeed + G.pvy * 0.25,
    dmg: s.dmg, life: s.range, r: s.boltR,
    homing: s.homing, piercing: s.piercing, spectral: s.spectral, kb: s.knockback,
    hit: new Set(),
  };
}

function fire(dx, dy) {
  const s = G.stats;
  if (G.fireT > 0) return;
  G.fireT = s.fireDelay;
  const n = s.multishot;
  const baseA = Math.atan2(dy, dx);
  for (let i = 0; i < n; i++) {
    const off = n === 1 ? 0 : (i - (n - 1) / 2) * 0.16;
    G.bolts.push(mkBolt(G.px, G.py - 14, Math.cos(baseA + off), Math.sin(baseA + off)));
  }
  SFX.shoot();
}

function placeBomb() {
  if (G.run.bombs <= 0) { SFX.denied(); return; }
  G.run.bombs--;
  G.room.bombsLive.push({ x: G.px, y: G.py, fuse: 1.5 });
}

function explode(room, x, y) {
  const R = G.stats.bombPower;
  SFX.boom();
  G.shake = 16;
  burst(x, y, 40, '#ff9a3a');
  burst(x, y, 20, '#fff3c0');
  // damage enemies
  room.enemies.forEach(e => {
    if (!e.dead && Math.hypot(e.x - x, e.y - y) < R + e.r) damageEnemy(e, 30);
  });
  // hurt player
  if (Math.hypot(G.px - x, G.py - y) < R * 0.8) hurtPlayer(1);
  // break rocks
  room.rocks.forEach(rock => {
    if (rock.hp > 0 && Math.hypot(rock.tx * TILE + 32 - x, rock.ty * TILE + 32 - y) < R + 40) {
      rock.hp = 0;
      burst(rock.tx * TILE + 32, rock.ty * TILE + 32, 8, '#7a6a8a');
      if (Math.random() < 0.12 + G.stats.coinLuck * 0.5) {
        room.pickups.push({ x: rock.tx * TILE + 32, y: rock.ty * TILE + 32, type: pick(['solari', 'heart', 'sigil']), t: 0 });
      }
    }
  });
  // reveal secret room through walls
  const fl = G.floor;
  Object.entries(DIRS).forEach(([d]) => {
    const n = room.doors[d];
    if (n && n.type === 'secret' && !n.revealed) {
      const doorPos = doorWorldPos(d);
      if (Math.hypot(doorPos.x - x, doorPos.y - y) < R + 70) {
        n.revealed = true;
        banner('A HIDDEN CHAMBER BREATHES', 'the wall was always hollow');
        SFX.door();
      }
    }
  });
  if (room.type === 'secret' && !room.revealed) room.revealed = true;
}

function doorWorldPos(dir) {
  if (dir === 'N') return { x: RW / 2, y: 0 };
  if (dir === 'S') return { x: RW / 2, y: RH };
  if (dir === 'W') return { x: 0, y: RH / 2 };
  return { x: RW, y: RH / 2 };
}

// ───────────────────────────────────────
//  ENEMIES
// ───────────────────────────────────────
function damageEnemy(e, dmg, kb, kx, ky) {
  e.hp -= dmg;
  e.hitFlash = 0.12;
  SFX.hit();
  if (kb && !e.boss) {
    e.x += kx * kb * 0.016;
    e.y += ky * kb * 0.016;
  }
  if (e.hp <= 0 && !e.dead) {
    e.dead = true;
    G.killCount++;
    SFX.die();
    burst(e.x, e.y, 16, e.boss ? '#ff6a2a' : '#c05030');
    if (e.kind === 'slagHusk') {
      // splits into cinderlings
      G.room.enemies.push(makeEnemy('cinderling', e.x - 14, e.y, G.depth));
      G.room.enemies.push(makeEnemy('cinderling', e.x + 14, e.y, G.depth));
    }
    if (G.stats.splitOnKill) {
      for (let i = 0; i < 4; i++) {
        const a = rand(0, Math.PI * 2);
        const b = mkBolt(e.x, e.y, Math.cos(a), Math.sin(a));
        b.dmg *= 0.5; b.life *= 0.5;
        G.bolts.push(b);
      }
    }
    if (!e.boss && Math.random() < 0.08 + G.stats.coinLuck) {
      G.room.pickups.push({ x: e.x, y: e.y, type: pick(['solari', 'solari', 'heart']), t: 0 });
    }
    if (e.boss) {
      burst(e.x, e.y, 80, '#ffd24a');
      G.shake = 24;
      banner('IGNIS, WARDEN OF MERCURY, IS UNMADE', 'the first gate of the sun stands open');
    }
    if (!roomHostile(G.room) && !G.room.cleared) onRoomCleared(G.room);
  }
}

function ebolt(x, y, dx, dy, speed) {
  G.ebolts.push({ x, y, vx: dx * speed, vy: dy * speed, r: 8, life: 3 });
}

function updateEnemy(e, dt) {
  if (e.dead) return;
  e.t += dt;
  if (e.hitFlash > 0) e.hitFlash -= dt;
  const toP = { x: G.px - e.x, y: G.py - e.y };
  const d = Math.hypot(toP.x, toP.y) || 1;
  const ux = toP.x / d, uy = toP.y / d;

  switch (e.kind) {
    case 'emberMote': {
      e.wob += dt * 3;
      e.vx += (ux * e.speed - e.vx) * dt * 2 + Math.cos(e.wob) * 18 * dt;
      e.vy += (uy * e.speed - e.vy) * dt * 2 + Math.sin(e.wob * 1.3) * 18 * dt;
      e.x += e.vx * dt; e.y += e.vy * dt;
      break;
    }
    case 'pyreWisp': {
      const want = d > 230 ? 1 : (d < 150 ? -1 : 0);
      e.vx += (ux * e.speed * want - e.vx) * dt * 2;
      e.vy += (uy * e.speed * want - e.vy) * dt * 2;
      e.x += e.vx * dt; e.y += e.vy * dt;
      e.shotT -= dt;
      if (e.shotT <= 0) { e.shotT = 2.4; ebolt(e.x, e.y, ux, uy, 240); }
      break;
    }
    case 'slagHusk': {
      e.lunge = Math.max(0, e.lunge - dt);
      const sp = e.lunge > 0 ? e.speed * 3 : e.speed;
      if (e.lunge <= 0 && Math.random() < dt * 0.4 && d < 320) e.lunge = 0.7;
      tryMove(G.room, e, ux * sp * dt, uy * sp * dt, e.r, false);
      break;
    }
    case 'ventCrawler': {
      e.turnT -= dt;
      const [dx, dy] = DIRS[e.dir];
      // charge if aligned with player
      const aligned = (Math.abs(e.x - G.px) < 30 && ((dy > 0) === (G.py > e.y)) && dx === 0) ||
                      (Math.abs(e.y - G.py) < 30 && ((dx > 0) === (G.px > e.x)) && dy === 0);
      const sp = aligned ? e.speed * 1.7 : e.speed * 0.55;
      const ox = e.x, oy = e.y;
      tryMove(G.room, e, dx * sp * dt, dy * sp * dt, e.r, false);
      if ((Math.abs(e.x - ox) < 0.1 && dx !== 0) || (Math.abs(e.y - oy) < 0.1 && dy !== 0) || e.turnT <= 0) {
        e.dir = pick(['N', 'E', 'S', 'W']);
        e.turnT = rand(0.7, 1.8);
      }
      break;
    }
    case 'ashTick': {
      if (e.hopping > 0) {
        e.hopping -= dt;
        tryMove(G.room, e, e.vx * dt, e.vy * dt, e.r, false);
      } else {
        e.hopT -= dt;
        if (e.hopT <= 0) {
          e.hopT = rand(0.7, 1.3);
          e.hopping = 0.32;
          e.vx = ux * 330; e.vy = uy * 330;
        }
      }
      break;
    }
    case 'flareNode': {
      e.shotT -= dt;
      if (e.shotT <= 0 && d < 430) {
        e.shotT = 2.2;
        const a = Math.atan2(uy, ux);
        [-0.28, 0, 0.28].forEach(off => ebolt(e.x, e.y, Math.cos(a + off), Math.sin(a + off), 220));
      }
      break;
    }
    case 'cinderling': {
      e.vx += (ux * e.speed - e.vx) * dt * 4;
      e.vy += (uy * e.speed - e.vy) * dt * 4;
      tryMove(G.room, e, e.vx * dt, e.vy * dt, e.r, false);
      break;
    }
    case 'ignis': updateIgnis(e, dt, ux, uy, d); break;
  }

  // contact damage
  if (Math.hypot(e.x - G.px, e.y - G.py) < e.r + 16) hurtPlayer(e.contactDmg);
}

function updateIgnis(e, dt, ux, uy, d) {
  e.spin += dt * (e.hp < e.maxHp * 0.5 ? 2.4 : 1.2);
  const ph2 = e.hp < e.maxHp * 0.5;
  e.modeT -= dt;

  if (e.mode === 'drift') {
    e.vx += (ux * e.speed - e.vx) * dt * 1.5;
    e.vy += (uy * e.speed - e.vy) * dt * 1.5;
    e.x += e.vx * dt; e.y += e.vy * dt;
    e.atkT -= dt;
    if (e.atkT <= 0) {
      const roll = Math.random();
      if (roll < 0.34) {
        // bolt ring
        const n = ph2 ? 12 : 8;
        const a0 = rand(0, Math.PI * 2);
        for (let i = 0; i < n; i++) {
          const a = a0 + (i / n) * Math.PI * 2;
          ebolt(e.x, e.y, Math.cos(a), Math.sin(a), 200);
        }
        e.atkT = ph2 ? 1.7 : 2.3;
      } else if (roll < 0.62) {
        e.mode = 'telegraph'; e.modeT = 0.55;
      } else if (roll < 0.82 && ph2) {
        e.mode = 'spiral'; e.modeT = 2.2; e.spiralA = rand(0, 6);
        e.atkT = 2;
      } else {
        // summon embers
        const live = G.room.enemies.filter(x => !x.dead && x.kind === 'emberMote').length;
        const cap = ph2 ? 6 : 4;
        for (let i = 0; i < Math.min(2, cap - live); i++) {
          G.room.enemies.push(makeEnemy('emberMote', e.x + rand(-60, 60), e.y + rand(-60, 60), G.depth));
        }
        e.atkT = 2.6;
      }
    }
  } else if (e.mode === 'telegraph') {
    e.vx *= 0.9; e.vy *= 0.9;
    if (e.modeT <= 0) {
      e.mode = 'dash';
      const a = Math.atan2(G.py - e.y, G.px - e.x);
      e.vx = Math.cos(a) * 560; e.vy = Math.sin(a) * 560;
      e.dashes = ph2 ? 2 : 1;
      e.modeT = 3;
    }
  } else if (e.mode === 'dash') {
    e.x += e.vx * dt; e.y += e.vy * dt;
    let bounced = false;
    if (e.x < e.r) { e.x = e.r; e.vx = Math.abs(e.vx); bounced = true; }
    if (e.x > RW - e.r) { e.x = RW - e.r; e.vx = -Math.abs(e.vx); bounced = true; }
    if (e.y < e.r) { e.y = e.r; e.vy = Math.abs(e.vy); bounced = true; }
    if (e.y > RH - e.r) { e.y = RH - e.r; e.vy = -Math.abs(e.vy); bounced = true; }
    if (bounced) {
      G.shake = 8;
      SFX.noise(0.2, 0.1, 400);
      e.dashes--;
      if (e.dashes <= 0) { e.mode = 'drift'; e.atkT = ph2 ? 1.2 : 2; e.vx *= 0.2; e.vy *= 0.2; }
    }
    if (e.modeT <= 0) { e.mode = 'drift'; e.atkT = 2; }
  } else if (e.mode === 'spiral') {
    e.vx *= 0.95; e.vy *= 0.95;
    e.spiralA += dt * 7;
    if (Math.floor(e.spiralA / 0.45) !== Math.floor((e.spiralA - dt * 7) / 0.45)) {
      ebolt(e.x, e.y, Math.cos(e.spiralA), Math.sin(e.spiralA), 230);
      ebolt(e.x, e.y, Math.cos(e.spiralA + Math.PI), Math.sin(e.spiralA + Math.PI), 230);
    }
    if (e.modeT <= 0) { e.mode = 'drift'; e.atkT = 1.5; }
  }
  e.x = clamp(e.x, e.r, RW - e.r);
  e.y = clamp(e.y, e.r, RH - e.r);
}

// ───────────────────────────────────────
//  PICKUPS / PEDESTALS
// ───────────────────────────────────────
function applyPickup(p) {
  switch (p.type) {
    case 'heart':
      if (G.run.hearts >= G.run.maxHearts * 2) return false;
      G.run.hearts = Math.min(G.run.hearts + 2, G.run.maxHearts * 2); break;
    case 'solari': G.run.coins += 1; SFX.coin(); return true;
    case 'solari5': G.run.coins += 5; SFX.coin(); return true;
    case 'novaCharge': G.run.bombs += 1; break;
    case 'sigil': G.run.keys += 1; break;
  }
  SFX.pickup();
  return true;
}

function takePedestal(room, ped) {
  if (ped.kind === 'item') {
    const it = ITEMS[ped.item];
    if (ped.eclipse && G.run.maxHearts <= 1) {
      SFX.denied();
      addFloat(ped.x, ped.y - 50, 'TOO LITTLE SUN LEFT', '#b06aff');
      ped.cool = 1.2;
      return;
    }
    if (ped.eclipse) {
      G.run.maxHearts -= 1;
      G.run.hearts = Math.min(G.run.hearts, G.run.maxHearts * 2);
      addFloat(G.px, G.py - 50, '-1 SUN', '#b06aff');
    }
    G.run.items.push(ped.item);
    if (it.instant) it.instant(G.run);
    recompute();
    banner(it.name.toUpperCase(), it.desc);
    SFX.itemGet();
    burst(ped.x, ped.y, 30, ped.eclipse ? '#9a5aff' : '#ffd24a');
    room.pedestals = room.pedestals.filter(p => p !== ped);
    saveGame();
  } else {
    if (applyPickup({ type: ped.pickup })) {
      room.pedestals = room.pedestals.filter(p => p !== ped);
      saveGame();
    }
  }
}

function updatePickupsAndPedestals(dt) {
  const room = G.room;
  // floor pickups
  for (let i = room.pickups.length - 1; i >= 0; i--) {
    const p = room.pickups[i];
    p.t += dt;
    if (Math.hypot(p.x - G.px, p.y - G.py) < 26) {
      if (applyPickup(p)) room.pickups.splice(i, 1);
    }
  }
  // pedestals (with cost)
  for (const ped of room.pedestals.slice()) {
    if (ped.cool > 0) { ped.cool -= dt; continue; }
    if (Math.hypot(ped.x - G.px, ped.y - G.py) < 34) {
      if (ped.cost > 0) {
        if (!ped.touchT) ped.touchT = 0;
        ped.touchT += dt;
        if (ped.touchT > 0.25) {
          ped.touchT = -1.5;
          if (G.run.coins >= ped.cost) {
            G.run.coins -= ped.cost;
            SFX.coin();
            ped.cost = 0;
            takePedestal(room, ped);
          } else {
            SFX.denied();
            addFloat(ped.x, ped.y - 50, `${ped.cost} SOLARI`, '#ff7a4a');
          }
        }
      } else {
        takePedestal(room, ped);
      }
    } else if (ped.touchT) ped.touchT = 0;
  }
  // keyed doors: unlock by touching while having sigil
  Object.entries(G.room.doors).forEach(([d, n]) => {
    if (doorOpen(G.room, d) === 'keyed') {
      const dp = doorWorldPos(d);
      if (Math.hypot(dp.x - G.px, dp.y - G.py) < 54) {
        if (G.run.keys > 0) {
          G.run.keys--;
          n.unlocked = true;
          SFX.pickup();
          addFloat(dp.x, clamp(dp.y, 50, RH - 50), 'SIGIL SPENT', '#ffd24a');
          saveGame();
        }
      }
    }
  });
  // trapdoor
  if (room.trapdoor && Math.hypot(room.trapdoor.x - G.px, room.trapdoor.y - G.py) < 30) {
    G.state = 'descend';
    G.descendT = 0;
    SFX.descend();
  }
}

// ───────────────────────────────────────
//  FX
// ───────────────────────────────────────
function burst(x, y, n, col) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2), sp = rand(30, 220);
    G.fx.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(0.3, 0.8), maxLife: 0.8, col, r: rand(1.5, 4) });
  }
}
function addFloat(x, y, txt, col) {
  G.floats.push({ x, y, txt, col, life: 1.4 });
}

// ───────────────────────────────────────
//  UPDATE
// ───────────────────────────────────────
function update(dt) {
  G.time += dt;
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 40);
  if (G.bannerT > 0) G.bannerT -= dt;
  if (G.titleCardT > 0) G.titleCardT -= dt;

  if (G.state === 'transition') {
    G.transT += dt * 3.2;
    if (G.transT >= 1) {
      const dir = G.transDir;
      const next = G.room.doors[dir];
      enterRoom(next, OPP[dir]);
      G.state = 'play';
    }
    return;
  }
  if (G.state === 'descend') {
    G.descendT += dt;
    if (G.descendT > 1.4) {
      G.depth++;
      G.floor = genFloor(G.depth);
      G.roomsCleared = 0;
      recompute();
      enterRoom(G.floor.start, null);
      G.state = 'play';
      G.titleCardT = 3;
      saveGame();
    }
    return;
  }
  if (G.state === 'dead') {
    G.deadT += dt;
    return;
  }
  if (G.state === 'paused') return;

  // ── player movement (WASD)
  const s = G.stats;
  let mx = 0, my = 0;
  if (keys['w']) my -= 1;
  if (keys['s']) my += 1;
  if (keys['a']) mx -= 1;
  if (keys['d']) mx += 1;
  const ml = Math.hypot(mx, my) || 1;
  G.pvx = (mx / ml) * s.speed;
  G.pvy = (my / ml) * s.speed;
  tryMove(G.room, { get x() { return G.px; }, set x(v) { G.px = v; }, get y() { return G.py; }, set y(v) { G.py = v; } },
    G.pvx * dt, G.pvy * dt, 15, false, true);
  tryDoorCross();

  // spikes
  G.room.spikes.forEach(([tx, ty]) => {
    if (circleRect(G.px, G.py, 10, tx * TILE + 14, ty * TILE + 14, TILE - 28, TILE - 28)) hurtPlayer(1);
  });

  // ── shooting (arrows = twin stick)
  let sx = 0, sy = 0;
  if (keys['arrowup']) sy -= 1;
  if (keys['arrowdown']) sy += 1;
  if (keys['arrowleft']) sx -= 1;
  if (keys['arrowright']) sx += 1;
  if (sx || sy) {
    G.aim = { x: sx, y: sy };
    fire(sx / (Math.hypot(sx, sy)), sy / (Math.hypot(sx, sy)));
  }
  if (G.fireT > 0) G.fireT -= dt;
  if (G.iframes > 0) G.iframes -= dt;
  G.knight.swordAngle = Math.atan2(G.aim.y, G.aim.x) - Math.PI / 2 + 0.25;

  // orbital familiars
  if (s.orbital > 0) {
    G.orbitalA += dt * 3;
    for (let i = 0; i < s.orbital; i++) {
      const a = G.orbitalA + (i / s.orbital) * Math.PI * 2;
      const ox = G.px + Math.cos(a) * 55, oy = G.py + Math.sin(a) * 55;
      G.room.enemies.forEach(e => {
        if (!e.dead && Math.hypot(e.x - ox, e.y - oy) < e.r + 10) damageEnemy(e, 9 * dt * 3, 0, 0, 0);
      });
    }
  }

  // ── player bolts
  for (let i = G.bolts.length - 1; i >= 0; i--) {
    const b = G.bolts[i];
    if (b.homing) {
      let near = null, nd = 1e9;
      G.room.enemies.forEach(e => {
        if (!e.dead) { const dd = Math.hypot(e.x - b.x, e.y - b.y); if (dd < nd) { nd = dd; near = e; } }
      });
      if (near && nd < 260) {
        const a = Math.atan2(near.y - b.y, near.x - b.x);
        const cur = Math.atan2(b.vy, b.vx);
        const sp = Math.hypot(b.vx, b.vy);
        let da = a - cur;
        while (da > Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        const na = cur + clamp(da, -4 * dt, 4 * dt);
        b.vx = Math.cos(na) * sp; b.vy = Math.sin(na) * sp;
      }
    }
    b.x += b.vx * dt; b.y += b.vy * dt;
    b.life -= dt;
    let kill = b.life <= 0 || b.x < -10 || b.x > RW + 10 || b.y < -10 || b.y > RH + 10;
    if (!kill && solidAt(G.room, b.x, b.y, true, true, b.spectral)) kill = true;
    if (!kill) {
      for (const e of G.room.enemies) {
        if (e.dead || b.hit.has(e)) continue;
        if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + b.r) {
          const l = Math.hypot(b.vx, b.vy) || 1;
          damageEnemy(e, b.dmg, b.kb, b.vx / l, b.vy / l);
          b.hit.add(e);
          if (!b.piercing) { kill = true; }
          break;
        }
      }
    }
    if (kill) {
      burst(b.x, b.y, 3, '#ffd24a');
      G.bolts.splice(i, 1);
    }
  }

  // ── enemy bolts
  for (let i = G.ebolts.length - 1; i >= 0; i--) {
    const b = G.ebolts[i];
    b.x += b.vx * dt; b.y += b.vy * dt;
    b.life -= dt;
    let kill = b.life <= 0 || b.x < -10 || b.x > RW + 10 || b.y < -10 || b.y > RH + 10;
    if (!kill && solidAt(G.room, b.x, b.y, true, true, false)) kill = true;
    if (!kill && Math.hypot(b.x - G.px, b.y - G.py) < b.r + 13) {
      hurtPlayer(1);
      kill = true;
    }
    if (kill) { burst(b.x, b.y, 3, '#ff5a2a'); G.ebolts.splice(i, 1); }
  }

  // ── enemies
  G.room.enemies.forEach(e => updateEnemy(e, dt));

  // ── bombs
  const room = G.room;
  for (let i = room.bombsLive.length - 1; i >= 0; i--) {
    const b = room.bombsLive[i];
    b.fuse -= dt;
    if (b.fuse <= 0) {
      room.bombsLive.splice(i, 1);
      explode(room, b.x, b.y);
    }
  }

  updatePickupsAndPedestals(dt);

  // ── fx
  for (let i = G.fx.length - 1; i >= 0; i--) {
    const p = G.fx[i];
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vx *= 0.96; p.vy *= 0.96;
    p.life -= dt;
    if (p.life <= 0) G.fx.splice(i, 1);
  }
  for (let i = G.floats.length - 1; i >= 0; i--) {
    const f = G.floats[i];
    f.y -= 30 * dt; f.life -= dt;
    if (f.life <= 0) G.floats.splice(i, 1);
  }
}

// ───────────────────────────────────────
//  RENDER
// ───────────────────────────────────────
let view = { scale: 1, ox: 0, oy: 0 };

function computeView() {
  const W = canvas.width, H = canvas.height;
  const worldW = RW + WALL * 2, worldH = RH + WALL * 2 + 60;
  view.scale = Math.min(W / worldW, (H - 70) / worldH) * 0.98;
  view.ox = (W - RW * view.scale) / 2;
  view.oy = (H - RH * view.scale) / 2 + 22;
}

function render(t) {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // backdrop
  const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
  grad.addColorStop(0, '#0d0716');
  grad.addColorStop(1, '#020103');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  computeView();
  ctx.save();
  const shx = G.shake > 0 ? rand(-G.shake, G.shake) * 0.5 : 0;
  const shy = G.shake > 0 ? rand(-G.shake, G.shake) * 0.5 : 0;
  ctx.translate(view.ox + shx, view.oy + shy);
  ctx.scale(view.scale, view.scale);

  drawRoom(t);
  drawEntities(t);

  ctx.restore();

  drawHUD(t);

  // transition fade
  if (G.state === 'transition') {
    const a = Math.sin(G.transT * Math.PI);
    ctx.fillStyle = `rgba(0,0,0,${a})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (G.state === 'descend') {
    const a = clamp(G.descendT / 1.2, 0, 1);
    ctx.fillStyle = `rgba(0,0,0,${a})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (G.state === 'dead') drawDeathScreen();
  if (G.state === 'paused') drawPauseScreen();
}

function drawRoom(t) {
  const room = G.room;
  const isSecret = room.type === 'secret';
  const isBoss = room.type === 'boss';

  // floor slab
  ctx.fillStyle = isSecret ? '#120a20' : isBoss ? '#190b12' : '#16101f';
  ctx.fillRect(0, 0, RW, RH);

  // tile grid w/ ember seams
  for (let tx = 0; tx < COLS; tx++) {
    for (let ty = 0; ty < ROWS; ty++) {
      const n = ((tx * 7 + ty * 13 + room.gx * 31 + room.gy * 17) % 9);
      ctx.fillStyle = n < 2 ? 'rgba(255,255,255,0.018)' : 'rgba(0,0,0,0.06)';
      ctx.fillRect(tx * TILE + 1, ty * TILE + 1, TILE - 2, TILE - 2);
      if (n === 4) {
        ctx.strokeStyle = 'rgba(240,130,10,0.10)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tx * TILE + 12, ty * TILE + TILE - 10);
        ctx.lineTo(tx * TILE + TILE - 14, ty * TILE + 12);
        ctx.stroke();
      }
    }
  }

  // special room floor sigils
  if (room.type === 'treasure') drawFloorSigil(RW / 2, RH / 2, '#f5c842', 8);
  if (room.type === 'shop') drawFloorSigil(RW / 2, RH / 2, '#7ad0a0', 6);
  if (isBoss) drawFloorSigil(RW / 2, RH / 2, '#ff5a2a', 12);
  if (isSecret) drawFloorSigil(RW / 2, RH / 2, '#9a5aff', 5);

  // pits
  room.pits.forEach(([tx, ty]) => {
    ctx.fillStyle = '#050308';
    ctx.fillRect(tx * TILE + 4, ty * TILE + 4, TILE - 8, TILE - 8);
    ctx.strokeStyle = 'rgba(150,60,200,0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(tx * TILE + 4, ty * TILE + 4, TILE - 8, TILE - 8);
    const g2 = ctx.createRadialGradient(tx * TILE + 32, ty * TILE + 40, 0, tx * TILE + 32, ty * TILE + 40, 30);
    g2.addColorStop(0, 'rgba(120,40,200,0.18)');
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(tx * TILE, ty * TILE, TILE, TILE);
  });

  // spikes (solar shards)
  room.spikes.forEach(([tx, ty]) => {
    const cx = tx * TILE + 32, cy = ty * TILE + 32;
    const gp = 0.6 + 0.4 * Math.sin(t * 0.004 + tx);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.5;
      ctx.fillStyle = `rgba(255,${140 + i * 15},40,${0.5 * gp + 0.3})`;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16);
      ctx.lineTo(cx + Math.cos(a + 0.25) * 6, cy + Math.sin(a + 0.25) * 6);
      ctx.lineTo(cx + Math.cos(a) * 4, cy + Math.sin(a) * 4);
      ctx.closePath();
      ctx.fill();
    }
  });

  // rocks (ferrite chunks)
  room.rocks.forEach(r => {
    if (r.hp <= 0) return;
    const x = r.tx * TILE, y = r.ty * TILE;
    ctx.fillStyle = '#2c2438';
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 50);
    ctx.lineTo(x + 6, y + 24);
    ctx.lineTo(x + 22, y + 8);
    ctx.lineTo(x + 46, y + 10);
    ctx.lineTo(x + 56, y + 32);
    ctx.lineTo(x + 50, y + 54);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3c3050';
    ctx.beginPath();
    ctx.moveTo(x + 22, y + 8);
    ctx.lineTo(x + 46, y + 10);
    ctx.lineTo(x + 40, y + 26);
    ctx.lineTo(x + 20, y + 24);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(240,130,10,0.18)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 40); ctx.lineTo(x + 34, y + 30); ctx.lineTo(x + 44, y + 44);
    ctx.stroke();
  });

  // walls
  ctx.fillStyle = '#241832';
  ctx.fillRect(-WALL, -WALL, RW + WALL * 2, WALL);          // N
  ctx.fillRect(-WALL, RH, RW + WALL * 2, WALL);             // S
  ctx.fillRect(-WALL, 0, WALL, RH);                          // W
  ctx.fillRect(RW, 0, WALL, RH);                             // E
  // wall inner edge glow
  ctx.strokeStyle = 'rgba(200,134,10,0.22)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, RW, RH);

  // doors
  Object.entries(DIRS).forEach(([d]) => {
    const n = room.doors[d];
    if (!n) return;
    if (n.type === 'secret' && !n.revealed) return;
    drawDoor(d, room, t);
  });

  // trapdoor
  if (room.trapdoor) {
    const td = room.trapdoor;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(td.x, td.y, 26, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245,200,66,0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(td.x, td.y, 26, 18, 0, 0, Math.PI * 2);
    ctx.stroke();
    const gg = ctx.createRadialGradient(td.x, td.y, 0, td.x, td.y, 40);
    gg.addColorStop(0, 'rgba(245,140,30,0.25)');
    gg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gg;
    ctx.fillRect(td.x - 40, td.y - 40, 80, 80);
  }
}

function drawFloorSigil(x, y, col, rays) {
  ctx.save();
  ctx.globalAlpha = 0.13;
  ctx.strokeStyle = col;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x, y, 70, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, 52, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * 70, y + Math.sin(a) * 70);
    ctx.lineTo(x + Math.cos(a) * 88, y + Math.sin(a) * 88);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDoor(d, room, t) {
  const pos = doorWorldPos(d);
  const open = doorOpen(room, d);
  const n = room.doors[d];
  const locked = roomHostile(room);
  const keyed = open === 'keyed';
  const isSecretDoor = n.type === 'secret';

  ctx.save();
  ctx.translate(pos.x, pos.y);
  if (d === 'E') ctx.rotate(Math.PI / 2);
  if (d === 'S') ctx.rotate(Math.PI);
  if (d === 'W') ctx.rotate(-Math.PI / 2);
  // doorway arch carved in wall
  ctx.fillStyle = '#0c0614';
  ctx.fillRect(-34, -WALL, 68, WALL);
  // frame
  let frameCol = '#c8860a';
  if (n.type === 'treasure') frameCol = '#f5c842';
  if (n.type === 'shop') frameCol = '#7ad0a0';
  if (n.type === 'boss') frameCol = '#ff5a2a';
  if (isSecretDoor) frameCol = '#9a5aff';
  ctx.strokeStyle = frameCol;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-34, 0);
  ctx.lineTo(-34, -40);
  ctx.arc(0, -40, 34, Math.PI, 0);
  ctx.lineTo(34, 0);
  ctx.stroke();

  if (locked) {
    // combat slab
    ctx.fillStyle = '#332244';
    ctx.fillRect(-30, -52, 60, 52);
    ctx.strokeStyle = 'rgba(255,90,42,0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, -38); ctx.lineTo(18, -14);
    ctx.moveTo(18, -38); ctx.lineTo(-18, -14);
    ctx.stroke();
  } else if (keyed) {
    ctx.fillStyle = '#2a2036';
    ctx.fillRect(-30, -52, 60, 52);
    // sigil keyhole
    ctx.strokeStyle = '#ffd24a';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, -32, 9, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(0, -12); ctx.stroke();
  } else {
    // open glow
    const gg = ctx.createLinearGradient(0, -WALL, 0, 0);
    gg.addColorStop(0, 'rgba(0,0,0,0)');
    gg.addColorStop(1, `rgba(245,200,66,${0.12 + 0.05 * Math.sin(t * 0.003)})`);
    ctx.fillStyle = gg;
    ctx.fillRect(-30, -WALL, 60, WALL);
  }
  ctx.restore();
}

// ───────────────────────────────────────
//  ENTITY RENDERING (all original designs)
// ───────────────────────────────────────
function drawEntities(t) {
  const room = G.room;

  // pickups
  room.pickups.forEach(p => {
    const bob = Math.sin(t * 0.005 + p.x) * 3;
    drawPickup(p.type, p.x, p.y + bob);
  });

  // pedestals
  room.pedestals.forEach(ped => drawPedestal(ped, t));

  // bombs
  room.bombsLive.forEach(b => {
    const flash = b.fuse < 0.5 ? Math.sin(t * 0.05) > 0 : false;
    ctx.fillStyle = flash ? '#ff8a5a' : '#2c2438';
    ctx.beginPath(); ctx.arc(b.x, b.y, 13, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f5c842';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(b.x, b.y, 13, 0, Math.PI * 2); ctx.stroke();
    // fuse spark
    ctx.fillStyle = '#fff3c0';
    ctx.beginPath(); ctx.arc(b.x + 8, b.y - 12, 3 + Math.random() * 2, 0, Math.PI * 2); ctx.fill();
  });

  // enemies
  room.enemies.forEach(e => { if (!e.dead) drawEnemy(e, t); });

  // player bolts (solar bolts)
  G.bolts.forEach(b => {
    const gg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 2.2);
    gg.addColorStop(0, 'rgba(255,240,190,0.95)');
    gg.addColorStop(0.45, 'rgba(245,180,50,0.8)');
    gg.addColorStop(1, 'rgba(200,80,10,0)');
    ctx.fillStyle = gg;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff8e0';
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 0.55, 0, Math.PI * 2); ctx.fill();
  });

  // enemy bolts (slag globs)
  G.ebolts.forEach(b => {
    const gg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 2);
    gg.addColorStop(0, 'rgba(255,120,60,0.95)');
    gg.addColorStop(1, 'rgba(160,20,10,0)');
    ctx.fillStyle = gg;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#601510';
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 0.6, 0, Math.PI * 2); ctx.fill();
  });

  // orbitals
  if (G.stats.orbital > 0) {
    for (let i = 0; i < G.stats.orbital; i++) {
      const a = G.orbitalA + (i / G.stats.orbital) * Math.PI * 2;
      const ox = G.px + Math.cos(a) * 55, oy = G.py + Math.sin(a) * 55;
      ctx.fillStyle = 'rgba(255,210,74,0.9)';
      ctx.beginPath(); ctx.arc(ox, oy, 7, 0, Math.PI * 2); ctx.fill();
      for (let k = 0; k < 6; k++) {
        const ra = (k / 6) * Math.PI * 2 + t * 0.01;
        ctx.strokeStyle = 'rgba(255,210,74,0.5)';
        ctx.beginPath();
        ctx.moveTo(ox + Math.cos(ra) * 8, oy + Math.sin(ra) * 8);
        ctx.lineTo(ox + Math.cos(ra) * 12, oy + Math.sin(ra) * 12);
        ctx.stroke();
      }
    }
  }

  // player knight
  ctx.save();
  ctx.translate(G.px, G.py);
  if (G.iframes > 0 && Math.sin(t * 0.04) > 0) ctx.globalAlpha = 0.4;
  ctx.scale(0.42, 0.42);
  ctx.translate(0, 8);
  Knight.draw(ctx, t, G.knight);
  ctx.restore();

  // fx
  G.fx.forEach(p => {
    ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
    ctx.fillStyle = p.col;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;

  // floaters
  G.floats.forEach(f => {
    ctx.globalAlpha = clamp(f.life, 0, 1);
    ctx.font = '600 16px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = f.col;
    ctx.fillText(f.txt, f.x, f.y);
  });
  ctx.globalAlpha = 1;
}

function drawPickup(type, x, y) {
  switch (type) {
    case 'heart': { // stellar heart: small radiant sun
      const gg = ctx.createRadialGradient(x, y, 0, x, y, 16);
      gg.addColorStop(0, 'rgba(255,120,90,0.9)');
      gg.addColorStop(1, 'rgba(200,30,30,0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff5a4a';
      ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffd0c0';
      ctx.beginPath(); ctx.arc(x - 2.5, y - 2.5, 2.6, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'solari': case 'solari5': {
      const big = type === 'solari5';
      ctx.fillStyle = '#f5c842';
      ctx.beginPath(); ctx.arc(x, y, big ? 12 : 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#8a5a08';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, big ? 8 : 5, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#8a5a08';
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'novaCharge': {
      ctx.fillStyle = '#2c2438';
      ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#f5c842';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#ff8a3a';
      ctx.beginPath(); ctx.moveTo(x + 4, y - 9); ctx.lineTo(x + 8, y - 14); ctx.stroke();
      break;
    }
    case 'sigil': {
      ctx.strokeStyle = '#ffd24a';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(x, y - 4, 5, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y + 1); ctx.lineTo(x, y + 11); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y + 7); ctx.lineTo(x + 4, y + 7); ctx.stroke();
      break;
    }
  }
}

function drawPedestal(ped, t) {
  const { x, y } = ped;
  const ecl = ped.eclipse;
  // slab
  ctx.fillStyle = ecl ? '#1c1030' : '#3a2c50';
  ctx.beginPath();
  ctx.moveTo(x - 24, y + 18); ctx.lineTo(x + 24, y + 18);
  ctx.lineTo(x + 18, y - 2); ctx.lineTo(x - 18, y - 2);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = ecl ? '#2a1846' : '#4c3a68';
  ctx.fillRect(x - 18, y - 6, 36, 6);

  const bob = Math.sin(t * 0.004 + x) * 4;
  const iy = y - 30 + bob;
  // aura
  const gg = ctx.createRadialGradient(x, iy, 0, x, iy, 36);
  gg.addColorStop(0, ecl ? 'rgba(154,90,255,0.35)' : 'rgba(245,200,66,0.3)');
  gg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gg;
  ctx.fillRect(x - 36, iy - 36, 72, 72);

  if (ped.kind === 'item') drawRelicIcon(ped.item, x, iy, t);
  else drawPickup(ped.pickup, x, iy);

  if (ped.cost > 0) {
    ctx.font = '500 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f5c842';
    ctx.fillText(`${ped.cost}◉`, x, y + 38);
  }
  if (ecl) {
    ctx.font = '500 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#b06aff';
    ctx.fillText('COST: ONE SUN', x, y + 38);
  }
}

// Original relic icon: deterministic geometric glyph per item id
function drawRelicIcon(id, x, y, t) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const hue = (h % 70) + 20; // warm band 20-90
  const sides = 3 + (h >> 4) % 4;
  const spin = ((h >> 8) % 2 ? 1 : -1) * t * 0.0012;
  const r1 = 13 + (h >> 6) % 5;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(spin);
  ctx.strokeStyle = `hsl(${hue},85%,62%)`;
  ctx.fillStyle = `hsla(${hue},85%,55%,0.25)`;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
    i === 0 ? ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1) : ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // core
  ctx.fillStyle = `hsl(${hue},95%,78%)`;
  ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
  // satellite tick
  const sa = t * 0.003;
  ctx.fillStyle = `hsl(${hue},90%,70%)`;
  ctx.beginPath(); ctx.arc(Math.cos(sa) * (r1 + 7), Math.sin(sa) * (r1 + 7), 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawEnemy(e, t) {
  ctx.save();
  ctx.translate(e.x, e.y);
  const flash = e.hitFlash > 0;

  switch (e.kind) {
    case 'emberMote': {
      const fl = Math.sin(e.t * 6) * 3;
      const gg = ctx.createRadialGradient(0, fl, 0, 0, fl, 20);
      gg.addColorStop(0, 'rgba(255,150,50,0.7)');
      gg.addColorStop(1, 'rgba(180,40,10,0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(0, fl, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = flash ? '#fff' : '#e86a20';
      ctx.beginPath();
      ctx.moveTo(0, fl - 14);
      ctx.bezierCurveTo(9, fl - 4, 8, fl + 6, 0, fl + 10);
      ctx.bezierCurveTo(-8, fl + 6, -9, fl - 4, 0, fl - 14);
      ctx.fill();
      ctx.fillStyle = '#ffe9b0';
      ctx.beginPath(); ctx.arc(0, fl + 2, 4, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'pyreWisp': {
      const gg = ctx.createRadialGradient(0, 0, 0, 0, 0, 22);
      gg.addColorStop(0, 'rgba(120,200,255,0.5)');
      gg.addColorStop(1, 'rgba(40,60,180,0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = flash ? '#fff' : '#5a8ae0';
      for (let i = 0; i < 3; i++) {
        const a = e.t * 2 + (i / 3) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * 6, Math.sin(a) * 6, 7, 5, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#dff0ff';
      ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'slagHusk': {
      const lurch = Math.sin(e.t * 4) * 2;
      ctx.fillStyle = flash ? '#fff' : '#4a2c20';
      ctx.beginPath();
      ctx.moveTo(-16, 16);
      ctx.bezierCurveTo(-20, -8 + lurch, -10, -22 + lurch, 0, -20 + lurch);
      ctx.bezierCurveTo(12, -22 + lurch, 20, -6, 16, 16);
      ctx.closePath(); ctx.fill();
      // magma cracks
      ctx.strokeStyle = '#ff7a2a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, 10); ctx.lineTo(-2, -2 + lurch); ctx.lineTo(6, 6);
      ctx.moveTo(4, -12 + lurch); ctx.lineTo(8, -2);
      ctx.stroke();
      // eyes
      ctx.fillStyle = '#ffb24a';
      ctx.beginPath(); ctx.arc(-5, -8 + lurch, 2.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(6, -8 + lurch, 2.6, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'ventCrawler': {
      const a = { N: -Math.PI / 2, E: 0, S: Math.PI / 2, W: Math.PI }[e.dir];
      ctx.rotate(a);
      ctx.fillStyle = flash ? '#fff' : '#3a4030';
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      // legs
      ctx.strokeStyle = '#5a6648';
      ctx.lineWidth = 2.5;
      for (let i = -1; i <= 1; i++) {
        const wig = Math.sin(e.t * 14 + i) * 4;
        ctx.beginPath(); ctx.moveTo(i * 8, -8); ctx.lineTo(i * 8 + wig, -16); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(i * 8, 8); ctx.lineTo(i * 8 - wig, 16); ctx.stroke();
      }
      ctx.fillStyle = '#c0e040';
      ctx.beginPath(); ctx.arc(10, 0, 3, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'ashTick': {
      const squash = e.hopping > 0 ? 1.25 : 1 + Math.sin(e.t * 5) * 0.06;
      ctx.scale(1 / squash, squash);
      ctx.fillStyle = flash ? '#fff' : '#6a6a72';
      ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9a9aa4';
      ctx.beginPath(); ctx.arc(0, -4, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff8a4a';
      ctx.beginPath(); ctx.arc(-3, -4, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(3, -4, 1.8, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'flareNode': {
      const pul = 1 + Math.sin(e.t * 3) * 0.1;
      ctx.fillStyle = flash ? '#fff' : '#503040';
      ctx.beginPath();
      for (let i = 0; i <= 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const rr = 17 * pul;
        i === 0 ? ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath(); ctx.fill();
      const gg = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
      gg.addColorStop(0, '#ffd24a');
      gg.addColorStop(1, '#c03010');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(0, 0, 8 * pul, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'cinderling': {
      ctx.fillStyle = flash ? '#fff' : '#d04818';
      ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffd24a';
      ctx.beginPath(); ctx.arc(0, -2, 3.5, 0, Math.PI * 2); ctx.fill();
      // trailing sparks
      ctx.fillStyle = 'rgba(255,140,60,0.5)';
      ctx.beginPath(); ctx.arc(-e.vx * 0.03, -e.vy * 0.03, 5, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'ignis': {
      // ITS silhouette from the title strip, realized: molten orb + rotating obsidian spikes
      const ph2 = e.hp < e.maxHp * 0.5;
      const tele = e.mode === 'telegraph';
      // spikes
      for (let i = 0; i < 8; i++) {
        const a = e.spin + (i / 8) * Math.PI * 2;
        const len = e.r + (ph2 ? 34 : 22) + Math.sin(e.t * 3 + i) * 4;
        ctx.strokeStyle = tele ? '#fff' : '#1c1024';
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * e.r * 0.7, Math.sin(a) * e.r * 0.7);
        ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
        ctx.stroke();
        ctx.strokeStyle = tele ? '#ffd24a' : '#3c2c50';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * e.r * 0.7, Math.sin(a) * e.r * 0.7);
        ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
        ctx.stroke();
      }
      // molten body
      const gg = ctx.createRadialGradient(-10, -12, 0, 0, 0, e.r);
      gg.addColorStop(0, flash ? '#fff' : '#ffd24a');
      gg.addColorStop(0.5, '#e86010');
      gg.addColorStop(1, '#601808');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(0, 0, e.r, 0, Math.PI * 2); ctx.fill();
      // surface cracks
      ctx.strokeStyle = 'rgba(40,8,4,0.6)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        const a = e.spin * 0.5 + i * 1.7;
        ctx.beginPath();
        ctx.arc(0, 0, e.r * 0.72, a, a + 0.9);
        ctx.stroke();
      }
      // eye: a furious slit
      ctx.fillStyle = '#1a0a10';
      ctx.beginPath();
      ctx.ellipse(0, -6, 16, ph2 ? 12 : 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = ph2 ? '#ff4a2a' : '#ffd24a';
      ctx.beginPath();
      ctx.ellipse(0, -6, 5, ph2 ? 10 : 6, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

// ───────────────────────────────────────
//  HUD
// ───────────────────────────────────────
function drawHUD(t) {
  const W = canvas.width;
  ctx.save();
  ctx.textAlign = 'left';

  // hearts (suns)
  const hx = 26, hy = 30;
  for (let i = 0; i < G.run.maxHearts; i++) {
    const filled = G.run.hearts - i * 2; // 2=full 1=half
    const x = hx + i * 30, y = hy;
    ctx.strokeStyle = 'rgba(245,200,66,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.stroke();
    if (filled >= 1) {
      ctx.fillStyle = '#f5c842';
      if (filled >= 2) { ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill(); }
      else { ctx.beginPath(); ctx.arc(x, y, 8, Math.PI / 2, Math.PI * 1.5); ctx.fill(); }
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        if (filled < 2 && Math.cos(a) > 0.01) continue;
        ctx.strokeStyle = 'rgba(245,200,66,0.8)';
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * 11, y + Math.sin(a) * 11);
        ctx.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14);
        ctx.stroke();
      }
    }
  }

  // counters
  ctx.font = '500 15px "JetBrains Mono", monospace';
  ctx.fillStyle = '#e8d4a0';
  drawPickup('solari', 34, 64);
  ctx.fillText(String(G.run.coins).padStart(2, '0'), 52, 69);
  drawPickup('novaCharge', 34, 92);
  ctx.fillText(String(G.run.bombs).padStart(2, '0'), 52, 97);
  drawPickup('sigil', 34, 116);
  ctx.fillText(String(G.run.keys).padStart(2, '0'), 52, 125);

  // floor label
  ctx.font = '600 12px Cinzel, serif';
  ctx.fillStyle = 'rgba(200,160,80,0.7)';
  ctx.fillText(floorTitle(G.depth), 24, canvas.height - 22);
  ctx.font = '500 11px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(200,160,80,0.45)';
  ctx.fillText(`relics ${G.run.items.length} · kills ${G.killCount}`, 24, canvas.height - 40);

  drawMinimap();

  // boss bar
  const boss = G.room.enemies.find(e => e.boss && !e.dead);
  if (boss) {
    const bw = Math.min(520, canvas.width * 0.5);
    const bx = (canvas.width - bw) / 2, by = canvas.height - 56;
    ctx.fillStyle = 'rgba(10,5,16,0.8)';
    ctx.fillRect(bx - 4, by - 4, bw + 8, 22);
    ctx.strokeStyle = 'rgba(255,90,42,0.6)';
    ctx.strokeRect(bx - 4, by - 4, bw + 8, 22);
    const frac = clamp(boss.hp / boss.maxHp, 0, 1);
    const gg = ctx.createLinearGradient(bx, 0, bx + bw, 0);
    gg.addColorStop(0, '#ff5a2a');
    gg.addColorStop(1, '#ffd24a');
    ctx.fillStyle = gg;
    ctx.fillRect(bx, by, bw * frac, 14);
    ctx.font = '600 13px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe8c0';
    ctx.fillText('IGNIS · WARDEN OF MERCURY', canvas.width / 2, by - 12);
    ctx.textAlign = 'left';
  }

  // banner
  if (G.bannerT > 0 && G.banner) {
    const a = clamp(G.bannerT, 0, 1);
    ctx.globalAlpha = a;
    ctx.textAlign = 'center';
    ctx.font = '700 26px "Cinzel Decorative", serif';
    ctx.fillStyle = '#f5c842';
    ctx.shadowColor = 'rgba(245,200,66,0.6)';
    ctx.shadowBlur = 18;
    ctx.fillText(G.banner.big, canvas.width / 2, 110);
    ctx.shadowBlur = 0;
    ctx.font = 'italic 600 14px Cinzel, serif';
    ctx.fillStyle = '#c8a060';
    ctx.fillText(G.banner.small, canvas.width / 2, 136);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  // floor title card
  if (G.titleCardT > 0) {
    const a = clamp(Math.min(G.titleCardT, 3 - G.titleCardT) * 1.2, 0, 1);
    ctx.globalAlpha = a;
    ctx.textAlign = 'center';
    ctx.font = '900 38px "Cinzel Decorative", serif';
    ctx.fillStyle = '#fff3d0';
    ctx.shadowColor = 'rgba(240,130,10,0.7)';
    ctx.shadowBlur = 26;
    ctx.fillText(floorTitle(G.depth), canvas.width / 2, canvas.height * 0.4);
    ctx.shadowBlur = 0;
    ctx.font = '500 12px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(200,160,80,0.8)';
    ctx.fillText('WASD move · ARROWS fire · E nova charge · ESC pause', canvas.width / 2, canvas.height * 0.4 + 34);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }
  ctx.restore();
}

function drawMinimap() {
  const cell = 17, gap = 2;
  const mx = canvas.width - GRID * (cell + gap) - 24, my = 24;
  ctx.save();
  ctx.globalAlpha = 0.92;
  G.floor.cells.forEach(room => {
    if (!room.seen && !room.visited) return;
    if (room.type === 'secret' && !room.revealed) return;
    const x = mx + room.gx * (cell + gap), y = my + room.gy * (cell + gap);
    const cur = room === G.room;
    ctx.fillStyle = cur ? 'rgba(245,200,66,0.95)' :
      room.visited ? 'rgba(120,90,160,0.55)' : 'rgba(60,45,90,0.45)';
    ctx.fillRect(x, y, cell, cell);
    let mark = null, mcol = '#0d0716';
    if (room.type === 'treasure') { mark = '◆'; mcol = cur ? '#0d0716' : '#f5c842'; }
    if (room.type === 'shop') { mark = '◉'; mcol = cur ? '#0d0716' : '#7ad0a0'; }
    if (room.type === 'boss') { mark = '▲'; mcol = cur ? '#0d0716' : '#ff5a2a'; }
    if (room.type === 'secret') { mark = '?'; mcol = '#9a5aff'; }
    if (mark) {
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = mcol;
      ctx.fillText(mark, x + cell / 2, y + cell / 2 + 4);
    }
  });
  ctx.restore();
  ctx.textAlign = 'left';
}

function drawDeathScreen() {
  const a = clamp(G.deadT * 0.7, 0, 0.88);
  ctx.fillStyle = `rgba(2,0,4,${a})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (G.deadT > 0.8) {
    ctx.textAlign = 'center';
    ctx.font = '900 52px "Cinzel Decorative", serif';
    ctx.fillStyle = '#c8401a';
    ctx.shadowColor = 'rgba(200,60,10,0.7)';
    ctx.shadowBlur = 30;
    ctx.fillText('THE SUN REMEMBERS', canvas.width / 2, canvas.height * 0.42);
    ctx.shadowBlur = 0;
    ctx.font = '500 14px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(220,180,120,0.8)';
    ctx.fillText(`fell in ${floorShort(G.depth).toLowerCase()} · ${G.killCount} foes unmade · ${G.run.items.length} relics carried`, canvas.width / 2, canvas.height * 0.42 + 40);
    if (G.deadT > 1.6) {
      ctx.font = '600 16px Cinzel, serif';
      ctx.fillStyle = `rgba(245,200,66,${0.5 + 0.5 * Math.sin(G.deadT * 4)})`;
      ctx.fillText('PRESS ENTER', canvas.width / 2, canvas.height * 0.42 + 90);
    }
    ctx.textAlign = 'left';
  }
}

function drawPauseScreen() {
  ctx.fillStyle = 'rgba(2,0,6,0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.font = '700 34px "Cinzel Decorative", serif';
  ctx.fillStyle = '#f5c842';
  ctx.fillText('HELD IN STASIS', canvas.width / 2, canvas.height * 0.36);
  ctx.font = '600 15px Cinzel, serif';
  ctx.fillStyle = '#d4a84b';
  ctx.fillText('ESC — RESUME', canvas.width / 2, canvas.height * 0.36 + 50);
  ctx.fillText('Q — RETURN TO TITLE (PROGRESS KEPT)', canvas.width / 2, canvas.height * 0.36 + 80);
  // relic inventory
  if (G.run.items.length) {
    ctx.font = '500 12px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(220,190,140,0.8)';
    const names = G.run.items.map(id => ITEMS[id] ? ITEMS[id].name : id).join(' · ');
    ctx.fillText(`RELICS: ${names}`.slice(0, 140), canvas.width / 2, canvas.height * 0.36 + 130);
  }
  ctx.textAlign = 'left';
}

// ───────────────────────────────────────
//  LOOP + INPUT
// ───────────────────────────────────────
let lastT = 0;
function gameLoop(t) {
  if (!G.active) return;
  const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
  lastT = t;
  update(dt);
  render(t);
  requestAnimationFrame(gameLoop);
}

function initCanvas() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
}

function onKey(e, down) {
  if (!G.active) return;
  const k = e.key.toLowerCase();
  keys[k] = down;
  if (!down) return;
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();

  if (G.state === 'dead') {
    if (k === 'enter') { exitToTitle(); }
    return;
  }
  if (k === 'escape' || k === 'p') {
    if (G.state === 'play') G.state = 'paused';
    else if (G.state === 'paused') G.state = 'play';
  }
  if (G.state === 'paused' && k === 'q') {
    saveGame();
    exitToTitle();
  }
  if (G.state === 'play' && (k === 'e' || k === ' ')) placeBomb();
  if (k === 'm' && window.SolarisAudio) {
    const g = window.SolarisAudio.music.gain;
    g.value = g.value > 0 ? 0 : 0.7;
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('keydown', e => onKey(e, true));
  document.addEventListener('keyup', e => onKey(e, false));
}

// ───────────────────────────────────────
//  EXPORTS
// ───────────────────────────────────────
if (typeof window !== 'undefined') {
  window.SolarisKnight = Knight;
  window.SolarisSaves = Saves;
  window.SolarisGame = { start: startGame, G };
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { genFloor, computeStats, ITEMS, POOLS, baseStats, makeEnemy, LAYOUTS, GRID, Saves };
}

})();
