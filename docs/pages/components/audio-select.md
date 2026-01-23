---
meta:
  title: Audio Select
  description: Audio select allows you to choose audio files from a menu with built-in preview playback functionality.
layout: component
status: experimental
---

## Examples

### Basic Audio Select

The audio select component combines a standard select dropdown with an integrated audio preview player. Use the `label` attribute to give the select an accessible label, provide an array of audio files via the `files` property, and control the selected value with the `value` attribute.

```html:preview
<zn-audio-select
  id="basic-audio-select"
  label="Select an audio file"
  placeholder="Choose a sound"
>
</zn-audio-select>

<script type="module">
  const audioSelect = document.getElementById('basic-audio-select');

  audioSelect.files = [
    { name: 'Notification Sound', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8e8c5a3.mp3' },
    { name: 'Alert Tone', url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3' },
    { name: 'Chime', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_24f0b90e18.mp3' }
  ];
</script>
```

:::tip
The play/pause button in the prefix slot allows users to preview the selected audio file before confirming their choice. The audio automatically stops when a new selection is made or when the component is disconnected.
:::

### Initial Value

Use the `value` attribute to set an initial selection. The value should match one of the URLs in your files array.

```html:preview
<zn-audio-select
  id="initial-value-audio"
  label="Select notification sound"
  placeholder="Choose a sound"
>
</zn-audio-select>

<script type="module">
  const audioSelect = document.getElementById('initial-value-audio');

  audioSelect.files = [
    { name: 'Notification Sound', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8e8c5a3.mp3' },
    { name: 'Alert Tone', url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3' },
    { name: 'Chime', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_24f0b90e18.mp3' }
  ];

  // Set initial value
  audioSelect.value = 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3';
</script>
```

### Custom Placeholder

Customize the placeholder text shown when no audio file is selected using the `placeholder` attribute.

```html:preview
<zn-audio-select
  id="custom-placeholder-audio"
  label="Ringtone"
  placeholder="Pick your ringtone"
>
</zn-audio-select>

<script type="module">
  const audioSelect = document.getElementById('custom-placeholder-audio');

  audioSelect.files = [
    { name: 'Classic Ring', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8e8c5a3.mp3' },
    { name: 'Modern Tone', url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3' },
    { name: 'Gentle Chime', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_24f0b90e18.mp3' }
  ];
</script>
```

### Interactive Preview Controls

The audio select includes an integrated play/pause checkbox in the prefix slot. Click the play button to preview the currently selected audio. The button automatically changes to a pause icon while audio is playing.

```html:preview
<zn-audio-select
  id="preview-demo-audio"
  label="Test audio playback"
  placeholder="Select to preview"
>
</zn-audio-select>

<div style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-100); border-radius: 4px;">
  <strong>Instructions:</strong>
  <ol style="margin: 0.5rem 0 0 1.5rem; padding: 0;">
    <li>Select an audio file from the dropdown</li>
    <li>Click the play button (arrow icon) to start playback</li>
    <li>Click the pause button to stop playback</li>
    <li>Select a different file to automatically stop current playback</li>
  </ol>
</div>

<script type="module">
  const audioSelect = document.getElementById('preview-demo-audio');

  audioSelect.files = [
    { name: 'Short Beep', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8e8c5a3.mp3' },
    { name: 'Notification Ping', url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3' },
    { name: 'Alert Sound', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_24f0b90e18.mp3' }
  ];
</script>
```

:::tip
Audio playback is prevented when no file is selected. The play/pause button becomes functional only after selecting an audio file from the dropdown.
:::

### Listening for Changes

The audio select emits a `zn-change` event when the selection changes. Access the selected URL through the `value` property.

