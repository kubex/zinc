import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-style>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-style></zn-style> `);

    expect(el).to.exist;
  });

  describe('border', () => {
    it('border="t" applies only zn-bt', async () => {
      const el = await fixture<HTMLElement>(html`<zn-style border="t"></zn-style>`);
      expect(el.classList.contains('zn-bt')).to.be.true;
      expect(el.classList.contains('zn-bb')).to.be.false;
      expect(el.classList.contains('zn-bl')).to.be.false;
      expect(el.classList.contains('zn-br')).to.be.false;
      expect(el.classList.contains('zn-border')).to.be.false;
    });

    it('border="tb" applies zn-bt and zn-bb', async () => {
      const el = await fixture<HTMLElement>(html`<zn-style border="tb"></zn-style>`);
      expect(el.classList.contains('zn-bt')).to.be.true;
      expect(el.classList.contains('zn-bb')).to.be.true;
      expect(el.classList.contains('zn-bl')).to.be.false;
      expect(el.classList.contains('zn-br')).to.be.false;
    });

    it('border (attribute present but empty) applies zn-border (all four sides)', async () => {
      const el = await fixture<HTMLElement>(html`<zn-style border></zn-style>`);
      expect(el.classList.contains('zn-border')).to.be.true;
    });

    it('no border attribute applies no border classes', async () => {
      const el = await fixture<HTMLElement>(html`<zn-style></zn-style>`);
      expect(el.classList.contains('zn-border')).to.be.false;
      expect(el.classList.contains('zn-bt')).to.be.false;
      expect(el.classList.contains('zn-bb')).to.be.false;
      expect(el.classList.contains('zn-bl')).to.be.false;
      expect(el.classList.contains('zn-br')).to.be.false;
    });
  });

  describe('size', () => {
    it('size="s" applies zn-size-s', async () => {
      const el = await fixture<HTMLElement>(html`<zn-style size="s"></zn-style>`);
      expect(el.classList.contains('zn-size-s')).to.be.true;
    });

    it('size="xs" applies zn-size-xs', async () => {
      const el = await fixture<HTMLElement>(html`<zn-style size="xs"></zn-style>`);
      expect(el.classList.contains('zn-size-xs')).to.be.true;
    });

    it('size="xl" applies zn-size-xl', async () => {
      const el = await fixture<HTMLElement>(html`<zn-style size="xl"></zn-style>`);
      expect(el.classList.contains('zn-size-xl')).to.be.true;
    });

    it('size="m" applies no size class', async () => {
      const el = await fixture<HTMLElement>(html`<zn-style size="m"></zn-style>`);
      expect(el.classList.contains('zn-size-m')).to.be.false;
      expect(el.classList.contains('zn-size-xs')).to.be.false;
      expect(el.classList.contains('zn-size-s')).to.be.false;
      expect(el.classList.contains('zn-size-l')).to.be.false;
      expect(el.classList.contains('zn-size-xl')).to.be.false;
    });
  });

  describe('muted', () => {
    it('applies zn-muted class when present', async () => {
      const el = await fixture<HTMLElement>(html`<zn-style muted></zn-style>`);
      expect(el.classList.contains('zn-muted')).to.be.true;
    });

    it('does not apply zn-muted when absent', async () => {
      const el = await fixture<HTMLElement>(html`<zn-style></zn-style>`);
      expect(el.classList.contains('zn-muted')).to.be.false;
    });
  });
});
