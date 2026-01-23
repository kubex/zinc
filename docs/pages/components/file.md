---
meta:
  title: File
  description: File controls allow users to select one or more files for upload through a button interface or drag-and-drop area.
layout: component
---

## Examples

### Basic File Upload with Label

Use the `label` attribute to give the file control an accessible label.

```html:preview
<zn-file label="Upload Document"></zn-file>
```

:::tip
This component works with standard `<form>` elements. Please refer to the section on [form controls](/getting-started/form-controls) to learn more about form submission and client-side validation.
:::

### Help Text

Add descriptive help text to a file control with the `help-text` attribute. For help text that contains HTML, use the `help-text` slot instead.

```html:preview
<zn-file label="Upload Resume" help-text="Accepted formats: PDF, DOC, DOCX (Max 5MB)"></zn-file>
<br />
<zn-file label="Upload Resume">
  <div slot="help-text">Accepted formats: <strong>PDF, DOC, DOCX</strong> (Max 5MB)</div>
</zn-file>
```

### Multiple Files

Use the `multiple` attribute to allow users to select more than one file at a time.

```html:preview
<zn-file label="Upload Photos" multiple></zn-file>
```

### Clearable Files

Add the `clearable` attribute to display a close button next to each selected file, allowing users to remove individual files from the selection.

```html:preview
<zn-file label="Upload Documents" multiple clearable></zn-file>
```

### Droparea Mode

Use the `droparea` attribute to render the file control as a large drag-and-drop area. This mode is ideal when file upload is a primary action on the page.

```html:preview
<zn-file label="Upload Files" droparea multiple></zn-file>
```

### Accepted File Types

Use the `accept` attribute to specify which file types are accepted. This controls which files appear in the file picker dialog and provides client-side validation.

```html:preview
<zn-file label="Upload Images" accept="image/*" multiple></zn-file>
<br />
<zn-file label="Upload Document" accept=".pdf,.doc,.docx"></zn-file>
<br />
<zn-file label="Upload Text File" accept="text/plain"></zn-file>
```

:::tip
The `accept` attribute takes a comma-separated list of:
- File extensions (e.g., `.pdf`, `.jpg`)
- MIME types (e.g., `image/png`, `application/pdf`)
- MIME type wildcards (e.g., `image/*`, `video/*`)

See [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept) for more details.
:::

### Droparea with Accepted Types

Combine `droparea` and `accept` for a prominent upload area with file type restrictions.

```html:preview
<zn-file label="Upload Images" accept="image/*" multiple droparea></zn-file>
```

### Custom Droparea Icon

Use the `droparea-icon` slot to customize the icon displayed in the droparea.

```html:preview
<zn-file label="Upload Photos" droparea multiple>
  <zn-icon src="photo_library" slot="droparea-icon"></zn-icon>
</zn-file>
```

### Directory Upload

Use the `webkitdirectory` attribute to allow users to select entire directories instead of individual files. When a directory is selected, all files within it and its subdirectories are included.

```html:preview
<zn-file label="Upload Folder" webkitdirectory></zn-file>
```

:::warning
**Note:** The `webkitdirectory` attribute is non-standard but is supported in all major browsers. When this attribute is set, the `multiple` property is automatically enabled.
:::

### Directory Droparea

Combine `webkitdirectory` with `droparea` for a drag-and-drop folder upload interface.

```html:preview
<zn-file label="Upload Project Folder" webkitdirectory droparea></zn-file>
```

### Camera Capture

Use the `capture` attribute to prompt users to use their device's camera or microphone. This only works on mobile devices and requires the `accept` attribute to specify the media type.

```html:preview
<zn-file label="Take Photo" accept="image/*" capture="environment"></zn-file>
<br />
<zn-file label="Take Selfie" accept="image/*" capture="user"></zn-file>
```

:::warning
**Note:** The `capture` attribute only works on mobile devices with cameras and does not work with the `droparea` mode. The `environment` value activates the rear camera, while `user` activates the front-facing camera.
:::

### Hide Value

Use the `hide-value` attribute to suppress the display of selected file names. This is useful when you want to handle file display in a custom way or when working with the trigger slot.

```html:preview
<zn-file label="Upload File" hide-value></zn-file>
```

### Disabled

Use the `disabled` attribute to disable the file control.

```html:preview
<zn-file label="Upload Document" disabled></zn-file>
<br />
<zn-file label="Upload Files" droparea disabled></zn-file>
```

### Sizes

Use the `size` attribute to change the file control's size. Size `medium` is the default.

```html:preview
<zn-file label="Small Upload" size="small"></zn-file>
<br />
<zn-file label="Medium Upload" size="medium"></zn-file>
<br />
<zn-file label="Large Upload" size="large"></zn-file>
```

