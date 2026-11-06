import '../../../dist/zn.min.js';
import { expect, fixture, html, oneEvent } from '@open-wc/testing';

// ZnButton overrides click() without dispatching a DOM event, so fire a real one.
const clickButton = (button: HTMLElement) =>
  button.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, cancelable: true }));

// The test harness loads no theme stylesheet, so a layout test stamps on the spacing token a themed page provides.
const spacingTokens = '--zn-spacing-small: 16px;';

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
      <zn-form-actions with-cancel style="width: 600px; ${spacingTokens}">
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

  it('shows only while the form differs from its loaded values', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <input name="title" value="a">
        <zn-form-actions hide-until-changed></zn-form-actions>
      </form>
    `);
    const actions = form.querySelector('zn-form-actions')!;
    const input = form.querySelector('input')!;
    const visible = async () => {
      await Promise.all(actions.getAnimations().map(animation => animation.finished));
      return getComputedStyle(actions).display !== 'none';
    };
    const type = (value: string) => {
      input.dispatchEvent(new Event('keydown', { bubbles: true }));
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };
    await new Promise(requestAnimationFrame);

    expect(await visible()).to.be.false;

    type('b');
    expect(await visible()).to.be.true;

    type('a');
    expect(await visible()).to.be.false;

    type('b');
    form.reset();
    await new Promise(resolve => setTimeout(resolve));
    expect(await visible()).to.be.false;
  });

  it('hides again when a toggle is switched back', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <zn-toggle name="auto"></zn-toggle>
        <zn-form-actions hide-until-changed></zn-form-actions>
      </form>
    `);
    const actions = form.querySelector('zn-form-actions')!;
    const toggle = form.querySelector('zn-toggle')!;
    await new Promise(requestAnimationFrame);
    const flip = async () => {
      toggle.dispatchEvent(new Event('pointerdown', { bubbles: true }));
      toggle.shadowRoot!.querySelector('input')!.click();
      await (toggle as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    };

    await flip();
    expect(actions.hasAttribute('data-unchanged')).to.be.false;

    await flip();
    expect(actions.hasAttribute('data-unchanged')).to.be.true;
  });

  it('treats changes before any interaction as the starting values', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <input name="type" value="">
        <zn-form-actions hide-until-changed></zn-form-actions>
      </form>
    `);
    const actions = form.querySelector('zn-form-actions')!;
    const input = form.querySelector('input')!;
    await new Promise(requestAnimationFrame);

    // As zn-select does when its options load or select-first picks one
    input.value = 'team';
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(actions.hasAttribute('data-unchanged')).to.be.true;
  });

  it('stays visible in an unchanged form without hide-until-changed', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <input name="title" value="a">
        <zn-form-actions></zn-form-actions>
      </form>
    `);
    await new Promise(requestAnimationFrame);

    expect(getComputedStyle(form.querySelector('zn-form-actions')!).display).to.not.equal('none');
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
