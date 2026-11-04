// Planetary gear set
import { THREE, TAU, mod, gearGeo, ringGearGeo, cylZ, phase, fmtN, TL } from '../engine.js';
const m = 0.16, Ns = 18, Np = 12, Nr = 42;
const rs = Ns * m / 2, rp = Np * m / 2, rr = Nr * m / 2, A = rs + rp;
const ps = TAU / Ns, pp = TAU / Np, pr = TAU / Nr, c = Math.PI * m;
const WS = 1.6;
function planetAngle(alpha, ths) { const us = (alpha - ths) / ps; return alpha + Math.PI - pp * (0.5 - us); }
const thr = (() => { const thp = planetAngle(0, 0); const ap = rp * mod(thp - 0, pp); return (ap + c / 2) / rr; })();
let S = {};
export default {
  id: '02',
  view: { az: 0, el: 16, dist: 30, target: [0, 0, 0], orbit: 0.6, caz: -18, cel: 8, cdist: 17, ctarget: [-0.6, 2.0, 0], low: 0.095 },
  floorY: -4.8,
  text: {
    tr: { hook: 'Bu dişliler neden<br>her yerde?', hookSub: 'Planet dişli sistemi', labels: ['Güneş dişli (giriş)', 'Planet dişliler', 'Sabit çember dişli', 'Taşıyıcı (çıkış)'],
      c1: 'Güneş, planetler ve çember', c2a: 'Güneş döner, planetler<br>onun etrafında yürür', c2b: 'Taşıyıcı <b>yavaş ama güçlü</b> döner',
      c3a: 'Yük 3 dişliye paylaştırılır', c3b: 'Küçük hacimde <b>büyük tork</b>', fbig: '1 + 42/18 = 3,33', fsub: 'Güneş 3,33 tur atınca<br>taşıyıcı 1 tur döner',
      uses: ['Otomatik şanzımanlar', 'E-bisiklet göbek motorları', 'Akülü matkaplar', 'Rüzgar türbinleri'] },
    en: { hook: 'Why are these gears<br>everywhere?', hookSub: 'The planetary gear set', labels: ['Sun gear (input)', 'Planet gears', 'Fixed ring gear', 'Carrier (output)'],
      c1: 'Sun, planets and ring', c2a: 'The sun spins, the planets<br>walk around it', c2b: 'The carrier turns <b>slow but strong</b>',
      c3a: 'The load is shared by 3 gears', c3b: '<b>Big torque</b> in a small space', fbig: '1 + 42/18 = 3.33', fsub: 'The sun turns 3.33 times<br>for every carrier turn',
      uses: ['Automatic transmissions', 'E-bike hub motors', 'Cordless drills', 'Wind turbines'] },
  },
  kin(t) {
    const ph = phase(t), ths = WS * ph, thc = ths * Ns / (Ns + Nr);
    const pl = [0, 1, 2].map(k => { const al = thc + k * TAU / 3; return { al, th: planetAngle(al, ths), x: A * Math.cos(al), y: A * Math.sin(al) }; });
    return { ph, ths, thc, pl };
  },
  labels: [
    { c: '#7fb0ff', mat: 'blue', at: [270, 330], p: k => [rs * 0.85 * Math.cos(k.thc + Math.PI / 3), rs * 0.85 * Math.sin(k.thc + Math.PI / 3), 0.35] },
    { c: '#6fe0a4', mat: 'green', at: [800, 330], p: k => [k.pl[0].x, k.pl[0].y, 0.35] },
    { c: '#c9d1dc', mat: 'steel', at: [270, 1450], p: [-2.75, -2.75, 0.4] },
    { c: '#ffcf5c', mat: 'gold', at: [800, 1450], p: k => [1.3 * Math.cos(k.thc + TAU / 3), 1.3 * Math.sin(k.thc + TAU / 3), 0.75] },
  ],
  counters: [
    { label: { tr: 'Güneş dişli', en: 'Sun gear' }, c: '#7fb0ff', fn: (t, L) => fmtN(WS * (phase(t) - phase(Math.min(t, TL.cnt0))) / TAU, 2, L) + (L === 'tr' ? ' tur' : ' turns') },
    { label: { tr: 'Taşıyıcı', en: 'Carrier' }, c: '#ffcf5c', fn: (t, L) => fmtN(WS * (phase(t) - phase(Math.min(t, TL.cnt0))) / TAU * Ns / (Ns + Nr), 2, L) + (L === 'tr' ? ' tur' : ' turns') },
  ],
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    S.sun = M(gearGeo(Ns, m, 0.6, 0.22), mats.blue); scene.add(S.sun);
    const sh = M(cylZ(0.22, 3.4), mats.steel); sh.position.z = -1.6; S.sun.add(sh);
    const motor = M(cylZ(0.8, 1.4), mats.dark); motor.position.z = -3.6; scene.add(motor);
    S.pl = [0, 1, 2].map(() => { const g = M(gearGeo(Np, m, 0.6, 0.2), mats.green); scene.add(g); return g; });
    S.ring = M(ringGearGeo(Nr, m, rr + 0.55, 0.7), mats.steel); S.ring.rotation.z = thr; scene.add(S.ring);
    const stand = M(new THREE.BoxGeometry(2.2, 1.2, 0.9), mats.block); stand.position.set(0, -rr - 0.55 - 0.45, 0); scene.add(stand);
    S.car = new THREE.Group(); scene.add(S.car);
    const hub = M(cylZ(0.75, 0.22), mats.gold); hub.position.z = 0.62; S.car.add(hub);
    const out = M(cylZ(0.3, 1.6), mats.gold); out.position.z = 1.4; S.car.add(out);
    for (let k = 0; k < 3; k++) {
      const a = k * TAU / 3, arm = M(new THREE.BoxGeometry(A, 0.55, 0.2), mats.gold);
      arm.position.set(A / 2 * Math.cos(a), A / 2 * Math.sin(a), 0.62); arm.rotation.z = a; S.car.add(arm);
      const end = M(cylZ(0.38, 0.22), mats.gold); end.position.set(A * Math.cos(a), A * Math.sin(a), 0.62); S.car.add(end);
      const pin = M(cylZ(0.18, 1.0), mats.steel); pin.position.set(A * Math.cos(a), A * Math.sin(a), 0.2); S.car.add(pin);
    }
    ctx.arrow(0x7fb0ff, 0.95, [0, 0, 1.3], [0, 0, 1], 1);
    ctx.arrow(0xffcf5c, rr + 1.0, [0, 0, 0.8], [0, 0, 1], 1, scene, 0.35);
  },
  update(k) {
    S.sun.rotation.z = k.ths; S.car.rotation.z = k.thc;
    k.pl.forEach((p, i) => { S.pl[i].position.set(p.x, p.y, 0); S.pl[i].rotation.z = p.th; });
  },
};
