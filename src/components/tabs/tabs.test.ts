import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
import type ZnTabs from './tabs.component';

describe('<zn-tabs>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-tabs></zn-tabs> `);

    expect(el).to.exist;
  });

  it('should execute scripts in tab content on first visibility', async () => {
    // Clean up any previous test state
    delete (window as any).__tabScriptExecuted;
    delete (window as any).__tabScriptExecutionCount;

    const el = await fixture<ZnTabs>(html`
      <zn-tabs>
        <div id="tab-1">
          <p>Tab 1 Content</p>
          <script>
            window.__tabScriptExecuted = true;
            window.__tabScriptExecutionCount = (window.__tabScriptExecutionCount || 0) + 1;
          </script>
        </div>
        <div id="tab-2">
          <p>Tab 2 Content</p>
        </div>
        <div slot="top">
          <button tab="tab-1">Tab 1</button>
          <button tab="tab-2">Tab 2</button>
        </div>
      </zn-tabs>
    `);

    await el.updateComplete;

    // Initially, script should not have executed
    expect((window as any).__tabScriptExecuted).to.be.undefined;

    // Make tab-1 active
    el.setActiveTab('tab-1', false, false);
    await el.updateComplete;

    // Wait a bit for script execution
    await new Promise(resolve => setTimeout(resolve, 50));

    // Script should have executed once
    expect((window as any).__tabScriptExecuted).to.be.true;
    expect((window as any).__tabScriptExecutionCount).to.equal(1);

    // Switch to tab-2
    el.setActiveTab('tab-2', false, false);
    await el.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));

    // Switch back to tab-1
    el.setActiveTab('tab-1', false, false);
    await el.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));

    // Script should still only have executed once (not re-executed)
    expect((window as any).__tabScriptExecutionCount).to.equal(1);

    // Clean up
    delete (window as any).__tabScriptExecuted;
    delete (window as any).__tabScriptExecutionCount;
  });

  it('should not execute scripts on refresh', async () => {
    // Clean up any previous test state
    delete (window as any).__tabRefreshScriptCount;

    const el = await fixture<ZnTabs>(html`
      <zn-tabs>
        <div id="tab-refresh">
          <p>Tab Content</p>
          <script>
            window.__tabRefreshScriptCount = (window.__tabRefreshScriptCount || 0) + 1;
          </script>
        </div>
        <div slot="top">
          <button tab="tab-refresh">Tab</button>
        </div>
      </zn-tabs>
    `);

    await el.updateComplete;

    // Make tab active (first time)
    el.setActiveTab('tab-refresh', false, false);
    await el.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));

    expect((window as any).__tabRefreshScriptCount).to.equal(1);

    // Refresh the tab (should not execute scripts again)
    el.setActiveTab('tab-refresh', false, true);
    await el.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));

    // Script should still only have executed once
    expect((window as any).__tabRefreshScriptCount).to.equal(1);

    // Clean up
    delete (window as any).__tabRefreshScriptCount;
  });
});
