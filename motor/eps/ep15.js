// Lead screw and nut (vertical)
import { THREE, TAU, cylY, cylX, phase, fmtN, TL } from '../engine.js';
const LEAD = 0.5, RH = 0.5, AMP = 30.2, WF = 0.38, Y0 = 0.0;
const theta = t => AMP * Math.sin(WF * phase(t) - Math.PI / 2);
const nutY = th => Y0 - LEAD * th / TAU;
let S = {};
export default {
  id: '15',
  view: { az: -20, el: 14, dist: 28, target: [0.3, 1.3, 0], orbit: 0.6, caz: -32, cel: 8, cdist: 13, ctarget: [0, 0.4, 0], low: 0.2, lowDist: 1.35 },
  floorY: -5.6,
  text: {
    tr: { hook: 'Mikron hassasiyetinde<br>hareket', hookSub: 'Vidalı mil ve somun', labels: ['Vidalı mil', 'Somun ve tabla', 'Kılavuz miller', 'Step motor'],
      c1: 'Dönen vida, kayan somun', c2a: 'Vida döner, somun dönemez', c2b: 'Bu yüzden somun<br><b>yukarı-aşağı</b> kayar',
      c3a: 'Her turda somun<br>1 hatve ilerler', c3b: 'Küçük adım,<br><b>büyük hassasiyet</b>', fbig: '1 tur = 2 mm', fsub: 'Step motor 200 adımda tur atarsa<br>her adım sadece 0,01 mm',
      uses: ['3D yazıcılar', 'CNC tezgahları', 'Mengene ve krikolar', 'Laboratuvar pozisyonlayıcıları'] },
    en: { hook: 'Motion with<br>micron precision', hookSub: 'Lead screw and nut', labels: ['Lead screw', 'Nut and carriage', 'Guide rods', 'Stepper motor'],
      c1: 'A turning screw, a sliding nut', c2a: 'The screw turns, the nut can’t', c2b: 'So the nut slides<br><b>up and down</b>',
      c3a: 'Each turn moves the nut<br>by one pitch', c3b: 'Small steps,<br><b>high precision</b>', fbig: '1 turn = 2 mm', fsub: 'With a 200-step motor,<br>each step is just 0.01 mm',
      uses: ['3D printers', 'CNC machines', 'Vises and jacks', 'Lab positioning stages'] },
  },
  kin(t) { const th = theta(t), e = 1e-3, v = (theta(t + e) - theta(t - e)) / (2 * e); return { th, y: nutY(th), v }; },
  labels: [
    { c: '#ffcf5c', mat: 'gold', at: [250, 330], p: k => [0.45, k.y + 2.0 > 3.3 ? k.y - 1.8 : k.y + 1.8, 0.3] },
    { c: '#ff9d8a', mat: 'red', at: [830, 760], p: k => [1.0, k.y, 0.7] },
    { c: '#c9d1dc', mat: 'steel', at: [830, 1450], p: [-1.7, -2.6, 0.2] },
    { c: '#7fb0ff', mat: 'dark', at: [250, 1450], p: [-0.5, -4.6, 0.6] },
  ],
  counters: [
    { label: { tr: 'Motor', en: 'Motor' }, c: '#7fb0ff', fn: (t, L, k) => fmtN(k.th / TAU, 1, L) + (L === 'tr' ? ' tur' : ' turns') },
    { label: { tr: 'Somun', en: 'Nut' }, c: '#ff9d8a', fn: (t, L, k) => { const v = -k.th / TAU * 2; return (v >= 0 ? '+' : '') + fmtN(v, 2, L) + ' mm'; } },
  ],
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    S.screw = new THREE.Group(); scene.add(S.screw);
    S.screw.add(M(cylY(0.4, 7.6, 32), mats.gold));
    const pts = [], H = 3.7, n = 1400; const s0 = -H * TAU / LEAD, s1 = H * TAU / LEAD;
    for (let i = 0; i <= n; i++) { const s = s0 + (s1 - s0) * i / n; pts.push(new THREE.Vector3(RH * Math.cos(s), s * LEAD / TAU, -RH * Math.sin(s))); }
    S.screw.add(M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n, 0.18, 8, false), mats.gold));
    const key = M(new THREE.BoxGeometry(0.12, 0.6, 0.12), mats.dark); key.position.set(0.3, -4.1, 0); S.screw.add(key);
    const cpl = M(cylY(0.42, 0.7, 24), mats.steel); cpl.position.y = -4.05; S.screw.add(cpl);
    // motor & frame
    const mot = M(new THREE.BoxGeometry(1.5, 1.4, 1.5), mats.dark); mot.position.y = -5.1; scene.add(mot);
    const top = M(new THREE.BoxGeometry(4.4, 0.5, 1.4), mats.block); top.position.y = 4.15; scene.add(top);
    const base = M(new THREE.BoxGeometry(4.4, 0.4, 1.8), mats.block); base.position.y = -4.6; scene.add(base);
    for (const x of [-1.7, 1.7]) { const r = M(cylY(0.17, 8.4, 20), mats.steel); r.position.set(x, -0.2, 0); scene.add(r); }
    // nut + carriage
    S.nut = new THREE.Group(); scene.add(S.nut);
    const nut = M(new THREE.CylinderGeometry(0.85, 0.85, 1.0, 6), mats.red); S.nut.add(nut);
    const plate = M(new THREE.BoxGeometry(4.2, 0.22, 1.5), mats.red); plate.position.y = 0.6; S.nut.add(plate);
    for (const x of [-1.7, 1.7]) { const b = M(cylY(0.34, 0.9, 20), mats.steel); b.position.set(x, 0.3, 0); S.nut.add(b); }
    const load = M(new THREE.BoxGeometry(1.6, 0.7, 1.1), mats.blue); load.position.set(0, 1.05, 0); S.nut.add(load);
    ctx.arrow(0xffcf5c, 0.85, [0, -3.0, 0], [0, 1, 0], 1, scene, 1.6);
    ctx.linArrow(0xff9d8a, 2.6, [2.6, 0, 0.3], [0, 1, 0]);
    S.arr = null;
  },
  update(k) { S.screw.rotation.y = k.th; S.nut.position.y = k.y; },
};
