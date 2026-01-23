---
meta:
  title: Icon
  description: Icons are symbols used to represent actions, objects, or concepts throughout the interface.
layout: component
---

```html:preview
<zn-icon src="check"></zn-icon>
```

The icon component provides a flexible way to display icons from multiple libraries including Material Icons, Material Symbols, Line Icons, and custom brand icons. It also supports avatar generation, Gravatar, and custom image sources.

## Examples

### Basic Usage

The simplest way to use an icon is by specifying the icon name in the `src` attribute. By default, icons use the Material Symbols Outlined library.

```html:preview
<zn-icon src="home"></zn-icon>
<zn-icon src="settings"></zn-icon>
<zn-icon src="favorite"></zn-icon>
<zn-icon src="shopping_cart"></zn-icon>
```

### Sizes

Use the `size` attribute to control the icon's dimensions. The default size is 24 pixels.

```html:preview
<zn-icon src="star" size="16"></zn-icon>
<zn-icon src="star" size="24"></zn-icon>
<zn-icon src="star" size="32"></zn-icon>
<zn-icon src="star" size="48"></zn-icon>
<zn-icon src="star" size="64"></zn-icon>
```

### Colors

Use the `color` attribute to apply semantic or predefined colors to your icons.

```html:preview
<zn-icon src="check_circle" color="default" size="32"></zn-icon>
<zn-icon src="check_circle" color="primary" size="32"></zn-icon>
<zn-icon src="check_circle" color="accent" size="32"></zn-icon>
<zn-icon src="check_circle" color="info" size="32"></zn-icon>
<zn-icon src="check_circle" color="warning" size="32"></zn-icon>
<zn-icon src="check_circle" color="error" size="32"></zn-icon>
<zn-icon src="check_circle" color="success" size="32"></zn-icon>
<zn-icon src="check_circle" color="disabled" size="32"></zn-icon>
```

Additional color options are available for specific use cases:

```html:preview
<zn-icon src="palette" color="red" size="32"></zn-icon>
<zn-icon src="palette" color="blue" size="32"></zn-icon>
<zn-icon src="palette" color="green" size="32"></zn-icon>
<zn-icon src="palette" color="orange" size="32"></zn-icon>
<zn-icon src="palette" color="yellow" size="32"></zn-icon>
<zn-icon src="palette" color="indigo" size="32"></zn-icon>
<zn-icon src="palette" color="violet" size="32"></zn-icon>
<zn-icon src="palette" color="pink" size="32"></zn-icon>
<zn-icon src="palette" color="grey" size="32"></zn-icon>
<zn-icon src="palette" color="white" size="32" style="background: #333; padding: 4px;"></zn-icon>
```

### Round Icons

Add the `round` attribute to give icons a circular background.

```html:preview
<zn-icon src="person" size="40" color="primary" round></zn-icon>
<zn-icon src="mail" size="40" color="info" round></zn-icon>
<zn-icon src="favorite" size="40" color="error" round></zn-icon>
<zn-icon src="settings" size="40" color="accent" round></zn-icon>
```

### Padded Icons

Use the `padded` attribute to add internal spacing around the icon.

```html:preview
<zn-icon src="notifications" size="40" color="warning" padded round></zn-icon>
<zn-icon src="shopping_cart" size="40" color="success" padded round></zn-icon>
<zn-icon src="search" size="40" color="info" padded round></zn-icon>
```

### Squared Icons

Use the `squared` attribute to maintain a 1:1 aspect ratio for the icon container.

```html:preview
<zn-icon src="dashboard" size="40" color="primary" squared></zn-icon>
<zn-icon src="analytics" size="40" color="accent" squared></zn-icon>
```

### Blink Animation

Add the `blink` attribute to create a blinking effect, useful for notifications or alerts.

```html:preview
<zn-icon src="notification_important" size="32" color="warning" blink></zn-icon>
<zn-icon src="error" size="32" color="error" blink></zn-icon>
```

## Icon Libraries

The icon component supports multiple icon libraries. You can specify the library using the `library` attribute or use shorthand notation with the `@` symbol in the `src` attribute.

