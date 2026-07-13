import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-chat-message-attachment>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`
      <zn-chat-message>
        <zn-chat-message-attachment href="#" name="file.pdf"></zn-chat-message-attachment>
      </zn-chat-message>`);

    const attachment = el.querySelector('zn-chat-message-attachment');
    expect(attachment).to.exist;
  });

  it('should auto-assign itself to the attachments slot', async () => {
    const el = await fixture(html`
      <zn-chat-message>
        <zn-chat-message-attachment href="#" name="file.pdf"></zn-chat-message-attachment>
      </zn-chat-message>`);

    const attachment = el.querySelector('zn-chat-message-attachment');
    expect(attachment?.getAttribute('slot')).to.equal('attachments');
  });

  it('should reveal the attachments row when an attachment is slotted in', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-chat-message message="Test">
        <zn-chat-message-attachment href="#" name="file.pdf"></zn-chat-message-attachment>
      </zn-chat-message>`);

    const row = el.shadowRoot!.querySelector('.message__attachments') as HTMLElement;
    // The row is display:none until something is slotted in; a slotted attachment must reveal it.
    expect(getComputedStyle(row).display).to.not.equal('none');
  });

  it('should render the name in the link', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-chat-message>
        <zn-chat-message-attachment href="https://example.com/file.pdf" name="file.pdf"></zn-chat-message-attachment>
      </zn-chat-message>`);

    const attachment = el.querySelector('zn-chat-message-attachment')!;
    const link = attachment.shadowRoot!.querySelector('a')!;
    expect(link.getAttribute('href')).to.equal('https://example.com/file.pdf');
    expect(link.textContent).to.contain('file.pdf');
  });
});
