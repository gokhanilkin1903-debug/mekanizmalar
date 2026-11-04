// Worm drive 30:1
import { THREE, TAU, gearGeo, cylX, cylZ, phase, fmtN, TL } from '../engine.js';
const N = 30, m = 0.2, R = N * m / 2, lead = Math.PI * m, Rh = 0.6, AY = Rh + R + 0.02, WW = 7.0, p = TAU / N;
const tanL = lead / (TAU * Rh);
let S = {};
const wt = t => WW * phase(t);
const wheelRot = thw => -Math.PI / 2 + (-thw * lead / TAU) / R - 0.5 * p;
const turns = t => WW * (phase(t) - phase(Math.min(t, TL.cnt0))) / TAU;
export default {
  id: '06',
  view: { az: -8, el: 14, dist: 30, target: [0.2, 2.6, 0], orbit: 0.6, caz: -30, cel: 6, cdist: 15, ctarget: [0, 1.0, 0], low: 0.13, lowDist: 1.15 },
  floorY: -1.7,
  text: {
    tr: { hook: 'Tek dişliyle<br>30 kat yavaşlatma', hookSub: 'Sonsuz vida mekanizması', labels: ['Sonsuz vida çarkı', 'Çıkış mili', 'Sonsuz vida (giriş)', 'Motor'],
      c1: 'Vida + dişli = sonsuz vida', c2a: 'Vida her turda çarkı<br>1 diş iter', c2b: 'Hareket <b>90°</b> döner ve<br><b>30 kat</b> yavaşlar',
      c3a: 'Çark dişi vida yivi<br>boyunca kayar', c3b: 'Çark vidayı <b>geri çeviremez</b>', fbig: '30 : 1', fsub: 'Vida 30 tur atınca<br>çark yalnızca 1 tur döner',
      uses: ['Gitar akort mandalları', 'Asansör makineleri', 'Konveyör redüktörleri', 'Otopark bariyerleri'] },
    en: { hook: '30× slower with<br>a single gear', hookSub: 'The worm drive', labels: ['Worm wheel', 'Output shaft', 'Worm (input)', 'Motor'],
      c1: 'Screw + gear = worm drive', c2a: 'Each worm turn pushes<br>the wheel by 1 tooth', c2b: 'Motion turns <b>90°</b> and<br>slows <b>30×</b>',
      c3a: 'The wheel tooth slides<br>along the thread', c3b: 'The wheel <b>can’t drive</b> the worm back', fbig: '30 : 1', fsub: '30 worm turns =<br>just 1 wheel turn',
      uses: ['Guitar tuning pegs', 'Elevator machines', 'Conveyor gearboxes', 'Parking barriers'] },
  },
  kin(t) { const thw = wt(t); return { thw, rot: wheelRot(thw) }; },
  labels: [
    { c: '#6fe0a4', mat: 'green', at: [250, 330], p: [-2.2, AY + 1.9, 0.4] },
    { c: '#c9d1dc', mat: 'steel', at: [830, 330], p: [0, AY, 1.6] },
    { c: '#ffcf5c', mat: 'gold', at: [250, 1450], p: [-1.2, -0.5, 0.5] },
    { c: '#7fb0ff', mat: 'dark', at: [830, 1450], p: [4.4, -0.4, 0.5] },
  ],
  counters: [
    { label: { tr: 'Sonsuz vida', en: 'Worm' }, c: '#ffcf5c', fn: (t, L) => fmtN(turns(t), 1, L) + (L === 'tr' ? ' tur' : ' turns') },
    { label: { tr: 'Çark', en: 'Wheel' }, c: '#6fe0a4', fn: (t, L) => fmtN(turns(t) / N, 3, L) + (L === 'tr' ? ' tur' : ' turns') },
  ],
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    // worm
    S.worm = new THREE.Group(); scene.add(S.worm);
    const core = M(cylX(0.44, 5.0, 40), mats.gold); S.worm.add(core);
    const pts = []; const s0 = -2.35 * TAU / lead, s1 = 2.35 * TAU / lead, n = 900;
    for (let i = 0; i <= n; i++) { const s = s0 + (s1 - s0) * i / n; pts.push(new THREE.Vector3(s * lead / TAU, Rh * Math.cos(s), Rh * Math.sin(s))); }
    const th = M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n, 0.19, 10, false), mats.gold); S.worm.add(th);
    const wsh = M(cylX(0.22, 9.2), mats.steel); wsh.position.x = 0.6; S.worm.add(wsh);
    const key = M(new THREE.BoxGeometry(2.0, 0.08, 0.08), mats.dark); key.position.set(-4.0, 0.22, 0); S.worm.add(key);
    for (const x of [-3.2, 3.0]) { const b = M(new THREE.BoxGeometry(0.7, 0.9, 1.0), mats.block); b.position.set(x, 0, 0); scene.add(b); const l = M(new THREE.BoxGeometry(0.7, 1.3, 1.0), mats.block); l.position.set(x, -1.05, 0); scene.add(l); }
    const mot = M(cylX(0.75, 1.6, 40), mats.dark); mot.position.set(4.4, 0, 0); scene.add(mot);
    const fin = M(cylX(0.78, 0.12, 40), mats.blue); fin.position.set(3.65, 0, 0); scene.add(fin);
    // wheel with helical twist
    const g = gearGeo(N, m, 0.8, 0.25), pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), a = z * tanL / R, c = Math.cos(a), s = Math.sin(a); pos.setXY(i, x * c - y * s, x * s + y * c); }
    g.computeVertexNormals();
    S.wheel = new THREE.Group(); S.wheel.position.y = AY; scene.add(S.wheel);
    const wm = M(g, mats.green); S.wheel.add(wm);
    const web = new THREE.Shape(); web.absarc(0, 0, R - 0.45, 0, TAU, false);
    for (let i = 0; i < 6; i++) { const h = new THREE.Path(), a = i * TAU / 6; h.absarc(1.45 * Math.cos(a), 1.45 * Math.sin(a), 0.42, 0, TAU, true); web.holes.push(h); }
    const hub = M(cylZ(0.55, 1.0), mats.green); S.wheel.add(hub);
    const osh = M(cylZ(0.25, 3.2), mats.steel); osh.position.z = 0.4; S.wheel.add(osh);
    const okey = M(new THREE.BoxGeometry(0.08, 0.08, 1.4), mats.dark); okey.position.set(0, 0.25, 1.4); S.wheel.add(okey);
    const st = M(new THREE.BoxGeometry(0.9, AY + 1.2, 0.5), mats.block); st.position.set(0, (AY - 1.7) / 2 + 0.25, -1.3); scene.add(st);
    const sb = M(new THREE.BoxGeometry(1.0, 1.0, 0.7), mats.block); sb.position.set(0, AY, -1.0); scene.add(sb);
    ctx.arrow(0xffcf5c, 0.75, [-2.4, 0, 0], [1, 0, 0], 1, scene, 1.4);
    ctx.arrow(0x6fe0a4, 1.5, [0, AY, 0.9], [0, 0, 1], -1, scene, 0.4);
  },
  update(k) { S.worm.rotation.x = k.thw; S.wheel.rotation.z = k.rot; },
};
