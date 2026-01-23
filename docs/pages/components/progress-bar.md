---
meta:
  title: Progress Bar
  description: Progress bars provide visual feedback about the completion status of a task or process.
layout: component
---

```html:preview
<zn-progress-bar value="50"></zn-progress-bar>
```

## Examples

### Basic Progress Bar

A basic progress bar displays the completion percentage using the `value` attribute. The value should be a number between 0 and 100.

```html:preview
<zn-progress-bar value="25"></zn-progress-bar>
<br />
<zn-progress-bar value="50"></zn-progress-bar>
<br />
<zn-progress-bar value="75"></zn-progress-bar>
<br />
<zn-progress-bar value="100"></zn-progress-bar>
```

### With Caption

Use the `caption` attribute to add a label above the progress bar. This helps identify what the progress bar represents.

```html:preview
<zn-progress-bar caption="Upload Progress" value="45"></zn-progress-bar>
<br />
<zn-progress-bar caption="Installation" value="70"></zn-progress-bar>
<br />
<zn-progress-bar caption="Download Complete" value="100"></zn-progress-bar>
```

### Showing Progress Percentage

Use the `show-progress` attribute to display the numerical percentage value next to the caption.

```html:preview
<zn-progress-bar caption="File Transfer" value="35" show-progress></zn-progress-bar>
<br />
<zn-progress-bar caption="Processing Data" value="62" show-progress></zn-progress-bar>
<br />
<zn-progress-bar caption="Backup Complete" value="100" show-progress></zn-progress-bar>
```

### Progress Only (No Caption)

You can show the progress percentage without a caption by using `show-progress` without the `caption` attribute.

```html:preview
<zn-progress-bar value="40" show-progress></zn-progress-bar>
```

### With Description

Use the `description` attribute to add helpful information or context below the progress bar.

```html:preview
<zn-progress-bar
  caption="Uploading files"
  value="55"
  show-progress
  description="3 of 10 files uploaded">
</zn-progress-bar>
<br />
<zn-progress-bar
  caption="Processing"
  value="30"
  description="Estimated time remaining: 2 minutes">
</zn-progress-bar>
```

### Complete Progress States

Examples showing different stages of task completion with captions, progress percentages, and descriptions.

```html:preview
<zn-progress-bar
  caption="Starting"
  value="0"
  show-progress
  description="Initializing...">
</zn-progress-bar>
<br />
<zn-progress-bar
  caption="In Progress"
  value="45"
  show-progress
  description="Processing 45 of 100 items">
</zn-progress-bar>
<br />
<zn-progress-bar
  caption="Almost Done"
  value="95"
  show-progress
  description="Finalizing...">
</zn-progress-bar>
<br />
<zn-progress-bar
  caption="Complete"
  value="100"
  show-progress
  description="All tasks finished successfully">
</zn-progress-bar>
```

### Dynamic Progress Updates

Progress bars can be updated dynamically using JavaScript to reflect real-time progress.

```html:preview
<zn-progress-bar
  id="dynamic-progress"
  caption="Dynamic Update"
  value="0"
  show-progress
  description="Click the button to start">
</zn-progress-bar>
<br />
<zn-button id="start-progress">Start Progress</zn-button>
<zn-button id="reset-progress" color="secondary">Reset</zn-button>

<script type="module">
  const progressBar = document.getElementById('dynamic-progress');
  const startBtn = document.getElementById('start-progress');
  const resetBtn = document.getElementById('reset-progress');
  let interval;

  startBtn.addEventListener('click', () => {
    progressBar.value = 0;
    progressBar.description = 'Processing...';
    startBtn.disabled = true;

    interval = setInterval(() => {
      if (progressBar.value < 100) {
        progressBar.value = progressBar.value + 1;
        progressBar.description = `Processing ${progressBar.value} of 100 items`;
      } else {
        clearInterval(interval);
        progressBar.description = 'Complete!';
        startBtn.disabled = false;
      }
    }, 50);
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(interval);
    progressBar.value = 0;
    progressBar.description = 'Click the button to start';
    startBtn.disabled = false;
  });
</script>
```

### File Upload Simulation

A practical example simulating a file upload process with dynamic updates.

```html:preview
<zn-progress-bar
  id="upload-progress"
  caption="Uploading document.pdf"
  value="0"
  show-progress
  description="Preparing upload...">
</zn-progress-bar>
<br />
<zn-button id="simulate-upload" icon="cloud_upload">Upload File</zn-button>

<script type="module">
  const uploadProgress = document.getElementById('upload-progress');
  const uploadBtn = document.getElementById('simulate-upload');

  uploadBtn.addEventListener('click', () => {
    uploadProgress.value = 0;
    uploadBtn.disabled = true;
    uploadBtn.loading = true;

    let uploadSpeed = 2; // Percentage per interval
    const interval = setInterval(() => {
      if (uploadProgress.value < 100) {
        uploadProgress.value = Math.min(uploadProgress.value + uploadSpeed, 100);

        // Calculate approximate KB uploaded (simulate 5MB file)
        const totalKB = 5120;
        const uploadedKB = Math.floor((uploadProgress.value / 100) * totalKB);
        uploadProgress.description = `Uploaded ${uploadedKB} KB of ${totalKB} KB`;

        // Slow down near the end (realistic upload behavior)
        if (uploadProgress.value > 90) {
          uploadSpeed = 0.5;
        }
      } else {
        clearInterval(interval);
        uploadProgress.caption = 'Upload Complete';
        uploadProgress.description = 'File uploaded successfully';
        uploadBtn.loading = false;
        uploadBtn.disabled = false;
      }
    }, 100);
  });
</script>
```

