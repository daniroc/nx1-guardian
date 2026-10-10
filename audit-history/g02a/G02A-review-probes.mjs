import {mkdirSync,mkdtempSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {generateKeyPairSync} from 'node:crypto';
import {Guardian,Store,FileWitness,FixedFakeProvider,canonical,signed,digest,authenticated} from './nx1-guardian/dist/src/index.js';
const root=resolve(import.meta.dirname,'nx1-guardian');mkdirSync(join(root,'.lab-tests'),{recursive:true});
const shared=Object.fromEntries(['codex','chatgpt','admin1','admin2','witness'].map(id=>[id,generateKeyPairSync('ed25519')]));
const approvals=c=>['admin1','admin2'].map(actor=>({actor,signature:signed(c,shared[actor].privateKey)}));
function setup(project='A',open=true){
  const dir=mkdtempSync(join(root,'.lab-tests','review-')),db=join(dir,'ledger.sqlite');
  const witness=new FileWitness(join(dir,'witness.sqlite'),shared.witness.privateKey,shared.witness.publicKey);
  const policy={nx1Version:'1.3',epoch:1,expires:999999,agents:['codex','chatgpt'],operation:'fixture.read',project,repository:'synthetic:'+project,branch:'main',scope:'fixture:item'};
  const identities=['codex','chatgpt','admin1','admin2'].map(id=>({id,role:id.startsWith('admin')?'administrator':'agent',publicKey:shared[id].publicKey,expires:999999,revoked:false}));
  const store=new Store(db,witness),guardian=new Guardian(store,identities,()=>1000,policy,approvals({purpose:'BOOTSTRAP',policy}));
  const cmd=(action,id='admin-'+action)=>({nx1Version:'1.3',kind:'administration',audience:'guardian-lab-admin',action,id,session:'root',epoch:store.inspect(1000).epoch,issued:1000,expires:2000});
  if(open){const c=cmd('open');guardian.administer(canonical(c),approvals(c));}
  const request={nx1Version:'1.3',kind:'proposal',audience:'guardian-lab',actor:'codex',id:'effect-1',session:'root',parent:null,nonce:'a'.repeat(32),issued:1000,expires:2000,policyDigest:digest(policy),policyEpoch:1,emergencyEpoch:0,...{project,repository:policy.repository,branch:'main',scope:policy.scope},operation:'fixture.read',budget:{iterations:1,admissions:1,tokens:512,cost:25},text:'inert-review-fixture'};
  const admitted=()=>{const d=guardian.admit(canonical({request,signature:signed(request,shared.codex.privateKey)}));if(d.decision!=='ALLOW')throw Error(d.reason);return d.grant;};
  const proof=g=>({actor:'codex',signature:signed({purpose:'USE_GRANT',grant:g},shared.codex.privateKey)});
  return{dir,db,witness,store,guardian,policy,identities,cmd,admitted,proof};
}
function barrierProvider(){let release;const p={attempted:0,completed:0,signal:null,start(_g,signal){p.attempted++;p.signal=signal;return{next:()=>new Promise(r=>{release=()=>{p.completed++;r({done:true,bytes:new Uint8Array(1)});};})};},cancel(){return false;},revoke(){return false;},release(){release();}};return p;}
const findings=[];
{
  const f=setup(),g=f.admitted(),p=barrierProvider();const running=f.guardian.dispatch(g,f.proof(g),p);
  const before=f.store.inspect(1000).sessions.root.operations[g.execution].status;
  const attack=await f.guardian.dispatch(g,{actor:'chatgpt',signature:signed({purpose:'USE_GRANT',grant:g},shared.chatgpt.privateKey)},new FixedFakeProvider());
  const state=f.store.inspect(1000);const stop=f.cmd('stop');const durable=f.guardian.administer(canonical(stop),approvals(stop));
  const enforced=f.guardian.confirmStop(new FixedFakeProvider());
  const beforeRelease={actualActive:p.attempted===1&&p.completed===0,signalAborted:p.signal.aborted};
  p.release();const legitimate=await running;
  findings.push({id:'F01',priority:'P1',invariant:'Unauthenticated dispatch must not modify another active execution or remove its controller',expectedSecurityInvariantPassed:false,before,attack,after:state.sessions.root.operations[g.execution].status,terminal:state.sessions.root.terminal,durable,enforced,beforeRelease,legitimate,actualCompleted:p.completed});f.store.close();
}
{
  const f=setup(),g=f.admitted(),p=barrierProvider();const running=f.guardian.dispatch(g,f.proof(g),p);
  const secondStore=new Store(f.db,f.witness),second=new Guardian(secondStore,f.identities,()=>1000,f.policy,approvals({purpose:'BOOTSTRAP',policy:f.policy}));
  const stop=f.cmd('stop');const durable=second.administer(canonical(stop),approvals(stop));
  const enforced=second.confirmStop(new FixedFakeProvider());const pending=f.store.inspect(1000).sessions.root.operations[g.execution].status;
  const originalStillActive=p.attempted===1&&p.completed===0,signalAborted=p.signal.aborted;
  p.release();const outcome=await running;
  findings.push({id:'F02',priority:'P1',invariant:'STOP_ENFORCED must not be returned while another worker has an unconfirmed live effect',expectedSecurityInvariantPassed:false,durable,enforced,pending,originalStillActive,signalAborted,outcome,completedAfterEnforced:p.completed});secondStore.close();f.store.close();
}
{
  const a=setup('A',false),b=setup('B',false),c=a.cmd('open','captured-open-A');const proof=approvals(c);
  const authorizedA=a.guardian.administer(canonical(c),proof),replayedB=b.guardian.administer(canonical(c),proof);
  const g=b.admitted(),p=new FixedFakeProvider();const effect=await b.guardian.dispatch(g,b.proof(g),p);
  for(const f of [a,b]){const stop=f.cmd('stop','stop-'+f.policy.project);f.guardian.administer(canonical(stop),approvals(stop));}
  const recovery=a.cmd('recover','captured-recovery-A'),recoveryProof=approvals(recovery);
  const recoveredA=a.guardian.administer(canonical(recovery),recoveryProof),recoveredB=b.guardian.administer(canonical(recovery),recoveryProof);
  findings.push({id:'F03',priority:'P1',invariant:'External approval must bind the specific project/repository/policy/service instance',expectedSecurityInvariantPassed:false,authorizedA,replayedB,policyDigestsDiffer:digest(a.policy)!==digest(b.policy),effectB:effect,completedB:p.completed,recoveredA,recoveredB,lockedB:b.store.inspect(1000).locked,requestSignedFields:Object.keys(c).sort()});a.store.close();b.store.close();
}
{
  const f=setup(),value={purpose:'CANONICAL_SIGNATURE_PROBE'},original=signed(value,shared.codex.privateKey);const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const last=alphabet.indexOf(original.at(-1)),noncanonical=original.slice(0,-1)+alphabet[last+1];
  const accepted=authenticated(value,noncanonical,shared.codex.publicKey);
  findings.push({id:'F04',priority:'P2',invariant:'Reject noncanonical base64url signature representation',expectedSecurityInvariantPassed:!accepted,accepted,identicalDecodedBytes:Buffer.from(original,'base64url').equals(Buffer.from(noncanonical,'base64url'))});f.store.close();
}
writeFileSync(resolve(import.meta.dirname,'G02A-review-probe-results.json'),JSON.stringify({inert:true,networkCalls:0,realCredentials:0,checks:findings.length,securityInvariantFailures:findings.filter(f=>!f.expectedSecurityInvariantPassed).length,findings},null,2));
console.log(JSON.stringify(findings,null,2));
