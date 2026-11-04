// Oldham coupling (vertical shafts)
import { THREE, TAU, mod, extrude, cylY, phase, fmtN, fade, TL } from '../engine.js';
const E = 0.8, RH = 1.5, SW = 0.5, WC = 1.6;
const A = [-E / 2, 0], B = [E / 2, 0];
function kinAt(th) {
  const u = [Math.cos(th), -Math.sin(th)], w = [-Math.sin(th), -Math.cos(th)];
  const bu = B[0] * u[0] + B[1] * u[1], aw = A[0] * w[0] + A[1] * w[1];
  return { th, M: [bu * u[0] + aw * w[0], bu * u[1] + aw * w[1]] }; // M in (x, z)
}
let S = {};
export default {
  id: '19',
  view: { az: 30, el: 24, dist: 24, target: [0, 0.0, 0], orbit: 0.7, caz: 40, cel: 30, cdist: 14, ctarget: [0, 0, 0], low: 0.17, lowDist: 1.25 },
  floorY: -4.6,
  text: {
    tr: { hook: 'Kaçık iki mil,<br>tek dönüş', hookSub: 'Oldham kavraması', labels: ['Çıkış göbeği', 'Orta disk (kayar)', 'Giriş göbeği', 'Eksen kaçıklığı'],
      c1: 'İki göbek ve kayar bir orta disk', c2a: 'Miller paralel ama<br><b>aynı eksende değil</b>', c2b: 'Orta disk iki yönde kayarak<br>farkı kapatır',
      c3a: 'Dişler değil,<br><b>dik yarıklar</b> çalışır', c3b: 'Çıkış hızı <b>tam olarak</b><br>girişe eşit', fbig: '1 : 1', fsub: 'Orta disk her mil turunda<br>küçük bir çemberde 2 tur atar',
      uses: ['Scroll kompresörler', '3D yazıcı Z eksenleri', 'Pompa tahrikleri', 'Kaçık mil bağlantıları'] },
    en: { hook: 'Two offset shafts,<br>one motion', hookSub: 'The Oldham coupling', labels: ['Output hub', 'Middle disc (slides)', 'Input hub', 'Axis offset'],
      c1: 'Two hubs and a sliding middle disc', c2a: 'The shafts are parallel but<br><b>not aligned</b>', c2b: 'The middle disc slides both ways<br>to make up the gap',
      c3a: 'Not teeth, but<br><b>perpendicular slots</b>', c3b: 'Output speed is <b>exactly</b><br>equal to input', fbig: '1 : 1', fsub: 'The middle disc circles twice<br>for every shaft turn',
      uses: ['Scroll compressors', '3D printer Z axes', 'Pump drives', 'Offset shaft connections'] },
  },
  kin(t) { const ph = phase(t); return { ph, ...kinAt(WC * ph) }; },
  labels: [
    { c: '#6fe0a4', mat: 'green', at: [830, 330], p: [B[0] + 1.1, 1.0, 0.6] },
    { c: '#ffcf5c', mat: 'gold', at: [250, 380], p: k => [k.M[0] - 1.3, 0.1, k.M[1] + 0.6] },
    { c: '#7fb0ff', mat: 'blue', at: [250, 1450], p: [A[0] - 1.2, -1.0, 0.5] },
    { c: '#ff9d8a', mat: 'red', at: [830, 1450], p: [0, -3.3, 0] },
  ],
  counters: [
    { label: { tr: 'Giriş açısı', en: 'Input angle' }, c: '#7fb0ff', fn: (t, L, k) => Math.round(mod(k.th * 180 / Math.PI, 360)) + '°' },
    { label: { tr: 'Çıkış açısı', en: 'Output angle' }, c: '#6fe0a4', fn: (t, L, k) => Math.round(mod(k.th * 180 / Math.PI, 360)) + '°' },
  ],
  overlay(t, k, ctx) {
    const o = fade(t, 13.2, 40, 0.6); if (o < 0.01) return '';
    const pts = []; for (let i = 0; i <= 120; i++) { const q = kinAt(k.th - Math.PI * i / 120).M; const [x, y] = ctx.project([q[0], 0.25, q[1]]); pts.push(`${x.toFixed(1)},${y.toFixed(1)}`); }
    const [mx, my] = ctx.project([k.M[0], 0.25, k.M[1]]);
    return `<polyline points="${pts.join(' ')}" fill="none" stroke="#ff7ad9" stroke-width="6" stroke-linecap="round" opacity="${o}"/><circle cx="${mx}" cy="${my}" r="10" fill="#ff7ad9" opacity="${o}"/>`;
  },
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    const half = sgn => { const s = new THREE.Shape(), a = Math.asin(SW / 2 / RH); if (sgn > 0) s.absarc(0, 0, RH, a, Math.PI - a, false); else s.absarc(0, 0, RH, Math.PI + a, TAU - a, false); s.closePath(); const g = extrude(s, 0.55, 0.02, 48); g.rotateX(-Math.PI / 2); return g; };
    const hub = (mat, y, x, extra) => {
      const g = new THREE.Group(); g.position.set(x, y, 0); scene.add(g);
      const inner = new THREE.Group(); inner.rotation.y = extra; g.add(inner);
      inner.add(M(half(1), mat), M(half(-1), mat));
      return g;
    };
    S.h1 = hub(mats.blue, -0.95, A[0], 0); S.h2 = hub(mats.green, 0.95, B[0], Math.PI / 2);
    const s1 = M(cylY(0.3, 3.2), mats.steel); s1.position.set(A[0], -2.85, 0); scene.add(s1); S.s1 = s1;
    const s2 = M(cylY(0.3, 3.2), mats.steel); s2.position.set(B[0], 2.85, 0); scene.add(s2); S.s2 = s2;
    for (const [s, sh] of [[S.h1, s1], [S.h2, s2]]) { const k = M(new THREE.BoxGeometry(0.08, 2.6, 0.08), mats.dark); k.position.set(0.3, 0, 0); sh.add(k); }
    S.mid = new THREE.Group(); scene.add(S.mid);
    S.mid.add(M(cylY(RH, 0.45, 48), mats.gold));
    const t1 = M(new THREE.BoxGeometry(2 * RH - 0.1, 0.7, SW - 0.06), mats.gold); t1.position.y = -0.55; S.mid.add(t1);
    const t2 = M(new THREE.BoxGeometry(SW - 0.06, 0.7, 2 * RH - 0.1), mats.gold); t2.position.y = 0.55; S.mid.add(t2);
    const mot = M(cylY(0.8, 1.3), mats.dark); mot.position.set(A[0], -4.0, 0); scene.add(mot);
    for (const [x, y] of [[A[0], -2.6], [B[0], 2.6]]) { const b = M(new THREE.BoxGeometry(1.0, 0.7, 1.0), mats.block); b.position.set(x, y, 0); scene.add(b); }
    for (const [x, c] of [[A[0], 0x7fb0ff], [B[0], 0x6fe0a4]]) { const ln = new THREE.Mesh(cylY(0.03, 8.4, 8), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.7 })); ln.position.set(x, 0, 0); scene.add(ln); }
    ctx.arrow(0x7fb0ff, 0.75, [A[0], -2.0, 0], [0, 1, 0], 1, scene, 1.6);
    ctx.arrow(0x6fe0a4, 0.75, [B[0], 2.0, 0], [0, 1, 0], 1, scene, 1.6);
  },
  update(k) {
    S.h1.rotation.y = k.th; S.h2.rotation.y = k.th; S.s1.rotation.y = k.th; S.s2.rotation.y = k.th;
    S.mid.position.set(k.M[0], 0, k.M[1]); S.mid.rotation.y = k.th;
  },
};
