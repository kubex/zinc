import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
import type ZnOption from './option.component';

describe('<zn-option>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-option></zn-option> `);

    expect(el).to.exist;
  });

  it('prioritises the hover/current highlight over the selected background', async () => {
    // Inject the palette so the computed colors resolve deterministically in the test environment.
    const el = await fixture<ZnOption>(html`
      <zn-option
        value="a"
        selected
        style="--zn-color-primary-100: rgb(10, 20, 30); --zn-color-primary-200: rgb(40, 50, 60);">
        A
      </zn-option>
    `);
    await el.updateComplete;

    const base = el.shadowRoot!.querySelector<HTMLElement>('.option')!;

    // Selected only → the selected background
    expect(getComputedStyle(base).backgroundColor).to.equal('rgb(40, 50, 60)');

    // Keyboard-current + selected → the highlight must win over selected
    el.current = true;
    await el.updateComplete;
    expect(getComputedStyle(base).backgroundColor, 'current should win over selected').to.equal('rgb(10, 20, 30)');

    // Mouse-hover + selected → the highlight must win over selected
    el.current = false;
    el.hasHover = true;
    await el.updateComplete;
    expect(getComputedStyle(base).backgroundColor, 'hover should win over selected').to.equal('rgb(10, 20, 30)');
  });
});
