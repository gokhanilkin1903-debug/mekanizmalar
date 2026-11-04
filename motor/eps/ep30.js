// Ackermann steering (top view drawn on the XY plane)
import { THREE, TAU, extrude, cylZ, phase, fmtN, fade, TL } from '../engine.js';
const YF = 2.4, YR = -2.6, TW = 1.5, ARM = 0.7, WF = 0.75;
const PL = [-TW, YF], PR = [TW, YF];
const bL = Math.atan2(YR - YF, 0 - PL[0]), bR = Math.atan2(YR - YF, 0 - PR[0]);
const armEnd = (P, b, d) => [P[0] + ARM * Math.cos(b + d), P[1] + ARM * Math.sin(b + d)];
const TIE = Math.hypot(armEnd(PR, bR, 0)[0] - armEnd(PL, bL, 0)[0], armEnd(PR, bR, 0)[1] - armEnd(PL, bL, 0)[1]);
function solveR(dL) { const AL = armEnd(PL, bL, dL), f = d => { const A = armEnd(PR, bR, d); return Math.hypot(A[0] - AL[0], A[1] - AL[1]) - TIE; };
  let lo = dL - 0.6, hi = dL + 0.6, flo = f(lo); for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2, fm = f(m); if (Math.sign(fm) === Math.sign(flo)) { lo = m; flo = fm; } else hi = m; } return (lo + hi) / 2; }
