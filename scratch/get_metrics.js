const { spawn } = require('child_process');
const path = require('path');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const htmlUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/') + '#office';

const proc = spawn(edgePath, ['--headless=new', '--remote-debugging-port=9238']);
setTimeout(async () => {
  try {
    const list = await (await fetch('http://localhost:9238/json')).json();
    const pageTab = list.find(t => t.type === 'page');
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
    await new Promise(r => setTimeout(r, 1200));

    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('#nav .btn'));
        const btnWidths = btns.map(b => ({ text: b.textContent.trim(), width: b.offsetWidth }));
        const totalBtnWidth = btnWidths.reduce((a, b) => a + b.width, 0) + (btns.length - 1) * 8;
        return JSON.stringify({ btnWidths, totalBtnWidth });
      })()`,
      returnByValue: true
    });

    console.log('Button widths:', evalRes.result.value);
    ws.close();
    proc.kill();
    process.exit(0);
  } catch(e) {
    console.error(e);
    proc.kill();
    process.exit(1);
  }
}, 1000);