```html:preview
<zn-audio-select
  id="event-audio-select"
  label="Select your notification"
  placeholder="Choose one"
>
</zn-audio-select>

<div style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-100); border-radius: 4px;">
  <strong>Selection:</strong>
  <div id="audio-selection-log" style="margin-top: 0.5rem; font-family: monospace; font-size: 0.875rem;">
    No selection yet
  </div>
</div>

<script type="module">
  const audioSelect = document.getElementById('event-audio-select');
  const selectionLog = document.getElementById('audio-selection-log');

  audioSelect.files = [
    { name: 'Notification 1', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8e8c5a3.mp3' },
    { name: 'Notification 2', url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3' },
    { name: 'Notification 3', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_24f0b90e18.mp3' }
  ];

  audioSelect.addEventListener('zn-change', (e) => {
    const selectedFile = audioSelect.files.find(f => f.url === e.target.value);
    if (selectedFile) {
      selectionLog.textContent = `Selected: ${selectedFile.name}\nURL: ${selectedFile.url}`;
    } else {
      selectionLog.textContent = 'No selection';
    }
  });
</script>
```

### Programmatic Control

Control the audio select programmatically by setting the `value` property or manipulating the `files` array.

```html:preview
<zn-audio-select
  id="programmatic-audio"
  label="Programmable audio select"
  placeholder="Select a sound"
>
</zn-audio-select>

<div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
  <zn-button id="select-first" size="small">Select First</zn-button>
  <zn-button id="select-second" size="small">Select Second</zn-button>
  <zn-button id="clear-selection" size="small">Clear</zn-button>
  <zn-button id="add-file" size="small">Add File</zn-button>
</div>

<script type="module">
  const audioSelect = document.getElementById('programmatic-audio');

  const initialFiles = [
    { name: 'Sound A', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8e8c5a3.mp3' },
    { name: 'Sound B', url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3' }
  ];

  audioSelect.files = [...initialFiles];

  document.getElementById('select-first').addEventListener('click', () => {
    audioSelect.value = audioSelect.files[0]?.url || '';
  });

  document.getElementById('select-second').addEventListener('click', () => {
    audioSelect.value = audioSelect.files[1]?.url || '';
  });

  document.getElementById('clear-selection').addEventListener('click', () => {
    audioSelect.value = '';
  });

  document.getElementById('add-file').addEventListener('click', () => {
    const newFile = {
      name: `Sound ${audioSelect.files.length + 1}`,
      url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_24f0b90e18.mp3'
    };
    audioSelect.files = [...audioSelect.files, newFile];
  });
</script>
```

### Dynamic File Lists

Update the available audio files dynamically by setting the `files` property. This is useful for loading files from an API or updating based on user actions.

```html:preview
<div class="form-spacing">
  <zn-select id="category-selector" label="Audio category">
    <zn-option value="">Select a category</zn-option>
    <zn-option value="notifications">Notifications</zn-option>
    <zn-option value="alarms">Alarms</zn-option>
    <zn-option value="ringtones">Ringtones</zn-option>
  </zn-select>

  <zn-audio-select
    id="dynamic-audio-select"
    label="Available sounds"
    placeholder="First select a category"
  >
  </zn-audio-select>
</div>

<script type="module">
  const categorySelector = document.getElementById('category-selector');
  const audioSelect = document.getElementById('dynamic-audio-select');

  const audioCategories = {
    notifications: [
      { name: 'Gentle Ping', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8e8c5a3.mp3' },
      { name: 'Quick Beep', url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3' }
    ],
    alarms: [
      { name: 'Wake Up Call', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_24f0b90e18.mp3' },
      { name: 'Morning Alert', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8e8c5a3.mp3' }
    ],
    ringtones: [
      { name: 'Classic Ring', url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3' },
      { name: 'Modern Tone', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_24f0b90e18.mp3' }
    ]
  };

  categorySelector.addEventListener('zn-change', (e) => {
    const category = e.target.value;
    if (category && audioCategories[category]) {
      audioSelect.files = audioCategories[category];
      audioSelect.value = '';
      audioSelect.placeholder = 'Select a sound';
    } else {
      audioSelect.files = [];
      audioSelect.value = '';
      audioSelect.placeholder = 'First select a category';
    }
  });
</script>
```

### Form Integration

The audio select component works with standard HTML forms. The selected audio URL is submitted as the form value.

