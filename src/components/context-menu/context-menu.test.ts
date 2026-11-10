import '../../../dist/zn.min.js';
import {expect, fixture, html, oneEvent} from '@open-wc/testing';
import type ZnContextMenu from './context-menu.component';

describe('<zn-context-menu>', () => {
  it('opens its menu at the pointer on right-click and closes on selection', async () => {
    const el = await fixture<ZnContextMenu>(html`
      <zn-context-menu>
        <p>Content</p>
        <zn-menu slot="menu"><zn-menu-item value="one">One</zn-menu-item></zn-menu>
      </zn-context-menu>`);
    const event = new MouseEvent('contextmenu', {bubbles: true, composed: true, cancelable: true, clientX: 20, clientY: 10});

    el.querySelector('p')!.dispatchEvent(event);
    await oneEvent(el.dropdown, 'zn-after-show');
    expect(event.defaultPrevented).to.be.true;
    expect(el.dropdown.open).to.be.true;
    expect(el.hasAttribute('open')).to.be.true;

    el.querySelector<HTMLElement>('zn-menu-item')!.click();
    await oneEvent(el.dropdown, 'zn-after-hide');
    expect(el.dropdown.open).to.be.false;
    expect(el.hasAttribute('open')).to.be.false;
  });

  it('leaves the browser menu alone when disabled', async () => {
    const el = await fixture<ZnContextMenu>(html`
      <zn-context-menu disabled>
        <p>Content</p>
        <zn-menu slot="menu"><zn-menu-item>One</zn-menu-item></zn-menu>
      </zn-context-menu>`);
    const event = new MouseEvent('contextmenu', {bubbles: true, composed: true, cancelable: true});

    el.querySelector('p')!.dispatchEvent(event);
    expect(event.defaultPrevented).to.be.false;
  });

  it('opens from a context-menu-trigger click without toggling a surrounding details', async () => {
    const el = await fixture<ZnContextMenu>(html`
      <zn-context-menu>
        <details><summary>Row <button context-menu-trigger>More</button></summary>Body</details>
        <zn-menu slot="menu"><zn-menu-item>One</zn-menu-item></zn-menu>
      </zn-context-menu>`);

    el.querySelector('button')!.click();
    await oneEvent(el.dropdown, 'zn-after-show');
    expect(el.dropdown.open).to.be.true;
    expect(el.querySelector('details')!.open).to.be.false;
  });

  it('submits the form a menu item names', async () => {
    const el = await fixture<HTMLElement>(html`
      <div>
        <form id="ctx-form"></form>
        <zn-menu><zn-menu-item form="ctx-form">Go</zn-menu-item></zn-menu>
      </div>`);
    const form = el.querySelector('form')!;
    let submitted = false;
    form.addEventListener('submit', e => {
      e.preventDefault();
      submitted = true;
    });

    el.querySelector<HTMLElement>('zn-menu-item')!.click();
    expect(submitted).to.be.true;
  });
});
