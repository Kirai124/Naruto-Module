import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,cpSync,rmSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateBuild} from '../scripts/validate-build.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
function changed(fn){const copy=mkdtempSync(join(tmpdir(),'naruto-payload-'));try{cpSync(root,copy,{recursive:true});fn(copy);}finally{rmSync(copy,{recursive:true,force:true});}}
function json(path,fn){const value=JSON.parse(readFileSync(path,'utf8'));fn(value);writeFileSync(path,JSON.stringify(value));}
test('the complete payload passes validation with all items, folders and new runtimes',()=>{
 assert.deepEqual(validateBuild(root),{version:'0.19.1',items:887,folders:121,runtimes:10});
});
test('changing only the manifest version cannot create a misleading release',()=>changed(copy=>{
 json(join(copy,'module.json'),m=>m.version='0.19.2');assert.throws(()=>validateBuild(copy),/Runtime content version 0\.19\.1 != manifest version 0\.19\.2/);
}));
test('a release missing Rasengan script or data files is rejected before publishing',()=>changed(copy=>{
 rmSync(join(copy,'scripts/rasengan.js'));rmSync(join(copy,'data/rasengan.json'));assert.throws(()=>validateBuild(copy),/Missing file: scripts\/rasengan.js/);
}));
test('the old module script list is rejected even when new files exist on disk',()=>changed(copy=>{
 json(join(copy,'module.json'),m=>m.esmodules=m.esmodules.filter(p=>!['scripts/rasengan.js','scripts/classmod-settings.js'].includes(p)));
 assert.throws(()=>validateBuild(copy),/Missing runtime entry point in module.json: scripts\/classmod-settings.js/);
}));
