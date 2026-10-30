/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/require-await, @typescript-eslint/no-empty-function, no-return-assign */
import { expect } from '@open-wc/testing';
import { type LiveFrame, LiveTransport, LiveWindow } from './live';

const frame = (points: LiveFrame['points'], from = 0): LiveFrame => ({ points, from, until: from + 10000, server_time: Date.now(), expires_at: Date.now()+60000, resolution_seconds: 1, metric: 'hits' });
const sleep = (ms = 20) => new Promise(resolve => setTimeout(resolve,ms));
class MockSource extends EventTarget {
  static sources: MockSource[] = [];
  onopen?: () => void; onerror?: () => void; closed = false;
  url: string;
  constructor(url: string) { super(); this.url = url; MockSource.sources.push(this); }
  close() { this.closed = true; }
  send(event: string, data: unknown) { this.dispatchEvent(new MessageEvent(event,{data: JSON.stringify(data)})); }
}

describe('chart live window', () => {
  it('replaces duplicate buckets, sorts, prunes, and reconnect snapshots clear old values', () => {
    const w = new LiveWindow();
    w.apply(frame([{at:1000,value:1},{at:2000,value:2}]),true);
    w.apply(frame([{at:3000,value:0},{at:2000,value:5}],2000),false);
    const data = w.series()[0].data;
    expect(data.map(p=>p.value)).to.deep.equal([[2000,5],[3000,0]]);
    expect(w.series(true)[0].data[1].value).to.deep.equal([3000,null]);
    expect(w.series()[0].data[1].value).to.deep.equal([3000,0]);
    w.apply(frame([{at:5000,value:8}],2000),true);
    expect(w.series()[0].data.length).to.equal(1);
  });
  it('preserves optional ranges across deltas and clears stale ranges on a snapshot', () => {
    const w = new LiveWindow(); const f=frame([{at:1000,value:8}]);
    f.prediction={status:'ready',average_rates:true,points:[{at:0,expected:2,lower:-1,upper:5,available:true}]};
    w.apply(f,true); w.apply(frame([{at:2000,value:9}]),false);
    expect(w.series().length).to.equal(3);
    expect(w.series()[1].name).to.include('average rate');
    expect(w.series()[0].stackStrategy).to.equal('all');
    w.apply(frame([]),true); expect(w.series().length).to.equal(1);
  });
  it('advances the viewport on heartbeats without inventing readings', () => {
    const w = new LiveWindow(); const f = frame([{at:1000,value:1},{at:3000,value:2}]);
    w.apply(f,true);w.advance(f.server_time+2500);
    expect(w.frame!.from).to.equal(2500);
    expect(w.series()[0].data.map(p=>p.value)).to.deep.equal([[3000,2]]);
  });
  it('rejects invalid frames and resolution changes in a delta', () => {
    const w=new LiveWindow();
    expect(()=>w.apply({},true)).to.throw();
    w.apply(frame([]),true);
    expect(()=>w.apply({...frame([]),resolution_seconds:60},false)).to.throw();
    expect(()=>w.apply(frame([{at:1,value:NaN}]),false)).to.throw();
  });
});

describe('chart SSE transport', () => {
  const originalSource=window.EventSource; const originalFetch=window.fetch;
  beforeEach(()=>{MockSource.sources=[]; window.EventSource=MockSource as unknown as typeof EventSource;});
  afterEach(()=>{window.EventSource=originalSource;window.fetch=originalFetch;});
  it('opens a renewed URL and closes connections on disconnect', async()=>{
    let requests=0; const events: boolean[]=[];
    window.fetch=async (_url,options)=>{
      requests++; expect(options?.credentials).to.equal('same-origin');expect(options?.redirect).to.equal('error');
      return new Response(JSON.stringify({stream_url:'https://relay.example/events',expires_at:Date.now()+60000,server_time:Date.now()}));
    };
    const t=new LiveTransport((_data,snapshot)=>events.push(snapshot),()=>{});
    t.start('', '/grant'); await sleep();
    expect(requests).to.equal(1); expect(MockSource.sources.length).to.equal(1);
    const source=MockSource.sources[0];source.send('snapshot',frame([]));source.send('delta',frame([]));
    expect(events).to.deep.equal([true,false]);
    t.stop();expect(source.closed).to.equal(true);
  });
  it('stops at the grant deadline without a renewal route',async()=>{
    const statuses: string[]=[]; const t=new LiveTransport(()=>{},s=>statuses.push(s));
    t.start('https://relay.example/events',''); const source=MockSource.sources[0];
    source.send('heartbeat',{server_time:1000,expires_at:1025}); await sleep(50);
    expect(source.closed).to.equal(true);expect(statuses).to.include('expired');t.stop();
  });
  it('rejects cross-origin renewal and stops immediately on an authentication failure',async()=>{
    const statuses: string[]=[];const t=new LiveTransport(()=>{},s=>statuses.push(s));
    t.start('','https://evil.example/grant');expect(statuses).to.include('denied');expect(MockSource.sources.length).to.equal(0);
    window.fetch=async ()=>new Response('',{status:403});t.start('','/grant');await sleep();
    expect(statuses.filter(s=>s==='denied').length).to.equal(2);t.stop();
  });
  it('ignores an outstanding renewal response after stopping',async()=>{
    let resolve!: (r:Response)=>void;
    window.fetch=()=>new Promise(r=>resolve=r);
    const t=new LiveTransport(()=>{},()=>{});t.start('','/grant');t.stop();
    resolve(new Response(JSON.stringify({stream_url:'https://relay.example/events',expires_at:Date.now()+60000,server_time:Date.now()})));await sleep();
    expect(MockSource.sources.length).to.equal(0);
  });
  it('does not overlap renewals while heartbeats arrive',async()=>{
    let count=0;let resolve!: (r:Response)=>void;
    window.fetch=()=>{count++;return new Promise(r=>resolve=r);};
    const t=new LiveTransport(()=>{},()=>{});t.start('https://relay.example/events','/grant');
    const source=MockSource.sources[0];source.send('heartbeat',{server_time:1000,expires_at:11000});await sleep();
    source.send('heartbeat',{server_time:2000,expires_at:11000});await sleep();expect(count).to.equal(1);
    t.stop();resolve(new Response('{}'));await sleep();
  });
});
