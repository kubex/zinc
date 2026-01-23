---
meta:
  title: Note
  description: Notes are used to display important information with optional captions, dates, and expandable content.
layout: component
---

```html:preview
<zn-note color="gray">
  <span slot="caption">Meeting Summary</span>
  <span slot="date">11/10/24</span>
  This is a basic note with a caption, date, and content.
</zn-note>
```

## Examples

### Basic Note

A basic note with a caption and content.

```html:preview
<zn-note caption="Important Reminder">
  Don't forget to review the documentation before the meeting.
</zn-note>
```

### With Date

Add a date to your note using the `date` attribute or the `date` slot.

```html:preview
<zn-note caption="Project Update" date="01/23/26">
  The project has been successfully deployed to production.
</zn-note>
```

### Using Slots

Notes support multiple slots for flexible content organization.

```html:preview
<zn-note color="blue">
  <span slot="caption">Design Review</span>
  <span slot="date">
    <small>01/15/26</small>
  </span>
  The design system updates have been approved by the team. We'll begin implementation next week.
</zn-note>
```

### Colors

Use the `color` attribute to change the visual appearance of the note. Available colors are: `red`, `blue`, `orange`, `yellow`, `indigo`, `violet`, `green`, `pink`, and `gray`.

```html:preview
<zn-note caption="Red Note" date="01/20/26" color="red">This is a red note for important information.</zn-note>
<br />
<zn-note caption="Blue Note" date="01/20/26" color="blue">This is a blue note for informational content.</zn-note>
<br />
<zn-note caption="Orange Note" date="01/20/26" color="orange">This is an orange note for warnings or alerts.</zn-note>
<br />
<zn-note caption="Yellow Note" date="01/20/26" color="yellow">This is a yellow note for highlights.</zn-note>
<br />
<zn-note caption="Indigo Note" date="01/20/26" color="indigo">This is an indigo note for special topics.</zn-note>
<br />
<zn-note caption="Violet Note" date="01/20/26" color="violet">This is a violet note for creative content.</zn-note>
<br />
<zn-note caption="Green Note" date="01/20/26" color="green">This is a green note for success or completion.</zn-note>
<br />
<zn-note caption="Pink Note" date="01/20/26" color="pink">This is a pink note for special mentions.</zn-note>
<br />
<zn-note caption="Gray Note" date="01/20/26" color="gray">This is a gray note for neutral content.</zn-note>
```

### Without Color

Notes can be displayed without a color border.

```html:preview
<zn-note caption="Standard Note" date="01/20/26">
  This note has no color border, giving it a clean, minimal appearance.
</zn-note>
```

### Expandable Content

When you provide both a `snippet` slot and default content, the note becomes expandable with a "Show more/Show less" toggle.

```html:preview
<zn-note color="indigo">
  <span slot="caption">Research Findings</span>
  <span slot="date">01/23/26</span>
  <div slot="snippet">
    Initial research shows promising results. Click to read more...
  </div>
  <p>After conducting extensive research over the past three months, we've discovered several key insights that will significantly impact our product strategy:</p>
  <ul>
    <li>User engagement increased by 45% with the new interface design</li>
    <li>Mobile users now represent 68% of total traffic</li>
    <li>Average session duration improved from 3.2 to 5.7 minutes</li>
    <li>Customer satisfaction scores rose from 7.2 to 8.9 out of 10</li>
  </ul>
  <p>These findings suggest we should prioritize mobile-first development and continue investing in user experience improvements.</p>
</zn-note>
```

### With Action Buttons

Use the `action` slot to add buttons or other interactive elements to the note header.

```html:preview
<zn-note caption="Pending Review" date="01/22/26" color="yellow">
  This document requires your approval before we can proceed with the next phase.
  <zn-button slot="action" color="success" size="small">Approve</zn-button>
</zn-note>
<br />
<zn-note caption="Task Assignment" date="01/23/26" color="blue">
  You've been assigned to work on the authentication module.
  <zn-button slot="action" color="primary" size="small">View Task</zn-button>
</zn-note>
```

### With Footer

Use the `footer` slot to add additional information or actions at the bottom of the note.

```html:preview
<zn-note caption="Project Milestone" date="01/20/26" color="green">
  Version 2.0 has been successfully released to all users. Great work team!
  <div slot="footer" style="display: flex; gap: 8px; align-items: center;">
    <small style="color: var(--zn-color-text-muted);">Posted by John Smith</small>
    <zn-button color="transparent" size="small">View Details</zn-button>
  </div>
</zn-note>
```

### Complex Content

Notes can contain rich HTML content including lists, links, code blocks, and formatted text.

