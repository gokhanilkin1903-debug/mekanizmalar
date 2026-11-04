// Universal (Cardan) joint, 30 degrees
import { THREE, TAU, cylX, cylY, phase, fmtN, TL } from '../engine.js';
const BETA = 30 * Math.PI / 180, ROOT = 75 * Math.PI / 180, W1 = 2.0, FY = 0.95, AX = 1.05, SL = 3.4;
const u1 = new THREE.Vector3(1, 0, 0), u2 = new THREE.Vector3(Math.cos(BETA), Math.sin(BETA), 0);
const e1 = new THREE.Vector3(0, 0, 1), e2 = new THREE.Vector3().crossVectors(u2, e1);
function joint(th1) {
  const a = new THREE.Vector3(0, Math.cos(th1), Math.sin(th1));
  const b = new THREE.Vector3().crossVectors(a, u2).normalize();
  return { a, b, th2: Math.atan2(b.dot(e2), b.dot(e1)) };
}
const ratio = th1 => { const e = 1e-3; let d = joint(th1 + e).th2 - joint(th1 - e).th2; d = ((d + Math.PI) % TAU + TAU) % TAU - Math.PI; return d / (2 * e); };
const rot = p => { const c = Math.cos(ROOT), s = Math.sin(ROOT); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]; };
const basis = (x, y) => new THREE.Matrix4().makeBasis(x, y, new THREE.Vector3().crossVectors(x, y));
let S = {};
export default {
  id: '09',
  view: { az: -8, el: 12, dist: 25, target: [-0.6, 0.0, 0], orbit: 0.7, caz: -35, cel: 10, cdist: 14, ctarget: [0, 0, 0], low: 0.22, lowDist: 1.45 },
  floorY: -6.3,
  text: {
    tr: { hook: 'Açılı iki mil nasıl<br>birlikte döner?', hookSub: 'Kardan mafsalı', labels: ['Çıkış mili (30° açılı)', 'Haç (istavroz)', 'Çatal', 'Giriş mili'],
      c1: 'İki çatal ve bir haç', c2a: 'Haç iki çatalı<br>birbirine bağlar', c2b: 'Hareket <b>açının etrafından</b><br>aktarılır',
      c3a: 'Haç her turda<br>iki kez yalpalar', c3b: 'Çıkış hızı <b>dalgalanır</b>', fbig: '0,87× ↔ 1,15×', fsub: '30° açıda çıkış hızı<br>her turda iki kez iner ve çıkar',
      uses: ['Kardan milleri (araçlar)', 'Direksiyon kolonları', 'Traktör kuyruk milleri', 'Haddehane tahrikleri'] },
    en: { hook: 'How do two angled<br>shafts turn together?', hookSub: 'The universal joint', labels: ['Output shaft (30°)', 'Cross (spider)', 'Yoke', 'Input shaft'],
      c1: 'Two yokes and a cross', c2a: 'The cross links<br>the two yokes', c2b: 'Motion is carried<br><b>around the corner</b>',
      c3a: 'The cross wobbles<br>twice per turn', c3b: 'Output speed <b>fluctuates</b>', fbig: '0.87× ↔ 1.15×', fsub: 'At 30°, output speed rises and<br>falls twice every turn',
      uses: ['Vehicle drive shafts', 'Steering columns', 'Tractor PTO shafts', 'Rolling mill drives'] },
  },
  kin(t) { const th1 = W1 * phase(t); return { th1, ...joint(th1) }; },
  labels: [
    { c: '#6fe0a4', mat: 'green', at: [270, 330], p: rot([2.8 * Math.cos(BETA), 2.8 * Math.sin(BETA), 0.3]) },
    { c: '#ffcf5c', mat: 'gold', at: [830, 760], p: [0, 0, 0.3] },
    { c: '#7fb0ff', mat: 'blue', at: [830, 1180], p: k => rot([-0.6, FY * k.a.y, FY * k.a.z]) },
    { c: '#c9d1dc', mat: 'steel', at: [270, 1450], p: rot([-3.0, 0, 0.3]) },
  ],
  counters: [
    { label: { tr: 'Mil açısı', en: 'Shaft angle' }, c: '#c9d1dc', fn: () => '30°' },
    { label: { tr: 'Hız oranı ω₂/ω₁', en: 'Speed ratio ω₂/ω₁' }, c: '#6fe0a4', fn: (t, L, k) => fmtN(Math.abs(ratio(k.th1)), 2, L) + '×' },
  ],
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    S.root = new THREE.Group(); S.root.rotation.z = ROOT; scene.add(S.root);
    const yoke = (mt, sgn) => {
      const g = new THREE.Group(); g.matrixAutoUpdate = false; S.root.add(g);
      const base = M(new THREE.BoxGeometry(0.32, 2 * FY + 0.4, 0.8), mt); base.position.x = sgn * AX; g.add(base);
      for (const s of [-1, 1]) {
        const arm = M(new THREE.BoxGeometry(AX, 0.22, 0.8), mt); arm.position.set(sgn * AX / 2, s * FY, 0); g.add(arm);
        const cup = M(cylY(0.3, 0.32), mt); cup.position.set(0, s * FY, 0); g.add(cup);
      }
      const hub = M(cylX(0.45, 0.6), mt); hub.position.x = sgn * (AX + 0.4); g.add(hub);
      const sh = M(cylX(0.26, SL), mats.steel); sh.position.x = sgn * (AX + SL / 2); g.add(sh);
      const st = M(new THREE.BoxGeometry(1.6, 0.09, 0.09), mt); st.position.set(sgn * (AX + 2.2), 0.26, 0); g.add(st);
      return g;
    };
    S.y1 = yoke(mats.blue, -1); S.y2 = yoke(mats.green, 1);
    S.cross = new THREE.Group(); S.cross.matrixAutoUpdate = false; S.root.add(S.cross);
    S.cross.add(M(cylX(0.18, 2 * FY), mats.gold)); S.cross.add(M(cylY(0.18, 2 * FY), mats.gold));
    S.cross.add(M(new THREE.BoxGeometry(0.5, 0.5, 0.5), mats.gold));
    // bearings + motor (fixed)
    for (const [u, d] of [[u1, -3.4], [u2, 3.4]]) {
      const b = M(new THREE.BoxGeometry(0.8, 1.0, 1.0), mats.block); b.position.copy(u.clone().multiplyScalar(d)); b.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), u); S.root.add(b);
    }
    const mot = M(cylX(0.75, 1.6, 40), mats.dark); mot.position.set(-AX - SL - 0.6, 0, 0); S.root.add(mot);
    const base = M(new THREE.BoxGeometry(3.4, 0.5, 2.0), mats.block); base.position.set(-1.3, -6.05, 0); scene.add(base);
    const post = M(new THREE.BoxGeometry(0.5, 4.6, 0.5), mats.block); post.position.set(-0.75, -3.6, -1.0); scene.add(post);
    ctx.arrow(0x7fb0ff, 0.7, [-2.4, 0, 0], [1, 0, 0], 1, S.root, 1.2);
    ctx.arrow(0x6fe0a4, 0.7, [2.4 * u2.x, 2.4 * u2.y, 0], [u2.x, u2.y, 0], 1, S.root, 1.2);
  },
  update(k) {
    S.y1.matrix.copy(basis(u1, k.a)); S.y2.matrix.copy(basis(u2, k.b));
    S.cross.matrix.copy(basis(k.a, k.b));
  },
};
