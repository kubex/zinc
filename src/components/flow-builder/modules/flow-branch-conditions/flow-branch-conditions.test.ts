import '../../../../../dist/zn.min.js';
import {expect, fixture, html, oneEvent} from '@open-wc/testing';
import type {FlowBranchConditions, FlowBranchFilter} from '../../flow.types';
import type ZnFlowBranchConditions from './flow-branch-conditions.component';
import type ZnInput from '../../../input';

const FILTERS: FlowBranchFilter[] = [
  {
    id: 'engagement',
    label: 'Email engagement',
    fields: [
      {
        id: 'count',
        type: 'number',
        // 'gte' has no label — the editor falls back to its well-known default.
        operators: [{value: 'gte'}, {value: 'at-most', label: 'at most'}],
        units: [{value: 'days', label: 'day(s)'}, {value: 'months', label: 'month(s)'}],
        value: 2,
      },
    ],
  },
  {
    id: 'lost-reason',
    label: 'Lost reason',
    fields: [
      {
        id: 'reason',
        type: 'select',
        operators: [{value: 'eq', label: 'Is equal to'}, {value: 'neq', label: 'Is not equal to'}],
        options: [{value: 'price', label: 'Price'}, {value: 'competitor', label: 'Competitor'}],
      },
    ],
  },
];

// zn-button overrides click() without dispatching an event, so raise a real one.
function clickButton(el: Element | null | undefined) {
  el?.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true}));
}

async function makeEditor(value: FlowBranchConditions = []): Promise<ZnFlowBranchConditions> {
  const el = await fixture<ZnFlowBranchConditions>(html`
    <zn-flow-branch-conditions .filters="${FILTERS}" .value="${value}"></zn-flow-branch-conditions>`);
  await el.updateComplete;
  return el;
}

describe('<zn-flow-branch-conditions>', () => {
  it('should open on the filter picker when nothing is configured', async () => {
    const el = await makeEditor();
    const items = el.shadowRoot?.querySelectorAll('.picker__item');
    expect(el.shadowRoot?.querySelector('.picker')).to.exist;
    expect(items?.length).to.equal(2);
    expect(items?.[0].textContent).to.contain('Email engagement');
  });

  it('should add a condition with field defaults when a filter is picked', async () => {
    const el = await makeEditor();
    (el.shadowRoot?.querySelectorAll('.picker__item')[0] as HTMLButtonElement).click();
    await el.updateComplete;

    const condition = el.shadowRoot?.querySelector('.condition');
    expect(condition?.querySelector('.condition__name')?.textContent).to.contain('Email engagement');
    expect(String(condition!.querySelector<ZnInput>('zn-input.control')!.value)).to.equal('2');
    // A label-less well-known operator key renders its default label.
    expect(condition!.querySelector('zn-select.control--operator zn-option')!.textContent)
      .to.contain('Greater Than or Equal To');
    // The adjustable unit dropdown defaults to the first unit.
    const unit = condition!.querySelector('zn-select.control--unit') as Element & { value: string };
    expect(String(unit.value)).to.equal('days');
  });

  it('should render saved conditions with OR groups and AND rules', async () => {
    const el = await makeEditor([
      [
        {filter: 'engagement', values: {count: {operator: 'gte', value: 2}}},
        {filter: 'lost-reason', values: {reason: {operator: 'eq', value: 'price'}}},
      ],
      [{filter: 'engagement', values: {count: {operator: 'at-most', value: 5}}}],
    ]);

    expect(el.shadowRoot?.querySelectorAll('.group').length).to.equal(2);
    expect(el.shadowRoot?.querySelectorAll('.condition').length).to.equal(3);
    expect(el.shadowRoot?.querySelectorAll('.and-rule').length).to.equal(1);
    expect(el.shadowRoot?.querySelectorAll('.or-label').length).to.equal(1);
  });

  it('should emit flow-conditions-save with the draft on Save', async () => {
    const el = await makeEditor();
    (el.shadowRoot?.querySelectorAll('.picker__item')[1] as HTMLButtonElement).click();
    await el.updateComplete;

    setTimeout(() => clickButton(el.shadowRoot?.querySelector('.actions__save')));
    const event = await oneEvent(el, 'flow-conditions-save') as CustomEvent<{ conditions: FlowBranchConditions }>;

    expect(event.detail.conditions).to.deep.equal([
      [{filter: 'lost-reason', values: {reason: {operator: 'eq'}}}],
    ]);
  });

  it('should emit flow-conditions-cancel without mutating the saved value', async () => {
    const saved: FlowBranchConditions = [[{filter: 'engagement', values: {count: {value: 2}}}]];
    const el = await makeEditor(saved);
    clickButton(el.shadowRoot!.querySelector('.condition__remove'));
    await el.updateComplete;

    setTimeout(() => clickButton(el.shadowRoot?.querySelector('.actions__cancel')));
    await oneEvent(el, 'flow-conditions-cancel');

    expect(saved[0]).to.have.length(1);
    expect(el.value).to.deep.equal(saved);
  });

  it('should filter the picker list by the search term', async () => {
    const el = await makeEditor();
    const search = el.shadowRoot!.querySelector<ZnInput>('.picker__search')!;
    search.value = 'lost';
    search.dispatchEvent(new Event('input', {bubbles: true}));
    await el.updateComplete;

    const items = el.shadowRoot?.querySelectorAll('.picker__item');
    expect(items?.length).to.equal(1);
    expect(items?.[0].textContent).to.contain('Lost reason');
  });
});
