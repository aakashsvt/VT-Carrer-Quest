const { spawn } = require('child_process');
const path = require('path');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const htmlUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/') + '#office';

const proc = spawn(edgePath, ['--headless=new', '--remote-debugging-port=9243']);
setTimeout(async () => {
  try {
    const list = await (await fetch('http://localhost:9243/json')).json();
    const pageTab = list.find(t => t.type === 'page') || list[0];
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
    await new Promise(r => setTimeout(r, 1200));

    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector("#nav .btn");
        const hud = document.querySelector("#hud .bar");
        return JSON.stringify({
          btnH: btn.getBoundingClientRect().height,
          hudH: hud.getBoundingClientRect().height,
          btnOffsetH: btn.offsetHeight,
          hudOffsetH: hud.offsetHeight
        });
      })()`,
      returnByValue: true
    });
    console.log('Current heights:', res.result.value);
    ws.close();
    proc.kill();
    process.exit(0);
  } catch(e) {
    console.error(e);
    proc.kill();
    process.exit(1);
  }
}, 1000);
