// Axial piston swashplate pump
import { THREE, TAU, ss, cylY, phase, fmtN, TL } from '../engine.js';
const NPi = 5, RB = 1.6, PY = -2.2, WB = 2.2, A0 = 18;
const alphaDeg = t => A0 - 12 * (ss((t - 23.8) / 1.2) - ss((t - 26.6) / 0.8));
let S = {};
const blue = new THREE.Color(0x4da3ff), orange = new THREE.Color(0xff8a3d);
export default {
  id: '21',
  view: { az: -28, el: 18, dist: 22, target: [0, 0.4, 0], orbit: 0.6, caz: -40, cel: 10, cdist: 11, ctarget: [0, -1.0, 0], low: 0.17, lowDist: 1.25 },
  floorY: -3.9,
  text: {
    tr: { hook: 'Bir açı tüm<br>hidroliği yönetir', hookSub: 'Eğik plakalı pompa', labels: ['Valf plakası', 'Döner silindir bloğu', 'Pistonlar', 'Eğik plaka'],
      c1: 'Döner blok, 5 piston, eğik plaka', c2a: 'Blok döndükçe pistonlar<br>plakayı izler', c2b: 'Aşağı inen piston <b>emer</b>,<br>yukarı çıkan <b>basar</b>',
      c3a: '<span class="bl">Mavi</span>: emme · <span style="color:#ff9d5a">Turuncu</span>: basma', c3b: 'Plaka açısı <b>strok boyunu</b><br>belirler', fbig: 'Debi ∝ tan α', fsub: 'Açıyı küçült, debi azalır;<br>0°’de pompa hiç basmaz',
      uses: ['Ekskavatör hidroliği', 'Uçak hidrolik sistemleri', 'Otomobil klima kompresörleri', 'Hidrostatik şanzımanlar'] },
    en: { hook: 'One angle runs<br>all the hydraulics', hookSub: 'The swashplate pump', labels: ['Valve plate', 'Rotating cylinder block', 'Pistons', 'Swashplate'],
      c1: 'A rotating block, 5 pistons,<br>a tilted plate', c2a: 'As the block turns,<br>the pistons ride the plate', c2b: 'Pistons going down <b>suck in</b>,<br>going up <b>push out</b>',
      c3a: '<span class="bl">Blue</span>: intake · <span style="color:#ff9d5a">Orange</span>: discharge', c3b: 'The plate angle sets<br>the <b>stroke</b>', fbig: 'Flow ∝ tan α', fsub: 'Reduce the angle, flow drops;<br>at 0° the pump delivers nothing',
      uses: ['Excavator hydraulics', 'Aircraft hydraulic systems', 'Car A/C compressors', 'Hydrostatic transmissions'] },
  },
  kin(t) { const th = WB * phase(t), a = alphaDeg(t) * Math.PI / 180; return { th, a }; },
  labels: [
    { c: '#c9d1dc', mat: 'steel', at: [830, 330], p: [1.2, 3.1, 1.2] },
    { c: '#9cc7ff', mat: 'glass', at: [250, 330], p: [-2.2, 1.6, 0.6] },
    { c: '#ffcf5c', mat: 'gold', at: [830, 1450], p: k => { const x = RB * Math.cos(k.th + 1.2), z = -RB * Math.sin(k.th + 1.2); return [x, PY + Math.tan(k.a) * x + 1.2, z]; } },
    { c: '#6fe0a4', mat: 'green', at: [250, 1450], p: k => [-2.2, PY + Math.tan(k.a) * -2.2 - 0.1, 0.6] },
  ],
  counters: [
    { label: { tr: 'Plaka açısı', en: 'Plate angle' }, c: '#6fe0a4', fn: t => Math.round(alphaDeg(t)) + '°' },
    { label: { tr: 'Debi', en: 'Flow' }, c: '#ff9d5a', fn: t => '%' + Math.round(100 * Math.tan(alphaDeg(t) * Math.PI / 180) / Math.tan(A0 * Math.PI / 180)) },
  ],
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    S.plate = new THREE.Group(); S.plate.position.set(0, PY, 0); scene.add(S.plate);
    const pl = M(cylY(2.6, 0.26, 64), mats.green); pl.position.y = -0.13; S.plate.add(pl);
    const base = M(new THREE.BoxGeometry(4.2, 1.2, 3.0), mats.block); base.position.set(0, -3.3, 0); scene.add(base);
    S.block = new THREE.Group(); scene.add(S.block);
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 3.0, 64, 1, true), mats.glass); shell.position.y = 1.3; S.block.add(shell);
    for (const y of [-0.2, 2.8]) { const ring = M(new THREE.TorusGeometry(2.4, 0.06, 8, 64).rotateX(Math.PI / 2), mats.steel); ring.position.y = y; S.block.add(ring); }
    S.pist = []; S.fluid = [];
    for (let i = 0; i < NPi; i++) {
      const a = i * TAU / NPi, x = RB * Math.cos(a), z = -RB * Math.sin(a);
      const bore = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 3.0, 24, 1, true), mats.glass); bore.position.set(x, 1.3, z); S.block.add(bore);
      const p = new THREE.Group(); scene.add(p);
      const body = M(cylY(0.36, 2.2, 24), mats.gold); body.position.y = 1.45; p.add(body);
      const rod = M(cylY(0.16, 0.5, 16), mats.steel); rod.position.y = 0.3; p.add(rod);
      const shoe = M(new THREE.SphereGeometry(0.3, 20, 14), mats.steel); shoe.position.y = 0.15; p.add(shoe);
      S.pist.push(p);
      const fm = new THREE.MeshStandardMaterial({ color: 0x4da3ff, emissive: 0x4da3ff, emissiveIntensity: 0.5, transparent: true, opacity: 0.8, roughness: 0.3 });
      const f = new THREE.Mesh(cylY(0.34, 1, 20), fm); scene.add(f); S.fluid.push(f);
    }
    const sh = M(cylY(0.28, 7.2), mats.steel); sh.position.y = 1.0; S.block.add(sh);
    const key = M(new THREE.BoxGeometry(0.1, 1.2, 0.1), mats.dark); key.position.set(0.28, 3.9, 0); S.block.add(key);
    const vp = M(cylY(2.45, 0.3, 64), mats.steel); vp.position.y = 2.98; scene.add(vp);
    const kid = (col, start) => { const k = M(new THREE.TorusGeometry(RB, 0.24, 10, 40, Math.PI * 0.8).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.4 })); k.rotation.y = start; k.position.y = 3.14; scene.add(k); };
    kid(0x4da3ff, Math.PI * 1.1); kid(0xff8a3d, Math.PI * 0.1);
    const mot = M(cylY(0.9, 1.4), mats.dark); mot.position.y = 4.9; scene.add(mot);
    ctx.arrow(0xffcf5c, 2.9, [0, 1.3, 0], [0, 1, 0], 1, scene, 0.5);
  },
  update(k) {
    S.block.rotation.y = k.th; S.plate.rotation.z = k.a;
    for (let i = 0; i < NPi; i++) {
      const a = k.th + i * TAU / NPi, x = RB * Math.cos(a), z = -RB * Math.sin(a), y = PY + Math.tan(k.a) * x;
      S.pist[i].position.set(x, y, z);
      const top = y + 2.55, h = Math.max(0.05, 2.8 - top);
      const f = S.fluid[i]; f.position.set(x, top + h / 2, z); f.scale.y = h;
      const s = Math.sin(a), w = 0.5 + 0.5 * Math.tanh(s * 4);
      f.material.color.copy(blue).lerp(orange, 1 - w); f.material.emissive.copy(f.material.color);
    }
  },
};
