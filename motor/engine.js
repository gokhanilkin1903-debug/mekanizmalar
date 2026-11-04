import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
export { THREE, mergeGeometries };

export const DUR = 31;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ss = x => { x = clamp(x); return x * x * (3 - 2 * x); };
export const fade = (t, a, b, d = 0.45) => ss((t - a) / d) * (1 - ss((t - (b - d)) / d));
export const TAU = Math.PI * 2;
export const mod = (x, m) => ((x % m) + m) % m;

// standard timeline
export const TL = { hook: [0.2, 3.9], lab: 4.3, labEnd: 10.2, c1: [4.2, 10.2], arr: [10.3, 16.6], c2a: [10.4, 13.4], c2b: [13.4, 16.6],
  slow: [17.3, 22.6], c3a: [17.6, 20.1], c3b: [20.1, 22.8], fact: [23.3, 27.4], cnt0: 23.4, uses: [27.6, 31.6], cta: [29.6, 31.6] };
export const speedF = t => 1 - 0.8 * (ss((t - 16.4) / 1.0) - ss((t - 22.0) / 1.0));
const DT = 1 / 600, PH = [0];
for (let i = 1; i <= DUR / DT + 20; i++) PH.push(PH[i - 1] + speedF((i - 0.5) * DT) * DT);
export const phase = t => { t = Math.max(0, t); const i = Math.floor(t / DT); const f = t / DT - i; return PH[i] + (PH[i + 1] - PH[i]) * f; };

// ---------- geometry helpers ----------
export function gearShape(N, rRoot, rTip, holeR) {
  const s = new THREE.Shape(), p = TAU / N, pts = [];
  for (let i = 0; i < N; i++) {
    const c = i * p;
    const seq = [[-0.5, rRoot], [-0.31, rRoot], [-0.2, rRoot + (rTip - rRoot) * 0.55], [-0.12, rTip], [0.12, rTip], [0.2, rRoot + (rTip - rRoot) * 0.55], [0.31, rRoot]];
    for (const [f, r] of seq) pts.push([r * Math.cos(c + f * p), r * Math.sin(c + f * p)]);
  }
  pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath();
  if (holeR) { const h = new THREE.Path(); h.absarc(0, 0, holeR, 0, TAU, true); s.holes.push(h); }
  return s;
}
export function extrude(shape, depth, bevel = 0.02, curveSegments = 24) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 1, curveSegments });
  g.translate(0, 0, -depth / 2); return g;
}
// spur gear in XY plane centered, pitch radius N*m/2
export function gearGeo(N, m, thick, holeR = 0.15) { const r = N * m / 2; return extrude(gearShape(N, r - 1.25 * m, r + m, holeR), thick); }
export function ringGearGeo(N, m, outerR, thick) {
  const r = N * m / 2, s = new THREE.Shape(); s.absarc(0, 0, outerR, 0, TAU, false);
  const inner = gearShape(N, r + 1.25 * m, r - m); const h = new THREE.Path(inner.getPoints()); s.holes.push(h);
  return extrude(s, thick, 0.02, 64);
}
export function capsuleShape(len, w, holeR = 0) {
  const s = new THREE.Shape(); s.absarc(0, 0, w, Math.PI / 2, Math.PI * 1.5, false); s.absarc(len, 0, w, -Math.PI / 2, Math.PI / 2, false); s.closePath();
  if (holeR) for (const x of [0, len]) { const h = new THREE.Path(); h.absarc(x, 0, holeR, 0, TAU, true); s.holes.push(h); }
  return s;
}
const UP = new THREE.Vector3(0, 1, 0);
// mesh built along +y with unit length centered at 0 -> stretch between a and b
export function setRod(mesh, a, b) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), L = d.length();
  mesh.position.copy(A).add(B).multiplyScalar(0.5); mesh.scale.set(1, L, 1);
  mesh.quaternion.setFromUnitVectors(UP, d.normalize());
}
export function helixGeo(R, turns, tubeR, height = 1, segs = 300) {
  const pts = []; for (let i = 0; i <= segs; i++) { const s = i / segs; pts.push(new THREE.Vector3(R * Math.cos(s * turns * TAU), s * height - height / 2, R * Math.sin(s * turns * TAU))); }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), segs, tubeR, 8, false);
}
export const cylY = (r, h, seg = 32) => new THREE.CylinderGeometry(r, r, h, seg);
export const cylZ = (r, h, seg = 32) => new THREE.CylinderGeometry(r, r, h, seg).rotateX(Math.PI / 2);
export const cylX = (r, h, seg = 32) => new THREE.CylinderGeometry(r, r, h, seg).rotateZ(Math.PI / 2);

