import {detectColorFormat, formatColor, oklchParts, parseColor} from './color';
import {expect} from '@open-wc/testing';

describe('color utilities', () => {
  it('parses every supported syntax', () => {
    expect(parseColor('#085EFD')).to.deep.equal([8, 94, 253]);
    expect(parseColor('085efd')).to.deep.equal([8, 94, 253]);
    expect(parseColor('#abc')).to.deep.equal([170, 187, 204]);
    expect(parseColor('rgb(8, 94, 253)')).to.deep.equal([8, 94, 253]);
    expect(parseColor('8 94 253')).to.deep.equal([8, 94, 253]);
    expect(parseColor('hsl(0, 100%, 50%)')).to.deep.equal([255, 0, 0]);
    expect(parseColor('oklch(62.8% 0.258 29.2)')).to.deep.equal([255, 0, 0]);
    expect(parseColor('oklch(0.628 0.258 29.2)')).to.deep.equal([255, 0, 0]);
    expect(parseColor('rebeccapurple')).to.deep.equal([102, 51, 153]);
  });

  it('rejects text that is not a colour', () => {
    expect(parseColor('not a colour')).to.equal(null);
    expect(parseColor('rgb(0, 0)')).to.equal(null);
    expect(parseColor('')).to.equal(null);
  });

  it('detects the format a colour is written in', () => {
    expect(detectColorFormat('#085EFD')).to.equal('hex');
    expect(detectColorFormat('rgb(8, 94, 253)')).to.equal('rgb');
    expect(detectColorFormat('hsl(219, 98%, 51%)')).to.equal('hsl');
    expect(detectColorFormat('oklch(58% 0.2 262)')).to.equal('oklch');
    expect(detectColorFormat('rebeccapurple')).to.equal(null);
  });

  it('writes a colour out in each format', () => {
    const rgb = parseColor('#085EFD')!;
    expect(formatColor(rgb, 'hex')).to.equal('#085EFD');
    expect(formatColor(rgb, 'rgb')).to.equal('rgb(8, 94, 253)');
    expect(formatColor(rgb, 'hsl')).to.equal('hsl(219, 98%, 51%)');
    expect(formatColor(rgb, 'oklch')).to.equal('oklch(54.8% 0.247 262)');
  });

  it('computes OKLCH from the OKLab transform', () => {
    expect(oklchParts([255, 0, 0])).to.deep.equal([62.8, 0.258, 29.2]);
    expect(oklchParts([255, 255, 255])).to.deep.equal([100, 0, 0]);
  });
});
