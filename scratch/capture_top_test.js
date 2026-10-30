const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const htmlUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/') + '?office';

async function test() {
  const edgeProc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9228',
    '--hide-scrollbars',
    '--disable-gpu',
    htmlUrl
  ]);

  try {
    await new Promise(r => setTimeout(r, 1500));
    const listRes = await fetch('http://localhost:9228/json');
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('index.html')) || tabs[0];
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

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    await new Promise(r => setTimeout(r, 600));

    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const vbO = ovVB();
          const scale = innerWidth / vbO[2];
          const roomLeft = (30 - vbO[0]) * scale;
          const roomRight = (1170 - vbO[0]) * scale;
          const roomTop = (30 - vbO[1]) * scale;
          const nav = document.getElementById('nav');
          const navRect = nav ? { left: nav.getBoundingClientRect().left, width: nav.getBoundingClientRect().width, height: nav.getBoundingClientRect().height } : null;
          const hudBar = document.querySelector('#hud .bar');
          const hudBarRect = hudBar ? { left: hudBar.getBoundingClientRect().left, width: hudBar.getBoundingClientRect().width, height: hudBar.getBoundingClientRect().height, top: hudBar.getBoundingClientRect().top } : null;
          return JSON.stringify({
            innerWidth,
            innerHeight,
            vbO,
            scale,
            roomLeft,
            roomRight,
            roomTop,
            gridWidth: roomRight - roomLeft,
            navRect,
            hudBarRect
          });
        })()
      `,
      returnByValue: true
    });

    console.log('Office layout metrics:', JSON.parse(evalRes.result.value));
    ws.close();
  } finally {
    edgeProc.kill();
  }
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
