---
meta:
  title: Product Editor
  description: Complex multi-tab form for editing product data with rich text editor.
fullWidth: true
---

# Product Editor

A comprehensive product editing form with multiple tabs covering all product attributes. Demonstrates `zn-tabs`, `zn-editor`, `zn-file`, and complex form layouts.

```html:preview
<zn-pane>
  <zn-sp flush>
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--zn-spacing-md); border-bottom: 1px solid var(--zn-color-neutral-200);">
      <div style="display: flex; align-items: center; gap: var(--zn-spacing-md);">
        <zn-button icon="arrow_back" color="transparent" size="small"></zn-button>
        <div>
          <h2 style="margin: 0;">Edit Product</h2>
          <span style="color: var(--zn-text-secondary);">Wireless Headphones Pro</span>
        </div>
      </div>
      <div style="display: flex; gap: var(--zn-spacing-sm);">
        <zn-button color="secondary">Discard</zn-button>
        <zn-button>Save Changes</zn-button>
      </div>
    </div>

    <!-- Tabbed Content -->
    <zn-panel tabbed style="border: none;">
      <zn-tabs>
        <zn-navbar slot="top">
          <li tab>Details</li>
          <li tab="media">Media</li>
          <li tab="inventory">Inventory</li>
          <li tab="pricing">Pricing</li>
          <li tab="seo">SEO</li>
        </zn-navbar>

        <!-- Details Tab -->
        <div id="" style="padding: var(--zn-spacing-lg);">
          <zn-cols layout="2,1">
            <zn-sp>
              <zn-input label="Product Title" value="Wireless Headphones Pro" required></zn-input>

              <div>
                <label style="display: block; margin-bottom: var(--zn-spacing-xs); font-weight: 500;">Description</label>
                <zn-editor style="height: 200px;">
                  <p>Experience premium sound quality with our Wireless Headphones Pro. Featuring advanced noise cancellation, 30-hour battery life, and ultra-comfortable ear cushions.</p>
                  <ul>
                    <li>Active Noise Cancellation</li>
                    <li>30-hour battery life</li>
                    <li>Premium memory foam ear cushions</li>
                    <li>Bluetooth 5.2 connectivity</li>
                  </ul>
                </zn-editor>
              </div>

              <zn-cols layout="1,1">
                <zn-select label="Category" required>
                  <zn-option value="electronics" selected>Electronics</zn-option>
                  <zn-option value="clothing">Clothing</zn-option>
                  <zn-option value="home">Home & Garden</zn-option>
                </zn-select>
                <zn-select label="Brand">
                  <zn-option value="acme" selected>ACME Audio</zn-option>
                  <zn-option value="sonic">Sonic</zn-option>
                  <zn-option value="beats">Beats</zn-option>
                </zn-select>
              </zn-cols>

              <div>
                <label style="display: block; margin-bottom: var(--zn-spacing-xs); font-weight: 500;">Tags</label>
                <zn-checkbox-group>
                  <zn-checkbox value="wireless" checked>Wireless</zn-checkbox>
                  <zn-checkbox value="bluetooth" checked>Bluetooth</zn-checkbox>
                  <zn-checkbox value="noise-cancelling" checked>Noise Cancelling</zn-checkbox>
                  <zn-checkbox value="premium">Premium</zn-checkbox>
                  <zn-checkbox value="new-arrival">New Arrival</zn-checkbox>
                </zn-checkbox-group>
              </div>
            </zn-sp>

            <zn-sp>
              <zn-panel caption="Status">
                <zn-sp>
                  <zn-select label="Visibility">
                    <zn-option value="published" selected>Published</zn-option>
                    <zn-option value="draft">Draft</zn-option>
                    <zn-option value="archived">Archived</zn-option>
                  </zn-select>
                  <zn-item label="Featured Product" description="Show on homepage">
                    <zn-toggle slot="actions" checked></zn-toggle>
                  </zn-item>
                </zn-sp>
              </zn-panel>
            </zn-sp>
          </zn-cols>
        </div>

        <!-- Media Tab -->
        <div id="media" style="padding: var(--zn-spacing-lg);">
          <zn-sp>
            <div>
              <label style="display: block; margin-bottom: var(--zn-spacing-sm); font-weight: 500;">Product Images</label>
              <zn-file accept="image/*" multiple style="min-height: 150px;">
                Drag and drop images here, or click to browse
              </zn-file>
            </div>

            <zn-panel caption="Current Images">
              <zn-cols layout="1,1,1,1">
                <div style="position: relative; background: var(--zn-color-neutral-100); height: 120px; border-radius: var(--zn-border-radius-medium); display: flex; align-items: center; justify-content: center;">
                  <zn-icon src="image" style="font-size: 32px; color: var(--zn-color-neutral-400);"></zn-icon>
                  <zn-chip size="small" style="position: absolute; top: 8px; left: 8px;">Primary</zn-chip>
                  <zn-button icon="delete" size="x-small" color="error" style="position: absolute; top: 8px; right: 8px;"></zn-button>
                </div>
                <div style="position: relative; background: var(--zn-color-neutral-100); height: 120px; border-radius: var(--zn-border-radius-medium); display: flex; align-items: center; justify-content: center;">
                  <zn-icon src="image" style="font-size: 32px; color: var(--zn-color-neutral-400);"></zn-icon>
                  <zn-button icon="delete" size="x-small" color="error" style="position: absolute; top: 8px; right: 8px;"></zn-button>
                </div>
                <div style="position: relative; background: var(--zn-color-neutral-100); height: 120px; border-radius: var(--zn-border-radius-medium); display: flex; align-items: center; justify-content: center;">
                  <zn-icon src="image" style="font-size: 32px; color: var(--zn-color-neutral-400);"></zn-icon>
                  <zn-button icon="delete" size="x-small" color="error" style="position: absolute; top: 8px; right: 8px;"></zn-button>
                </div>
              </zn-cols>
            </zn-panel>
          </zn-sp>
        </div>

        <!-- Inventory Tab -->
        <div id="inventory" style="padding: var(--zn-spacing-lg);">
          <zn-cols layout="1,1">
            <zn-sp>
              <zn-input label="SKU" value="WH-PRO-001" required></zn-input>
              <zn-input label="Barcode" placeholder="Enter barcode"></zn-input>
              <zn-input label="Quantity" type="number" value="47"></zn-input>
              <zn-input label="Low Stock Threshold" type="number" value="10" help-text="Alert when stock falls below this level"></zn-input>
            </zn-sp>

            <zn-sp>
              <zn-panel caption="Inventory Settings">
                <zn-sp divide no-gap>
                  <zn-item label="Track Inventory" description="Monitor stock levels">
                    <zn-toggle slot="actions" checked></zn-toggle>
                  </zn-item>
                  <zn-item label="Allow Backorders" description="Allow orders when out of stock">
                    <zn-toggle slot="actions"></zn-toggle>
                  </zn-item>
                  <zn-item label="Show Stock Count" description="Display remaining stock to customers">
                    <zn-toggle slot="actions" checked></zn-toggle>
                  </zn-item>
                </zn-sp>
              </zn-panel>
            </zn-sp>
          </zn-cols>
        </div>

        <!-- Pricing Tab -->
        <div id="pricing" style="padding: var(--zn-spacing-lg);">
          <zn-cols layout="1,1">
            <zn-sp>
              <zn-input label="Base Price" type="number" value="149.99" prefix="$" required></zn-input>
              <zn-input label="Compare At Price" type="number" value="199.99" prefix="$" help-text="Original price shown crossed out"></zn-input>
              <zn-input label="Cost Per Item" type="number" value="65.00" prefix="$" help-text="For profit calculations"></zn-input>
            </zn-sp>

            <zn-sp>
              <zn-panel caption="Sale">
                <zn-sp>
                  <zn-item label="On Sale" description="Apply sale pricing">
                    <zn-toggle slot="actions" checked></zn-toggle>
                  </zn-item>
                  <zn-cols layout="1,1">
                    <zn-datepicker label="Sale Start"></zn-datepicker>
                    <zn-datepicker label="Sale End"></zn-datepicker>
                  </zn-cols>
                </zn-sp>
              </zn-panel>

              <zn-panel caption="Tax">
                <zn-sp>
                  <zn-item label="Charge Tax" description="Apply tax to this product">
                    <zn-toggle slot="actions" checked></zn-toggle>
                  </zn-item>
                  <zn-select label="Tax Class">
                    <zn-option value="standard" selected>Standard Rate</zn-option>
                    <zn-option value="reduced">Reduced Rate</zn-option>
                    <zn-option value="zero">Zero Rate</zn-option>
                  </zn-select>
                </zn-sp>
              </zn-panel>
            </zn-sp>
          </zn-cols>
        </div>

        <!-- SEO Tab -->
        <div id="seo" style="padding: var(--zn-spacing-lg);">
          <zn-sp>
            <zn-panel caption="Search Engine Preview">
              <div style="padding: var(--zn-spacing-md); background: var(--zn-color-neutral-50); border-radius: var(--zn-border-radius-medium);">
                <div style="color: #1a0dab; font-size: 18px;">Wireless Headphones Pro - ACME Audio</div>
                <div style="color: #006621; font-size: 14px;">https://store.example.com/products/wireless-headphones-pro</div>
                <div style="color: #545454; font-size: 14px;">Experience premium sound quality with our Wireless Headphones Pro. Featuring advanced noise cancellation, 30-hour battery life...</div>
              </div>
            </zn-panel>

            <zn-cols layout="1,1">
              <zn-sp>
                <zn-input label="Meta Title" value="Wireless Headphones Pro - ACME Audio" maxlength="60" help-text="60 characters max"></zn-input>
                <zn-textarea label="Meta Description" rows="3" maxlength="160" help-text="160 characters max">Experience premium sound quality with our Wireless Headphones Pro. Featuring advanced noise cancellation, 30-hour battery life, and ultra-comfortable ear cushions.</zn-textarea>
              </zn-sp>

              <zn-sp>
                <zn-input label="URL Slug" value="wireless-headphones-pro" prefix="products/"></zn-input>
                <zn-input label="Canonical URL" placeholder="Leave blank for default"></zn-input>
              </zn-sp>
            </zn-cols>
          </zn-sp>
        </div>
      </zn-tabs>
    </zn-panel>
  </zn-sp>
</zn-pane>
```

**Components demonstrated:** `zn-tabs`, `zn-navbar`, `zn-editor`, `zn-file`, `zn-input`, `zn-textarea`, `zn-select`, `zn-checkbox-group`, `zn-toggle`, `zn-datepicker`, `zn-panel`, `zn-item`, `zn-cols`
