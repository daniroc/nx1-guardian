import {readFileSync,readdirSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,join,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'nx1-guardian'),sha=x=>createHash('sha256').update(x).digest('hex'),text=p=>readFileSync(p,'utf8').replace(/^\uFEFF/,'');
const evidence=JSON.parse(text(join(root,'docs/fix-01-evidence.json'))),files=[];
function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules','dist','.lab-tests'].includes(e.name))continue;const p=join(dir,e.name);if(e.isDirectory())walk(p);else files.push({path:relative(root,p).replaceAll('\\','/'),sha256:sha(readFileSync(p))});}}
walk(root);files.sort((a,b)=>a.path.localeCompare(b.path,'en'));assert.equal(files.length,22);
for(const expected of evidence.files)assert.equal(files.find(f=>f.path===expected.path)?.sha256,expected.sha256,expected.path);
assert.equal(sha(readFileSync(join(root,'docs/fix-01-evidence.json'))),'57976f367b7dd294094dcbcfe4c60ff9a32a2f56ad1a69a9c91a3cc3c737b72a');
const historical=[['G02A-0-security-review.md','b4975c67ca5882511013d70e56e8c911874e828186a457448aed6f8e6b313d9a'],['G02A-review-probe-results.json','0740dbde1b0552f5ef6c7acbd0a44359eda361e96e265d3c5908e136a9bec4d9']].map(([name,hash])=>{assert.equal(sha(readFileSync(join(import.meta.dirname,name))),hash);return{path:name,sha256:hash};});
const req=createRequire(join(root,'package.json')),ts=req('typescript'),configFile=ts.readConfigFile(join(root,'tsconfig.json'),ts.sys.readFile),config=ts.parseJsonConfigFileContent(configFile.config,ts.sys,root),program=ts.createProgram(config.fileNames,config.options);
assert.equal(ts.getPreEmitDiagnostics(program).length,0);const parity=[];
program.emit(undefined,(path,content)=>{assert.ok(existsSync(path));assert.equal(readFileSync(path,'utf8'),content,path);parity.push({path:relative(root,path).replaceAll('\\','/'),sha256:sha(content)});});assert.equal(parity.length,12);
const rows=[...text(join(root,'docs/traceability.md')).matchAll(/^\| ([ACT]\d{2})\b/gm)].map(m=>m[1]);assert.equal(rows.length,58);assert.equal(new Set(rows).size,58);
for(const[prefix,count]of[['A',27],['C',10],['T',21]])for(let i=1;i<=count;i++)assert.ok(rows.includes(prefix+String(i).padStart(2,'0')));
const dependencies=['typescript','@types/node','undici-types'].map(name=>{const path=name==='undici-types'?join(root,'node_modules/.pnpm/undici-types@8.3.0/node_modules/undici-types/package.json'):req.resolve(name+'/package.json'),json=JSON.parse(text(path));return{name,version:json.version,manifestSha256:sha(readFileSync(path))};});
assert.deepEqual(dependencies.map(d=>d.version),['5.9.3','26.1.0','8.3.0']);
const report={schema:'guardian-reaudit-baseline/1',nx1Version:'1.3',head:'UNBORN',tree:null,branch:'main',files,artifactManifestSha256:sha(JSON.stringify(files)),historical,parity,matrixRows:rows,dependencies,lockSha256:sha(readFileSync(join(root,'pnpm-lock.yaml'))),writesToProtectedCheckout:0,runtime:{node:process.version,sqlite:process.versions.sqlite,openssl:process.versions.openssl,v8:process.versions.v8}};
const phase=process.argv[2]??'before';assert.ok(['before','after'].includes(phase));if(phase==='after'){const before=JSON.parse(text(join(import.meta.dirname,'G02A-REAUDIT-01-baseline-before.json')));assert.deepEqual(report,before);report.preservationVerified=true;}
writeFileSync(join(import.meta.dirname,'G02A-REAUDIT-01-baseline-'+phase+'.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({phase,files:files.length,artifactManifestSha256:report.artifactManifestSha256,sourceDistParity:parity.length,matrixRows:rows.length,dependencies,preservationVerified:report.preservationVerified??null}));
