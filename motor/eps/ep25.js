// Peaucellier–Lipkin straight-line linkage
import { THREE, TAU, cylZ, phase, fmtN, fade, TL } from '../engine.js';
const O = [-1.0, 0], O2 = [0.2, 0], A_ = 1.2, LL = 3.0, SS = 2.0, KI = LL * LL - SS * SS, XL = O[0] + KI / (2 * A_), WF = 0.9, PM = 1.8;
const ci = (P1, r1, P2, r2) => { const dx = P2[0] - P1[0], dy = P2[1] - P1[1], d = Math.hypot(dx, dy), a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, r1 * r1 - a * a)), mx = P1[0] + a * dx / d, my = P1[1] + a * dy / d; return [[mx - h * dy / d, my + h * dx / d], [mx + h * dy / d, my - h * dx / d]]; };
function kinAt(ph) {
  const f = PM * Math.sin(WF * ph), A = [O2[0] + A_ * Math.cos(f), O2[1] + A_ * Math.sin(f)];
  const [B, Dd] = ci(O, LL, A, SS), P = [B[0] + Dd[0] - A[0], B[1] + Dd[1] - A[1]];
  return { f, A, B, D: Dd, P };
}
let S = {};
export default {
  id: '25',
  view: { az: 0, el: 8, dist: 22, target: [0.0, 0.0, 0], orbit: 0.45, caz: -20, cel: 6, cdist: 12, ctarget: [0.6, 0.4, 0], low: 0.2, lowDist: 1.3 },
  floorY: -3.8,
  text: {
    tr: { hook: 'Dönen çubuklarla<br>kusursuz düz çizgi', hookSub: 'Peaucellier–Lipkin bağlantısı', labels: ['Eşkenar dörtgen', 'Düz çizgi çizen nokta', 'Sabit mafsallar', 'Krank (sürücü)'],
      c1: '7 çubuk, 2 sabit nokta', c2a: 'Krank bir yay çizer', c2b: 'Kırmızı nokta ise<br><b>tam düz</b> gider',
      c3a: 'Sır: geometrik ters çevirme', c3b: 'Daire, <b>düz çizgiye</b> dönüşür', fbig: '|OA| · |OP| = sabit', fsub: '1864’te bulunan ilk kusursuz<br>düz çizgi mekanizması',
      uses: ['19. yüzyıl buhar makineleri', 'Hassas çizim aletleri', 'Robot mekanizmaları', 'Geometri eğitimi'] },
    en: { hook: 'A perfect straight line<br>from pivoting bars', hookSub: 'The Peaucellier–Lipkin linkage', labels: ['Rhombus', 'Straight-line point', 'Fixed pivots', 'Crank (driver)'],
      c1: '7 bars, 2 fixed pivots', c2a: 'The crank swings along an arc', c2b: 'The red point moves in a<br><b>perfectly straight</b> line',
      c3a: 'The secret: geometric inversion', c3b: 'A circle turns into<br>a <b>straight line</b>', fbig: '|OA| · |OP| = const', fsub: 'Found in 1864: the first exact<br>straight-line linkage',
      uses: ['19th-century steam engines', 'Precision drawing tools', 'Robot mechanisms', 'Geometry teaching'] },
  },
  kin(t) { const ph = phase(t); return { ph, ...kinAt(ph) }; },
  labels: [
    { c: '#6fe0a4', mat: 'green', at: [250, 330], p: k => [(k.A[0] + k.P[0]) / 2, (k.A[1] + k.P[1]) / 2 + 0.6, 0.4] },
    { c: '#ff9d8a', mat: 'red', at: [830, 330], p: k => [k.P[0], k.P[1], 0.6] },
    { c: '#c9d1dc', mat: 'block', at: [250, 1450], p: [O[0], O[1] - 0.4, 0.3] },
    { c: '#7fb0ff', mat: 'blue', at: [830, 1450], p: k => [(O2[0] + k.A[0]) / 2, (O2[1] + k.A[1]) / 2, 0.5] },
  ],
  counters: [
    { label: { tr: 'Düz çizgiden sapma', en: 'Deviation from line' }, c: '#ff9d8a', fn: (t, L, k) => fmtN(Math.abs(k.P[0] - XL) * 10, 3, L) + ' mm' },
    { label: { tr: 'Nokta konumu', en: 'Point position' }, c: '#6fe0a4', fn: (t, L, k) => { const v = Math.round(k.P[1] * 10); return (v > 0 ? '+' : '') + v + ' mm'; } },
  ],
  overlay(t, k, ctx) {
    const a = ctx.project([XL, -3.0, 0.3]), b = ctx.project([XL, 3.0, 0.3]);
    const o = fade(t, 10.3, 40, 0.6); let out = '';
    if (o > 0.01) out += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#ff9d8a" stroke-width="4" stroke-dasharray="12 10" opacity="${o * 0.8}"/>`;
    const pts = []; for (let i = 0; i <= 160; i++) { const ph = k.ph - (TAU / WF) * i / 160; if (ph < 0) break; const q = kinAt(ph), [x, y] = ctx.project([q.P[0], q.P[1], 0.55]); pts.push(`${x.toFixed(1)},${y.toFixed(1)}`); }
    out += `<polyline points="${pts.join(' ')}" fill="none" stroke="#ff7ad9" stroke-width="8" stroke-linecap="round" opacity="0.9"/>`;
    return out;
  },
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    const bar = (mt, z, w = 0.26) => { const b = M(new THREE.BoxGeometry(1, w, 0.12), mt); b.position.z = z; scene.add(b); return b; };
    S.bars = { OB: bar(mats.gold, 0.0), OD: bar(mats.gold, 0.0), AB: bar(mats.green, 0.18), AD: bar(mats.green, 0.18), BP: bar(mats.green, 0.36), DP: bar(mats.green, 0.36), OA: bar(mats.blue, -0.18, 0.3) };
    S.pins = ['O', 'O2', 'A', 'B', 'D', 'P'].map(n => { const p = M(cylZ(n === 'P' ? 0.16 : 0.12, 0.9, 16), n === 'P' ? mats.red : mats.steel); scene.add(p); return p; });
    for (const P of [O, O2]) { const b = M(new THREE.BoxGeometry(0.6, 0.6, 0.6), mats.block); b.position.set(P[0], P[1], -0.5); scene.add(b); }
    const back = M(new THREE.BoxGeometry(6.6, 7.0, 0.2), mats.dark); back.position.set(-0.2, 0, -0.9); scene.add(back);
    const st = M(new THREE.BoxGeometry(0.6, 3.4, 0.4), mats.block); st.position.set(-0.4, -2.1, -0.9); scene.add(st);
    ctx.arrow(0x7fb0ff, 1.55, [O2[0], O2[1], 0.3], [0, 0, 1], 1, scene, 0.8);
    S.arr = ctx.linArrow(0xff9d8a, 2.2, [XL + 0.7, 0, 0.5], [0, 1, 0]);
  },
  update(k) {
    const set = (b, p, q) => { b.position.x = (p[0] + q[0]) / 2; b.position.y = (p[1] + q[1]) / 2; b.scale.x = Math.hypot(q[0] - p[0], q[1] - p[1]) + 0.26; b.rotation.z = Math.atan2(q[1] - p[1], q[0] - p[0]); };
    set(S.bars.OB, O, k.B); set(S.bars.OD, O, k.D); set(S.bars.AB, k.A, k.B); set(S.bars.AD, k.A, k.D); set(S.bars.BP, k.B, k.P); set(S.bars.DP, k.D, k.P); set(S.bars.OA, O2, k.A);
    [O, O2, k.A, k.B, k.D, k.P].forEach((p, i) => S.pins[i].position.set(p[0], p[1], 0.2));
  },
};
