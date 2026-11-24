import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
import type ZnMenu from './menu.component';

describe('<zn-menu>', () => {
  it('should draw a slotted hr as a divider', async () => {
    const el = await fixture(html`<zn-menu><zn-menu-item>Edit</zn-menu-item><hr><zn-menu-item>Delete</zn-menu-item></zn-menu>`);
    const style = getComputedStyle(el.querySelector('hr')!);
    expect(style.borderTopStyle).to.equal('solid');
    expect(style.borderBottomStyle).to.equal('none');
  });

  it('should render a component', async () => {
    const el = await fixture(html` <zn-menu></zn-menu> `);

    expect(el).to.exist;
  });

  it('should skip labels in keyboard navigation', async () => {
    const el = await fixture<ZnMenu>(html`
      <zn-menu><zn-menu-label>Customer</zn-menu-label><zn-menu-item>Send email</zn-menu-item></zn-menu>
    `);
    expect(el.getAllItems().map(item => item.textContent!.trim())).to.deep.equal(['Send email']);
  });

  it('should render labels, dividers, colours and shortcuts from actions', async () => {
    const el = await fixture<ZnMenu>(html`<zn-menu></zn-menu>`);
    el.actions = [
      {type: 'label', title: 'Customer'},
      {title: 'Send email', shortcut: 'E', path: '#'},
      {type: 'divider'},
      {title: 'Delete', color: 'error', path: '#'},
    ] as unknown as ZnMenu['actions'];
    await el.updateComplete;

    const root = el.shadowRoot!;
    expect(root.querySelector('zn-menu-label')!.textContent).to.equal('Customer');
    expect(root.querySelector('.menu > hr')).to.exist;
    const items = [...root.querySelectorAll('zn-menu-item')];
    expect(items[0].getAttribute('shortcut')).to.equal('E');
    expect(items[1].getAttribute('color')).to.equal('error');
  });

  it('ticks one radio item at a time', async () => {
    const menu = await fixture<ZnMenu>(html`
      <zn-menu>
        <zn-menu-item type="radio" value="newest" checked>Newest first</zn-menu-item>
        <zn-menu-item type="radio" value="oldest">Oldest first</zn-menu-item>
      </zn-menu>
    `);
    const [newest, oldest] = [...menu.querySelectorAll<HTMLElement & {checked: boolean; updateComplete: Promise<boolean>}>('zn-menu-item')];
    expect(oldest.getAttribute('role')).to.equal('menuitemradio');

    oldest.click();
    expect([newest.checked, oldest.checked]).to.deep.equal([false, true]);
    await oldest.updateComplete;
    expect(oldest.getAttribute('aria-checked')).to.equal('true');
  });
});
