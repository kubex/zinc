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

  it('renders subtle instead of standard', async () => {
    const el = await fixture<ZnButton>(html`<zn-button subtle>Subtle</zn-button>`);
    const base = el.shadowRoot!.querySelector('[part~="base"]')!;
    expect(base.classList.contains('button--subtle')).to.be.true;
    expect(base.classList.contains('button--standard')).to.be.false;
  });

  it('ignores subtle on outline buttons', async () => {
    const el = await fixture<ZnButton>(html`<zn-button subtle outline>Outline</zn-button>`);
    const base = el.shadowRoot!.querySelector('[part~="base"]')!;
    expect(base.classList.contains('button--subtle')).to.be.false;
    expect(base.classList.contains('button--outline')).to.be.true;
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
});
