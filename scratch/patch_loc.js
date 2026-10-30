const fs = require('fs');
let s = fs.readFileSync('index.html', 'utf8');

const target = "if (location.search.indexOf('office') !== -1) enter();";
const repl = "var loc = location.search + location.hash;\nif (loc.indexOf('office') !== -1) enter();";

if (s.includes(target)) {
  s = s.replace(target, repl);
  s = s.replace(/location\.search\.indexOf/g, "loc.indexOf");
  fs.writeFileSync('index.html', s, 'utf8');
  console.log('Successfully updated to support location.hash and location.search');
} else {
  console.log('Target not found');
}
