// Pantograph (scale 2)
import { THREE, TAU, cylZ, phase, fade, TL } from '../engine.js';
const O = [-1.8, -4.0], T0 = [-0.5, -1.1], HS = 0.055, K = 2, L = 4.4, WU = 0.9;
const heart = u => [T0[0] + HS * 16 * Math.sin(u) ** 3, T0[1] + HS * (13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u))];
function kinAt(u) {
  const T = heart(u), Sp = [O[0] + K * (T[0] - O[0]), O[1] + K * (T[1] - O[1])];
  const dx = Sp[0] - O[0], dy = Sp[1] - O[1], d = Math.hypot(dx, dy), hh = Math.sqrt(Math.max(0, L * L - (d / 2) ** 2));
  const A = [O[0] + dx / 2 - hh * dy / d, O[1] + dy / 2 + hh * dx / d];
  const B = [(O[0] + A[0]) / 2, (O[1] + A[1]) / 2], C = [(A[0] + Sp[0]) / 2, (A[1] + Sp[1]) / 2];
  return { T, S: Sp, A, B, C };
}
let S = {};
export default {
  id: '20',
  view: { az: 0, el: 8, dist: 24, target: [-0.6, -0.2, 0], orbit: 0.45, caz: -20, cel: 6, cdist: 14, ctarget: [-0.8, -0.6, 0], low: 0.17, lowDist: 1.25 },
  floorY: -5.4,
  text: {
    tr: { hook: 'Her çizimi<br>iki kat büyüt', hookSub: 'Pantograf', labels: ['Kalem (2× kopya)', 'Paralelkenar', 'İzleyici uç', 'Sabit mafsal'],
      c1: 'Dört çubuk bir paralelkenar kurar', c2a: 'İzleyici uç küçük kalbi takip eder', c2b: 'Kalem aynı şekli<br><b>iki kat büyük</b> çizer',
      c3a: 'Sabit nokta, izleyici ve kalem<br>hep aynı doğru üzerinde', c3b: 'Oranı <b>çubuk boyları</b> belirler', fbig: 'k = 2', fsub: 'Kalemin çizdiği her şey,<br>izleyicinin çiziminin tam iki katı',
      uses: ['Gravür ve oyma makineleri', 'Harita büyütme aletleri', 'Makaslı kaldırma platformları', 'Tren pantografları'] },
    en: { hook: 'Scale any drawing<br>by two', hookSub: 'The pantograph', labels: ['Pen (2× copy)', 'Parallelogram', 'Tracer', 'Fixed pivot'],
      c1: 'Four bars form a parallelogram', c2a: 'The tracer follows the small heart', c2b: 'The pen draws the same shape<br><b>twice as big</b>',
      c3a: 'Pivot, tracer and pen<br>always stay in line', c3b: 'The <b>bar lengths</b> set the scale', fbig: 'k = 2', fsub: 'Everything the pen draws is<br>exactly twice the tracer’s drawing',
      uses: ['Engraving machines', 'Map enlarging tools', 'Scissor lifts', 'Train pantographs'] },
  },
  kin(t) { const ph = phase(t), u = WU * ph; return { ph, u, ...kinAt(u) }; },
  labels: [
    { c: '#ffcf5c', mat: 'dark', at: [830, 330], p: k => [k.S[0], k.S[1], 0.5] },
    { c: '#6fe0a4', mat: 'green', at: [250, 330], p: k => [(k.A[0] + k.B[0] + k.C[0] + k.T[0]) / 4, (k.A[1] + k.B[1] + k.C[1] + k.T[1]) / 4, 0.5] },
    { c: '#ff7ad9', mat: 'red', at: [830, 1450], p: k => [k.T[0], k.T[1], 0.6] },
    { c: '#c9d1dc', mat: 'steel', at: [250, 1450], p: [O[0], O[1], 0.4] },
  ],
  overlay(t, k, ctx) {
    const rev = TAU / WU, n = 220; let a = [], b = [];
    for (let i = 0; i <= n; i++) { const ph = k.ph - rev * i / n; if (ph < 0) break; const q = kinAt(WU * ph); const p1 = ctx.project([q.T[0], q.T[1], -0.25]), p2 = ctx.project([q.S[0], q.S[1], -0.25]); a.push(p1.map(v => v.toFixed(1)).join(',')); b.push(p2.map(v => v.toFixed(1)).join(',')); }
    let out = `<polyline points="${a.join(' ')}" fill="none" stroke="#ff7ad9" stroke-width="6" stroke-linecap="round"/><polyline points="${b.join(' ')}" fill="none" stroke="#ffcf5c" stroke-width="8" stroke-linecap="round"/>`;
    const lo = fade(t, 16.8, 23.0, 0.5);
    if (lo > 0.01) { const p = ctx.project([O[0], O[1], 0.7]), q = ctx.project([k.S[0], k.S[1], 0.7]); out += `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="#fff" stroke-width="3" stroke-dasharray="10 10" opacity="${lo * 0.8}"/>`; }
    return out;
  },
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    const board = M(new THREE.BoxGeometry(7.6, 10.6, 0.2), new THREE.MeshStandardMaterial({ color: 0x1d2d4c, roughness: 0.9 })); board.position.set(-0.6, -0.2, -0.45); scene.add(board);
    const bar = (mt, z) => { const b = M(new THREE.BoxGeometry(1, 0.3, 0.14), mt); b.position.z = z; scene.add(b); return b; };
    S.bOA = bar(mats.gold, 0.0); S.bAS = bar(mats.gold, 0.18); S.bBT = bar(mats.green, 0.36); S.bCT = bar(mats.green, 0.54);
    S.pins = ['O', 'A', 'B', 'C', 'T', 'S'].map(n => { const p = M(cylZ(0.13, 0.9, 16), n === 'O' ? mats.steel : mats.dark); scene.add(p); return p; });
    S.pen = M(new THREE.ConeGeometry(0.22, 0.6, 16).rotateX(Math.PI / 2), mats.dark); scene.add(S.pen);
    S.tr = M(new THREE.ConeGeometry(0.2, 0.5, 16).rotateX(Math.PI / 2), mats.red); scene.add(S.tr);
    const base = M(new THREE.BoxGeometry(1.2, 0.8, 0.5), mats.steel); base.position.set(O[0], O[1] - 0.2, -0.15); scene.add(base);
  },
  update(k) {
    const setBar = (b, p, q) => { b.position.x = (p[0] + q[0]) / 2; b.position.y = (p[1] + q[1]) / 2; b.scale.x = Math.hypot(q[0] - p[0], q[1] - p[1]) + 0.3; b.rotation.z = Math.atan2(q[1] - p[1], q[0] - p[0]); };
    setBar(S.bOA, O, k.A); setBar(S.bAS, k.A, k.S); setBar(S.bBT, k.B, k.T); setBar(S.bCT, k.C, k.T);
    [O, k.A, k.B, k.C, k.T, k.S].forEach((p, i) => S.pins[i].position.set(p[0], p[1], 0.25));
    S.pen.position.set(k.S[0], k.S[1], -0.05); S.tr.position.set(k.T[0], k.T[1], -0.05);
  },
};
