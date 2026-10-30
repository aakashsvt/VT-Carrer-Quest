const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const brainDir = 'C:\\Users\\SAM\\.gemini\\antigravity\\brain\\105bcc1f-d1ec-4415-b9aa-7a0c10705fbb';

let html = fs.readFileSync('index.html', 'utf8');

// Replace syncTopBar logic
const oldSync = `function syncTopBar(){
  var tb = $("top-bar");
  if (!tb || tb.style.display === "none") return;
  var nav = $("nav"), hud = $("hud"), hudBar = document.querySelector("#hud .bar");
  if (!nav || !hud || !hudBar) return;

  var vbO = ovVB();
  var scale = innerWidth / vbO[2];
  var roomLeft = (30 - vbO[0]) * scale;
  var roomRight = (1170 - vbO[0]) * scale;
  var headerPillTop = (14 - vbO[1]) * scale;
  var totalWidth = roomRight - roomLeft;

  // Measure natural nav width
  hudBar.style.width = "auto";
  var navW = nav.offsetWidth;
  if (navW > 0) {
    hudBar.style.width = navW + "px";
  }

  var isStacked = (totalWidth < (navW * 2 + 16));
  if (isStacked) {
    tb.style.flexDirection = "column";
    tb.style.alignItems = "stretch";
    tb.style.gap = "6px";
    hud.style.justifyContent = "flex-end";
  } else {
    tb.style.flexDirection = "row";
    tb.style.alignItems = "center";
    tb.style.gap = "0px";
    hud.style.justifyContent = "flex-end";
  }

  var barH = Math.max(nav.offsetHeight, hudBar.offsetHeight, 38);
  var topPos = Math.max(10, Math.round(headerPillTop - (isStacked ? barH * 2 + 10 : barH) - 14));
  topPos = Math.max(8, Math.min(topPos, 36));

  tb.style.left = Math.round(roomLeft) + "px";
  tb.style.width = Math.round(totalWidth) + "px";
  tb.style.top = topPos + "px";
}`;

const newSync = `function syncTopBar(){
  var tb = $("top-bar");
  if (!tb || tb.style.display === "none") return;
  var nav = $("nav"), hud = $("hud"), hudBar = document.querySelector("#hud .bar");
  if (!nav || !hud || !hudBar) return;

  var vbO = ovVB();
  var scale = innerWidth / vbO[2];
  var roomLeft = (30 - vbO[0]) * scale;
  var roomRight = (1170 - vbO[0]) * scale;
  var headerPillTop = (14 - vbO[1]) * scale;
  var totalWidth = roomRight - roomLeft;

  // Ensure nav takes natural content width
  nav.style.width = "max-content";
  var navW = nav.offsetWidth;
  if (navW > 0) {
    hudBar.style.width = navW + "px";
  }

  var barH = Math.max(nav.offsetHeight, hudBar.offsetHeight, 38);
  var topPos = Math.max(12, Math.round((headerPillTop - barH) / 2));

  tb.style.left = Math.round(roomLeft) + "px";
  tb.style.width = Math.round(totalWidth) + "px";
  tb.style.top = topPos + "px";
}`;

// Also update CSS to make sure nav is width: max-content and hud is width: auto
const oldCssNav = `#nav {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0;
  padding: 0;
  white-space: nowrap;
}`;

const newCssNav = `#nav {
  display: inline-flex;
  width: max-content;
  flex: 0 0 auto;
  gap: 8px;
  align-items: center;
  margin: 0;
  padding: 0;
  white-space: nowrap;
}`;

const norm = s => s.replace(/\r\n/g, '\n');

if (norm(html).includes(norm(oldSync))) {
  html = norm(html).replace(norm(oldSync), norm(newSync));
  console.log('syncTopBar replaced');
} else {
  console.error('oldSync not found');
  process.exit(1);
}

if (norm(html).includes(norm(oldCssNav))) {
  html = norm(html).replace(norm(oldCssNav), norm(newCssNav));
  console.log('oldCssNav replaced');
}

fs.writeFileSync('index.html', html.replace(/\n/g, '\r\n'), 'utf8');
console.log('Updated index.html for row layout');
