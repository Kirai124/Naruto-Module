/** Fail a release that updates the manifest but leaves old/missing runtime files. */
import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve,dirname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
export function validateBuild(root){
  const errors=[],read=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
  const module=read('module.json'),index=read('data/index.json');
  const need=path=>{const absolute=resolve(root,path);if(!absolute.startsWith(resolve(root)+'/')){errors.push(`Invalid path: ${path}`);return false;}if(!existsSync(absolute)||!statSync(absolute).isFile()){errors.push(`Missing file: ${path}`);return false;}return true;};
  if(index.version!==module.version)errors.push(`Data index version ${index.version} != manifest version ${module.version}`);
  const main=need('scripts/main.js')?readFileSync(resolve(root,'scripts/main.js'),'utf8'):'';
  const content=/const CONTENT_VERSION\s*=\s*["']([^"']+)["']/.exec(main)?.[1];
  if(content!==module.version)errors.push(`Runtime content version ${content} != manifest version ${module.version}`);
  for(const required of ['scripts/classmod-settings.js','scripts/rasengan.js','scripts/madara-cells.js']){
    if(!module.esmodules?.includes(required))errors.push(`Missing runtime entry point in module.json: ${required}`);
    need(required);
  }
  for(const path of [...(module.esmodules??[]),...(module.styles??[])]){
    if(!need(path))continue;
    if(path.endsWith('.js')){
      const source=readFileSync(resolve(root,path),'utf8');
      for(const m of source.matchAll(/(?:from\s+|import\s*)["'](\.\.?\/[^"']+)["']/g))need(relative(root,resolve(dirname(resolve(root,path)),m[1])));
    }
  }
  if(!index.files?.includes('rasengan.json'))errors.push('Rasengan bundle is not listed in data/index.json');
  let itemCount=0;const ids=new Set(),folderIds=new Set(),items=[];
  for(const file of index.files??[]){
    if(!need('data/'+file))continue;const bundle=read('data/'+file);itemCount+=bundle.items?.length??0;
    if(file==='rasengan.json'){
      if(bundle.version!==module.version)errors.push(`Rasengan bundle version ${bundle.version} != manifest ${module.version}`);
      const arts=bundle.items.filter(i=>i.flags?.[module.id]?.rasenganArt);
      if(arts.length!==20)errors.push(`Expected 20 Rasengan Arts, found ${arts.length}`);
      if(!bundle.items.some(i=>i.type==='classmod'&&i.system?.identifier==='rasengan'))errors.push('Rasengan Class Mod item is missing');
    }
    if(file==='madara-cells.json'&&bundle.version!==module.version)errors.push(`Madara bundle version ${bundle.version} != manifest ${module.version}`);
    for(const i of bundle.items??[]){if(ids.has(i._id))errors.push(`Duplicate Item ID: ${i._id}`);ids.add(i._id);items.push(i);}
    for(const f of bundle.folders??[]){if(folderIds.has(f._id))errors.push(`Duplicate Folder ID: ${f._id}`);folderIds.add(f._id);}
  }
  for(const i of items){
    if(i.folder&&!folderIds.has(i.folder))errors.push(`Missing folder for ${i.name}: ${i.folder}`);
    for(const m of JSON.stringify(i).matchAll(/Compendium\.world\.n5eb-custom-class-mods\.Item\.([a-zA-Z0-9]{16})/g))if(!ids.has(m[1]))errors.push(`Missing advancement target for ${i.name}: ${m[1]}`);
  }
  if(errors.length)throw new Error('Release payload validation failed:\n'+errors.map(e=>' - '+e).join('\n'));
  return {version:module.version,items:itemCount,folders:folderIds.size,runtimes:module.esmodules.length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{const result=validateBuild(resolve(dirname(fileURLToPath(import.meta.url)),'..'));console.log(`Validated v${result.version}: ${result.items} items, ${result.folders} folders and ${result.runtimes} runtime entry points.`);}
  catch(error){console.error(error.message);process.exitCode=1;}
}
