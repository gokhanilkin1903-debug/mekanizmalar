// Geneva drive (4 slots)
import { THREE, TAU, mod, extrude, cylZ, phase, fmtN, TL } from '../engine.js';
const a = 3.2, r = a * Math.SQRT1_2, R = a * Math.SQRT1_2, pinR = 0.2, w = 0.23, Ro = Math.sqrt(R * R + pinR * pinR) + 0.02;
const rl = 1.5, rcEnd = a - r - 0.03, Dy = -a / 2, Gy = a / 2, WD = 1.8, PSI0 = Math.PI / 4 - 0.5;
function genevaShape() {
  const s = new THREE.Shape(), pts = [];
  const g = Math.acos((Ro * Ro + a * a - rl * rl) / (2 * Ro * a)), d = Math.asin(w / Ro);
  const arc = (cx, cy, rad, a0, a1, n) => { for (let i = 0; i <= n; i++) { const t = a0 + (a1 - a0) * i / n; pts.push([cx + rad * Math.cos(t), cy + rad * Math.sin(t)]); } };
  for (let k = 0; k < 4; k++) {
    const sk = -Math.PI / 4 + k * Math.PI / 2, m = sk + Math.PI / 4, sn = sk + Math.PI / 2;
    // slot k: along direction sk (side -w, end, side +w)
    const u = [Math.cos(sk), Math.sin(sk)], n = [-u[1], u[0]], L0 = Math.sqrt(Ro * Ro - w * w);
    pts.push([L0 * u[0] - w * n[0], L0 * u[1] - w * n[1]]);
    const ea = Math.atan2(-n[1], -n[0]);
    arc(rcEnd * u[0], rcEnd * u[1], w, ea, ea - Math.PI, 10);
    pts.push([L0 * u[0] + w * n[0], L0 * u[1] + w * n[1]]);
    // rim to concave cut
    arc(0, 0, Ro, sk + d, m - g, 8);
    const C = [a * Math.cos(m), a * Math.sin(m)];
    const P1 = [Ro * Math.cos(m - g) - C[0], Ro * Math.sin(m - g) - C[1]], P2 = [Ro * Math.cos(m + g) - C[0], Ro * Math.sin(m + g) - C[1]];
    let b1 = Math.atan2(P1[1], P1[0]), b2 = Math.atan2(P2[1], P2[0]);
    // go the way passing through direction toward origin (m+PI): from b1 decreasing to b2
    while (b2 > b1) b2 -= TAU;
    if (Math.abs(b1 - b2) > Math.PI) { b2 += TAU; }
    arc(C[0], C[1], rl, b1, b2, 24);
    arc(0, 0, Ro, m + g, sn - d, 8);
  }
  pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath();
  const h = new THREE.Path(); h.absarc(0, 0, 0.22, 0, TAU, true); s.holes.push(h);
  return s;
}
function lockShape() {
  const s = new THREE.Shape(), e = Math.acos((rl * rl + a * a - Ro * Ro) / (2 * rl * a));
  s.absarc(0, 0, rl, e, TAU - e, false);
  const P = [rl * Math.cos(-e) - a, rl * Math.sin(-e)], Q = [rl * Math.cos(e) - a, rl * Math.sin(e)];
  const b1 = Math.atan2(P[1], P[0]), b2 = Math.atan2(Q[1], Q[0]);
  let B2 = b2; while (B2 > b1) B2 -= TAU; // clockwise from b1 through angle PI (toward driver)
  const n = 24; for (let i = 1; i <= n; i++) { const t = b1 + (B2 - b1) * i / n; s.lineTo(a + (Ro + 0.06) / Ro * 0 + Ro * Math.cos(t) * 1.0 + 0, Ro * Math.sin(t)); }
  return s;
}
export function genevaAngle(psi) {
  const ph = psi - Math.PI / 4, c = Math.floor(ph / TAU), f = mod(ph, TAU);
  if (f < Math.PI / 2) { const px = r * Math.cos(psi), py = Dy + r * Math.sin(psi); return -c * Math.PI / 2 + (Math.atan2(py - Gy, px) + Math.PI / 4); }
  return -(c + 1) * Math.PI / 2;
}
const steps = psi => { const ph = psi - Math.PI / 4; return Math.floor(ph / TAU) + (mod(ph, TAU) >= Math.PI / 2 ? 1 : 0); };
let S = {};
export default {
  id: '04',
  view: { az: 0, el: 14, dist: 27, target: [0, 0.2, 0], orbit: 0.5, caz: -20, cel: 8, cdist: 17, ctarget: [0, 0.3, 0], low: 0.16, lowDist: 1.2 },
  floorY: -4.8,
  text: {
    tr: { hook: 'Sürekli dönüşten<br>dur-kalk hareket', hookSub: 'Cenevre mekanizması', labels: ['Cenevre çarkı', 'Pim', 'Sürücü tekerlek', 'Kilit diski'],
      c1: 'Tek pim, 4 yuva', c2a: 'Pim yuvaya girer ve<br>çarkı 90° çevirir', c2b: 'Sonra kilit diski çarkı<br><b>sabit tutar</b>',
      c3a: 'Pim yuvaya teğet girer:<br>darbe yok', c3b: 'Dön · dur · dön · <b>dur</b>', fbig: '1 tur → 90°', fsub: 'Sürücü dönerken çark<br>zamanın ¾’ünde bekler',
      uses: ['Sinema film projektörleri', 'Mekanik saatler', 'Dolum ve paketleme makineleri', 'Takım tezgahı tareti'] },
    en: { hook: 'Continuous spin into<br>stop-and-go motion', hookSub: 'The Geneva drive', labels: ['Geneva wheel', 'Pin', 'Drive wheel', 'Locking disc'],
      c1: 'One pin, four slots', c2a: 'The pin enters a slot and<br>turns the wheel 90°', c2b: 'Then the locking disc<br><b>holds it still</b>',
      c3a: 'The pin enters tangentially:<br>no impact', c3b: 'Move · stop · move · <b>stop</b>', fbig: '1 turn → 90°', fsub: 'While the driver spins, the wheel<br>rests ¾ of the time',
      uses: ['Film projectors', 'Mechanical watches', 'Filling & packaging machines', 'Machine tool turrets'] },
  },
  kin(t) { const psi = PSI0 + WD * phase(t); return { psi, g: genevaAngle(psi), pin: [r * Math.cos(psi), Dy + r * Math.sin(psi), 0.35] }; },
  labels: [
    { c: '#7fb0ff', mat: 'blue', at: [260, 330], p: [-1.5, Gy + 1.2, 0.3] },
    { c: '#ffcf5c', mat: 'steel', at: [820, 330], p: k => k.pin },
    { c: '#6fe0a4', mat: 'green', at: [260, 1450], p: [-1.8, Dy - 1.6, -0.3] },
    { c: '#ffcf5c', mat: 'gold', at: [820, 1450], p: [0.6, Dy - 0.9, 0.3] },
  ],
  counters: [
    { label: { tr: 'Sürücü', en: 'Driver' }, c: '#6fe0a4', fn: (t, L) => fmtN(WD * (phase(t) - phase(Math.min(t, TL.cnt0))) / TAU, 2, L) + (L === 'tr' ? ' tur' : ' turns') },
    { label: { tr: 'Çark adımı', en: 'Wheel steps' }, c: '#7fb0ff', fn: t => String(steps(PSI0 + WD * phase(t)) - steps(PSI0 + WD * phase(Math.min(t, TL.cnt0)))) },
  ],
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    S.gen = M(extrude(genevaShape(), 0.5, 0.025, 12), mats.blue); S.gen.position.y = Gy; scene.add(S.gen);
    const gsh = M(cylZ(0.22, 2.0), mats.steel); gsh.position.set(0, Gy, -0.9); scene.add(gsh);
    S.drv = new THREE.Group(); S.drv.position.y = Dy; scene.add(S.drv);
    const base = new THREE.Shape(); base.absarc(0, 0, r + 0.45, 0, TAU, false);
    const bm = M(extrude(base, 0.25, 0.02, 64), mats.green); bm.position.z = -0.45; S.drv.add(bm);
    const lk = M(extrude(lockShape(), 0.5, 0.02, 48), mats.gold); S.drv.add(lk);
    const pin = M(cylZ(pinR, 0.85), mats.steel); pin.position.set(r, 0, 0.05); S.drv.add(pin);
    const dsh = M(cylZ(0.25, 2.2), mats.steel); dsh.position.z = -1.4; S.drv.add(dsh);
    const frame = M(new THREE.BoxGeometry(2.2, a + 1.0, 0.4), mats.block); frame.position.set(0, 0, -2.0); scene.add(frame);
    const foot = M(new THREE.BoxGeometry(3.2, 0.6, 1.6), mats.block); foot.position.set(0, -4.5, -2.0); scene.add(foot);
    const leg = M(new THREE.BoxGeometry(1.0, 2.4, 0.4), mats.block); leg.position.set(0, -3.1, -2.0); scene.add(leg);
    ctx.arrow(0x6fe0a4, r + 0.85, [0, Dy, 0.5], [0, 0, 1], 1, scene, 0.6);
    ctx.arrow(0x7fb0ff, 1.2, [0, Gy, 0.6], [0, 0, 1], -1, scene, 0.6);
  },
  update(k) { S.drv.rotation.z = k.psi; S.gen.rotation.z = k.g; },
};
