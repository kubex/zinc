import '../../../dist/zn.min.js';
import { expect, fixture, html, oneEvent } from '@open-wc/testing';

// ZnButton overrides click() without dispatching a DOM event, so fire a real one.
const clickButton = (button: HTMLElement) =>
  button.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, cancelable: true }));

describe('<zn-form-actions>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-form-actions></zn-form-actions> `);

    expect(el).to.exist;
  });

  it('should emit zn-cancel when the cancel button is clicked', async () => {
    const el = await fixture<HTMLElement>(html` <zn-form-actions with-cancel></zn-form-actions> `);
    const cancel = el.shadowRoot!.querySelector<HTMLElement>('[part="cancel-button"]')!;

    const listener = oneEvent(el, 'zn-cancel');
    clickButton(cancel);

    expect(await listener).to.exist;
  });

  it('holds align="start" children left and the rest right, one gap apart on each side', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-form-actions with-cancel style="width: 600px">
        <zn-button align="start" id="translate">Translate</zn-button>
        <zn-button align="start" id="slug">Slug</zn-button>
      </zn-form-actions>
    `);
    const row = el.getBoundingClientRect();
    const translate = el.querySelector<HTMLElement>('#translate')!.getBoundingClientRect();
    const slug = el.querySelector<HTMLElement>('#slug')!.getBoundingClientRect();
    const cancel = el.shadowRoot!.querySelector<HTMLElement>('[part="cancel-button"]')!.getBoundingClientRect();
    const submit = el.shadowRoot!.querySelector<HTMLElement>('[part="submit-button"]')!.getBoundingClientRect();

    expect(translate.left).to.be.closeTo(row.left, 1);
    expect(submit.right).to.be.closeTo(row.right, 1);
    // Each side stays one gap apart rather than spreading across the free space.
    expect(slug.left).to.be.closeTo(translate.right + 16, 1);
    expect(submit.left).to.be.closeTo(cancel.right + 16, 1);
  });

  it('should close a containing dialog when the cancel button is clicked', async () => {
    const dialog = await fixture<HTMLElement & { open: boolean }>(html`
      <zn-dialog open label="Test">
        <form>
          <zn-form-actions with-cancel></zn-form-actions>
        </form>
      </zn-dialog>
    `);
    const actions = dialog.querySelector('zn-form-actions')!;
    const cancel = actions.shadowRoot!.querySelector<HTMLElement>('[part="cancel-button"]')!;

    clickButton(cancel);

    expect(dialog.open).to.be.false;
  });
});
