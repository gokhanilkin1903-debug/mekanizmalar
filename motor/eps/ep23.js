// Anchor escapement with pendulum and weight drive
import { THREE, TAU, ss, mod, extrude, capsuleShape, cylZ, cylY, setRod, phase, fmtN, TL } from '../engine.js';
const NW = 30, PW = TAU / NW, WC = [0, 0.7], RW = 1.7, AP = [0, 3.1], AMP = 0.13, OM = Math.PI, PL = 6.5, DR = 0.45;
const PA = 6.5 * PW / 2; // pallets span 6.5 teeth -> alternate half-tooth locking
const W0 = Math.PI / 2 - PA + 0.06 + PW / 2 + 0.0777 + 0.0459; // a tooth rests against the engaged pallet when locked
const swing = ph => AMP * Math.sin(OM * ph);
function wheelAngle(ph) { const s = OM * ph / Math.PI + 0.5, k = Math.floor(s), f = s - k; return -(PW / 2) * (k + ss((f - 0.32) / 0.36)); }
const halfSwings = ph => Math.floor(OM * ph / Math.PI + 0.5);
let S = {};
export default {
  id: '23',
  view: { az: 0, el: 6, dist: 25, target: [0.2, 0.0, 0], orbit: 0.5, caz: -8, cel: 6, cdist: 12, ctarget: [0, 1.8, 0], low: 0.17, lowDist: 1.25 },
  floorY: -5.4,
  text: {
    tr: { hook: 'Saatin tik-tak sesi<br>nereden gelir?', hookSub: 'Çapa eşapmanı', labels: ['Çapa', 'Eşapman çarkı', 'Sarkaç', 'Ağırlık'],
      c1: 'Sarkaç, çapa ve dişli bir çark', c2a: 'Ağırlık çarkı döndürmek ister', c2b: 'Çapa her salınımda<br><b>yalnızca yarım diş</b> geçirir',
      c3a: 'Her kilitlenmede: <b>tik… tak…</b>', c3b: 'Çark da sarkaca küçük<br>bir itme verir', fbig: 'T = 2π√(L/g)', fsub: 'Salınım süresi yalnızca sarkaç boyuna bağlı:<br>1 metre ≈ 2 saniye',
      uses: ['Sarkaçlı duvar saatleri', 'Kule saatleri', 'Mekanik kol saatleri', 'Metronomlar'], tick: 'tik', tock: 'tak' },
    en: { hook: 'Where does a clock’s<br>tick-tock come from?', hookSub: 'The anchor escapement', labels: ['Anchor', 'Escape wheel', 'Pendulum', 'Weight'],
      c1: 'A pendulum, an anchor and<br>a toothed wheel', c2a: 'A weight tries to spin the wheel', c2b: 'The anchor lets just<br><b>half a tooth</b> pass per swing',
      c3a: 'Every lock goes <b>tick… tock…</b>', c3b: 'The wheel gives the pendulum<br>a tiny push back', fbig: 'T = 2π√(L/g)', fsub: 'The swing time depends only on length:<br>1 meter ≈ 2 seconds',
      uses: ['Pendulum wall clocks', 'Tower clocks', 'Mechanical watches', 'Metronomes'], tick: 'tick', tock: 'tock' },
  },
  kin(t) { const ph = phase(t); return { ph, phi: swing(ph), w: wheelAngle(ph) }; },
  labels: [
    { c: '#ff9d8a', mat: 'red', at: [830, 330], p: k => [1.2, AP[1] - 0.9, 0.4] },
    { c: '#ffcf5c', mat: 'gold', at: [250, 330], p: [-1.4, WC[1] + 0.6, 0.3] },
    { c: '#7fb0ff', mat: 'blue', at: [250, 1450], p: k => [AP[0] + (PL - 0.3) * Math.sin(k.phi), AP[1] - (PL - 0.3) * Math.cos(k.phi), 0.4] },
    { c: '#c9d1dc', mat: 'steel', at: [830, 1450], p: k => [1.25, -0.6 + k.w * DR, 0.2] },
  ],
  counters: [
    { label: { tr: 'Salınım', en: 'Swings' }, c: '#7fb0ff', fn: t => String(halfSwings(phase(t)) - halfSwings(phase(Math.min(t, TL.cnt0)))) },
    { label: { tr: 'Geçen diş', en: 'Teeth passed' }, c: '#ffcf5c', fn: (t, L) => fmtN((wheelAngle(phase(Math.min(t, TL.cnt0))) - wheelAngle(phase(t))) / PW, 1, L) },
  ],
  overlay(t, k, ctx) {
    const s = OM * k.ph / Math.PI + 0.5, f = s - Math.floor(s), n = Math.floor(s);
    if (f > 0.7 && f < 0.95) { const age = (f - 0.7) / 0.25, side = n % 2 ? -1 : 1; const [x, y] = ctx.project([side * 1.15, WC[1] + 1.75, 0.5]); ctx.extraDiv.innerHTML = `<div class="pop" style="left:${x - 40}px;top:${y - 60 - age * 60}px;opacity:${1 - age};transform:scale(${1 + age * 0.5})">${n % 2 ? ctx.T.tock : ctx.T.tick}</div>`; }
    else ctx.extraDiv.innerHTML = '';
    return '';
  },
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    // escape wheel (club-tooth style sawtooth)
    const ws = new THREE.Shape(), pts = [];
    for (let i = 0; i < NW; i++) { const a = i * PW; pts.push([RW * Math.cos(a), RW * Math.sin(a)], [(RW - 0.32) * Math.cos(a + PW * 0.35), (RW - 0.32) * Math.sin(a + PW * 0.35)], [(RW - 0.32) * Math.cos(a + PW * 0.95), (RW - 0.32) * Math.sin(a + PW * 0.95)]); }
    pts.forEach(([x, y], i) => i ? ws.lineTo(x, y) : ws.moveTo(x, y)); ws.closePath();
    for (let i = 0; i < 5; i++) { const h = new THREE.Path(), a = i * TAU / 5; h.absarc(0.85 * Math.cos(a), 0.85 * Math.sin(a), 0.3, 0, TAU, true); ws.holes.push(h); }
    S.wheel = new THREE.Group(); S.wheel.position.set(WC[0], WC[1], 0); scene.add(S.wheel);
    S.wheelIn = new THREE.Group(); S.wheelIn.rotation.z = W0; S.wheel.add(S.wheelIn);
    S.wheelIn.add(M(extrude(ws, 0.22, 0.01), mats.gold));
    const drum = M(cylZ(0.9, 0.25), mats.dark); drum.position.z = -0.35; S.wheel.add(drum);
    const ax = M(cylZ(0.12, 1.6), mats.steel); S.wheel.add(ax);
    // anchor: pivot at AP, two arms reaching wheel at ±38deg from top
    S.anchor = new THREE.Group(); S.anchor.position.set(AP[0], AP[1], 0.3); scene.add(S.anchor);
    const tipA = a => [WC[0] + (RW + 0.02) * Math.sin(a) - AP[0], WC[1] + (RW + 0.02) * Math.cos(a) - AP[1]];
    for (const sgn of [-1, 1]) {
      const pa = sgn * PA + (sgn < 0 ? -0.0447 : 0), tp = tipA(pa), arm = M(new THREE.BoxGeometry(1, 0.2, 0.18), mats.red);
      arm.position.set(tp[0] / 2, tp[1] / 2 + 0.05, 0); arm.scale.x = Math.hypot(tp[0], tp[1]); arm.rotation.z = Math.atan2(tp[1], tp[0]); S.anchor.add(arm);
      const pal = M(new THREE.BoxGeometry(0.16, 0.42, 0.24), new THREE.MeshStandardMaterial({ color: 0xff3b6b, roughness: 0.2, metalness: 0.1 })); pal.position.set(tp[0], tp[1] + 0.12, 0); pal.rotation.z = -pa; S.anchor.add(pal);
    }
    const hubA = M(cylZ(0.25, 0.3), mats.red); S.anchor.add(hubA);
    const crutch = M(new THREE.BoxGeometry(0.1, 1.2, 0.1), mats.steel); crutch.position.set(0, -0.6, -0.4); S.anchor.add(crutch);
    // pendulum (behind)
    S.pend = new THREE.Group(); S.pend.position.set(AP[0], AP[1], -0.6); scene.add(S.pend);
    const rod = M(new THREE.BoxGeometry(0.1, PL, 0.06), mats.steel); rod.position.y = -PL / 2; S.pend.add(rod);
    const bob = M(cylZ(0.75, 0.3, 48), mats.blue); bob.position.y = -PL; S.pend.add(bob);
    // frame
    const back = M(new THREE.BoxGeometry(5.6, 4.6, 0.2), mats.dark); back.position.set(0.3, 1.9, -1.0); scene.add(back);
    const bar = M(new THREE.BoxGeometry(1.0, 0.4, 0.8), mats.block); bar.position.set(0, AP[1] + 0.3, -0.5); scene.add(bar);
    // weight
    S.cord = M(cylY(0.025, 1, 6), mats.steel); scene.add(S.cord);
    S.wt = M(cylY(0.32, 1.1, 24), mats.steel); scene.add(S.wt);
    ctx.arrow(0xffcf5c, 2.05, [WC[0], WC[1], 0.5], [0, 0, 1], -1, scene, 0.3);
    ctx.linArrow(0x7fb0ff, 2.0, [0, -PL + AP[1] - 1.2, -0.3], [1, 0, 0]);
  },
  update(k) {
    S.wheel.rotation.z = k.w; S.anchor.rotation.z = k.phi; S.pend.rotation.z = k.phi;
    const wy = -0.6 + k.w * DR; // weight descends as wheel turns clockwise
    setRod(S.cord, [0.9, WC[1], -0.35], [0.9, wy + 0.55, -0.35]);
    S.wt.position.set(0.9, wy, -0.35);
  },
};
