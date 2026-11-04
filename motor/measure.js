const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const ep of (process.argv[2]||'').split(',')) for (const L of ['tr','en']) {
    await p.goto(`http://127.0.0.1:8765/ep.html?ep=${ep}&mode=overlay&lang=${L}`); await p.waitForFunction('window.READY===true');
    await p.evaluate(() => document.fonts.ready); await p.evaluate(() => renderFrame(2));
    const r = await p.evaluate(() => { const h = document.querySelector('.title h1').getBoundingClientRect().height;
      const caps = [...document.querySelectorAll('.cap')].map(c => Math.round(c.getBoundingClientRect().height));
      const big = document.querySelector('.ratio .big').getBoundingClientRect(); const ln = [...document.querySelectorAll('.lbl')].map(l => Math.round(l.getBoundingClientRect().width));
      return { h1: Math.round(h), caps, big: Math.round(big.height), lbl: Math.max(...ln) }; });
    console.log(ep, L, JSON.stringify(r));
  }
  await b.close();
})();
