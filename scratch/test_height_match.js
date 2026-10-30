const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace CSS
const oldBtnCss = `#nav .btn {
  padding: 7px 12px;
  font-size: 12.5px;
  gap: 6px;
  font-weight: 700;
  background: rgba(22, 14, 8, 0.92);
  backdrop-filter: blur(16px);
  border: 1.5px solid #f97316;
  color: #ffedd5;
  border-radius: 10px;
  box-shadow: 0 0 16px rgba(249, 115, 22, 0.45);
  line-height: 1.2;
}`;

const newBtnCss = `#nav .btn {
  height: 38px;
  box-sizing: border-box;
  padding: 0 13px;
  font-size: 12.5px;
  gap: 6px;
  font-weight: 700;
  background: rgba(22, 14, 8, 0.92);
  backdrop-filter: blur(16px);
  border: 1.5px solid #f97316;
  color: #ffedd5;
  border-radius: 9px;
  box-shadow: 0 0 16px rgba(249, 115, 22, 0.45);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}`;

const oldHudCss = `#hud .bar {
  box-sizing: border-box;
  background: rgba(9, 14, 24, 0.94);
  backdrop-filter: blur(20px);
  border: 1.5px solid #00f0ff;
  border-radius: 10px;
  padding: 7px 14px;
  font-family: 'Space Grotesk', sans-serif;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.4), inset 0 0 10px rgba(0, 240, 255, 0.12);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}`;

const newHudCss = `#hud .bar {
  height: 38px;
  box-sizing: border-box;
  background: rgba(9, 14, 24, 0.94);
  backdrop-filter: blur(20px);
  border: 1.5px solid #00f0ff;
  border-radius: 9px;
  padding: 4px 14px 5px;
  font-family: 'Space Grotesk', sans-serif;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.4), inset 0 0 10px rgba(0, 240, 255, 0.12);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
}`;

const norm = s => s.replace(/\r\n/g, '\n');

if (norm(html).includes(norm(oldBtnCss))) {
  html = norm(html).replace(norm(oldBtnCss), norm(newBtnCss));
  console.log('Btn CSS updated');
} else {
  console.error('Btn CSS not found');
}

if (norm(html).includes(norm(oldHudCss))) {
  html = norm(html).replace(norm(oldHudCss), norm(newHudCss));
  console.log('Hud CSS updated');
} else {
  console.error('Hud CSS not found');
}

fs.writeFileSync('index.html', html.replace(/\n/g, '\r\n'), 'utf8');
console.log('index.html written');
