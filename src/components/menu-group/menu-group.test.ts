import '../../../dist/zn.min.js';
import {expect, fixture, html, waitUntil} from '@open-wc/testing';
// From source while the components come from dist, as a shell bundling zinc and a page's zn.min.js would be
import {setNavigationCollapsed} from '../../utilities/navigation';

type Collapsible = HTMLElement & {collapsed: boolean; variant?: string};

describe('<zn-menu-group>', () => {
  it('hides its nested rows when folded, unless one of them is the open page', async () => {
    const group = await fixture<HTMLElement>(html`
      <zn-menu-group folded>
        <zn-menu-item slot="parent">Support</zn-menu-item>
        <zn-menu-item>Test</zn-menu-item>
      </zn-menu-group>
    `);
    const children = () => group.shadowRoot!.querySelector<HTMLElement>('[part="children"]')!;
    expect(getComputedStyle(children()).display).to.equal('none');

    group.querySelector('zn-menu-item:not([slot])')!.setAttribute('active', '');
    await waitUntil(() => getComputedStyle(children()).display !== 'none', 'open page keeps its group showing');
  });

  it('indents nested rows, and drops the indent when collapsed', async () => {
    const group = await fixture<HTMLElement & {collapsed: boolean; updateComplete: Promise<boolean>}>(html`
      <zn-menu-group style="--zn-navigation-duration: 0s">
        <zn-menu-item slot="parent">Support</zn-menu-item>
        <zn-menu-item>Test</zn-menu-item>
      </zn-menu-group>
    `);
    const child = group.querySelector<HTMLElement>('zn-menu-item:not([slot])')!;
    expect(getComputedStyle(child).marginInlineStart).to.equal('26px');

    group.collapsed = true;
    await group.updateComplete;
    expect(getComputedStyle(child).marginInlineStart).to.equal('0px');
  });

  describe('with the shell\'s sidebar', () => {
    afterEach(() => setNavigationCollapsed(false));

    it('gives its rows the navigation look and collapses with the shell, rows and headings alike', async () => {
      const root = await fixture<HTMLElement>(html`
        <div>
          <zn-menu-label variant="navigation">Departments</zn-menu-label>
          <zn-menu-group>
            <zn-menu-item slot="parent">Support</zn-menu-item>
            <zn-menu-item>Test</zn-menu-item>
          </zn-menu-group>
        </div>
      `);
      const group = root.querySelector<Collapsible>('zn-menu-group')!;
      const rows = [...root.querySelectorAll<Collapsible>('zn-menu-item')];
      const label = root.querySelector<Collapsible>('zn-menu-label')!;
      expect(rows.map(row => row.variant)).to.deep.equal(['navigation', 'navigation']);

      setNavigationCollapsed(true);
      await waitUntil(() => group.collapsed && rows.every(row => row.collapsed) && label.collapsed, 'all collapse');

      setNavigationCollapsed(false);
      await waitUntil(() => !group.collapsed && rows.every(row => !row.collapsed) && !label.collapsed, 'all open');
    });

    it('starts a sidebar that loads after the shell collapsed in the collapsed state', async () => {
      setNavigationCollapsed(true);
      const group = await fixture<Collapsible>(html`
        <zn-menu-group><zn-menu-item slot="parent">Support</zn-menu-item></zn-menu-group>
      `);
      const row = group.querySelector<Collapsible>('zn-menu-item')!;

      expect(group.collapsed).to.be.true;
      await waitUntil(() => row.collapsed, 'late row collapses');
    });

    it('leaves rows outside the navigation look alone', async () => {
      const row = await fixture<Collapsible>(html`<zn-menu-item>Settings</zn-menu-item>`);
      setNavigationCollapsed(true);
      await new Promise(resolve => setTimeout(resolve, 20));
      expect(row.collapsed).to.be.false;
    });
  });
});
