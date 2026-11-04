// Open differential with bevel gears
import { THREE, TAU, ss, cylX, cylY, cylZ, setRod, phase, speedF, fmtN, TL } from '../engine.js';
const W = 1.2, D45 = Math.PI / 4, NS = 16, NR = 40, NP = 12;
const dR = Math.atan(NR / NP), dP = Math.atan(NP / NR), SR1 = 3.0 / Math.sin(dR), SR0 = SR1 - 0.75;
const kT = t => 0.45 * ss((t - 13.6) / 1.6);
const KT = [0]; const DT = 1 / 300; for (let i = 1; i <= 31 * 300 + 30; i++) { const t = (i - 0.5) * DT; KT.push(KT[i - 1] + kT(t) * speedF(t) * DT); }
const Kint = t => { const i = Math.max(0, Math.min(KT.length - 2, Math.floor(t / DT))); return KT[i] + (KT[i + 1] - KT[i]) * (t / DT - i); };
const Y = new THREE.Vector3(0, 1, 0);

function bevelGeo(N, d, s0, s1, innerR, backT = 0.18) {
  const pos = [];
  const sd = Math.sin(d), cd = Math.cos(d);
  const P = (s, phi, nOff, tOff) => {
    const m = 2 * s * sd / N, r = [Math.cos(phi), 0, -Math.sin(phi)], tt = [-Math.sin(phi), 0, -Math.cos(phi)];
    const g = [sd * r[0], cd, sd * r[2]], n = [cd * r[0], -sd, cd * r[2]];
    return [0, 1, 2].map(k => s * g[k] + nOff * m * n[k] + tOff * Math.PI * m * tt[k]);
  };
  for (let i = 0; i < N; i++) {
    const phi = i * TAU / N, v = [];
    for (const s of [s0, s1]) v.push(P(s, phi, -1.1, -0.27), P(s, phi, -1.1, 0.27), P(s, phi, 1.0, 0.11), P(s, phi, 1.0, -0.11));
    const quad = (a, b, c, e) => { pos.push(...v[a], ...v[b], ...v[c], ...v[a], ...v[c], ...v[e]); };
    quad(0, 3, 2, 1); quad(4, 5, 6, 7); quad(1, 2, 6, 5); quad(2, 3, 7, 6); quad(3, 0, 4, 7); quad(0, 1, 5, 4);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
  const root = s => { const m = 2 * s * sd / N; return new THREE.Vector2(s * sd - 1.1 * m * cd, s * cd + 1.1 * m * sd); };
  const r0 = root(s0), r1 = root(s1);
  const prof = [new THREE.Vector2(innerR, r0.y), r0, r1, new THREE.Vector2(r1.x, r1.y + backT), new THREE.Vector2(innerR, r1.y + backT), new THREE.Vector2(innerR, r0.y)];
  return { teeth: g, body: new THREE.LatheGeometry(prof, 72) };
}
let S = {};
function mkBevel(parent, N, d, s0, s1, innerR, mat, axis) {
  const { teeth, body } = bevelGeo(N, d, s0, s1, innerR);
  const outer = new THREE.Group(); outer.quaternion.setFromUnitVectors(Y, new THREE.Vector3(...axis).normalize()); parent.add(outer);
  const spin = new THREE.Group(); outer.add(spin);
  const m2 = mat.clone(); m2.side = THREE.DoubleSide; S.dsm.push([mat, m2]);
  const a = new THREE.Mesh(teeth, m2), b = new THREE.Mesh(body, m2); a.castShadow = b.castShadow = true; spin.add(a, b);
  const az = dir => { const v = new THREE.Vector3(...dir).applyQuaternion(outer.quaternion.clone().invert()); return Math.atan2(-v.z, v.x); };
  return { outer, spin, az, p: TAU / N };
}
export default {
  id: '12',
  view: { az: 28, el: 38, dist: 27, target: [0, -0.3, 1.0], orbit: 0.5, caz: 14, cel: 44, cdist: 17, ctarget: [0, 0.2, 0.3], low: 0.12, lowDist: 1.15 },
  floorY: -1.6,
  text: {
    tr: { hook: 'Virajda tekerlekler<br>neden kaymaz?', hookSub: 'Diferansiyel', labels: ['Pinyon (giriş)', 'Çember dişli', 'Uydu dişliler', 'Yan dişli ve aks'],
      c1: 'Pinyon, çember dişli ve<br>4 konik dişli', c2a: 'Düz yolda iki teker<br>aynı hızda döner', c2b: 'Virajda dış teker<br><b>daha hızlı</b> dönmeli',
      c3a: 'Uydu dişliler kendi<br>eksenlerinde dönmeye başlar', c3b: 'Bir taraf yavaşlar,<br>diğeri <b>hızlanır</b>', fbig: 'ω₁ + ω₂ = 2ω', fsub: 'İki tekerin hız ortalaması<br>her zaman çember dişliye eşittir',
      uses: ['Otomobiller', 'Kamyon ve otobüsler', 'Dört çeker araçlar', 'Robotlar ve RC araçlar'] },
    en: { hook: 'Why don’t wheels skid<br>in a turn?', hookSub: 'The differential', labels: ['Pinion (input)', 'Ring gear', 'Spider gears', 'Side gear and axle'],
      c1: 'A pinion, a ring gear and<br>4 bevel gears', c2a: 'On a straight road both wheels<br>turn at the same speed', c2b: 'In a turn, the outer wheel<br>must turn <b>faster</b>',
      c3a: 'The spider gears start<br>spinning on their own axis', c3b: 'One side slows down,<br>the other <b>speeds up</b>', fbig: 'ω₁ + ω₂ = 2ω', fsub: 'The average of the wheel speeds<br>always equals the ring gear speed',
      uses: ['Cars', 'Trucks and buses', '4WD vehicles', 'Robots and RC cars'] },
  },
  kin(t) { const ph = phase(t), thc = W * ph, K = W * Kint(t), k = kT(t); return { thc, rho: K, k }; },
  labels: [
    { c: '#7fb0ff', mat: 'blue', at: [250, 1450], p: [0, 0.75, 2.9] },
    { c: '#ffcf5c', mat: 'gold', at: [250, 330], p: [0.75, 2.9, 0] },
    { c: '#6fe0a4', mat: 'green', at: [830, 330], p: k => [0, 1.45 * Math.cos(k.thc), 1.45 * Math.sin(k.thc)] },
    { c: '#ff9d8a', mat: 'red', at: [830, 1450], p: [2.4, 0.3, 0] },
  ],
  counters: [
    { label: { tr: 'Sol teker', en: 'Left wheel' }, c: '#ff9d8a', fn: (t, L, k) => '%' + Math.round(100 * (1 - k.k)) },
    { label: { tr: 'Sağ teker', en: 'Right wheel' }, c: '#ff9d8a', fn: (t, L, k) => '%' + Math.round(100 * (1 + k.k)) },
  ],
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    S.dsm = [];
    S.car = new THREE.Group(); scene.add(S.car);
    S.ring = mkBevel(S.car, NR, dR, SR0, SR1, 2.0, mats.gold, [1, 0, 0]);
    S.pin = mkBevel(scene, NP, dP, SR0, SR1, 0.25, mats.blue, [0, 0, 1]);
    S.spT = mkBevel(S.car, NS, D45, 1.35, 2.0, 0.18, mats.green, [0, 1, 0]);
    S.spB = mkBevel(S.car, NS, D45, 1.35, 2.0, 0.18, mats.green, [0, -1, 0]);
    S.sR = mkBevel(scene, NS, D45, 1.35, 2.0, 0.22, mats.red, [1, 0, 0]);
    S.sL = mkBevel(scene, NS, D45, 1.35, 2.0, 0.22, mats.red, [-1, 0, 0]);
    S.ph = {
      sR: S.sR.az([0, 1, 0]), sL: S.sL.az([0, 1, 0]), spT: S.spT.az([1, 0, 0]) + S.spT.p / 2, spB: S.spB.az([1, 0, 0]) + S.spB.p / 2,
      ring: S.ring.az([0, 0, 1]), pin: S.pin.az([1, 0, 0]) + S.pin.p / 2,
    };
    // carrier: cross pin + struts + flange
    const cp = M(cylY(0.17, 3.9), mats.steel); S.car.add(cp);
    for (const s of [-1, 1]) {
      const st = M(cylY(0.16, 1, 12), mats.dark); setRod(st, [0, s * 1.95, 0], [0.72, s * 2.2, 0]); S.car.add(st);
      const st2 = M(cylY(0.16, 1, 12), mats.dark); setRod(st2, [0, s * 1.95, 0], [-1.75, s * 0.75, 0]); S.car.add(st2);
      const cap = M(cylY(0.3, 0.3), mats.dark); cap.position.y = s * 1.95; S.car.add(cap);
    }
    const fl = M(new THREE.TorusGeometry(0.75, 0.12, 10, 40).rotateY(Math.PI / 2), mats.dark); fl.position.x = -1.75; S.car.add(fl);
    // axles + wheels
    S.wheels = [];
    for (const s of [-1, 1]) {
      const ax = M(cylX(0.2, 3.4), mats.steel); ax.position.x = s * 3.2; scene.add(ax);
      const wg = new THREE.Group(); wg.position.x = s * 4.95; scene.add(wg);
      const tire = M(new THREE.TorusGeometry(1.15, 0.38, 16, 48).rotateY(Math.PI / 2), mats.dark); wg.add(tire);
      const spin = new THREE.Group(); wg.add(spin);
      const rim = M(cylX(0.85, 0.3, 40), mats.steel); spin.add(rim);
      for (let i = 0; i < 5; i++) { const h = M(cylX(0.18, 0.34, 16), mats.dark); const a = i * TAU / 5; h.position.set(0, 0.5 * Math.cos(a), 0.5 * Math.sin(a)); spin.add(h); }
      S.wheels.push(spin);
      const br = M(new THREE.BoxGeometry(0.5, 1.3, 0.9), mats.block); br.position.set(s * 2.3, -0.75, 0); scene.add(br);
    }
    const ds = M(cylZ(0.24, 3.6), mats.steel); ds.position.z = 5.6; S.pin.spin.add(ds); ds.position.set(0, 0, 0); ds.rotation.x = 0;
    S.shaft = M(cylZ(0.24, 4.4), mats.steel); S.shaft.position.z = 5.2; scene.add(S.shaft);
    const fl2 = M(cylZ(0.55, 0.25), mats.blue); fl2.position.z = 7.3; scene.add(fl2); S.fl2 = fl2;
    S.pin.spin.remove(ds);
    ctx.arrow(0xffcf5c, 3.6, [0.9, 0, 0], [1, 0, 0], 1, scene, 0.4);
    ctx.arrow(0x7fb0ff, 0.6, [0, 0, 6.2], [0, 0, 1], -1, scene, 1.3);
  },
  update(k) {
    for (const [a, b] of S.dsm) { b.emissive.copy(a.emissive); b.emissiveIntensity = a.emissiveIntensity; }
    const thc = k.thc, thR = thc + k.rho, thL = thc - k.rho;
    S.car.rotation.x = thc;
    S.ring.spin.rotation.y = S.ph.ring;
    S.pin.spin.rotation.y = S.ph.pin - thc * NR / NP;
    S.shaft.rotation.z = -thc * NR / NP; S.fl2.rotation.z = -thc * NR / NP;
    S.sR.spin.rotation.y = S.ph.sR + thR;
    S.sL.spin.rotation.y = S.ph.sL - thL;
    S.spT.spin.rotation.y = S.ph.spT - k.rho;
    S.spB.spin.rotation.y = S.ph.spB - k.rho;
    S.wheels[0].rotation.x = thL; S.wheels[1].rotation.x = thR;
  },
};
