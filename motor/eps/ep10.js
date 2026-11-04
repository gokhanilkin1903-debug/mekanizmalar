// Ratchet and pawl
import { THREE, TAU, mod, ss, extrude, capsuleShape, cylZ, phase, fmtN, TL } from '../engine.js';
const N = 16, rR = 1.75, rT = 2.25, h = rT - rR, p = TAU / N, WF = 1.2;
const P = [1.95, 3.0], LP = 1.95;
const rW = phi => rR + h * (1 - mod(phi, p) / p);
const tipAt = psi => [P[0] + LP * Math.cos(psi), P[1] + LP * Math.sin(psi)];
function pawl(th) { // largest psi with tip outside wheel
  let lo = 3.2, hi = 4.3;
  for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2, T = tipAt(mid), f = Math.hypot(T[0], T[1]) - rW(Math.atan2(T[1], T[0]) - th); if (f >= 0) lo = mid; else hi = mid; }
  return lo;
}
// tip angle when resting on root
const aRoot = (() => { let lo = 3.2, hi = 4.3; for (let i = 0; i < 50; i++) { const mid = (lo + hi) / 2, T = tipAt(mid); if (Math.hypot(T[0], T[1]) >= rR) lo = mid; else hi = mid; } const T = tipAt(lo); return Math.atan2(T[1], T[0]); })();
const T1 = 19.4, T2 = 22.6;
const thF = t => WF * phase(t);
const thStop = thF(T1);
const thBlock = (() => { const phi = aRoot - thStop; const k = Math.floor(phi / p); return aRoot - (k + 1) * p + 0.004; })();
function wheel(t) {
  if (t < T1) return thF(t);
  if (t < T2) return Math.max(thStop - 0.6 * ss((t - T1) / 0.9), thBlock);
  return thBlock + WF * (phase(t) - phase(T2));
}
const clicks = th => -Math.floor((aRoot - th) / p);
let S = {};
export default {
  id: '10',
  view: { az: 0, el: 12, dist: 25, target: [0.2, 0.6, 0], orbit: 0.5, caz: -22, cel: 8, cdist: 11, ctarget: [0.6, 2.0, 0], low: 0.17, lowDist: 1.3 },
  floorY: -3.6,
  text: {
    tr: { hook: 'Sadece tek yöne<br>dönen dişli', hookSub: 'Cırcır mekanizması', labels: ['Yay', 'Tırnak (mandal)', 'Cırcır dişlisi', 'Kol'],
      c1: 'Testere dişleri ve bir tırnak', c2a: 'İleri yönde tırnak<br>dişlerin üzerinden kayar', c2b: 'Her dişte <b>klik!</b>',
      c3a: 'Geri çevirmeye çalışınca…', c3b: 'Tırnak dişe <b>kilitlenir!</b>', fbig: '16 diş = 16 klik', fsub: 'Her turda 16 kilit noktası:<br>yük asla geri kaçmaz',
      uses: ['Cırcır anahtarlar', 'Kriko ve vinçler', 'Bisiklet arka göbekleri', 'Emniyet kemeri makaraları'], pop: 'klik!', lock: 'KİLİT!' },
    en: { hook: 'A gear that only<br>turns one way', hookSub: 'The ratchet and pawl', labels: ['Spring', 'Pawl', 'Ratchet wheel', 'Handle'],
      c1: 'Sawtooth teeth and a pawl', c2a: 'Forward, the pawl slides<br>over the teeth', c2b: '<b>Click!</b> on every tooth',
      c3a: 'Try turning it back…', c3b: 'The pawl <b>locks</b> into a tooth!', fbig: '16 teeth = 16 clicks', fsub: '16 locking points per turn:<br>the load never slips back',
      uses: ['Ratchet wrenches', 'Jacks and winches', 'Bicycle freehubs', 'Seat belt reels'], pop: 'click!', lock: 'LOCKED!' },
  },
  kin(t) { const th = wheel(t), psi = pawl(th); return { th, psi, tip: tipAt(psi) }; },
  labels: [
    { c: '#6fe0a4', mat: 'green', at: [270, 330], p: k => { const a = [P[0] + 0.8 * Math.cos(k.psi), P[1] + 0.8 * Math.sin(k.psi)]; return [(a[0] + P[0] + 0.1) / 2 - 0.1, (a[1] + P[1] + 1.35) / 2 + 0.3, 0.3]; } },
    { c: '#ff9d8a', mat: 'red', at: [830, 330], p: k => [P[0] + 1.0 * Math.cos(k.psi), P[1] + 1.0 * Math.sin(k.psi), 0.4] },
    { c: '#ffcf5c', mat: 'gold', at: [260, 1450], p: [-1.6, -1.1, 0.3] },
    { c: '#7fb0ff', mat: 'blue', at: [830, 1450], p: k => [1.55 * Math.cos(k.th - 0.9), 1.55 * Math.sin(k.th - 0.9), 1.4] },
  ],
  counters: [
    { label: { tr: 'Dönüş', en: 'Rotation' }, c: '#ffcf5c', fn: (t, L, k) => fmtN((k.th - wheel(Math.min(t, TL.cnt0))) / TAU, 2, L) + (L === 'tr' ? ' tur' : ' turns') },
    { label: { tr: 'Klik', en: 'Clicks' }, c: '#ff9d8a', fn: (t, L, k) => String(clicks(k.th) - clicks(wheel(Math.min(t, TL.cnt0)))) },
  ],
  overlay(t, k, ctx) {
    if (!S.pops) { S.pops = ctx.extraDiv; }
    // last click time within 0.45 s
    let html = '', cNow = clicks(k.th);
    for (let i = 1; i <= 27; i++) { const tt = t - i / 60; if (tt < 0) break; if (clicks(wheel(tt)) < cNow) { const age = (i - 0.5) / 60, o = 1 - age / 0.45; const [x, y] = ctx.project([k.tip[0], k.tip[1] + 0.3, 0.4]); html = `<div class="pop" style="left:${x + 30}px;top:${y - 90 - age * 120}px;opacity:${o};transform:scale(${1 + age})">${ctx.T.pop}</div>`; break; } }
    if (t > T1 && t < T2 + 0.4 && wheel(t) <= thBlock + 1e-6) { const age = t - (T1 + 0.5); const [x, y] = ctx.project([k.tip[0], k.tip[1], 0.4]); const o = Math.min(1, (t - T1 - 0.3) * 4) * (1 - Math.max(0, (t - T2) / 0.4)); html += `<div class="pop" style="left:${x + 40}px;top:${y - 120}px;color:#ff5a5a;font-size:64px;opacity:${o}">${ctx.T.lock}</div>`; }
    ctx.extraDiv.innerHTML = html; return '';
  },
  build(ctx) {
    const { scene, mats } = ctx, M = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
    const ws = new THREE.Shape(), pts = [];
    for (let k = 0; k < N; k++) { const a0 = k * p; for (let i = 0; i <= 8; i++) { const f = i / 8 * 0.97; pts.push([(rT - h * f) * Math.cos(a0 + f * p), (rT - h * f) * Math.sin(a0 + f * p)]); } pts.push([rR * Math.cos(a0 + p), rR * Math.sin(a0 + p)]); }
    pts.forEach(([x, y], i) => i ? ws.lineTo(x, y) : ws.moveTo(x, y)); ws.closePath();
    for (let i = 0; i < 5; i++) { const hh = new THREE.Path(), a = i * TAU / 5 + 0.3; hh.absarc(1.0 * Math.cos(a), 1.0 * Math.sin(a), 0.33, 0, TAU, true); ws.holes.push(hh); }
    S.wheel = new THREE.Group(); scene.add(S.wheel);
    S.wheel.add(M(extrude(ws, 0.6, 0.02), mats.gold));
    const hub = M(cylZ(0.45, 0.9), mats.gold); S.wheel.add(hub);
    const sh = M(cylZ(0.25, 2.6), mats.steel); sh.position.z = -0.6; S.wheel.add(sh);
    const arm = M(extrude(capsuleShape(1.55, 0.22), 0.18), mats.blue); arm.position.z = 0.6; arm.rotation.z = -0.9; S.wheel.add(arm);
    const knob = M(cylZ(0.24, 1.0), mats.blue); knob.position.set(1.55 * Math.cos(-0.9), 1.55 * Math.sin(-0.9), 1.1); S.wheel.add(knob);
    // pawl: from pivot along +x to tip (local), rotate by psi
    const ps = new THREE.Shape(); ps.moveTo(0, 0.28); ps.absarc(0, 0, 0.28, Math.PI / 2, Math.PI * 1.5, false); ps.lineTo(LP - 0.1, -0.05); ps.lineTo(LP + 0.02, 0.0); ps.lineTo(LP - 0.25, 0.2); ps.closePath();
    const hp = new THREE.Path(); hp.absarc(0, 0, 0.12, 0, TAU, true); ps.holes.push(hp);
    S.pawl = M(extrude(ps, 0.5, 0.02), mats.red); S.pawl.position.set(P[0], P[1], 0); scene.add(S.pawl);
    const pv = M(cylZ(0.12, 1.4), mats.steel); pv.position.set(P[0], P[1], -0.3); scene.add(pv);
    S.spring = M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 201 }, (_, i) => { const s = i / 200; return new THREE.Vector3(0.16 * Math.cos(s * 8 * TAU), s - 0.5, 0.16 * Math.sin(s * 8 * TAU)); })), 200, 0.04, 6, false), mats.green); scene.add(S.spring);
    S.sTop = [P[0] + 0.1, P[1] + 1.35, 0];
    const back = M(new THREE.BoxGeometry(6.4, 6.6, 0.3), mats.dark); back.position.set(0.4, 0.75, -0.9); scene.add(back);
    const hook = M(new THREE.BoxGeometry(0.9, 0.3, 0.7), mats.block); hook.position.set(S.sTop[0], S.sTop[1] + 0.15, -0.3); scene.add(hook);
    const foot = M(new THREE.BoxGeometry(4.0, 0.5, 2.0), mats.block); foot.position.set(0.4, -3.35, -0.6); scene.add(foot);
    ctx.arrow(0xffcf5c, 2.7, [0, 0, 0.7], [0, 0, 1], 1, scene, 0.5);
  },
  update(k, t, ctx) {
    S.wheel.rotation.z = k.th; S.pawl.rotation.z = k.psi;
    const a = [P[0] + 0.85 * Math.cos(k.psi), P[1] + 0.85 * Math.sin(k.psi) + 0.15, 0];
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...S.sTop), d = B.clone().sub(A);
    S.spring.position.copy(A).add(B).multiplyScalar(0.5); S.spring.scale.set(1, d.length(), 1); S.spring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  },
};
