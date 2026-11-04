// Compound gear train 27:1
import { THREE, TAU, gearGeo, cylZ, extrude, capsuleShape, phase, fmtN, TL } from '../engine.js';
const m = 0.12, NS = 12, NB = 36, WM = 9.0, ax = 1.05, h = Math.sqrt((m * (NS + NB) / 2) ** 2 - (2 * ax) ** 2);
const P = [[-ax, -1.5 * h], [ax, -0.5 * h], [-ax, 0.5 * h], [ax, 1.5 * h]];
const Z = [0, 0.5, 1.0];
function mate(c1, th1, N1, c2, N2) { const al = Math.atan2(c2[1] - c1[1], c2[0] - c1[0]), p1 = TAU / N1, p2 = TAU / N2, u = (al - th1) / p1; return al + Math.PI - p2 * (0.5 - u); }
function angles(t) {
  const a = WM * phase(t);
  const b = mate(P[0], a, NS, P[1], NB), c = mate(P[1], b, NS, P[2], NB), d = mate(P[2], c, NS, P[3], NB);
  return [a, b, c, d];
}
let S = {};
const turns = t => WM * (phase(t) - phase(Math.min(t, TL.cnt0))) / TAU;
export default {
  id: '16',
  view: { az: -14, el: 12, dist: 28, target: [0, 1.4, 0.4], orbit: 0.6, caz: -30, cel: 8, cdist: 14, ctarget: [0, -1.4, 0.3], low: 0.15, lowDist: 1.2 },
  floorY: -5.6,
  text: {
    tr: { hook: '3 dişli çifti,<br>27 kat güç', hookSub: 'Dişli dizisi (redüktör)', labels: ['Çıkış dişlisi', 'Çift katlı ara dişliler', 'Motor pinyonu (12 diş)', 'Taşıyıcı plaka'],
      c1: 'Küçük dişli büyüğü çevirir', c2a: 'Her çift hızı 3’e böler', c2b: 'Ara dişliler <b>çift katlı</b>:<br>büyük ve küçük aynı milde',
      c3a: '3 × 3 × 3 = 27', c3b: 'Hız 27 kat düşer,<br>tork <b>27 kat artar</b>', fbig: '27 : 1', fsub: 'Motor 27 tur atınca<br>çıkış mili 1 tur döner',
      uses: ['Saat mekanizmaları', 'Servo motorlar', 'Vinçler', 'RC araçlar ve oyuncaklar'] },
    en: { hook: '3 gear pairs,<br>27× the torque', hookSub: 'The compound gear train', labels: ['Output gear', 'Compound idler gears', 'Motor pinion (12 teeth)', 'Frame plate'],
      c1: 'A small gear drives a big one', c2a: 'Each pair divides the speed by 3', c2b: 'The middle gears are <b>compound</b>:<br>big and small on one shaft',
      c3a: '3 × 3 × 3 = 27', c3b: 'Speed drops 27×,<br>torque rises <b>27×</b>', fbig: '27 : 1', fsub: '27 motor turns =<br>1 output turn',
      uses: ['Clock movements', 'Servo motors', 'Winches', 'RC cars and toys'] },
  },
  kin(t) { return { g: angles(t) }; },
  labels: [
    { c: '#ff9d8a', mat: 'red', at: [270, 330], p: [P[3][0] - 1.6, P[3][1] + 0.9, Z[2] + 0.2] },
    { c: '#6fe0a4', mat: 'green', at: [830, 760], p: [P[1][0] + 1.6, P[1][1] + 0.6, 0.3] },
    { c: '#7fb0ff', mat: 'blue', at: [250, 1450], p: [P[0][0], P[0][1], 0.3] },
    { c: '#c9d1dc', mat: 'block', at: [830, 1450], p: [1.6, -4.0, -0.5] },
  ],
  counters: [
    { label: { tr: 'Motor', en: 'Motor' }, c: '#7fb0ff', fn: (t, L) => fmtN(turns(t), 1, L) + (L === 'tr' ? ' tur' : ' turns') },
    { label: { tr: 'Çıkış', en: 'Output' }, c: '#ff9d8a', fn: (t, L) => fmtN(turns(t) / 27, 3, L) + (L === 'tr' ? ' tur' : ' turns') },
  ],
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    const big = () => { const g = gearGeo(NB, m, 0.34, 0.15); return g; };
    S.sh = P.map(([x, y]) => { const g = new THREE.Group(); g.position.set(x, y, 0); scene.add(g); return g; });
    // shaft A: motor pinion
    const g0 = M(gearGeo(NS, m, 0.34, 0.12), mats.blue); g0.position.z = Z[0]; S.sh[0].add(g0);
    const cols = [mats.green, mats.green, mats.red];
    for (let i = 1; i <= 3; i++) {
      const b = M(big(), cols[i - 1]); b.position.z = Z[i - 1]; S.sh[i].add(b);
      const web = new THREE.Shape(); web.absarc(0, 0, 1.75, 0, TAU, false);
      if (i < 3) { const s = M(gearGeo(NS, m, 0.34, 0.12), mats.gold); s.position.z = Z[i]; S.sh[i].add(s); }
    }
    for (let i = 0; i < 4; i++) { const s = M(cylZ(0.13, 2.4), mats.steel); s.position.z = 0.3; S.sh[i].add(s); const k = M(new THREE.BoxGeometry(0.08, 0.3, 0.06), mats.dark); k.position.set(0, 0.2, 1.45); }
    const pointer = M(extrude(capsuleShape(1.9, 0.16), 0.12), mats.red); pointer.position.z = Z[2] + 0.4; S.sh[3].add(pointer);
    const mot = M(cylZ(0.75, 1.4), mats.dark); mot.position.set(P[0][0], P[0][1], -1.3); scene.add(mot);
    const plate = M(new THREE.BoxGeometry(5.6, 8.6, 0.25), mats.block); plate.position.set(0, -0.2, -0.55); scene.add(plate);
    const foot = M(new THREE.BoxGeometry(5.6, 0.5, 2.0), mats.block); foot.position.set(0, -5.35, -0.3); scene.add(foot);
    const leg = M(new THREE.BoxGeometry(0.8, 1.2, 0.3), mats.block); leg.position.set(0, -4.6, -0.55); scene.add(leg);
    ctx.arrow(0x7fb0ff, 1.0, [P[0][0], P[0][1], 0.8], [0, 0, 1], 1, scene, 2.0);
    ctx.arrow(0xff9d8a, 2.6, [P[3][0], P[3][1], 1.6], [0, 0, 1], -1, scene, 0.3);
  },
  update(k) { k.g.forEach((a, i) => { S.sh[i].rotation.z = a; }); },
};
