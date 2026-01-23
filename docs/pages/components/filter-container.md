---
meta:
  title: Filter Container
  description: A container component with a built-in search input that filters child elements based on their data-filter attribute. Automatically shows/hides items and sections based on search terms.
layout: component
---

```html:preview

<zn-filter-container>
  <zn-sp flush>
    <zn-panel caption="Section One">
      <div style="display: flex; flex-direction: column;">
        <div data-filter="John Doe"
             style="padding: 10px 0; display: flex; flex-direction: column; border-bottom: 1px solid grey;">
          <strong>John Doe</strong>
          <span>john.doe@zinc.style</span>
        </div>

        <div data-filter="Gary Smith"
             style="padding: 10px 0; display: flex; flex-direction: column; border-bottom: 1px solid grey;">
          <strong>Gary Smith</strong>
          <span>gary.smith@zinc.style</span>
        </div>

        <div data-filter="Lisa Wong"
             style="padding: 10px 0; display: flex; flex-direction: column; border-bottom: 1px solid grey;">
          <strong>Lisa Wong</strong>
          <span>lisa.wong@zinc.style</span>
        </div>

        <div data-filter="Emma Johnson"
             style="padding: 10px 0; display: flex; flex-direction: column; border-bottom: 1px solid grey;">
          <strong>Emma Johnson</strong>
          <span>emma.johnson@zinc.style</span>
        </div>
      </div>

    </zn-panel>

    <zn-panel caption="Section Two">
      <div style="display: flex; flex-direction: column;">
        <div data-filter="Michael Brown"
             style="padding: 10px 0; display: flex; flex-direction: column; border-bottom: 1px solid grey;">
          <strong>Michael Brown</strong>
          <span>michael.brown@zinc.style</span>
        </div>
        <div data-filter="Sophia Davis"
             style="padding: 10px 0; display: flex; flex-direction: column; border-bottom: 1px solid grey;">
          <strong>Sophia Davis</strong>
          <span>sophia.davis@zinc.style</span>
        </div>
        <div data-filter="Lisa Wong"
             style="padding: 10px 0; display: flex; flex-direction: column; border-bottom: 1px solid grey;">
          <strong>Lisa Wong</strong>
          <span>lisa.wong@zinc.style</span>
        </div>
      </div>
    </zn-panel>
  </zn-sp>
</zn-filter-container>
```

## Examples

### Basic List Filtering

Filter a simple list of items by adding the `data-filter` attribute.

```html:preview
<zn-filter-container>
  <div data-filter="Apple">Apple</div>
  <div data-filter="Banana">Banana</div>
  <div data-filter="Cherry">Cherry</div>
  <div data-filter="Date">Date</div>
  <div data-filter="Elderberry">Elderberry</div>
</zn-filter-container>
```

### Card List

Filter a list of card components.

```html:preview
<zn-filter-container>
  <div style="display: grid; gap: 10px;">
    <zn-card data-filter="Product Alpha">
      <div slot="header">Product Alpha</div>
      <div>Description of Product Alpha</div>
    </zn-card>
    <zn-card data-filter="Product Beta">
      <div slot="header">Product Beta</div>
      <div>Description of Product Beta</div>
    </zn-card>
    <zn-card data-filter="Product Gamma">
      <div slot="header">Product Gamma</div>
      <div>Description of Product Gamma</div>
    </zn-card>
  </div>
</zn-filter-container>
```

### Grouped Sections

Filter items within multiple panel sections. Empty sections are automatically hidden.

```html:preview
<zn-filter-container>
  <zn-sp flush>
    <zn-panel caption="Fruits">
      <div data-filter="Apple" style="padding: 5px;">Apple</div>
      <div data-filter="Banana" style="padding: 5px;">Banana</div>
      <div data-filter="Cherry" style="padding: 5px;">Cherry</div>
    </zn-panel>

    <zn-panel caption="Vegetables">
      <div data-filter="Carrot" style="padding: 5px;">Carrot</div>
      <div data-filter="Broccoli" style="padding: 5px;">Broccoli</div>
      <div data-filter="Spinach" style="padding: 5px;">Spinach</div>
    </zn-panel>

    <zn-panel caption="Grains">
      <div data-filter="Rice" style="padding: 5px;">Rice</div>
      <div data-filter="Wheat" style="padding: 5px;">Wheat</div>
      <div data-filter="Oats" style="padding: 5px;">Oats</div>
    </zn-panel>
  </zn-sp>
</zn-filter-container>
```

