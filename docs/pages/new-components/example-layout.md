---
meta:
  title: Example Layout
  description: This is an example layout using the new components
fullWidth: true
---

# Expanded Example

Most pages should be scaffolded in the following way. This layout is designed to be responsive and to work well on all
devices. It is also designed to be easy to read and understand.

`zn-sp` allows you to add space between elements. It is a shorthand for `zn-space`. It is a flex container that has a
default gap of `--zn-spacing-medium`. by specifying `no-gap` you can remove the gap between elements. So that if the
component you are using already includes padding or margin it will not be doubled up.

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

    <zn-panel caption="Some Panel" tabbed>
      <zn-tabs>
        <zn-navbar slot="top">
          <li tab>Customer</li>
          <li tab="something-else">Something Else</li>
        </zn-navbar>

        <zn-sp id="" divide>
          <zn-description-item style="background: var(--zn-color-red-100);" label="Label 1">This is awesome
          </zn-description-item>
          <zn-description-item style="background: var(--zn-color-red-100);" label="Label 2">This is awesome
          </zn-description-item>
        </zn-sp>

        <zn-sp id="something-else" divide>
          <zn-description-item style="background: var(--zn-color-red-100);" label="Label 3">This is not awesome
          </zn-description-item>
          <zn-description-item style="background: var(--zn-color-red-100);" label="Label 4">This is not awesome
          </zn-description-item>
        </zn-sp>
      </zn-tabs>
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

### Simple Panel Example

Using `flush` on the panel allows you to remove all padding around the content, this is great for tables that you want
to be full width.

```html:preview

<zn-container padded>
  <zn-sp>
    <zn-panel caption="Some Panel" flush>
      <zn-sp divide flush>
        <zn-description-item style="background: var(--zn-color-red-100);" label="Label 1">This is awesome</zn-description-item>
        <zn-description-item style="background: var(--zn-color-red-100);" label="Label 2">This is awesome</zn-description-item>
      </zn-sp>
    </zn-panel>
  </zn-sp>
</zn-container>
```


### Sidebar Layout Example

This is the standard way of scaffolding pages with a sidebar

```html:preview

<zn-sidebar>

  <div slot="side">
    <zn-sp divide flush>
      <zn-description-item style="background: var(--zn-color-red-100);" label="Label 1">This is awesome
      </zn-description-item>
      <zn-description-item style="background: var(--zn-color-red-100);" label="Label 2">This is awesome
      </zn-description-item>
    </zn-sp>
  </div>

  <zn-container padded style="background: var(--zn-color-neutral-50);">
    <zn-sp>
      <zn-panel caption="Some Panel" flush>
        <zn-sp divide flush>
          <zn-description-item style="background: var(--zn-color-red-100);" label="Label 1">This is awesome
          </zn-description-item>
          <zn-description-item style="background: var(--zn-color-red-100);" label="Label 2">This is awesome
          </zn-description-item>
        </zn-sp>
      </zn-panel>
    </zn-sp>
  </zn-container>

</zn-sidebar>

```