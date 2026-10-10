import {readFileSync,readdirSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,join,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const root=resolve(import.meta.dirname,'nx1-guardian');const phase=process.argv[2]??'before';
const sha=x=>createHash('sha256').update(x).digest('hex');const files=[];
function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules','.lab-tests','dist'].includes(e.name))continue;const p=join(dir,e.name);if(e.isDirectory())walk(p);else files.push({path:relative(root,p).replaceAll('\\','/'),sha256:sha(readFileSync(p))});}}
walk(root);files.sort((a,b)=>a.path.localeCompare(b.path,'en'));
const evidence=JSON.parse(readFileSync(join(root,'docs/evidence.json'),'utf8'));
const hashMatches=evidence.files.map(f=>({path:f.path,match:files.find(x=>x.path===f.path)?.sha256===f.sha256}));
const req=createRequire(join(root,'package.json')),ts=req('typescript');
const configFile=ts.readConfigFile(join(root,'tsconfig.json'),ts.sys.readFile);
const config=ts.parseJsonConfigFileContent(configFile.config,ts.sys,root);
const program=ts.createProgram(config.fileNames,config.options);const parity=[];
program.emit(undefined,(filename,text)=>parity.push({path:relative(root,filename).replaceAll('\\','/'),matches:existsSync(filename)&&readFileSync(filename,'utf8')===text,sha256:sha(text)}));
const metadata={head:'UNBORN',gitTree:'UNAVAILABLE_NO_COMMIT',branch:'main',fileCount:files.length,artifactManifestSha256:sha(JSON.stringify(files)),files,
  priorEvidenceHashesMatch:hashMatches.every(x=>x.match),hashMatches,sourceDistParity:parity,sourceDistParityPass:parity.every(x=>x.matches),
  dependencies:['typescript','@types/node','undici-types'].map(name=>{const p=name==='undici-types'?join(root,'node_modules/.pnpm/undici-types@8.3.0/node_modules/undici-types/package.json'):req.resolve(name+'/package.json');const j=JSON.parse(readFileSync(p,'utf8'));return{name,version:j.version,manifestSha256:sha(readFileSync(p))};})};
if(phase==='after'){const before=JSON.parse(readFileSync(join(import.meta.dirname,'G02A-review-baseline-before.json'),'utf8'));metadata.preserved=before.artifactManifestSha256===metadata.artifactManifestSha256&&JSON.stringify(before.sourceDistParity)===JSON.stringify(metadata.sourceDistParity);}
writeFileSync(join(import.meta.dirname,'G02A-review-baseline-'+phase+'.json'),JSON.stringify(metadata,null,2));
console.log(JSON.stringify({...metadata,files:undefined,hashMatches:undefined,sourceDistParity:undefined}));
