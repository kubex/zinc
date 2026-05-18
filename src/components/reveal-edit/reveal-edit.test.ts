import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnRevealEdit from './reveal-edit.component';

describe('<zn-reveal-edit>', () => {

  // -- Rendering --

  it('should render a component', async () => {
    const el = await fixture(html`<zn-reveal-edit></zn-reveal-edit>`);
    expect(el).to.exist;
  });

  // -- Display mode --

  it('should show the display-value by default', async () => {
    const el = await fixture<ZnRevealEdit>(html`
      <zn-reveal-edit value="real@example.com" display-value="*****@example.com"></zn-reveal-edit>
    `);
    await el.updateComplete;
    const display = el.shadowRoot!.querySelector('.re__display')!;
    expect(display.textContent?.trim()).to.equal('*****@example.com');
  });

  it('should not expose the real value in display mode', async () => {
    const el = await fixture<ZnRevealEdit>(html`
      <zn-reveal-edit value="real@example.com" display-value="*****@example.com"></zn-reveal-edit>
    `);
    await el.updateComplete;
    const display = el.shadowRoot!.querySelector('.re__display')!;
    expect(display.textContent?.trim()).to.not.equal('real@example.com');
  });

  it('should reflect the value property', async () => {
    const el = await fixture<ZnRevealEdit>(html`
      <zn-reveal-edit value="real@example.com" display-value="*****@example.com"></zn-reveal-edit>
    `);
    await el.updateComplete;
    expect(el.value).to.equal('real@example.com');
  });

  it('should update the value property programmatically', async () => {
    const el = await fixture<ZnRevealEdit>(html`
      <zn-reveal-edit value="first@example.com" display-value="*****@example.com"></zn-reveal-edit>
    `);
    await el.updateComplete;
    el.value = 'updated@example.com';
    await el.updateComplete;
    expect(el.value).to.equal('updated@example.com');
  });

  // -- Hover reveal --

  it('should reveal the real value on mouseenter', async () => {
    const el = await fixture<ZnRevealEdit>(html`
      <zn-reveal-edit value="real@example.com" display-value="*****@example.com"></zn-reveal-edit>
    `);
    await el.updateComplete;
    const display = el.shadowRoot!.querySelector('.re__display') as HTMLElement;
    display.dispatchEvent(new MouseEvent('mouseenter'));
    await el.updateComplete;
    expect(display.textContent?.trim()).to.equal('real@example.com');
  });

  it('should hide the real value on mouseleave', async () => {
    const el = await fixture<ZnRevealEdit>(html`
      <zn-reveal-edit value="real@example.com" display-value="*****@example.com"></zn-reveal-edit>
    `);
    await el.updateComplete;
    const display = el.shadowRoot!.querySelector('.re__display') as HTMLElement;
    display.dispatchEvent(new MouseEvent('mouseenter'));
    await el.updateComplete;
    display.dispatchEvent(new MouseEvent('mouseleave'));
    await el.updateComplete;
    expect(display.textContent?.trim()).to.equal('*****@example.com');
  });

  // -- Click to edit --

  it('should enter edit mode when the display area is clicked', async () => {
    const el = await fixture<ZnRevealEdit>(html`
      <zn-reveal-edit value="real@example.com" display-value="*****@example.com"></zn-reveal-edit>
    `);
    await el.updateComplete;
    const display = el.shadowRoot!.querySelector('.re__display') as HTMLElement;
    display.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.re--editing')).to.exist;
  });

  it('should not enter edit mode when the display area is clicked while disabled', async () => {
    const el = await fixture<ZnRevealEdit>(html`
      <zn-reveal-edit value="real@example.com" display-value="*****@example.com" disabled></zn-reveal-edit>
    `);
    await el.updateComplete;
    const display = el.shadowRoot!.querySelector('.re__display') as HTMLElement;
    display.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.re--editing')).to.not.exist;
  });

  it('should remain in edit mode on mouseleave when editing', async () => {
    const el = await fixture<ZnRevealEdit>(html`
      <zn-reveal-edit value="real@example.com" display-value="*****@example.com"></zn-reveal-edit>
    `);
    await el.updateComplete;
    const display = el.shadowRoot!.querySelector('.re__display') as HTMLElement;
    display.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    await el.updateComplete;
    display.dispatchEvent(new MouseEvent('mouseleave'));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.re--editing')).to.exist;
  });

  // -- clear-on-edit --

  it('should start with an empty input when clear-on-edit is set', async () => {
    const el = await fixture<ZnRevealEdit>(html`
      <zn-reveal-edit value="real@example.com" display-value="*****@example.com" clear-on-edit></zn-reveal-edit>
    `);
    await el.updateComplete;
    const display = el.shadowRoot!.querySelector('.re__display') as HTMLElement;
    display.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector('.re__input') as HTMLInputElement;
    expect(input.value).to.equal('');
  });

  it('should restore the display value on cancel when clear-on-edit is set', async () => {
    const el = await fixture<ZnRevealEdit>(html`
      <zn-reveal-edit value="real@example.com" display-value="*****@example.com" clear-on-edit></zn-reveal-edit>
    `);
    await el.updateComplete;
    const display = el.shadowRoot!.querySelector('.re__display') as HTMLElement;
    display.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    await el.updateComplete;
    const cancelBtn = el.shadowRoot!.querySelector('zn-button[icon="close"]') as HTMLElement;
    cancelBtn.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true}));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.re--editing')).to.not.exist;
    expect(el.value).to.equal('real@example.com');
    expect(display.textContent?.trim()).to.equal('*****@example.com');
  });

  it('should auto-cancel on outside click when clear-on-edit is set and nothing was typed', async () => {
    const el = await fixture<ZnRevealEdit>(html`
      <zn-reveal-edit value="real@example.com" display-value="*****@example.com" clear-on-edit></zn-reveal-edit>
    `);
    await el.updateComplete;
    const display = el.shadowRoot!.querySelector('.re__display') as HTMLElement;
    display.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    await el.updateComplete;
    document.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.re--editing')).to.not.exist;
    expect(el.value).to.equal('real@example.com');
  });

  it('should not pre-fill with clear-on-edit even without display-value set', async () => {
    const el = await fixture<ZnRevealEdit>(html`
      <zn-reveal-edit value="real@example.com" display-value="*****@example.com" clear-on-edit></zn-reveal-edit>
    `);
    await el.updateComplete;
    const editBtn = el.shadowRoot!.querySelector('.button--edit') as HTMLElement;
    editBtn.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true}));
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector('.re__input') as HTMLInputElement;
    expect(input.value).to.equal('');
  });

  // -- Edit mode --

  it('should enter edit mode when the edit button is clicked', async () => {
    const el = await fixture<ZnRevealEdit>(html`
      <zn-reveal-edit value="real@example.com" display-value="*****@example.com"></zn-reveal-edit>
    `);
    await el.updateComplete;
    const editBtn = el.shadowRoot!.querySelector('.button--edit') as HTMLElement;
    editBtn.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true}));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.re--editing')).to.exist;
  });

  it('should exit edit mode and restore the original value on ESC', async () => {
    const el = await fixture<ZnRevealEdit>(html`
      <zn-reveal-edit value="original@example.com" display-value="*****@example.com"></zn-reveal-edit>
    `);
    await el.updateComplete;
    const editBtn = el.shadowRoot!.querySelector('.button--edit') as HTMLElement;
    editBtn.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true}));
    await el.updateComplete;
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.re--editing')).to.not.exist;
    expect(el.value).to.equal('original@example.com');
  });

  it('should exit edit mode and restore the original value when the cancel button is clicked', async () => {
    const el = await fixture<ZnRevealEdit>(html`
      <zn-reveal-edit value="original@example.com" display-value="*****@example.com"></zn-reveal-edit>
    `);
    await el.updateComplete;
    const editBtn = el.shadowRoot!.querySelector('.button--edit') as HTMLElement;
    editBtn.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true}));
    await el.updateComplete;
    const cancelBtn = el.shadowRoot!.querySelector('zn-button[icon="close"]') as HTMLElement;
    cancelBtn.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true}));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.re--editing')).to.not.exist;
    expect(el.value).to.equal('original@example.com');
  });

  it('should submit and exit edit mode when Enter is pressed', async () => {
    const el = await fixture<ZnRevealEdit>(html`
      <zn-reveal-edit value="real@example.com" display-value="*****@example.com"></zn-reveal-edit>
    `);
    await el.updateComplete;
    const editBtn = el.shadowRoot!.querySelector('.button--edit') as HTMLElement;
    editBtn.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true}));
    await el.updateComplete;
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.re--editing')).to.not.exist;
  });

  // -- Disabled state --

  it('should apply the disabled class when disabled', async () => {
    const el = await fixture<ZnRevealEdit>(html`
      <zn-reveal-edit value="real@example.com" display-value="*****@example.com" disabled></zn-reveal-edit>
    `);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.re--disabled')).to.exist;
  });

  it('should not enter edit mode when disabled', async () => {
    const el = await fixture<ZnRevealEdit>(html`
      <zn-reveal-edit value="real@example.com" display-value="*****@example.com" disabled></zn-reveal-edit>
    `);
    await el.updateComplete;
    const editBtn = el.shadowRoot!.querySelector('.button--edit') as HTMLElement;
    editBtn.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true}));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.re--editing')).to.not.exist;
  });

  // -- Form participation --

  it('should include the real value in form data', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <zn-reveal-edit name="email" value="real@example.com" display-value="*****@example.com"></zn-reveal-edit>
      </form>
    `);
    const el = form.querySelector<ZnRevealEdit>('zn-reveal-edit')!;
    await el.updateComplete;
    const formData = new FormData(form);
    expect(formData.has('email')).to.be.true;
    expect(formData.get('email')).to.equal('real@example.com');
  });

  it('should submit the masked display-value is not used as the form value', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <zn-reveal-edit name="email" value="real@example.com" display-value="*****@example.com"></zn-reveal-edit>
      </form>
    `);
    const el = form.querySelector<ZnRevealEdit>('zn-reveal-edit')!;
    await el.updateComplete;
    const formData = new FormData(form);
    expect(formData.get('email')).to.not.equal('*****@example.com');
  });

});
