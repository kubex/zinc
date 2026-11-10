import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
import type ZnButton from "./button.component";

const variants = ['default', 'primary', 'secondary', 'success', 'neutral', 'warning', 'danger', 'text']

describe('<zn-button>', () => {

  describe('accessibility tests', () => {
    variants.forEach(variant => {
      it(`should be accessible when variant is "${variant}"`, async () => {
        const el = await fixture<ZnButton>(html`<zn-button variant="${variant}">Button Label</zn-button>`)
        await expect(el).to.be.accessible();
      });
    });
  });

  describe('when provided no parameters', () => {
    it('passes accessibility test', async () => {
      const el = await fixture<ZnButton>(html`<zn-button>Button Label</zn-button>`);
      await expect(el).to.be.accessible();
    });
  });

  it('default values are set correctly', async () => {
    const el = await fixture<ZnButton>(html`<zn-button>Button Label</zn-button>`);

    expect(el.title).to.equal('');
    expect(el.color).to.equal('default');
  });

  it('forwards aria-pressed to the inner button', async () => {
    const el = await fixture<ZnButton>(html`<zn-button icon="sun" label="Toggle" aria-pressed="true"></zn-button>`);
    const base = el.shadowRoot!.querySelector('[part~="base"]')!;
    expect(base.getAttribute('aria-pressed')).to.equal('true');

    el.setAttribute('aria-pressed', 'false');
    await el.updateComplete;
    expect(base.getAttribute('aria-pressed')).to.equal('false');
  });

  it('forwards aria-expanded and aria-haspopup to the inner button', async () => {
    const el = await fixture<ZnButton>(html`<zn-button aria-haspopup="dialog" aria-expanded="false">Menu</zn-button>`);
    const base = el.shadowRoot!.querySelector('[part~="base"]')!;
    expect(base.getAttribute('aria-haspopup')).to.equal('dialog');
    expect(base.getAttribute('aria-expanded')).to.equal('false');

    el.setAttribute('aria-expanded', 'true');
    await el.updateComplete;
    expect(base.getAttribute('aria-expanded')).to.equal('true');

    const plain = await fixture<ZnButton>(html`<zn-button>Plain</zn-button>`);
    const plainBase = plain.shadowRoot!.querySelector('[part~="base"]')!;
    expect(plainBase.hasAttribute('aria-expanded')).to.be.false;
    expect(plainBase.hasAttribute('aria-haspopup')).to.be.false;
  });

  it('applies size classes', async () => {
    const el = await fixture<ZnButton>(html`<zn-button size="small">Small</zn-button>`);
    const base = el.shadowRoot!.querySelector('[part~="base"]')!;
    expect(base.classList.contains('button--small')).to.be.true;

    el.size = 'large';
    await el.updateComplete;
    expect(base.classList.contains('button--small')).to.be.false;
    expect(base.classList.contains('button--large')).to.be.true;
  });

  it('keeps the filled style when solid overrides text', async () => {
    const el = await fixture<ZnButton>(html`<zn-button text solid color="primary">Create</zn-button>`);
    const base = el.shadowRoot!.querySelector('[part~="base"]')!;
    expect(base.classList.contains('button--standard')).to.be.true;
    expect(base.classList.contains('button--text')).to.be.false;
  });

  it('applies the ai color', async () => {
    const el = await fixture<ZnButton>(html`<zn-button color="ai">Summarise</zn-button>`);
    const base = el.shadowRoot!.querySelector('[part~="base"]')!;
    expect(base.classList.contains('button--ai')).to.be.true;
    await expect(el).to.be.accessible();
  });


  it('submits to its formaction, with its name and value', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form action="/default">
        <zn-button type="submit" formaction="/add" name="intent" value="add">Add</zn-button>
      </form>
    `);
    const button = form.querySelector('zn-button')! as HTMLElement & {updateComplete: Promise<unknown>};
    await button.updateComplete;

    let action = '';
    let intent: FormDataEntryValue | null = null;
    form.addEventListener('submit', (e: SubmitEvent) => {
      e.preventDefault();
      action = e.submitter!.getAttribute('formaction') ?? '';
      intent = new FormData(form, e.submitter).get('intent');
    });
    button.click();

    expect(action).to.equal('/add');
    expect(intent).to.equal('add');
  });

  it('submits when the click targets the host', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form action="/default">
        <zn-button type="submit" icon="check">Save</zn-button>
      </form>
    `);
    const button = form.querySelector('zn-button')! as HTMLElement & {updateComplete: Promise<unknown>};
    await button.updateComplete;

    let submits = 0;
    form.addEventListener('submit', (e: SubmitEvent) => {
      e.preventDefault();
      submits++;
    });
    button.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true}));
    button.shadowRoot!.querySelector('button')!.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true}));

    expect(submits).to.equal(2);
  });

  it('keeps an icon-only submit button free of loading text', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form action="/default">
        <zn-button type="submit" icon="check" icon-button="small"></zn-button>
      </form>
    `);
    const button = form.querySelector('zn-button')! as HTMLElement & {updateComplete: Promise<unknown>};
    await button.updateComplete;
    form.addEventListener('submit', (e: SubmitEvent) => e.preventDefault());

    button.click();
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(button.innerHTML.trim()).to.equal('');
  });

  describe('long press menu', () => {
    const menuFixture = () => fixture<ZnButton>(html`
      <zn-button long-press-delay="50">
        Send
        <zn-menu slot="menu">
          <zn-menu-item value="draft">Save as draft</zn-menu-item>
        </zn-menu>
      </zn-button>
    `);

    const press = (base: Element, type: string) =>
      base.dispatchEvent(new PointerEvent(type, {bubbles: true, composed: true, button: 0, clientX: 5, clientY: 5}));

    it('announces the menu on the inner button', async () => {
      const el = await menuFixture();
      const base = el.shadowRoot!.querySelector('[part~="base"]')!;
      expect(base.getAttribute('aria-haspopup')).to.equal('menu');
      expect(base.getAttribute('aria-expanded')).to.equal('false');
    });

    it('runs the click action on a short press', async () => {
      const el = await menuFixture();
      const base = el.shadowRoot!.querySelector('[part~="base"]')! as HTMLElement;
      let clicks = 0;
      el.addEventListener('click', () => clicks++);

      press(base, 'pointerdown');
      press(document.body, 'pointerup');
      base.click();

      expect(clicks).to.equal(1);
      expect(el.menuDropdown.open).to.be.false;
    });

    it('opens the menu on a long press and swallows the click that ends it', async () => {
      const el = await menuFixture();
      const base = el.shadowRoot!.querySelector('[part~="base"]')! as HTMLElement;
      let clicks = 0;
      el.addEventListener('click', () => clicks++);

      press(base, 'pointerdown');
      await new Promise(resolve => setTimeout(resolve, 100));
      press(document.body, 'pointerup');
      base.click();

      expect(el.menuDropdown.open).to.be.true;
      expect(clicks).to.equal(0);
      expect(base.getAttribute('aria-expanded')).to.equal('true');
    });

    it('opens the menu with ArrowDown', async () => {
      const el = await menuFixture();
      const base = el.shadowRoot!.querySelector('[part~="base"]')!;

      base.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true, composed: true}));
      await el.menuDropdown.updateComplete;

      expect(el.menuDropdown.open).to.be.true;
    });

    it('renders no dropdown without a menu', async () => {
      const el = await fixture<ZnButton>(html`<zn-button>Plain</zn-button>`);
      expect(el.shadowRoot!.querySelector('zn-dropdown')).to.be.null;
    });
  });

  it('shows processing while a request it started is in flight with processing-on-request', async () => {
    const el = await fixture<ZnButton>(html`<zn-button href="/x" processing-on-request>Refresh</zn-button>`);
    el.dispatchEvent(new CustomEvent('requested', {bubbles: true}));
    expect(el.processing).to.be.true;
    el.dispatchEvent(new CustomEvent('complete', {bubbles: true}));
    expect(el.processing).to.be.false;
  });

  it('ignores request events without processing-on-request', async () => {
    const el = await fixture<ZnButton>(html`<zn-button href="/x">Go</zn-button>`);
    el.dispatchEvent(new CustomEvent('requested', {bubbles: true}));
    expect(el.processing).to.be.false;
  });
});
