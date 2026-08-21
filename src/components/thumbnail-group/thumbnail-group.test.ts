import '../../../dist/zn.min.js';
import {expect, fixture, html, waitUntil} from '@open-wc/testing';
import type ZnThumbnail from '../thumbnail/thumbnail.component';
import type ZnThumbnailGroup from './thumbnail-group.component';

const thumbnails = (count: number) =>
  Array.from({length: count}, (_, i) => `<zn-thumbnail value="v${i}" caption="Item ${i}"></zn-thumbnail>`).join('');

describe('<zn-thumbnail-group>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`
      <zn-thumbnail-group></zn-thumbnail-group>`);

    expect(el).to.exist;
  });

  it('should render the caption', async () => {
    const el = await fixture<ZnThumbnailGroup>(html`
      <zn-thumbnail-group caption="Landscape"></zn-thumbnail-group>`);

    expect(el.shadowRoot!.querySelector('.thumbnail-group__caption')!.textContent).to.contain('Landscape');
  });

  it('should not render the toggle when the thumbnails fit on one row', async () => {
    const el = await fixture<ZnThumbnailGroup>(html`
      <zn-thumbnail-group caption="Landscape" style="width: 800px;">
        <zn-thumbnail caption="One"></zn-thumbnail>
        <zn-thumbnail caption="Two"></zn-thumbnail>
      </zn-thumbnail-group>`);

    expect(el.shadowRoot!.querySelector('.thumbnail-group__toggle')).to.not.exist;
  });

  it('should render the toggle when the row overflows', async () => {
    const el = await fixture<ZnThumbnailGroup>(
      `<zn-thumbnail-group caption="Landscape" style="width: 400px;">${thumbnails(12)}</zn-thumbnail-group>`);

    await waitUntil(() => el.shadowRoot!.querySelector('.thumbnail-group__toggle'));

    const toggle = el.shadowRoot!.querySelector<HTMLButtonElement>('.thumbnail-group__toggle')!;
    expect(toggle.textContent!.trim()).to.equal('Show All (12)');
  });

  it('should use the total attribute in the toggle label', async () => {
    const el = await fixture<ZnThumbnailGroup>(html`
      <zn-thumbnail-group caption="Landscape" total="79" style="width: 800px;">
        <zn-thumbnail caption="One"></zn-thumbnail>
      </zn-thumbnail-group>`);

    const toggle = el.shadowRoot!.querySelector<HTMLButtonElement>('.thumbnail-group__toggle')!;
    expect(toggle.textContent!.trim()).to.equal('Show All (79)');
  });

  it('should expand and collapse from the toggle', async () => {
    const el = await fixture<ZnThumbnailGroup>(html`
      <zn-thumbnail-group caption="Landscape" always-toggle>
        <zn-thumbnail caption="One"></zn-thumbnail>
      </zn-thumbnail-group>`);

    const expanded: string[] = [];
    el.addEventListener('zn-expand', () => expanded.push('expand'));
    el.addEventListener('zn-collapse', () => expanded.push('collapse'));

    el.shadowRoot!.querySelector<HTMLButtonElement>('.thumbnail-group__toggle')!.click();
    await el.updateComplete;

    expect(el.expanded).to.be.true;
    expect(el.shadowRoot!.querySelector<HTMLButtonElement>('.thumbnail-group__toggle')!.textContent!.trim())
      .to.equal('Show Less');

    el.shadowRoot!.querySelector<HTMLButtonElement>('.thumbnail-group__toggle')!.click();
    await el.updateComplete;

    expect(el.expanded).to.be.false;
    expect(expanded).to.deep.equal(['expand', 'collapse']);
  });

  it('should move selection between thumbnails when selectable', async () => {
    const el = await fixture<ZnThumbnailGroup>(html`
      <zn-thumbnail-group selectable>
        <zn-thumbnail value="a" caption="A" selected></zn-thumbnail>
        <zn-thumbnail value="b" caption="B"></zn-thumbnail>
      </zn-thumbnail-group>`);

    const [a, b] = Array.from(el.querySelectorAll<ZnThumbnail>('zn-thumbnail'));
    expect(el.value).to.equal('a');

    let changed = false;
    el.addEventListener('zn-change', () => (changed = true));

    b.shadowRoot!.querySelector<HTMLElement>('.thumbnail__link')!.click();
    await el.updateComplete;

    expect(el.value).to.equal('b');
    expect(a.selected).to.be.false;
    expect(b.selected).to.be.true;
    expect(changed).to.be.true;
  });

  it('should mirror the shorthand attributes onto host custom properties', async () => {
    const el = await fixture<ZnThumbnailGroup>(html`
      <zn-thumbnail-group aspect-ratio="1 / 1" thumbnail-width="120px" gap="4px">
        <zn-thumbnail caption="One"></zn-thumbnail>
      </zn-thumbnail-group>`);

    expect(el.style.getPropertyValue('--zn-thumbnail-aspect-ratio')).to.equal('1 / 1');
    expect(el.style.getPropertyValue('--zn-thumbnail-width')).to.equal('120px');
    expect(el.style.getPropertyValue('--zn-thumbnail-gap')).to.equal('4px');

    // Thumbnails are light-DOM children, so they inherit the properties from the host.
    const thumbnail = el.querySelector<ZnThumbnail>('zn-thumbnail')!;
    const rect = thumbnail.shadowRoot!.querySelector<HTMLElement>('.thumbnail__media')!.getBoundingClientRect();
    expect(rect.width).to.be.closeTo(120, 1);
    expect(rect.height).to.be.closeTo(120, 1);
  });

  it('should not clear a custom property set inline by the consumer', async () => {
    const el = await fixture<ZnThumbnailGroup>(html`
      <zn-thumbnail-group style="--zn-thumbnail-width: 90px;">
        <zn-thumbnail caption="One"></zn-thumbnail>
      </zn-thumbnail-group>`);

    expect(el.style.getPropertyValue('--zn-thumbnail-width')).to.equal('90px');
  });

  it('should clear a shorthand property once its attribute is removed', async () => {
    const el = await fixture<ZnThumbnailGroup>(html`
      <zn-thumbnail-group thumbnail-width="120px">
        <zn-thumbnail caption="One"></zn-thumbnail>
      </zn-thumbnail-group>`);

    el.thumbnailWidth = '';
    await el.updateComplete;

    expect(el.style.getPropertyValue('--zn-thumbnail-width')).to.equal('');
  });

  it('should not manage selection when selectable is not set', async () => {
    const el = await fixture<ZnThumbnailGroup>(html`
      <zn-thumbnail-group>
        <zn-thumbnail value="a" caption="A"></zn-thumbnail>
      </zn-thumbnail-group>`);

    const a = el.querySelector<ZnThumbnail>('zn-thumbnail')!;
    a.shadowRoot!.querySelector<HTMLElement>('.thumbnail__link')!.click();
    await el.updateComplete;

    expect(a.selected).to.be.false;
    expect(el.value).to.equal('');
  });
});
