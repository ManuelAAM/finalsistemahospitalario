const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  page.on('console', msg => {
    try {
      const args = msg.args();
      Promise.all(args.map(a => a.jsonValue())).then(vals => {
        console.log('[PAGE]', ...vals);
      }).catch(() => console.log('[PAGE]', msg.text()));
    } catch (e) {
      console.log('[PAGE]', msg.text());
    }
  });

  page.on('pageerror', err => console.log('[PAGE ERROR]', err.message));
  page.on('response', res => {
    if (res.status() >= 400) console.log('[HTTP]', res.status(), res.url());
  });
  page.on('framenavigated', frame => console.log('[FRAME NAVIGATED]', frame.url()));

  const url = 'http://localhost:5173/';
  console.log('Opening', url);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait a bit for app init
  await page.evaluate(() => new Promise(r => setTimeout(r, 1500)));

  // Try to click sidebar button "Pacientes Asignados"
  const buttons = await page.$x("//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'pacientes asignados')]");
  if (buttons.length > 0) {
    console.log('Clicking Pacientes Asignados');
    await buttons[0].click();
  } else {
    console.log('Pacientes Asignados button not found, trying "Pacientes"');
    const btns2 = await page.$x("//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'pacientes')]");
    if (btns2.length > 0) await btns2[0].click();
  }

  await page.evaluate(() => new Promise(r => setTimeout(r, 700)));

  // Click first "Atender" button
  const atenderBtns = await page.$x("//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'atender')]");
  if (atenderBtns.length > 0) {
    console.log('Clicking Atender (first)');
    await atenderBtns[0].click();
  } else {
    console.log('Atender button not found');
  }

  // Wait for care view inputs
  await page.evaluate(() => new Promise(r => setTimeout(r, 1000)));

  // Attach listeners to inputs to log focus/blur/input events
  await page.evaluate(() => {
    function idFor(el) {
      return el.placeholder || el.name || el.id || el.tagName;
    }
    document.querySelectorAll('input, textarea, select').forEach(el => {
      el.addEventListener('focus', () => console.log('FOCUS:' + idFor(el)));
      el.addEventListener('blur', () => console.log('BLUR:' + idFor(el)));
      el.addEventListener('input', () => console.log('INPUT:' + idFor(el) + ':' + el.value));
    });

    // Also monitor React root for re-mounts via data attribute counter
    const root = document.getElementById('root');
    if (root) {
      const obs = new MutationObserver((m) => console.log('MUTATION: root changed', m.map(x=>x.type).join(',')));
      obs.observe(root, { childList: true, subtree: true });
    }
  });

  // Identify medication input by placeholder
  const medSelector = 'input[placeholder="Nombre del Fármaco"]';
  const med = await page.$(medSelector);
  if (!med) {
    console.log('Medication input not found, trying placeholder variant');
    // fallback to first input inside Medicamentos card by searching label
    const alt = await page.$x("//h3[contains(., 'Medicamentos')]/following::input[1]");
    if (alt.length > 0) {
      await alt[0].focus();
      console.log('Focused alt medication input');
      try {
        await page.type('input[placeholder="Nombre del Fármaco"]', 'Paracetamol', { delay: 150 });
      } catch(e) { console.log('Type error', e.message); }
    } else {
      console.log('No medication input found at all');
    }
  } else {
    console.log('Focusing medication input selector', medSelector);
    await med.focus();
    // Type slowly
    await page.type(medSelector, 'Paracetamol', { delay: 200 });
  }

  // Wait to collect logs
  await page.evaluate(() => new Promise(r => setTimeout(r, 2500)));

  console.log('Test finished. Closing browser.');
  await browser.close();
  process.exit(0);
})();
