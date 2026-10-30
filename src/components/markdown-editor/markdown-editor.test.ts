import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';

describe('<zn-markdown-editor>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`
      <zn-markdown-editor></zn-markdown-editor>`);
    expect(el).to.exist;
  });

  it('should accept an initial value', async () => {
    const el = await fixture<HTMLElement & { value: string }>(html`
      <zn-markdown-editor value="# hello"></zn-markdown-editor>`);
    expect(el.value).to.equal('# hello');
  });

  it('should read value from light-DOM text content when no value is set', async () => {
    const el = await fixture<HTMLElement & { value: string }>(html`
      <zn-markdown-editor>Body text</zn-markdown-editor>`);
    expect(el.value).to.equal('Body text');
  });
});