### Material Symbols Outlined (Default)

Material Symbols Outlined is the default library. These icons are modern and versatile.

```html:preview
<zn-icon src="home" size="32"></zn-icon>
<zn-icon src="account_circle" size="32"></zn-icon>
<zn-icon src="lightbulb" size="32"></zn-icon>
<zn-icon src="schedule" size="32"></zn-icon>
```

### Material Icons Variants

Material Icons come in several variants: filled, outlined, round, sharp, and two-tone.

```html:preview
<zn-icon src="favorite@material" size="32"></zn-icon>
<zn-icon src="favorite@material-outlined" size="32"></zn-icon>
<zn-icon src="favorite@material-round" size="32"></zn-icon>
<zn-icon src="favorite@material-sharp" size="32"></zn-icon>
<zn-icon src="favorite@material-two-tone" size="32"></zn-icon>
```

You can also use the library attribute directly:

```html:preview
<zn-icon src="star" library="material" size="32"></zn-icon>
<zn-icon src="star" library="material-outlined" size="32"></zn-icon>
<zn-icon src="star" library="material-round" size="32"></zn-icon>
<zn-icon src="star" library="material-sharp" size="32"></zn-icon>
<zn-icon src="star" library="material-two-tone" size="32"></zn-icon>
```

#### Shorthand Library Notation

You can use convenient shorthand notations:

- `@m` or `@mat` → material
- `@mo` → material-outlined
- `@mr` → material-round
- `@ms` → material-sharp
- `@mt` or `@m2` → material-two-tone
- `@mso` → material-symbols-outlined

```html:preview
<zn-icon src="home@m" size="32"></zn-icon>
<zn-icon src="home@mo" size="32"></zn-icon>
<zn-icon src="home@mr" size="32"></zn-icon>
<zn-icon src="home@ms" size="32"></zn-icon>
<zn-icon src="home@mt" size="32"></zn-icon>
```

### Line Icons

Line Icons provide a collection of modern, consistent icons. Use `library="line"` or the `@line` shorthand.

<a href="https://lineicons.com/free-icons" target="_blank">View Line Icons</a>

```html:preview
<zn-icon src="heart" library="line" size="32"></zn-icon>
<zn-icon src="bookmark-1" library="line" size="32"></zn-icon>
<zn-icon src="home" library="line" size="32"></zn-icon>
<zn-icon src="user" library="line" size="32"></zn-icon>
<zn-icon src="envelope" library="line" size="32"></zn-icon>
```

Using shorthand notation:

```html:preview
<zn-icon src="rocket@line" size="32"></zn-icon>
<zn-icon src="cloud-upload@line" size="32"></zn-icon>
<zn-icon src="star@line" size="32"></zn-icon>
```

### Brand Icons

Display brand logos and custom company icons using the brands library.

```html:preview
<style>.icncont{ width:40px; height:40px; background:#efefef; display:inline-flex; align-items: center; justify-content: center; margin:3px;}</style>
<span class=icncont><zn-icon src="adyen" size="32" library="brands"></zn-icon></span>
<span class=icncont><zn-icon src="bottomline" size="32" library="brands"></zn-icon></span>
<span class=icncont><zn-icon src="chargehive" size="32" library="brands"></zn-icon></span>
<span class=icncont><zn-icon src="checkout" size="32" library="brands"></zn-icon></span>
<span class=icncont><zn-icon src="clearhaus" size="32" library="brands"></zn-icon></span>
<span class=icncont><zn-icon src="cwams" size="32" library="brands"></zn-icon></span>
<span class=icncont><zn-icon src="epx" size="32" library="brands"></zn-icon></span>
<span class=icncont><zn-icon src="flexpay" size="32" library="brands"></zn-icon></span>
<span class=icncont><zn-icon src="gpayments" size="32" library="brands"></zn-icon></span>
<span class=icncont><zn-icon src="kount" size="32" library="brands"></zn-icon></span>
<span class=icncont><zn-icon src="qualpay" size="32" library="brands"></zn-icon></span>
<span class=icncont><zn-icon src="recaptcha" size="32" library="brands"></zn-icon></span>
<span class=icncont><zn-icon src="tokenex" size="32" library="brands"></zn-icon></span>
<span class=icncont><zn-icon src="trustpayments" size="32" library="brands"></zn-icon></span>
<span class=icncont><zn-icon src="worldpay" size="32" library="brands"></zn-icon></span>
<span class=icncont><zn-icon src="yapstone" size="32" library="brands"></zn-icon></span>
<span class=icncont><zn-icon src="chargie" size="32" library="brands"></zn-icon></span>
<span class=icncont><zn-icon src="chargie-head" size="32" library="brands"></zn-icon></span>
```