```html:preview
<zn-note color="violet">
  <span slot="caption">Release Notes - v1.5.0</span>
  <span slot="date">01/15/26</span>
  <div slot="snippet">
    New features and improvements in this release. Click to view full changelog...
  </div>
  <h4>New Features</h4>
  <ul>
    <li><strong>Dark Mode:</strong> Added system-wide dark mode support</li>
    <li><strong>Export Functionality:</strong> Export data to CSV, JSON, and PDF formats</li>
    <li><strong>Advanced Search:</strong> New filtering and sorting capabilities</li>
  </ul>
  <h4>Improvements</h4>
  <ul>
    <li>Performance optimizations reducing load time by 40%</li>
    <li>Enhanced accessibility with ARIA labels</li>
    <li>Updated documentation with new examples</li>
  </ul>
  <h4>Bug Fixes</h4>
  <ul>
    <li>Fixed issue with date formatting in reports</li>
    <li>Resolved memory leak in data grid component</li>
    <li>Corrected validation errors in form inputs</li>
  </ul>
  <p>For more information, visit our <a href="#">changelog page</a>.</p>
  <div slot="footer">
    <zn-button color="violet" size="small">Download Update</zn-button>
    <zn-button color="transparent" size="small">Learn More</zn-button>
  </div>
</zn-note>
```

### Multiple Actions

Combine header actions and footer content for more complex interactions.

```html:preview
<zn-note caption="Code Review Request" date="01/23/26" color="orange">
  <div slot="action">
    <zn-button color="transparent" size="small">View Changes</zn-button>
  </div>
  <div slot="snippet">
    Pull request #247: Add user authentication feature. Click to see details...
  </div>
  <p><strong>Changes:</strong></p>
  <ul>
    <li>Added JWT authentication middleware</li>
    <li>Implemented refresh token rotation</li>
    <li>Created user session management</li>
    <li>Added login/logout endpoints</li>
  </ul>
  <p><strong>Files changed:</strong> 12 files (+458, -92 lines)</p>
  <p>Please review the changes and provide feedback. The tests are passing and the code follows our style guidelines.</p>
  <div slot="footer" style="display: flex; gap: 8px;">
    <zn-button color="success" size="small">Approve</zn-button>
    <zn-button color="error" size="small">Request Changes</zn-button>
    <zn-button color="transparent" size="small">Comment</zn-button>
  </div>
</zn-note>
```

### Real-World Use Cases

#### Meeting Notes

```html:preview
<zn-note caption="Weekly Team Sync" date="01/22/26" color="blue">
  <div slot="snippet">
    Discussed Q1 goals and project timelines. Click for full notes...
  </div>
  <h4>Attendees</h4>
  <p>Sarah Johnson, Mike Chen, Emily Rodriguez, David Kim</p>

  <h4>Discussion Points</h4>
  <ul>
    <li><strong>Q1 Goals:</strong> Finalize roadmap by end of January</li>
    <li><strong>Project Alpha:</strong> On track for February launch</li>
    <li><strong>Resource Allocation:</strong> Need two additional developers</li>
    <li><strong>Budget Review:</strong> Approved additional $50k for tooling</li>
  </ul>

  <h4>Action Items</h4>
  <ul>
    <li>Sarah: Draft project proposal by Friday</li>
    <li>Mike: Schedule interviews for developer positions</li>
    <li>Emily: Prepare Q1 budget breakdown</li>
    <li>David: Update project timeline documentation</li>
  </ul>

  <div slot="footer">
    <small style="color: var(--zn-color-text-muted);">Next meeting: 01/29/26 at 10:00 AM</small>
  </div>
</zn-note>
```

#### Changelog Entry

```html:preview
<zn-note caption="Version 3.2.0 Released" date="01/20/26" color="green">
  <p>We're excited to announce the release of version 3.2.0 with new features and improvements!</p>
  <p><strong>Highlights:</strong></p>
  <ul>
    <li>New dashboard widgets for better data visualization</li>
    <li>Improved mobile responsive design</li>
    <li>Performance enhancements for large datasets</li>
  </ul>
  <div slot="footer">
    <zn-button color="green" size="small">Update Now</zn-button>
    <zn-button color="transparent" size="small">View Full Changelog</zn-button>
  </div>
</zn-note>
```

#### Status Update

```html:preview
<zn-note caption="System Maintenance" date="01/25/26" color="yellow">
  <div slot="action">
    <zn-button color="transparent" size="small">Details</zn-button>
  </div>
  Scheduled maintenance window on Sunday, January 26 from 2:00 AM to 6:00 AM EST. Services will be temporarily unavailable during this time.
  <div slot="footer">
    <small style="color: var(--zn-color-text-muted);">Impact: All services | Duration: ~4 hours</small>
  </div>
</zn-note>
```