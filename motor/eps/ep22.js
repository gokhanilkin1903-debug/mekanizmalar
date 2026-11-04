// Gamma-type Stirling engine (crank on top, cylinders below)
import { THREE, TAU, extrude, capsuleShape, cylY, cylZ, setRod, phase, fmtN, TL } from '../engine.js';
const CC = [0, 2.6], R = 0.55, LR = 3.0, XD = -1.5, XP = 1.5, W = 2.6;
const pistonY = (th, xp) => { const pin = [CC[0] + R * Math.sin(th), CC[1] + R * Math.cos(th)]; return { pin, y: pin[1] - Math.sqrt(LR * LR - (xp - pin[0]) ** 2) }; };
const DTOP = -0.1, DBOT = -3.0, PTOP = 0.0, PBOT = -1.9;
let S = {};
export default {
  id: '22',
  view: { az: -18, el: 12, dist: 27, target: [0, 0.7, 0], orbit: 0.55, caz: -30, cel: 8, cdist: 13, ctarget: [-0.4, -1.3, 0], low: 0.17, lowDist: 1.25 },
  floorY: -4.4,
  text: {
    tr: { hook: 'Sadece ısıyla<br>çalışan motor', hookSub: 'Stirling motoru', labels: ['Volan', 'Güç pistonu', 'Yer değiştirici', 'Sıcak uç (alev)'],
      c1: 'Sıcak uç, soğuk uç, iki piston', c2a: 'Yer değiştirici gazı sıcak ve<br>soğuk uç arasında taşır', c2b: 'Isınan gaz genleşir,<br><b>güç pistonunu</b> iter',
      c3a: 'İki piston arasında <b>90°</b> faz farkı', c3b: 'Soğuyan gaz büzülür,<br>döngü yeniden başlar', fbig: 'ΔT → İş', fsub: 'Sıcaklık farkı ne kadar büyükse<br>motor o kadar güçlü',
      uses: ['Güneş çanağı santralleri', 'Denizaltı jeneratörleri', 'Uzay sondası güç sistemleri', 'Kriyojenik soğutucular'] },
    en: { hook: 'An engine that runs<br>on heat alone', hookSub: 'The Stirling engine', labels: ['Flywheel', 'Power piston', 'Displacer', 'Hot end (flame)'],
      c1: 'A hot end, a cold end, two pistons', c2a: 'The displacer shuttles gas<br>between hot and cold', c2b: 'Hot gas expands and pushes<br>the <b>power piston</b>',
      c3a: 'The pistons run <b>90°</b> apart', c3b: 'Cooled gas contracts,<br>and the cycle repeats', fbig: 'ΔT → Work', fsub: 'The bigger the temperature difference,<br>the more power',
      uses: ['Solar dish power plants', 'Submarine generators', 'Space probe power systems', 'Cryogenic coolers'] },
  },
  kin(t) { const th = W * phase(t), d = pistonY(th, XD), p = pistonY(th - Math.PI / 2, XP); return { th, d, p }; },
  labels: [
    { c: '#c9d1dc', mat: 'dark', at: [250, 330], p: [CC[0] - 1.6, CC[1] + 1.2, 0.4] },
    { c: '#7fb0ff', mat: 'blue', at: [830, 420], p: k => [XP + 0.5, k.p.y - 0.2, 0.4] },
    { c: '#ffcf5c', mat: 'gold', at: [250, 1050], p: k => [XD - 0.9, k.d.y - 0.6, 0.4] },
    { c: '#ff9d5a', mat: 'red', at: [830, 1450], p: [XD + 0.5, DBOT - 0.5, 0.4] },
  ],
  counters: [
    { label: { tr: 'Volan', en: 'Flywheel' }, c: '#c9d1dc', fn: (t, L) => fmtN(W * (phase(t) - phase(Math.min(t, TL.cnt0))) / TAU, 2, L) + (L === 'tr' ? ' tur' : ' turns') },
    { label: { tr: 'Faz farkı', en: 'Phase shift' }, c: '#ffcf5c', fn: () => '90°' },
  ],
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    // flywheel + crank
    S.crank = new THREE.Group(); S.crank.position.set(CC[0], CC[1], 0); scene.add(S.crank);
    const fw = new THREE.Shape(); fw.absarc(0, 0, 1.7, 0, TAU, false); for (let i = 0; i < 6; i++) { const h = new THREE.Path(), a = i * TAU / 6; h.absarc(1.05 * Math.cos(a), 1.05 * Math.sin(a), 0.36, 0, TAU, true); fw.holes.push(h); }
    const fly = M(extrude(fw, 0.3, 0.03, 48), mats.dark); fly.position.z = -0.75; S.crank.add(fly);
    const sh = M(cylZ(0.18, 1.8), mats.steel); sh.position.z = -0.2; S.crank.add(sh);
    for (const [ang, z] of [[0, 0.25], [-Math.PI / 2, 0.55]]) { const w = M(extrude(capsuleShape(R, 0.22), 0.14), mats.steel); w.rotation.z = Math.PI / 2 - ang; w.position.z = z; S.crank.add(w); const pn = M(cylZ(0.1, 0.4), mats.steel); pn.position.set(R * Math.sin(ang), R * Math.cos(ang), z + 0.1); S.crank.add(pn); }
    const post = M(new THREE.BoxGeometry(0.5, 2.0, 0.5), mats.block); post.position.set(0, CC[1] - 0.9, -1.2); scene.add(post);
    // cylinders
    const glassD = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, DTOP - DBOT, 48, 1, true), mats.glass); glassD.position.set(XD, (DTOP + DBOT) / 2, 0); scene.add(glassD);
    for (let i = 0; i < 5; i++) { const fin = M(new THREE.CylinderGeometry(1.25, 1.25, 0.08, 40), mats.blue); fin.position.set(XD, DTOP - 0.15 - i * 0.22, 0); scene.add(fin); }
    const hot = M(cylY(1.02, 0.35, 48), mats.red); hot.position.set(XD, DBOT + 0.17, 0); scene.add(hot);
    const glassP = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, PTOP - PBOT, 40, 1, true), mats.glass); glassP.position.set(XP, (PTOP + PBOT) / 2, 0); scene.add(glassP);
    const pc = M(cylY(0.64, 0.2, 40), mats.steel); pc.position.set(XP, PBOT - 0.1, 0); scene.add(pc);
    const tube = M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(XD + 0.9, DBOT + 1.0, 0), new THREE.Vector3(0, DBOT + 0.7, 0), new THREE.Vector3(XP, PBOT - 0.6, 0), new THREE.Vector3(XP, PBOT - 0.2, 0)]), 40, 0.14, 10, false), mats.steel); scene.add(tube);
    // gas volumes
    const gm = c => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.55, transparent: true, opacity: 0.5, depthWrite: false });
    S.gHot = new THREE.Mesh(cylY(0.95, 1, 40), gm(0xff6a2a)); scene.add(S.gHot);
    S.gCold = new THREE.Mesh(cylY(0.95, 1, 40), gm(0x4da3ff)); scene.add(S.gCold);
    S.gPow = new THREE.Mesh(cylY(0.58, 1, 32), gm(0xff9d5a)); scene.add(S.gPow);
    // pistons
    S.disp = M(cylY(0.85, 1.0, 40), mats.gold); scene.add(S.disp);
    S.dRod = M(cylY(0.08, 1, 10), mats.steel); scene.add(S.dRod);
    S.pow = M(cylY(0.58, 0.55, 40), mats.blue); scene.add(S.pow);
    S.rods = [M(cylY(0.09, 1, 10), mats.steel), M(cylY(0.09, 1, 10), mats.steel)]; S.rods.forEach(r => scene.add(r));
    // flame
    S.flames = [];
    for (let i = 0; i < 5; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.8, 16), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffb03b : 0xff6a2a, transparent: true, opacity: 0.85 })); f.position.set(XD - 0.6 + i * 0.3, DBOT - 0.6, 0); scene.add(f); S.flames.push(f); }
    const burner = M(new THREE.BoxGeometry(2.0, 0.3, 1.0), mats.dark); burner.position.set(XD, DBOT - 1.1, 0); scene.add(burner);
    const base = M(new THREE.BoxGeometry(5.6, 0.5, 2.2), mats.block); base.position.set(0, -4.15, 0); scene.add(base);
    ctx.arrow(0xc9d1dc, 2.0, [CC[0], CC[1], 0.8], [0, 0, 1], -1, scene, 0.6);
    ctx.linArrow(0x7fb0ff, 1.6, [XP + 1.2, -0.9, 0.3], [0, 1, 0]);
  },
  update(k, t) {
    S.crank.rotation.z = -k.th;
    const dy = k.d.y - 0.5; // displacer centre
    S.disp.position.set(XD, dy, 0);
    setRod(S.dRod, [XD, dy + 0.5, 0], [XD, DTOP + 0.2, 0]);
    setRod(S.rods[0], [XD, DTOP + 0.2, 0.25], [k.d.pin[0], k.d.pin[1], 0.25]);
    const py = k.p.y - 0.28; S.pow.position.set(XP, py, 0);
    setRod(S.rods[1], [XP, py + 0.28, 0.55], [k.p.pin[0], k.p.pin[1], 0.55]);
    const hb = Math.max(0.02, dy - 0.5 - DBOT), hc = Math.max(0.02, DTOP - (dy + 0.5));
    S.gHot.position.set(XD, DBOT + hb / 2, 0); S.gHot.scale.y = hb;
    S.gCold.position.set(XD, DTOP - hc / 2, 0); S.gCold.scale.y = hc;
    const hp = Math.max(0.02, py - 0.28 - PBOT); S.gPow.position.set(XP, PBOT + hp / 2, 0); S.gPow.scale.y = hp;
    const hotFrac = hb / (hb + hc); S.gPow.material.color.setRGB(0.3 + 0.7 * hotFrac, 0.45, 1 - 0.75 * hotFrac); S.gPow.material.emissive.copy(S.gPow.material.color);
    S.flames.forEach((f, i) => { const s = 0.8 + 0.25 * Math.sin(t * 13 + i * 2.1); f.scale.set(1, s, 1); f.position.y = DBOT - 0.85 + 0.4 * s; });
  },
};
