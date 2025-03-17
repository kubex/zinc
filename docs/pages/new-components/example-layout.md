---
meta:
  title: Example Layout
  description: This is an example layout using the new components
fullWidth: true
---

# Example Layout

```html:preview

<zn-container padded>
  <zn-sp>
    <zn-cols layout="1,1">
      <zn-panel caption="Some Panel">
        <zn-sp divide no-gap>
          <zn-description-item style="background: var(--zn-color-red-100);" label="Label 1">This is awesome
          </zn-description-item>
          <zn-description-item style="background: var(--zn-color-red-100);" label="Label 2">This is awesome
          </zn-description-item>
        </zn-sp>
      </zn-panel>

      <zn-panel caption="Some Panel">
        <zn-sp divide>
          <zn-description-item style="background: var(--zn-color-red-100);" label="Label 1">This is awesome
          </zn-description-item>
          <zn-description-item style="background: var(--zn-color-red-100);" label="Label 2">This is awesome
          </zn-description-item>
        </zn-sp>
      </zn-panel>
    </zn-cols>

    <zn-panel caption="Some Panel">
      <zn-sp divide>
        <zn-description-item style="background: var(--zn-color-red-100);" label="Label 1">This is awesome
        </zn-description-item>
        <zn-description-item style="background: var(--zn-color-red-100);" label="Label 2">This is awesome
        </zn-description-item>
      </zn-sp>
    </zn-panel>

    <zn-panel caption="Some Panel">
      <zn-sp divide>
        <zn-description-item style="background: var(--zn-color-red-100);" label="Label 1">This is awesome
        </zn-description-item>
        <zn-description-item style="background: var(--zn-color-red-100);" label="Label 2">This is awesome
        </zn-description-item>
      </zn-sp>
    </zn-panel>
  </zn-sp>
</zn-container>
```

### Second Example

```html:preview

<zn-container padded>
  <zn-sp>
    <zn-panel caption="Some Panel" flush>
      <zn-sp divide flush>
        <zn-description-item style="background: var(--zn-color-red-100);" label="Label 1">This is awesome</zn-description-item>
        <zn-description-item style="background: var(--zn-color-red-100);" label="Label 2">This is awesome</zn-description-item>
      </zn-sp>
    </zn-panel>

    <zn-panel caption="Some Panel">
      <zn-sp divide>
        <zn-description-item style="background: var(--zn-color-red-100);" label="Label 1">This is awesome</zn-description-item>
        <zn-description-item style="background: var(--zn-color-red-100);" label="Label 2">This is awesome</zn-description-item>
      </zn-sp>
    </zn-panel>
  </zn-sp>
</zn-container>
```