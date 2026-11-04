// Crank and slotted lever quick-return (shaper)
import { THREE, TAU, mod, extrude, capsuleShape, cylZ, phase, fmtN, fade, TL } from '../engine.js';
const O = [1.5, 0], r = 1.0, P = [1.5, -2.4], YR = 3.0, WC = 1.5, LL = 6.0, TH0 = 1.2;
function solve(t) {
  const th = WC * phase(t) + TH0, pin = [O[0] + r * Math.cos(th), O[1] + r * Math.sin(th)];
  const psi = Math.atan2(pin[0] - P[0], pin[1] - P[1]), xr = P[0] + (YR - P[1]) * Math.tan(psi);
  return { th, pin, psi, xr };
}
const CUT = (TAU - 2 * Math.acos(r / (O[1] - P[1]))) / TAU;
let S = {};
export default {
  id: '17',
  view: { az: 0, el: 12, dist: 27, target: [0.5, 0.9, 0], orbit: 0.45, caz: -22, cel: 8, cdist: 15, ctarget: [0.2, 1.6, 0], low: 0.17, lowDist: 1.2 },
  floorY: -3.6,
  text: {
    tr: { hook: 'Yavaş kes,<br>hızlı dön', hookSub: 'Hızlı geri dönüş mekanizması', labels: ['Koç (kızak)', 'Kesici takım', 'Yarıklı kol', 'Krank (sürücü)'],
      c1: 'Krank, yarıklı kol ve kızak', c2a: 'Krank sabit hızla döner', c2b: 'Ama kızak ileri <b>yavaş</b>,<br>geri <b>hızlı</b> gider',
      c3a: 'Kesme stroku,<br>krank turunun %64’ü', c3b: 'Boşa geçen zaman <b>azalır</b>', fbig: '≈ 1,75 : 1', fsub: 'Kesme süresi, dönüş süresinin<br>yaklaşık 1,75 katı',
      uses: ['Vargel (planya) tezgahları', 'Kanal açma tezgahları', 'Mekanik presler', 'Otomatik kesme makineleri'], cut: 'KESME · yavaş', ret: 'DÖNÜŞ · hızlı' },
    en: { hook: 'Cut slow,<br>return fast', hookSub: 'The quick-return mechanism', labels: ['Ram (slider)', 'Cutting tool', 'Slotted lever', 'Crank (driver)'],
      c1: 'A crank, a slotted lever and a ram', c2a: 'The crank turns at a steady speed', c2b: 'But the ram goes forward <b>slowly</b><br>and back <b>fast</b>',
      c3a: 'The cutting stroke takes<br>64% of the turn', c3b: 'Less time is <b>wasted</b>', fbig: '≈ 1.75 : 1', fsub: 'The cutting stroke lasts about<br>1.75 times the return stroke',
      uses: ['Shaping machines', 'Slotting machines', 'Mechanical presses', 'Automatic cutting machines'], cut: 'CUTTING · slow', ret: 'RETURN · fast' },
  },
  kin(t) { const k = solve(t), k2 = solve(t + 0.01); k.v = k2.xr - k.xr; return k; },
  labels: [
    { c: '#7fb0ff', mat: 'blue', at: [830, 330], p: k => [k.xr + 0.6, YR + 0.2, 0.5] },
    { c: '#ff9d8a', mat: 'red', at: [250, 330], p: k => [k.xr - 3.0, YR - 0.6, 0.5] },
    { c: '#6fe0a4', mat: 'green', at: [830, 1180], p: k => [P[0] + 3.2 * Math.sin(k.psi), P[1] + 3.2 * Math.cos(k.psi), 0.3] },
    { c: '#ffcf5c', mat: 'gold', at: [250, 1450], p: [O[0] - 0.9, O[1] - 0.7, -0.1] },
  ],
  counters: [
    { label: { tr: 'Kesme süresi', en: 'Cutting time' }, c: '#6fe0a4', fn: () => '%' + Math.round(CUT * 100) },
    { label: { tr: 'Dönüş süresi', en: 'Return time' }, c: '#ff9d8a', fn: () => '%' + Math.round((1 - CUT) * 100) },
  ],
  overlay(t, k, ctx) {
    const o = fade(t, 10.3, 23.0, 0.4); if (o < 0.01) return '';
    let [x, y] = ctx.project([k.xr - 1.0, YR + 0.9, 0.4]); const cut = k.v < 0;
    const txt = cut ? ctx.T.cut : ctx.T.ret, col = cut ? '#2fbf71' : '#ff5a5a', wd = txt.length * 21 + 30; x = Math.max(40, Math.min(1040 - wd, x - wd / 2));
    return `<g opacity="${o}"><rect x="${x - 10}" y="${y - 44}" width="${wd}" height="56" rx="28" fill="${col}"/><text x="${x + 5}" y="${y - 6}" fill="#fff" font-size="30" font-weight="800">${txt}</text></g>`;
  },
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    S.crank = new THREE.Group(); S.crank.position.set(O[0], O[1], 0); scene.add(S.crank);
    const ds = new THREE.Shape(); ds.absarc(0, 0, 1.35, 0, TAU, false);
    for (let i = 0; i < 4; i++) { const h = new THREE.Path(), a = i * TAU / 4 + Math.PI / 4; h.absarc(0.75 * Math.cos(a), 0.75 * Math.sin(a), 0.25, 0, TAU, true); ds.holes.push(h); }
    const disc = M(extrude(ds, 0.25, 0.02, 48), mats.gold); disc.position.z = -0.35; S.crank.add(disc);
    const pin = M(cylZ(0.16, 0.8), mats.red); pin.position.set(r, 0, 0); S.crank.add(pin);
    const blk = M(new THREE.BoxGeometry(0.5, 0.5, 0.3), mats.red); blk.position.set(r, 0, 0.05); S.pinBlock = blk; scene.add(blk);
    const csh = M(cylZ(0.22, 1.6), mats.steel); csh.position.z = -0.9; S.crank.add(csh);
    // slotted lever (local +y)
    const ls = new THREE.Shape(); const w = 0.42;
    ls.absarc(0, 0, w, Math.PI, TAU, false); ls.lineTo(w, LL); ls.absarc(0, LL, w, 0, Math.PI, false); ls.closePath();
    const sl = new THREE.Path(); sl.absarc(0, 0.8, 0.27, Math.PI, TAU, false); sl.lineTo(0.27, LL - 0.4); sl.absarc(0, LL - 0.4, 0.27, 0, Math.PI, false); sl.closePath();
    ls.holes.push(new THREE.Path(sl.getPoints().reverse()));
    const hp = new THREE.Path(); hp.absarc(0, 0, 0.14, 0, TAU, true); ls.holes.push(hp);
    S.lever = M(extrude(ls, 0.2, 0.02), mats.green); S.lever.position.set(P[0], P[1], 0.05); scene.add(S.lever);
    const pv = M(cylZ(0.14, 1.2), mats.steel); pv.position.set(P[0], P[1], -0.3); scene.add(pv);
    // ram
    S.ram = new THREE.Group(); scene.add(S.ram);
    const body = M(new THREE.BoxGeometry(4.0, 0.5, 0.7), mats.blue); body.position.set(-1.0, 0, 0.35); S.ram.add(body);
    const sb = M(new THREE.BoxGeometry(0.5, 0.5, 0.36), mats.dark); sb.position.set(0, 0, 0.0); S.ram.add(sb);
    const tool = M(new THREE.BoxGeometry(0.3, 0.75, 0.3), mats.dark); tool.position.set(-3.0, -0.6, 0.35); S.ram.add(tool);
    const tip = M(new THREE.ConeGeometry(0.17, 0.3, 4).rotateX(Math.PI), mats.red); tip.position.set(-3.0, -1.1, 0.35); S.ram.add(tip);
    for (const dy of [-0.38, 0.38]) { const rail = M(new THREE.BoxGeometry(9.6, 0.18, 0.3), mats.steel); rail.position.set(0.5, YR + dy, 0.85); scene.add(rail); }
    const back = M(new THREE.BoxGeometry(10.4, 7.6, 0.25), mats.dark); back.position.set(0.5, 0.0, -1.3); scene.add(back);
    const wp = M(new THREE.BoxGeometry(3.0, 0.6, 0.9), mats.bronze); wp.position.set(-2.45, YR - 1.25 - 0.3 - 0.08, 0.35); scene.add(wp);
    const wps = M(new THREE.BoxGeometry(0.5, YR - 1.7 + 3.6, 0.5), mats.steel); wps.position.set(-2.45, (-3.6 + YR - 1.6) / 2, 0.35); scene.add(wps);
    ctx.arrow(0xffcf5c, 1.75, [O[0], O[1], 0.5], [0, 0, 1], 1, scene, 0.6);
  },
  update(k) {
    S.crank.rotation.z = k.th; S.lever.rotation.z = -k.psi;
    S.pinBlock.position.set(k.pin[0], k.pin[1], 0.15); S.pinBlock.rotation.z = -k.psi;
    S.ram.position.set(k.xr, YR, 0);
  },
};