### Contact List

Filter a contact list with names and emails.

```html:preview
<zn-filter-container>
  <zn-sp flush>
    <zn-panel caption="Team Members">
      <div style="display: flex; flex-direction: column;">
        <div data-filter="Alice Johnson alice.johnson@company.com"
             style="padding: 10px; border-bottom: 1px solid var(--zn-color-neutral-200);">
          <strong>Alice Johnson</strong>
          <div style="color: var(--zn-color-neutral-500); font-size: 0.9em;">alice.johnson@company.com</div>
        </div>
        <div data-filter="Bob Smith bob.smith@company.com"
             style="padding: 10px; border-bottom: 1px solid var(--zn-color-neutral-200);">
          <strong>Bob Smith</strong>
          <div style="color: var(--zn-color-neutral-500); font-size: 0.9em;">bob.smith@company.com</div>
        </div>
        <div data-filter="Carol White carol.white@company.com"
             style="padding: 10px; border-bottom: 1px solid var(--zn-color-neutral-200);">
          <strong>Carol White</strong>
          <div style="color: var(--zn-color-neutral-500); font-size: 0.9em;">carol.white@company.com</div>
        </div>
      </div>
    </zn-panel>
  </zn-sp>
</zn-filter-container>
```

### Custom Filter Attribute

Use a custom attribute name for filtering by setting the `attr` property.

```html:preview
<zn-filter-container attr="search">
  <div data-search="Red Item">Red Item</div>
  <div data-search="Blue Item">Blue Item</div>
  <div data-search="Green Item">Green Item</div>
</zn-filter-container>
```

### Product Catalog

Filter products with multiple data points in the filter attribute.

```html:preview
<zn-filter-container>
  <div style="display: grid; gap: 10px;">
    <zn-card data-filter="Laptop Computer Electronics">
      <div slot="header">Laptop</div>
      <div>Category: Electronics</div>
      <div>Type: Computer</div>
    </zn-card>
    <zn-card data-filter="Smartphone Mobile Electronics">
      <div slot="header">Smartphone</div>
      <div>Category: Electronics</div>
      <div>Type: Mobile</div>
    </zn-card>
    <zn-card data-filter="Headphones Audio Electronics">
      <div slot="header">Headphones</div>
      <div>Category: Electronics</div>
      <div>Type: Audio</div>
    </zn-card>
  </div>
</zn-filter-container>
```

### Settings Menu

Filter configuration options in a settings interface.

```html:preview
<zn-filter-container>
  <zn-sp flush>
    <zn-panel caption="Account Settings">
      <div data-filter="Profile Information" style="padding: 10px;">Profile Information</div>
      <div data-filter="Email Preferences" style="padding: 10px;">Email Preferences</div>
      <div data-filter="Password Security" style="padding: 10px;">Password Security</div>
    </zn-panel>

    <zn-panel caption="Application Settings">
      <div data-filter="Theme Appearance" style="padding: 10px;">Theme Appearance</div>
      <div data-filter="Language Localization" style="padding: 10px;">Language Localization</div>
      <div data-filter="Notifications Alerts" style="padding: 10px;">Notifications Alerts</div>
    </zn-panel>

    <zn-panel caption="Privacy Settings">
      <div data-filter="Data Sharing" style="padding: 10px;">Data Sharing</div>
      <div data-filter="Cookie Preferences" style="padding: 10px;">Cookie Preferences</div>
      <div data-filter="Two-Factor Authentication" style="padding: 10px;">Two-Factor Authentication</div>
    </zn-panel>
  </zn-sp>
</zn-filter-container>
```
