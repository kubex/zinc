import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-confirm-modal>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-confirm-modal></zn-confirm-modal> `);

    expect(el).to.exist;
  });

  it('connects a trigger whose id contains CSS syntax characters', async () => {
    const id = 'delete-enum-cloud_hosting_&_infrastructure';
    const el = await fixture<HTMLElement>(html`
      <div>
        <button id="${id}">Delete</button>
        <zn-confirm trigger="${id}" caption="Delete"></zn-confirm>
      </div>
    `);
    const confirm = el.querySelector<HTMLElement & {updateComplete: Promise<void>}>('zn-confirm')!;
    await confirm.updateComplete;

    // An unescaped `#id` selector throws a SyntaxError here, leaving the component unrendered.
    expect(confirm.shadowRoot!.querySelector('zn-dialog')).to.exist;
  });
});
