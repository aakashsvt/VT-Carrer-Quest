const { execSync } = require('child_process');
const puppeteer = require('puppeteer-core');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const filePath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'networkidle0' });

  // Click start or enter
  await page.evaluate(() => {
    if (typeof enter === 'function') enter();
  });

  await new Promise(r => setTimeout(r, 500));

  const result = await page.evaluate(() => {
    const svg = document.getElementById('game');
    const ctm = svg.getScreenCTM();
    const ptLeft = svg.createSVGPoint();
    ptLeft.x = 30; ptLeft.y = 30;
    const sLeft = ptLeft.matrixTransform(ctm);

    const ptRight = svg.createSVGPoint();
    ptRight.x = 1170; ptRight.y = 30;
    const sRight = ptRight.matrixTransform(ctm);

    return {
      ctm: { a: ctm.a, d: ctm.d, e: ctm.e, f: ctm.f },
      left: sLeft,
      right: sRight,
      window: { w: window.innerWidth, h: window.innerHeight }
    };
  });

  console.log('Result at 1440x900:', JSON.stringify(result, null, 2));

  await browser.close();
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
