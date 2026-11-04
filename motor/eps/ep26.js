// Cycloidal drive 10:1
import { THREE, TAU, extrude, cylZ, phase, fmtN, TL } from '../engine.js';
const N = 11, RP = 3.0, RR = 0.25, E = 0.18, WI = 6.0, RO = 1.7, ROP = 0.35;
const prof = []; for (let i = 0; i < 900; i++) { const t = i / 900 * TAU, ps = Math.atan2(Math.sin((1 - N) * t), RP / (E * N) - Math.cos((1 - N) * t)); prof.push([RP * Math.cos(t) - RR * Math.cos(t + ps) - E * Math.cos(N * t), -RP * Math.sin(t) + RR * Math.sin(t + ps) + E * Math.sin(N * t)]); }
const pins = [...Array(N).keys()].map(k => [RP * Math.cos(k * TAU / N), RP * Math.sin(k * TAU / N)]);
function clearance(th, phi) { const C = [E * Math.cos(th), E * Math.sin(th)], c = Math.cos(phi), s = Math.sin(phi); let mn = 1e9;
  for (const P of pins) { let best = 1e9; for (let i = 0; i < prof.length; i += 3) { const x = C[0] + prof[i][0] * c - prof[i][1] * s, y = C[1] + prof[i][0] * s + prof[i][1] * c; const d = Math.hypot(x - P[0], y - P[1]); if (d < best) best = d; } mn = Math.min(mn, best - RR); } return mn; }
// choose disc phase and rotation sense numerically (max clearance ~ 0, never negative)
const SOL = (() => { let best = null;
  for (const sgn of [-1, 1]) for (let j = 0; j < 120; j++) { const p0 = j / 120 * TAU / (N - 1); let mn = 1e9; for (const th of [0, 0.7, 1.9]) mn = Math.min(mn, clearance(th, p0 + sgn * th / (N - 1))); if (!best || mn > best.mn) best = { mn, p0, sgn }; }
  return best; })();
