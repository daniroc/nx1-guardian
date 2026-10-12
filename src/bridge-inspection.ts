import { createHash } from 'node:crypto';
import { closed, fail, integer } from './contracts.js';

export type BridgeDirection = 'CODEX_TO_CHATGPT' | 'CHATGPT_TO_CODEX';
export type InspectionDecision = 'ALLOW' | 'SANITIZE' | 'BLOCK' | 'REQUIRE_HUMAN_APPROVAL';
export interface InspectionLimits { maxUtf8Bytes:number;maxCodePoints:number;maxFindings:number }
export interface Finding { kind:string;utf16Index:number|null;codePoint:string|null }
export interface Inspection {
  direction:BridgeDirection;decision:InspectionDecision;dispatchAuthorized:false;requiresHumanApproval:boolean;
  originalEncoding:'UTF16LE';originalHash:string|null;normalizedEncoding:'UTF8';normalizedHash:string|null;
  normalizedCandidate:string|null;findings:Finding[];findingCount:number;
}
export const INSPECTION_LIMITS:Readonly<InspectionLimits>=Object.freeze({maxUtf8Bytes:32768,maxCodePoints:8192,maxFindings:64});
const hash=(value:string,encoding:'utf16le'|'utf8'):string=>createHash('sha256').update(Buffer.from(value,encoding)).digest('hex');

// Pure offline data inspection. ALLOW is never a Guardian capability or permission to send.
export function inspectBridgeText(input:unknown,limits:InspectionLimits=INSPECTION_LIMITS):Inspection {
  closed(input,['direction','text']);
  if(input.direction!=='CODEX_TO_CHATGPT' && input.direction!=='CHATGPT_TO_CODEX' || typeof input.text!=='string')fail('SCHEMA_INVALID');
  closed(limits,['maxUtf8Bytes','maxCodePoints','maxFindings']);
  for(const value of Object.values(limits))integer(value);
  if(limits.maxUtf8Bytes<1 || limits.maxUtf8Bytes>65536 || limits.maxCodePoints<1 || limits.maxCodePoints>32768 || limits.maxFindings<1 || limits.maxFindings>128)fail('SCHEMA_INVALID');
  const direction=input.direction,text=input.text;
  const blockedLimit=():Inspection=>({direction,decision:'BLOCK',dispatchAuthorized:false,requiresHumanApproval:false,originalEncoding:'UTF16LE',originalHash:null,normalizedEncoding:'UTF8',normalizedHash:null,normalizedCandidate:null,findings:[{kind:'MESSAGE_LIMIT',utf16Index:null,codePoint:null}],findingCount:1});
  // Reject before hashing/normalizing unbounded strings; no false promise of hashing rejected bytes.
  if(text.length>limits.maxUtf8Bytes || text.length>2*limits.maxCodePoints)return blockedLimit();
  if(Buffer.byteLength(text,'utf8')>limits.maxUtf8Bytes || [...text].length>limits.maxCodePoints)return blockedLimit();
  const findings:Finding[]=[];let count=0,block=false,human=false,index=0;
  const add=(kind:string,cp:number|null,at:number|null):void=>{count++;if(findings.length<limits.maxFindings)findings.push({kind,utf16Index:at,codePoint:cp===null?null:'U+'+cp.toString(16).toUpperCase().padStart(4,'0')});};
  for(const char of text){
    const cp=char.codePointAt(0)!;
    if(cp>=0xd800 && cp<=0xdfff){block=true;add('UNPAIRED_SURROGATE',cp,index);}
    else if(cp<=0x1f && ![9,10,13].includes(cp) || cp===0x7f || cp>=0x80 && cp<=0x9f && cp!==0x85){block=true;add('CONTROL_SEQUENCE',cp,index);}
    else if(cp>=0x202a && cp<=0x202e){block=true;add('BIDI_EMBEDDING_OR_OVERRIDE',cp,index);}
    else if([0x61c,0x200e,0x200f,0x85].includes(cp) || cp>=0x2066 && cp<=0x2069){human=true;add('DIRECTIONAL_OR_LAYOUT_CONTROL',cp,index);}
    else if(cp>=0xfe00 && cp<=0xfe0f || cp>=0xe0100 && cp<=0xe01ef){add('VARIATION_SELECTOR_PRESERVED',cp,index);}
    else if(/\p{Default_Ignorable_Code_Point}/u.test(char)){human=true;add('INVISIBLE_OR_ZERO_WIDTH_PRESERVED',cp,index);}
    index+=char.length;
  }
  const normalized=block?null:text.normalize('NFC');
  const changed=normalized!==null && normalized!==text;
  if(changed)add('NFC_REVIEW_CANDIDATE',null,null);
  const decision:InspectionDecision=block?'BLOCK':human?'REQUIRE_HUMAN_APPROVAL':changed?'SANITIZE':'ALLOW';
  return{direction,decision,dispatchAuthorized:false,requiresHumanApproval:decision==='SANITIZE'||decision==='REQUIRE_HUMAN_APPROVAL',originalEncoding:'UTF16LE',originalHash:hash(text,'utf16le'),normalizedEncoding:'UTF8',normalizedHash:normalized===null?null:hash(normalized,'utf8'),normalizedCandidate:normalized,findings,findingCount:count};
}

// No enable flag: the existing Core has no browser-message capability. Fail closed unconditionally.
export function requireBridgeDispatchCapability():never { return fail('OPERATION_DENIED'); }
