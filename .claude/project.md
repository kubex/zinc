# Zinc - Web Component UI Framework

## Project Overview

Zinc is a comprehensive web component library built on Lit that provides 93+ pre-built, accessible, and themeable UI components for modern web applications. It's designed to accelerate development by providing production-ready components that follow web standards.

**Language:** TypeScript 5.3.3
**Framework:** Lit 2.7.6 (Web Components)
**Foundation:** Based on Shoelace components
**Current Version:** 1.0.45
**Documentation:** https://zinc.style

## Role in the Platform

Zinc is the **UI component library** of the Kubex platform:

- **Rubix Integration:** Rubix uses zinc-go (Go version) for backend rendering and the Zinc web components for frontend
- **Standalone Usage:** Can be used independently in any web application
- **Component Prefix:** All components use the `zn-` prefix (e.g., `<zn-button>`, `<zn-input>`)
- **Documentation Site:** https://zinc.style provides comprehensive component documentation

```
Application HTML → Zinc Components → Web Components API → Browser
                         ↓
                   zinc-go (Server-side rendering)
                         ↓
                   Rubix Console (Integration)
```

## Architecture

### Core Architecture Pattern

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│  (HTML with <zn-*> custom elements)     │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Zinc Autoloader (Discovery)        │
│  - Watches DOM for undefined elements   │
│  - Lazy-loads components on demand      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Component Layer (93+)           │
│  - Button, Input, DataTable, etc.       │
│  - All extend ZincElement               │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      ZincElement (Base Class)           │
│  - Extends LitElement                   │
│  - Theme Controller                     │
│  - Custom event system                  │
│  - Form integration                     │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│    Internal Services & Utilities        │
│  - Form validation                      │
│  - Slot detection                       │
│  - Event system                         │
│  - Animation registry                   │
└─────────────────────────────────────────┘
```

### Key Directories

```
/zinc
├── src/
│   ├── zinc.ts                      # Main entry point (exports all 93+ components)
│   ├── zinc-autoloader.ts           # Auto-discovery and lazy-loading system
│   ├── components/                  # 93+ Web Components
│   │   ├── button/
│   │   │   ├── button.component.ts  # Component logic
│   │   │   ├── button.scss          # Component styles
│   │   │   ├── button.test.ts       # Component tests
│   │   │   └── index.ts             # Exports
│   │   ├── data-table/              # Complex table component
│   │   ├── input/                   # Form input component
│   │   ├── select/                  # Dropdown select
│   │   ├── dialog/                  # Modal dialogs
│   │   ├── editor/                  # Rich text editor (Quill)
│   │   ├── chart/                   # Charts (ApexCharts)
│   │   └── ... (85+ more)
│   ├── internal/                    # Core infrastructure
│   │   ├── zinc-element.ts          # Base class for all components
│   │   ├── form.ts                  # Form control integration
│   │   ├── event.ts                 # Type-safe event system
│   │   ├── animate.ts               # Animation utilities
│   │   ├── slot.ts                  # Slot detection controller
│   │   └── watch.ts                 # Property watchers
│   ├── events/                      # Event definitions (38+ event types)
│   │   ├── events.ts                # Barrel file
│   │   ├── zn-change.ts
│   │   ├── zn-input.ts
│   │   └── ... (one per event type)
│   ├── utilities/                   # Helper functions
│   │   ├── on.ts                    # Event listeners
│   │   ├── query.ts                 # DOM querying
│   │   ├── base-path.ts             # Asset resolution
│   │   └── localize.ts              # i18n
│   └── translations/                # i18n data
├── scss/                            # Global styles and themes
│   ├── themes/
│   │   ├── _light.scss              # Light theme variables
│   │   └── _dark.scss               # Dark theme variables
│   ├── shared/                      # Global styles
│   │   ├── _base.scss
│   │   ├── _reset.scss
│   │   └── _form-elements.scss
│   ├── variables/                   # Design tokens
│   ├── mixins/                      # SCSS mixins
│   └── boot.scss                    # Bootstrap stylesheet
├── docs/                            # 11ty-powered documentation site
│   ├── pages/
│   │   ├── index.md                 # Homepage
│   │   ├── getting-started/         # Installation guides
│   │   └── components/              # Component docs (85+ pages)
│   ├── _includes/                   # Nunjucks templates
│   │   ├── component.njk            # Component doc template
│   │   └── default.njk              # Default layout
│   ├── _utilities/                  # Build utilities
│   │   ├── markdown.cjs             # Custom markdown renderer
│   │   └── code-previews.cjs        # Live code preview system
│   ├── eleventy.config.cjs          # 11ty configuration
│   └── assets/                      # Static assets
├── dist/                            # Built outputs
│   ├── zinc.js                      # Main ES module
│   ├── zinc.min.js                  # Minified version
│   ├── custom-elements.json         # Component metadata
│   └── web-types.json               # IDE support
├── scripts/
│   └── build.js                     # Custom esbuild pipeline
├── package.json                     # Project metadata (v1.0.45)
├── tsconfig.json                    # TypeScript config
└── custom-elements-manifest.config.js  # Metadata generation
```

## Key Technologies

### Core Dependencies
- **lit** (2.7.6) - Reactive web components library
- **@lit-labs/observers** - Observe changes in templates
- **@lit/task** - Task management for async operations
- **@floating-ui/dom** - Positioning for dropdowns, tooltips
- **@shoelace-style/localize** - Internationalization

### Advanced Components
- **apexcharts** (4.5.0) - Charting library
- **chart.js** (4.4.8) - Alternative charting
- **quill** (2.0.3) - Rich text editor
- **emoji-mart** - Emoji picker
- **air-datepicker** (3.5.3) - Date picker

### Build Tools
- **esbuild** (0.25.0) - Fast JavaScript bundler
- **sass** (1.85.1) - CSS preprocessor
- **typescript** (5.3.3) - Type checking
- **@11ty/eleventy** - Documentation site generator
- **@web/test-runner** - Component testing

## Component Categories (93+ Total)

### Form Components (15+)
Input, Textarea, Select, Checkbox, Radio, Toggle, Datepicker, File, Rating, ColorPicker, Range, etc.

### Data Display (10+)
DataTable, Chart, SimpleChart, Stat, ProgressBar, ProgressTile, Skeleton, Timeline, etc.

### Navigation (8+)
Button, ButtonGroup, Navbar, Sidebar, Tabs, Pagination, Stepper, VerticalStepper

### Dialogs & Overlays (8+)
Dialog, Popup, Tooltip, Dropdown, Slideout, Confirm, Alert, Drawer

### Layout (8+)
Cols, Pane, SplitPane, ScrollContainer, AbsoluteContainer, HoverContainer, FlexContainer

### Content (8+)
Tile, TileProperty, Note, EmptyState, Header, ContentBlock, Card, Well

### Tables & Advanced (5+)
OrderTable, DataTableFilter, DataTableSort, BulkActions, QueryBuilder

### Utilities (15+)
Icon, Key, Chip, Badge, Avatar, Spinner, Divider, Menu, MenuItem, etc.

## Component Anatomy

### Standard Component Structure
```typescript
// Example: src/components/button/button.component.ts
import { html, unsafeCSS } from 'lit';
import { property, query } from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import styles from './button.scss';

