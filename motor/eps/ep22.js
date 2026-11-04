// Gamma-type Stirling engine: crosshead displacer, power piston, gas particles, pressure gauge
import { THREE, TAU, mod, extrude, capsuleShape, cylY, cylZ, setRod, phase, fmtN, fade, TL } from '../engine.js';
const CC = [0, 2.6], R = 0.55, XD = -1.5, XP = 1.5, W = 2.4;
const DBOT = -3.0, DTOP = -0.3, DR = 1.0, DH = 0.9, DRAD = 0.82, LC = 2.6, LROD = 2.13;
const PTOP = 0.3, PBOT = -2.0, PR = 0.6, PH = 0.6, LP = 3.6;
const pinAt = th => [CC[0] + R * Math.sin(th), CC[1] + R * Math.cos(th)];
const slide = (pin, x, L) => pin[1] - Math.sqrt(L * L - (x - pin[0]) ** 2);
const VD = (DTOP - DBOT - DH), VPMIN = 0.15;
function kinAt(th) {
  const pd = pinAt(th), pp = pinAt(th - Math.PI / 2);
  const xh = slide(pd, XD, LC), dc = xh - LROD;                   // crosshead y, displacer centre
  const wp = slide(pp, XP, LP);                                     // power piston centre
  const hb = dc - DH / 2 - DBOT, hc = DTOP - (dc + DH / 2);         // hot / cold gas heights
  const hp = wp - PH / 2 - PBOT;                                     // gas under power piston
  const fh = hb / (hb + hc), T = 1.0 + 0.6 * fh;                    // mean gas temperature (cold = 1, hot = 1.6)
  const Vt = (hb + hc) * DR * DR + hp * PR * PR;
  return { th, pd, pp, xh, dc, wp, hb, hc, hp, fh, T, p: T / Vt };
}
const PREF = (() => { let a = 1e9, b = -1e9; for (let i = 0; i < 360; i++) { const p = kinAt(i / 360 * TAU).p; a = Math.min(a, p); b = Math.max(b, p); } return [a, b]; })();
const STG = { tr: ['1 · Isıtma', '2 · Genleşme', '3 · Soğutma', '4 · Sıkıştırma'], en: ['1 · Heating', '2 · Expansion', '3 · Cooling', '4 · Compression'] };
const SCOL = ['#ff6a2a', '#ff9d3b', '#4da3ff', '#a98bff'];
const stage = th => { const a = mod(th + Math.PI / 2, TAU); return Math.floor(a / (Math.PI / 2)) % 4; };
let S = {};
const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const PD = [...Array(160)].map(() => ({ u: rnd(), r: Math.sqrt(rnd()) * 0.9, a: rnd() * TAU, f: 3 + rnd() * 4, ph: rnd() * TAU }));
const PPw = [...Array(40)].map(() => ({ u: rnd(), r: Math.sqrt(rnd()) * 0.5, a: rnd() * TAU, f: 3 + rnd() * 4, ph: rnd() * TAU }));
const HOT = new THREE.Color(0xff5a1f), COLD = new THREE.Color(0x3d9bff);
export default {
  id: '22',
  view: { az: -16, el: 12, dist: 27, target: [0, 0.4, 0], orbit: 0.55, caz: -26, cel: 8, cdist: 14, ctarget: [-0.6, -1.2, 0], low: 0.17, lowDist: 1.25 },
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
  kin(t) { return { t, ...kinAt(W * phase(t)) }; },
  labels: [
    { c: '#c9d1dc', mat: 'dark', at: [250, 330], p: [CC[0] - 1.5, CC[1] + 1.1, -0.6] },
    { c: '#7fb0ff', mat: 'blue', at: [830, 560], p: k => [XP + PR, k.wp, 0.2] },
    { c: '#ffcf5c', mat: 'gold', at: [250, 1050], p: k => [XD - DRAD, k.dc, 0.3] },
    { c: '#ff9d5a', mat: 'red', at: [830, 1450], p: [XD + 0.6, DBOT - 0.3, 0.6] },
  ],
  counters: [
    { label: { tr: 'Gaz basıncı', en: 'Gas pressure' }, c: '#ff9d5a', fn: (t, L, k) => '%' + Math.round(100 * (k.p - PREF[0]) / (PREF[1] - PREF[0])) },
    { label: { tr: 'Faz farkı', en: 'Phase shift' }, c: '#ffcf5c', fn: () => '90°' },
  ],
  overlay(t, k, ctx) {
    const o = fade(t, 10.3, 23.2, 0.5); if (o < 0.01) return '';
    const i = stage(k.th), txt = STG[ctx.L][i], w = txt.length * 24 + 44;
    return `<g opacity="${o}"><rect x="${540 - w / 2}" y="${250}" width="${w}" height="64" rx="32" fill="${SCOL[i]}"/><text x="540" y="294" fill="#fff" font-size="36" font-weight="800" text-anchor="middle">${txt}</text></g>`;
  },
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    // flywheel + two-throw crank
    S.crank = new THREE.Group(); S.crank.position.set(CC[0], CC[1], 0); scene.add(S.crank);
    const fw = new THREE.Shape(); fw.absarc(0, 0, 1.7, 0, TAU, false); for (let i = 0; i < 6; i++) { const h = new THREE.Path(), a = i * TAU / 6; h.absarc(1.05 * Math.cos(a), 1.05 * Math.sin(a), 0.36, 0, TAU, true); fw.holes.push(h); }
    const fly = M(extrude(fw, 0.3, 0.03, 48), mats.dark); fly.position.z = -0.75; S.crank.add(fly);
    const sh = M(cylZ(0.18, 1.8), mats.steel); sh.position.z = -0.2; S.crank.add(sh);
    for (const [ang, z] of [[0, 0.25], [-Math.PI / 2, 0.55]]) { const w = M(extrude(capsuleShape(R, 0.22), 0.14), mats.steel); w.rotation.z = Math.PI / 2 - ang; w.position.z = z; S.crank.add(w); const pn = M(cylZ(0.1, 0.4), mats.steel); pn.position.set(R * Math.sin(ang), R * Math.cos(ang), z + 0.1); S.crank.add(pn); }
    const post = M(new THREE.BoxGeometry(0.5, 2.2, 0.5), mats.block); post.position.set(0, CC[1] - 1.0, -1.2); scene.add(post);
    // displacer cylinder: hot bottom, glass wall, finned cold top
    const glassD = new THREE.Mesh(new THREE.CylinderGeometry(DR, DR, DTOP - DBOT, 48, 1, true), mats.glass); glassD.position.set(XD, (DTOP + DBOT) / 2, 0); scene.add(glassD);
    const hotM = new THREE.MeshStandardMaterial({ color: 0xff5a1f, emissive: 0xff3a0a, emissiveIntensity: 0.7, metalness: 0.4, roughness: 0.4 });
    const hot = M(cylY(DR + 0.05, 0.3, 48), hotM); hot.position.set(XD, DBOT - 0.15, 0); scene.add(hot);
    const cap = M(cylY(DR + 0.05, 0.25, 48), mats.blue); cap.position.set(XD, DTOP + 0.12, 0); scene.add(cap);
    for (let i = 0; i < 4; i++) { const fin = M(cylY(1.32, 0.07, 40), mats.blue); fin.position.set(XD, DTOP - 0.05 - i * 0.2, 0); scene.add(fin); }
    const gland = M(cylY(0.2, 0.3, 20), mats.steel); gland.position.set(XD, DTOP + 0.38, 0); scene.add(gland);
    const guide = M(new THREE.BoxGeometry(0.62, 1.6, 0.5), new THREE.MeshStandardMaterial({ color: 0xe6dfc8, roughness: 0.6, transparent: true, opacity: 0.35 })); guide.position.set(XD, 0.5, -0.1); scene.add(guide);
    // power cylinder
    const glassP = new THREE.Mesh(new THREE.CylinderGeometry(PR + 0.04, PR + 0.04, PTOP - PBOT, 40, 1, true), mats.glass); glassP.position.set(XP, (PTOP + PBOT) / 2, 0); scene.add(glassP);
    const pc = M(cylY(PR + 0.08, 0.2, 40), mats.steel); pc.position.set(XP, PBOT - 0.1, 0); scene.add(pc);
    const tube = M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(XD + DR, DBOT + 0.6, 0), new THREE.Vector3(0, DBOT + 0.5, 0), new THREE.Vector3(XP, PBOT - 0.5, 0), new THREE.Vector3(XP, PBOT - 0.2, 0)]), 40, 0.14, 10, false), mats.steel); scene.add(tube);
    // pressure gauge on the tube
    S.gauge = new THREE.Group(); S.gauge.position.set(0, DBOT + 1.15, 0.2); scene.add(S.gauge);
    S.gauge.add(M(cylZ(0.5, 0.15, 40), mats.steel));
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.43, 40), new THREE.MeshBasicMaterial({ color: 0xf4f6fa })); face.position.z = 0.08; S.gauge.add(face);
    const arc = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.38, 32, 1, -0.4, Math.PI * 0.6), new THREE.MeshBasicMaterial({ color: 0xff5a5a })); arc.position.z = 0.085; S.gauge.add(arc);
    S.needle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.38, 0.02), new THREE.MeshBasicMaterial({ color: 0x111111 })); S.needle.geometry.translate(0, 0.17, 0); S.needle.position.z = 0.1; S.gauge.add(S.needle);
    const stem = M(cylY(0.08, 0.5, 12), mats.steel); stem.position.set(0, -0.55, -0.2); S.gauge.add(stem);
    // moving parts
    S.disp = M(cylY(DRAD, DH, 40), new THREE.MeshStandardMaterial({ color: 0xd9d4c4, roughness: 0.9 })); scene.add(S.disp);
    mats.gold.color.set(0xe8a93a); S.dispBand = M(new THREE.TorusGeometry(DRAD, 0.05, 8, 40).rotateX(Math.PI / 2), mats.gold); scene.add(S.dispBand);
    S.dRod = M(cylY(0.07, 1, 10), mats.steel); scene.add(S.dRod);
    S.xh = M(new THREE.BoxGeometry(0.5, 0.3, 0.4), mats.gold); scene.add(S.xh);
    S.pow = M(cylY(PR, PH, 40), mats.blue); scene.add(S.pow);
    S.rods = [M(cylY(0.09, 1, 10), mats.steel), M(cylY(0.09, 1, 10), mats.steel)]; S.rods.forEach(r => scene.add(r));
    // gas particles (instanced)
    const pg = new THREE.SphereGeometry(0.07, 8, 6), pm = new THREE.MeshBasicMaterial({ color: 0xffffff });
    S.gasD = new THREE.InstancedMesh(pg, pm, PD.length); S.gasP = new THREE.InstancedMesh(pg, pm.clone(), PPw.length);
    for (let i = 0; i < PD.length; i++) S.gasD.setColorAt(i, COLD); for (let i = 0; i < PPw.length; i++) S.gasP.setColorAt(i, COLD);
    scene.add(S.gasD, S.gasP); S.m4 = new THREE.Matrix4();
    // flame
    S.flames = [];
    for (let i = 0; i < 7; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.9, 16), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffc43b : 0xff6a2a, transparent: true, opacity: 0.9 })); f.position.set(XD - 0.75 + i * 0.25, DBOT - 0.8, 0); scene.add(f); S.flames.push(f); }
    S.flameLight = new THREE.PointLight(0xff7a2a, 12, 6); S.flameLight.position.set(XD, DBOT - 0.6, 0.6); scene.add(S.flameLight);
    const burner = M(new THREE.BoxGeometry(2.1, 0.3, 1.0), mats.dark); burner.position.set(XD, DBOT - 1.35, 0); scene.add(burner);
    const base = M(new THREE.BoxGeometry(5.8, 0.5, 2.2), mats.block); base.position.set(0, -4.15, 0); scene.add(base);
    ctx.arrow(0xc9d1dc, 2.0, [CC[0], CC[1], 0.8], [0, 0, 1], -1, scene, 0.6);
    ctx.linArrow(0x7fb0ff, 1.6, [XP + 1.15, -0.65, 0.3], [0, 1, 0]);
  },
  update(k, t) {
    S.crank.rotation.z = -k.th;
    S.disp.position.set(XD, k.dc, 0); S.dispBand.position.set(XD, k.dc + DH / 2 - 0.05, 0);
    S.xh.position.set(XD, k.xh, 0.05);
    setRod(S.dRod, [XD, k.dc + DH / 2, 0], [XD, k.xh, 0]);
    setRod(S.rods[0], [XD, k.xh, 0.25], [k.pd[0], k.pd[1], 0.25]);
    S.pow.position.set(XP, k.wp, 0);
    setRod(S.rods[1], [XP, k.wp, 0.55], [k.pp[0], k.pp[1], 0.55]);
    // gas in displacer cylinder: fills hot space below and cold space above the displacer
    const tot = k.hb + k.hc, col = new THREE.Color();
    PD.forEach((q, i) => {
      let y = q.u * tot; const inHot = y < k.hb; y = inHot ? DBOT + y : k.dc + DH / 2 + (y - k.hb);
      const amp = inHot ? 0.07 : 0.03, x = XD + q.r * Math.cos(q.a) + amp * Math.sin(t * q.f + q.ph), z = q.r * Math.sin(q.a) + amp * Math.cos(t * q.f * 1.3 + q.ph);
      col.copy(inHot ? HOT : COLD);
      S.m4.makeTranslation(x, Math.min(DTOP - 0.05, Math.max(DBOT + 0.05, y)), z); S.gasD.setMatrixAt(i, S.m4); S.gasD.setColorAt(i, col);
    });
    const pcCol = new THREE.Color().copy(COLD).lerp(HOT, k.fh);
    PPw.forEach((q, i) => { const y = PBOT + 0.05 + q.u * Math.max(0.05, k.hp - 0.1); S.m4.makeTranslation(XP + q.r * Math.cos(q.a) + 0.04 * Math.sin(t * q.f + q.ph), y, q.r * Math.sin(q.a)); S.gasP.setMatrixAt(i, S.m4); S.gasP.setColorAt(i, pcCol); });
    S.gasD.instanceMatrix.needsUpdate = true; S.gasD.instanceColor.needsUpdate = true; S.gasP.instanceMatrix.needsUpdate = true; S.gasP.instanceColor.needsUpdate = true;
    S.needle.rotation.z = 1.2 - 2.4 * (k.p - PREF[0]) / (PREF[1] - PREF[0]);
    S.flames.forEach((f, i) => { const s = 0.85 + 0.3 * Math.sin(t * 13 + i * 2.1); f.scale.set(1, s, 1); f.position.y = DBOT - 1.2 + 0.45 * s; });
    S.flameLight.intensity = 10 + 3 * Math.sin(t * 11);
  },
};
