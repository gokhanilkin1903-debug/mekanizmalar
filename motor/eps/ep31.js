// Deep-groove ball bearing
import { THREE, TAU, extrude, cylZ, phase, fmtN, TL } from '../engine.js';
const NBALL = 9, RI = 1.6, RBALL = 0.45, RPITCH = RI + RBALL, RO = RPITCH + RBALL, WI = 3.0;
const WC = WI * RI / (2 * RPITCH), WB = -WC * RPITCH / RBALL;
let S = {};
const ann = (r0, r1, th) => { const s = new THREE.Shape(); s.absarc(0, 0, r1, 0, TAU, false); const h = new THREE.Path(); h.absarc(0, 0, r0, 0, TAU, true); s.holes.push(h); return extrude(s, th, 0.03, 72); };
export default {
  id: '31',
  view: { az: -22, el: 14, dist: 21, target: [0, 0.2, 0], orbit: 0.6, caz: -34, cel: 10, cdist: 12, ctarget: [1.2, 1.0, 0], low: 0.17, lowDist: 1.25 },
  floorY: -4.4,
  text: {
    tr: { hook: 'Dünyayı döndüren<br>küçük bilyeler', hookSub: 'Rulman (bilyalı yatak)', labels: ['Dış bilezik (sabit)', 'Bilyeler', 'İç bilezik (mille döner)', 'Kafes'],
      c1: 'İki bilezik, bilyeler ve kafes', c2a: 'İç bilezik mille birlikte döner', c2b: 'Bilyeler <b>kaymadan</b> yuvarlanır',
      c3a: 'Her bilye kendi ekseninde döner', c3b: 'Kafes, milin yaklaşık<br><b>%40</b> hızında döner', fbig: 'μ ≈ 0,002', fsub: 'Rulmanda sürtünme katsayısı binde 1–5;<br>kaymalı yatakta onlarca kat fazla',
      uses: ['Elektrik motorları', 'Otomobil teker göbekleri', 'Bisikletler ve kaykaylar', 'Bilgisayar fanları'] },
    en: { hook: 'Tiny balls that keep<br>the world turning', hookSub: 'The ball bearing', labels: ['Outer ring (fixed)', 'Balls', 'Inner ring (turns with shaft)', 'Cage'],
      c1: 'Two rings, balls and a cage', c2a: 'The inner ring turns with the shaft', c2b: 'The balls roll <b>without sliding</b>',
      c3a: 'Each ball spins on its own axis', c3b: 'The cage turns at about<br><b>40%</b> of shaft speed', fbig: 'μ ≈ 0.002', fsub: 'Ball bearing friction is just 0.001–0.005;<br>plain bearings are tens of times higher',
      uses: ['Electric motors', 'Car wheel hubs', 'Bikes and skateboards', 'Computer fans'] },
  },
  kin(t) { const ph = phase(t); return { ph, ai: WI * ph, ac: WC * ph, ab: WB * ph }; },
  labels: [
    { c: '#c9d1dc', mat: 'steel', at: [250, 330], p: [-2.4, 2.4, 0.5] },
    { c: '#ff9d8a', mat: 'red', at: [830, 330], p: k => [RPITCH * Math.cos(k.ac + 0.5), RPITCH * Math.sin(k.ac + 0.5), RBALL] },
    { c: '#ffcf5c', mat: 'gold', at: [250, 1450], p: [-0.9, -1.0, 0.5] },
    { c: '#6fe0a4', mat: 'bronze', at: [830, 1450], p: k => [RPITCH * Math.cos(k.ac + Math.PI / NBALL + 4.2), RPITCH * Math.sin(k.ac + Math.PI / NBALL + 4.2), 0.55] },
  ],
  counters: [
    { label: { tr: 'Mil', en: 'Shaft' }, c: '#ffcf5c', fn: (t, L) => fmtN(WI * (phase(t) - phase(Math.min(t, TL.cnt0))) / TAU, 2, L) + (L === 'tr' ? ' tur' : ' turns') },
    { label: { tr: 'Kafes', en: 'Cage' }, c: '#6fe0a4', fn: (t, L) => fmtN(WC * (phase(t) - phase(Math.min(t, TL.cnt0))) / TAU, 2, L) + (L === 'tr' ? ' tur' : ' turns') },
  ],
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    scene.add(M(ann(RO - 0.06, RO + 0.75, 0.9), mats.steel));
    S.inner = new THREE.Group(); scene.add(S.inner);
    S.inner.add(M(ann(0.55, RI + 0.06, 0.9), mats.gold));
    const sh = M(cylZ(0.55, 3.6), mats.steel); sh.position.z = -0.6; S.inner.add(sh);
    const key = M(new THREE.BoxGeometry(0.2, 0.2, 3.2), mats.dark); key.position.set(0, 0.5, -0.5); S.inner.add(key);
    for (let i = 0; i < 3; i++) { const mk = M(new THREE.BoxGeometry(0.5, 0.1, 0.06), mats.dark); const a = i * TAU / 3; mk.position.set(1.15 * Math.cos(a), 1.15 * Math.sin(a), 0.47); mk.rotation.z = a; S.inner.add(mk); }
    S.cage = new THREE.Group(); scene.add(S.cage);
    const cr = M(ann(RPITCH - 0.16, RPITCH + 0.16, 0.08), mats.bronze); cr.position.z = 0.52; S.cage.add(cr);
    for (let i = 0; i < NBALL; i++) { const a = (i + 0.5) * TAU / NBALL, br = M(new THREE.BoxGeometry(0.22, 0.24, 0.9), mats.bronze); br.position.set(RPITCH * Math.cos(a), RPITCH * Math.sin(a), 0.1); br.rotation.z = a; S.cage.add(br); }
    S.balls = [];
    const stripe = new THREE.MeshStandardMaterial({ color: 0x2a3140, roughness: 0.4 });
    for (let i = 0; i < NBALL; i++) {
      const g = new THREE.Group(); const a = i * TAU / NBALL; g.position.set(RPITCH * Math.cos(a), RPITCH * Math.sin(a), 0); S.cage.add(g);
      const sp = new THREE.Group(); g.add(sp);
      sp.add(M(new THREE.SphereGeometry(RBALL, 32, 20), mats.red));
      const st = new THREE.Mesh(new THREE.TorusGeometry(RBALL * 1.005, 0.035, 8, 40), stripe); st.rotation.x = Math.PI / 2; sp.add(st);
      S.balls.push({ sp, a });
    }
    const mot = M(cylZ(0.9, 1.4), mats.dark); mot.position.z = -2.8; scene.add(mot);
    const stand = M(new THREE.BoxGeometry(3.0, 0.7, 1.4), mats.block); stand.position.set(0, -3.9, -0.1); scene.add(stand);
    const leg = M(new THREE.BoxGeometry(1.2, 0.6, 0.9), mats.block); leg.position.set(0, -3.3, -0.1); scene.add(leg);
    ctx.arrow(0xffcf5c, 1.05, [0, 0, 1.0], [0, 0, 1], 1, scene, 1.6);
    ctx.arrow(0x6fe0a4, RO + 1.0, [0, 0, 0.7], [0, 0, 1], 1, scene, 0.5);
  },
  update(k) {
    S.inner.rotation.z = k.ai; S.cage.rotation.z = k.ac;
    for (const b of S.balls) b.sp.rotation.z = k.ab - k.ac;
  },
};