### Required

Use the `required` attribute to make the file control mandatory. The form will not submit unless at least one file is selected.

```html:preview
<form class="file-required-form">
  <zn-file name="document" label="Upload Required Document" required></zn-file>
  <br />
  <zn-button type="submit" variant="primary">Submit</zn-button>
</form>

<script type="module">
  const form = document.querySelector('.file-required-form');

  await Promise.all([
    customElements.whenDefined('zn-button'),
    customElements.whenDefined('zn-file')
  ]).then(() => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      alert('Form submitted with files!');
    });
  });
</script>
```

### Custom Trigger

Use the `trigger` slot to provide completely custom content for the file control. The trigger will automatically handle click events to open the file picker and drag-and-drop functionality.

```html:preview
<zn-file name="custom-upload" multiple>
  <div slot="trigger" style="padding: 2rem; border: 2px dashed var(--zn-color-neutral-300); border-radius: var(--zn-border-radius-medium); text-align: center; cursor: pointer;">
    <zn-icon src="cloud_upload" style="font-size: 3rem; color: var(--zn-color-primary-600);"></zn-icon>
    <p style="margin: 0.5rem 0 0; font-weight: var(--zn-font-weight-semibold);">Click to upload or drag and drop</p>
    <p style="margin: 0.25rem 0 0; font-size: var(--zn-font-size-small); color: var(--zn-color-neutral-600);">SVG, PNG, JPG or GIF (max. 800x400px)</p>
  </div>
</zn-file>
```

:::warning
**Note:** When using the `trigger` slot, the following attributes will not work: `label`, `droparea`, `help-text`, `size`, and `hide-value`. You must handle styling for the disabled state yourself if using the `disabled` attribute.
:::

### Handling File Events

Listen to `zn-change` and `zn-input` events to respond when users select files. Access the selected files through the `files` property.

```html:preview
<zn-file class="file-events" label="Upload Files" multiple></zn-file>
<div class="file-event-output"></div>

<script type="module">
  const fileInput = document.querySelector('.file-events');
  const output = document.querySelector('.file-event-output');

  await customElements.whenDefined('zn-file');

  fileInput.addEventListener('zn-change', (e) => {
    const files = fileInput.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files).map(f => `${f.name} (${(f.size / 1024).toFixed(2)} KB)`).join('<br>');
      output.innerHTML = `<strong>Selected files:</strong><br>${fileList}`;
    } else {
      output.innerHTML = '';
    }
  });
</script>
```

### Error Handling

The file control emits a `zn-error` event when multiple files are dropped without the `multiple` attribute being set.

```html:preview
<zn-file class="file-error" label="Upload Single File" droparea></zn-file>
<div class="error-output" style="color: var(--zn-color-danger-600); margin-top: 0.5rem;"></div>

<script type="module">
  const fileInput = document.querySelector('.file-error');
  const errorOutput = document.querySelector('.error-output');

  await customElements.whenDefined('zn-file');

  fileInput.addEventListener('zn-error', () => {
    errorOutput.textContent = 'Error: Only one file can be uploaded at a time.';
    setTimeout(() => {
      errorOutput.textContent = '';
    }, 3000);
  });

  fileInput.addEventListener('zn-change', () => {
    errorOutput.textContent = '';
  });
</script>
```

### Working with FileList

The `files` property returns a `FileList` object containing `File` objects. You can access file information such as name, size, type, and last modified date.

```html:preview
<zn-file class="file-info" label="Upload Files" multiple clearable></zn-file>
<div class="file-info-output"></div>

<script type="module">
  const fileInput = document.querySelector('.file-info');
  const output = document.querySelector('.file-info-output');

  await customElements.whenDefined('zn-file');

  fileInput.addEventListener('zn-change', () => {
    const files = fileInput.files;
    if (files && files.length > 0) {
      let html = '<table style="width: 100%; border-collapse: collapse; margin-top: 1rem;"><thead><tr style="text-align: left; border-bottom: 1px solid var(--zn-color-neutral-200);"><th>Name</th><th>Size</th><th>Type</th></tr></thead><tbody>';

      Array.from(files).forEach(file => {
        const sizeKB = (file.size / 1024).toFixed(2);
        html += `<tr style="border-bottom: 1px solid var(--zn-color-neutral-100);"><td style="padding: 0.5rem 0;">${file.name}</td><td>${sizeKB} KB</td><td>${file.type || 'unknown'}</td></tr>`;
      });

      html += '</tbody></table>';
      output.innerHTML = html;
    } else {
      output.innerHTML = '';
    }
  });
</script>
```

### Form Integration

File controls work seamlessly with forms. The selected files are submitted as part of the form data when using `FormData`.

