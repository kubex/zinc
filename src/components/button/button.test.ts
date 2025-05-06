import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
import type ZnButton from "./button.component";

const variants = ['default', 'primary', 'secondary', 'success', 'neutral', 'warning', 'danger', 'text']

describe('<zn-button>', () => {

  describe('accessibility tests', () => {
    variants.forEach(variant => {
      it(`should be accessible when variant is "${variant}"`, async () => {
        const el = await fixture<ZnButton>(html`<zn-button variant="${variant}">Button Label</zn-button>`)
        await expect(el).to.be.accessible();
      });
    });
  });

  describe('when provided no parameters', () => {
    it('passes accessibility test', async () => {
      const el = await fixture<ZnButton>(html`<zn-button>Button Label</zn-button>`);
      await expect(el).to.be.accessible();
    });
  });

  it('default values are set correctly', async () => {
    const el = await fixture<ZnButton>(html`<zn-button>Button Label</zn-button>`);

    expect(el.title).to.equal('');
    expect(el.color).to.equal('default');
  });

});