export default class ZnButton extends ZincElement {
  static styles = unsafeCSS(styles);
  static dependencies = { 'zn-icon': ZnIcon };

  @property() color: 'default' | 'primary' | 'error' = 'default';
  @property({type: Boolean}) disabled = false;
  @query('.button') button: HTMLButtonElement;

  protected render() {
    return html`<button part="base" ...>...</button>`;
  }

  // Custom event emission with type safety
  handleClick() {
    this.emit('zn-click', { detail: { ... } });
  }
}

// Auto-register component
ZnButton.define('zn-button');
```

### Component Features
- **Shadow DOM:** Encapsulated styles
- **CSS Parts:** Exposed for external styling
- **Slots:** Flexible content projection
- **Events:** Type-safe custom events
- **Form Integration:** Native HTML form support
- **Accessibility:** ARIA attributes and keyboard navigation
- **Theming:** CSS custom properties

## Auto-Discovery System

### Lazy Loading
```typescript
// zinc-autoloader.ts provides dynamic component discovery
export async function discover(root: Element | ShadowRoot) {
  // Find all undefined <zn-*> elements
  const tags = [...root.querySelectorAll(':not(:defined)')]
    .map(el => el.tagName.toLowerCase())
    .filter(tag => tag.startsWith('zn-'));

  // Auto-import and register them
  await Promise.allSettled(tagsToRegister.map(tagName => register(tagName)));
}

