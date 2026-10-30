import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';

describe('<zn-color-select>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`<zn-color-select></zn-color-select>`);
    expect(el).to.exist;
    expect(el.shadowRoot).to.exist;
  });

  it('should list the nine built-in colors', async () => {
    const el = await fixture(html`<zn-color-select></zn-color-select>`);
    const options = el.shadowRoot!.querySelectorAll('zn-option');
    expect(options.length).to.equal(9);
  });

  it('should show the selected color swatch in the preview', async () => {
    const el = await fixture(html`<zn-color-select value="red"></zn-color-select>`);
    const swatch = el.shadowRoot!.querySelector('[slot="prefix"]')!;
    expect(swatch.classList.contains('color-swatch--red')).to.be.true;
  });

  it('should show an empty swatch when no color is selected', async () => {
    const el = await fixture(html`<zn-color-select></zn-color-select>`);
    const swatch = el.shadowRoot!.querySelector('[slot="prefix"]')!;
    expect(swatch.classList.contains('color-swatch--empty')).to.be.true;
  });
});