### Custom Images

Use custom images by providing a file path or URL in the `src` attribute. When using a path with a forward slash, the icon automatically uses the `src` library mode.

```html:preview
<zn-icon src="https://via.placeholder.com/32" size="32"></zn-icon>
<zn-icon src="https://via.placeholder.com/48" size="48"></zn-icon>
```

You can also explicitly set `library="src"`:

```html:preview
<zn-icon src="https://via.placeholder.com/32" library="src" size="32"></zn-icon>
```

### Avatar Generation

The avatar library automatically generates avatar initials with consistent color schemes. Perfect for user profiles and identity representation.

#### Basic Avatars

```html:preview
<zn-icon src="John Doe" library="avatar" size="40" round></zn-icon>
<zn-icon src="Jane Smith" library="avatar" size="40" round></zn-icon>
<zn-icon src="Bob Wilson" library="avatar" size="40" round></zn-icon>
<zn-icon src="Alice Johnson" library="avatar" size="40" round></zn-icon>
<zn-icon src="Mike Brown" library="avatar" size="40" round></zn-icon>
```

The avatar automatically extracts initials intelligently:

- First letter of first word + first letter of any capital letter or word boundary
- Supports camelCase (e.g., "ThankYou" → "TY")
- Supports space-separated names (e.g., "John Doe" → "JD")

#### Alphabet Display

```html:preview
<zn-icon src="A" size=32 library="avatar" round></zn-icon>
<zn-icon src="B" size=32 library="avatar" round></zn-icon>
<zn-icon src="C" size=32 library="avatar" round></zn-icon>
<zn-icon src="D" size=32 library="avatar" round></zn-icon>
<zn-icon src="E" size=32 library="avatar" round></zn-icon>
<zn-icon src="F" size=32 library="avatar" round></zn-icon>
<zn-icon src="G" size=32 library="avatar" round></zn-icon>
<zn-icon src="H" size=32 library="avatar" round></zn-icon>
<zn-icon src="I" size=32 library="avatar" round></zn-icon>
<zn-icon src="J" size=32 library="avatar" round></zn-icon>
<zn-icon src="K" size=32 library="avatar" round></zn-icon>
<zn-icon src="L" size=32 library="avatar" round></zn-icon>
<zn-icon src="M" size=32 library="avatar" round></zn-icon>
<zn-icon src="N" size=32 library="avatar" round></zn-icon>
<zn-icon src="O" size=32 library="avatar" round></zn-icon>
<zn-icon src="P" size=32 library="avatar" round></zn-icon>
<zn-icon src="Q" size=32 library="avatar" round></zn-icon>
<zn-icon src="R" size=32 library="avatar" round></zn-icon>
<zn-icon src="S" size=32 library="avatar" round></zn-icon>
<zn-icon src="T" size=32 library="avatar" round></zn-icon>
<zn-icon src="U" size=32 library="avatar" round></zn-icon>
<zn-icon src="V" size=32 library="avatar" round></zn-icon>
<zn-icon src="W" size=32 library="avatar" round></zn-icon>
<zn-icon src="X" size=32 library="avatar" round></zn-icon>
<zn-icon src="Y" size=32 library="avatar" round></zn-icon>
<zn-icon src="Z" size=32 library="avatar" round></zn-icon>
```

