// Chain and sprocket
import { THREE, TAU, mod, extrude, gearShape, capsuleShape, cylZ, phase, fmtN, TL } from '../engine.js';
const N1 = 32, N2 = 14, C = 0.42, R1 = N1 * C / TAU, R2 = N2 * C / TAU, V = 2.0;
const C1 = [0, -2.6];
function pathLen(d) { const b = Math.asin((R1 - R2) / d), Ls = Math.sqrt(d * d - (R1 - R2) ** 2); return 2 * Ls + R2 * (Math.PI - 2 * b) + R1 * (Math.PI + 2 * b); }
const NL = Math.round(pathLen(6.2) / C);
const Dd = (() => { let lo = 4, hi = 9; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (pathLen(m) < NL * C) lo = m; else hi = m; } return (lo + hi) / 2; })();
const C2 = [0, C1[1] + Dd], B = Math.asin((R1 - R2) / Dd), LS = Math.sqrt(Dd * Dd - (R1 - R2) ** 2), LT = NL * C;
const sA = LS, sB = LS + R2 * (Math.PI - 2 * B), sC = 2 * LS + R2 * (Math.PI - 2 * B);
const at = (c, r, a) => [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
function pt(s) {
  s = mod(s, LT);
  if (s < sA) { const p = at(C1, R1, B), q = at(C2, R2, B), u = s / LS; return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u]; }
  if (s < sB) return at(C2, R2, B + (s - sA) / R2);
  if (s < sC) { const p = at(C2, R2, Math.PI - B), q = at(C1, R1, Math.PI - B), u = (s - sB) / LS; return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u]; }
  return at(C1, R1, Math.PI - B + (s - sC) / R1);
}
// sprocket phase so that pins sit in tooth gaps
const rot1 = (() => { const k = Math.ceil(sC / C) + 1, a = Math.PI - B + (k * C - sC) / R1; return a - Math.PI / N1; })();
const rot2 = (() => { const k = Math.ceil(sA / C) + 1, a = B + (k * C - sA) / R2; return a - Math.PI / N2; })();
let S = {};
const pedalTurns = t => V * (phase(t) - phase(Math.min(t, TL.cnt0))) / R1 / TAU;
export default {
  id: '13',
  view: { az: -10, el: 12, dist: 30, target: [0, 1.7, 0], orbit: 0.5, caz: -28, cel: 8, cdist: 10, ctarget: [0, C2[1] - 0.2, 0], low: 0.16, lowDist: 1.25 },
  floorY: -5.6,
  text: {
    tr: { hook: 'Bisikletin gizli<br>dişli kutusu', hookSub: 'Zincir ve dişli', labels: ['Arka dişli (pinyon)', 'Zincir', 'Aynakol (ön dişli)', 'Pedal kolu'],
      c1: 'İki dişli, bir zincir', c2a: 'Pedal büyük dişliyi çevirir', c2b: 'Zincir hareketi <b>kaymadan</b><br>arka dişliye taşır',
      c3a: 'Her makara bir<br>diş boşluğuna oturur', c3b: 'Küçük dişli <b>daha hızlı</b> döner', fbig: '32 / 14 = 2,29', fsub: '1 pedal turunda<br>arka teker 2,29 tur atar',
      uses: ['Bisikletler', 'Motosikletler', 'Konveyör sistemleri', 'Motor zamanlama zincirleri'] },
    en: { hook: 'Your bike’s<br>hidden gearbox', hookSub: 'Chain and sprocket', labels: ['Rear sprocket', 'Chain', 'Chainring (front)', 'Crank arm'],
      c1: 'Two sprockets, one chain', c2a: 'The pedals turn the big sprocket', c2b: 'The chain carries the motion<br><b>without slipping</b>',
      c3a: 'Each roller sits<br>in a tooth gap', c3b: 'The small sprocket spins <b>faster</b>', fbig: '32 / 14 = 2.29', fsub: 'One pedal turn spins<br>the rear wheel 2.29 times',
      uses: ['Bicycles', 'Motorcycles', 'Conveyor systems', 'Engine timing chains'] },
  },
  kin(t) { const s = V * phase(t); return { s, a1: rot1 + s / R1, a2: rot2 + s / R2 }; },
  labels: [
    { c: '#7fb0ff', mat: 'blue', at: [270, 330], p: [-0.6, C2[1] + 0.5, 0.15] },
    { c: '#c9d1dc', mat: 'steel', at: [830, 700], p: () => { const p = pt(LS * 0.55); return [p[0], p[1], 0.2]; } },
    { c: '#ffcf5c', mat: 'gold', at: [250, 1450], p: [-1.5, C1[1] - 0.9, 0.15] },
    { c: '#ff9d8a', mat: 'red', at: [830, 1450], p: k => [1.0 * Math.cos(k.a1 - 1.0), C1[1] + 1.0 * Math.sin(k.a1 - 1.0), 0.45] },
  ],
  counters: [
    { label: { tr: 'Pedal', en: 'Pedals' }, c: '#ffcf5c', fn: (t, L) => fmtN(pedalTurns(t), 2, L) + (L === 'tr' ? ' tur' : ' turns') },
    { label: { tr: 'Arka teker', en: 'Rear wheel' }, c: '#7fb0ff', fn: (t, L) => fmtN(pedalTurns(t) * N1 / N2, 2, L) + (L === 'tr' ? ' tur' : ' turns') },
  ],
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    const sprocket = (N, R, mt, holes) => {
      const sh = gearShape(N, R - 0.13, R + 0.17, 0.25);
      if (holes) for (let i = 0; i < 5; i++) { const h = new THREE.Path(), a = i * TAU / 5; h.absarc(R * 0.55 * Math.cos(a), R * 0.55 * Math.sin(a), R * 0.22, 0, TAU, true); sh.holes.push(h); }
      return M(extrude(sh, 0.16, 0.015), mt);
    };
    S.g1 = new THREE.Group(); S.g1.position.set(C1[0], C1[1], 0); scene.add(S.g1);
    S.g1.add(sprocket(N1, R1, mats.gold, true));
    const arm = M(extrude(capsuleShape(2.0, 0.24), 0.2), mats.red); arm.position.z = 0.35; S.g1.add(arm);
    const ped = M(new THREE.BoxGeometry(0.5, 0.9, 1.0), mats.dark); ped.position.set(2.0, 0, 0.9); S.g1.add(ped);
    const hub1 = M(cylZ(0.42, 0.7), mats.steel); S.g1.add(hub1);
    S.g2 = new THREE.Group(); S.g2.position.set(C2[0], C2[1], 0); scene.add(S.g2);
    S.g2.add(sprocket(N2, R2, mats.blue, false));
    const hub2 = M(cylZ(0.34, 1.4), mats.steel); hub2.position.z = -0.4; S.g2.add(hub2);
    for (let i = 0; i < 12; i++) { const sp = M(new THREE.CylinderGeometry(0.025, 0.025, 2.4, 6), mats.steel); const a = i * TAU / 12; sp.position.set(1.35 * Math.cos(a), 1.35 * Math.sin(a), -0.9); sp.rotation.z = a - Math.PI / 2; S.g2.add(sp); }
    const rimW = M(new THREE.TorusGeometry(2.55, 0.08, 8, 64), mats.dark); rimW.position.z = -0.9; S.g2.add(rimW);
    // chain
    const plate = new THREE.ExtrudeGeometry(capsuleShape(C, 0.15), { depth: 0.05, bevelEnabled: false });
    S.links = [];
    for (let i = 0; i < NL; i++) {
      const g = new THREE.Group(); scene.add(g);
      const z = i % 2 ? 0.2 : 0.12;
      for (const zz of [-z - 0.05, z]) { const pm = new THREE.Mesh(plate, i % 2 ? mats.steel : mats.dark); pm.position.z = zz; pm.castShadow = true; g.add(pm); }
      const pin = new THREE.Mesh(cylZ(0.07, 0.56, 10), mats.steel); g.add(pin);
      const rl = new THREE.Mesh(cylZ(0.12, 0.2, 14), mats.bronze); g.add(rl);
      S.links.push(g);
    }
    const fr = M(new THREE.BoxGeometry(0.4, Dd + 1.0, 0.4), mats.block); fr.position.set(0, (C1[1] + C2[1]) / 2, -1.6); scene.add(fr);
    const ft = M(new THREE.BoxGeometry(2.6, 0.5, 1.6), mats.block); ft.position.set(0, -5.35, -1.6); scene.add(ft);
    const lg = M(new THREE.BoxGeometry(0.4, 2.4, 0.4), mats.block); lg.position.set(0, -4.1, -1.6); scene.add(lg);
    ctx.arrow(0xffcf5c, R1 + 0.6, [C1[0], C1[1], 0.6], [0, 0, 1], 1, scene, 0.6);
    ctx.arrow(0x7fb0ff, R2 + 0.5, [C2[0], C2[1], 0.6], [0, 0, 1], 1, scene, 1.2);
  },
  update(k) {
    S.g1.rotation.z = k.a1; S.g2.rotation.z = k.a2;
    for (let i = 0; i < NL; i++) { const a = pt(k.s + i * C), b = pt(k.s + (i + 1) * C); const g = S.links[i]; g.position.set(a[0], a[1], 0); g.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]); }
  },
};
