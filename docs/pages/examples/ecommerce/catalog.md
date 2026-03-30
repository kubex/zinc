---
meta:
  title: Product Catalog
  description: E-commerce product catalog with filters, grid view, and pagination.
fullWidth: true
---

# Product Catalog

A product browsing interface with sidebar filters, grid/list toggle, and product cards. Demonstrates `zn-sidebar`, `zn-tile`, `zn-checkbox-group`, and `zn-pagination`.

```html:preview
<zn-sidebar>
  <!-- Filter Sidebar -->
  <div slot="side" style="padding: var(--zn-spacing-md);">
    <h3 style="margin-top: 0;">Filters</h3>

    <zn-sp>
      <zn-panel caption="Categories">
        <zn-checkbox-group>
          <zn-checkbox value="electronics" checked>Electronics</zn-checkbox>
          <zn-checkbox value="clothing">Clothing</zn-checkbox>
          <zn-checkbox value="home">Home & Garden</zn-checkbox>
          <zn-checkbox value="sports">Sports</zn-checkbox>
        </zn-checkbox-group>
      </zn-panel>

      <zn-panel caption="Price Range">
        <zn-sp>
          <zn-cols layout="1,1">
            <zn-input type="number" placeholder="Min" size="small"></zn-input>
            <zn-input type="number" placeholder="Max" size="small"></zn-input>
          </zn-cols>
        </zn-sp>
      </zn-panel>

      <zn-panel caption="Stock Status">
        <zn-radio-group value="all">
          <zn-radio value="all">All</zn-radio>
          <zn-radio value="in-stock">In Stock</zn-radio>
          <zn-radio value="low-stock">Low Stock</zn-radio>
          <zn-radio value="out-of-stock">Out of Stock</zn-radio>
        </zn-radio-group>
      </zn-panel>

      <zn-panel caption="Rating">
        <zn-checkbox-group>
          <zn-checkbox value="4">4 stars & up</zn-checkbox>
          <zn-checkbox value="3">3 stars & up</zn-checkbox>
          <zn-checkbox value="2">2 stars & up</zn-checkbox>
        </zn-checkbox-group>
      </zn-panel>

      <zn-button color="secondary" size="small" style="width: 100%;">Clear All Filters</zn-button>
    </zn-sp>
  </div>

  <!-- Main Content -->
  <zn-container padded style="background: var(--zn-color-neutral-50);">
    <zn-sp>
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--zn-spacing-sm);">
        <div>
          <h2 style="margin: 0;">Products</h2>
          <span style="color: var(--zn-text-secondary);">Showing 1-12 of 156 products</span>
        </div>
        <div style="display: flex; gap: var(--zn-spacing-sm); align-items: center;">
          <zn-input placeholder="Search products..." icon="search" size="small" style="width: 200px;"></zn-input>
          <zn-select size="small" style="width: 150px;">
            <zn-option value="newest" selected>Newest First</zn-option>
            <zn-option value="price-low">Price: Low to High</zn-option>
            <zn-option value="price-high">Price: High to Low</zn-option>
            <zn-option value="popular">Most Popular</zn-option>
          </zn-select>
          <zn-button-group>
            <zn-button size="small" icon="grid_view" color="secondary"></zn-button>
            <zn-button size="small" icon="view_list" color="transparent"></zn-button>
          </zn-button-group>
        </div>
      </div>

      <!-- Bulk Actions -->
      <zn-bulk-actions>
        <span slot="count">4 selected</span>
        <zn-button size="small" color="secondary">Publish</zn-button>
        <zn-button size="small" color="secondary">Archive</zn-button>
        <zn-button size="small" color="error">Delete</zn-button>
      </zn-bulk-actions>

      <!-- Product Grid -->
      <zn-cols layout="1,1,1,1">
        <zn-tile>
          <div slot="media" style="background: var(--zn-color-neutral-100); height: 150px; display: flex; align-items: center; justify-content: center;">
            <zn-icon src="image" style="font-size: 48px; color: var(--zn-color-neutral-300);"></zn-icon>
          </div>
          <zn-tile-property label="Wireless Headphones">
            <zn-chip size="small" color="success">In Stock</zn-chip>
          </zn-tile-property>
          <zn-tile-property label="$149.99">
            <zn-rating value="4" readonly size="small"></zn-rating>
          </zn-tile-property>
        </zn-tile>

        <zn-tile>
          <div slot="media" style="background: var(--zn-color-neutral-100); height: 150px; display: flex; align-items: center; justify-content: center;">
            <zn-icon src="image" style="font-size: 48px; color: var(--zn-color-neutral-300);"></zn-icon>
          </div>
          <zn-tile-property label="Smart Watch Pro">
            <zn-chip size="small" color="warning">Low Stock</zn-chip>
          </zn-tile-property>
          <zn-tile-property label="$299.99">
            <zn-rating value="5" readonly size="small"></zn-rating>
          </zn-tile-property>
        </zn-tile>

        <zn-tile>
          <div slot="media" style="background: var(--zn-color-neutral-100); height: 150px; display: flex; align-items: center; justify-content: center;">
            <zn-icon src="image" style="font-size: 48px; color: var(--zn-color-neutral-300);"></zn-icon>
          </div>
          <zn-tile-property label="Bluetooth Speaker">
            <zn-chip size="small" color="success">In Stock</zn-chip>
          </zn-tile-property>
          <zn-tile-property label="$79.99">
            <zn-rating value="4" readonly size="small"></zn-rating>
          </zn-tile-property>
        </zn-tile>

        <zn-tile>
          <div slot="media" style="background: var(--zn-color-neutral-100); height: 150px; display: flex; align-items: center; justify-content: center;">
            <zn-icon src="image" style="font-size: 48px; color: var(--zn-color-neutral-300);"></zn-icon>
          </div>
          <zn-tile-property label="USB-C Hub">
            <zn-chip size="small" color="error">Out of Stock</zn-chip>
          </zn-tile-property>
          <zn-tile-property label="$59.99">
            <zn-rating value="3" readonly size="small"></zn-rating>
          </zn-tile-property>
        </zn-tile>

        <zn-tile>
          <div slot="media" style="background: var(--zn-color-neutral-100); height: 150px; display: flex; align-items: center; justify-content: center;">
            <zn-icon src="image" style="font-size: 48px; color: var(--zn-color-neutral-300);"></zn-icon>
          </div>
          <zn-tile-property label="Mechanical Keyboard">
            <zn-chip size="small" color="success">In Stock</zn-chip>
          </zn-tile-property>
          <zn-tile-property label="$129.99">
            <zn-rating value="5" readonly size="small"></zn-rating>
          </zn-tile-property>
        </zn-tile>

        <zn-tile>
          <div slot="media" style="background: var(--zn-color-neutral-100); height: 150px; display: flex; align-items: center; justify-content: center;">
            <zn-icon src="image" style="font-size: 48px; color: var(--zn-color-neutral-300);"></zn-icon>
          </div>
          <zn-tile-property label="Webcam HD">
            <zn-chip size="small" color="success">In Stock</zn-chip>
          </zn-tile-property>
          <zn-tile-property label="$89.99">
            <zn-rating value="4" readonly size="small"></zn-rating>
          </zn-tile-property>
        </zn-tile>

        <zn-tile>
          <div slot="media" style="background: var(--zn-color-neutral-100); height: 150px; display: flex; align-items: center; justify-content: center;">
            <zn-icon src="image" style="font-size: 48px; color: var(--zn-color-neutral-300);"></zn-icon>
          </div>
          <zn-tile-property label="Laptop Stand">
            <zn-chip size="small" color="warning">Low Stock</zn-chip>
          </zn-tile-property>
          <zn-tile-property label="$49.99">
            <zn-rating value="4" readonly size="small"></zn-rating>
          </zn-tile-property>
        </zn-tile>

        <zn-tile>
          <div slot="media" style="background: var(--zn-color-neutral-100); height: 150px; display: flex; align-items: center; justify-content: center;">
            <zn-icon src="image" style="font-size: 48px; color: var(--zn-color-neutral-300);"></zn-icon>
          </div>
          <zn-tile-property label="Wireless Mouse">
            <zn-chip size="small" color="success">In Stock</zn-chip>
          </zn-tile-property>
          <zn-tile-property label="$39.99">
            <zn-rating value="5" readonly size="small"></zn-rating>
          </zn-tile-property>
        </zn-tile>
      </zn-cols>

      <!-- Pagination -->
      <div style="display: flex; justify-content: center; padding: var(--zn-spacing-lg);">
        <zn-pagination total="156" page-size="12" current-page="1"></zn-pagination>
      </div>
    </zn-sp>
  </zn-container>
</zn-sidebar>
```

**Components demonstrated:** `zn-sidebar`, `zn-tile`, `zn-tile-property`, `zn-checkbox-group`, `zn-checkbox`, `zn-radio-group`, `zn-radio`, `zn-pagination`, `zn-bulk-actions`, `zn-rating`, `zn-button-group`
