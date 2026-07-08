import '../../../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnPagePaletteItem from './page-palette-item.component';

describe('<zn-page-palette-item>', () => {
  it('should render the label and description', async () => {
    const el = await fixture<ZnPagePaletteItem>(html`
      <zn-page-palette-item type="hero" label="Hero" description="Big banner"></zn-page-palette-item>`);
    expect(el.shadowRoot?.querySelector('.item__label')?.textContent).to.equal('Hero');
    expect(el.shadowRoot?.querySelector('.item__description')?.textContent).to.equal('Big banner');
  });

  it('should carry its type in the drag payload', async () => {
    const el = await fixture<ZnPagePaletteItem>(html`
      <zn-page-palette-item type="hero" label="Hero"></zn-page-palette-item>`);
    const dataTransfer = new DataTransfer();
    el.dispatchEvent(new DragEvent('dragstart', {dataTransfer, bubbles: true, cancelable: true}));
    expect(dataTransfer.getData('application/x-zn-page-type')).to.equal('hero');
  });
});
