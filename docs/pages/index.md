---
meta:
  title: 'Zinc: A forward-thinking library of web components.'
  description: Hand-crafted custom elements for any occasion.
toc: false
---

# Zinc Web Components

A comprehensive library of 88+ web components built with Lit, designed for modern web applications.

<div class="badges">

[![npm](https://img.shields.io/npm/dw/@kubex/zinc?label=npm&style=flat-square)](https://www.npmjs.com/package/@kubex/zinc)
[![License](https://img.shields.io/badge/license-MIT-232323.svg?style=flat-square)](https://github.com/kubex/zinc/blob/LICENSE.md)

</div>

## Features

- **88+ Components** - From form controls to data visualization
- **TypeScript First** - Full type safety with comprehensive declarations
- **Lit-based** - Built on the modern Lit framework for fast, lightweight components
- **Accessible** - ARIA compliant with keyboard navigation support
- **Form Integration** - Native form controls that work with standard HTML forms
- **Customizable** - CSS custom properties and parts for easy styling
- **Theme Support** - Light/dark mode built-in
- **Tree-shakeable** - Import only what you need

## Quick Start

Install Zinc via npm:

```bash
npm install @kubex/zinc
```

Import the components you need:

```javascript
import '@kubex/zinc/dist/zn.min.js';
```

Use them in your HTML:

```html
<zn-button color="success">Click Me</zn-button>
<zn-input label="Name" placeholder="Enter your name"></zn-input>
<zn-select label="Country">
  <zn-option value="us">United States</zn-option>
  <zn-option value="uk">United Kingdom</zn-option>
  <zn-option value="ca">Canada</zn-option>
</zn-select>
```

## Component Categories

### Form Controls
Complete set of form elements with validation, accessibility, and native form integration:
- [Button](/components/button), [Input](/components/input), [Textarea](/components/textarea)
- [Checkbox](/components/checkbox), [Radio](/components/radio), [Toggle](/components/toggle)
- [Select](/components/select), [Datepicker](/components/datepicker), [File](/components/file)
- [Rating](/components/rating), [Editor](/components/editor)

### Layout & Navigation
Build complex layouts with flexible containers and navigation patterns:
- [Dialog](/components/dialog), [Slideout](/components/slideout), [Tabs](/components/tabs)
- [Panel](/components/panel), [Pane](/components/pane), [Split Pane](/components/split-pane)
- [Menu](/components/menu), [Dropdown](/components/dropdown), [Navbar](/components/navbar)

### Data Display
Present data in clear, interactive formats:
- [Data Table](/components/data-table), [Chart](/components/chart), [Stat](/components/stat)
- [Pagination](/components/pagination), [Progress Bar](/components/progress-bar)
- [Tile](/components/tile), [Collapsible](/components/collapsible)

### Feedback & Indicators
Communicate state and provide feedback to users:
- [Alert](/components/alert), [Note](/components/note), [Tooltip](/components/tooltip)
- [Empty State](/components/empty-state), [Skeleton](/components/skeleton)
- [Status Indicator](/components/status-indicator), [Stepper](/components/stepper)

### Utilities
Helper components for common UI patterns:
- [Icon](/components/icon), [Chip](/components/chip), [Copy Button](/components/copy-button)
- [Reveal](/components/reveal), [Inline Edit](/components/inline-edit)
- [Scroll Container](/components/scroll-container), [Well](/components/well)

## Why Zinc?

**Developer Experience**: Comprehensive documentation with live examples, TypeScript support, and intuitive APIs make development fast and enjoyable.

**Production Ready**: Battle-tested components used in real-world applications with robust error handling and edge case coverage.

**Customizable**: Every component exposes CSS custom properties and parts for granular styling control without fighting the framework.

**Performance**: Lightweight components with lazy loading support and optimized rendering for smooth 60fps interactions.

**Future Proof**: Built on web standards with modern JavaScript features, ensuring long-term compatibility and maintainability.

## Browser Support

Zinc works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

For older browsers, you may need polyfills for Web Components and ES2017+ features.

## Attribution

Special thanks to the following projects and individuals that help make Zinc possible:

- [Shoelace](https://shoelace.style/) - Many components were inspired by and adapted from Shoelace
- [Lit](https://lit.dev/) - Fast, lightweight web component base class
- [Custom Elements Manifest Analyzer](https://github.com/open-wc/custom-elements-manifest) - Component metadata generation
- [11ty](https://www.11ty.dev/) - Static site generator powering this documentation
- [Tailwind CSS](https://tailwindcss.com/) - Color primitive inspiration
- [Material Icons](https://fonts.google.com/icons) - Icon library
- [Floating UI](https://floating-ui.com/) - Positioning engine for dropdowns and tooltips
- [ApexCharts](https://apexcharts.com/) - Charting library
- [Quill](https://quilljs.com/) - Rich text editor
- [Lunr](https://lunrjs.com/) - Client-side search

## License

Zinc is available under the [MIT License](https://github.com/kubex/zinc/blob/master/LICENSE.md).

## Getting Help

- **Documentation**: Browse the [component documentation](/components/button) for detailed usage examples
- **GitHub Issues**: Report bugs or request features on [GitHub](https://github.com/kubex/zinc/issues)