import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
import type ZnInlineEdit from './inline-edit.component';
import type ZnSelect from '../select/select.component';

describe('<zn-inline-edit>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-inline-edit></zn-inline-edit> `);
    expect(el).to.exist;
  });

  // -- Text input (default) --

  it('should render a text input by default', async () => {
    const el = await fixture<ZnInlineEdit>(
      html`<zn-inline-edit value="hello"></zn-inline-edit>`
    );
    await el.updateComplete;

    const input = el.shadowRoot?.querySelector('zn-input');
    expect(input).to.exist;
    expect(el.value).to.equal('hello');
  });

  it('should update value on text input', async () => {
    const el = await fixture<ZnInlineEdit>(
      html`<zn-inline-edit value="hello"></zn-inline-edit>`
    );
    await el.updateComplete;

    el.value = 'world';
    await el.updateComplete;

    expect(el.value).to.equal('world');
  });

  // -- Number input --

  it('should render a number input when input-type is number', async () => {
    const el = await fixture<ZnInlineEdit>(
      html`<zn-inline-edit input-type="number" value="42"></zn-inline-edit>`
    );
    await el.updateComplete;

    const input = el.shadowRoot?.querySelector('zn-input');
    expect(input).to.exist;
    expect(el.value).to.equal('42');
  });

  // -- Textarea --

  it('should render a textarea when input-type is textarea', async () => {
    const el = await fixture<ZnInlineEdit>(
      html`<zn-inline-edit input-type="textarea" value="long text"></zn-inline-edit>`
    );
    await el.updateComplete;

    const textarea = el.shadowRoot?.querySelector('zn-textarea');
    expect(textarea).to.exist;
    expect(el.value).to.equal('long text');
  });

  // -- Single select --

  it('should render a select when input-type is select', async () => {
    const el = await fixture<ZnInlineEdit>(html`
      <zn-inline-edit input-type="select" value="a">
        <zn-option value="a">Option A</zn-option>
        <zn-option value="b">Option B</zn-option>
      </zn-inline-edit>
    `);
    await el.updateComplete;

    const select = el.shadowRoot?.querySelector('zn-select') as ZnSelect;
    expect(select).to.exist;
    expect(el.value).to.equal('a');
  });

  it('should render a select from options property', async () => {
    const el = await fixture<ZnInlineEdit>(html`
      <zn-inline-edit value="x" .options=${{ x: 'X Label', y: 'Y Label' }}></zn-inline-edit>
    `);
    await el.updateComplete;

    const select = el.shadowRoot?.querySelector('zn-select') as ZnSelect;
    expect(select).to.exist;
    expect(el.value).to.equal('x');
  });

  // -- Multiple select --

  it('should accept a space-delimited value attribute for multi-select', async () => {
    const el = await fixture<ZnInlineEdit>(html`
      <zn-inline-edit input-type="select" value="a b" multiple>
        <zn-option value="a">A</zn-option>
        <zn-option value="b">B</zn-option>
        <zn-option value="c">C</zn-option>
      </zn-inline-edit>
    `);
    await el.updateComplete;

    expect(el.value).to.deep.equal(['a', 'b']);
  });

  it('should accept an array value programmatically for multi-select', async () => {
    const el = await fixture<ZnInlineEdit>(html`
      <zn-inline-edit input-type="select" multiple>
        <zn-option value="a">A</zn-option>
        <zn-option value="b">B</zn-option>
        <zn-option value="c">C</zn-option>
      </zn-inline-edit>
    `);
    await el.updateComplete;

    el.value = ['a', 'c'];
    await el.updateComplete;

    expect(el.value).to.deep.equal(['a', 'c']);
  });

  it('should convert string value to array when multiple is set', async () => {
    const el = await fixture<ZnInlineEdit>(html`
      <zn-inline-edit input-type="select" multiple>
        <zn-option value="a">A</zn-option>
        <zn-option value="b">B</zn-option>
      </zn-inline-edit>
    `);
    await el.updateComplete;

    el.value = 'a b';
    await el.updateComplete;

    expect(el.value).to.deep.equal(['a', 'b']);
  });

  it('should pass multiple attribute to inner zn-select', async () => {
    const el = await fixture<ZnInlineEdit>(html`
      <zn-inline-edit input-type="select" multiple>
        <zn-option value="a">A</zn-option>
        <zn-option value="b">B</zn-option>
      </zn-inline-edit>
    `);
    await el.updateComplete;

    const select = el.shadowRoot?.querySelector('zn-select') as ZnSelect;
    expect(select).to.exist;
    expect(select.multiple).to.be.true;
  });

  it('should keep value as string when multiple is not set', async () => {
    const el = await fixture<ZnInlineEdit>(
      html`<zn-inline-edit value="hello"></zn-inline-edit>`
    );
    await el.updateComplete;

    expect(el.value).to.be.a('string');
    expect(el.value).to.equal('hello');
  });

  it('should parse multiple space-delimited IDs and pass them to the inner select', async () => {
    const el = await fixture<ZnInlineEdit>(html`
      <zn-inline-edit
        name="exit_offers"
        input-type="select"
        multiple
        value="1VGpJhp7pI62wSY04a6 6Yxa9ap7pI62wSAFFYf 8cwLe7p7pI62wSptw6C"
        size="medium">
        <zn-option value="1VGpJhp7pI62wSY04a6">Offer A</zn-option>
        <zn-option value="6Yxa9ap7pI62wSAFFYf">Offer B</zn-option>
        <zn-option value="8cwLe7p7pI62wSptw6C">Offer C</zn-option>
        <zn-option value="otherValue">Offer D</zn-option>
      </zn-inline-edit>
    `);
    await el.updateComplete;

    // Value should be an array of the 3 IDs
    expect(el.value).to.deep.equal([
      '1VGpJhp7pI62wSY04a6',
      '6Yxa9ap7pI62wSAFFYf',
      '8cwLe7p7pI62wSptw6C'
    ]);

    // Inner select should exist with multiple enabled
    const select = el.shadowRoot?.querySelector('zn-select') as ZnSelect;
    expect(select).to.exist;
    expect(select.multiple).to.be.true;

    // Inner select value should match
    await select.updateComplete;
    const selectValue = Array.isArray(select.value) ? select.value : [select.value];
    expect(selectValue).to.deep.equal([
      '1VGpJhp7pI62wSY04a6',
      '6Yxa9ap7pI62wSAFFYf',
      '8cwLe7p7pI62wSptw6C'
    ]);

    // The 3 matching options should be selected, the 4th should not
    const selectedOptions = select.selectedOptions;
    expect(selectedOptions.length).to.equal(3);
    expect(selectedOptions.map((o: any) => o.value)).to.deep.equal([
      '1VGpJhp7pI62wSY04a6',
      '6Yxa9ap7pI62wSAFFYf',
      '8cwLe7p7pI62wSptw6C'
    ]);
  });

  it('should select correct options when options are added after value is set (async load)', async () => {
    // Simulates data-uri behavior: value is set before options exist
    const el = await fixture<ZnInlineEdit>(html`
      <zn-inline-edit
        name="offers"
        input-type="select"
        multiple
        value="1VGpJhp7pI62wSY04a6 6Yxa9ap7pI62wSAFFYf 8cwLe7p7pI62wSptw6C"
        size="medium">
      </zn-inline-edit>
    `);
    await el.updateComplete;

    // Inline-edit value should be preserved as array even with no options yet
    expect(el.value).to.deep.equal([
      '1VGpJhp7pI62wSY04a6',
      '6Yxa9ap7pI62wSAFFYf',
      '8cwLe7p7pI62wSptw6C'
    ]);

    // Now simulate async option load by adding options to the inner select
    const select = el.shadowRoot?.querySelector('zn-select') as ZnSelect;
    expect(select).to.exist;

    const ids = ['1VGpJhp7pI62wSY04a6', '6Yxa9ap7pI62wSAFFYf', '8cwLe7p7pI62wSptw6C', 'otherValue'];
    const labels = ['40% Off', 'Ultimate Discount', '100% off', '30% Off'];
    ids.forEach((id, i) => {
      const opt = document.createElement('zn-option');
      opt.setAttribute('value', id);
      opt.textContent = labels[i];
      select.appendChild(opt);
    });

    // Trigger the select to re-process options and re-apply the value
    select.value = el.value;
    await select.updateComplete;

    // The 3 matching options should now be selected
    const selectValue = Array.isArray(select.value) ? select.value : [select.value];
    expect(selectValue).to.deep.equal([
      '1VGpJhp7pI62wSY04a6',
      '6Yxa9ap7pI62wSAFFYf',
      '8cwLe7p7pI62wSptw6C'
    ]);
  });

  // -- Empty value form data submission --

  it('should include empty select value in form data', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <zn-inline-edit name="myfield" input-type="select" value="">
          <zn-option value="a">Option A</zn-option>
          <zn-option value="b">Option B</zn-option>
        </zn-inline-edit>
      </form>
    `);
    await form.querySelector<ZnInlineEdit>('zn-inline-edit')!.updateComplete;

    // new FormData(form) fires the formdata event, triggering FormControlController injection
    const formData = new FormData(form);

    expect(formData.has('myfield')).to.be.true;
    expect(formData.get('myfield')).to.equal('');
  });

  it('should include empty select value in form data after clearing', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <zn-inline-edit name="myfield" input-type="select" value="a">
          <zn-option value="a">Option A</zn-option>
          <zn-option value="b">Option B</zn-option>
        </zn-inline-edit>
      </form>
    `);
    const el = form.querySelector<ZnInlineEdit>('zn-inline-edit')!;
    await el.updateComplete;

    el.value = '';
    await el.updateComplete;

    const formData = new FormData(form);

    expect(formData.has('myfield')).to.be.true;
    expect(formData.get('myfield')).to.equal('');
  });

  it('should include empty multiple select value in form data', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <zn-inline-edit name="tags" input-type="select" multiple value="">
          <zn-option value="a">A</zn-option>
          <zn-option value="b">B</zn-option>
        </zn-inline-edit>
      </form>
    `);
    const el = form.querySelector<ZnInlineEdit>('zn-inline-edit')!;
    await el.updateComplete;

    const formData = new FormData(form);

    expect(formData.has('tags')).to.be.true;
    expect(formData.get('tags')).to.equal('');
  });

  it('should flatten array to string when multiple is not set', async () => {
    const el = await fixture<ZnInlineEdit>(
      html`<zn-inline-edit value="hello"></zn-inline-edit>`
    );
    await el.updateComplete;

    el.value = ['a', 'b'] as any;
    await el.updateComplete;

    expect(el.value).to.equal('a b');
  });
});
