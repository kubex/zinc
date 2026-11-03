import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnTile from './tile.component';

describe('<zn-tile>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`<zn-tile></zn-tile>`);

    expect(el).to.exist;
  });

  it('should render a slotted caption and image without caption or description attributes', async () => {
    const el = await fixture<ZnTile>(html`
      <zn-tile>
        <zn-icon slot="image" src="user@lu"></zn-icon>
        <span slot="caption">Leslie Alexander</span>
      </zn-tile>`);

    expect(el.shadowRoot!.querySelector('slot[name="caption"]')).to.exist;
    expect(el.shadowRoot!.querySelector('slot[name="image"]')).to.exist;
  });

  it('draws the icon in a tinted square', async () => {
    const el = await fixture<ZnTile>(html`
      <zn-tile caption="Second chance" icon="tag@lu" icon-color="success"
               style="--zn-color-success-bg: rgb(1, 2, 3)"></zn-tile>`);

    const square = el.shadowRoot!.querySelector<HTMLElement>('.tile__icon')!;
    expect(square.querySelector('zn-icon')).to.exist;
    expect(getComputedStyle(square).backgroundColor).to.equal('rgb(1, 2, 3)');
  });

  it('should render its content as a link when href is set', async () => {
    const el = await fixture<ZnTile>(html`
      <zn-tile href="/users/leslie" caption="Leslie Alexander"></zn-tile>`);

    const link = el.shadowRoot!.querySelector<HTMLAnchorElement>('a.tile__link')!;
    expect(link).to.exist;
    expect(link.getAttribute('href')).to.equal('/users/leslie');
  });

  it('should render actions outside the link', async () => {
    const el = await fixture<ZnTile>(html`
      <zn-tile href="/users/leslie" caption="Leslie Alexander">
        <zn-button slot="actions">Edit</zn-button>
      </zn-tile>`);

    const link = el.shadowRoot!.querySelector<HTMLAnchorElement>('a.tile__link')!;
    const actions = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="actions"]')!;
    expect(link.contains(actions)).to.be.false;
  });

  it('should not cancel clicks from a slotted action', async () => {
    const el = await fixture<ZnTile>(html`
      <zn-tile href="/users/leslie" caption="Leslie Alexander">
        <zn-button slot="actions">Edit</zn-button>
      </zn-tile>`);

    const action = el.querySelector<HTMLElement>('zn-button')!;
    const button = action.shadowRoot!.querySelector<HTMLButtonElement>('button')!;
    let click: MouseEvent | undefined;
    action.addEventListener('click', event => (click = event as MouseEvent));

    button.click();

    expect(click).to.exist;
    expect(click!.defaultPrevented).to.be.false;
  });

  it('should let a linked action reach delegated navigation handlers', async () => {
    const el = await fixture<ZnTile>(html`
      <zn-tile href="/users/leslie" caption="Leslie Alexander">
        <zn-button slot="actions" href="/users/leslie/edit" data-target="modal">Edit</zn-button>
      </zn-tile>`);

    const action = el.querySelector<HTMLElement>('zn-button')!;
    const buttonLink = action.shadowRoot!.querySelector<HTMLAnchorElement>('a')!;
    let selectedLink: Element | undefined;
    const handleDocumentClick = (event: MouseEvent) => {
      selectedLink = event.composedPath().find(target =>
        target instanceof Element && target.matches('[href]')) as Element | undefined;
      event.preventDefault();
    };
    document.addEventListener('click', handleDocumentClick, {once: true});

    buttonLink.click();

    expect(selectedLink).to.equal(buttonLink);
    expect(selectedLink!.getAttribute('href')).to.equal('/users/leslie/edit');
    expect(selectedLink!.getAttribute('data-target')).to.equal('modal');
  });
});
