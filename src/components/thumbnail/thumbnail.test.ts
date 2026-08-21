import '../../../dist/zn.min.js';
import {expect, fixture, html, waitUntil} from '@open-wc/testing';
import type ZnThumbnail from './thumbnail.component';

const link = (el: ZnThumbnail) => el.shadowRoot!.querySelector<HTMLElement>('.thumbnail__link')!;

// The test harness loads no theme stylesheet, so tests that assert position or shape stamp on the
// handful of design tokens a themed page would otherwise provide.
const tokens = '--zn-spacing-2x-small: 4px; --zn-spacing-x-small: 8px;'
  + '--zn-border-radius: 6px; --zn-border-radius-small: 2px; --zn-border-radius-pill: 9999px;';

describe('<zn-thumbnail>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`
      <zn-thumbnail></zn-thumbnail>`);

    expect(el).to.exist;
  });

  it('should render the caption and the image', async () => {
    const el = await fixture<ZnThumbnail>(html`
      <zn-thumbnail src="/thumb.jpg" caption="Tahoe Day"></zn-thumbnail>`);

    const img = el.shadowRoot!.querySelector<HTMLImageElement>('.thumbnail__image')!;
    expect(img.getAttribute('src')).to.equal('/thumb.jpg');
    expect(img.getAttribute('alt')).to.equal('Tahoe Day');
    expect(el.shadowRoot!.querySelector('.thumbnail__caption')!.textContent).to.contain('Tahoe Day');
  });

  it('should render an anchor when href is set', async () => {
    const el = await fixture<ZnThumbnail>(html`
      <zn-thumbnail href="/media/1" caption="Linked"></zn-thumbnail>`);

    expect(el.shadowRoot!.querySelector('a.thumbnail__link')).to.exist;
  });

  it('should not render an anchor when disabled', async () => {
    const el = await fixture<ZnThumbnail>(html`
      <zn-thumbnail href="/media/1" caption="Linked" disabled></zn-thumbnail>`);

    expect(el.shadowRoot!.querySelector('a.thumbnail__link')).to.not.exist;
  });

  it('should emit zn-select when clicked', async () => {
    const el = await fixture<ZnThumbnail>(html`
      <zn-thumbnail caption="Tahoe Day" value="tahoe"></zn-thumbnail>`);

    let detail: unknown = null;
    el.addEventListener('zn-select', (e: Event) => {
      detail = (e as CustomEvent).detail;
    });

    link(el).click();
    await el.updateComplete;

    expect(detail).to.deep.equal({item: el});
  });

  it('should not emit zn-select when disabled', async () => {
    const el = await fixture<ZnThumbnail>(html`
      <zn-thumbnail caption="Tahoe Day" disabled></zn-thumbnail>`);

    let fired = false;
    el.addEventListener('zn-select', () => (fired = true));

    link(el).click();
    await el.updateComplete;

    expect(fired).to.be.false;
  });

  describe('actions', () => {
    it('should render actions outside the link so their own clicks still work', async () => {
      const el = await fixture<ZnThumbnail>(html`
        <zn-thumbnail caption="Tahoe Day">
          <button slot="actions">Download</button>
        </zn-thumbnail>`);

      // The actions overlay must not be a descendant of the link, or the link's own click
      // handling would have to cancel the action's default behaviour to stay put.
      const overlay = el.shadowRoot!.querySelector('.thumbnail__overlay')!;
      expect(overlay).to.exist;
      expect(link(el).contains(overlay)).to.be.false;
    });

    it('should let a slotted action handle its own click', async () => {
      const el = await fixture<ZnThumbnail>(html`
        <zn-thumbnail caption="Tahoe Day">
          <button slot="actions">Download</button>
        </zn-thumbnail>`);

      let clicked = false;
      let defaultPrevented = false;
      const action = el.querySelector<HTMLButtonElement>('[slot="actions"]')!;
      action.addEventListener('click', (event: MouseEvent) => {
        clicked = true;
        // The thumbnail used to cancel this, which broke every interactive action.
        setTimeout(() => (defaultPrevented = event.defaultPrevented));
      });

      action.click();
      await waitUntil(() => clicked);

      expect(clicked).to.be.true;
      expect(defaultPrevented).to.be.false;
    });

    it('should not emit zn-select when an action is clicked', async () => {
      const el = await fixture<ZnThumbnail>(html`
        <zn-thumbnail caption="Tahoe Day">
          <button slot="actions">Download</button>
        </zn-thumbnail>`);

      let fired = false;
      el.addEventListener('zn-select', () => (fired = true));

      el.querySelector<HTMLElement>('[slot="actions"]')!.click();
      await el.updateComplete;

      expect(fired).to.be.false;
    });

    it('should hold badges back from the action chips beside them', async () => {
      const el = await fixture<ZnThumbnail>(html`
        <zn-thumbnail caption="Tahoe Day" icon="play_arrow" style="width: 200px; ${tokens}">
          <button slot="actions">Download</button>
        </zn-thumbnail>`);

      const badge = el.shadowRoot!.querySelector<HTMLElement>('.thumbnail__badge-icon')!;
      const action = el.querySelector<HTMLElement>('[slot="actions"]')!;

      // A badge describes the asset, so it must not behave like a control.
      expect(getComputedStyle(badge).pointerEvents).to.equal('none');
      expect(getComputedStyle(badge).cursor).to.not.equal('pointer');
      expect(getComputedStyle(action).cursor).to.equal('pointer');

      // It keeps the chip's shape, and is held back on opacity instead.
      expect(getComputedStyle(badge).borderTopLeftRadius)
        .to.equal(getComputedStyle(action).borderTopLeftRadius);
      expect(parseFloat(getComputedStyle(badge).opacity))
        .to.be.lessThan(parseFloat(getComputedStyle(action).opacity));
    });

    it('should lay multiple actions out as separate chips', async () => {
      // The gap is set here rather than left to --zn-spacing-2x-small, so the test measures
      // the layout instead of whether the theme stylesheet is loaded.
      const el = await fixture<ZnThumbnail>(html`
        <zn-thumbnail caption="Tahoe Day" style="width: 200px; --zn-thumbnail-chip-gap: 6px;">
          <button slot="actions" id="one">1</button>
          <button slot="actions" id="two">2</button>
        </zn-thumbnail>`);

      const actions = el.shadowRoot!.querySelector<HTMLElement>('.thumbnail__actions')!;
      const slot = actions.querySelector<HTMLSlotElement>('slot')!;
      expect(slot.assignedElements()).to.have.lengthOf(2);

      // The slot collapses so each action is its own gapped flex item of the positioner,
      // rather than several icons sharing one container box.
      expect(getComputedStyle(slot).display).to.equal('contents');

      const [one, two] = el.querySelectorAll<HTMLElement>('[slot="actions"]');
      const gap = two.getBoundingClientRect().left - one.getBoundingClientRect().right;
      expect(gap).to.be.closeTo(6, 0.5);
    });
  });

  describe('rings', () => {
    it('should set the aspect ratio from the attribute', async () => {
      const el = await fixture<ZnThumbnail>(html`
        <zn-thumbnail caption="Square" aspect-ratio="1 / 1" style="width: 200px;"></zn-thumbnail>`);

      const media = el.shadowRoot!.querySelector<HTMLElement>('.thumbnail__media')!;
      const rect = media.getBoundingClientRect();
      expect(rect.height).to.be.closeTo(rect.width, 1);
    });

    it('should inherit the aspect ratio from an ancestor custom property', async () => {
      const el = await fixture<ZnThumbnail>(html`
        <div style="width: 200px; --zn-thumbnail-aspect-ratio: 1 / 1;">
          <zn-thumbnail caption="Square"></zn-thumbnail>
        </div>`);

      const thumbnail = el.querySelector<ZnThumbnail>('zn-thumbnail')!;
      const rect = thumbnail.shadowRoot!.querySelector<HTMLElement>('.thumbnail__media')!.getBoundingClientRect();
      expect(rect.height).to.be.closeTo(rect.width, 1);
    });

    it('should let the aspect-ratio attribute win over an inherited custom property', async () => {
      const el = await fixture<ZnThumbnail>(html`
        <div style="width: 200px; --zn-thumbnail-aspect-ratio: 1 / 1;">
          <zn-thumbnail caption="Wide" aspect-ratio="2 / 1"></zn-thumbnail>
        </div>`);

      const thumbnail = el.querySelector<ZnThumbnail>('zn-thumbnail')!;
      const rect = thumbnail.shadowRoot!.querySelector<HTMLElement>('.thumbnail__media')!.getBoundingClientRect();
      expect(rect.width / rect.height).to.be.closeTo(2, 0.05);
    });

    it('should draw a wider ring when selected', async () => {
      const el = await fixture<ZnThumbnail>(html`
        <zn-thumbnail caption="Tahoe Day" style="width: 200px;"></zn-thumbnail>`);
      const media = el.shadowRoot!.querySelector<HTMLElement>('.thumbnail__media')!;
      const width = () => getComputedStyle(media).getPropertyValue('--thumbnail-ring-width').trim();

      expect(width()).to.equal('1px');

      el.selected = true;
      await el.updateComplete;

      expect(width()).to.equal('2px');
    });

    it('should draw a distinct ring colour when active', async () => {
      const el = await fixture<ZnThumbnail>(html`
        <zn-thumbnail caption="Tahoe Day" style="width: 200px; --zn-thumbnail-active-color: rgb(0, 128, 0);"></zn-thumbnail>`);
      const media = el.shadowRoot!.querySelector<HTMLElement>('.thumbnail__media')!;
      const color = () => getComputedStyle(media).getPropertyValue('--thumbnail-ring-color').trim();

      const idle = color();

      el.active = true;
      await el.updateComplete;

      expect(el.hasAttribute('active')).to.be.true;
      expect(color()).to.equal('rgb(0, 128, 0)');
      expect(color()).to.not.equal(idle);
    });

    it('should give the active ring colour precedence over the selected ring colour', async () => {
      const el = await fixture<ZnThumbnail>(html`
        <zn-thumbnail
          caption="Tahoe Day"
          selected
          active
          style="width: 200px; --zn-thumbnail-selected-color: rgb(1, 2, 3); --zn-thumbnail-active-color: rgb(4, 5, 6);">
        </zn-thumbnail>`);

      const media = el.shadowRoot!.querySelector<HTMLElement>('.thumbnail__media')!;
      expect(getComputedStyle(media).getPropertyValue('--thumbnail-ring-color').trim()).to.equal('rgb(4, 5, 6)');
    });
  });

  describe('preview', () => {
    it('should not render a preview without full-uri', async () => {
      const el = await fixture<ZnThumbnail>(html`
        <zn-thumbnail caption="Tahoe Day" src="/thumb.jpg"></zn-thumbnail>`);

      expect(el.shadowRoot!.querySelector('dialog')).to.not.exist;
    });

    it('should open the preview when clicked', async () => {
      const el = await fixture<ZnThumbnail>(html`
        <zn-thumbnail caption="Tahoe Day" src="/thumb.jpg" full-uri="/full.jpg"></zn-thumbnail>`);

      let shown = false;
      el.addEventListener('zn-show', () => (shown = true));

      link(el).click();
      await waitUntil(() => el.shadowRoot!.querySelector<HTMLDialogElement>('dialog')?.open);

      const dialog = el.shadowRoot!.querySelector<HTMLDialogElement>('dialog')!;
      expect(shown).to.be.true;
      expect(dialog.open).to.be.true;
      expect(el.shadowRoot!.querySelector<HTMLImageElement>('.thumbnail__preview-image')!.getAttribute('src'))
        .to.equal('/full.jpg');
    });

    it('should size the preview to the asset ratio rather than a fixed one', async () => {
      // A deliberately tall asset: a fixed 16 / 9 panel would letterbox it and leave the close
      // button floating on the panel instead of the image.
      const tall = 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="400"></svg>');

      const el = await fixture<ZnThumbnail>(html`
        <zn-thumbnail caption="Tall" src="${tall}" full-uri="${tall}" style="width: 200px;"></zn-thumbnail>`);

      const image = el.shadowRoot!.querySelector<HTMLImageElement>('.thumbnail__image')!;
      await waitUntil(() => image.complete && image.naturalWidth > 0);

      await el.showPreview();

      const frame = el.shadowRoot!.querySelector<HTMLElement>('.thumbnail__preview-frame')!.getBoundingClientRect();
      expect(frame.width / frame.height).to.be.closeTo(0.5, 0.02);

      // ...and it stays inside 70% of the viewport in both directions.
      expect(frame.width).to.be.at.most(window.innerWidth * 0.7 + 1);
      expect(frame.height).to.be.at.most(window.innerHeight * 0.7 + 1);
    });

    it('should keep the close button over the preview image', async () => {
      const el = await fixture<ZnThumbnail>(html`
        <zn-thumbnail caption="Tahoe Day" full-uri="/full.jpg" style="width: 200px; ${tokens}"></zn-thumbnail>`);

      await el.showPreview();

      const frame = el.shadowRoot!.querySelector<HTMLElement>('.thumbnail__preview-frame')!.getBoundingClientRect();
      const close = el.shadowRoot!.querySelector<HTMLElement>('.thumbnail__preview-close')!.getBoundingClientRect();

      // The frame is the image, so being inside the frame's top-right puts it on the image.
      expect(close.top).to.be.at.least(frame.top - 1);
      expect(close.right).to.be.at.most(frame.right + 1);
      expect(close.bottom).to.be.at.most(frame.bottom + 1);
      expect(frame.right - close.right).to.be.lessThan(frame.width / 2);
      expect(close.top - frame.top).to.be.lessThan(frame.height / 2);
    });

    it('should close the preview from the backdrop', async () => {
      const el = await fixture<ZnThumbnail>(html`
        <zn-thumbnail caption="Tahoe Day" full-uri="/full.jpg"></zn-thumbnail>`);

      await el.showPreview();
      const dialog = el.shadowRoot!.querySelector<HTMLDialogElement>('dialog')!;
      expect(dialog.open).to.be.true;

      let closed = false;
      el.addEventListener('zn-close', () => (closed = true));

      el.shadowRoot!.querySelector<HTMLElement>('.thumbnail__preview-backdrop')!.click();
      await waitUntil(() => !dialog.open);

      expect(closed).to.be.true;
    });

    it('should not open the preview on click when preview-trigger is button', async () => {
      const el = await fixture<ZnThumbnail>(html`
        <zn-thumbnail caption="Tahoe Day" full-uri="/full.jpg" preview-trigger="button"></zn-thumbnail>`);

      link(el).click();
      await el.updateComplete;

      expect(el.shadowRoot!.querySelector<HTMLDialogElement>('dialog')!.open).to.be.false;

      el.shadowRoot!.querySelector<HTMLElement>('.thumbnail__preview-button')!.click();
      await waitUntil(() => el.shadowRoot!.querySelector<HTMLDialogElement>('dialog')!.open);

      expect(el.shadowRoot!.querySelector<HTMLDialogElement>('dialog')!.open).to.be.true;
    });

    it('should not open the preview when zn-select is canceled', async () => {
      const el = await fixture<ZnThumbnail>(html`
        <zn-thumbnail caption="Tahoe Day" full-uri="/full.jpg"></zn-thumbnail>`);

      el.addEventListener('zn-select', (event: Event) => event.preventDefault());

      link(el).click();
      await el.updateComplete;

      expect(el.shadowRoot!.querySelector<HTMLDialogElement>('dialog')!.open).to.be.false;
    });

    it('should not open the preview when disabled', async () => {
      const el = await fixture<ZnThumbnail>(html`
        <zn-thumbnail caption="Tahoe Day" full-uri="/full.jpg" disabled></zn-thumbnail>`);

      await el.showPreview();

      expect(el.shadowRoot!.querySelector('dialog')).to.not.exist;
    });
  });
});
