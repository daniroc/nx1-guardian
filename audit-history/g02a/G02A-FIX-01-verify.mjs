import {readFileSync,readdirSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,join,relative,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'nx1-guardian'),sha=x=>createHash('sha256').update(x).digest('hex');
const text=p=>readFileSync(p,'utf8').replace(/^\uFEFF/,'');
const files=[];
function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){if(['.git','dist','node_modules','.lab-tests'].includes(e.name))continue;const p=join(dir,e.name);if(e.isDirectory())walk(p);else if(p!==join(root,'docs/fix-01-evidence.json'))files.push({path:relative(root,p).replaceAll('\\','/'),sha256:sha(readFileSync(p))});}}
walk(root);files.sort((a,b)=>a.path.localeCompare(b.path,'en'));
const baseline=JSON.parse(text(join(import.meta.dirname,'G02A-FIX-01-baseline.json')));
assert.equal(baseline.length,20);
const changes=files.filter(f=>baseline.find(b=>b.path.replaceAll('\\','/')===f.path)?.sha256.toLowerCase()!==f.sha256).map(f=>f.path);
const allowed=['README.md','src/contracts.ts','src/guardian.ts','src/store.ts','test/core.test.ts','docs/architecture.md','docs/contracts.md','docs/risks.md','docs/traceability.md','docs/validation.md','docs/fix-01.md'];
assert.deepEqual([...changes].sort(),[...allowed].sort());
assert.ok(baseline.every(b=>files.some(f=>f.path===b.path.replaceAll('\\','/'))));
for(const f of files){const s=text(join(root,f.path));assert.ok(!/[^\S\r\n]+$/m.test(s),'Whitespace '+f.path);if(f.path.endsWith('.md'))for(const m of s.matchAll(/\]\(([^)]+)\)/g))if(!m[1].startsWith('http'))assert.ok(existsSync(resolve(dirname(join(root,f.path)),m[1])),'Link '+m[1]);}
const matrix=text(join(root,'docs/traceability.md'));let matrixRows=0;
for(const [prefix,count]of [['A',27],['T',21],['C',10]])for(let i=1;i<=count;i++){assert.ok(matrix.includes('| '+prefix+String(i).padStart(2,'0')+' '));matrixRows++;}
const req=createRequire(join(root,'package.json')),ts=req('typescript');
const configFile=ts.readConfigFile(join(root,'tsconfig.json'),ts.sys.readFile),config=ts.parseJsonConfigFileContent(configFile.config,ts.sys,root),program=ts.createProgram(config.fileNames,config.options);
assert.equal(ts.getPreEmitDiagnostics(program).length,0);
const parity=[];
program.emit(undefined,(filename,content)=>{const matches=existsSync(filename)&&text(filename)===content;assert.ok(matches,filename);parity.push({path:relative(root,filename).replaceAll('\\','/'),sha256:sha(content),matches});});
assert.ok(parity.length>0);
const final=text(join(import.meta.dirname,'G02A-FIX-01-tests-final.log')),red=text(join(import.meta.dirname,'G02A-FIX-01-red-tests-clean.log'));
for(const pattern of [/tests 48/,/pass 48/,/fail 0/,/skipped 0/,/cancelled 0/])assert.match(final,pattern);
for(const pattern of [/tests 41/,/pass 36/,/fail 5/])assert.match(red,pattern);
const names=s=>s.split(/\r?\n/).filter(l=>l.startsWith('✔ ')).map(l=>l.slice(2).replace(/ \([^)]*ms\)$/,''));
const original=names(text(join(import.meta.dirname,'G02A-review-original-tests.log'))),current=names(final);
assert.equal(original.length,35);assert.equal(current.length,48);assert.ok(original.every(n=>current.includes(n)));
const logs=['typecheck','lint','build','tests-final','red-build-clean','red-tests-clean','tests-first','tests-expanded'].map(n=>{const path='G02A-FIX-01-'+n+'.log';return{path:'../'+path,sha256:sha(readFileSync(join(import.meta.dirname,path)))};});
const report={schema:'guardian-fix-evidence/1',nx1Version:'1.3',iteration:'GUARDIAN-G02A-0-FIX-01',result:'LOCAL_FIXES_VALIDATED_PENDING_INDEPENDENT_REAUDIT',repository:'daniroc/nx1-guardian',head:'UNBORN',tree:null,branch:'main',baselineArtifactCount:20,
  baselineSha256:sha(readFileSync(join(import.meta.dirname,'G02A-FIX-01-baseline.json'))),changedFiles:[...changes,'docs/fix-01-evidence.json'],unrelatedArtifactsPreserved:true,historicalEvidencePreserved:true,
  tests:{executed:48,passed:48,failed:0,cancelled:0,skipped:0,originalNamesRetained:35,newCases:13},red:{executed:41,passed:36,failed:5},matrixRows,sourceDistParity:parity,files,logs,
  runtime:{node:process.version,sqlite:process.versions.sqlite,openssl:process.versions.openssl,v8:process.versions.v8},lockSha256:sha(readFileSync(join(root,'pnpm-lock.yaml'))),
  limitations:['Same assistant as implementer; independent re-audit required','Two instances/connections in one process; no parallel-process proof','Synthetic acknowledgement only; UNKNOWN remains pending','No host confinement, power-loss durability, real MFA, immutable external audit, TCB provenance or real quota guarantees','Ledger/witness clone copies logical authority'],networkRequests:0,remoteWrites:0,realProviderRequests:0,productionCredentialUse:0,nexusChanges:0,readiness:'READY_FOR_INDEPENDENT_REAUDIT;G02A1_AND_PRODUCTION_BLOCKED'};
writeFileSync(join(root,'docs/fix-01-evidence.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({result:report.result,files:files.length+1,changedFiles:report.changedFiles,tests:report.tests,red:report.red,matrixRows,parityEntries:parity.length,lockSha256:report.lockSha256}));