let S = {};
const turns = t => WI * (phase(t) - phase(Math.min(t, TL.cnt0))) / TAU;
export default {
  id: '26',
  view: { az: -14, el: 12, dist: 23, target: [0, 0.2, 0], orbit: 0.55, caz: -26, cel: 8, cdist: 11, ctarget: [1.6, 1.4, 0], low: 0.17, lowDist: 1.25 },
  floorY: -4.6,
  text: {
    tr: { hook: 'Robotların<br>gizli kası', hookSub: 'Sikloid redüktör', labels: ['Sabit pimler (11)', 'Sikloid disk (10 lob)', 'Eksantrik giriş mili', 'Çıkış plakası'],
      c1: 'Eksantrik, sikloid disk ve 11 pim', c2a: 'Eksantrik döndükçe disk<br>pimler üzerinde yuvarlanır', c2b: 'Her turda disk<br><b>yalnızca bir lob</b> geri döner',
      c3a: 'Pimlerin çoğu aynı anda temas eder', c3b: 'Darbelere karşı<br><b>çok dayanıklı</b>', fbig: '10 : 1', fsub: 'Tek kademede yüksek oran,<br>neredeyse sıfır boşluk',
      uses: ['Endüstriyel robot eklemleri', 'CNC döner tablalar', 'Konveyör tahrikleri', 'Vinç ve kaldırma sistemleri'] },
    en: { hook: 'The hidden muscle<br>of robots', hookSub: 'The cycloidal drive', labels: ['Fixed pins (11)', 'Cycloidal disc (10 lobes)', 'Eccentric input shaft', 'Output plate'],
      c1: 'An eccentric, a cycloidal disc<br>and 11 pins', c2a: 'As the eccentric spins,<br>the disc rolls along the pins', c2b: 'Each turn, the disc steps back<br><b>just one lobe</b>',
      c3a: 'Many pins touch at once', c3b: 'So it’s <b>very shock-resistant</b>', fbig: '10 : 1', fsub: 'High ratio in one stage,<br>almost zero backlash',
      uses: ['Industrial robot joints', 'CNC rotary tables', 'Conveyor drives', 'Cranes and hoists'] },
  },
  kin(t) { const th = WI * phase(t); return { th, C: [E * Math.cos(th), E * Math.sin(th)], phi: SOL.p0 + SOL.sgn * th / (N - 1) }; },
  labels: [
    { c: '#c9d1dc', mat: 'steel', at: [830, 330], p: [pins[2][0], pins[2][1], 0.4] },
    { c: '#ffcf5c', mat: 'gold', at: [250, 330], p: k => [k.C[0] - 1.9, k.C[1] + 1.2, 0.3] },
    { c: '#7fb0ff', mat: 'blue', at: [250, 1450], p: [0, 0, 1.0] },
    { c: '#ff9d8a', mat: 'red', at: [830, 1450], p: k => [RO * Math.cos(k.phi - SOL.p0 - 0.9), RO * Math.sin(k.phi - SOL.p0 - 0.9), 0.75] },
  ],
  counters: [
    { label: { tr: 'Giriş', en: 'Input' }, c: '#7fb0ff', fn: (t, L) => fmtN(turns(t), 2, L) + (L === 'tr' ? ' tur' : ' turns') },
    { label: { tr: 'Çıkış', en: 'Output' }, c: '#ff9d8a', fn: (t, L) => fmtN(turns(t) / (N - 1), 3, L) + (L === 'tr' ? ' tur' : ' turns') },
  ],
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    const hs = new THREE.Shape(); hs.absarc(0, 0, RP + 0.75, 0, TAU, false); const hh = new THREE.Path(); hh.absarc(0, 0, RP + 0.05, 0, TAU, true); hs.holes.push(hh);
    const housing = M(extrude(hs, 0.6, 0.03, 64), mats.dark); scene.add(housing);
    const back = M(cylZ(RP + 0.75, 0.2, 64), mats.dark); back.position.z = -0.45; scene.add(back);
    for (const P of pins) { const p = M(cylZ(RR, 0.75, 24), mats.steel); p.position.set(P[0], P[1], 0); scene.add(p); }
    const ds = new THREE.Shape(); prof.forEach(([x, y], i) => i ? ds.lineTo(x, y) : ds.moveTo(x, y)); ds.closePath();
    const ch = new THREE.Path(); ch.absarc(0, 0, 0.92, 0, TAU, true); ds.holes.push(ch);
    for (let i = 0; i < 6; i++) { const h = new THREE.Path(), a = i * TAU / 6; h.absarc(RO * Math.cos(a), RO * Math.sin(a), ROP + E, 0, TAU, true); ds.holes.push(h); }
    S.disc = M(extrude(ds, 0.5, 0.02, 24), mats.gold); scene.add(S.disc);
    S.inp = new THREE.Group(); scene.add(S.inp);
    const sh = M(cylZ(0.32, 3.0), mats.blue); sh.position.z = -0.6; S.inp.add(sh);
    const lobe = M(cylZ(0.88, 0.5), mats.blue); lobe.position.set(E, 0, 0); S.inp.add(lobe);
    const mk = M(new THREE.BoxGeometry(0.6, 0.12, 0.1), mats.dark); mk.position.set(0.4, 0, 0.9); S.inp.add(mk);
    S.out = new THREE.Group(); scene.add(S.out);
    for (let i = 0; i < 6; i++) { const a = i * TAU / 6, p = M(cylZ(ROP, 1.0, 24), mats.red); p.position.set(RO * Math.cos(a), RO * Math.sin(a), 0.2); S.out.add(p); const sp = M(new THREE.BoxGeometry(RO, 0.24, 0.12), mats.red); sp.position.set(RO / 2 * Math.cos(a), RO / 2 * Math.sin(a), 0.72); sp.rotation.z = a; S.out.add(sp); }
    const ring = M(new THREE.TorusGeometry(RO, 0.1, 10, 64), mats.red); ring.position.z = 0.72; S.out.add(ring);
    const stand = M(new THREE.BoxGeometry(2.6, 0.7, 1.4), mats.block); stand.position.set(0, -4.1, -0.1); scene.add(stand);
    ctx.arrow(0x7fb0ff, 0.75, [0, 0, 1.25], [0, 0, 1], 1, scene, 1.6);
    ctx.arrow(0xff9d8a, RO + 0.9, [0, 0, 0.9], [0, 0, 1], SOL.sgn, scene, 0.25);
  },
  update(k) {
    S.disc.position.set(k.C[0], k.C[1], 0); S.disc.rotation.z = k.phi;
    S.inp.rotation.z = k.th; S.out.rotation.z = k.phi - SOL.p0;
  },
};
