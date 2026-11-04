// Cam and flat-faced follower with lift trace
import { THREE, TAU, mod, extrude, cylY, cylZ, helixGeo, phase, fmtN, TL } from '../engine.js';
const WC = 2.4, X0 = 0.55, VX = 0.75, XMAX = 4.4, STEM = 4.6;
const PR = []; for (let i = 0; i < 720; i++) { const f = i / 720 * TAU, rr = 1.15 + 1.0 * ((1 + Math.cos(f)) / 2) ** 4; PR.push([rr * Math.sin(f), rr * Math.cos(f)]); } // lobe at +y
const lift = th => { const c = Math.cos(-th), s = Math.sin(-th); let mx = -1e9; for (const [x, y] of PR) { const yy = x * s + y * c; if (yy > mx) mx = yy; } return mx; };
let S = {};
const camTh = t => WC * phase(t);
const lifts = th => Math.floor((th + Math.PI) / TAU);
export default {
  id: '08',
  view: { az: 0, el: 10, dist: 30, target: [1.2, 2.7, 0], orbit: 0.45, caz: -24, cel: 6, cdist: 13, ctarget: [0, 1.3, 0], low: 0.17, lowDist: 1.25 },
  floorY: -3.0,
  text: {
    tr: { hook: 'Bu tuhaf şekil<br>motorunu çalıştırıyor', hookSub: 'Kam ve izleyici', labels: ['Yay', 'İzleyici (itici)', 'Kam', 'Kam mili'],
      c1: 'Şekil = hareket', c2a: 'Kamın çıkıntısı<br>izleyiciyi yukarı iter', c2b: 'Yay onu <b>geri</b> bastırır',
      c3a: 'Taban dairesinde<br>izleyici bekler', c3b: 'Profili değiştir,<br><b>hareketi</b> değiştir', fbig: '1 tur = 1 açılma', fsub: 'Motorlarda kam mili,<br>krank milinin yarı hızında döner',
      uses: ['Motor supapları', 'Dikiş makineleri', 'Mekanik oyuncaklar (otomata)', 'Paketleme makineleri'] },
    en: { hook: 'This odd shape<br>runs your engine', hookSub: 'Cam and follower', labels: ['Spring', 'Follower', 'Cam', 'Camshaft'],
      c1: 'Shape = motion', c2a: 'The cam lobe pushes<br>the follower up', c2b: 'The spring pushes it <b>back down</b>',
      c3a: 'On the base circle,<br>the follower rests', c3b: 'Change the profile,<br>change the <b>motion</b>', fbig: '1 turn = 1 lift', fsub: 'In engines, the camshaft spins at<br>half the crankshaft speed',
      uses: ['Engine valves', 'Sewing machines', 'Automata toys', 'Packaging machines'] },
  },
  kin(t) { const ph = phase(t), th = WC * ph, yc = lift(th); return { ph, th, yc }; },
  labels: [
    { c: '#6fe0a4', mat: 'green', at: [250, 380], p: k => [-0.55, (k.yc + 1.75 + 4.6) / 2, 0.2] },
    { c: '#c9d1dc', mat: 'steel', at: [250, 1000], p: k => [-0.85, k.yc + 0.08, 0.2] },
    { c: '#ffcf5c', mat: 'gold', at: [250, 1450], p: [-1.0, -0.6, 0.3] },
    { c: '#7fb0ff', mat: 'dark', at: [830, 1450], p: [0, 0, 1.0] },
  ],
  counters: [
    { label: { tr: 'Kam', en: 'Cam' }, c: '#ffcf5c', fn: (t, L) => fmtN(WC * (phase(t) - phase(Math.min(t, TL.cnt0))) / TAU, 2, L) + (L === 'tr' ? ' tur' : ' turns') },
    { label: { tr: 'Açılma', en: 'Lifts' }, c: '#ff7ad9', fn: t => String(lifts(camTh(t)) - lifts(camTh(Math.min(t, TL.cnt0)))) },
  ],
  overlay(t, k, ctx) {
    const pts = []; const n = 160;
    for (let i = 0; i <= n; i++) { const dph = (XMAX - X0) / VX * i / n, ph = k.ph - dph; if (ph < 0) break; const [x, y] = ctx.project([X0 + VX * dph, lift(WC * ph) + STEM, 0.05]); pts.push(`${x.toFixed(1)},${y.toFixed(1)}`); }
    return `<polyline points="${pts.join(' ')}" fill="none" stroke="#ff7ad9" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
  },
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    S.cam = new THREE.Group(); scene.add(S.cam);
    const cs = new THREE.Shape(); PR.forEach(([x, y], i) => i ? cs.lineTo(x, y) : cs.moveTo(x, y)); cs.closePath();
    const h = new THREE.Path(); h.absarc(0, 0, 0.3, 0, TAU, true); cs.holes.push(h);
    S.cam.add(M(extrude(cs, 0.9, 0.03), mats.gold));
    const sh = M(cylZ(0.3, 3.6), mats.steel); sh.position.z = -0.6; S.cam.add(sh);
    const key = M(new THREE.BoxGeometry(0.1, 0.1, 1.2), mats.dark); key.position.set(0, 0.3, 0.9); S.cam.add(key);
    const capF = M(cylZ(0.42, 0.25), mats.dark); capF.position.z = 1.1; scene.add(capF);
    const brg = M(new THREE.BoxGeometry(1.2, 2.4, 0.8), mats.block); brg.position.set(0, -1.6, -2.0); scene.add(brg);
    // follower
    S.fol = new THREE.Group(); scene.add(S.fol);
    const disc = M(cylY(0.95, 0.16, 48), mats.steel); disc.position.y = 0.08; S.fol.add(disc);
    const stem = M(cylY(0.2, STEM), mats.steel); stem.position.y = STEM / 2; S.fol.add(stem);
    const col = M(cylY(0.62, 0.14, 40), mats.steel); col.position.y = 1.7; S.fol.add(col);
    const pen = M(new THREE.ConeGeometry(0.16, 0.45, 20).rotateZ(-Math.PI / 2), mats.red); pen.position.set(0.32, STEM, 0); S.fol.add(pen);
    S.spring = M(helixGeo(0.45, 7, 0.06, 1, 400), mats.green); scene.add(S.spring);
    const guide = M(new THREE.BoxGeometry(1.1, 0.8, 1.0), mats.block); guide.position.set(0, 5.0, 0); scene.add(guide);
    const post = M(new THREE.BoxGeometry(0.5, 8.0, 0.5), mats.block); post.position.set(-1.6, 1.4, -1.6); scene.add(post);
    const arm = M(new THREE.BoxGeometry(1.9, 0.5, 0.5), mats.block); arm.position.set(-0.8, 5.0, -1.0); scene.add(arm);
    const board = M(new THREE.BoxGeometry(XMAX - X0 + 0.5, 2.0, 0.1), new THREE.MeshStandardMaterial({ color: 0x1b2a44, roughness: 0.8 }));
    board.position.set((X0 + XMAX) / 2, STEM + 1.65, -0.15); scene.add(board);
    for (const y of [1.2, 2.05]) { const ln = new THREE.Mesh(new THREE.BoxGeometry(XMAX - X0 + 0.3, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: 0x3a5582 })); ln.position.set((X0 + XMAX) / 2, STEM + y, -0.08); scene.add(ln); }
    ctx.arrow(0xffcf5c, 2.45, [0, 0, 0.9], [0, 0, 1], -1);
    ctx.linArrow(0x6fe0a4, 1.8, [-1.5, 3.4, 0.3], [0, 1, 0]);
  },
  update(k) {
    S.cam.rotation.z = -k.th; S.fol.position.y = k.yc;
    const a = k.yc + 1.77, b = 4.6; S.spring.position.y = (a + b) / 2; S.spring.scale.set(1, b - a, 1);
  },
};
