---
meta:
  title: Flow Builder
  description: A drag-and-drop visual automation builder with a steps panel, a pan/zoom canvas, and a configuration inspector. Extend it with your own node types via a JS registry.
layout: component
fullWidth: true
---

The Flow Builder is a three-panel editor for visual automations, with an optional header action bar:

- **Header** (optional) — a full-width action bar rendered only when `slot="header-left"` / `slot="header-right"`
  content is provided (e.g. Close / Undo All Changes on the left, Apply Changes on the right).
- **Left panel** — the steps panel (searchable, tabbed by step group).
- **Canvas** (center) — a pannable, zoomable surface. Connections are **append-only**: click any **output port**
  on a node to start a **stray branch** — the wire follows your cursor until you click a node (or its output
  port) to attach it. Fan-in is allowed, and so are **loops** — a branch may point back to an earlier step (e.g.
  an answer that restarts the questioning); only wiring a node directly to itself is refused. Cancel by clicking
  empty canvas, pressing Esc, or leaving the window. A connected output port spawns a brand-new branch on click, so
  extra arrows never require
  config forms. Open outputs draw nothing while idle — their **`+`** targets appear only while dragging a step in
  or moving one. Every existing wire has a **`+`** at its midpoint to insert a step between two nodes. New
  steps are created by dragging them from the panel onto the canvas or a `+`. Reposition nodes by dragging, and add
  resizable sticky notes. Scroll to pan (side-scroll or Shift+scroll pans horizontally); Ctrl/Cmd+scroll or
  trackpad pinch zooms toward the cursor. Toolbar: undo, redo, add-note, **untangle** (auto-arranges a messy flow
  into evenly spaced layers that follow the connections — undoable), zoom-in, reset, zoom-out.
