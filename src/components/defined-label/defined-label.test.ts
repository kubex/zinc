import '../../../dist/zn.min.js';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import type ZnDefinedLabel from './defined-label.component';

const predefined = [
  { name: 'outbound', options: [] },
  { name: 'another', options: ['one', 'two'] }
];

async function fixtureWithForm() {
  const form: HTMLFormElement = await fixture(html`
    <form>
      <zn-defined-label allow-custom name="label" .predefinedLabels="${predefined}"></zn-defined-label>
    </form>`);

  const el = form.querySelector<ZnDefinedLabel>('zn-defined-label')!;
  await el.updateComplete;

  const submissions: string[] = [];
  form.addEventListener('submit', event => {
    event.preventDefault();
    submissions.push([...new FormData(form).entries()].map(([key, value]) => `${key}=${String(value)}`).join('&'));
  });

  return { el, submissions };
}

async function type(el: ZnDefinedLabel, control: Element, text: string) {
  const native = control.shadowRoot!.querySelector('input')!;
  native.focus();

  for (const character of text) {
    native.value += character;
    native.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    await el.updateComplete;
  }
}

function rows(el: ZnDefinedLabel) {
  return [...(el.shadowRoot?.querySelectorAll('.defined-label__row') ?? [])];
}

function rowLabels(el: ZnDefinedLabel) {
  return rows(el).map(row => row.querySelector('.defined-label__row-label')?.textContent);
}

async function clickAdd(row: Element, submissions: string[]) {
  const button = row.querySelector('zn-button')!.shadowRoot!.querySelector('button')!;
  button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }));
  button.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
  await waitUntil(() => submissions.length > 0, 'the form never submitted');
}

describe('<zn-defined-label>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-defined-label></zn-defined-label> `);

    expect(el).to.exist;
  });

  it('should offer a custom row alongside partially matching predefined labels', async () => {
    const { el } = await fixtureWithForm();

    await type(el, el.input, 'out');

    expect(rowLabels(el)).to.eql(['outbound', 'out']);
  });

  it('should keep the typed key when a value is entered on a partially matching predefined row', async () => {
    const { el } = await fixtureWithForm();

    await type(el, el.input, 'out');
    await type(el, rows(el)[0].querySelector('.defined-label__value')!, 'x');

    expect(el.value).to.equal('out');
    expect(rowLabels(el)).to.eql(['outbound', 'out']);
  });

  it('should submit the typed key from the custom row, not a partially matching predefined label', async () => {
    const { el, submissions } = await fixtureWithForm();

    await type(el, el.input, 'out');
    await type(el, rows(el)[1].querySelector('.defined-label__value')!, 'bob');
    await clickAdd(rows(el)[1], submissions);

    expect(submissions[0]).to.equal('label=out:bob');
  });

  it('should submit the predefined key when its own row is added', async () => {
    const { el, submissions } = await fixtureWithForm();

    await type(el, el.input, 'out');
    await type(el, rows(el)[0].querySelector('.defined-label__value')!, 'x');
    await clickAdd(rows(el)[0], submissions);

    expect(submissions[0]).to.equal('label=outbound:x');
  });

  it('should discard a value left on another row', async () => {
    const { el, submissions } = await fixtureWithForm();

    await type(el, el.input, 'out');
    await type(el, rows(el)[0].querySelector('.defined-label__value')!, 'x');
    await clickAdd(rows(el)[1], submissions);

    expect(submissions[0]).to.equal('label=out');
  });

  it('should not duplicate a predefined label as a custom row', async () => {
    const { el } = await fixtureWithForm();

    await type(el, el.input, 'outbound');

    expect(rowLabels(el)).to.eql(['outbound']);
  });
});