// Watches for new elements added to DOM
observer.observe(document.documentElement, {subtree: true, childList: true});
```

**Benefits:**
- Components lazy-loaded only when used
- Reduces initial bundle size
- Works with dynamic HTML injection
- No manual component imports needed

## Form Integration

### FormControlController
Provides standardized form integration:
- Native HTML `<form>` element integration
- Constraint validation API
- User interaction tracking for validation state
- Form attributes: `name`, `value`, `disabled`, `required`, etc.

### Example Form Component
```html
<form id="myForm">
  <zn-input name="username" label="Username" required></zn-input>
  <zn-input name="email" type="email" label="Email" required></zn-input>
  <zn-button type="submit">Submit</zn-button>
</form>

<script>
  document.getElementById('myForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log(Object.fromEntries(formData));
  });
</script>
```

## Theming System

### CSS Custom Properties
Light and dark themes controlled via CSS variables:

```scss
// Light theme (_light.scss)
:root {
  --color-primary: #0066cc;
  --color-background: #ffffff;
  --spacing-m: 1rem;
  --border-radius: 4px;
  // ... 100+ design tokens
}

// Dark theme (_dark.scss)
:root[data-theme="dark"] {
  --color-primary: #4da6ff;
  --color-background: #1a1a1a;
  // ... dark variants
}
```

### Theme Variables
- **Colors:** Primary, secondary, success, warning, error, info
- **Spacing:** xs, s, m, l, xl
- **Typography:** Font families, sizes, weights
- **Borders:** Widths, radius
- **Shadows:** Elevation levels

## Documentation Site (https://zinc.style)

### Technology Stack
- **11ty (Eleventy)** - Static site generator
- **Nunjucks** - Templating language
- **Lunr** - Client-side search
- **PrismJS** - Syntax highlighting
- **Custom Markdown** - Extended markdown for live previews

### Key Features
1. **Live Component Previews** - Markdown syntax for interactive demos
2. **Component Documentation** - One page per component
3. **Auto-generated Metadata** - Props/slots/events from source
4. **Searchable** - Full-text search via Lunr
5. **Responsive Design** - Mobile-first
6. **Theme Switching** - Dark/light mode

### Documentation Build
```bash
cd docs
npm install
npm run build  # Builds to _site/
npm run serve  # Development server
```

## Development

### Running Locally
```bash
# Install dependencies
npm install

# Build components
npm run build

# Watch mode (rebuild on changes)
npm run watch

# Run tests
npm run test

# Lint code
npm run lint

