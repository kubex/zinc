import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

const click = (el: Element) => el.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));

const settle = (form: HTMLFormElement, type: string, detail: unknown) =>
  form.dispatchEvent(new CustomEvent(type, {detail}));

async function submittedConfirm() {
  const el = await fixture<HTMLElement>(html`
    <div>
      <zn-confirm caption="Deploy" show-loading>
        <form action="/deploy" method="post"></form>
      </zn-confirm>
    </div>
  `);
  const confirm = el.querySelector('zn-confirm')!;
  await (confirm as never as {updateComplete: Promise<void>}).updateComplete;

  const form = confirm.querySelector('form')!;
  form.addEventListener('submit', e => e.preventDefault());

  (confirm as never as {show: () => void}).show();
  await (confirm as never as {updateComplete: Promise<void>}).updateComplete;

  const dialog = confirm.shadowRoot!.querySelector('zn-dialog')!;
  const buttons = confirm.shadowRoot!.querySelectorAll('zn-button[slot="footer"]');
  click(buttons[1]);
  await (confirm as never as {updateComplete: Promise<void>}).updateComplete;

  return {confirm, form, dialog};
}

const closer = (dialog: Element) => dialog.shadowRoot!.querySelector('.dialog__close')!;

describe('<zn-confirm-modal>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-confirm-modal></zn-confirm-modal> `);

    expect(el).to.exist;
  });

  it('connects a trigger whose id contains CSS syntax characters', async () => {
    const id = 'delete-enum-cloud_hosting_&_infrastructure';
    const el = await fixture<HTMLElement>(html`
      <div>
        <button id="${id}">Delete</button>
        <zn-confirm trigger="${id}" caption="Delete"></zn-confirm>
      </div>
    `);
    const confirm = el.querySelector<HTMLElement & {updateComplete: Promise<void>}>('zn-confirm')!;
    await confirm.updateComplete;

    // An unescaped `#id` selector throws a SyntaxError here, leaving the component unrendered.
    expect(confirm.shadowRoot!.querySelector('zn-dialog')).to.exist;
  });

  it('shows loading until the submitted request settles', async () => {
    const {confirm} = await submittedConfirm();

    expect(confirm.shadowRoot!.textContent).to.contain('Loading');
  });

  it('reports failure when the response carries a danger alert', async () => {
    const {confirm, form, dialog} = await submittedConfirm();

    settle(form, 'complete', {
      response: {status: 200, actions: [{action: 'alert', style: 'error', title: 'Deployment stopped'}]}
    });
    await (confirm as never as {updateComplete: Promise<void>}).updateComplete;

    expect(confirm.shadowRoot!.textContent).to.contain('Failed');
    expect(confirm.shadowRoot!.textContent).to.contain('Deployment stopped');
    expect(confirm.shadowRoot!.textContent).to.not.contain('Loading');
    expect(closer(dialog).disabled).to.be.false;
  });

  it('offers only a close button once the request has failed', async () => {
    const {confirm, form} = await submittedConfirm();

    settle(form, 'error', {});
    await (confirm as never as {updateComplete: Promise<void>}).updateComplete;

    const buttons = confirm.shadowRoot!.querySelectorAll('zn-button[slot="footer"]');
    expect(buttons.length).to.equal(1);
    expect(buttons[0].textContent!.trim()).to.equal('Close');
    expect(buttons[0].hasAttribute('dialog-closer')).to.be.true;
  });

  it('reports failure when the request errors', async () => {
    const {confirm, form, dialog} = await submittedConfirm();

    settle(form, 'error', {});
    await (confirm as never as {updateComplete: Promise<void>}).updateComplete;

    expect(confirm.shadowRoot!.textContent).to.contain('Failed');
    expect(closer(dialog).disabled).to.be.false;
  });

  it('closes when the submitted request succeeds', async () => {
    const {confirm, form, dialog} = await submittedConfirm();

    settle(form, 'complete', {response: {status: 200, actions: [{action: 'alert', style: 'success', title: 'Deployed'}]}});
    await (confirm as never as {updateComplete: Promise<void>}).updateComplete;

    expect((dialog as HTMLElement & {open: boolean}).open).to.be.false;
    expect(closer(dialog).disabled).to.be.false;
  });

  it('clears a previous failure when reopened', async () => {
    const {confirm, form} = await submittedConfirm();
    settle(form, 'error', {});
    await (confirm as never as {updateComplete: Promise<void>}).updateComplete;

    (confirm as never as {show: () => void}).show();
    await (confirm as never as {updateComplete: Promise<void>}).updateComplete;

    expect(confirm.shadowRoot!.textContent).to.not.contain('Failed');
  });
});
