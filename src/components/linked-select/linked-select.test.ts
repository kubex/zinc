import '../../../dist/zn.min.js';
import { expect, fixture, html, oneEvent, waitUntil } from '@open-wc/testing';
import type ZnLinkedSelect from './linked-select.component';
import type ZnSelect from '../select';

const options = {
  '': {},
  'cat-1': { 'cat-1-a': 'Disputes', 'cat-1-b': 'Refunds' },
  'cat-2': { 'cat-2-a': 'Delivery' },
};

async function group(multiple = false) {
  const wrapper = await fixture<HTMLDivElement>(html`
    <div>
      <zn-select id="parent" name="parent">
        <zn-option value="cat-1">Billing</zn-option>
        <zn-option value="cat-2">Orders</zn-option>
      </zn-select>
      <zn-linked-select linked-select="parent" name="child"
                        ?multiple=${multiple} .options=${options}></zn-linked-select>
    </div>`);

  return {
    parent: wrapper.querySelector<ZnSelect>('zn-select')!,
    child: wrapper.querySelector<ZnLinkedSelect>('zn-linked-select')!,
  };
}

function childOptions(child: ZnLinkedSelect): string[] {
  return [...child.shadowRoot!.querySelectorAll('zn-option')].map(option => option.getAttribute('value')!);
}

describe('<zn-linked-select>', () => {
  it('should render a component', async () => {
    const { child } = await group();
    expect(child).to.exist;
  });

  it('should only offer the options of the linked select group', async () => {
    const { parent, child } = await group();

    parent.value = 'cat-1';
    parent.emit('zn-change');
    await waitUntil(() => childOptions(child).length === 2);

    expect(childOptions(child)).to.deep.equal(['cat-1-a', 'cat-1-b']);

    parent.value = 'cat-2';
    parent.emit('zn-change');
    await waitUntil(() => childOptions(child).length === 1);

    expect(childOptions(child)).to.deep.equal(['cat-2-a']);
  });

  it('should offer no options until the linked select has a value', async () => {
    const { child } = await group();
    expect(childOptions(child)).to.deep.equal([]);
  });

  it('should keep an array value when multiple', async () => {
    const { parent, child } = await group(true);
    parent.value = 'cat-1';
    parent.emit('zn-change');
    await waitUntil(() => childOptions(child).length === 2);

    child.value = ['cat-1-a', 'cat-1-b'];
    await child.updateComplete;

    expect(child.input.multiple).to.be.true;
    expect(child.input.value).to.deep.equal(['cat-1-a', 'cat-1-b']);
  });

  it('should start a multiple select with no selection', async () => {
    const { child } = await group(true);
    expect(child.value).to.deep.equal([]);
    expect(child.input.value).to.deep.equal([]);
  });

  it('should clear a multiple selection when the linked select changes', async () => {
    const { parent, child } = await group(true);
    child.value = ['cat-1-a'];
    await child.updateComplete;

    parent.value = 'cat-2';
    const changed = oneEvent(child, 'zn-change');
    parent.emit('zn-change');
    await changed;

    expect(child.value).to.deep.equal([]);
  });

  it('should not announce a change when the value was already empty', async () => {
    const { parent, child } = await group(true);
    let changes = 0;
    child.addEventListener('zn-change', () => changes++);

    parent.value = 'cat-2';
    parent.emit('zn-change');
    await child.updateComplete;

    expect(changes).to.equal(0);
  });
});