# Build documentation
cd docs && npm run build
```

### Creating a New Component

1. **Create component directory:**
```bash
mkdir src/components/my-component
```

2. **Create component files:**
```
my-component/
├── my-component.component.ts  # Component logic
├── my-component.scss          # Component styles
├── my-component.test.ts       # Tests
└── index.ts                   # Exports
```

3. **Implement component:**
```typescript
import { html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import styles from './my-component.scss';

export default class ZnMyComponent extends ZincElement {
  static styles = unsafeCSS(styles);

  @property() label = '';

  render() {
    return html`<div part="base">${this.label}</div>`;
  }
}

ZnMyComponent.define('zn-my-component');
```

4. **Export from zinc.ts:**
```typescript
export { default as ZnMyComponent } from './components/my-component';
```

5. **Create documentation:**
```markdown
<!-- docs/pages/components/my-component.md -->
---
title: My Component
description: Component description
---

# My Component

Usage examples...
```

## Build Process

### Custom Build Pipeline (`scripts/build.js`)
1. Clean previous builds
2. Compile SCSS to CSS (PostCSS/autoprefixer)
3. Bundle TypeScript (esbuild)
4. Generate custom-elements-manifest
5. Minify outputs
6. Build documentation (11ty)

### Distribution Outputs
- `dist/zinc.js` - ES module export
- `dist/zinc.min.js` - Minified version
- `dist/custom-elements.json` - Component metadata
- `dist/web-types.json` - IDE support
- `docs/_site/` - Static documentation site

## Usage in Applications

### Installation
```bash
npm install @kubex/zinc
```

### Import All Components
```javascript
import '@kubex/zinc/dist/zinc.js';
```

### Import Specific Components
```javascript
import '@kubex/zinc/dist/components/button/button.js';
import '@kubex/zinc/dist/components/input/input.js';
```

### Use Auto-loader
```javascript
import '@kubex/zinc/dist/zinc-autoloader.js';
// Components auto-load when used in HTML
```

### HTML Usage
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/@kubex/zinc/dist/themes/light.css">
  <script type="module" src="node_modules/@kubex/zinc/dist/zinc-autoloader.js"></script>
</head>
<body>
  <zn-button color="primary">Click Me</zn-button>
  <zn-input label="Username" required></zn-input>
  <zn-data-table id="myTable"></zn-data-table>

  <script>
    const table = document.getElementById('myTable');
    table.data = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 }
    ];
  </script>
</body>
</html>
```

## Integration Points

### With Rubix
- **zinc-go:** Go version of Zinc for backend rendering
- **Static Console:** Rubix console uses Zinc web components
- **Component Library:** Shared component library across platform

### Standalone Usage
- Can be used in any web application
- Framework-agnostic (works with React, Vue, Angular, vanilla JS)
- Progressive enhancement (works without JavaScript for basic functionality)

## Testing

### Component Tests
```bash
npm run test
npm run test:watch  # Watch mode
```

### Testing Framework
- **@web/test-runner** - Test runner
- **Playwright** - Browser automation
- **Chai** - Assertions

### Example Test
```typescript
import { expect, fixture, html } from '@open-wc/testing';
import type ZnButton from './button.component';

describe('ZnButton', () => {
  it('renders with default properties', async () => {
    const el = await fixture<ZnButton>(html`<zn-button>Click</zn-button>`);
    expect(el.color).to.equal('default');
    expect(el.disabled).to.be.false;
  });

  it('emits click event', async () => {
    const el = await fixture<ZnButton>(html`<zn-button>Click</zn-button>`);
    let clicked = false;
    el.addEventListener('zn-click', () => clicked = true);
    el.click();
    expect(clicked).to.be.true;
  });
});
```

## Performance Considerations

- **Lazy Loading:** Components load on demand via autoloader
- **Tree Shaking:** Import only components you use
- **Shadow DOM:** Encapsulated styles prevent global pollution
- **Virtual Scrolling:** DataTable uses virtual scrolling for large datasets
- **Debouncing:** Input components debounce events
- **Memoization:** Expensive computations cached

## Accessibility

- **ARIA Labels:** All components have proper ARIA attributes
- **Keyboard Navigation:** Full keyboard support
- **Focus Management:** Proper focus indicators and trap
- **Screen Reader Support:** Semantic HTML and ARIA
- **ESLint Rules:** lit-a11y plugin enforces accessibility

## Related Repositories

- **rubix** - Uses Zinc for frontend console interface
- **zinc-go** - Go version of Zinc for backend rendering
- **zinc-php** - PHP version of Zinc for backend rendering

## Resources

- **Documentation:** https://zinc.style
- **Component API:** See custom-elements.json in dist/
- **Examples:** See docs/pages/components/ for live examples
- **Contributing:** Follow TypeScript strict mode and ESLint rules
