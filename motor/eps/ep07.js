// Rack and pinion (vertical rack)
import { THREE, TAU, gearGeo, extrude, cylZ, phase, fmtN, TL } from '../engine.js';
const N = 16, m = 0.25, r = N * m / 2, p = TAU / N, c = Math.PI * m, RL = 7.2, AMP = 1.3, WF = 0.8;
let S = {};
const ang = t => AMP * Math.sin(WF * phase(t) - Math.PI / 2);
export default {
  id: '07',
  view: { az: 0, el: 10, dist: 29, target: [0.9, 0.3, 0], orbit: 0.55, caz: -26, cel: 6, cdist: 13, ctarget: [1.3, 0, 0], low: 0.24, lowDist: 1.5 },
  floorY: -6.2,
  text: {
    tr: { hook: 'Dönmeyi düz<br>harekete çevir', hookSub: 'Kremayer ve pinyon: en basit yol', labels: ['Yük', 'Kremayer (dişli çubuk)', 'Pinyon', 'Kılavuz makaralar'],
      c1: 'Yuvarlak dişli, düz dişli çubuk', c2a: 'Pinyon dönünce kremayer kayar', c2b: '<b>Dönme</b> hareketi<br><b>doğrusal</b> harekete dönüşür',
      c3a: 'Her diş bir adım iter', c3b: '<b>Ters yönde</b> de çalışır', fbig: 'x = r · θ', fsub: 'r = 20 mm ise pinyonun 1 turu<br>kremayeri 126 mm taşır',
      uses: ['Otomobil direksiyonları', 'Kayar kapılar', 'CNC ve 3D yazıcılar', 'Dişli dağ demiryolları'] },
    en: { hook: 'Turn rotation into<br>a straight line', hookSub: 'Rack and pinion: the simplest way', labels: ['Load', 'Rack (toothed bar)', 'Pinion', 'Guide rollers'],
      c1: 'A round gear, a toothed bar', c2a: 'When the pinion turns, the rack slides', c2b: '<b>Rotation</b> becomes<br><b>straight-line</b> motion',
      c3a: 'Each tooth pushes one step', c3b: 'It works <b>in reverse</b> too', fbig: 'x = r · θ', fsub: 'With r = 20 mm, one pinion turn<br>moves the rack 126 mm',
      uses: ['Car steering', 'Sliding gates', 'CNC machines & 3D printers', 'Cog railways'] },
  },
  kin(t) { const th = ang(t), d = AMP * WF * Math.cos(WF * phase(t) - Math.PI / 2); return { th, y: r * th, v: d }; },
  labels: [
    { c: '#ff9d8a', mat: 'red', at: [830, 330], p: k => [r + 0.9, k.y + RL / 2 + 0.5, 0.5] },
    { c: '#ffcf5c', mat: 'gold', at: [830, 1450], p: k => [r + 0.9, k.y - 2.0, 0.35] },
    { c: '#7fb0ff', mat: 'blue', at: [250, 330], p: [-1.2, 1.2, 0.35] },
    { c: '#c9d1dc', mat: 'block', at: [250, 1450], p: [r + 1.95, -1.9, 0.3] },
  ],
  counters: [
    { label: { tr: 'Pinyon açısı', en: 'Pinion angle' }, c: '#7fb0ff', fn: (t, L, k) => Math.round(k.th * 180 / Math.PI) + '°' },
    { label: { tr: 'Kremayer', en: 'Rack' }, c: '#ffcf5c', fn: (t, L, k) => { const v = Math.round(k.th * 20); return (v > 0 ? '+' : '') + v + ' mm'; } },
  ],
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    S.pin = new THREE.Group(); scene.add(S.pin);
    S.pin.add(M(gearGeo(N, m, 0.7, 0.25), mats.blue));
    const hs = new THREE.Shape(); hs.absarc(0, 0, r - 0.55, 0, TAU, false);
    for (let i = 0; i < 5; i++) { const h = new THREE.Path(), a = i * TAU / 5; h.absarc(0.95 * Math.cos(a), 0.95 * Math.sin(a), 0.3, 0, TAU, true); hs.holes.push(h); }
    const hub = M(cylZ(0.5, 0.9), mats.blue); S.pin.add(hub);
    const sh = M(cylZ(0.25, 3.0), mats.steel); sh.position.z = -1.2; S.pin.add(sh);
    const key = M(new THREE.BoxGeometry(0.1, 0.1, 1.0), mats.dark); key.position.set(0, 0.25, 0.6); S.pin.add(key);
    const mot = M(cylZ(0.9, 1.4), mats.dark); mot.position.z = -3.0; scene.add(mot);
    const mstand = M(new THREE.BoxGeometry(1.2, 5.2, 1.0), mats.block); mstand.position.set(0, -3.6, -3.0); scene.add(mstand);
    // rack: teeth pointing -x, pitch line at x = r
    const rs = new THREE.Shape(), xt = r - m, xr = r + 1.25 * m, xb = xr + 0.75, n = Math.round(RL / c);
    const y0 = -n * c / 2;
    rs.moveTo(xb, y0); rs.lineTo(xr, y0);
    for (let i = 0; i < n; i++) { const yc = y0 + (i + 0.5) * c; rs.lineTo(xr, yc - 0.31 * c); rs.lineTo(xt, yc - 0.13 * c); rs.lineTo(xt, yc + 0.13 * c); rs.lineTo(xr, yc + 0.31 * c); }
    rs.lineTo(xr, -y0); rs.lineTo(xb, -y0); rs.closePath();
    S.rack = new THREE.Group(); scene.add(S.rack);
    S.rack.add(M(extrude(rs, 0.7, 0.02), mats.gold));
    S.off = (n % 2 === 0) ? 0.5 * c : 0; // put a rack tooth at y=0 when rack at rest
    const load = M(new THREE.BoxGeometry(2.4, 1.0, 1.6), mats.red); load.position.set((xt + xb) / 2 + 0.1, -y0 + 0.5, 0); S.rack.add(load);
    // guide rollers
    for (const y of [-2.0, 2.0]) {
      const g = new THREE.Group(); g.position.set(xb + 0.32, y, 0); scene.add(g);
      const rl = M(cylZ(0.32, 0.6), mats.steel); g.add(rl); S['r' + y] = rl;
      const ax = M(cylZ(0.1, 1.6), mats.dark); ax.position.z = -0.6; g.add(ax);
    }
    const plate = M(new THREE.BoxGeometry(1.2, 6.0, 0.3), mats.block); plate.position.set(xb + 0.5, 0, -1.4); scene.add(plate);
    const foot = M(new THREE.BoxGeometry(3.4, 0.5, 2.0), mats.block); foot.position.set(1.0, -5.95, -1.8); scene.add(foot);
    const pl2 = M(new THREE.BoxGeometry(1.2, 3.1, 0.3), mats.block); pl2.position.set(xb + 0.5, -4.4, -1.4); scene.add(pl2);
    S.arrP = ctx.arrow(0x7fb0ff, 1.0, [0, 0, 0.9], [0, 0, 1], 1);
    S.arrR = ctx.linArrow(0xffcf5c, 3.2, [xb + 1.7, 0.3, 0.3], [0, 1, 0]);
  },
  update(k) {
    S.pin.rotation.z = p / 2 + k.th; S.rack.position.y = k.y + S.off;
    S['r-2'].rotation.z = -k.y / 0.32; S.r2.rotation.z = -k.y / 0.32;
    S.arrP.setSign(k.v);
  },
};