```html:preview
<form id="audio-form">
  <zn-audio-select
    id="form-audio-select"
    name="notificationSound"
    label="Notification sound"
    placeholder="Choose your notification"
  >
  </zn-audio-select>
  <br />
  <zn-button type="submit" variant="primary">Submit</zn-button>
  <zn-button type="reset">Reset</zn-button>
</form>

<script type="module">
  const form = document.getElementById('audio-form');
  const audioSelect = document.getElementById('form-audio-select');

  audioSelect.files = [
    { name: 'Chime', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8e8c5a3.mp3' },
    { name: 'Bell', url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3' },
    { name: 'Ding', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_24f0b90e18.mp3' }
  ];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    alert('Form submitted!\n\n' + JSON.stringify(data, null, 2));
  });

  form.addEventListener('reset', () => {
    audioSelect.value = '';
  });
</script>
```

### Real-world Example: Audio Settings Panel

A complete example showing how to use the audio select in a settings interface for configuring notification sounds.

```html:preview
<div style="max-width: 600px; padding: 1.5rem; background: var(--zn-color-neutral-50); border-radius: 8px; border: 1px solid var(--zn-color-neutral-200);">
  <h3 style="margin-top: 0;">Audio Notification Settings</h3>

  <form id="notification-settings-form" class="form-spacing">
    <zn-checkbox id="enable-notifications" checked>
      Enable audio notifications
    </zn-checkbox>

    <zn-audio-select
      id="new-message-sound"
      name="newMessageSound"
      label="New message"
      placeholder="Select a sound"
    >
    </zn-audio-select>

    <zn-audio-select
      id="mention-sound"
      name="mentionSound"
      label="@mention"
      placeholder="Select a sound"
    >
    </zn-audio-select>

    <zn-audio-select
      id="call-sound"
      name="callSound"
      label="Incoming call"
      placeholder="Select a sound"
    >
    </zn-audio-select>

    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
      <zn-button type="submit" variant="primary">Save Settings</zn-button>
      <zn-button type="reset">Reset</zn-button>
    </div>
  </form>
</div>

<script type="module">
  const form = document.getElementById('notification-settings-form');
  const enableNotifications = document.getElementById('enable-notifications');
  const newMessageSound = document.getElementById('new-message-sound');
  const mentionSound = document.getElementById('mention-sound');
  const callSound = document.getElementById('call-sound');

  // Sample audio files
  const audioFiles = [
    { name: 'Gentle Ping', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8e8c5a3.mp3' },
    { name: 'Quick Beep', url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3' },
    { name: 'Soft Chime', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_24f0b90e18.mp3' }
  ];

  // Set audio files for all selects
  [newMessageSound, mentionSound, callSound].forEach(select => {
    select.files = audioFiles;
  });

  // Enable/disable audio selects based on checkbox
  function updateAudioSelectsState() {
    const enabled = enableNotifications.checked;
    [newMessageSound, mentionSound, callSound].forEach(select => {
      select.style.opacity = enabled ? '1' : '0.5';
      select.style.pointerEvents = enabled ? 'auto' : 'none';
    });
  }

  enableNotifications.addEventListener('zn-change', updateAudioSelectsState);
  updateAudioSelectsState();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!enableNotifications.checked) {
      alert('Audio notifications are disabled');
      return;
    }
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    alert('Settings saved!\n\n' + JSON.stringify(data, null, 2));
  });
</script>
```

## Properties

| Property | Attribute | Description | Type | Default |
|----------|-----------|-------------|------|---------|
| `value` | `value` | The currently selected audio file URL. When set, the audio player loads this URL for preview. | `string` | `''` |
| `label` | `label` | The label text displayed above the select control. For labels containing HTML, use the `label` slot instead. | `string` | `''` |
| `placeholder` | `placeholder` | Placeholder text shown in the dropdown when no audio file is selected. | `string` | `''` |
| `files` | `files` | Array of audio files available for selection. Each file object must have `name` (display text) and `url` (audio file URL) properties. | `AudioFile[]` | `[]` |

### AudioFile Interface

```typescript
interface AudioFile {
  name: string;  // Display name shown in the dropdown
  url: string;   // URL to the audio file
}
```

## Events

| Event | Description | Event Detail |
|-------|-------------|--------------|
| `zn-change` | Emitted when the selected audio file changes. The event is triggered by the underlying `zn-select` component and bubbles up. Access the new value via `event.target.value`. | Inherited from `zn-select` |
| `zn-input` | Emitted when the select receives input. Inherited from the underlying `zn-select` component. | Inherited from `zn-select` |
| `zn-focus` | Emitted when the select gains focus. | Inherited from `zn-select` |
| `zn-blur` | Emitted when the select loses focus. | Inherited from `zn-select` |