// ---------- common text ----------
const COMMON = {
  tr: { slow: 'AĞIR ÇEKİM ×0,2', usesH: 'Nerede kullanılır?', cta: 'Takip et: her gün yeni bir mekanizma', badge: 'MEKANİZMA', dec: ',' },
  en: { slow: 'SLOW MOTION ×0.2', usesH: 'Where is it used?', cta: 'Follow for a new mechanism every day', badge: 'MECHANISM', dec: '.' },
};
export const fmtN = (v, d, L) => v.toFixed(d).replace('.', COMMON[L].dec);

const CSS = `
html,body{margin:0;width:1080px;height:1920px;overflow:hidden;font-family:'Inter',sans-serif;}
body.m3d{background:#0d1626;} body.overlay{background:transparent;}
canvas{display:block;}
#ov{position:absolute;inset:0;pointer-events:none;color:#fff;}
.title{position:absolute;left:60px;right:60px;top:190px;text-align:center;}
.title h1{font-size:88px;line-height:1.06;margin:0;font-weight:800;letter-spacing:-2px;text-shadow:0 6px 30px rgba(0,0,0,.6);}
.title p{font-size:42px;margin:26px 0 0;font-weight:600;color:#9fb6d9;text-shadow:0 4px 20px rgba(0,0,0,.6);}
.cap{position:absolute;left:60px;right:60px;bottom:250px;text-align:center;font-size:58px;font-weight:700;line-height:1.18;text-shadow:0 4px 24px rgba(0,0,0,.7);}
.cap b{color:#ffcf5c;} .bl{color:#7fb0ff}.gr{color:#6fe0a4}
.lbl{position:absolute;padding:16px 26px;border-radius:18px;background:rgba(10,18,34,.85);border:2px solid var(--c);font-size:38px;font-weight:700;white-space:nowrap;box-shadow:0 8px 30px rgba(0,0,0,.35);}
.tag{position:absolute;top:150px;left:50%;font-size:34px;font-weight:800;letter-spacing:4px;padding:12px 28px;border-radius:40px;background:#ff5a5a;color:#fff;white-space:nowrap;}
.badge{position:absolute;top:60px;left:60px;font-size:28px;font-weight:800;letter-spacing:3px;padding:10px 22px;border-radius:30px;background:rgba(255,207,92,.14);border:2px solid rgba(255,207,92,.6);color:#ffcf5c;}
.ratio{position:absolute;left:40px;right:40px;top:190px;text-align:center;}
.ratio .big{font-size:104px;font-weight:800;letter-spacing:-2px;text-shadow:0 6px 30px rgba(0,0,0,.6);}
.ratio .sub{font-size:44px;color:#d5e0f0;font-weight:600;margin-top:14px;line-height:1.25;text-shadow:0 4px 20px rgba(0,0,0,.7);}
.cnt{position:absolute;left:60px;right:60px;bottom:230px;display:flex;gap:30px;justify-content:center;}
.cnt div{flex:1;background:rgba(10,18,34,.85);border-radius:24px;padding:26px 10px;text-align:center;border:2px solid var(--c);}
.cnt small{display:block;font-size:34px;color:#c9d6ea;font-weight:600;}
.cnt span{font-size:70px;font-weight:800;font-variant-numeric:tabular-nums;}
.uses{position:absolute;left:90px;right:90px;top:1060px;}
.uses .h{font-size:72px;font-weight:800;text-align:center;margin-bottom:34px;text-shadow:0 4px 24px rgba(0,0,0,.7);}
.use{display:flex;align-items:center;gap:26px;font-size:48px;font-weight:700;margin:18px 0;padding:22px 30px;background:rgba(10,18,34,.88);border-radius:22px;}
.use i{font-style:normal;width:64px;height:64px;border-radius:50%;background:#ffcf5c;color:#111;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:800;flex:none;}
.cta{position:absolute;left:60px;right:60px;bottom:140px;text-align:center;font-size:46px;font-weight:700;color:#ffcf5c;text-shadow:0 4px 20px rgba(0,0,0,.7);}
.pop{position:absolute;font-size:44px;font-weight:900;color:#ffcf5c;text-shadow:0 3px 14px rgba(0,0,0,.8);white-space:nowrap;}
`;

