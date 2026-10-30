const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const brainDir = 'C:\\Users\\SAM\\.gemini\\antigravity\\brain\\105bcc1f-d1ec-4415-b9aa-7a0c10705fbb';

// Let's read index.html
let html = fs.readFileSync('index.html', 'utf8');

// 1. Replace #hud and #nav CSS
const oldCssTarget = `/* Modern Telemetry HUD */
#hud {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 4;
  padding: calc(12px + env(safe-area-inset-top, 0px)) 16px 0;
  display: none;
  pointer-events: none;
}
#hud .bar {
  max-width: 680px;
  margin: 0 auto;
  background: rgba(9, 14, 24, 0.94);
  backdrop-filter: blur(20px);
  border: 2px solid #00f0ff;
  border-radius: 14px;
  padding: 10px 22px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  box-shadow: 0 0 26px rgba(0, 240, 255, 0.45), inset 0 0 14px rgba(0, 240, 255, 0.15);
  display: flex;
  flex-direction: column;
  gap: 7px;
}
#mt {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 800;
  font-size: 14px;
  color: #ffffff;
  letter-spacing: 0.08em;
  text-shadow: 0 0 12px rgba(0, 240, 255, 0.6);
}
.track {
  height: 8px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}
#xpb {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
  border-radius: 6px;
  box-shadow: 0 0 14px rgba(251, 191, 36, 0.85);
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
#xpt {
  color: #94a3b8;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  font-size: 12px;
}

/* Bottom Navigation Dock */
#nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 4;
  display: none;
  gap: 8px;
  justify-content: center;
  padding: 6px 12px calc(10px + env(safe-area-inset-bottom, 0px));
  flex-wrap: wrap;
}
#nav .btn {
  padding: 10px 18px;
  font-size: 13.5px;
  font-weight: 700;
  background: rgba(22, 14, 8, 0.88);
  backdrop-filter: blur(16px);
  border: 1.5px solid #f97316;
  color: #ffedd5;
  border-radius: 10px;
  box-shadow: 0 0 16px rgba(249, 115, 22, 0.45);
}
#nav .btn:hover {
  background: linear-gradient(180deg, #f97316 0%, #ea580c 100%);
  color: #ffffff;
  border-color: #fed7aa;
  box-shadow: 0 0 24px rgba(249, 115, 22, 0.85);
}`;

const newCss = `/* Top Navigation & Telemetry HUD Dock */
#top-bar {
  position: fixed;
  z-index: 4;
  display: none;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
  box-sizing: border-box;
}
#top-bar > * {
  pointer-events: auto;
}
#nav {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0;
  padding: 0;
  white-space: nowrap;
}
#nav .btn {
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 700;
  background: rgba(22, 14, 8, 0.92);
  backdrop-filter: blur(16px);
  border: 1.5px solid #f97316;
  color: #ffedd5;
  border-radius: 10px;
  box-shadow: 0 0 16px rgba(249, 115, 22, 0.45);
  line-height: 1.2;
}
#nav .btn:hover {
  background: linear-gradient(180deg, #f97316 0%, #ea580c 100%);
  color: #ffffff;
  border-color: #fed7aa;
  box-shadow: 0 0 24px rgba(249, 115, 22, 0.85);
}

#hud {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 0;
  padding: 0;
}
#hud .bar {
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
}
.hud-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
#mt {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 800;
  font-size: 12px;
  color: #ffffff;
  letter-spacing: 0.05em;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
  white-space: nowrap;
}
.track {
  height: 5px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}
#xpb {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
  border-radius: 4px;
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.85);
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
#xpt {
  color: #38bdf8;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 11px;
  text-shadow: 0 0 8px rgba(56, 189, 248, 0.5);
  white-space: nowrap;
}`;

// Normalize line endings for replacement
const norm = s => s.replace(/\r\n/g, '\n');
if (norm(html).includes(norm(oldCssTarget))) {
  html = norm(html).replace(norm(oldCssTarget), norm(newCss));
  console.log('CSS replaced successfully');
} else {
  console.error('CSS target not found');
  process.exit(1);
}

