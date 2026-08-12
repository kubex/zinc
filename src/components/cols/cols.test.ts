import '../../../dist/zn.min.js';
import {aTimeout, expect, fixture} from '@open-wc/testing';
import type {LitElement} from 'lit';

/** Reads the flex order the browser actually resolved for a light DOM child */
const orderOf = (el: Element | null) => getComputedStyle(el!).order;

const cols = async (markup: string) => {
  const el = await fixture<LitElement>(markup);
  await el.updateComplete;
  return el;
};

describe('<zn-cols>', () => {
  it('should render a component', async () => {
    const el = await fixture('<zn-cols></zn-cols>');

    expect(el).to.exist;
  });

  it('should assign column classes from the layout pattern', async () => {
    const el = await cols(`
      <zn-cols layout="2,1">
        <div id="main"></div>
        <div id="side"></div>
        <div id="wrapped"></div>
      </zn-cols>`);

    expect(el.querySelector('#main')).to.have.class('zn-col-2');
    expect(el.querySelector('#side')).to.have.class('zn-col-1');
    expect(el.querySelector('#wrapped')).to.have.class('zn-col-2');
  });

  describe('stacking', () => {
    it('should not stack unless asked to', async () => {
      const el = await cols(`
        <zn-cols layout="2,1">
          <div></div>
          <div></div>
        </zn-cols>`);

      expect(el.getAttribute('stack-at')).to.equal('');
    });

    it('should default stack-at when a child declares a stack order', async () => {
      const el = await cols(`
        <zn-cols layout="2,1">
          <div></div>
          <div stack-order="first"></div>
        </zn-cols>`);
      await el.updateComplete;

      expect(el.getAttribute('stack-at')).to.equal('lg');
    });

    it('should keep an explicit stack-at', async () => {
      const el = await cols(`
        <zn-cols layout="2,1" stack-at="md">
          <div></div>
          <div stack-order="first"></div>
        </zn-cols>`);
      await el.updateComplete;

      expect(el.getAttribute('stack-at')).to.equal('md');
    });

    it('should only apply the stack order once stacked', async () => {
      const el = await cols(`
        <zn-cols layout="2,1" stack-at="md" style="width: 900px">
          <div id="main"></div>
          <div id="side" stack-order="first"></div>
        </zn-cols>`);

      expect(orderOf(el.querySelector('#side'))).to.equal('0');

      el.style.width = '500px';
      await aTimeout(50);

      expect(orderOf(el.querySelector('#side'))).to.equal('-1');
      expect(orderOf(el.querySelector('#main'))).to.equal('0');
    });

    it('should accept keywords and integers as a stack order', async () => {
      const el = await cols(`
        <zn-cols layout="2,1" stack-at="md" style="width: 500px">
          <div id="a" stack-order="high"></div>
          <div id="b" stack-order="low"></div>
          <div id="c" stack-order="3"></div>
          <div id="d" stack-order="nonsense"></div>
        </zn-cols>`);

      expect(orderOf(el.querySelector('#a'))).to.equal('-1');
      expect(orderOf(el.querySelector('#b'))).to.equal('1');
      expect(orderOf(el.querySelector('#c'))).to.equal('3');
      expect(orderOf(el.querySelector('#d'))).to.equal('0');
    });

    it('should split a column into individually ordered children once stacked', async () => {
      const el = await cols(`
        <zn-cols layout="2,1" stack-at="md" style="width: 900px">
          <div id="main" style="height: 100px"></div>
          <div id="side" stack-split>
            <div id="usage" stack-order="high" style="height: 20px"></div>
            <div id="tutorials" stack-order="low" style="height: 20px"></div>
          </div>
        </zn-cols>`);

      // Side by side, the split column is a single column holding both of its children
      expect(getComputedStyle(el.querySelector('#side')!).display).to.equal('flex');
      expect(orderOf(el.querySelector('#usage'))).to.equal('0');

      el.style.width = '500px';
      await aTimeout(50);

      // Stacked, the column dissolves so each of its children becomes a column of its own
      expect(getComputedStyle(el.querySelector('#side')!).display).to.equal('contents');
      expect(orderOf(el.querySelector('#usage'))).to.equal('-1');
      expect(orderOf(el.querySelector('#tutorials'))).to.equal('1');

      const top = (selector: string) => el.querySelector(selector)!.getBoundingClientRect().top;
      expect(top('#usage')).to.be.lessThan(top('#main'));
      expect(top('#tutorials')).to.be.greaterThan(top('#main'));
    });

    it('should order children added after the initial render', async () => {
      const el = await cols(`
        <zn-cols layout="2,1" stack-at="md" style="width: 500px">
          <div id="main"></div>
          <div id="side" stack-split></div>
        </zn-cols>`);

      el.querySelector('#side')!.innerHTML = '<div id="usage" stack-order="high"></div>';
      await aTimeout(50);

      expect(orderOf(el.querySelector('#usage'))).to.equal('-1');
    });
  });
});
