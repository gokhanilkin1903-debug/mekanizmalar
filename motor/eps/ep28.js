// Theo Jansen leg (two mirrored legs) with foot path
import { THREE, TAU, cylZ, phase, fmtN, fade, TL } from '../engine.js';
const K = 0.052, NUM = { a: 38, b: 41.5, c: 39.3, d: 40.1, e: 55.8, f: 39.4, g: 36.7, h: 65.7, i: 49, j: 50, k: 61.9, l: 7.8, m: 15 };
const Q = Object.fromEntries(Object.entries(NUM).map(([k, v]) => [k, v * K]));
const W = 1.6, OY = 1.0;
const ci = (P1, r1, P2, r2) => { const dx = P2[0] - P1[0], dy = P2[1] - P1[1], d = Math.hypot(dx, dy), a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, r1 * r1 - a * a)), mx = P1[0] + a * dx / d, my = P1[1] + a * dy / d; return [[mx - h * dy / d, my + h * dx / d], [mx + h * dy / d, my - h * dx / d]]; };
const pick = (s, f) => (f(s[0]) < f(s[1]) ? s[0] : s[1]);
function leg(th, mir) { // left leg; mirrored by flipping x
  const Mx = Q.m * Math.cos(th), My = Q.m * Math.sin(th), Mm = [mir ? -Mx : Mx, My], B = [-Q.a, -Q.l];
  const J = pick(ci(Mm, Q.j, B, Q.b), p => -p[1]), Kk = pick(ci(Mm, Q.k, B, Q.c), p => p[1]);
  const E = pick(ci(B, Q.d, J, Q.e), p => p[0]), F = pick(ci(E, Q.f, Kk, Q.g), p => p[0]), H = pick(ci(F, Q.h, Kk, Q.i), p => p[1]);
  const f = p => [mir ? -p[0] : p[0], p[1] + OY];
  return { M: f(Mm), B: f(B), J: f(J), K: f(Kk), E: f(E), F: f(F), H: f(H), O: [0, OY] };
}
const FOOTY = (() => { let mn = 1e9; for (let i = 0; i < 360; i++) mn = Math.min(mn, leg(i / 360 * TAU, false).H[1]); return mn; })();
const BARS = [['O', 'M'], ['M', 'J'], ['M', 'K'], ['B', 'J'], ['B', 'K'], ['B', 'E'], ['J', 'E'], ['E', 'F'], ['F', 'K'], ['K', 'H'], ['F', 'H']];
let S = {};
export default {
  id: '28',
  view: { az: 0, el: 8, dist: 27, target: [0, -0.4, 0], orbit: 0.5, caz: -22, cel: 6, cdist: 11, ctarget: [-1.7, -2.2, 0], low: 0.15, lowDist: 1.2 },
  floorY: FOOTY - 0.12,
  text: {
    tr: { hook: 'Rüzgarla yürüyen<br>heykeller', hookSub: 'Jansen bacağı', labels: ['Krank (motor)', 'Sabit mafsal', 'Üçgen bağlantı', 'Ayak'],
      c1: 'Tek krank, 11 çubuk', c2a: 'Krank döner, bacak adım atar', c2b: 'Ayak yerde <b>dümdüz</b> ilerler',
      c3a: 'Havadayken hızla geri döner', c3b: 'Böylece gövde<br><b>sarsılmadan</b> yürür', fbig: 'Kutsal sayılar', fsub: 'Theo Jansen bu çubuk boylarını<br>bilgisayarda evrimle buldu',
      uses: ['Strandbeest heykelleri', 'Yürüyen robotlar', 'Eğitim kitleri ve oyuncaklar', 'Engebeli arazi araç prototipleri'] },
    en: { hook: 'Sculptures that walk<br>on the wind', hookSub: 'The Jansen linkage', labels: ['Crank (motor)', 'Fixed pivot', 'Triangle link', 'Foot'],
      c1: 'One crank, 11 bars', c2a: 'The crank turns,<br>the leg takes steps', c2b: 'On the ground the foot<br>moves <b>flat</b>',
      c3a: 'In the air it swings<br>back quickly', c3b: 'So the body walks<br><b>without bouncing</b>', fbig: 'The holy numbers', fsub: 'Theo Jansen found these lengths<br>by computer evolution',
      uses: ['Strandbeest sculptures', 'Walking robots', 'Educational kits and toys', 'Rough-terrain prototypes'] },
  },
  kin(t) { const ph = phase(t), th = -W * ph; return { ph, th, L: leg(th, false), R: leg(th, true) }; },
  labels: [
    { c: '#ffcf5c', mat: 'gold', at: [830, 330], p: k => [k.L.M[0], k.L.M[1], 0.5] },
    { c: '#c9d1dc', mat: 'block', at: [250, 330], p: k => [k.L.B[0], k.L.B[1], 0.4] },
    { c: '#6fe0a4', mat: 'green', at: [250, 900], p: k => [(k.L.B[0] + k.L.J[0] + k.L.E[0]) / 3, (k.L.B[1] + k.L.J[1] + k.L.E[1]) / 3, 0.4] },
    { c: '#ff9d8a', mat: 'red', at: [250, 1450], p: k => [k.L.H[0], k.L.H[1], 0.4] },
  ],
  counters: [
    { label: { tr: 'Krank', en: 'Crank' }, c: '#ffcf5c', fn: (t, L) => fmtN(W * (phase(t) - phase(Math.min(t, TL.cnt0))) / TAU, 2, L) + (L === 'tr' ? ' tur' : ' turns') },
    { label: { tr: 'Adım', en: 'Steps' }, c: '#ff9d8a', fn: t => String(Math.floor(2 * W * (phase(t) - phase(Math.min(t, TL.cnt0))) / TAU)) },
  ],
  overlay(t, k, ctx) {
    let out = '';
    for (const mir of [false, true]) { const pts = []; for (let i = 0; i <= 140; i++) { const th = k.th + TAU * i / 140, H = leg(th, mir).H, [x, y] = ctx.project([H[0], H[1], 0.6]); pts.push(`${x.toFixed(1)},${y.toFixed(1)}`); }
      out += `<polyline points="${pts.join(' ')}" fill="none" stroke="${mir ? '#7fb0ff' : '#ff7ad9'}" stroke-width="6" stroke-dasharray="${mir ? '10 8' : 'none'}" opacity="${0.35 + 0.6 * fade(t, 10.3, 40, 0.6)}"/>`; }
    return out;
  },
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    S.legs = [false, true].map(mir => {
      const z = mir ? -0.5 : 0.35, mt = mir ? mats.blue : mats.green;
      const bars = BARS.map(([a, b]) => { const g = M(new THREE.BoxGeometry(1, 0.17, 0.12), a === 'O' ? mats.gold : (b === 'H' ? mats.red : mt)); g.position.z = z; scene.add(g); return { g, a, b }; });
      const pins = ['M', 'J', 'K', 'E', 'F', 'B'].map(n => { const p = M(cylZ(0.09, 0.3, 12), mats.steel); p.position.z = z; scene.add(p); return { p, n }; });
      const foot = M(new THREE.SphereGeometry(0.2, 16, 12), mats.red); foot.position.z = z; scene.add(foot);
      return { bars, pins, foot, mir };
    });
    const crank = M(cylZ(Q.m + 0.25, 0.2, 40), mats.gold); crank.position.set(0, OY, -0.08); scene.add(crank); S.crank = crank;
    const frame = M(new THREE.BoxGeometry(2 * Q.a + 0.6, 0.35, 0.3), mats.block); frame.position.set(0, OY - Q.l / 2, -0.08); scene.add(frame);
    const mast = M(new THREE.BoxGeometry(0.4, 2.0, 0.3), mats.block); mast.position.set(0, OY + 1.0, -0.08); scene.add(mast);
    const top = M(new THREE.BoxGeometry(2 * Q.a + 1.2, 0.3, 1.2), mats.block); top.position.set(0, OY + 2.0, -0.08); scene.add(top);
    const ground = M(new THREE.BoxGeometry(14, 0.1, 2.4), mats.dark); ground.position.set(0, FOOTY - 0.25, 0); scene.add(ground);
    ctx.arrow(0xffcf5c, 1.6, [0, OY, 0.6], [0, 0, 1], -1, scene, 0.8);
  },
  update(k) {
    for (const lg of S.legs) { const P = lg.mir ? k.R : k.L;
      for (const { g, a, b } of lg.bars) { const p = P[a], q = P[b]; g.position.x = (p[0] + q[0]) / 2; g.position.y = (p[1] + q[1]) / 2; g.scale.x = Math.hypot(q[0] - p[0], q[1] - p[1]) + 0.12; g.rotation.z = Math.atan2(q[1] - p[1], q[0] - p[0]); }
      for (const { p, n } of lg.pins) p.position.set(P[n][0], P[n][1], p.position.z);
      lg.foot.position.set(P.H[0], P.H[1], lg.foot.position.z); }
    S.crank.rotation.z = k.th;
  },
};
