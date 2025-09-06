import fs from 'fs';
import path from 'path';
const ROOT = path.resolve('app');
const walk=(d,o=[])=>{for(const f of fs.readdirSync(d)){const p=path.join(d,f),s=fs.statSync(p);if(s.isDirectory())walk(p,o);else if(/\.(t|j)sx?$/.test(f))o.push(p.replace(ROOT,'app'));}return o;};
const files = walk(ROOT);
const check=(label,re,expectInTabs=true)=>{
  const hit = files.find(f=>re.test(f));
  if (!hit) return `- ${label}: MISSING`;
  const inTabs = /\(tabs\)/.test(hit);
  const ok = expectInTabs ? inTabs : !inTabs;
  return `- ${label}: ${hit} → ${inTabs?'IN (tabs)':'outside tabs'} ${ok?'✔':'✖'}`;
};
console.log('\nRoute audit:\n');
console.log(check('Tell main',      /\/tell\/index\.(t|j)sx?$/));
console.log(check('ReadyRitual',    /\/tell\/(ready[-]?ritual|readyritual)\.(t|j)sx?$/i));
console.log(check('Vault home',     /\/vault\/index\.(t|j)sx?$/));
console.log(check('Story page',     /\/vault\/story(\/index)?\/?\[id\]?\.(t|j)sx?$/i));
console.log(check('Settings home',  /\/settings\/index\.(t|j)sx?$/));
console.log(check('Account',        /\/settings\/account\.(t|j)sx?$/));
console.log(check('Help&Feedback',  /\/settings\/help-?and-?feedback\.(t|j)sx?$/i));
console.log(check('About (PUBLIC)', /\/\(public\)\/about\.(t|j)sx?$/, false)); // should be OUTSIDE tabs
console.log('\nExpected: everything except About should be IN (tabs).\n');
