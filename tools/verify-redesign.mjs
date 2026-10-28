// Chrome headless deve estar aberto com --remote-debugging-port=9222.
// Sem pacotes adicionais: node tools/verify-redesign.mjs [URL] [pasta de capturas]
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.argv[2] || 'http://127.0.0.1:8765';
const output = process.argv[3] || '/tmp/redesign-captures';
await mkdir(output, { recursive: true });
const tab = await (await fetch('http://127.0.0.1:9222/json/new?about:blank', {method: 'PUT'})).json();
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let nextId = 0;
const pending = new Map();
const errors = [];
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
  if (pending.has(message.id)) {
    const {resolve, reject} = pending.get(message.id);
    pending.delete(message.id);
    message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result);
  }
});
function cdp(method, params = {}) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    pending.set(id, {resolve, reject});
    socket.send(JSON.stringify({id, method, params}));
  });
}
async function evaluate(expression) {
  const result = await cdp('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function navigate(page = 'index.html') {
  await cdp('Page.navigate', {url: `${base}/${page}?lang=pt`});
  for (let i = 0; i < 100; i++) {
    await pause(100);
    if (await evaluate('document.readyState === "complete" && !!window.WA?.effects')) break;
  }
  await evaluate('document.fonts.ready.then(() => true)');
  await pause(2800);
}
async function viewport(width) {
  await cdp('Emulation.setDeviceMetricsOverride', {width, height: 900, deviceScaleFactor: 1, mobile: width < 769});
  await cdp('Emulation.setTouchEmulationEnabled', {enabled: width < 769});
}
async function screenshot(name) {
  const shot = await cdp('Page.captureScreenshot', {format: 'png', captureBeyondViewport: true});
  await writeFile(`${output}/${name}.png`, Buffer.from(shot.data, 'base64'));
}
async function layout(label) {
  const state = await evaluate(`({
    width: innerWidth, scroll: document.documentElement.scrollWidth,
    hidden: [...document.querySelectorAll('h1, .card, .app, .app-card, .stat, .contact-panel')]
      .filter(el => getComputedStyle(el).opacity === '0' || getComputedStyle(el).visibility === 'hidden').map(el => el.className),
    brokenImages: [...document.images].filter(img => !img.complete || !img.naturalWidth).length
  })`);
  assert.ok(state.scroll <= state.width + 1, `${label}: overflow ${JSON.stringify(state)}`);
  assert.deepEqual(state.hidden, [], `${label}: hidden content`);
  assert.equal(state.brokenImages, 0);
}
const report = {captures: [], checks: [], contrast: []};
try {
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Network.enable');
  await cdp('Emulation.setDeviceMetricsOverride', {width:1366,height:900,deviceScaleFactor:1,mobile:false});
  await cdp('Emulation.setEmulatedMedia', {features: [{name: 'prefers-color-scheme', value: 'light'}]});
  await navigate();
  await evaluate('localStorage.clear()');
  await navigate();
  assert.equal(await evaluate('WA.theme.current()'), 'dark');
  report.checks.push('Default dark even with light OS preference');
  report.gsapLoaded = await evaluate('!!window.gsap && !!window.ScrollTrigger');
  report.fontsLoaded = await evaluate(`({heading: document.fonts.check('600 24px "Inter Tight"'), serif: document.fonts.check('italic 24px "Instrument Serif"')})`);
  assert.ok(await evaluate('ScrollTrigger.getAll().length > 0'), 'GSAP ScrollTriggers active');
  await evaluate('document.querySelector(".card").scrollIntoView({behavior:"instant",block:"center"})');
  const pointerCard = await evaluate('(() => { const r = document.querySelector(".card").getBoundingClientRect(); return {x:r.x+50,y:r.y+50}; })()');
  await cdp('Input.dispatchMouseEvent', {type:'mouseMoved', ...pointerCard});
  await pause(300);
  assert.ok(await evaluate('document.querySelector(".card").style.getPropertyValue("--mx").endsWith("px")'));
  await evaluate('window.scrollTo({top:0,behavior:"instant"})');
  const pointerButton = await evaluate('(() => { const r = document.querySelector(".hero-actions .btn-solid").getBoundingClientRect(); return {x:r.x+10,y:r.y+10}; })()');
  await cdp('Input.dispatchMouseEvent', {type:'mouseMoved', ...pointerButton});
  assert.ok(await evaluate('document.querySelector(".hero-actions .btn-solid").style.translate.length > 0'));
  assert.ok(await evaluate('document.querySelector(".hero-actions .btn-solid").style.translate.split(" ").every(v => Math.abs(parseFloat(v)) <= 6)'));
  await cdp('Input.dispatchMouseEvent', {type:'mouseMoved', x:0, y:0});
  assert.equal(await evaluate('document.querySelector(".hero-actions .btn-solid").style.translate'), '');
  await evaluate('document.querySelector(".stat").scrollIntoView({behavior:"instant",block:"center"})');
  await pause(1500);
  assert.deepEqual(await evaluate('[...document.querySelectorAll(".stat strong")].map(el=>el.textContent)'), ['2','1','100%']);
  report.checks.push('GSAP active, counters complete, spotlight, magnetic limit and reset');
  await evaluate('window.scrollTo({top:0,behavior:"instant"})');
  for (const page of ['index.html', 'paracauari.html']) {
    for (const width of [1366, 390]) {
      await viewport(width);
      await navigate(page);
      for (const theme of ['dark', 'light']) {
        await evaluate(`WA.theme.set('${theme}')`);
        await pause(400);
        await layout(`${page} ${width} ${theme}`);
        const name = `${page.replace('.html', '')}-${width}-${theme}`;
        await screenshot(name);
        report.captures.push(name);
      }
    }
  }
  await navigate();
  for (const width of [320, 768, 820, 900]) {
    await viewport(width);
    await layout(`responsive ${width}`);
  }
  await viewport(1366);
  await evaluate('WA.theme.set("dark")');
  const original = await evaluate('document.querySelector("h1").innerText');
  for (const language of ['en', 'pt', 'en', 'pt']) {
    await evaluate(`document.querySelector('[data-lang="${language}"]').click()`);
    assert.ok(await evaluate('document.querySelectorAll(".hero-word").length > 5'));
    assert.equal(await evaluate('document.querySelectorAll(".hero-word .hero-word").length'), 0);
  }
  assert.equal(await evaluate('document.querySelector("h1").innerText'), original);
  await pause(1600);
  report.checks.push('PT/EN title split rebuilt on every change');
  await evaluate('document.querySelector(".marquee-toggle").click()');
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".marquee-track")).animationPlayState'), 'paused');
  await evaluate('WA.i18n.apply("en")');
  assert.equal(await evaluate('document.querySelector(".marquee-toggle").textContent'), 'Resume animation');
  report.checks.push('Marquee pause button and translated state');
  await evaluate('document.getElementById("themeToggle").click()');
  await navigate('paracauari.html');
  assert.equal(await evaluate('WA.theme.current()'), 'light');
  assert.equal(await evaluate('document.querySelector("meta[name=theme-color]").content.toLowerCase()'), '#fafafb');
  report.checks.push('Theme toggle, persistence across pages, browser theme color');
  await viewport(390);
  await evaluate('document.getElementById("menuToggle").click()');
  assert.equal(await evaluate('getComputedStyle(document.getElementById("nav")).display'), 'flex');
  await cdp('Input.dispatchKeyEvent', {type: 'keyDown', key: 'Escape', code: 'Escape'});
  assert.equal(await evaluate('document.getElementById("menuToggle").getAttribute("aria-expanded")'), 'false');
  report.checks.push('Mobile navigation and Escape');
  await cdp('Emulation.setEmulatedMedia', {features: [{name:'prefers-reduced-motion',value:'reduce'}]});
  await navigate();
  assert.equal(await evaluate('document.querySelectorAll(".hero-word").length'), 0);
  assert.equal(await evaluate('document.getAnimations().filter(a => a.playState === "running").length'), 0);
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".chips[aria-hidden]")).display'), 'none');
  await evaluate('WA.i18n.apply("en")');
  assert.equal(await evaluate('document.querySelectorAll(".hero-word").length'), 0);
  await layout('reduced motion');
  await screenshot('reduced-motion');
  report.checks.push('Reduced motion: no animations, static chips, language switch');
  await cdp('Emulation.setEmulatedMedia', {features: [{name:'prefers-reduced-motion',value:'no-preference'}]});
  await cdp('Network.setBlockedURLs', {urls: ['*cdn.jsdelivr.net*']});
  await navigate();
  assert.equal(await evaluate('typeof window.gsap'), 'undefined');
  await layout('without GSAP');
  await screenshot('without-gsap');
  report.checks.push('CDN blocked: IntersectionObserver fallback and failsafe');
  await cdp('Network.setBlockedURLs', {urls: []});
  await viewport(1366);
  await navigate();
  for (const theme of ['dark', 'light']) {
    await evaluate(`WA.theme.set('${theme}')`);
    await pause(400);
    const tokens = await evaluate(`(() => { const s = getComputedStyle(document.documentElement); return Object.fromEntries(['bg','bg-tint','surface','surface-2','ink','ink-2','muted','accent','accent-2','accent-hover','accent-wash','on-accent'].map(k => [k,s.getPropertyValue('--'+k).trim()])); })()`);
    function rgb(s) {
      if (s.startsWith('#')) return s.slice(1).match(/../g).map(v => parseInt(v,16));
      return s.match(/[\d.]+/g).map(Number);
    }
    function blend(top, bottom) {const a = top[3] ?? 1; return top.slice(0,3).map((v,i) => v*a+bottom[i]*(1-a));}
    function luminance(c) {return c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);}
    function ratio(a,b) {const l=[luminance(a),luminance(b)].sort((a,b)=>b-a);return (l[0]+.05)/(l[1]+.05);}
    const t = Object.fromEntries(Object.entries(tokens).map(([k,v])=>[k,rgb(v)]));
    const surfaces = ['bg','bg-tint','surface-2'].map(k=>[k,t[k]]);
    for (const bg of ['bg','bg-tint']) surfaces.push([`surface over ${bg}`,blend(t.surface,t[bg])]);
    surfaces.push(['hover',blend(t['accent-wash'],blend(t.surface,t['bg-tint']))]);
    const glowOpacity = theme === 'dark' ? .14 : .07;
    surfaces.push(['glow',blend([...t['accent-2'],glowOpacity],t['bg-tint'])]);
    let min = {ratio:Infinity};
    for (const text of ['ink','ink-2','muted','accent','accent-2']) {
      for (const [name,bg] of surfaces) {
        const value = ratio(t[text],bg);
        if(value < min.ratio) min = {text,surface:name,ratio:value};
        assert.ok(value >= 4.5, `${theme} ${text} on ${name}: ${value}`);
      }
    }
    for(const bg of ['accent','accent-hover']) assert.ok(ratio(t['on-accent'],t[bg])>=4.5);
    report.contrast.push({theme,minimum:min});
  }
  assert.deepEqual(errors, [], 'Browser JS errors');
  report.checks.push('Text token contrast >= 4.5:1 on solid, glass, glow and hover surfaces');
  await writeFile(`${output}/report.json`, JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
} finally {
  await cdp('Network.setBlockedURLs', {urls: []});
  await cdp('Emulation.setEmulatedMedia', {features: []});
  socket.close();
  await fetch(`http://127.0.0.1:9222/json/close/${tab.id}`);
}
