// Four-bar linkage (crank-rocker) with coupler curve
import { THREE, TAU, mod, extrude, capsuleShape, cylZ, phase, fmtN, fade, TL } from '../engine.js';
const s = 1.1, a = 1.25 * s, b = 4.0 * s, c = 3.0 * s, d = 3.75 * s, WC = 1.6, EX = 0.5, EY = 1.5 * s;
const A = [-d / 2, 0], D = [d / 2, 0];
function solve(th) {
  const B = [A[0] + a * Math.cos(th), A[1] + a * Math.sin(th)];
  const dx = D[0] - B[0], dy = D[1] - B[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  const aa = (b * b - c * c + L * L) / (2 * L), hh = Math.sqrt(Math.max(0, b * b - aa * aa));
  const C = [B[0] + aa * ux - hh * uy, B[1] + aa * uy + hh * ux];
  const bx = (C[0] - B[0]) / b, by = (C[1] - B[1]) / b;
  const E = [B[0] + EX * b * bx - EY * by, B[1] + EX * b * by + EY * bx];
  return { B, C, E, cAng: Math.atan2(by, bx), rAng: Math.atan2(C[1] - D[1], C[0] - D[0]) };
}
let S = {};
export default {
  id: '11',
  view: { az: 0, el: 10, dist: 25, target: [0, 1.6, 0], orbit: 0.45, caz: -18, cel: 6, cdist: 20, ctarget: [0, 2.0, 0], low: 0.16, lowDist: 1.2 },
  floorY: -2.6,
  text: {
    tr: { hook: '4 çubuk,<br>sonsuz hareket', hookSub: 'Dört çubuk mekanizması', labels: ['Biyel (bağlantı kolu)', 'Sarkaç kol', 'Krank (giriş)', 'Sabit gövde'],
      c1: 'Krank, biyel, sarkaç ve gövde', c2a: 'Krank tam tur döner', c2b: 'Sarkaç ise<br><b>ileri-geri</b> salınır',
      c3a: 'Biyeldeki bir nokta<br>kapalı bir eğri çizer', c3b: 'Ölçüleri değiştir,<br><b>eğri değişir</b>', fbig: 's + l ≤ p + q', fsub: 'Grashof kuralı: bu sağlanırsa<br>en kısa çubuk tam tur dönebilir',
      uses: ['Ön cam silecekleri', 'Ekskavatör kolları', 'Eliptik fitness aletleri', 'Araç süspansiyonları'] },
    en: { hook: '4 bars,<br>endless motions', hookSub: 'The four-bar linkage', labels: ['Coupler', 'Rocker', 'Crank (input)', 'Fixed frame'],
      c1: 'Crank, coupler, rocker and frame', c2a: 'The crank turns full circles', c2b: 'The rocker only<br><b>swings back and forth</b>',
      c3a: 'A point on the coupler<br>traces a closed curve', c3b: 'Change the lengths,<br><b>the curve changes</b>', fbig: 's + l ≤ p + q', fsub: 'Grashof’s rule: if it holds,<br>the shortest bar can rotate fully',
      uses: ['Windshield wipers', 'Excavator arms', 'Elliptical trainers', 'Car suspensions'] },
  },
  kin(t) { const ph = phase(t), th = WC * ph + 0.6; return { ph, th, ...solve(th) }; },
  labels: [
    { c: '#7fb0ff', mat: 'blue', at: [270, 330], p: k => [(k.B[0] + k.C[0]) / 2, (k.B[1] + k.C[1]) / 2, 0.45] },
    { c: '#6fe0a4', mat: 'green', at: [830, 420], p: k => [(k.C[0] + D[0]) / 2, (k.C[1] + D[1]) / 2, 0.1] },
    { c: '#ffcf5c', mat: 'gold', at: [260, 1450], p: k => [(A[0] + k.B[0]) / 2, (A[1] + k.B[1]) / 2, 0.1] },
    { c: '#c9d1dc', mat: 'block', at: [830, 1450], p: [1.2, -1.5, 0] },
  ],
  counters: [
    { label: { tr: 'Krank açısı', en: 'Crank angle' }, c: '#ffcf5c', fn: (t, L, k) => Math.round(mod(k.th * 180 / Math.PI, 360)) + '°' },
    { label: { tr: 'Sarkaç açısı', en: 'Rocker angle' }, c: '#6fe0a4', fn: (t, L, k) => Math.round(k.rAng * 180 / Math.PI) + '°' },
  ],
  overlay(t, k, ctx) {
    const rev = TAU / WC, n = 220, pts = [];
    for (let i = 0; i <= n; i++) { const ph = k.ph - rev * i / n; if (ph < 0) break; const E = solve(WC * ph + 0.6).E; const [x, y] = ctx.project([E[0], E[1], 0.55]); pts.push(`${x.toFixed(1)},${y.toFixed(1)}`); }
    const op = 0.35 + 0.65 * fade(t, 16.8, 23.0, 0.6);
    return `<polyline points="${pts.join(' ')}" fill="none" stroke="#ff7ad9" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="${op.toFixed(2)}"/>`;
  },
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    S.crank = M(extrude(capsuleShape(a, 0.32, 0.1), 0.2), mats.gold); S.crank.position.set(A[0], A[1], 0.0); scene.add(S.crank);
    S.rocker = M(extrude(capsuleShape(c, 0.28, 0.1), 0.2), mats.green); S.rocker.position.set(D[0], D[1], 0.0); scene.add(S.rocker);
    const cs = new THREE.Shape(); const pts = [[0, 0], [b, 0], [EX * b, EY]];
    cs.moveTo(-0.0, -0.32); cs.lineTo(b, -0.32); cs.absarc(b, 0, 0.32, -Math.PI / 2, Math.PI / 2, false); cs.lineTo(EX * b + 0.3, EY + 0.1); cs.absarc(EX * b, EY, 0.34, 0.3, Math.PI - 0.3, false); cs.lineTo(0, 0.32); cs.absarc(0, 0, 0.32, Math.PI / 2, Math.PI * 1.5, false);
    const hole = new THREE.Path(); hole.moveTo(0.9, 0.25); hole.lineTo(EX * b, EY - 0.55); hole.lineTo(b - 0.9, 0.25); hole.closePath(); cs.holes.push(new THREE.Path(hole.getPoints().reverse()));
    S.coupler = M(extrude(cs, 0.2), mats.blue); S.coupler.position.z = 0.32; scene.add(S.coupler);
    const pen = M(cylZ(0.16, 0.5), mats.red); pen.position.set(EX * b, EY, 0.3); S.coupler.add(pen);
    S.pinB = M(cylZ(0.12, 0.75), mats.steel); scene.add(S.pinB); S.pinC = M(cylZ(0.12, 0.75), mats.steel); scene.add(S.pinC);
    for (const P of [A, D]) {
      const pv = M(cylZ(0.14, 1.4), mats.steel); pv.position.set(P[0], P[1], -0.3); scene.add(pv);
      const st = M(new THREE.BoxGeometry(0.8, 2.2, 0.4), mats.block); st.position.set(P[0], P[1] - 1.0, -0.6); scene.add(st);
    }
    const bar = M(new THREE.BoxGeometry(d + 1.4, 0.5, 0.6), mats.block); bar.position.set(0, -2.1, -0.6); scene.add(bar);
    const mot = M(cylZ(0.6, 1.0), mats.dark); mot.position.set(A[0], A[1], -1.3); scene.add(mot);
    ctx.arrow(0xffcf5c, 0.95, [A[0], A[1], 0.6], [0, 0, 1], 1, scene, 1.2);
    S.arrR = ctx.arrow(0x6fe0a4, 0.9, [D[0], D[1], 0.6], [0, 0, 1], 1, scene, 1.2);
  },
  update(k, t) {
    S.crank.rotation.z = k.th; S.rocker.rotation.z = k.rAng;
    S.coupler.position.set(k.B[0], k.B[1], 0.32); S.coupler.rotation.z = k.cAng;
    S.pinB.position.set(k.B[0], k.B[1], 0.15); S.pinC.position.set(k.C[0], k.C[1], 0.15);
    const k2 = solve(k.th + 0.01); S.arrR.setSign(k2.rAng - k.rAng);
  },
};