#### Avatars with Colors

Override the automatic color generation by specifying a `color` attribute:

```html:preview
<zn-icon src="RV" size="40" library="avatar" round></zn-icon>
<zn-icon src="RV" size="40" library="avatar" color="primary"></zn-icon>
<zn-icon src="BG" size="40" library="avatar" color="accent" round></zn-icon>
<zn-icon src="Random Name" size="40" library="avatar" color="error" round></zn-icon>
<zn-icon src="ThankYou" size="40" library="avatar" color="success" round></zn-icon>
<zn-icon src="What NeXt" size="40" library="avatar" color="warning" round></zn-icon>
```

#### Avatar Shapes

Avatars work with or without the `round` attribute:

```html:preview
<zn-icon src="Square Avatar" size="40" library="avatar"></zn-icon>
<zn-icon src="Round Avatar" size="40" library="avatar" round></zn-icon>
<zn-icon src="Padded Avatar" size="48" library="avatar" round padded></zn-icon>
```

Using shorthand notation:

```html:preview
<zn-icon src="John Doe@avatar" size="40" round></zn-icon>
<zn-icon src="Jane Smith@av" size="40" round></zn-icon>
```

### Gravatar

Gravatar provides globally recognized avatars based on email addresses. Simply provide an email address as the `src` and the component will automatically detect it and use Gravatar.

```html:preview
<zn-icon src="test1@example.com" size="48" round></zn-icon>
<zn-icon src="user@example.com" size="48" round></zn-icon>
<zn-icon src="hello@example.com" size="48" round></zn-icon>
```

#### Gravatar with Fallback

You can specify a fallback image type using the `#` symbol followed by the fallback type:

```html:preview
<zn-icon src="nonexistent@example.com#identicon" size="48" round></zn-icon>
<zn-icon src="nonexistent@example.com#monsterid" size="48" round></zn-icon>
<zn-icon src="nonexistent@example.com#wavatar" size="48" round></zn-icon>
<zn-icon src="nonexistent@example.com#retro" size="48" round></zn-icon>
<zn-icon src="nonexistent@example.com#robohash" size="48" round></zn-icon>
```

Explicit library specification:

```html:preview
<zn-icon src="test1@example.com" library="gravatar" size="48"></zn-icon>
```

Using shorthand notation:

```html:preview
<zn-icon src="test1@example.com@grav" size="48" round></zn-icon>
```

### Libravatar

Libravatar is an open-source alternative to Gravatar. Use it for federated avatar services.

```html:preview
<zn-icon src="test1@example.com" library="libravatar" size="48" round></zn-icon>
<zn-icon src="user@example.com" library="libravatar" size="48" round></zn-icon>
```

Similar to Gravatar, you can specify fallback options:

```html:preview
<zn-icon src="nonexistent@example.com#identicon" library="libravatar" size="48" round></zn-icon>
```

## Advanced Features

### Alt Text for Accessibility

Use the `alt` attribute to provide alternative text for image-based icons (custom images, Gravatar, Libravatar).

```html:preview
<zn-icon src="https://via.placeholder.com/32" alt="Placeholder image" size="32"></zn-icon>
<zn-icon src="user@example.com" alt="User avatar" size="32" round></zn-icon>
```

### Special Syntax

The icon component supports special syntax in the `src` attribute for quick configuration.

#### Hash Symbol (#) for Modifiers

Add modifiers after a `#` symbol:

```html:preview
<zn-icon src="star#round" size="32" color="warning"></zn-icon>
<zn-icon src="favorite#round" size="32" color="error"></zn-icon>
```

#### At Symbol (@) for Library Selection

Quickly specify the library using `@`:

```html:preview
<zn-icon src="home@material" size="32"></zn-icon>
<zn-icon src="star@line" size="32"></zn-icon>
<zn-icon src="John Doe@avatar" size="40" round></zn-icon>
```

Combined with modifiers:

```html:preview
<zn-icon src="favorite@material#round" size="32" color="error"></zn-icon>
```

### Slotted Content

