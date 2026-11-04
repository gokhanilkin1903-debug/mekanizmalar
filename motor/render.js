// usage: node render.js <mode 3d|overlay> <lang> <outDir> [fps] [onlyTimes comma list]
const { chromium } = require('playwright');
const fs = require('fs');
const [mode, lang, out, fpsArg, only, ep] = process.argv.slice(2);
const fps = +(fpsArg || 30); let DUR = 36;
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('console', m => console.log('[page]', m.text()));
  p.on('pageerror', e => console.log('[err]', e.message));
  await p.goto(ep ? `http://127.0.0.1:8765/ep.html?ep=${ep}&mode=${mode}&lang=${lang}` : `http://127.0.0.1:8765/bolum01.html?mode=${mode}&lang=${lang}`);
  await p.waitForFunction('window.READY === true', null, { timeout: 60000 });
  await p.evaluate(() => document.fonts.ready);
  DUR = await p.evaluate(() => window.DUR || 36);
  const times = (only && only !== 'all') ? only.split(',').map(Number) : [...Array(Math.round(DUR * fps)).keys()].map(i => i / fps);
  const t0 = Date.now();
  for (let i = 0; i < times.length; i++) {
    const name = (only && only !== 'all') ? `t${times[i]}` : String(i).padStart(5, '0');
    const fn = `${out}/${name}.${mode === '3d' ? 'jpg' : 'png'}`;
    if (!(only && only !== 'all') && fs.existsSync(fn) && fs.statSync(fn).size > 0) continue;
    await p.evaluate(t => window.renderFrame(t), times[i]);
    if (mode === '3d') await p.screenshot({ path: `${out}/${name}.jpg`, type: 'jpeg', quality: 94 }); else await p.screenshot({ path: `${out}/${name}.png`, omitBackground: true });
    if (i % 60 === 0) console.log(mode, lang, i, '/', times.length, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  }
  await b.close();
})();