:::tip
The audio select inherits all events from the `zn-select` component. Refer to the [select documentation](/components/select#events) for complete event details.
:::

## Slots

| Name | Description |
|------|-------------|
| (default) | The default slot is not used in the audio select component. Options are generated automatically from the `files` property. |
| `actions` | Optional slot for action buttons or controls. Inherited from `zn-select`. |
| `footer` | Optional slot for footer content. Inherited from `zn-select`. |

:::warning
**Note:** Unlike the standard `zn-select`, the audio select component auto-generates its options from the `files` property. Manual `zn-option` elements in the default slot will be overwritten.
:::

## CSS Parts

| Part | Description |
|------|-------------|
| `base` | The component's base wrapper element. |

:::tip
The audio select wraps a `zn-select` component internally, so all CSS parts from `zn-select` are also available. See the [select component CSS parts](/components/select#css-parts) for additional customization options.
:::

## CSS Custom Properties

| Name | Description |
|------|-------------|
| `--example` | An example CSS custom property (inherited from base component). |

:::tip
The audio select inherits custom properties from the underlying `zn-select` component. See the [select documentation](/components/select) for available custom properties.
:::

## Methods

The audio select component provides these methods:

| Method | Description | Arguments | Returns |
|--------|-------------|-----------|---------|
| `stopAudio()` | Stops any currently playing audio, resets playback to the beginning, and updates the play/pause button state. | None | `void` |

:::tip
Additional methods are available through the underlying `zn-select` component. Use standard DOM methods like `querySelector()` to access the internal select and call its methods (e.g., `focus()`, `blur()`, `show()`, `hide()`).
:::

## Behavior Details

### Audio Playback

- The audio preview player is implemented using the HTML5 `Audio` API
- Clicking play loads and plays the currently selected audio file
- Audio automatically stops when:
  - The user clicks the pause button
  - A different audio file is selected
  - The component is disconnected from the DOM
- If audio playback fails (e.g., invalid URL, network error), an error is logged to the console and the button returns to the play state
- Attempting to play without selecting a file is prevented

### Selection Behavior

- The component automatically creates a disabled placeholder option from the `placeholder` property
- Each file in the `files` array generates a corresponding `zn-option` element
- When `value` changes, any playing audio is automatically stopped and the new audio URL is loaded
- The internal `zn-select` handles all dropdown behavior, keyboard navigation, and accessibility features

### Play/Pause Button

- Implemented as a `zn-checkbox` in the prefix slot
- Shows a play icon (arrow) when audio is not playing
- Shows a pause icon when audio is playing
- Uses primary color when checked (playing) and secondary color when unchecked (stopped)
- Button state is synchronized with audio playback state

## Accessibility

The audio select component inherits all accessibility features from the underlying `zn-select` component:

- Proper ARIA labels and roles for screen readers
- Full keyboard navigation support
- Focus management
- High contrast mode support

The play/pause checkbox should include an `aria-label` for screen reader users (this is implemented by default in the component).

## Best Practices

1. **File URLs**: Ensure all audio file URLs are accessible and use HTTPS for security
2. **File Formats**: Use widely supported audio formats (MP3, OGG, WAV) for maximum browser compatibility
3. **File Names**: Provide clear, descriptive names in the `name` property for better user experience
4. **File Size**: Keep audio files small for quick preview loading (notification sounds should typically be under 5 seconds)
5. **Error Handling**: Audio playback errors are logged to the console but not shown to users; consider adding custom error handling for production use
6. **Performance**: The component stops audio when disconnected, preventing memory leaks
7. **Accessibility**: Always provide a meaningful `label` attribute for screen reader users

## Browser Compatibility

The audio select component requires:
- Modern browser with Web Components support
- HTML5 Audio API support
- All browsers supported by the base Zinc component library

## Related Components

- [Select](/components/select) - The underlying select component
- [Checkbox](/components/checkbox) - Used for the play/pause button
- [Option](/components/option) - Used for dropdown options