When no `src` is provided and no `library` is specified, you can use the default slot to insert custom content:

```html:preview
<zn-icon size="32" style="color: var(--zn-color-primary);">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
  </svg>
</zn-icon>
```

### CSS Custom Properties

The icon component exposes CSS custom properties for advanced styling:

- `--icon-size`: Controls the icon dimensions (default: 24px)
- `--icon-color`: Controls the icon color (default: inherit)

```html:preview
<zn-icon src="settings" style="--icon-size: 48px; --icon-color: #ff5722;"></zn-icon>
<zn-icon src="home" style="--icon-size: 32px; --icon-color: #3f51b5;"></zn-icon>
```

### CSS Parts

The icon component exposes the `icon` part for styling the internal icon element:

```html:preview
<style>
  .custom-icon::part(icon) {
    filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
  }
</style>
<zn-icon class="custom-icon" src="star" size="48" color="warning"></zn-icon>
```

## Use Cases

### In Buttons

Icons are commonly used within buttons to provide visual context:

```html:preview
<zn-button icon="add">Add Item</zn-button>
<zn-button icon="delete" color="error">Delete</zn-button>
<zn-button icon="edit" color="info">Edit</zn-button>
```

### In Navigation

Use icons to enhance navigation items:

```html:preview
<zn-menu style="max-width: 200px;">
  <zn-menu-item>
    <zn-icon src="home" slot="prefix" size="20"></zn-icon>
    Home
  </zn-menu-item>
  <zn-menu-item>
    <zn-icon src="settings" slot="prefix" size="20"></zn-icon>
    Settings
  </zn-menu-item>
  <zn-menu-item>
    <zn-icon src="person" slot="prefix" size="20"></zn-icon>
    Profile
  </zn-menu-item>
</zn-menu>
```

### Status Indicators

Combine icons with colors to show status:

```html:preview
<div style="display: flex; gap: 1rem; align-items: center;">
  <div style="display: flex; align-items: center; gap: 0.5rem;">
    <zn-icon src="check_circle" color="success" size="20"></zn-icon>
    <span>Active</span>
  </div>
  <div style="display: flex; align-items: center; gap: 0.5rem;">
    <zn-icon src="error" color="error" size="20"></zn-icon>
    <span>Error</span>
  </div>
  <div style="display: flex; align-items: center; gap: 0.5rem;">
    <zn-icon src="warning" color="warning" size="20"></zn-icon>
    <span>Warning</span>
  </div>
  <div style="display: flex; align-items: center; gap: 0.5rem;">
    <zn-icon src="info" color="info" size="20"></zn-icon>
    <span>Info</span>
  </div>
</div>
```

### User Avatars in Lists

```html:preview
<div style="display: flex; flex-direction: column; gap: 1rem;">
  <div style="display: flex; align-items: center; gap: 0.75rem;">
    <zn-icon src="John Smith@avatar" size="40" round></zn-icon>
    <div>
      <div style="font-weight: 600;">John Smith</div>
      <div style="font-size: 0.875rem; color: #666;">john.smith@example.com</div>
    </div>
  </div>
  <div style="display: flex; align-items: center; gap: 0.75rem;">
    <zn-icon src="Sarah Connor@avatar" size="40" round></zn-icon>
    <div>
      <div style="font-weight: 600;">Sarah Connor</div>
      <div style="font-size: 0.875rem; color: #666;">sarah.connor@example.com</div>
    </div>
  </div>
  <div style="display: flex; align-items: center; gap: 0.75rem;">
    <zn-icon src="Mike Johnson@avatar" size="40" round></zn-icon>
    <div>
      <div style="font-weight: 600;">Mike Johnson</div>
      <div style="font-size: 0.875rem; color: #666;">mike.johnson@example.com</div>
    </div>
  </div>
</div>
```

## Material Icons Reference

Our icons are taken directly from Material Icons. Click or tap on any icon to copy its name, then you can use it in
your HTML like this:

<a href="https://fonts.google.com/icons?selected=Material+Symbols+Outlined" target="_blank">View Icons</a>

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