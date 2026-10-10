import type { FakeProvider, FakeEffect } from './guardian.js';
import type { Grant } from './contracts.js';
export type FixtureMode = 'normal' | 'stall' | 'oversize' | 'uncertain' | 'ignored-cancellation' | 'too-many-chunks';
export class FixedFakeProvider implements FakeProvider {
  attempted=0;completed=0;tokens=0;cost=0;cancelled=false;revoked=false;
  constructor(private readonly mode:FixtureMode='normal'){}
  start(_grant:Grant,signal:AbortSignal):FakeEffect {
    if(this.revoked || signal.aborted)throw Error('FAKE_REVOKED');
    this.attempted++;this.tokens+=512;this.cost+=25;let chunks=0;
    return {next:async()=>{
      if(this.mode==='stall')return new Promise(()=>{});
      if(this.mode==='uncertain'){this.completed++;throw Error('FAKE_RECEIPT_LOST');}
      if(this.mode==='ignored-cancellation')return new Promise(()=>{});
      if(this.mode==='oversize'){this.completed++;return {done:true,bytes:new Uint8Array(4097)};}
      if(this.mode==='too-many-chunks')return {done:false,bytes:new Uint8Array(++chunks)};
      if(signal.aborted)throw Error('FAKE_CANCELLED');this.completed++;
      return {done:true,bytes:new TextEncoder().encode('synthetic-read')};
    }};
  }
  cancel():boolean {this.cancelled=true;return this.mode!=='ignored-cancellation';}
  revoke():boolean {this.revoked=true;return true;}
}
