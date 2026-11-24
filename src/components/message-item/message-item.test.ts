import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';

describe('<zn-message-item>', () => {
  it('shows who, when, the subject and a preview', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-message-item caption="Ada" meta="2h" meta-title="Nov 20, 2026 10:00" subject="Refund" preview="Hi there"></zn-message-item>
    `);
    const part = (name: string) => el.shadowRoot!.querySelector<HTMLElement>(`[part="${name}"]`);

    expect(part('caption')!.textContent).to.equal('Ada');
    expect(part('meta')!.title).to.equal('Nov 20, 2026 10:00');
    expect(part('subject')!.textContent).to.equal('Refund');
    expect(part('preview')!.textContent).to.equal('Hi there');
    expect(el.getAttribute('role')).to.equal('tab');
  });

  it("follows zn-tabs's active class as its selection", async () => {
    const el = await fixture<HTMLElement>(html`<zn-message-item caption="Ada"></zn-message-item>`);
    expect(el.getAttribute('aria-selected')).to.equal('false');

    el.classList.add('zn-tb-active');
    await new Promise(resolve => setTimeout(resolve));
    expect(el.getAttribute('aria-selected')).to.equal('true');
  });

  it('draws an unread message bold', async () => {
    const read = await fixture<HTMLElement>(html`<zn-message-item caption="Ada" subject="Refund"></zn-message-item>`);
    const unread = await fixture<HTMLElement>(html`<zn-message-item caption="Ada" subject="Refund" unread></zn-message-item>`);
    const weight = (el: HTMLElement) => getComputedStyle(el.shadowRoot!.querySelector('[part="subject"]')!).fontWeight;

    expect(weight(unread)).to.equal('700');
    expect(weight(read)).to.not.equal('700');
  });

  it('draws a placeholder in place of its content while loading, and takes no part in the tabs', async () => {
    const el = await fixture<HTMLElement>(html`<zn-message-item loading caption="Ada"></zn-message-item>`);

    expect(el.shadowRoot!.querySelectorAll('zn-skeleton').length).to.be.greaterThan(2);
    expect(el.shadowRoot!.querySelector('[part="caption"]')).to.not.exist;
    expect(el.hasAttribute('role')).to.be.false;
  });

  it('keeps the height of a row with a subject and preview when they are empty', async () => {
    const full = await fixture<HTMLElement>(html`<zn-message-item caption="Ada" subject="Refund" preview="Hi there"></zn-message-item>`);
    const empty = await fixture<HTMLElement>(html`<zn-message-item caption="Ada"></zn-message-item>`);

    expect(empty.getBoundingClientRect().height).to.equal(full.getBoundingClientRect().height);
  });

  it('puts one row in the tab order and moves between rows with the arrow keys', async () => {
    const list = await fixture<HTMLElement>(html`
      <div>
        <zn-message-item caption="Ada"></zn-message-item>
        <zn-message-item caption="Grace"></zn-message-item>
        <zn-message-item caption="Alan"></zn-message-item>
      </div>
    `);
    const [ada, grace, alan] = [...list.querySelectorAll<HTMLElement>('zn-message-item')];
    expect([ada.tabIndex, grace.tabIndex, alan.tabIndex]).to.deep.equal([0, -1, -1]);

    ada.focus();
    ada.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true}));
    expect(document.activeElement).to.equal(grace);
    expect([ada.tabIndex, grace.tabIndex, alan.tabIndex]).to.deep.equal([-1, 0, -1]);

    grace.dispatchEvent(new KeyboardEvent('keydown', {key: 'End', bubbles: true}));
    expect(document.activeElement).to.equal(alan);
  });
});
