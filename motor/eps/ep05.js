// Scotch yoke with sine trace
import { THREE, TAU, mod, extrude, capsuleShape, cylZ, cylY, phase, fmtN, fade, TL } from '../engine.js';
const r = 1.3, WC = 2.2, ROD = 3.8, X0 = 0.45, VX = 0.9, XMAX = 4.4;
let S = {};
const yoke = th => r * Math.sin(th);
const penY = th => yoke(th) + 0.45 + ROD;
export default {
  id: '05',
  view: { az: 0, el: 10, dist: 26, target: [1.3, 1.8, 0], orbit: 0.45, caz: -24, cel: 6, cdist: 14, ctarget: [0.2, 0.3, 0], low: 0.16, lowDist: 1.25 },
  floorY: -2.8,
  text: {
    tr: { hook: 'Mükemmel bir sinüs<br>çizen mekanizma', hookSub: 'İskoç boyunduruğu', labels: ['Kızak mili', 'Boyunduruk (yarıklı)', 'Krank diski', 'Pim'],
      c1: 'Dönen pim, kayan yarık', c2a: 'Pim yarığın içinde kayar', c2b: 'Mil yalnızca<br><b>yukarı-aşağı</b> hareket eder',
      c3a: 'Konum = r · sin θ', c3b: 'Sonuç: <b>saf sinüs</b> hareketi', fbig: 'y = r · sin θ', fsub: 'Krank-biyelden daha kısa ve basit,<br>ama sürtünmesi daha fazla',
      uses: ['Vana aktüatörleri', 'Titreşim test makineleri', 'Laboratuvar çalkalayıcıları', 'Eski buhar pompaları'] },
    en: { hook: 'It draws a<br>perfect sine wave', hookSub: 'The Scotch yoke', labels: ['Sliding rod', 'Slotted yoke', 'Crank disc', 'Pin'],
      c1: 'A spinning pin, a sliding slot', c2a: 'The pin slides inside the slot', c2b: 'The rod only moves<br><b>up and down</b>',
      c3a: 'Position = r · sin θ', c3b: 'Result: <b>pure sine</b> motion', fbig: 'y = r · sin θ', fsub: 'Shorter and simpler than a slider-crank,<br>but with more friction',
      uses: ['Valve actuators', 'Vibration test rigs', 'Laboratory shakers', 'Old steam pumps'] },
  },
  kin(t) { const ph = phase(t), th = WC * ph; return { ph, th, y: yoke(th), pin: [r * Math.cos(th), r * Math.sin(th), 0.45] }; },
  labels: [
    { c: '#c9d1dc', mat: 'steel', at: [250, 420], p: k => [-0.18, k.y + 2.6, 0.2] },
    { c: '#7fb0ff', mat: 'blue', at: [250, 1050], p: k => [-1.75, k.y, 0.35] },
    { c: '#ffcf5c', mat: 'gold', at: [260, 1450], p: [-1.1, -1.2, -0.3] },
    { c: '#ff9d8a', mat: 'red', at: [820, 1450], p: k => k.pin },
  ],
  counters: [
    { label: { tr: 'Açı θ', en: 'Angle θ' }, c: '#ffcf5c', fn: (t, L, k) => Math.round(mod(k.th * 180 / Math.PI, 360)) + '°' },
    { label: { tr: 'sin θ', en: 'sin θ' }, c: '#ff7ad9', fn: (t, L, k) => fmtN(Math.sin(k.th), 2, L) },
  ],
  overlay(t, k, ctx) {
    // sine trace drawn by the pen on the board
    const pts = []; const n = 160;
    for (let i = 0; i <= n; i++) {
      const dph = (XMAX - X0) / VX * i / n, ph = k.ph - dph; if (ph < 0) break;
      const [x, y] = ctx.project([X0 + VX * dph, penY(WC * ph), 0.05]); pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    const op = 1 - fade(t, 27.6, 40, 0.6) * 0.0;
    return `<polyline points="${pts.join(' ')}" fill="none" stroke="#ff7ad9" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"/>`;
  },
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    S.crank = new THREE.Group(); scene.add(S.crank);
    const ds = new THREE.Shape(); ds.absarc(0, 0, 1.8, 0, TAU, false);
    for (let i = 0; i < 3; i++) { const h = new THREE.Path(), a = Math.PI / 3 + i * TAU / 3; h.absarc(1.0 * Math.cos(a), 1.0 * Math.sin(a), 0.36, 0, TAU, true); ds.holes.push(h); }
    const disc = M(extrude(ds, 0.3, 0.03, 64), mats.gold); disc.position.z = -0.45; S.crank.add(disc);
    const pin = M(cylZ(0.22, 0.95), mats.red); pin.position.set(r, 0, 0.0); S.crank.add(pin);
    const sh = M(cylZ(0.28, 2.0), mats.steel); sh.position.z = -1.4; S.crank.add(sh);
    const brg = M(new THREE.BoxGeometry(1.2, 1.4, 0.8), mats.block); brg.position.set(0, -1.6, -1.6); scene.add(brg);
    const ped = M(new THREE.BoxGeometry(1.0, 1.0, 0.8), mats.block); ped.position.set(0, -2.3, -1.6); scene.add(ped);
    // yoke
    const ys = new THREE.Shape(); const hw = r + 0.55, hh = 0.48;
    ys.moveTo(-hw, -hh); ys.lineTo(hw, -hh); ys.lineTo(hw, hh); ys.lineTo(-hw, hh); ys.closePath();
    const slot = new THREE.Path(); const sw = r + 0.26, sh2 = 0.24;
    slot.absarc(sw - sh2 * 0, 0, sh2, -Math.PI / 2, Math.PI / 2, false); slot.absarc(-sw, 0, sh2, Math.PI / 2, Math.PI * 1.5, false); slot.closePath();
    const slot2 = new THREE.Path(slot.getPoints().reverse()); ys.holes.push(slot2);
    S.yoke = new THREE.Group(); scene.add(S.yoke);
    const yk = M(extrude(ys, 0.36, 0.03), mats.blue); yk.position.z = 0.15; S.yoke.add(yk);
    const rod = M(cylY(0.17, ROD), mats.steel); rod.position.set(0, hh + ROD / 2, 0.15); S.yoke.add(rod);
    const pen = M(new THREE.ConeGeometry(0.16, 0.45, 20).rotateZ(-Math.PI / 2), mats.red); pen.position.set(0.3, hh + ROD, 0.15); S.yoke.add(pen);
    const cap = M(cylY(0.26, 0.2), mats.steel); cap.position.set(0, hh + ROD, 0.15); S.yoke.add(cap);
    // guide
    const gd = M(new THREE.BoxGeometry(0.9, 0.6, 0.9), mats.block); gd.position.set(0, 2.2, 0.15); scene.add(gd);
    const post = M(new THREE.BoxGeometry(0.5, 3.2, 0.5), mats.block); post.position.set(-1.0, 1.0, -1.6); scene.add(post);
    const arm = M(new THREE.BoxGeometry(1.4, 0.4, 0.5), mats.block); arm.position.set(-0.4, 2.2, -0.75); arm.rotation.y = 0; scene.add(arm);
    // board for trace
    const board = M(new THREE.BoxGeometry(XMAX - X0 + 0.5, 3.6, 0.1), new THREE.MeshStandardMaterial({ color: 0x1b2a44, roughness: 0.8, metalness: 0 }));
    board.position.set((X0 + XMAX) / 2, 0.45 + ROD, -0.12); scene.add(board);
    for (let i = -1; i <= 1; i++) { const ln = new THREE.Mesh(new THREE.BoxGeometry(XMAX - X0 + 0.3, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: 0x3a5582 })); ln.position.set((X0 + XMAX) / 2, 0.45 + ROD + i * r, -0.05); scene.add(ln); }
    ctx.arrow(0xffcf5c, 2.2, [0, 0, 0.7], [0, 0, 1], 1);
    ctx.linArrow(0x7fb0ff, 2.6, [-2.4, 0, 0.3], [0, 1, 0]);
  },
  update(k) { S.crank.rotation.z = k.th; S.yoke.position.y = k.y; },
};
