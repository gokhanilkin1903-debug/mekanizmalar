// Tusi couple + trammel (ellipsograph)
import { THREE, TAU, gearGeo, ringGearGeo, extrude, capsuleShape, cylZ, phase, fade, TL } from '../engine.js';
const m = 0.1, NR = 60, NP = 30, RR = NR * m / 2, RP = NP * m / 2, WC = 1.3, cP = Math.PI * m;
const thr = (cP / 2) / RR;
const kinAt = th => { const C = [RP * Math.cos(th), RP * Math.sin(th)], X = [2 * RP * Math.cos(th), 0], Y = [0, 2 * RP * Math.sin(th)]; const E = [Y[0] + 0.5 * (Y[0] - X[0]), Y[1] + 0.5 * (Y[1] - X[1])]; return { th, C, X, Y, E }; };
let S = {};
export default {
  id: '18',
  view: { az: 0, el: 10, dist: 26, target: [0, 0.3, 0], orbit: 0.5, caz: -22, cel: 8, cdist: 13, ctarget: [1.2, 0.6, 0], low: 0.17, lowDist: 1.25 },
  floorY: -5.2,
  text: {
    tr: { hook: 'Dairelerden kusursuz<br>düz çizgi', hookSub: 'Tusi çifti', labels: ['Sabit çember dişli (60)', 'Küçük dişli (30)', 'Krank kolu', 'Kızaklar'],
      c1: 'Büyük çember, yarı çapında<br>bir dişli', c2a: 'Küçük dişli çemberin<br>içinde yuvarlanır', c2b: 'Kenarındaki her nokta<br><b>düz bir çizgi</b> çizer',
      c3a: 'İki nokta, iki dik çizgi', c3b: 'Aralarındaki çubuk<br>bir <b>elips</b> çizer', fbig: 'R = 2r', fsub: 'Nasîrüddin Tûsî bunu 13. yüzyılda<br>gezegen hareketleri için buldu',
      uses: ['Elips çizim aletleri', 'Düz çizgi mekanizmaları', 'Hiposikloid motorlar', 'Astronomi tarihi'] },
    en: { hook: 'A perfect straight line<br>from circles', hookSub: 'The Tusi couple', labels: ['Fixed ring gear (60)', 'Small gear (30)', 'Crank arm', 'Slides'],
      c1: 'A big ring, a gear<br>half its size', c2a: 'The small gear rolls<br>inside the ring', c2b: 'Every point on its rim<br>draws a <b>straight line</b>',
      c3a: 'Two points, two perpendicular lines', c3b: 'The rod between them<br>draws an <b>ellipse</b>', fbig: 'R = 2r', fsub: 'Nasir al-Din al-Tusi found it in the<br>13th century to model planetary motion',
      uses: ['Ellipse-drawing tools', 'Straight-line mechanisms', 'Hypocycloid engines', 'History of astronomy'] },
  },
  kin(t) { const ph = phase(t); return { ph, ...kinAt(WC * ph) }; },
  labels: [
    { c: '#c9d1dc', mat: 'steel', at: [250, 330], p: [-2.6, 2.6, 0.4] },
    { c: '#6fe0a4', mat: 'green', at: [830, 330], p: k => [k.C[0] + 0.7, k.C[1] + 0.7, 0.3] },
    { c: '#ffcf5c', mat: 'gold', at: [250, 1450], p: k => [k.C[0] / 2, k.C[1] / 2, 0.45] },
    { c: '#ff9d8a', mat: 'red', at: [830, 1450], p: k => [k.X[0], -0.25, 0.8] },
  ],
  overlay(t, k, ctx) {
    let out = '';
    const lo = fade(t, 13.2, 40, 0.6);
    if (lo > 0.01) {
      const a = ctx.project([-3.1, 0, 0.75]), b = ctx.project([3.1, 0, 0.75]), c = ctx.project([0, -3.1, 0.75]), d = ctx.project([0, 3.1, 0.75]);
      out += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#ff9d8a" stroke-width="5" stroke-dasharray="14 10" opacity="${lo * 0.9}"/>`;
      out += `<line x1="${c[0]}" y1="${c[1]}" x2="${d[0]}" y2="${d[1]}" stroke="#7fb0ff" stroke-width="5" stroke-dasharray="14 10" opacity="${lo * 0.9}"/>`;
    }
    const n = 200, rev = TAU / WC, pts = [];
    for (let i = 0; i <= n; i++) { const ph = k.ph - rev * i / n; if (ph < 0) break; const E = kinAt(WC * ph).E; const [x, y] = ctx.project([E[0], E[1], 1.05]); pts.push(`${x.toFixed(1)},${y.toFixed(1)}`); }
    out += `<polyline points="${pts.join(' ')}" fill="none" stroke="#ff7ad9" stroke-width="7" stroke-linecap="round" opacity="${0.35 + 0.65 * fade(t, 16.8, 40, 0.6)}"/>`;
    return out;
  },
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    const ring = M(ringGearGeo(NR, m, RR + 0.55, 0.5), mats.steel); ring.rotation.z = thr; scene.add(ring);
    const back = M(new THREE.CylinderGeometry(RR + 0.55, RR + 0.55, 0.2, 64).rotateX(Math.PI / 2), mats.dark); back.position.z = -0.4; scene.add(back);
    S.gear = new THREE.Group(); scene.add(S.gear);
    const g = M(gearGeo(NP, m, 0.5, 0.2), mats.green); S.gear.add(g);
    for (const a of [0, Math.PI]) { const post = M(cylZ(0.11, 0.8), mats.steel); post.position.set(RP * Math.cos(a), RP * Math.sin(a), 0.4); S.gear.add(post); }
    S.arm = M(extrude(capsuleShape(RP, 0.22), 0.14), mats.gold); S.arm.position.z = 0.36; scene.add(S.arm);
    const hub = M(cylZ(0.3, 0.5), mats.gold); hub.position.z = 0.2; scene.add(hub);
    // slides (front layer)
    for (const [w, h, x, y] of [[6.8, 0.08, 0, 0.24], [6.8, 0.08, 0, -0.24], [0.08, 6.8, 0.24, 0], [0.08, 6.8, -0.24, 0]]) { const rl = M(new THREE.BoxGeometry(w, h, 0.12), mats.dark); rl.position.set(x, y, 0.78); scene.add(rl); }
    S.sx = M(new THREE.BoxGeometry(0.6, 0.38, 0.3), mats.red); scene.add(S.sx);
    S.sy = M(new THREE.BoxGeometry(0.38, 0.6, 0.3), mats.blue); scene.add(S.sy);
    S.rod = M(new THREE.BoxGeometry(1, 0.16, 0.1), mats.gold); scene.add(S.rod);
    S.pen = M(new THREE.ConeGeometry(0.16, 0.4, 16).rotateX(-Math.PI / 2), mats.red); scene.add(S.pen);
    ctx.arrow(0xffcf5c, 0.9, [0, 0, 0.9], [0, 0, 1], 1, scene, 0.8);
    ctx.linArrow(0xff9d8a, 2.0, [2.2, -0.9, 0.9], [1, 0, 0]);
    ctx.linArrow(0x7fb0ff, 2.0, [-0.9, 2.2, 0.9], [0, 1, 0]);
  },
  update(k) {
    S.gear.position.set(k.C[0], k.C[1], 0); S.gear.rotation.z = -k.th;
    S.arm.rotation.z = k.th;
    S.sx.position.set(k.X[0], 0, 0.82); S.sy.position.set(0, k.Y[1], 0.82);
    const dx = k.E[0] - k.X[0], dy = k.E[1] - k.X[1];
    S.rod.position.set((k.X[0] + k.E[0]) / 2, (k.X[1] + k.E[1]) / 2, 1.02); S.rod.scale.x = Math.hypot(dx, dy); S.rod.rotation.z = Math.atan2(dy, dx);
    S.pen.position.set(k.E[0], k.E[1], 1.05);
  },
};