### Multiple Progress Bars

Display multiple progress bars to track different concurrent tasks or processes.

```html:preview
<zn-progress-bar
  caption="Frontend Build"
  value="100"
  show-progress
  description="Completed">
</zn-progress-bar>
<br />
<zn-progress-bar
  caption="Backend Build"
  value="85"
  show-progress
  description="Compiling...">
</zn-progress-bar>
<br />
<zn-progress-bar
  caption="Running Tests"
  value="60"
  show-progress
  description="156 of 260 tests passed">
</zn-progress-bar>
<br />
<zn-progress-bar
  caption="Deployment"
  value="0"
  show-progress
  description="Waiting for builds to complete">
</zn-progress-bar>
```

### Minimal Progress Bar

A clean, minimal progress bar without any text, useful for compact layouts or when context is provided elsewhere.

```html:preview
<zn-progress-bar value="33"></zn-progress-bar>
<br />
<zn-progress-bar value="66"></zn-progress-bar>
<br />
<zn-progress-bar value="99"></zn-progress-bar>
```

## Customization

### Styling with CSS Parts

Use [CSS parts](#css-parts) to customize the appearance of the progress bar. The component exposes several parts that can be styled.

```html:preview
<zn-progress-bar
  class="custom-progress"
  caption="Custom Styled Progress"
  value="75"
  show-progress
  description="Customized with CSS parts">
</zn-progress-bar>

<style>
  .custom-progress::part(fill) {
    fill: rgb(255, 107, 53);
  }

  .custom-progress::part(track) {
    fill: rgba(255, 107, 53, 0.2);
  }

  .custom-progress::part(caption) {
    color: rgb(255, 107, 53);
    font-weight: 600;
    font-size: 14px;
  }

  .custom-progress::part(progress) {
    color: rgb(255, 107, 53);
    font-weight: 600;
  }
</style>
```

### Custom Height

Adjust the height of the progress bar using CSS custom properties and parts.

```html:preview
<zn-progress-bar
  class="tall-progress"
  caption="Tall Progress Bar"
  value="60"
  show-progress>
</zn-progress-bar>

<style>
  .tall-progress::part(bar) {
    height: 16px;
  }

  .tall-progress::part(track),
  .tall-progress::part(fill) {
    rx: 8px;
  }
</style>
```

### Themed Progress Bars

Create themed progress bars for different use cases like success, warning, or error states.

```html:preview
<zn-progress-bar
  class="success-progress"
  caption="Success"
  value="100"
  show-progress
  description="Operation completed successfully">
</zn-progress-bar>
<br />
<zn-progress-bar
  class="warning-progress"
  caption="Warning"
  value="65"
  show-progress
  description="Approaching storage limit">
</zn-progress-bar>
<br />
<zn-progress-bar
  class="error-progress"
  caption="Error"
  value="30"
  show-progress
  description="Upload failed, retrying...">
</zn-progress-bar>

<style>
  .success-progress::part(fill) {
    fill: rgb(var(--zn-success));
  }
  .success-progress::part(track) {
    fill: rgba(var(--zn-success), 0.2);
  }

  .warning-progress::part(fill) {
    fill: rgb(var(--zn-warning));
  }
  .warning-progress::part(track) {
    fill: rgba(var(--zn-warning), 0.2);
  }

  .error-progress::part(fill) {
    fill: rgb(var(--zn-error));
  }
  .error-progress::part(track) {
    fill: rgba(var(--zn-error), 0.2);
  }
</style>
```

### Animated Progress

Add smooth animations to the progress bar fill using CSS transitions.

```html:preview
<zn-progress-bar
  id="animated-progress"
  class="animated-progress"
  caption="Animated Progress"
  value="20"
  show-progress
  description="Watch the smooth animation">
</zn-progress-bar>
<br />
<zn-button id="increase-animated">Increase Progress</zn-button>

<style>
  .animated-progress::part(fill) {
    transition: width 0.5s ease-in-out;
  }
</style>

<script type="module">
  const animatedProgress = document.getElementById('animated-progress');
  const increaseBtn = document.getElementById('increase-animated');

  increaseBtn.addEventListener('click', () => {
    const newValue = Math.min(animatedProgress.value + 20, 100);
    animatedProgress.value = newValue;
    animatedProgress.description = newValue === 100 ? 'Complete!' : 'Watch the smooth animation';
  });
</script>
```
