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

  it('hides again on reset in a form with named submit buttons', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <input type="hidden" name="service-type" value="translation">
        <input type="hidden" name="version" value="1">
        <zn-sp flush>
          <zn-panel caption="Translation · v1" flush description="d">
            <zn-toggle slot="actions" name="enabled" value="1" label="Enabled" label-position="left" checked></zn-toggle>
            <zn-priority-list name="priority" label="Service priority" order="a,b" flush move-buttons>
              <zn-tile value="a" caption="A" icon="languages@lu"></zn-tile>
              <span slot="action-a"><zn-button type="submit" name="remove" value="a" size="small" color="error" icon="trash-2@lu" title="Remove A"></zn-button></span>
              <zn-tile value="b" caption="B" icon="languages@lu"></zn-tile>
              <span slot="action-b"><zn-button type="submit" name="remove" value="b" size="small" color="error" icon="trash-2@lu" title="Remove B"></zn-button></span>
            </zn-priority-list>
            <input type="hidden" name="selected-id" value="a"><input type="hidden" name="selected-id" value="b">
          </zn-panel>
          <zn-panel caption="Available Services" flush>
            <zn-sp divide no-gap flush>
              <zn-tile caption="C" icon="languages@lu">
                <zn-button slot="actions" type="submit" name="add" value="c" size="small" color="secondary" icon="plus@lu" title="Add C">Add</zn-button>
              </zn-tile>
            </zn-sp>
          </zn-panel>
          <zn-form-actions hide-until-changed with-reset reset-text="Cancel" reset-icon="x@lu"></zn-form-actions>
        </zn-sp>
      </form>
    `);
    const actions = form.querySelector('zn-form-actions')!;
    const list = form.querySelector('zn-priority-list') as any;
    const toggle = form.querySelector('zn-toggle') as any;
    await list.updateComplete;
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);

    const down = list.shadowRoot.querySelector('zn-button[label="Move down"]') as any;
    await down.updateComplete;
    down.dispatchEvent(new Event('pointerdown', { bubbles: true, composed: true }));
    down.shadowRoot.querySelector('button').click();
    await list.updateComplete;
    expect(list.value).to.deep.equal(['b', 'a']);
    expect(actions.hasAttribute('data-unchanged')).to.be.false;

    toggle.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    toggle.shadowRoot.querySelector('input').click();
    await toggle.updateComplete;

    clickButton(actions.shadowRoot!.querySelector<HTMLElement>('[part="reset-button"]')!);
    await new Promise(resolve => setTimeout(resolve));
    await list.updateComplete;
    expect(list.value).to.deep.equal(['a', 'b']);
    expect(toggle.checked).to.be.true;
    expect(form.querySelector<HTMLElement & { value: string }>('zn-button[name="add"]')!.value).to.equal('c');
    expect(actions.hasAttribute('data-unchanged')).to.be.true;
  });

  it('hides again when an empty multi-select is changed then reset', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <zn-select name="groups" multiple>
          <zn-option value="a">A</zn-option>
          <zn-option value="b">B</zn-option>
        </zn-select>
        <zn-form-actions hide-until-changed></zn-form-actions>
      </form>
    `);
    const actions = form.querySelector('zn-form-actions')!;
    const select = form.querySelector<HTMLElement & { value: string[] }>('zn-select')!;
    await new Promise(requestAnimationFrame);

    select.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    select.value = ['a'];
    select.dispatchEvent(new Event('zn-change', { bubbles: true }));
    expect(actions.hasAttribute('data-unchanged')).to.be.false;

    form.reset();
    await new Promise(resolve => setTimeout(resolve));
    expect(actions.hasAttribute('data-unchanged')).to.be.true;
  });

  it('hides again when a reset re-enables a conditional select', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <zn-select id="allowed" name="allowed" multiple value="" provider="conditional" conditional="blocked">
          <zn-option value="a">A</zn-option>
        </zn-select>
        <zn-select id="blocked" name="blocked" multiple value="" provider="conditional" conditional="allowed">
          <zn-option value="a">A</zn-option>
        </zn-select>
        <zn-form-actions hide-until-changed></zn-form-actions>
      </form>
    `);
    const actions = form.querySelector('zn-form-actions')!;
    const blocked = form.querySelector<HTMLElement & { value: string[] }>('#blocked')!;
    await new Promise(requestAnimationFrame);

    blocked.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    blocked.value = ['a'];
    blocked.dispatchEvent(new Event('zn-change', { bubbles: true }));
    expect(actions.hasAttribute('data-unchanged')).to.be.false;

    form.reset();
    await new Promise(resolve => setTimeout(resolve, 10));
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

  it('ignores repeat submits with loading-on-submit until the request finishes', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form @submit=${(e: Event) => e.preventDefault()}>
        <zn-form-actions loading-on-submit></zn-form-actions>
      </form>
    `);
    let submits = 0;
    form.addEventListener('submit', () => submits++);

    form.requestSubmit();
    form.requestSubmit();
    form.requestSubmit();
    expect(submits).to.equal(1);

    form.dispatchEvent(new Event('complete'));
    form.requestSubmit();
    expect(submits).to.equal(2);
  });
});
