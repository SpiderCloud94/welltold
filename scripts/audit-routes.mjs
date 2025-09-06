import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('app');

const walk = (dir, out=[]) => {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const s = fs.statSync(full);
    if (s.isDirectory()) walk(full, out);
    else if (/\.(tsx|ts|jsx|js)$/.test(f)) out.push(full.replace(ROOT, 'app'));
  }
  return out;
};

const files = walk(ROOT);

const check = (label, regex, expectInTabs) => {
  const hit = files.find(f => regex.test(f));
  if (!hit) return `- ${label}: MISSING`;
  const inTabs = /\(tabs\)/.test(hit);
  const ok = expectInTabs ? inTabs : !inTabs;
  return `- ${label}: ${hit} → ${inTabs ? 'IN (tabs)' : 'outside tabs'} ${ok ? '✔' : '✖ EXPECTED ' + (expectInTabs ? 'IN (tabs)' : 'outside tabs')}`;
};

console.log('\nRoute audit:\n');
console.log(check('Tell main',       /\/tell\/index\.(t|j)sx?$/, true));
console.log(check('ReadyRitual',     /\/tell\/(ready[-]?ritual|readyritual)\.(t|j)sx?$/i, true));
console.log(check('Vault home',      /\/vault\/index\.(t|j)sx?$/, true));
console.log(check('Story page',      /story.*\[id\]\.(t|j)sx?$/i, true));
console.log(check('Settings home',   /\/settings\/index\.(t|j)sx?$/, true));
console.log(check('Account',         /\/settings\/account\.(t|j)sx?$/, true));
console.log(check('Help&Feedback',   /\/settings\/help-?and-?feedback\.(t|j)sx?$/i, true));
console.log(check('About',           /\/about\.(t|j)sx?$/i, false));  // EXPECT OUTSIDE (tabs)
console.log('\nExpected: ALL except About should be IN (tabs). About should be OUTSIDE (tabs).\n');
