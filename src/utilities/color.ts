export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch';

/** Red, green and blue, each 0-255. */
export type Rgb = [number, number, number];

/** Hue 0-360, saturation and value 0-1. */
export type Hsv = [number, number, number];

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const round1 = (n: number) => Math.round(n * 10) / 10;
const round3 = (n: number) => Math.round(n * 1000) / 1000;
const hexPair = (n: number) => Math.round(n).toString(16).padStart(2, '0').toUpperCase();

export function hsvToRgb(h: number, s: number, v: number): Rgb {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [Math.round(f(5) * 255), Math.round(f(3) * 255), Math.round(f(1) * 255)];
}

export function rgbToHsv(r: number, g: number, b: number): Hsv {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, max ? d / max : 0, max];
}

/** Rounded to whole degrees and percentages. */
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  let h = 0;
  if (d) {
    h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

/** Saturation and lightness are percentages. */
export function hslToRgb(h: number, s: number, l: number): Rgb {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

const toLinear = (c: number) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

const toGamma = (c: number) => {
  c = clamp(c, 0, 1);
  return Math.round(255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055));
};

/** Lightness 0-1, chroma (about 0-0.4), hue in degrees. */
export function rgbToOklch(r: number, g: number, b: number): [number, number, number] {
  r = toLinear(r);
  g = toLinear(g);
  b = toLinear(b);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.sqrt(A * A + B * B);
  let H = C < 0.0004 ? 0 : Math.atan2(B, A) * 180 / Math.PI;
  if (H < 0) H += 360;
  return [L, C, H];
}

/** Colours outside sRGB are clamped into it. */
export function oklchToRgb(L: number, C: number, H: number): Rgb {
  const A = C * Math.cos(H * Math.PI / 180);
  const B = C * Math.sin(H * Math.PI / 180);
  const l = Math.pow(L + 0.3963377774 * A + 0.2158037573 * B, 3);
  const m = Math.pow(L - 0.1055613458 * A - 0.0638541728 * B, 3);
  const s = Math.pow(L - 0.0894841775 * A - 1.291485548 * B, 3);
  return [
    toGamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    toGamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    toGamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
  ];
}

/** OKLCH as shown to people: lightness as a percentage to 1dp, chroma to 3dp, hue to 1dp. */
export function oklchParts(rgb: Rgb): [number, number, number] {
  const [l, c, h] = rgbToOklch(...rgb);
  return [round1(l * 100), round3(c), round1(h)];
}

export const toHex = (rgb: Rgb) => `#${hexPair(rgb[0])}${hexPair(rgb[1])}${hexPair(rgb[2])}`;

/** The format a colour is written in, or null for a name, a token or anything that isn't a colour. */
export function detectColorFormat(value: string): ColorFormat | null {
  const str = String(value ?? '').trim();
  // A bare run of digits such as "123456" is ambiguous; only treat it as hex when it can't be anything else.
  if (/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(str) && (str.startsWith('#') || /[a-f]/i.test(str) || str.length === 6)) {
    return 'hex';
  }
  if (/^oklch\(/i.test(str)) return 'oklch';
  if (/^hsla?\(/i.test(str)) return 'hsl';
  if (/^(rgba?\(|\d{1,3}\s*[, ]\s*\d{1,3}\s*[, ]\s*\d{1,3}$)/i.test(str)) return 'rgb';
  return null;
}

let probe: HTMLSpanElement | null = null;

/** Any CSS colour (hex, rgb(), hsl(), oklch(), a name or var(--token)) as RGB, or null when it isn't one. */
export function parseColor(value: string): Rgb | null {
  const str = String(value ?? '').trim();
  if (!str) return null;

  let m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(str);
  if (m) {
    const hex = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1];
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  }

  m = /^(?:rgb\()?\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*\)?$/i.exec(str);
  if (m && +m[1] < 256 && +m[2] < 256 && +m[3] < 256) return [+m[1], +m[2], +m[3]];

  m = /^hsl\(\s*(\d{1,3})(?:deg)?\s*[, ]\s*(\d{1,3})%?\s*[, ]\s*(\d{1,3})%?\s*\)$/i.exec(str);
  if (m && +m[1] <= 360 && +m[2] <= 100 && +m[3] <= 100) return hslToRgb(+m[1] % 360, +m[2], +m[3]);

  m = /^oklch\(\s*([\d.]+)(%?)\s*[, ]\s*([\d.]+)(%?)\s*[, ]\s*([\d.]+)(?:deg)?\s*(?:\/\s*[\d.]+%?\s*)?\)$/i.exec(str);
  if (m) {
    const l = +m[1] / (m[2] ? 100 : 1);
    const c = +m[3] * (m[4] ? 0.004 : 1);
    const h = +m[5];
    if (isNaN(l + c + h) || l > 1 || c > 0.5 || h > 360) return null;
    return oklchToRgb(l, c, h % 360);
  }

  if (!/^[a-z-]+$|^var\(|^(rgb|hsl)a?\(/i.test(str) || typeof document === 'undefined') return null;

  // Let the browser resolve names, tokens and other CSS syntax.
  if (!probe) {
    probe = document.createElement('span');
    probe.style.display = 'none';
    document.body.appendChild(probe);
  }
  probe.style.color = '';
  probe.style.color = str;
  if (!probe.style.color) return null;
  const k = /rgba?\(\s*(\d+)[, ]+(\d+)[, ]+(\d+)/.exec(getComputedStyle(probe).color);
  return k ? [+k[1], +k[2], +k[3]] : null;
}

/** Writes a colour out in the given format, e.g. `#085EFD`, `rgb(8, 94, 253)`, `hsl(219, 98%, 51%)` or `oklch(58.4% 0.226 262.5)`. */
export function formatColor(rgb: Rgb, format: ColorFormat): string {
  switch (format) {
    case 'rgb':
      return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    case 'hsl': {
      const [h, s, l] = rgbToHsl(...rgb);
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
    case 'oklch': {
      const [l, c, h] = oklchParts(rgb);
      return `oklch(${l}% ${c} ${h})`;
    }
    default:
      return toHex(rgb);
  }
}
