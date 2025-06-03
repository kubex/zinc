---
meta:
  title: Icon
  description:
layout: component
---

```html:preview

<zn-icon src="Add"></zn-icon>
```

## Examples

### Avatar

```html:preview

<zn-icon src="BG" library="avatar" color="primary"></zn-icon>
<zn-icon src="BG" library="avatar" color="accent" round></zn-icon>
```

## Icon Colors

```html:preview

<zn-icon src="Check" color="accent" size="32"></zn-icon>
<zn-icon src="check" color="warning" size="32"></zn-icon>
<zn-icon src="check" color="primary" size="32"></zn-icon>
<zn-icon src="check" color="info" size="32"></zn-icon>
<zn-icon src="check" color="error" size="32"></zn-icon>
<zn-icon src="check" color="disabled" size="32"></zn-icon>
<zn-icon src="check" color="success" size="32"></zn-icon>
<zn-icon src="check" color="white" size="32"></zn-icon>
```

## Gravatar

```html:preview

<zn-icon src="test1@example.com" size="32"></zn-icon>
```

## Kubex Brands

```html:preview

<zn-icon src="adyen" size="32" library="kubex-brands"></zn-icon>
```


## Default  icons

Our icons are taken directly from Material Icons. Click or tap on any icon to copy its name, then you can use it in
your HTML like this:

```html

<zn-icon src="check"></zn-icon>
```

<div class="icon-search">
  <div class="icon-search-controls">
    <zn-input placeholder="Search Icons" clearable>
      <zn-icon slot="prefix" src="search"></zn-icon>
    </zn-input>
    <zn-select value="outline">
      <zn-option value="outline">Outlined</zn-option>
      <zn-option value="fill">Filled</zn-option>
      <zn-option value="all">All icons</zn-option>
    </zn-select>
  </div>
  <div class="icon-list"></div>
  <input type="text" class="icon-copy-input" aria-hidden="true" tabindex="-1">
</div>


<!-- Supporting scripts and styles for the search utility -->
<script>
  function wrapWithTooltip(item) {
    const tooltip = document.createElement('zn-tooltip');
    tooltip.content = item.getAttribute('data-name');

    // Close open tooltips
    document.querySelectorAll('.icon-list zn-tooltip[open]').forEach(tooltip => tooltip.hide());

    // Wrap it with a tooltip and trick it into showing up
    item.parentNode.insertBefore(tooltip, item);
    tooltip.appendChild(item);
    requestAnimationFrame(() => tooltip.dispatchEvent(new MouseEvent('mouseover')));
  }

  fetch('{{ assetUrl('icons.json') }}')
    .then(res => res.json())
    .then(icons => {
      const container = document.querySelector('.icon-search');
      const input = container.querySelector('zn-input');
      const select = container.querySelector('zn-select');
      const copyInput = container.querySelector('.icon-copy-input');
      const loader = container.querySelector('.icon-loader');
      const list = container.querySelector('.icon-list');
      const queue = [];
      let inputTimeout

      // Generate icons
      icons.icons.map(i => {
        const item = document.createElement('div');
        item.classList.add('icon-list-item');
        item.setAttribute('data-name', i.name);
        item.setAttribute('data-terms', [i.name, i.title, ...(i.tags || []), ...(i.categories || [])].join(' '));
        item.innerHTML = `
          <zn-icon src="${i.name.replace(' ', '_')}" size="32"></zn-icon>
        `;
        list.appendChild(item);

        // Wrap it with a tooltip the first time the mouse lands on it. We do this instead of baking them into the DOM
        item.addEventListener('mouseover', () => wrapWithTooltip(item), { once: true });

        // Copy on click
        item.addEventListener('click', () => {
          const tooltip = item.closest('zn-tooltip');
          copyInput.value = i.name;
          copyInput.select();
          document.execCommand('copy');

          if (tooltip) {
            tooltip.content = 'Copied!';
            setTimeout(() => tooltip.content = i.name, 1000);
          }
        });
      });

      // Filter as the user types
      input.addEventListener('zn-input', () => {
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => {
          [...list.querySelectorAll('.icon-list-item')].map(item => {
            const filter = input.value.toLowerCase();
            if (filter === '') {
              item.hidden = false;
            } else {
              const terms = item.getAttribute('data-terms').toLowerCase();
              item.hidden = terms.indexOf(filter) < 0;
            }
          });
        }, 250);
      });

      // Sort by type and remember preference
      const iconType = sessionStorage.getItem('zn-icon:type') || 'outline';
      select.value = iconType;
      list.setAttribute('data-type', select.value);
      select.addEventListener('zn-change', () => {
        list.setAttribute('data-type', select.value);
        sessionStorage.setItem('zn-icon:type', select.value);
      });
    });
</script>

<style>
  .icon-search {
    border: solid 1px var(--zn-panel-border-color);
    border-radius: var(--zn-border-radius-medium);
    padding: var(--zn-spacing-medium);
  }

  .icon-search [hidden] {
    display: none;
  }

  .icon-search-controls {
    display: flex;
  }

  .icon-search-controls zn-input {
    flex: 1 1 auto;
  }

  .icon-search-controls zn-select {
    width: 10rem;
    flex: 0 0 auto;
    margin-left: 1rem;
  }

  .icon-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 30vh;
  }

  .icon-list {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    position: relative;
    margin-top: 1rem;
  }

  .icon-loader[hidden],
  .icon-list[hidden] {
    display: none;
  }

  .icon-list-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--zn-border-radius-medium);
    font-size: 24px;
    width: 2em;
    height: 2em;
    margin: 0 auto;
    cursor: copy;
    transition: var(--zn-transition-medium) all;
  }

  .icon-list-item:hover {
    background-color: var(--zn-color-primary-50);
    color: var(--zn-color-primary-600);
  }

  .icon-list[data-type="outline"] .icon-list-item[data-name$="-fill"] {
    display: none;
  }

  .icon-list[data-type="fill"] .icon-list-item:not([data-name$="-fill"]) {
    display: none;
  }

  .icon-copy-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  @media screen and (max-width: 1000px) {
    .icon-list {
      grid-template-columns: repeat(8, 1fr);
    }

    .icon-list-item {
      font-size: 20px;
    }

    .icon-search-controls {
      display: block;
    }

    .icon-search-controls zn-select {
      width: auto;
      margin: 1rem 0 0 0;
    }
  }

  @media screen and (max-width: 500px) {
    .icon-list {
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>