// 2. Replace HTML markup
const oldHtmlTarget = `<div id="hud">
  <div class="bar">
    <div id="mt">DISCOVERY MISSION: 0/6 XP CHIPS</div>
    <div class="track"><div id="xpb"></div></div>
    <div id="xpt" style="margin-top:4px">0 XP</div>
  </div>
</div>

<div id="nav">
  <button class="btn" id="nOv">Overview</button>
  <button class="btn" id="nTeam">Meet the team</button>
  <button class="btn" id="nJobs">Careers</button>
  <button class="btn" id="nSnd" aria-pressed="false">Sound: off</button>
</div>`;

const newHtml = `<div id="top-bar">
  <div id="nav">
    <button class="btn" id="nOv">Overview</button>
    <button class="btn" id="nTeam">Meet the team</button>
    <button class="btn" id="nJobs">Careers</button>
    <button class="btn" id="nSnd" aria-pressed="false">Sound: off</button>
  </div>
  <div id="hud">
    <div class="bar">
      <div class="hud-head">
        <div id="mt">DISCOVERY MISSION: 0/6 XP CHIPS</div>
        <div id="xpt">0 XP · Player</div>
      </div>
      <div class="track"><div id="xpb"></div></div>
    </div>
  </div>
</div>`;

if (norm(html).includes(norm(oldHtmlTarget))) {
  html = norm(html).replace(norm(oldHtmlTarget), norm(newHtml));
  console.log('HTML replaced successfully');
} else {
  console.error('HTML target not found');
  process.exit(1);
}

// 3. Update JS for top-bar alignment
const oldEnterTarget = `function enter(){
  state = "office";
  show("create", false);
  show("welcome", false);
  $("hq").style.display = "none";
  svg.style.display = "block";
  $("hud").style.display = "block";
  $("nav").style.display = "flex";
  vb = ovVB();
  setVB(vb);
  hud();
}`;

const newEnter = `function syncTopBar(){
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
}

function enter(){
  state = "office";
  show("create", false);
  show("welcome", false);
  $("hq").style.display = "none";
  svg.style.display = "block";
  $("top-bar").style.display = "flex";
  $("hud").style.display = "flex";
  $("nav").style.display = "flex";
  vb = ovVB();
  setVB(vb);
  hud();
  syncTopBar();
  setTimeout(syncTopBar, 50);
}`;

if (norm(html).includes(norm(oldEnterTarget))) {
  html = norm(html).replace(norm(oldEnterTarget), norm(newEnter));
  console.log('enter() and syncTopBar() added successfully');
} else {
  console.error('enter() target not found');
  process.exit(1);
}

// 4. Update resize and hud listeners
html = html.replace('function hud(){\n  $("mt").textContent = "DISCOVERY MISSION: " + n + "/6 XP CHIPS";\n  $("xpb").style.width = (n / 6 * 100) + "%";\n  $("xpt").textContent = xp + " XP · " + P.name;\n}',
`function hud(){\n  $("mt").textContent = "DISCOVERY MISSION: " + n + "/6 XP CHIPS";\n  $("xpb").style.width = (n / 6 * 100) + "%";\n  $("xpt").textContent = xp + " XP · " + P.name;\n  syncTopBar();\n}`);

html = html.replace('addEventListener("resize", function(){\n  if (state === "office" && !sel) {\n    vb = ovVB();\n    setVB(vb);\n  }\n});',
`addEventListener("resize", function(){\n  if (state === "office" && !sel) {\n    vb = ovVB();\n    setVB(vb);\n  }\n  syncTopBar();\n});`);

html = html.replace('$("nSnd").onclick = function(){\n  snd = !snd;\n  this.textContent = "Sound: " + (snd ? "on" : "off");',
`$("nSnd").onclick = function(){\n  snd = !snd;\n  this.textContent = "Sound: " + (snd ? "on" : "off");\n  setTimeout(syncTopBar, 10);`);

// Write back to index.html with CRLF preservation
fs.writeFileSync('index.html', html.replace(/\n/g, '\r\n'), 'utf8');
console.log('index.html updated successfully!');
