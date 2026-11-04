// CVT: variable V-pulleys with a belt
import { THREE, TAU, ss, mod, cylZ, phase, speedF, fmtN, TL } from '../engine.js';
const D = 5.2, C1 = [0, -2.6], C2 = [0, 2.6], W1 = 3.0, BW = 0.55, H = 0.35, RH = 0.5, RM = 1.9, KK = H / (RM - RH), NSEG = 84;
const Lfun = (a, b) => { const be = Math.asin((a - b) / D); return 2 * Math.sqrt(D * D - (a - b) ** 2) + b * (Math.PI - 2 * be) + a * (Math.PI + 2 * be); };
const L0 = Lfun(1.05, 1.05);
const r2of = r1 => { let lo = 0.3, hi = 2.2; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (Lfun(r1, m) < L0) lo = m; else hi = m; } return (lo + hi) / 2; };
const r1T = t => 0.62 + 0.86 * ss((t - 10.6) / 5.6);
const DT = 1 / 300, NT = 31 * 300 + 40, SB = [0], A2 = [0];
for (let i = 1; i <= NT; i++) { const t = (i - 0.5) * DT, r1 = r1T(t), v = W1 * r1 * speedF(t); SB.push(SB[i - 1] + v * DT); A2.push(A2[i - 1] + v / r2of(r1) * DT); }
const look = (T, t) => { const i = Math.max(0, Math.min(NT - 1, Math.floor(t / DT))); return T[i] + (T[i + 1] - T[i]) * (t / DT - i); };
function path(r1, r2) {
  const B = Math.asin((r1 - r2) / D), LS = Math.sqrt(D * D - (r1 - r2) ** 2), sA = LS, sB = LS + r2 * (Math.PI - 2 * B), sC = 2 * LS + r2 * (Math.PI - 2 * B), LT = sC + r1 * (Math.PI + 2 * B);
  const at = (c, r, a) => [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
  return s => { s = mod(s, LT);
    if (s < sA) { const p = at(C1, r1, B), q = at(C2, r2, B), u = s / LS; return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u]; }
    if (s < sB) return at(C2, r2, B + (s - sA) / r2);
    if (s < sC) { const p = at(C2, r2, Math.PI - B), q = at(C1, r1, Math.PI - B), u = (s - sB) / LS; return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u]; }
    return at(C1, r1, Math.PI - B + (s - sC) / r1); };
}
let S = {};
export default {
  id: '24',
  view: { az: 40, el: 14, dist: 26, target: [0, 0.2, 0], orbit: 0.5, caz: 46, cel: 10, cdist: 15, ctarget: [0, C2[1] - 0.4, 0], low: 0.17, lowDist: 1.25 },
  floorY: -5.2,
  text: {
    tr: { hook: 'Vitessiz şanzıman<br>nasıl çalışır?', hookSub: 'CVT (sürekli değişken şanzıman)', labels: ['Çıkış kasnağı', 'V-kayış', 'Giriş kasnağı (motor)', 'Hareketli yanak'],
      c1: 'İki V-kasnak ve bir kayış', c2a: 'Yanaklar yaklaşınca<br>kayış <b>dışarı</b> çıkar', c2b: 'Diğer kasnakta ise<br><b>içeri</b> iner',
      c3a: 'Kademe yok: oran<br><b>sürekli</b> değişir', c3b: 'Motor hep en verimli<br>devirde kalır', fbig: '2,5 → 0,4', fsub: 'Aynı motor devrinde çıkış hızı<br>6 kata kadar değişebilir',
      uses: ['Skuterler', 'Hibrit otomobiller', 'Kar motorları ve ATV’ler', 'Bazı bisiklet göbekleri'] },
    en: { hook: 'How does a gearless<br>transmission work?', hookSub: 'The CVT', labels: ['Output pulley', 'V-belt', 'Input pulley (engine)', 'Moving sheave'],
      c1: 'Two V-pulleys and one belt', c2a: 'As the sheaves close,<br>the belt rides <b>outward</b>', c2b: 'On the other pulley<br>it sinks <b>inward</b>',
      c3a: 'No steps: the ratio<br>changes <b>smoothly</b>', c3b: 'The engine stays at its<br>most efficient speed', fbig: '2.5 → 0.4', fsub: 'At the same engine speed, output speed<br>can change up to 6×',
      uses: ['Scooters', 'Hybrid cars', 'Snowmobiles and ATVs', 'Some bicycle hubs'] },
  },
  kin(t) { const r1 = r1T(t), r2 = r2of(r1); return { r1, r2, s: look(SB, t), a1: W1 * phase(t), a2: look(A2, t) }; },
  labels: [
    { c: '#7fb0ff', mat: 'blue', at: [270, 330], p: [-1.4, C2[1] + 1.0, 0.5] },
    { c: '#c9d1dc', mat: 'dark', at: [830, 760], p: k => [k.r1 + (k.r2 - k.r1) * 0.5 + 0.05, 0, 0.1] },
    { c: '#ffcf5c', mat: 'gold', at: [250, 1450], p: [-1.3, C1[1] - 1.1, 0.5] },
    { c: '#6fe0a4', mat: 'green', at: [830, 1450], p: k => [1.3, C1[1] - 1.0, (0.55 - 2 * (k.r1 - RH) * KK) / 2 + 0.25] },
  ],
  counters: [
    { label: { tr: 'Oran', en: 'Ratio' }, c: '#ffcf5c', fn: (t, L, k) => fmtN(k.r2 / k.r1, 2, L) + ' : 1' },
    { label: { tr: 'Çıkış hızı', en: 'Output speed' }, c: '#7fb0ff', fn: (t, L, k) => '%' + Math.round(100 * k.r1 / k.r2) },
  ],
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    const pulley = (c, mt) => {
      const g = new THREE.Group(); g.position.set(c[0], c[1], 0); scene.add(g);
      const mk = sgn => { const sg = new THREE.Group(); g.add(sg); const fr = M(new THREE.CylinderGeometry(sgn > 0 ? RM : RH, sgn > 0 ? RH : RM, H, 64).rotateX(Math.PI / 2), mt); fr.position.z = sgn * H / 2; sg.add(fr);
        const bp = M(cylZ(RM, 0.1, 64), mt); bp.position.z = sgn * (H + 0.05); sg.add(bp);
        for (let i = 0; i < 4; i++) { const mk2 = M(new THREE.BoxGeometry(0.5, 0.14, 0.06), mats.dark); const a = i * TAU / 4; mk2.position.set(1.3 * Math.cos(a), 1.3 * Math.sin(a), sgn * (H + 0.12)); mk2.rotation.z = a; sg.add(mk2); }
        return sg; };
      const shaft = M(cylZ(0.22, 3.4), mats.steel); g.add(shaft);
      return { g, front: mk(1), back: mk(-1) };
    };
    S.p1 = pulley(C1, mats.gold); S.p2 = pulley(C2, mats.blue);
    const fm = new THREE.MeshStandardMaterial({ color: 0x6fe0a4, metalness: 0.2, roughness: 0.3, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide });
    for (const p of [S.p1, S.p2]) p.front.children.forEach(m => { if (m.material !== mats.dark) { m.material = fm; m.castShadow = false; } });
    mats.green.emissive.set(0); S.fm = fm;
    const seg = new THREE.BoxGeometry(1, 0.17, BW);
    S.segs = []; for (let i = 0; i < NSEG; i++) { const m = new THREE.Mesh(seg, i % 2 ? mats.dark : mats.steel); m.castShadow = true; scene.add(m); S.segs.push(m); }
    const mot = M(cylZ(0.8, 1.4), mats.dark); mot.position.set(C1[0], C1[1], -2.3); scene.add(mot);
    const fr = M(new THREE.BoxGeometry(0.5, D + 1.2, 0.4), mats.block); fr.position.set(0, 0, -1.6); scene.add(fr);
    const ft = M(new THREE.BoxGeometry(2.6, 0.5, 2.0), mats.block); ft.position.set(0, -4.95, -1.4); scene.add(ft);
    const lg = M(new THREE.BoxGeometry(0.5, 1.6, 0.4), mats.block); lg.position.set(0, -4.0, -1.6); scene.add(lg);
    ctx.arrow(0xffcf5c, 2.3, [C1[0], C1[1], 0.8], [0, 0, 1], 1, scene, 0.6);
    ctx.arrow(0x7fb0ff, 2.3, [C2[0], C2[1], 0.8], [0, 0, 1], 1, scene, 0.6);
  },
  update(k) {
    const gap = r => Math.max(0.02, BW - 2 * (r - RH) * KK) / 2;
    for (const [p, r, a] of [[S.p1, k.r1, k.a1], [S.p2, k.r2, k.a2]]) { p.front.position.z = gap(r); p.back.position.z = -gap(r); p.front.rotation.z = a; p.back.rotation.z = a; }
    const P = path(k.r1, k.r2), step = L0 / NSEG;
    for (let i = 0; i < NSEG; i++) { const a = P(k.s + i * step), b = P(k.s + (i + 1) * step), m = S.segs[i]; m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0); m.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]); m.scale.x = Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.97; }
  },
};
