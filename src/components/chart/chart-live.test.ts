/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
class Source extends EventTarget {
  static instances: Source[]=[]; closed=false; onopen?:()=>void; onerror?:()=>void;
  url: string;
  constructor(url: string) { super(); this.url = url;Source.instances.push(this); }
  close() {this.closed=true;}
  send(event:string,frame:unknown) {this.dispatchEvent(new MessageEvent(event,{data:JSON.stringify(frame)}));}
}
const pause=()=>new Promise(r=>setTimeout(r,50));

describe('chart SSE component',()=>{
  const original=window.EventSource;
  beforeEach(()=>{Source.instances=[];window.EventSource=Source as unknown as typeof EventSource;});
  afterEach(()=>{window.EventSource=original;});
  it('renders SSE buckets and expected bands, reacts to display changes, and stops when removed',async()=>{
    const el:any=await fixture(html`<zn-chart type="line" xaxis="datetime" enable-animations="350" live stream-url="https://relay.example/events"></zn-chart>`);
    await el.updateComplete;await pause();
    const source=Source.instances.at(-1)!;
    expect(source).to.exist;
    const f={from:0,until:10000,server_time:Date.now(),expires_at:Date.now()+60000,resolution_seconds:1,metric:'hits',points:[{at:1000,value:0},{at:2000,value:2}],prediction:{status:'ready',points:[{at:0,lower:1,upper:5,expected:3,available:true}]}};
    source.send('snapshot',f);await el.updateComplete;
    expect(el.chart.getOption().series.length).to.equal(3);
    expect(el.chart.getOption().series[2].data.map((p:any)=>p.value)).to.deep.equal([[1000,0],[2000,2]]);
    const valueModel = el.chart.getModel().getSeriesByIndex(2);
    const axisModel = el.chart.getModel().getComponent('xAxis',0);
    expect(valueModel.get('animation')).to.equal(true);
    expect(valueModel.get('animationDuration')).to.equal(0);
    expect(valueModel.get('animationDurationUpdate')).to.equal(350);
    expect(valueModel.get('animationThreshold')).to.equal(10000);
    const rangeModel = el.chart.getModel().getSeriesByIndex(1);
    const rangeData = rangeModel.option.data;
    expect(rangeModel.id).to.equal('live-range');
    expect(rangeModel.get('animation')).to.equal(true);
    expect(rangeModel.get('animationDuration')).to.equal(0);
    el.hideZero=true;await el.updateComplete;await el.updateComplete;
    expect(el.chart.getOption().series[2].data[0].value[1]).to.equal(null);
    source.send('delta',{...f,prediction:undefined,points:[{at:2000,value:7}]});await el.updateComplete;
    expect(el.chart.getOption().series[2].data[1].value[1]).to.equal(7);
    expect(el.chart.getViewOfSeriesModel(valueModel)._polyline.animators.length).to.be.greaterThan(0);
    const sameAxis = el.chart.getModel().getComponent('xAxis',0) === axisModel;
    const sameValues = el.chart.getModel().getSeriesByIndex(2) === valueModel;
    expect(sameAxis).to.equal(true);
    expect(sameValues).to.equal(true);
    const sameModel = el.chart.getModel().getSeriesByIndex(1) === rangeModel;
    expect(sameModel).to.equal(true);
    const sameSource = el.chart.getModel().getSeriesByIndex(1).option.data === rangeData;
    expect(sameSource).to.equal(true);
    source.send('heartbeat',{server_time:f.server_time+1000,expires_at:f.expires_at});await el.updateComplete;
    const sameHeartbeatSource = el.chart.getModel().getSeriesByIndex(1).option.data === rangeData;
    expect(sameHeartbeatSource).to.equal(true);
    source.send('snapshot',{...f,prediction:undefined,points:[]});await el.updateComplete;
    expect(el.chart.getModel().getSeries().length).to.equal(1);
    el.remove();expect(source.closed).to.equal(true);
  });
  it('keeps transitions enabled for a high-volume hour', async()=>{
    const el:any=await fixture(html`<zn-chart type="line" xaxis="datetime" enable-animations="350" live stream-url="https://relay.example/hour"></zn-chart>`);
    await el.updateComplete;await pause();
    Source.instances.at(-1)!.send('snapshot',{
      from:0,until:3600000,server_time:Date.now(),expires_at:Date.now()+60000,resolution_seconds:1,metric:'average',
      points:Array.from({length:3600},(_,i)=>({at:i*1000,value:10+i%3})),
    });
    await el.updateComplete;
    const model=el.chart.getModel().getSeriesByIndex(0);
    expect(model.getData().count()).to.equal(3600);
    expect(model.isAnimationEnabled()).to.equal(true);
    expect(model.get('animationDuration')).to.equal(0);
    el.remove();
  });
  it('restarts transport when its URL changes and when reattached',async()=>{
    const el:any=await fixture(html`<zn-chart type="line" live stream-url="https://relay.example/a"></zn-chart>`);
    await el.updateComplete;await pause();
    const old=Source.instances.at(-1)!;
    el.streamUrl='https://relay.example/b';await el.updateComplete;
    expect(old.closed).to.equal(true);expect(Source.instances.at(-1)!.url).to.include('/b');
    const parent=el.parentElement;el.remove();parent.append(el);await el.updateComplete;await pause();
    expect(Source.instances.at(-1)!.closed).to.equal(false);el.remove();
  });
});
