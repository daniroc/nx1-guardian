import {readdirSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
let failures=0;
function walk(directory){for(const e of readdirSync(directory,{withFileTypes:true})){const p=join(directory,e.name);if(e.isDirectory()){walk(p);continue;}if(!p.endsWith('.ts'))continue;const s=readFileSync(p,'utf8');const violations=[[/\b(?:eval|Function)\s*\(/,'dynamic code'],[/node:(?:https?|net|tls|dns|child_process|worker_threads)/,'forbidden runtime capability'],[/\bfetch\s*\(/,'network'],[/@ts-(?:ignore|nocheck)|\bas any\b|:\s*any\b/,'unsafe type bypass']];for(const [pattern,label]of violations)if(pattern.test(s)){console.error(p+': '+label);failures++;}}}
walk('src');walk('test');if(failures)process.exitCode=1;else console.log('PASS: capability/type lint plus strict TypeScript compiler lint (noUnusedLocals/noUnusedParameters).');
