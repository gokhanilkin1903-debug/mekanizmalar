// Slider-crank (piston engine)
import { THREE, TAU, mod, extrude, capsuleShape, cylZ, cylY, phase, fmtN, TL } from '../engine.js';
const r = 1.1, Lr = 3.6, CY = -2.2, W = 3.0;
const pistonY = th => CY + r * Math.cos(th) + Math.sqrt(Lr * Lr - (r * Math.sin(th)) ** 2);
let S = {};
const turns = t => W * (phase(t) - phase(Math.min(t, TL.cnt0))) / TAU;
export default {
  id: '03',
  view: { az: 0, el: 14, dist: 27, target: [0, 1.0, 0], orbit: 0.55, caz: -28, cel: 6, cdist: 12, ctarget: [0, 1.4, 0], low: 0.17, lowDist: 1.3 },
  floorY: -4.3,
  text: {
    tr: { hook: 'Motorun kalbi<br>nasıl atar?', hookSub: 'Krank-biyel mekanizması', labels: ['Silindir', 'Piston', 'Biyel kolu', 'Krank mili'],
      c1: 'Dönme ↔ doğrusal hareket', c2a: 'Piston yukarı-aşağı gider', c2b: 'Krank mili bunu<br><b>dönmeye</b> çevirir',
      c3a: 'Üst ölü nokta:<br>piston bir an durur', c3b: 'Her turda <b>2 strok</b>', fbig: 'Strok = 2 × r', fsub: 'Piston yolu, krank yarıçapının<br>tam iki katıdır',
      uses: ['Otomobil motorları', 'Hava kompresörleri', 'Pistonlu pompalar', 'Buhar makineleri'] },
    en: { hook: 'How does an engine’s<br>heart beat?', hookSub: 'The slider-crank mechanism', labels: ['Cylinder', 'Piston', 'Connecting rod', 'Crankshaft'],
      c1: 'Rotation ↔ straight-line motion', c2a: 'The piston moves up and down', c2b: 'The crankshaft turns that<br>into <b>rotation</b>',
      c3a: 'Top dead center:<br>the piston stops for an instant', c3b: '<b>2 strokes</b> every turn', fbig: 'Stroke = 2 × r', fsub: 'The piston travels exactly<br>twice the crank radius',
      uses: ['Car engines', 'Air compressors', 'Piston pumps', 'Steam engines'] },
  },
  kin(t) {
    const th = W * phase(t), pin = [r * Math.sin(th), CY + r * Math.cos(th), 0], py = pistonY(th);
    return { th, pin, py };
  },
  labels: [
    { c: '#9cc7ff', mat: 'glass', at: [250, 330], p: [-0.95, 3.0, 0.3] },
    { c: '#c9d1dc', mat: 'steel', at: [830, 420], p: k => [0.6, k.py + 0.3, 0.75] },
    { c: '#7fb0ff', mat: 'blue', at: [830, 1180], p: k => [(k.pin[0]) / 2, (k.pin[1] + k.py) / 2, 0.2] },
    { c: '#ffcf5c', mat: 'gold', at: [250, 1450], p: [0, CY, 0.9] },
  ],
  counters: [
    { label: { tr: 'Krank', en: 'Crank' }, c: '#ffcf5c', fn: (t, L) => fmtN(turns(t), 2, L) + (L === 'tr' ? ' tur' : ' turns') },
    { label: { tr: 'Strok', en: 'Strokes' }, c: '#7fb0ff', fn: (t, L) => String(Math.floor(turns(t) * 2 + 1e-6)) },
  ],
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    // crank assembly
    S.crank = new THREE.Group(); S.crank.position.y = CY; scene.add(S.crank);
    for (const z of [-0.42, 0.42]) {
      const cw = new THREE.Shape(); cw.absarc(0, 0, 1.45, Math.PI * 1.15, Math.PI * 1.85 + 0.0, false); cw.absarc(0, 0, 0.55, -0.3, Math.PI + 0.3, false);
      const web = M(extrude(cw, 0.22), mats.gold); web.position.z = z; web.rotation.z = 0; S.crank.add(web);
      const arm = M(extrude(capsuleShape(r, 0.45), 0.22), mats.gold); arm.rotation.z = Math.PI / 2; arm.position.z = z; S.crank.add(arm);
    }
    const cpin = M(cylZ(0.24, 1.06), mats.steel); cpin.position.y = r; S.crank.add(cpin);
    const main = M(cylZ(0.3, 3.4), mats.steel); main.position.z = -1.0; S.crank.add(main);
    const fw = new THREE.Shape(); fw.absarc(0, 0, 1.7, 0, TAU, false);
    for (let i = 0; i < 5; i++) { const h = new THREE.Path(), a = i * TAU / 5; h.absarc(1.0 * Math.cos(a), 1.0 * Math.sin(a), 0.38, 0, TAU, true); fw.holes.push(h); }
    const fly = M(extrude(fw, 0.3, 0.03, 48), mats.dark); fly.position.z = -2.3; S.crank.add(fly);
    const brg = M(new THREE.BoxGeometry(1.3, 2.0, 0.6), mats.block); brg.position.set(0, CY - 0.9, -1.25); scene.add(brg);
    // connecting rod (built along +y from big end)
    const rs = new THREE.Shape(); rs.absarc(0, 0, 0.48, Math.PI * 0.85, Math.PI * 2.15, false); rs.absarc(0, Lr, 0.32, Math.PI * 0.1 - 0.0, Math.PI * 0.9, false); rs.closePath();
    for (const [x, y, rr] of [[0, 0, 0.25], [0, Lr, 0.15]]) { const h = new THREE.Path(); h.absarc(x, y, rr, 0, TAU, true); rs.holes.push(h); }
    S.rod = M(extrude(rs, 0.42), mats.blue); scene.add(S.rod);
    // piston
    S.piston = new THREE.Group(); scene.add(S.piston);
    const pb = M(cylY(0.86, 1.15, 48), mats.steel); pb.position.y = 0.3; S.piston.add(pb);
    for (const y of [0.62, 0.75]) { const rg = M(new THREE.TorusGeometry(0.865, 0.03, 8, 48).rotateX(Math.PI / 2), mats.dark); rg.position.y = y; S.piston.add(rg); }
    const wp = M(cylZ(0.15, 1.5), mats.dark); S.piston.add(wp);
    // cylinder sleeve + head
    const top = pistonY(0) + 0.88;
    const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.92, 3.4, 48, 1, true), mats.glass); sl.position.y = top - 1.7; scene.add(sl);
    const rimTop = M(new THREE.TorusGeometry(0.95, 0.06, 8, 48).rotateX(Math.PI / 2), mats.steel); rimTop.position.y = top - 3.4; scene.add(rimTop);
    const head = M(new THREE.CylinderGeometry(1.15, 1.15, 0.55, 48), mats.dark); head.position.y = top + 0.27; scene.add(head);
    const plug = M(cylY(0.16, 0.7), mats.steel); plug.position.y = top + 0.85; scene.add(plug);
    S.flashMat = new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0, depthWrite: false });
    S.flash = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.5, 40), S.flashMat); S.flash.position.y = top - 0.25; scene.add(S.flash);
    S.light = new THREE.PointLight(0xff8a30, 0, 8); S.light.position.y = top - 0.3; scene.add(S.light);
    S.top = top;
    ctx.arrow(0xffcf5c, 1.85, [0, CY, 1.0], [0, 0, 1], -1);
    ctx.linArrow(0x7fb0ff, 2.4, [1.65, pistonY(Math.PI / 2) + 0.3, 0], [0, 1, 0]);
  },
  update(k) {
    S.crank.rotation.z = -k.th;
    S.rod.position.set(...k.pin); S.rod.rotation.z = Math.atan2(-(0 - k.pin[0]), k.py - k.pin[1]);
    S.piston.position.set(0, k.py, 0);
    const c = mod(k.th, 2 * TAU), f = c < 1.4 ? Math.exp(-c * 2.5) : 0;
    S.flashMat.opacity = 0.75 * f; S.flash.visible = f > 0.01; S.flash.scale.y = 1; S.flash.position.y = (k.py + 0.88 + S.top) / 2; S.flash.scale.y = Math.max(0.05, (S.top - k.py - 0.88) / 0.5);
    S.light.intensity = 30 * f;
  },
};
