// Toggle (knee) press
import { THREE, TAU, ss, cylZ, cylX, setRod, phase, fmtN, TL } from '../engine.js';
const TP = [0, 3.0], LK = 2.5, WF = 0.9, CP = [4.4, 1.0];
const xo = t => 0.04 + 1.7 * (0.5 + 0.5 * Math.cos(WF * phase(t)));
const xs = t => 0.05 + 1.3 * (1 - ss((t - 17.0) / 5.2));
const xk = t => { const w = ss((t - 16.0) / 1.2) - ss((t - 27.3) / 0.9); return (1 - w) * xo(t) + w * xs(t); };
function kinAt(x) { const hy = Math.sqrt(LK * LK - x * x), K = [x, TP[1] - hy], ry = K[1] - hy; const tanA = x / hy; return { x, K, ry, aDeg: Math.atan(tanA) * 180 / Math.PI, gain: 1 / (2 * tanA) }; }
let S = {};
export default {
  id: '29',
  view: { az: -16, el: 10, dist: 25, target: [0.9, 0.2, 0], orbit: 0.5, caz: -26, cel: 6, cdist: 11, ctarget: [0.4, -1.6, 0], low: 0.17, lowDist: 1.25 },
  floorY: -4.4,
  text: {
    tr: { hook: 'Küçük itme,<br>dev kuvvet', hookSub: 'Diz mafsalı (toggle) mekanizması', labels: ['Sabit mafsal', 'Diz eklemi', 'Hidrolik silindir', 'Koç (pres)'],
      c1: 'İki kol ve bir diz eklemi', c2a: 'Silindir dizi yana iter', c2b: 'Kollar düzleştikçe<br>koç <b>aşağı</b> iner',
      c3a: 'Diz neredeyse dümdüzken…', c3b: 'Kuvvet <b>onlarca kat</b> artar', fbig: 'F × 1 / (2 tan α)', fsub: 'Açı sıfıra yaklaştıkça<br>kuvvet kazancı çok hızlı büyür',
      uses: ['Mekanik presler', 'Çeneli taş kırıcılar', 'Mandallı kıskaçlar', 'Enjeksiyon kalıp makineleri'] },
    en: { hook: 'A small push,<br>a giant force', hookSub: 'The toggle mechanism', labels: ['Fixed pivot', 'Knee joint', 'Hydraulic cylinder', 'Ram (press)'],
      c1: 'Two links and a knee joint', c2a: 'The cylinder pushes the knee sideways', c2b: 'As the links straighten,<br>the ram goes <b>down</b>',
      c3a: 'When the knee is almost straight…', c3b: 'The force multiplies<br><b>tens of times</b>', fbig: 'F × 1 / (2 tan α)', fsub: 'As the angle approaches zero,<br>the force gain shoots up',
      uses: ['Mechanical presses', 'Jaw crushers', 'Toggle clamps', 'Injection molding machines'] },
  },
  kin(t) { return kinAt(xk(t)); },
  labels: [
    { c: '#c9d1dc', mat: 'block', at: [250, 330], p: [TP[0], TP[1] + 0.3, 0.4] },
    { c: '#ffcf5c', mat: 'gold', at: [830, 330], p: k => [k.K[0], k.K[1], 0.5] },
    { c: '#7fb0ff', mat: 'blue', at: [830, 1450], p: [CP[0] - 0.6, CP[1], 0.4] },
    { c: '#ff9d8a', mat: 'red', at: [250, 1450], p: k => [-0.9, k.ry - 0.5, 0.5] },
  ],
  counters: [
    { label: { tr: 'Kol açısı α', en: 'Link angle α' }, c: '#ffcf5c', fn: (t, L, k) => fmtN(k.aDeg, 1, L) + '°' },
    { label: { tr: 'Kuvvet kazancı', en: 'Force gain' }, c: '#ff9d8a', fn: (t, L, k) => '×' + fmtN(Math.min(99, k.gain), 1, L) },
  ],
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    const head = M(new THREE.BoxGeometry(3.6, 0.7, 1.4), mats.block); head.position.set(0, TP[1] + 0.55, 0); scene.add(head);
    for (const x of [-1.5, 1.5]) { const c = M(new THREE.BoxGeometry(0.35, 7.4, 0.4), mats.block); c.position.set(x, -0.4, -0.6); scene.add(c); }
    const bed = M(new THREE.BoxGeometry(4.2, 0.9, 1.6), mats.block); bed.position.set(0, -3.9, 0); scene.add(bed);
    S.l1 = M(new THREE.BoxGeometry(0.34, 1, 0.3), mats.gold); scene.add(S.l1);
    S.l2 = M(new THREE.BoxGeometry(0.34, 1, 0.3), mats.gold); scene.add(S.l2);
    S.pins = [0, 1, 2].map(() => { const p = M(cylZ(0.15, 0.6, 16), mats.steel); scene.add(p); return p; });
    S.ram = new THREE.Group(); scene.add(S.ram);
    const rb = M(new THREE.BoxGeometry(2.4, 1.0, 1.2), mats.red); rb.position.y = -0.5; S.ram.add(rb);
    const die = M(new THREE.BoxGeometry(1.4, 0.3, 0.9), mats.dark); die.position.y = -1.15; S.ram.add(die);
    S.plate = M(new THREE.BoxGeometry(1.8, 0.14, 1.0), mats.bronze); S.plate.position.set(0, -3.38, 0); scene.add(S.plate);
    S.barrel = M(cylX(0.34, 1, 24), mats.blue); scene.add(S.barrel);
    S.rod = M(cylX(0.13, 1, 16), mats.steel); scene.add(S.rod);
    const cpv = M(new THREE.BoxGeometry(0.6, 0.6, 0.8), mats.block); cpv.position.set(CP[0] + 0.3, CP[1], 0); scene.add(cpv);
    const cpost = M(new THREE.BoxGeometry(0.4, CP[1] + 4.4, 0.4), mats.block); cpost.position.set(CP[0] + 0.3, (CP[1] - 4.4) / 2, -0.3); scene.add(cpost);
    S.arr = ctx.linArrow(0xff9d8a, 1.8, [-1.9, -1.4, 0.4], [0, 1, 0]);
  },
  update(k) {
    const set = (b, p, q) => { b.position.set((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, 0); b.scale.y = Math.hypot(q[0] - p[0], q[1] - p[1]) + 0.2; b.rotation.z = -Math.atan2(q[0] - p[0], q[1] - p[1]); };
    const R = [0, k.ry]; set(S.l1, TP, k.K); set(S.l2, k.K, R);
    [TP, k.K, R].forEach((p, i) => S.pins[i].position.set(p[0], p[1], 0.1));
    S.ram.position.set(0, k.ry, 0);
    const squash = Math.max(0, Math.min(1, ((k.ry - 1.3) - (-3.31)) / -0.06));
    S.plate.scale.set(1 + 0.08 * squash, 1 - 0.3 * squash, 1);
    // cylinder from pivot toward knee
    const dx = k.K[0] - CP[0], dy = k.K[1] - CP[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, a = Math.atan2(dy, dx), bl = 1.7;
    S.barrel.position.set(CP[0] + ux * bl / 2, CP[1] + uy * bl / 2, 0); S.barrel.scale.x = bl; S.barrel.rotation.z = a;
    S.rod.position.set(CP[0] + ux * (bl + L) / 2, CP[1] + uy * (bl + L) / 2, 0); S.rod.scale.x = Math.max(0.1, L - bl); S.rod.rotation.z = a;
  },
};
