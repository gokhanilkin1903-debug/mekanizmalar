// Harmonic (strain-wave) drive 30:1
import { THREE, TAU, extrude, ringGearGeo, cylZ, phase, fmtN, TL } from '../engine.js';
const m = 0.1, NC = 62, NF = 60, R0 = NF * m / 2, DEL = 0.1, WI = 4.0, NB = 150;
const rho = b => R0 + DEL * Math.cos(2 * b);
let S = {};
const turns = t => WI * (phase(t) - phase(Math.min(t, TL.cnt0))) / TAU;
export default {
  id: '27',
  view: { az: -10, el: 10, dist: 22, target: [0, 0.2, 0], orbit: 0.5, caz: -22, cel: 6, cdist: 12, ctarget: [2.2, 0.6, 0], low: 0.17, lowDist: 1.25 },
  floorY: -4.6,
  text: {
    tr: { hook: 'Uzaydaki robot<br>kollarının sırrı', hookSub: 'Harmonik redüktör', labels: ['Sabit dairesel dişli (62)', 'Esnek dişli (60)', 'Dalga üreteci (giriş)', 'Çıkışı izle: kırmızı diş'],
      c1: 'Elips, esnek dişli ve sabit çember', c2a: 'Elips döndükçe esnek dişli<br><b>dalgalanır</b>', c2b: 'Esnek dişlide <b>2 diş eksik</b>:<br>60’a karşı 62',
      c3a: 'Her turda esnek dişli<br><b>2 diş</b> geri kayar', c3b: 'Kırmızı dişi izle:<br><b>çok yavaş</b> döner', fbig: '30 : 1', fsub: '60 ÷ (62 − 60) = 30<br>sıfıra yakın boşluk, tek kademe',
      uses: ['Uzay robot kolları', 'İnsansı robotlar', 'Cerrahi robotlar', 'Teleskop yönlendirme'] },
    en: { hook: 'The secret of<br>space robot arms', hookSub: 'The harmonic drive', labels: ['Fixed circular spline (62)', 'Flexspline (60)', 'Wave generator (input)', 'Watch the red tooth'],
      c1: 'An ellipse, a flexible gear<br>and a fixed ring', c2a: 'As the ellipse turns,<br>the flexspline <b>ripples</b>', c2b: 'The flexspline has <b>2 fewer teeth</b>:<br>60 vs 62',
      c3a: 'Each turn it slips<br>back <b>2 teeth</b>', c3b: 'Watch the red tooth:<br>it turns <b>very slowly</b>', fbig: '30 : 1', fsub: '60 ÷ (62 − 60) = 30<br>near-zero backlash, one stage',
      uses: ['Space robot arms', 'Humanoid robots', 'Surgical robots', 'Telescope pointing'] },
  },
  kin(t) { const th = WI * phase(t); return { th, phf: -th * (NC - NF) / NF }; },
  labels: [
    { c: '#c9d1dc', mat: 'steel', at: [250, 330], p: [-2.5, 2.5, 0.35] },
    { c: '#6fe0a4', mat: 'green', at: [830, 330], p: k => [rho(1.0 - k.th) * Math.cos(1.0) * 0.97, rho(1.0 - k.th) * Math.sin(1.0) * 0.97, 0.35] },
    { c: '#7fb0ff', mat: 'blue', at: [250, 1450], p: k => [1.6 * Math.cos(k.th), 1.6 * Math.sin(k.th), 0.35] },
    { c: '#ff9d8a', mat: 'red', at: [830, 1450], p: k => [rho(k.phf - k.th) * Math.cos(k.phf), rho(k.phf - k.th) * Math.sin(k.phf), 0.4] },
  ],
  counters: [
    { label: { tr: 'Dalga üreteci', en: 'Wave generator' }, c: '#7fb0ff', fn: (t, L) => fmtN(turns(t), 2, L) + (L === 'tr' ? ' tur' : ' turns') },
    { label: { tr: 'Esnek dişli', en: 'Flexspline' }, c: '#ff9d8a', fn: (t, L) => fmtN(turns(t) / 30, 3, L) + (L === 'tr' ? ' tur' : ' turns') },
  ],
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    const ring = M(ringGearGeo(NC, m, NC * m / 2 + 0.55, 0.5), mats.steel); ring.rotation.z = Math.PI / NC; scene.add(ring);
    const back = M(cylZ(NC * m / 2 + 0.55, 0.2, 64), mats.dark); back.position.z = -0.45; scene.add(back);
    // flex band segments
    S.band = []; const seg = new THREE.BoxGeometry(1, 0.2, 0.46);
    for (let i = 0; i < NB; i++) { const b = new THREE.Mesh(seg, mats.green); b.castShadow = true; scene.add(b); S.band.push(b); }
    // flex teeth
    const ts = new THREE.Shape(); ts.moveTo(-0.13, -0.105); ts.lineTo(0.1, -0.045); ts.lineTo(0.1, 0.045); ts.lineTo(-0.13, 0.105); ts.closePath();
    const tg = extrude(ts, 0.46, 0.005, 2);
    const red = new THREE.MeshStandardMaterial({ color: 0xff4d4d, emissive: 0xff2d2d, emissiveIntensity: 0.4, roughness: 0.35 });
    S.teeth = []; for (let i = 0; i < NF; i++) { const tm = new THREE.Mesh(tg, i === 0 ? red : mats.green); scene.add(tm); S.teeth.push(tm); }
    // wave generator (ellipse cam)
    S.wg = new THREE.Group(); scene.add(S.wg);
    const es = new THREE.Shape(); for (let i = 0; i <= 120; i++) { const b = i / 120 * TAU, r = rho(b) - 0.42; i ? es.lineTo(r * Math.cos(b), r * Math.sin(b)) : es.moveTo(r * Math.cos(b), r * Math.sin(b)); }
    for (let i = 0; i < 4; i++) { const h = new THREE.Path(), a = Math.PI / 4 + i * Math.PI / 2; h.absarc(1.3 * Math.cos(a), 1.3 * Math.sin(a), 0.38, 0, TAU, true); es.holes.push(h); }
    S.wg.add(M(extrude(es, 0.4, 0.02, 8), mats.blue));
    const hub = M(cylZ(0.4, 1.2), mats.blue); S.wg.add(hub);
    const mk = M(new THREE.BoxGeometry(1.8, 0.12, 0.06), mats.dark); mk.position.set(0.9, 0, 0.62); S.wg.add(mk);
    const stand = M(new THREE.BoxGeometry(2.6, 0.7, 1.4), mats.block); stand.position.set(0, -4.1, -0.1); scene.add(stand);
    ctx.arrow(0x7fb0ff, 0.9, [0, 0, 1.0], [0, 0, 1], 1, scene, 1.4);
    ctx.arrow(0xff9d8a, 3.9, [0, 0, 0.6], [0, 0, 1], -1, scene, 0.15);
  },
  update(k) {
    S.wg.rotation.z = k.th;
    for (let i = 0; i < NB; i++) { const a0 = i / NB * TAU, a1 = (i + 1) / NB * TAU, r0 = rho(a0 - k.th) - 0.225, r1 = rho(a1 - k.th) - 0.225;
      const x0 = r0 * Math.cos(a0), y0 = r0 * Math.sin(a0), x1 = r1 * Math.cos(a1), y1 = r1 * Math.sin(a1), b = S.band[i];
      b.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0); b.rotation.z = Math.atan2(y1 - y0, x1 - x0); b.scale.x = Math.hypot(x1 - x0, y1 - y0) * 1.05; }
    for (let i = 0; i < NF; i++) { const a = i * TAU / NF + k.phf, r = rho(a - k.th); const tm = S.teeth[i]; tm.position.set(r * Math.cos(a), r * Math.sin(a), 0); tm.rotation.z = a; }
  },
};