export async function start(EP) {
  const Q = new URLSearchParams(location.search);
  const L = Q.get('lang') || 'tr', MODE = Q.get('mode') || '3d';
  const T = { ...COMMON[L], ...(EP.text[L] || EP.text.tr) };
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  document.body.className = MODE === '3d' ? 'm3d' : 'overlay';
  const W = 1080, H = 1920;
  const camera = new THREE.PerspectiveCamera(32, W / H, 0.1, 300);
  const V = { orbit: 1, caz: -25, cel: 10, ...EP.view };
  const o = V.orbit, Tg = V.target, CT = V.ctarget || V.target, low = [Tg[0], Tg[1] - V.dist * (V.low ?? 0.12), Tg[2]];
  const KF = EP.cam || [
    [0, V.az + 60 * o, V.el + 12, V.dist * 1.12, ...Tg],
    [3.9, V.az, V.el, V.dist, ...Tg],
    [10.2, V.az - 10 * o, V.el - 2, V.dist, ...Tg],
    [16, V.az + 8 * o, V.el - 3, V.dist * 0.97, ...Tg],
    [18.6, V.caz, V.cel, V.cdist, ...CT],
    [22.0, V.caz + 12 * o, V.cel - 2, V.cdist * 0.95, ...CT],
    [23.8, V.az + 25 * o, V.el + 5, V.dist * 1.02, ...Tg],
    [27.2, V.az + 35 * o, V.el + 4, V.dist * 1.02, ...Tg],
    [28.5, V.az + 45 * o, V.el + 6, V.dist * (V.lowDist ?? 1.08), ...low],
    [31.6, V.az + 70 * o, V.el + 10, V.dist * (V.lowDist ?? 1.08), ...low],
  ];
  const placeCam = t => {
    let i = 0; while (i < KF.length - 2 && t > KF[i + 1][0]) i++;
    const a = KF[i], b = KF[i + 1], u = ss((t - a[0]) / (b[0] - a[0]));
    const [, az, el, d, tx, ty, tz] = a.map((v, k) => v + (b[k] - v) * u);
    const A = az * Math.PI / 180, E = el * Math.PI / 180;
    camera.position.set(tx + d * Math.cos(E) * Math.sin(A), ty + d * Math.sin(E), tz + d * Math.cos(E) * Math.cos(A));
    camera.lookAt(tx, ty, tz); camera.updateMatrixWorld();
  };
  const project = p => { const v = (p.isVector3 ? p.clone() : new THREE.Vector3(...p)).project(camera); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; };

  let renderer, scene, mats = {}, arrows = [];
  const mat = (c, metal = 0.55, rough = 0.32, extra = {}) => new THREE.MeshStandardMaterial({ color: c, metalness: metal, roughness: rough, ...extra });
  const ctx = { THREE, L, T, mats, mat, project, phase };

  if (MODE === '3d') {
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1); renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.prepend(renderer.domElement);
    scene = new THREE.Scene();
    const bc = document.createElement('canvas'); bc.width = 64; bc.height = 512;
    const g = bc.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, '#16233b'); gr.addColorStop(0.55, '#0f1a2d'); gr.addColorStop(1, '#070c16');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 512);
    const bt = new THREE.CanvasTexture(bc); bt.colorSpace = THREE.SRGBColorSpace; scene.background = bt;
    scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
    scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x1a1408, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(6, 12, 9); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, far: 60 }); key.shadow.bias = -0.0005;
    key.target.position.set(...Tg); scene.add(key.target); key.position.set(Tg[0] + 6, Tg[1] + 12, Tg[2] + 9);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x6fa8ff, 1.4); rim.position.set(-8, 4, -10); scene.add(rim);
    const fy = EP.floorY ?? -4;
    const fl = new THREE.Mesh(new THREE.CircleGeometry(16, 64), new THREE.ShadowMaterial({ opacity: 0.35 }));
    fl.rotation.x = -Math.PI / 2; fl.position.set(Tg[0], fy, Tg[2]); fl.receiveShadow = true; scene.add(fl);
    const ring = new THREE.Mesh(new THREE.RingGeometry(6.5, 6.56, 128), new THREE.MeshBasicMaterial({ color: 0x2b4166, transparent: true, opacity: 0.6 }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(Tg[0], fy + 0.01, Tg[2]); scene.add(ring);
    Object.assign(mats, {
      gold: mat(0xe8a93a, 0.65, 0.3), blue: mat(0x5b8def, 0.35, 0.35), green: mat(0x3fbf80, 0.35, 0.35), red: mat(0xe5604f, 0.35, 0.38),
      purple: mat(0x9b7bea, 0.35, 0.38), steel: mat(0xc9d1dc, 0.9, 0.25), block: mat(0xe6dfc8, 0.1, 0.55), dark: mat(0x2a3140, 0.5, 0.4),
      bronze: mat(0xb07a35, 0.8, 0.3), glass: mat(0x9cc7ff, 0.1, 0.1, { transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }),
    });
    const Z = new THREE.Vector3(0, 0, 1);
    const mkM = color => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6, transparent: true, opacity: 0, roughness: 0.4 });
    // rotation arrow around an axis (vector), parent optional
    ctx.arrow = (color, radius, pos, axis, sign = 1, parent = scene, spinRate = 1) => {
      const outer = new THREE.Group(); outer.position.set(...pos);
      outer.quaternion.setFromUnitVectors(Z, new THREE.Vector3(...axis).normalize());
      const flip = new THREE.Group(); outer.add(flip); const sp = new THREE.Group(); flip.add(sp);
      const M = mkM(color);
      for (const off of [0, Math.PI]) {
        const arc = 2.2;
        const tor = new THREE.Mesh(new THREE.TorusGeometry(radius, Math.max(0.05, radius * 0.08), 12, 60, arc), M); tor.rotation.z = off; sp.add(tor);
        const cone = new THREE.Mesh(new THREE.ConeGeometry(Math.max(0.12, radius * 0.2), Math.max(0.28, radius * 0.45), 20), M);
        const a = off + arc; cone.position.set(radius * Math.cos(a), radius * Math.sin(a), 0); cone.rotation.z = a; sp.add(cone);
      }
      parent.add(outer);
      const A = { kind: 'rot', sp, M, flip, spinRate, setSign(s) { flip.rotation.x = s < 0 ? Math.PI : 0; } }; A.setSign(sign); arrows.push(A); return A;
    };
    // straight double/single arrow
    ctx.linArrow = (color, len, pos, dir, both = true, parent = scene) => {
      const g = new THREE.Group(); g.position.set(...pos); g.quaternion.setFromUnitVectors(UP, new THREE.Vector3(...dir).normalize());
      const M = mkM(color);
      const shaft = new THREE.Mesh(cylY(0.07, len - 0.6, 12), M); g.add(shaft);
      const c1 = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.42, 20), M); c1.position.y = len / 2 - 0.21; g.add(c1);
      if (both) { const c2 = c1.clone(); c2.rotation.x = Math.PI; c2.position.y = -len / 2 + 0.21; g.add(c2); }
      parent.add(g); const A = { kind: 'lin', g, M }; arrows.push(A); return A;
    };
    ctx.scene = scene;
    EP.build(ctx);
  }

  // ---------- overlay ----------
  const ov = document.createElement('div'); ov.id = 'ov'; document.body.appendChild(ov);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('width', W); svg.setAttribute('height', H); svg.style.cssText = 'position:absolute;inset:0'; ov.appendChild(svg);
  const el = (html, cls, style = '') => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; d.style.cssText = style; ov.appendChild(d); return d; };
  const O = {};
  if (MODE !== '3d') {
    O.badge = el(`${T.badge} #${EP.id}`, 'badge');
    O.title = el(`<h1>${T.hook}</h1><p>${T.hookSub}</p>`, 'title');
    for (const k of ['c1', 'c2a', 'c2b', 'c3a', 'c3b']) O[k] = el(T[k], 'cap');
    O.slow = el(T.slow, 'tag');
    O.ratio = el(`<div class="big">${T.fbig}</div><div class="sub">${T.fsub}</div>`, 'ratio');
    if (EP.counters) O.cnt = el(EP.counters.map((c, i) => `<div style="--c:${c.c}"><small>${c.label[L]}</small><span id="k${i}">0</span></div>`).join(''), 'cnt');
    O.uses = el(`<div class="h">${T.usesH}</div>` + T.uses.map((u, i) => `<div class="use"><i>${i + 1}</i>${u}</div>`).join(''), 'uses');
    O.cta = el(T.cta, 'cta');
    O.labels = EP.labels.map((Lb, i) => ({ ...Lb, txt: T.labels[i], a: TL.lab + i * 0.8, div: el(T.labels[i], 'lbl', `--c:${Lb.c}`) }));
    O.extra = el('', '', 'position:absolute;inset:0');
    ctx.el = el; ctx.extraDiv = O.extra;
  }
  const set = (d, op, dy = 0, pre = '') => { d.style.opacity = op; d.style.transform = pre + `translateY(${(1 - op) * dy}px)`; };
  function updateOverlay(t, k) {
    set(O.title, fade(t, ...TL.hook), 40);
    set(O.c1, fade(t, ...TL.c1), 30); set(O.c2a, fade(t, ...TL.c2a), 30); set(O.c2b, fade(t, ...TL.c2b), 30);
    set(O.slow, fade(t, ...TL.slow), 0, 'translateX(-50%) '); set(O.c3a, fade(t, ...TL.c3a), 30); set(O.c3b, fade(t, ...TL.c3b), 30);
    set(O.ratio, fade(t, ...TL.fact), -30);
    if (O.cnt) { set(O.cnt, fade(t, TL.fact[0] + 0.2, TL.fact[1]), 30); EP.counters.forEach((c, i) => { document.getElementById('k' + i).textContent = c.fn(t, L, k); }); }
    set(O.uses, fade(t, TL.uses[0], TL.uses[1] + 2), 40);
    [...O.uses.querySelectorAll('.use')].forEach((u, i) => { const op = ss((t - TL.uses[0] - 0.4 - i * 0.35) / 0.4); u.style.opacity = op; u.style.transform = `translateX(${(1 - op) * -60}px)`; });
    set(O.cta, fade(t, TL.cta[0], TL.cta[1] + 2), 20);
    set(O.badge, 1 - fade(t, TL.slow[0] - 0.2, TL.slow[1] + 0.2) * 0);
    let lines = EP.overlay ? EP.overlay(t, k, ctx) || '' : '';
    for (const Lb of O.labels) {
      const op = fade(t, Lb.a, TL.labEnd, 0.4);
      const [x, y] = project(typeof Lb.p === 'function' ? Lb.p(k) : Lb.p);
      Lb.div.style.opacity = op;
      const r = Lb.div.getBoundingClientRect();
      const left = clamp(Lb.at[0] - r.width / 2, 30, W - 30 - r.width), top = Lb.at[1] - r.height / 2;
      Lb.div.style.left = left + 'px'; Lb.div.style.top = top + 'px'; Lb.div.style.transform = `scale(${0.85 + 0.15 * op})`;
      if (op > 0.01) {
        const bx = left + r.width / 2, by = Lb.at[1] + (Lb.at[1] > y ? -r.height / 2 : r.height / 2);
        const q = ss((t - Lb.a) / 0.5), ex = x + (bx - x) * q, ey = y + (by - y) * q;
        lines += `<line x1="${x}" y1="${y}" x2="${ex}" y2="${ey}" stroke="${Lb.c}" stroke-width="4" opacity="${op}"/><circle cx="${x}" cy="${y}" r="11" fill="${Lb.c}" opacity="${op}" stroke="#0b1220" stroke-width="4"/>`;
      }
    }
    svg.innerHTML = lines;
  }
  function update3D(t, k) {
    EP.update(k, t, ctx);
    const ao = fade(t, ...TL.arr, 0.5);
    arrows.forEach(a => { a.M.opacity = ao * 0.95; if (a.kind === 'rot') { a.sp.rotation.z = a.spinRate * t; a.sp.visible = ao > 0.01; } else { a.g.visible = ao > 0.01; } });
    // pulse labeled parts
    const used = {};
    EP.labels.forEach((Lb, i) => { if (!Lb.mat) return; const x = (t - (TL.lab + i * 0.8 + 0.1)) / 1.2; const v = x > 0 && x < 1 ? Math.sin(x * Math.PI) * 0.35 : 0; const m = mats[Lb.mat]; if (!m) return; m.emissive.copy(m.color); m.emissiveIntensity = Math.max(used[Lb.mat] || 0, v); used[Lb.mat] = m.emissiveIntensity; });
  }
  window.renderFrame = t => {
    placeCam(t);
    const k = EP.kin(t, ctx);
    if (MODE === '3d') { update3D(t, k); renderer.render(scene, camera); } else updateOverlay(t, k);
    return true;
  };
  window.DUR = DUR; window.READY = true;
}
