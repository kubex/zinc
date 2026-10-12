import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import type ZnDataTable from '../data-table';
import type ZnFilterWrapper from './filter-wrapper.component';
import type ZnInput from '../input';

describe('<zn-filter-wrapper>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-filter-wrapper></zn-filter-wrapper> `);

    expect(el).to.exist;
  });

  it('trims input values on submit', async () => {
    const table = await fixture<ZnDataTable>(html`
      <zn-data-table>
        <zn-filter-wrapper>
          <zn-input name="external_reference" value="  abc  "></zn-input>
        </zn-filter-wrapper>
      </zn-data-table>
    `);
    table.refresh = () => undefined;
    const wrapper = table.querySelector<ZnFilterWrapper>('zn-filter-wrapper')!;
    const input = table.querySelector<ZnInput>('zn-input')!;
    await input.updateComplete;

    wrapper.handleSubmit(new Event('click'));

    expect(table.requestParams).to.deep.equal({external_reference: 'abc'});
    expect(input.value).to.equal('abc');
  });

  it('clears displayed whitespace from a focused email input on submit', async () => {
    const table = await fixture<ZnDataTable>(html`
      <zn-data-table>
        <zn-filter-wrapper slot="filter-top">
          <zn-input name="email" type="email" style="width: 40px"></zn-input>
          <zn-input name="clean" type="email" value="a@b.com" style="width: 40px"></zn-input>
        </zn-filter-wrapper>
      </zn-data-table>
    `);
    table.refresh = () => undefined;
    const [input, clean] = table.querySelectorAll<ZnInput>('zn-input');
    await input.updateComplete;

    input.focus();
    await sendKeys({type: '  a@b.com'});
    expect(input.input.scrollWidth).to.be.greaterThan(clean.input.scrollWidth);

    table.querySelector<ZnFilterWrapper>('zn-filter-wrapper')!.handleSubmit(new Event('click'));

    expect(table.requestParams.email).to.equal('a@b.com');
    expect(input.input.scrollWidth).to.equal(clean.input.scrollWidth);
  });
});