- **Right panel** — the sidebar by default: a slot (`slot="sidebar"`) for status / version history, with a built-in
  Configuration Errors summary derived from `errorNodes`. Selecting a node slides that step's configuration in from
  the right (driven by the node type's `renderConfig`); clicking a **branch pill** on a wire slides in the branch
  editor instead — rename the branch and configure the filters/conditions for taking that path. Node types that
  declare **`branchFilters`** (in markup or JS) get the built-in conditions editor — pick filters from a searchable
  list and combine them into AND groups joined by OR, saved onto the output port's `data.conditions`. A custom
  `renderBranchConfig` takes precedence when supplied.

Both side panels can be **tucked away** with the chevrons on the canvas edges, giving the canvas the full
width; selecting a node or branch brings the right panel back automatically.

A node's **`…`** menu offers Delete, Duplicate, and **Move** — Move detaches the step (with its subtree) so you can
re-attach it to a different `+` slot.

Every node except an entrypoint (a node with `inputs=""`) can have as many inputs and outputs as it likes — outputs
are per-node overridable, so a step's config can add and remove branches at runtime.

It ships with **no built-in node types** — every step you see below is registered by the consumer. This keeps the
component generic and lets it be extended for any future workflow without changing the library.

<zn-button href="/components/flow-builder-demo/" target="_blank" icon="open_in_new" style="margin-bottom: 1.5rem;">
  Open the full-page demo
</zn-button>
<zn-button href="/components/flow-builder-troubleshooter-demo/" target="_blank" icon="open_in_new" style="margin-bottom: 1.5rem;">
  Open the Troubleshoot Q&A demo
</zn-button>

```html:preview

<div style="height: 900px;">
  <zn-flow-builder
    id="flow-demo"
    heading="Retention – Annual Cancellation_v1"
    subheading="Last updated 16th June 2026"
    triggers-hint="Automations require a trigger to start. Choose a trigger below and drag it to the canvas to begin."
    actions-hint="Actions run as the automation progresses. Drag one onto the canvas or a + slot."
    rules-hint="Rules branch the flow based on conditions you configure on each step.">

    <zn-flow-step type="webhook" group="entrypoint" category="Events"
                  icon="webhook@lu" color="rgb(236, 68, 91)"
                  description="User hits webhook XYZ">Cancellation Requested
    </zn-flow-step>
    <zn-flow-step type="manual" group="entrypoint" category="Contacts"
                  icon="user-plus@lu" color="rgb(236, 68, 91)">Contact added manually
    </zn-flow-step>
    <zn-flow-step type="list-add" group="entrypoint" category="Contacts"
                  icon="list-plus@lu" color="rgb(236, 68, 91)">Contact added to a list
    </zn-flow-step>

    <zn-flow-step type="email-parser" group="action" category="Email"
                  icon="mail@lu" color="rgb(43, 192, 145)">IMAP Email Parser
    </zn-flow-step>
    <zn-flow-step type="send-reply" group="action" category="Email"
                  icon="send@lu" color="rgb(43, 192, 145)">Send Reply
    </zn-flow-step>
    <zn-flow-step type="claude" group="action" category="AI"
                  icon="bot@lu" color="rgb(43, 192, 145)">Claude
    </zn-flow-step>
    <zn-flow-step type="notify" group="action" category="Support"
                  icon="user@lu" color="rgb(43, 192, 145)">Notify User
    </zn-flow-step>

    <zn-flow-step type="split" group="rule" category="Logic"
                  icon="split@lu" color="rgb(105, 54, 245)"
                  outputs='[{"id":"true","label":"TRUE"},{"id":"false","label":"FALSE"}]'>Conditional Split
    </zn-flow-step>

    <div slot="sidebar" class="flow-sidebar-demo">
      <label>Status
        <zn-select>
          <zn-option selected>Active</zn-option>
          <zn-option>Paused</zn-option>
          <zn-option>Draft</zn-option>
        </zn-select>
      </label>
      <h4>Version History</h4>
      <ul>
        <li><strong>John Smith</strong><span>16th June 2026 · 14:03</span></li>
        <li><strong>John Smith</strong><span>16th June 2026 · 11:20</span></li>
        <li><strong>Jane Doe</strong><span>15th June 2026 · 09:48</span></li>
      </ul>
    </div>
  </zn-flow-builder>
</div>

<style>
  .flow-sidebar-demo {
    margin-top: 16px;
    font-size: 0.8125rem;
  }

  .flow-sidebar-demo label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-weight: 600;
  }

  .flow-sidebar-demo select {
    padding: 6px 8px;
    border: 1px solid rgb(var(--zn-border-color));
    border-radius: 6px;
  }

  .flow-sidebar-demo h4 {
    margin: 16px 0 8px;
  }

  .flow-sidebar-demo ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .flow-sidebar-demo li {
    display: flex;
    flex-direction: column;
    padding: 8px 0;
    border-top: 1px solid rgb(var(--zn-border-color));
  }

  .flow-sidebar-demo li span {
    color: rgb(var(--zn-color-muted-text));
    font-size: 0.75rem;
  }
</style>

<script type="module">
  const initial = {
    nodes:       [
      {id: 'n1', type: 'webhook', x: 280, y: 60, data: {subtitle: 'User hits webhook XYZ'}},
      {id: 'n2', type: 'split', x: 280, y: 220, data: {subtitle: 'ARR Threshold'}},
      {id: 'n3', type: 'email-parser', x: 80, y: 480, data: {subtitle: 'Import Email Attachment'}},
      {id: 'n4', type: 'notify', x: 80, y: 640, data: {subtitle: 'Notify Frank Furt'}},
      {id: 'n5', type: 'claude', x: 480, y: 480, data: {subtitle: 'Generate Reply'}},
      {id: 'n6', type: 'send-reply', x: 480, y: 640, data: {subtitle: 'Generate Reply'}}
    ],
    connections: [
      {id: 'c1', source: {node: 'n1', port: 'out'}, target: {node: 'n2', port: 'in'}},
      {id: 'c2', source: {node: 'n2', port: 'true'}, target: {node: 'n3', port: 'in'}},
      {id: 'c3', source: {node: 'n2', port: 'false'}, target: {node: 'n5', port: 'in'}},
      {id: 'c4', source: {node: 'n3', port: 'out'}, target: {node: 'n4', port: 'in'}},
      {id: 'c5', source: {node: 'n5', port: 'out'}, target: {node: 'n6', port: 'in'}}
    ],
    notes:       [
      {id: 'note1', x: 760, y: 440, text: 'This is a sticky note.'}
    ]
  };

  // The Conditional Split's outputs are user-configurable per node: its renderConfig
  // edits node.outputs (add / rename / remove branches). The canvas re-renders the
  // outputs and the builder prunes connections to any removed branch.
  const splitType = {
    type:     'split',
    label:    'Conditional Split',
    group:    'rule',
    category: 'Logic',
    icon:     'split@lu',
    color:    'rgb(105, 54, 245)',
    outputs:  [{id: 'true', label: 'TRUE'}, {id: 'false', label: 'FALSE'}],
    // Clicking one of this step's branch pills opens the built-in conditions
    // editor, offering these filters (AND/OR groups saved on the port's data).
    branchFilters: [
      {
        id:     'engagement',
        label:  'Email engagement',
        fields: [
          {
            id:        'count',
            type:      'number',
            suffix:    'time(s)',
            value:     2,
            operators: [
              {value: 'at-least', label: 'at least'},
              {value: 'at-most', label: 'at most'},
              {value: 'exactly', label: 'exactly'}
            ]
          },
          {
            id:        'window',
            type:      'number',
            value:     6,
            operators: [
              {value: 'in-last', label: 'in the last'},
              {value: 'before-last', label: 'before the last'}
            ],
            units:     [
              {value: 'days', label: 'day(s)'},
              {value: 'weeks', label: 'week(s)'},
              {value: 'months', label: 'month(s)'}
            ]
          }
        ]
      },
      {
        id:     'lost-reason',
        label:  'Lost reason',
        fields: [
          {
            id:        'reason',
            operators: [
              {value: 'eq', label: 'Is equal to'},
              {value: 'neq', label: 'Is not equal to'}
            ],
            options:   [
              {value: 'price', label: 'Price'},
              {value: 'competitor', label: 'Competitor'},
              {value: 'no-need', label: 'No need'},
              {value: 'other', label: 'Other'}
            ]
          }
        ]
      },
      {
        id:     'arr',
        label:  'Annual recurring revenue',
        fields: [
          {
            id:        'amount',
            type:      'number',
            suffix:    'USD',
            operators: [
              {value: 'gte', label: 'is at least'},
              {value: 'lte', label: 'is at most'}
            ]
          }
        ]
      }
    ],
    renderConfig:  (node, update) =>
                   {
                     const branches = node.outputs ?? [{id: 'true', label: 'TRUE'}, {id: 'false', label: 'FALSE'}];
                     const setBranches = (next) =>
                     {
                       node.outputs = next;
                       update({});
                     };

                     const wrap = document.createElement('div');
                     wrap.style.cssText = 'display:flex;flex-direction:column;gap:8px';

                     // Branches are created on the canvas; the manager only shows once the
                     // node has real ones — connected, or named and waiting to be attached.
                     const el = document.getElementById('flow-demo');
                     const connected = new Set(
                       el.getState().connections.filter(c => c.source.node === node.id).map(c => c.source.port));
                     if (!branches.some(b => b.label || connected.has(b.id))) return wrap;

                     const heading = document.createElement('p');
                     heading.textContent = 'Branches';
                     heading.style.cssText = 'margin:0;font-weight:600;font-size:0.8125rem';
                     wrap.appendChild(heading);

                     branches.forEach((branch, i) =>
                     {
                       const row = document.createElement('div');
                       row.style.cssText = 'display:flex;gap:6px;align-items:center';

                       const input = document.createElement('zn-input');
                       input.setAttribute('size', 'small');
                       input.value = branch.label ?? branch.id;
                       input.style.flex = '1';
                       input.addEventListener('change', () =>
                         setBranches(branches.map((b, j) => (j === i ? {...b, label: input.value} : b))));
                       row.appendChild(input);

                       const remove = document.createElement('zn-button');
                       remove.setAttribute('icon', 'x@lu');
                       remove.setAttribute('icon-button', 'small');
                       remove.setAttribute('plain', '');
                       remove.addEventListener('click', () =>
                       {
                         const next = branches.filter((_, j) => j !== i);
                         // Deleting the last branch leaves a plain open output (a fresh id, so
                         // the removed branch's wire is pruned) — the node stays attachable.
                         setBranches(next.length ? next : [{id: 'branch-' + Date.now().toString(36)}]);
                       });
                       row.appendChild(remove);

                       wrap.appendChild(row);
                     });

                     const add = document.createElement('zn-button');
                     add.setAttribute('size', 'small');
                     add.setAttribute('icon', 'plus@lu');
                     add.textContent = 'Add branch';
                     add.addEventListener('click', () =>
                       setBranches([...branches, {id: 'branch-' + (branches.length + 1), label: 'New branch'}]));
                     wrap.appendChild(add);

                     return wrap;
                   }
  };

  customElements.whenDefined('zn-flow-builder').then(() =>
  {
    const el = document.getElementById('flow-demo');
    el.registerNodeType(splitType);
    el.setState(initial);
    el.errorNodes = ['n3'];
  });
</script>
```

## Examples

### Empty builder

With no node types registered, the steps panel is empty. Register types to populate it.

```html:preview

<div style="height: 560px;">
  <zn-flow-builder heading="New Flow" subheading="Drafting"></zn-flow-builder>
</div>
```

### Declaring the steps panel

The builder owns the steps panel: **Entrypoints / Triggers / Actions / Rules** tabs with a search box.
You don't author the tabs or their layout — you just declare the node types, and each is routed to the
right tab by its `group` and grouped under a collapsible `category`. A tab only renders when its
group has at least one registered step, so unused groups never appear.

Declare each type as a `<zn-flow-step>` (the items themselves are never shown —
they're declarations that drive the rendered panel):

- `type` (required) — the node type id.
- `group` — `entrypoint` | `trigger` | `action` | `rule`; picks the tab (defaults to `action`).
- `category` — collapsible group within the tab (e.g. "Email").
- label — the slotted text (or a `label` attribute).
- `icon`, `icon-library`, `color`, `description`.
- `inputs` — a JSON array of input ports. Omit for a single default input; use `inputs=""` for a
  trigger with no input.
- `outputs` — a JSON array of ports, each a string id or a `{"id","label"}` object (e.g.
  `outputs='[{"id":"true","label":"TRUE"},{"id":"false","label":"FALSE"}]'`). Omit for a single default output.

Set an optional per-tab hint with the `triggers-hint` / `actions-hint` / `rules-hint` attributes on the
builder. (A node's inspector `renderConfig` can't be expressed in markup — supply it via
`registerNodeTypes()` for the same `type` id if you need a custom config panel. Branch conditions *can*
be expressed in markup — see the next section.)

```html

<zn-flow-builder triggers-hint="Choose a trigger and drag it to the canvas.">
  <zn-flow-step type="webhook" group="trigger" category="Events"
                icon="webhook@lu" color="rgb(236,68,91)" inputs=""
                description="User hits webhook XYZ">Cancellation Requested
  </zn-flow-step>

  <zn-flow-step type="split" group="rule" category="Logic" icon="split@lu"
                outputs='[{"id":"true","label":"TRUE"},{"id":"false","label":"FALSE"}]'>Conditional Split
  </zn-flow-step>
</zn-flow-builder>
```

### Branch conditions in markup

Clicking a **branch pill** opens the branch editor. For step types that declare **branch filters**, it
renders the built-in conditions editor: a searchable filter picker, then the picked filters combined
into **AND groups joined by OR** — with Save / Cancel, so edits only apply (undoably) on Save.

Declare the filters when instantiating the builder by nesting `<zn-flow-filter>` elements inside a
`<zn-flow-step>` (use the `label` attribute for the step's name when nesting). Each filter holds one
`<zn-flow-filter-field>` per control row, and each field declares its choices as nested
`<zn-flow-operator>` / `<zn-flow-option>` elements — the element text is the label, with an optional
`value` attribute for the stored value.

Try it: click the **High intent** or **Everyone else** pill to open the conditions editor.

```html:preview

<div style="height: 640px;">
  <zn-flow-builder id="branch-filter-demo" heading="Win-back Campaign" subheading="Branch filters demo"
                   rules-hint="Rules branch the flow based on conditions configured on each branch pill.">

    <zn-flow-step type="cancel-requested" group="entrypoint" category="Events"
                  icon="webhook@lu" color="rgb(236, 68, 91)" inputs="">Cancellation Requested
    </zn-flow-step>

    <zn-flow-step type="split" group="rule" category="Logic"
                  icon="split@lu" color="rgb(105, 54, 245)" label="Conditional Split"
                  outputs='[{"id":"a","label":"Branch A"},{"id":"b","label":"Branch B"}]'>

      <zn-flow-filter id="engagement" label="Email engagement"
                      description="How often the contact opened a campaign email">
        <zn-flow-filter-field id="count" type="number" suffix="time(s)" value="2">
          <zn-flow-operator value="gte">at least</zn-flow-operator>
          <zn-flow-operator value="lte">at most</zn-flow-operator>
          <zn-flow-operator value="eq">exactly</zn-flow-operator>
        </zn-flow-filter-field>
        <!-- Three adjustable controls: operator, amount, and time-frame unit. -->
        <zn-flow-filter-field id="window" type="number" value="6">
          <zn-flow-operator value="within">in the last</zn-flow-operator>
          <zn-flow-operator value="before">before the last</zn-flow-operator>
          <zn-flow-unit value="days">day(s)</zn-flow-unit>
          <zn-flow-unit value="weeks">week(s)</zn-flow-unit>
          <zn-flow-unit value="months">month(s)</zn-flow-unit>
        </zn-flow-filter-field>
      </zn-flow-filter>

      <zn-flow-filter id="lost-reason" label="Lost reason"
                      description="Why the customer said they cancelled">
        <zn-flow-filter-field id="reason">
          <zn-flow-operator value="eq">Is equal to</zn-flow-operator>
          <zn-flow-operator value="neq">Is not equal to</zn-flow-operator>
          <zn-flow-option value="price">Price</zn-flow-option>
          <zn-flow-option value="competitor">Competitor</zn-flow-option>
          <zn-flow-option value="no-need">No need</zn-flow-option>
          <zn-flow-option value="other">Other</zn-flow-option>
        </zn-flow-filter-field>
      </zn-flow-filter>

      <zn-flow-filter id="plan" label="Subscription plan">
        <zn-flow-filter-field id="name">
          <zn-flow-operator value="is">is</zn-flow-operator>
          <zn-flow-operator value="is-not">is not</zn-flow-operator>
          <zn-flow-option value="starter">Starter</zn-flow-option>
          <zn-flow-option value="growth">Growth</zn-flow-option>
          <zn-flow-option value="enterprise">Enterprise</zn-flow-option>
        </zn-flow-filter-field>
      </zn-flow-filter>

      <!-- Well-known operator keys don't need text — gte/lte get default labels. -->
      <zn-flow-filter id="arr" label="Annual recurring revenue">
        <zn-flow-filter-field id="amount" type="number" suffix="USD" placeholder="0">
          <zn-flow-operator value="gte"></zn-flow-operator>
          <zn-flow-operator value="lte"></zn-flow-operator>
        </zn-flow-filter-field>
      </zn-flow-filter>

      <zn-flow-filter id="last-order" label="Last order"
                      description="Time since the contact last placed an order">
        <zn-flow-filter-field id="days" type="number" suffix="day(s) ago" value="30">
          <zn-flow-operator value="within">within the last</zn-flow-operator>
          <zn-flow-operator value="over">more than</zn-flow-operator>
        </zn-flow-filter-field>
      </zn-flow-filter>

      <zn-flow-filter id="tag" label="Contact tag">
        <zn-flow-filter-field id="name" type="text" placeholder="e.g. vip">
          <zn-flow-operator value="has">contains</zn-flow-operator>
          <zn-flow-operator value="not-has">does not contain</zn-flow-operator>
        </zn-flow-filter-field>
      </zn-flow-filter>
    </zn-flow-step>

    <zn-flow-step type="send-offer" group="action" category="Email"
                  icon="mail@lu" color="rgb(43, 192, 145)">Send Win-back Offer
    </zn-flow-step>
    <zn-flow-step type="notify-csm" group="action" category="Support"
                  icon="user@lu" color="rgb(43, 192, 145)">Notify Account Manager
    </zn-flow-step>
  </zn-flow-builder>
</div>

<script type="module">
  customElements.whenDefined('zn-flow-builder').then(() =>
  {
    const el = document.getElementById('branch-filter-demo');
    el.setState({
      nodes:       [
        {id: 'n1', type: 'cancel-requested', x: 300, y: 40, data: {}},
        {
          id: 'n2', type: 'split', x: 300, y: 280, data: {subtitle: 'Qualify the save attempt'},
          // The branch pills carry their saved conditions on the port's data.
          outputs: [
            {
              id: 'a', label: 'High intent',
              data: {
                conditions: [
                  [
                    {filter: 'engagement', values: {count: {operator: 'gte', value: 2}, window: {operator: 'within', value: 6, unit: 'months'}}},
                    {filter: 'lost-reason', values: {reason: {operator: 'eq', value: 'price'}}}
                  ],
                  [
                    {filter: 'arr', values: {amount: {operator: 'gte', value: 5000}}}
                  ]
                ]
              }
            },
            {id: 'b', label: 'Everyone else'}
          ]
        },
        {id: 'n3', type: 'send-offer', x: 100, y: 580, data: {subtitle: '20% off for 3 months'}},
        {id: 'n4', type: 'notify-csm', x: 500, y: 580, data: {subtitle: 'Manual follow-up'}}
      ],
      connections: [
        {id: 'c1', source: {node: 'n1', port: 'out'}, target: {node: 'n2', port: 'in'}},
        {id: 'c2', source: {node: 'n2', port: 'a'}, target: {node: 'n3', port: 'in'}},
        {id: 'c3', source: {node: 'n2', port: 'b'}, target: {node: 'n4', port: 'in'}}
      ],
      notes:       []
    });
  });
</script>
```

`<zn-flow-filter>` attributes: `id` (required), `label`, `description` (shown under the label in the
picker). `<zn-flow-filter-field>` attributes:

- `id` (required) — key the field's operator/value are stored under.
- `type` — `select` | `number` | `text`. Defaults to `select` when options are given, else `text`.
- `suffix` — trailing unit text (e.g. `time(s)`) when the unit isn't adjustable.
- `label`, `placeholder`, `value` (the initial value when the filter is added).

Inside a field, `<zn-flow-operator>` elements declare the operator dropdown (shown before the value —
"at least", "is equal to"), `<zn-flow-option>` elements the value choices of a `select` field, and
`<zn-flow-unit>` elements an **adjustable unit dropdown** after the value (day(s) / week(s) / month(s)) —
so a row can have three adjustable controls: operator, amount, and time frame. The
element text is the display label; add `value="…"` to store a stable key instead of the text. Empty
operators with a **well-known key** get a default label — `<zn-flow-operator value="gte"></zn-flow-operator>`
renders as "Greater Than or Equal To". Recognised keys: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `is`,
`is-not`, `in`, `not-in`, `contains`, `not-contains`, `starts-with`, `ends-with`, `empty`, `not-empty`,
`within`, `before`, `between`, `matches`.

For programmatic generation the same lists also fit in `operators` / `options` **attributes**
(comma-separated values, or a JSON array of strings and/or `{"value","label"}` objects), a whole
catalog fits in a **`branch-filters` JSON attribute** on the step, and JS registration takes a
`branchFilters` array on the `FlowNodeType` — as in the full demo at the top of this page. A type
supplying its own `renderBranchConfig` overrides the built-in editor.

Saved conditions live on the output port as `port.data.conditions`, an array of OR-ed groups, each an
array of AND-ed conditions:

```js
[
  [ // group 1 (AND-ed)…
    {filter: 'engagement', values: {count: {operator: 'gte', value: 2}, window: {operator: 'within', value: 6, unit: 'months'}}},
    {filter: 'lost-reason', values: {reason: {operator: 'eq', value: 'price'}}}
  ],
  // …OR group 2
  [{filter: 'arr', values: {amount: {operator: 'gte', value: 5000}}}]
]
```

### Registering custom node types

Node types are the modular extension point. Instead of (or alongside) slotted steps, register an
array of `FlowNodeType` objects with `registerNodeTypes()` (or set the `.nodeTypes` property) — the two
sources merge into the same panel. Each type's `group`/`category` place it in the tabs; its icon,
color, input/output ports, and optional `renderConfig` define the node's behavior and inspector.

```js
import {html} from 'lit';

const builder = document.querySelector('zn-flow-builder');

builder.registerNodeTypes([
  {
    type:        'send-email',
    label:       'Send Email',
    group:       'action',          // 'trigger' | 'action' | 'rule' — which steps-panel tab
    category:    'Email',        // collapsible group within the tab
    icon:        'mail@lu',
    color:       'rgb(43, 192, 145)',
    defaultData: {subject: ''},
    // Inspector UI for a selected node of this type:
    renderConfig: (node, update) => html`
      <zn-input
        label="Subject"
        .value=${node.data.subject ?? ''}
        @zn-input=${e => update({subject: e.target.value})}></zn-input>
    `,
  },
  {
    type:  'ab-split',
    label: 'A/B Split',
    group: 'rule',
    icon:  'split@lu',
    // Multiple outputs become labelled connection points (TRUE / FALSE here):
    outputs: [{id: 'true', label: 'TRUE'}, {id: 'false', label: 'FALSE'}],
  },
]);
```

A node type with `inputs: []` is a starting point (a trigger) with no incoming port. A type with
multiple `outputs` renders one labeled port per output, so a branch can fan out to different steps.

#### User-configurable outputs

A type's `outputs` are the default. For steps whose branches are defined by the user (e.g. a conditional
split), set **`node.outputs`** on the instance from `renderConfig` — the canvas renders those ports, and
the builder prunes any connection whose branch is removed. `node.inputs` works the same way. Set the new
ports then call `update({})` to commit:

```js
renderConfig: (node, update) =>
{
  const branches = node.outputs ?? [{id: 'true', label: 'TRUE'}, {id: 'false', label: 'FALSE'}];
  const addBranch = () =>
  {
    node.outputs = [...branches, {id: crypto.randomUUID(), label: 'New branch'}];
    update({}); // commit — re-renders the outputs, prunes dropped branches' connections
  };
  // …render an editor for `branches` that calls addBranch / removes / renames…
}
```

### Reacting to changes

The builder emits events as the flow is edited. Use `zn-flow-change` to persist, or read `.value`
(a JSON string of the full `FlowState`) at any time.

```js
const builder = document.querySelector('zn-flow-builder');

builder.addEventListener('zn-flow-change', e =>
{
  console.log('flow updated', e.detail.state);
});

builder.addEventListener('zn-flow-selection-change', e =>
{
  console.log('selected node', e.detail.nodeId);
});

builder.addEventListener('zn-flow-connect', e =>
{
  console.log('new connection', e.detail.connection);
});

// Persist / restore — `value` is the full FlowState, node positions included:
localStorage.setItem('flow', builder.value);
builder.value = localStorage.getItem('flow');

// Saving to a server: the builder serialises directly (toJSON returns the
// FlowState), so the POST body is one expression either way:
await fetch('/api/flows/123', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(builder), // === builder.value
});
```

### Auto-save

Add the `auto-save` attribute to periodically snapshot the flow (positions included) into
localStorage, keyed by the builder's `id` (falling back to its `heading`), with a **1-day TTL**:

```html
<zn-flow-builder id="my-flow" auto-save></zn-flow-builder>      <!-- every 5 minutes -->
<zn-flow-builder id="my-flow" auto-save="2"></zn-flow-builder>  <!-- every 2 minutes -->
```

Without the attribute nothing is saved. An empty canvas is never written (so a fresh session can't
clobber a stored flow), and expired snapshots are purged when encountered.

While auto-save is on, a **status pill** in the canvas's bottom-left flashes "Auto-saved" as each
snapshot lands and otherwise shows how long ago the last one happened ("Last saved 3m ago"). And when
a flow is loaded (`setState` / `value`) that **differs from a fresh auto-saved draft**, a banner offers
to restore the draft — editing the loaded flow or dismissing the banner keeps what was loaded. Restoring
can also be done programmatically:

```js
const builder = document.querySelector('zn-flow-builder');
if (builder.restoreAutoSave()) {
  console.log('Restored an auto-saved draft'); // false when none exists / it expired
}
```
