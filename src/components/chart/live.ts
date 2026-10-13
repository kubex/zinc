import type { SeriesItem } from './builders';

export interface LivePoint { at: number; value: number | null }
export interface LivePrediction {
  status: string; average_rates?: boolean;
  points: { at: number; expected: number; lower: number; upper: number; available: boolean }[];
}
export interface LiveFrame {
  from: number; until: number; server_time: number; expires_at: number;
  resolution_seconds: number; metric: string; points: LivePoint[]; prediction?: LivePrediction;
}
export interface LiveGrant { stream_url: string; expires_at: number; server_time: number }

const finite = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

/** Authoritative bucket replacement, never increment counts on delivery/reconnect. */
export class LiveWindow {
  frame?: LiveFrame;
  private points = new Map<number, number | null>();
  private prediction?: LivePrediction;

  apply(value: unknown, snapshot: boolean): LiveFrame {
    const f = value as LiveFrame;
    if (!f || !finite(f.from) || !finite(f.until) || f.until <= f.from || !finite(f.server_time) ||
        !finite(f.expires_at) || !finite(f.resolution_seconds) || f.resolution_seconds <= 0 ||
        !['hits', 'sum', 'average'].includes(f.metric) || !Array.isArray(f.points) || f.points.length > 10000 ||
        f.points.some(p => !p || !finite(p.at) || !(p.value === null || finite(p.value)))) throw new Error('Invalid chart frame');
    if (!snapshot && (!this.frame || this.frame.resolution_seconds !== f.resolution_seconds || this.frame.metric !== f.metric)) throw new Error('Snapshot required');
    if (f.prediction && (!Array.isArray(f.prediction.points) || f.prediction.points.length > 10000 ||
        f.prediction.points.some(p => !p || !finite(p.at) || !finite(p.lower) || !finite(p.upper) || !finite(p.expected) || p.upper < p.lower))) throw new Error('Invalid prediction');
    if (snapshot) { this.points.clear(); this.prediction = f.prediction; }
    else if (f.prediction) this.prediction = f.prediction;
    const start = Math.floor(f.from / (f.resolution_seconds * 1000)) * f.resolution_seconds * 1000;
    for (const p of f.points) if (p.at >= start && p.at < f.until) this.points.set(p.at, p.value);
    for (const at of this.points.keys()) if (at < start || at >= f.until) this.points.delete(at);
    // Never keep an unbounded history, including malformed streams with many timestamps.
    if (this.points.size > 10000) {
      const ordered = [...this.points.keys()].sort((a, b) => a - b);
      for (const at of ordered.slice(0, ordered.length - 10000)) this.points.delete(at);
    }
    this.frame = f;
    return f;
  }

  advance(serverTime: number) {
    if (!this.frame || !finite(serverTime) || serverTime <= this.frame.server_time) return;
    const delta = serverTime - this.frame.server_time;
    this.frame = { ...this.frame, server_time: serverTime, from: this.frame.from + delta, until: this.frame.until + delta };
    const start = Math.floor(this.frame.from / (this.frame.resolution_seconds * 1000)) * this.frame.resolution_seconds * 1000;
    for (const at of this.points.keys()) if (at < start) this.points.delete(at);
  }

  get predictionStatus() { return this.prediction?.status ?? 'unavailable'; }

  series(hideZero = false): SeriesItem[] {
    const points = [...this.points].sort((a,b) => a[0]-b[0]);
    const series: SeriesItem[] = [];
    if (this.prediction && this.frame) {
      const ps = this.prediction.points.filter(p => p.at < this.frame!.until && p.at >= this.frame!.from - 86400000);
      const name = this.prediction.average_rates ? 'Expected range (average rate)' : 'Expected range';
      const data = (pick: (p: typeof ps[number]) => number) => ps.map(p => ({ name: String(p.at), value: [p.at, p.available ? pick(p) : null] }));
      if (ps.some(p => p.available)) {
        series.push({ id: 'live-range-base', animation: false, name: '_range_base', data: data(p => p.lower), stack: 'expected', stackStrategy: 'all', symbol: 'none', silent: true,
          lineStyle: { opacity: 0 }, areaStyle: { opacity: 0 }, z: 1 });
        series.push({ id: 'live-range', animation: false, name, data: data(p => p.upper - p.lower), stack: 'expected', stackStrategy: 'all', symbol: 'none', silent: true,
          color: '#93c5fd', lineStyle: { opacity: 0 }, areaStyle: { opacity: 0.3 }, z: 1 });
      }
    }
    series.push({ id: 'live-values', animation: false, name: this.frame?.metric ?? 'Values', data: points.map(([at, value]) => ({ name: String(at), value: [at, hideZero && value === 0 ? null : value] })), symbol: 'none', z: 3 });
    return series;
  }
}