```html:preview
<form class="file-form" enctype="multipart/form-data">
  <zn-input name="name" label="Your Name" required></zn-input>
  <br />
  <zn-file name="documents" label="Upload Documents" multiple clearable></zn-file>
  <br />
  <zn-button type="submit" variant="primary">Submit Form</zn-button>
  <zn-button type="reset">Reset</zn-button>
</form>
<div class="form-output"></div>

<script type="module">
  const form = document.querySelector('.file-form');
  const output = document.querySelector('.form-output');

  await Promise.all([
    customElements.whenDefined('zn-button'),
    customElements.whenDefined('zn-file'),
    customElements.whenDefined('zn-input')
  ]).then(() => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      let info = `<strong>Form Data:</strong><br>Name: ${formData.get('name')}<br>`;
      const files = formData.getAll('documents');
      if (files.length > 0) {
        info += `<strong>Files (${files.length}):</strong><br>`;
        files.forEach(file => {
          info += `- ${file.name} (${(file.size / 1024).toFixed(2)} KB)<br>`;
        });
      }

      output.innerHTML = info;
    });

    form.addEventListener('reset', () => {
      output.innerHTML = '';
    });
  });
</script>
```

### Programmatic File Access

You can programmatically access and manipulate the file control's value and files.

```html:preview
<zn-file class="file-programmatic" label="Upload Files" multiple></zn-file>
<br />
<zn-button class="get-files-btn">Get File Names</zn-button>
<zn-button class="clear-files-btn">Clear Files</zn-button>
<div class="programmatic-output"></div>

<script type="module">
  const fileInput = document.querySelector('.file-programmatic');
  const getFilesBtn = document.querySelector('.get-files-btn');
  const clearFilesBtn = document.querySelector('.clear-files-btn');
  const output = document.querySelector('.programmatic-output');

  await Promise.all([
    customElements.whenDefined('zn-button'),
    customElements.whenDefined('zn-file')
  ]).then(() => {
    getFilesBtn.addEventListener('click', () => {
      const files = fileInput.files;
      if (files && files.length > 0) {
        const fileNames = Array.from(files).map(f => f.name).join(', ');
        output.innerHTML = `<strong>Selected files:</strong> ${fileNames}`;
      } else {
        output.innerHTML = 'No files selected';
      }
    });

    clearFilesBtn.addEventListener('click', () => {
      fileInput.value = '';
      output.innerHTML = 'Files cleared';
    });
  });
</script>
```

:::warning
**Note:** For security reasons, you can only set the `value` property to an empty string. You cannot programmatically set files. Users must select files through the file picker or drag-and-drop interface.
:::

### Validation

The file control supports standard HTML5 form validation. Use the `required` attribute to make file selection mandatory.

```html:preview
<form class="file-validation-form">
  <zn-file name="avatar" label="Profile Picture" accept="image/*" required></zn-file>
  <br />
  <zn-button type="submit" variant="primary">Upload</zn-button>
</form>

<script type="module">
  const form = document.querySelector('.file-validation-form');

  await Promise.all([
    customElements.whenDefined('zn-button'),
    customElements.whenDefined('zn-file')
  ]).then(() => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('File uploaded successfully!');
    });
  });
</script>
```

### Custom Validation

You can set custom validation messages using the `setCustomValidity()` method.

```html:preview
<form class="custom-validation-form">
  <zn-file class="custom-validation" name="document" label="Upload PDF (max 2MB)" accept=".pdf"></zn-file>
  <br />
  <zn-button type="submit" variant="primary">Submit</zn-button>
</form>
<div class="custom-validation-output"></div>

<script type="module">
  const form = document.querySelector('.custom-validation-form');
  const fileInput = document.querySelector('.custom-validation');
  const output = document.querySelector('.custom-validation-output');

  await Promise.all([
    customElements.whenDefined('zn-button'),
    customElements.whenDefined('zn-file')
  ]).then(() => {
    fileInput.addEventListener('zn-change', () => {
      const files = fileInput.files;
      if (files && files.length > 0) {
        const file = files[0];
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (file.size > maxSize) {
          fileInput.setCustomValidity('File size must not exceed 2MB');
          output.innerHTML = `<span style="color: var(--zn-color-danger-600);">File too large: ${(file.size / 1024 / 1024).toFixed(2)} MB (max 2MB)</span>`;
        } else {
          fileInput.setCustomValidity('');
          output.innerHTML = `<span style="color: var(--zn-color-success-600);">File size: ${(file.size / 1024).toFixed(2)} KB - Valid!</span>`;
        }
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (form.checkValidity()) {
        alert('Form submitted!');
      }
    });
  });
</script>
```