const dLt = t => 0.5 * Math.sin(WF * phase(t) + 0.9);
let S = {};
export default {
  id: '30',
  view: { az: 0, el: 16, dist: 24, target: [0, 0.0, 0], orbit: 0.45, caz: -20, cel: 14, cdist: 11, ctarget: [0, 2.2, 0], low: 0.17, lowDist: 1.3 },
  floorY: -5.0,
  text: {
    tr: { hook: 'Virajda ön tekerler<br>neden farklı döner?', hookSub: 'Ackermann direksiyon geometrisi', labels: ['Rot (bağlantı çubuğu)', 'Akson kolu', 'Ön teker', 'Arka aks'],
      c1: 'Akson kolları, rot ve dört teker', c2a: 'İç teker, dış tekerden<br><b>daha çok</b> döner', c2b: 'Çünkü iç teker<br><b>daha küçük</b> bir daire çizer',
      c3a: 'Bütün teker eksenleri<br><b>tek noktada</b> buluşur', c3b: 'Tekerler kaymaz,<br>lastikler az aşınır', fbig: 'cot δₒ − cot δᵢ = w / L', fsub: 'Teker açıları, iz genişliği ve<br>dingil mesafesiyle belirlenir',
      uses: ['Otomobiller', 'Forkliftler', 'Tarım traktörleri', 'Go-kart ve robot araçlar'] },
    en: { hook: 'Why do front wheels<br>steer differently?', hookSub: 'Ackermann steering geometry', labels: ['Tie rod', 'Steering arm', 'Front wheel', 'Rear axle'],
      c1: 'Steering arms, a tie rod<br>and four wheels', c2a: 'The inner wheel turns<br><b>more</b> than the outer', c2b: 'Because it follows<br>a <b>smaller</b> circle',
      c3a: 'All wheel axes meet<br>at <b>one point</b>', c3b: 'No skidding,<br>less tire wear', fbig: 'cot δₒ − cot δᵢ = w / L', fsub: 'The wheel angles are set by<br>track width and wheelbase',
      uses: ['Cars', 'Forklifts', 'Farm tractors', 'Go-karts and robot vehicles'] },
  },
  kin(t) { const dL = dLt(t), dR = solveR(dL); return { dL, dR, AL: armEnd(PL, bL, dL), AR: armEnd(PR, bR, dR) }; },
  labels: [
    { c: '#ffcf5c', mat: 'gold', at: [830, 330], p: k => [(k.AL[0] + k.AR[0]) / 2, (k.AL[1] + k.AR[1]) / 2, 0.4] },
    { c: '#7fb0ff', mat: 'blue', at: [250, 330], p: k => [(PL[0] + k.AL[0]) / 2, (PL[1] + k.AL[1]) / 2, 0.4] },
    { c: '#c9d1dc', mat: 'dark', at: [250, 1450], p: [-TW - 0.3, YF - 0.5, 0.4] },
    { c: '#6fe0a4', mat: 'green', at: [830, 1450], p: [0.6, YR, 0.3] },
  ],
  counters: [
    { label: { tr: 'İç teker', en: 'Inner wheel' }, c: '#ffcf5c', fn: (t, L, k) => fmtN(Math.max(Math.abs(k.dL), Math.abs(k.dR)) * 180 / Math.PI, 1, L) + '°' },
    { label: { tr: 'Dış teker', en: 'Outer wheel' }, c: '#7fb0ff', fn: (t, L, k) => fmtN(Math.min(Math.abs(k.dL), Math.abs(k.dR)) * 180 / Math.PI, 1, L) + '°' },
  ],
  overlay(t, k, ctx) {
    const o = fade(t, 10.3, 40, 0.6); if (o < 0.01 || Math.abs(k.dL) < 0.06) return '';
    const hit = (P, d) => { const u = (YR - P[1]) / Math.sin(d); return [P[0] + u * Math.cos(d), YR]; };
    const iL = hit(PL, k.dL), iR = hit(PR, k.dR), ic = [(iL[0] + iR[0]) / 2, YR];
    const pr = p => ctx.project([p[0], p[1], 0.3]);
    const a = pr(PL), b = pr(iL), c = pr(PR), d = pr(iR), e = pr([Math.min(-1.6, ic[0] - 1), YR]), f = pr([Math.max(1.6, ic[0] + 1), YR]), g = pr(ic);
    return `<g opacity="${o}"><line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#ffcf5c" stroke-width="4" stroke-dasharray="12 8"/><line x1="${c[0]}" y1="${c[1]}" x2="${d[0]}" y2="${d[1]}" stroke="#7fb0ff" stroke-width="4" stroke-dasharray="12 8"/><line x1="${e[0]}" y1="${e[1]}" x2="${f[0]}" y2="${f[1]}" stroke="#6fe0a4" stroke-width="4" stroke-dasharray="12 8"/><circle cx="${g[0]}" cy="${g[1]}" r="14" fill="#ff7ad9" stroke="#0b1220" stroke-width="4"/></g>`;
  },
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    const body = new THREE.Shape(); const rr = 0.8, x0 = -1.95, x1 = 1.95, y0 = -3.7, y1 = 3.6;
    body.moveTo(x0 + rr, y0); body.lineTo(x1 - rr, y0); body.absarc(x1 - rr, y0 + rr, rr, -Math.PI / 2, 0, false); body.lineTo(x1, y1 - rr); body.absarc(x1 - rr, y1 - rr, rr, 0, Math.PI / 2, false); body.lineTo(x0 + rr, y1); body.absarc(x0 + rr, y1 - rr, rr, Math.PI / 2, Math.PI, false); body.lineTo(x0, y0 + rr); body.absarc(x0 + rr, y0 + rr, rr, Math.PI, Math.PI * 1.5, false);
    const bm = new THREE.Mesh(extrude(body, 0.1, 0.02, 24), mats.glass); bm.position.z = -0.4; scene.add(bm);
    const rax = M(new THREE.BoxGeometry(2 * TW + 0.4, 0.18, 0.18), mats.green); rax.position.set(0, YR, 0); scene.add(rax);
    const spine = M(new THREE.BoxGeometry(0.2, YF - YR, 0.12), mats.steel); spine.position.set(0, (YF + YR) / 2, -0.15); scene.add(spine);
    const fax = M(new THREE.BoxGeometry(2 * TW - 0.2, 0.18, 0.16), mats.steel); fax.position.set(0, YF, -0.1); scene.add(fax);
    const tire = () => { const g = new THREE.Group(); const tm = M(new THREE.BoxGeometry(0.5, 1.15, 0.5), mats.dark); g.add(tm); const rim = M(new THREE.BoxGeometry(0.52, 0.5, 0.3), mats.steel); g.add(rim); scene.add(g); return g; };
    for (const x of [-TW - 0.15, TW + 0.15]) { const w = tire(); w.position.set(x, YR, 0); }
    S.wL = tire(); S.wR = tire(); S.wL.position.set(PL[0] - 0.15, PL[1], 0); S.wR.position.set(PR[0] + 0.15, PR[1], 0);
    S.armL = M(new THREE.BoxGeometry(1, 0.16, 0.14), mats.blue); S.armR = M(new THREE.BoxGeometry(1, 0.16, 0.14), mats.blue); scene.add(S.armL, S.armR);
    S.tie = M(new THREE.BoxGeometry(1, 0.17, 0.14), mats.gold); scene.add(S.tie);
    S.pins = [0, 1, 2, 3].map(() => { const p = M(cylZ(0.1, 0.4, 12), mats.steel); scene.add(p); return p; });
    const sw = M(new THREE.TorusGeometry(0.55, 0.08, 10, 40), mats.dark); sw.position.set(-0.7, 0.9, 0.2); scene.add(sw); S.sw = sw;
    ctx.arrow(0xffcf5c, 0.85, [PL[0], PL[1], 0.5], [0, 0, 1], 1, scene, 0.8);
  },
  update(k) {
    const set = (b, p, q) => { b.position.set((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, 0.15); b.scale.x = Math.hypot(q[0] - p[0], q[1] - p[1]) + 0.12; b.rotation.z = Math.atan2(q[1] - p[1], q[0] - p[0]); };
    set(S.armL, PL, k.AL); set(S.armR, PR, k.AR); set(S.tie, k.AL, k.AR);
    [PL, PR, k.AL, k.AR].forEach((p, i) => S.pins[i].position.set(p[0], p[1], 0.2));
    S.wL.rotation.z = k.dL; S.wR.rotation.z = k.dR; S.sw.rotation.z = k.dL * 4;
  },
};