/** One transport per chart. Grants renew only through a same-origin login gate. */
export class LiveTransport {
  private source?: EventSource;
  private timer?: ReturnType<typeof setTimeout>;
  private expiryTimer?: ReturnType<typeof setTimeout>;
  private abort?: AbortController;
  private stopped = true;
  private generation = 0;
  private retry = 0;
  private renewing = false;
  private readonly frame: (data: unknown, snapshot: boolean) => void;
  private readonly status: (status: string) => void;
  private readonly heartbeat?: (serverTime: number) => void;
  constructor(frame: (data: unknown, snapshot: boolean) => void, status: (status: string) => void,
              heartbeat?: (serverTime: number) => void) {
    this.frame = frame; this.status = status; this.heartbeat = heartbeat;
  }

  start(streamURL: string, renewURL: string) {
    this.stop(); this.stopped = false;
    const generation = this.generation;
    if (streamURL) {
      this.deadline(Date.now() + 60000, Date.now(), renewURL, generation);
      this.connect(streamURL, renewURL, generation);
    }
    else if (renewURL) void this.renew(renewURL, generation);
  }
  stop() {
    this.stopped = true; this.generation++;
    this.source?.close(); this.source = undefined;
    clearTimeout(this.timer); clearTimeout(this.expiryTimer); this.abort?.abort();
    this.retry = 0; this.renewing = false;
  }
  private active(generation: number) { return !this.stopped && generation === this.generation; }
  private deadline(expires: number, serverTime: number, renewURL: string, generation: number) {
    if (!finite(expires) || !finite(serverTime)) throw new Error('Invalid grant expiry');
    const remaining = expires - serverTime;
    clearTimeout(this.expiryTimer); clearTimeout(this.timer);
    this.expiryTimer = setTimeout(() => {
      if (!this.active(generation)) return;
      this.source?.close(); this.source = undefined; this.status('expired');
    }, Math.max(0, remaining));
    if (renewURL && !this.renewing) this.timer = setTimeout(() => void this.renew(renewURL, generation), Math.max(0, remaining - 10000));
  }
  private connect(streamURL: string, renewURL: string, generation: number) {
    const url = new URL(streamURL, location.href);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid stream URL');
    this.source?.close();
    const source = new EventSource(url.href); // No cross-origin cookies or app credentials.
    this.source = source;
    this.status('connecting');
    source.onopen = () => { if (this.active(generation)) this.status('connected'); };
    for (const event of ['snapshot', 'delta', 'heartbeat']) source.addEventListener(event, (message: MessageEvent<string>) => {
      if (!this.active(generation) || this.source !== source) return;
      try {
        const f = JSON.parse(message.data) as LiveFrame;
        if (event !== 'heartbeat') this.frame(f, event === 'snapshot');
        else this.heartbeat?.(f.server_time);
        this.deadline(f.expires_at, f.server_time, renewURL, generation);
        this.status('connected');
      } catch { this.stop(); this.status('invalid'); }
    });
    source.onerror = () => { if (this.active(generation) && this.source === source) this.status('reconnecting'); };
  }
  private async renew(renewURL: string, generation: number) {
    if (!this.active(generation) || this.renewing) return;
    const url = new URL(renewURL, location.href);
    if (url.origin !== location.origin || url.username || url.password) { this.stop(); this.status('denied'); return; }
    this.renewing = true;
    const controller = new AbortController(); this.abort = controller;
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url.href, { credentials: 'same-origin', redirect: 'error', cache: 'no-store', signal: controller.signal, headers: { Accept: 'application/json', 'x-kx-fetch-style': 'raw-json' } });
      if (!this.active(generation)) return;
      if ([401,403].includes(response.status)) { this.stop(); this.status('denied'); return; }
      if (!response.ok) throw new Error('Grant unavailable');
      const grant = await response.json() as LiveGrant;
      if (!this.active(generation)) return;
      if (!finite(grant.expires_at) || !finite(grant.server_time) || grant.expires_at <= grant.server_time || typeof grant.stream_url !== 'string') throw new Error('Invalid grant');
      this.renewing = false;
      this.deadline(grant.expires_at, grant.server_time, renewURL, generation);
      this.connect(grant.stream_url, renewURL, generation); this.retry = 0;
    } catch {
      if (this.active(generation)) {
        if (this.retry >= 4) { this.stop(); this.status('unavailable'); return; }
        this.status('reconnecting');
        this.timer = setTimeout(() => void this.renew(renewURL, generation), Math.min(10000, 1000 * 2 ** Math.min(this.retry++, 4)));
      }
    } finally { clearTimeout(timeout); if (this.active(generation)) this.renewing = false; }
  }
}
