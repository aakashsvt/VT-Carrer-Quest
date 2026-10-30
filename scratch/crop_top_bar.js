const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const htmlUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/') + '#office';
const brainDir = 'C:\\Users\\SAM\\.gemini\\antigravity\\brain\\105bcc1f-d1ec-4415-b9aa-7a0c10705fbb';

async function crop() {
  const edgeProc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9244'
  ]);

  try {
    await new Promise(r => setTimeout(r, 1200));
    const listRes = await fetch('http://localhost:9244/json');
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (evt) => {
          const data = JSON.parse(evt.data);
          if (data.id === id) {
            ws.removeEventListener('message', handler);
            resolve(data.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Page.navigate', { url: htmlUrl });
    await new Promise(r => setTimeout(r, 1000));

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false
    });

    await send('Runtime.evaluate', { expression: 'if (typeof enter === "function") enter(); syncTopBar();' });
    await new Promise(r => setTimeout(r, 500));

    // Capture clip of just the top bar
    const clipRes = await send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: 200,
        y: 10,
        width: 1040,
        height: 90,
        scale: 1
      }
    });

    fs.writeFileSync(path.join(brainDir, 'top_bar_comparison.png'), Buffer.from(clipRes.data, 'base64'));
    console.log('Saved top_bar_comparison.png');
    ws.close();
  } finally {
    edgeProc.kill();
  }
}

crop().catch(console.error);
