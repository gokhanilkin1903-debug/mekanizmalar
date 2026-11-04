// Wankel rotary engine
import { THREE, TAU, mod, extrude, gearGeo, ringGearGeo, cylZ, phase, fmtN, TL } from '../engine.js';
const R = 3.0, E = 0.45, WS = 4.5, BUL = 0.42;
const housing = (a, c = 0) => { const x = E * Math.cos(3 * a) + R * Math.cos(a), y = E * Math.sin(3 * a) + R * Math.sin(a); const n = Math.hypot(x, y); return [x + c * x / n, y + c * y / n]; };
const m = 0.1, Ni = 30, Nf = 20, ri = Ni * m / 2, rf = Nf * m / 2, cP = Math.PI * m;
const TH0 = 0.3, ringOff = (TH0 + (rf * mod(-TH0, TAU / Nf) + cP / 2) / ri) - TH0 / 3; // internal gear phase (relative to rotor)
let S = {};
function flank(C, phi, k, n = 24) { // points from tip k to tip k+1 (CCW)
  const a0 = phi + k * TAU / 3, a1 = a0 + TAU / 3, pts = [];
  const p0 = [C[0] + (R - 0.02) * Math.cos(a0), C[1] + (R - 0.02) * Math.sin(a0)], p1 = [C[0] + (R - 0.02) * Math.cos(a1), C[1] + (R - 0.02) * Math.sin(a1)];
  const mid = (a0 + a1) / 2, nx = Math.cos(mid), ny = Math.sin(mid);
  for (let i = 0; i <= n; i++) { const u = i / n, b = BUL * Math.sin(Math.PI * u); pts.push([p0[0] + (p1[0] - p0[0]) * u + b * nx, p0[1] + (p1[1] - p0[1]) * u + b * ny]); }
  return pts;
}
const PH = { tr: ['Emme', 'Sıkıştırma', 'Ateşleme', 'Egzoz'], en: ['Intake', 'Compression', 'Power', 'Exhaust'] };
const COL = ['#4da3ff', '#a98bff', '#ff8a3d', '#9aa5b5'];
const phaseIdx = mu => { const d = mod(mu * 180 / Math.PI, 360); return d < 90 ? 3 : d < 180 ? 0 : d < 270 ? 1 : 2; };
export default {
  id: '14',
  view: { az: 0, el: 14, dist: 24, target: [0, 0.2, 0], orbit: 0.55, caz: -24, cel: 8, cdist: 13, ctarget: [0, -1.2, 0], low: 0.15, lowDist: 1.2 },
  floorY: -4.6,
  text: {
    tr: { hook: 'Pistonsuz motor', hookSub: 'Wankel (döner) motor', labels: ['Gövde (epitrokoid)', 'Buji', 'Rotor', 'Eksantrik mil'],
      c1: 'Üçgen rotor, oval gövde', c2a: 'Rotor dönerken 3 oda oluşur', c2b: 'Emme, sıkıştırma, ateşleme<br>ve egzoz <b>aynı anda</b>',
      c3a: 'Rotor uçları gövdeye<br>hep temas eder', c3b: 'Rotor 1 tur atarken<br>mil <b>3 tur</b> döner', fbig: '3 : 1', fsub: 'Her mil turunda bir ateşleme:<br>az parça, yüksek devir',
      uses: ['Spor otomobiller', 'Hafif uçak motorları', 'İHA ve drone motorları', 'Menzil uzatıcılı elektrikli araçlar'] },
    en: { hook: 'An engine<br>without pistons', hookSub: 'The Wankel rotary engine', labels: ['Housing (epitrochoid)', 'Spark plug', 'Rotor', 'Eccentric shaft'],
      c1: 'A triangular rotor, an oval housing', c2a: 'As the rotor turns,<br>it forms 3 chambers', c2b: 'Intake, compression, power,<br>exhaust: <b>all at once</b>',
      c3a: 'The rotor tips always<br>touch the housing', c3b: 'For each rotor turn,<br>the shaft turns <b>3 times</b>', fbig: '3 : 1', fsub: 'One power stroke per shaft turn:<br>few parts, high revs',
      uses: ['Sports cars', 'Light aircraft engines', 'UAV and drone engines', 'Range-extender EVs'] },
  },
  kin(t) { const th = WS * phase(t) + 0.3, phi = th / 3, C = [E * Math.cos(th), E * Math.sin(th)]; return { th, phi, C }; },
  labels: [
    { c: '#c9d1dc', mat: 'steel', at: [250, 330], p: housing(2.3, 0.5).concat([0.5]) },
    { c: '#ffcf5c', mat: 'red', at: [830, 1450], p: [0.45, -R + E - 0.9, 0.3] },
    { c: '#ffcf5c', mat: 'gold', at: [830, 330], p: k => [k.C[0] + 1.6 * Math.cos(k.phi + 0.5), k.C[1] + 1.6 * Math.sin(k.phi + 0.5), 0.5] },
    { c: '#7fb0ff', mat: 'blue', at: [250, 1450], p: [0, 0, 0.9] },
  ],
  counters: [
    { label: { tr: 'Eksantrik mil', en: 'Shaft' }, c: '#7fb0ff', fn: (t, L) => fmtN(WS * (phase(t) - phase(Math.min(t, TL.cnt0))) / TAU, 2, L) + (L === 'tr' ? ' tur' : ' turns') },
    { label: { tr: 'Rotor', en: 'Rotor' }, c: '#ffcf5c', fn: (t, L) => fmtN(WS * (phase(t) - phase(Math.min(t, TL.cnt0))) / TAU / 3, 2, L) + (L === 'tr' ? ' tur' : ' turns') },
  ],
  overlay(t, k, ctx) {
    let out = '';
    for (let j = 0; j < 3; j++) {
      const a0 = k.phi + j * TAU / 3, pts = flank(k.C, k.phi, j, 16);
      const hp = []; for (let i = 0; i <= 20; i++) hp.push(housing(a0 + TAU / 3 * (1 - i / 20), 0));
      const poly = pts.concat(hp).map(p => ctx.project([p[0], p[1], 0.5]).map(v => v.toFixed(1)).join(',')).join(' ');
      const idx = phaseIdx(a0 + Math.PI / 3);
      let op = 0.42;
      if (idx === 2) { const d = mod((a0 + Math.PI / 3) * 180 / Math.PI, 360) - 270; op = 0.45 + 0.4 * Math.exp(-d / 25); }
      out += `<polygon points="${poly}" fill="${COL[idx]}" fill-opacity="${op.toFixed(2)}" stroke="none"/>`;
      if (t > 10.3 && t < 16.6) {
        const c = housing(a0 + Math.PI / 3, -0.75), [x, y] = ctx.project([c[0], c[1], 0.5]);
        const o = Math.min(1, (t - 10.3) * 3, (16.6 - t) * 3);
        out += `<text x="${x}" y="${y}" fill="#fff" font-size="34" font-weight="800" text-anchor="middle" dominant-baseline="middle" opacity="${o}" style="paint-order:stroke;stroke:#0b1220;stroke-width:6px">${PH[ctx.L][idx]}</text>`;
      }
    }
    return out;
  },
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    // housing
    const hs = new THREE.Shape(); hs.moveTo(-4.4, -3.6); hs.lineTo(4.4, -3.6); hs.lineTo(4.4, 3.6); hs.lineTo(-4.4, 3.6); hs.closePath();
    const hole = []; for (let i = 0; i < 240; i++) hole.push(new THREE.Vector2(...housing(-i / 240 * TAU, 0.02)));
    hs.holes.push(new THREE.Path(hole));
    for (const [x, y] of [[-3.9, -3.1], [3.9, -3.1], [-3.9, 3.1], [3.9, 3.1]]) { const h = new THREE.Path(); h.absarc(x, y, 0.2, 0, TAU, true); hs.holes.push(h); }
    const hm = M(extrude(hs, 1.0, 0.04, 8), mats.steel); scene.add(hm);
    const back = M(new THREE.BoxGeometry(8.8, 7.2, 0.25), mats.dark); back.position.z = -0.62; scene.add(back);
    // ports + plugs
    for (const [a, col] of [[Math.PI * 0.62, 0x4da3ff], [Math.PI * 0.38, 0x9aa5b5]]) {
      const p = housing(a, 0.6), tube = M(new THREE.CylinderGeometry(0.32, 0.32, 1.5, 24), new THREE.MeshStandardMaterial({ color: col, metalness: 0.4, roughness: 0.4 }));
      tube.position.set(p[0] * 1.05, p[1] + 0.6, 0); tube.rotation.z = a - Math.PI / 2; scene.add(tube);
    }
    for (const a of [Math.PI * 1.45, Math.PI * 1.55]) {
      const p = housing(a, 0.7), pl = M(new THREE.CylinderGeometry(0.16, 0.16, 1.3, 16), mats.red); pl.position.set(p[0], p[1] - 0.2, 0); pl.rotation.z = a - Math.PI / 2; scene.add(pl);
      const tip = M(new THREE.CylinderGeometry(0.26, 0.26, 0.4, 6), mats.dark); tip.position.set(p[0] * 1.3, p[1] - 0.75, 0); tip.rotation.z = a - Math.PI / 2; scene.add(tip);
    }
    // rotor (built at origin with phi = 0)
    S.rotor = new THREE.Group(); scene.add(S.rotor);
    const rs = new THREE.Shape(), all = [];
    for (let j = 0; j < 3; j++) { const f = flank([0, 0], 0, j, 24); all.push(...(j ? f.slice(1) : f)); }
    all.forEach(([x, y], i) => i ? rs.lineTo(x, y) : rs.moveTo(x, y)); rs.closePath();
    const rh = new THREE.Path(); rh.absarc(0, 0, ri + 0.22, 0, TAU, true); rs.holes.push(rh);
    S.rotor.add(M(extrude(rs, 0.9, 0.03, 8), mats.gold));
    const ig = M(ringGearGeo(Ni, m, ri + 0.4, 0.16), mats.gold); ig.position.z = 0.5; S.rotorGear = ig; S.rotor.add(ig);
    const fg = M(gearGeo(Nf, m, 0.16, 0.5), mats.dark); fg.position.z = 0.5; scene.add(fg);
    // eccentric shaft
    S.shaft = new THREE.Group(); scene.add(S.shaft);
    const sh = M(cylZ(0.42, 3.6), mats.blue); sh.position.z = -0.4; S.shaft.add(sh);
    const lobe = M(cylZ(1.15, 0.8), mats.blue); lobe.position.set(E, 0, 0); S.shaft.add(lobe);
    const mark = M(new THREE.BoxGeometry(0.7, 0.12, 0.12), mats.dark); mark.position.set(0.35, 0, 1.45); S.shaft.add(mark);
    const stand = M(new THREE.BoxGeometry(3.0, 0.8, 1.6), mats.block); stand.position.set(0, -4.2, -0.2); scene.add(stand);
    ctx.arrow(0x7fb0ff, 0.8, [0, 0, 1.6], [0, 0, 1], 1, scene, 1.5);
    ctx.arrow(0xffcf5c, 2.4, [0, 0, 0.7], [0, 0, 1], 1, scene, 0.4);
  },
  update(k) {
    S.rotor.position.set(k.C[0], k.C[1], 0); S.rotor.rotation.z = k.phi;
    S.rotorGear.rotation.z = ringOff;
    S.shaft.rotation.z = k.th;
  },
};
