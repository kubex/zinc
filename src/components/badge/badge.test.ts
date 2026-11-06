import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

const base = (el: HTMLElement) => el.shadowRoot!.querySelector<HTMLElement>('[part="base"]')!;

describe('<zn-badge>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-badge></zn-badge> `);

    expect(el).to.exist;
  });

  it('applies the type, size, solid and dot classes', async () => {
    const el = await fixture<HTMLElement>(html`<zn-badge type="success" size="large" solid dot>Large</zn-badge>`);

    expect([...base(el).classList]).to.include.members(
      ['badge--success', 'badge--large', 'badge--solid', 'badge--dot']);
  });

  it('shows the sparkle icon only on ai badges', async () => {
    const ai = await fixture<HTMLElement>(html`<zn-badge type="ai">AI suggested</zn-badge>`);
    const info = await fixture<HTMLElement>(html`<zn-badge type="info">Trial</zn-badge>`);

    expect(ai.shadowRoot!.querySelector('zn-icon')).to.exist;
    expect(info.shadowRoot!.querySelector('zn-icon')).to.not.exist;
  });

  it('fills a solid badge with its type colour', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-badge type="danger" solid style="--zn-color-danger-solid: rgb(217, 46, 75)">Urgent</zn-badge>`);

    expect(getComputedStyle(base(el)).backgroundColor).to.equal('rgb(217, 46, 75)');
  });
});

describe('<zn-badge> with options', () => {
  const statusBadge = () => fixture<HTMLElement & {value: string}>(html`
    <zn-badge value="open">
      <zn-option value="new" type="info" dot>New</zn-option>
      <zn-option value="open" type="success" dot>Open</zn-option>
    </zn-badge>`);

  it('shows the selected option as a button styled by that option', async () => {
    const el = await statusBadge();

    expect(base(el).tagName).to.equal('BUTTON');
    expect(base(el).textContent!.trim()).to.equal('Open');
    expect([...base(el).classList]).to.include.members(['badge--success', 'badge--dot']);
    expect(base(el).querySelector('.badge__caret')).to.exist;
  });

  it('checks the selected item and changes value on select', async () => {
    const el = await statusBadge();
    const items = [...el.shadowRoot!.querySelectorAll<HTMLElement & {checked: boolean}>('zn-menu-item')];
    expect(items.map(i => i.checked)).to.deep.equal([false, true]);

    let changed = 0;
    el.addEventListener('zn-change', () => changed++);
    items[0].click();
    await (el as unknown as {updateComplete: Promise<void>}).updateComplete;

    expect(el.value).to.equal('new');
    expect(changed).to.equal(1);
    expect(base(el).textContent!.trim()).to.equal('New');
    expect([...base(el).classList]).to.include('badge--info');
  });

  it('submits the picked value under its name with trigger-submit', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <zn-badge name="level" value="member" trigger-submit>
          <zn-option value="member">Member</zn-option>
          <zn-option value="admin" type="info">Admin</zn-option>
        </zn-badge>
      </form>`);
    const el = form.querySelector('zn-badge')!;
    await (el as unknown as {updateComplete: Promise<void>}).updateComplete;

    let submitted: string | null = null;
    form.addEventListener('submit', e => {
      e.preventDefault();
      submitted = new FormData(form).get('level') as string;
    });
    el.shadowRoot!.querySelectorAll<HTMLElement>('zn-menu-item')[1].click();
    await (el as unknown as {updateComplete: Promise<void>}).updateComplete;

    expect(submitted).to.equal('admin');
  });

  it('hides its tooltip while the menu is open', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-badge value="open" tooltip="Change status">
        <zn-option value="new">New</zn-option>
        <zn-option value="open">Open</zn-option>
      </zn-badge>`);
    const tooltip = el.shadowRoot!.querySelector<HTMLElement & {disabled: boolean}>('zn-tooltip')!;
    const dropdown = el.shadowRoot!.querySelector<HTMLElement & {show: () => Promise<void>; hide: () => Promise<void>}>('zn-dropdown')!;
    const updated = () => (el as unknown as {updateComplete: Promise<void>}).updateComplete;

    await dropdown.show();
    await updated();
    expect(tooltip.disabled).to.be.true;

    await dropdown.hide();
    await updated();
    expect(tooltip.disabled).to.be.false;
  });
});
