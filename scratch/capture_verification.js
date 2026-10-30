const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const htmlUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/') + '#office';
const brainDir = 'C:\\Users\\SAM\\.gemini\\antigravity\\brain\\105bcc1f-d1ec-4415-b9aa-7a0c10705fbb';

const viewports = [
  { name: 'office_top_bar_1440x900.png', width: 1440, height: 900 },
  { name: 'office_top_bar_1920x1080.png', width: 1920, height: 1080 },
  { name: 'office_top_bar_1280x720.png', width: 1280, height: 720 }
];

async function run() {
  const edgeProc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9241'
  ]);

  try {
    await new Promise(r => setTimeout(r, 1200));
    const listRes = await fetch('http://localhost:9241/json');
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const handler = (evt) => {
          const data = JSON.parse(evt.data);
          if (data.id === id) {
            ws.removeEventListener('message', handler);
            if (data.error) reject(data.error);
            else resolve(data.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Page.navigate', { url: htmlUrl });
    await new Promise(r => setTimeout(r, 1000));

    // Ensure enter() is called
    await send('Runtime.evaluate', { expression: 'if (typeof enter === "function") enter();' });
    await new Promise(r => setTimeout(r, 500));

    for (const vp of viewports) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: false
      });

      await send('Runtime.evaluate', {
        expression: `
          window.dispatchEvent(new Event('resize'));
          syncTopBar();
        `
      });

      await new Promise(r => setTimeout(r, 600));

      const metricsRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const tb = document.getElementById('top-bar');
          const nav = document.getElementById('nav');
          const hudBar = document.querySelector('#hud .bar');
          const svg = document.getElementById('game');
          const ctm = svg.getScreenCTM();
          const pL = svg.createSVGPoint(); pL.x = 30; pL.y = 30;
          const sL = pL.matrixTransform(ctm);
          const pR = svg.createSVGPoint(); pR.x = 1170; pR.y = 30;
          const sR = pR.matrixTransform(ctm);

          const tbRect = tb.getBoundingClientRect();
          const navRect = nav.getBoundingClientRect();
          const hudBarRect = hudBar.getBoundingClientRect();

          return JSON.stringify({
            vp: "${vp.name}",
            roomLeft: Math.round(sL.x),
            navLeft: Math.round(navRect.left),
            leftDiff: Math.abs(Math.round(sL.x) - Math.round(navRect.left)),

            roomRight: Math.round(sR.x),
            hudBarRight: Math.round(hudBarRect.right),
            rightDiff: Math.abs(Math.round(sR.x) - Math.round(hudBarRect.right)),

            navWidth: Math.round(navRect.width),
            hudBarWidth: Math.round(hudBarRect.width),
            widthDiff: Math.abs(Math.round(navRect.width) - Math.round(hudBarRect.width)),

            tbTop: Math.round(tbRect.top),
            roomTop: Math.round(sL.y)
          });
        })()`,
        returnByValue: true
      });

      console.log('Metrics for', vp.name, ':', metricsRes.result.value);

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(shot.data, 'base64');
      fs.writeFileSync(path.join(brainDir, vp.name), buffer);
      console.log('Saved', vp.name);
    }

    ws.close();
  } finally {
    edgeProc.kill();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
