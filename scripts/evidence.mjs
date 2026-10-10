import {readFileSync,readdirSync,writeFileSync,existsSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=process.cwd(), files=[];
function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){if(['.git','dist','node_modules','.lab-tests'].includes(e.name))continue;const p=join(dir,e.name);if(e.isDirectory())walk(p);else files.push(p);}}
walk(root);
const matrix=readFileSync('docs/traceability.md','utf8');
for(const [prefix,count]of [['A',27],['T',21],['C',10]])for(let n=1;n<=count;n++){const id=prefix+String(n).padStart(2,'0');if(!matrix.includes('| '+id+' '))throw Error('Missing matrix row '+id);}
for(const file of files){const text=readFileSync(file,'utf8');if(/[^\S\r\n]+$/m.test(text))throw Error('Trailing whitespace '+file);if(file.endsWith('.md'))for(const m of text.matchAll(/\]\(([^)]+)\)/g)){if(m[1].startsWith('http'))continue;const target=resolve(dirname(file),m[1]);if(!existsSync(target))throw Error('Missing local link '+target);}}
const report=readFileSync('../G02A-0-tests-final.log','utf8');
if(!/tests 35/.test(report)||!/pass 35/.test(report)||!/fail 0/.test(report))throw Error('Final test evidence incomplete');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const lock=readFileSync('pnpm-lock.yaml');
const evidence={schema:'guardian-lab-evidence/1',nx1Version:'1.3',repository:'daniroc/nx1-guardian',head:'UNBORN',branch:'main',
  result:'LOCAL_CORE_PASS_PENDING_INDEPENDENT_REVIEW',tests:{executed:35,passed:35,failed:0,skipped:0},
  commands:['pnpm install --offline --ignore-scripts','pnpm run typecheck','pnpm run lint','pnpm run build','pnpm test'],
  runtime:{node:process.version,sqlite:process.versions.sqlite,openssl:process.versions.openssl,v8:process.versions.v8},
  lockSha256:sha(lock),files:files.filter(f=>!f.endsWith('docs'+join('/','evidence.json'))).map(f=>({path:f.slice(root.length+1).replaceAll('\\','/'),sha256:sha(readFileSync(f))})),
  logs:['typecheck','lint','build','tests-final'].map(n=>({path:'../G02A-0-'+n+'.log',sha256:sha(readFileSync('../G02A-0-'+n+'.log'))})),
  coverage:'A01-A27/T01-T21/C01-C10 explicitly classified; infrastructure/release controls remain gaps',remoteWrites:0,
  realProviderRequests:0,productionCredentialUse:0,hostileExecutions:0,autonomousAgentCommunication:0,
  assurance:'Source/command and synthetic observer evidence only; no packet capture, external review or production security pass'};
// evidence.json cannot hash itself; exclude its previous content on regeneration.
evidence.files=evidence.files.filter(f=>f.path!=='docs/evidence.json');
writeFileSync('docs/evidence.json',JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({documentation:'PASS',matrixRows:58,sourceFiles:evidence.files.length,tests:evidence.tests,lockSha256:evidence.lockSha256}));
