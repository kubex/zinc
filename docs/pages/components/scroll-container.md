---
meta:
  title: Scroll Container
  description: A container component that manages scrollable content with fixed header and footer areas, perfect for chat interfaces, logs, and content feeds.
layout: component
---

The scroll container provides a flexible scrolling area with optional header and footer slots that remain fixed while the main content scrolls. It supports automatic scrolling to the bottom, making it ideal for chat applications, activity feeds, and log viewers.

```html:preview
<zn-scroll-container style="height: 300px; display: block; border: 1px solid var(--zn-color-neutral-200);">
  <div slot="header" style="padding: 1rem; background: var(--zn-color-neutral-100); border-bottom: 1px solid var(--zn-color-neutral-200);">
    <strong>Header Area</strong>
  </div>

  <div style="padding: 1rem;">
    <p>This is scrollable content.</p>
    <p>The header and footer remain fixed while this area scrolls.</p>
    <p>Add more content to see scrolling behavior.</p>
    <p>Line 4</p>
    <p>Line 5</p>
    <p>Line 6</p>
    <p>Line 7</p>
    <p>Line 8</p>
    <p>Line 9</p>
    <p>Line 10</p>
  </div>

  <div slot="footer" style="padding: 1rem; background: var(--zn-color-neutral-100); border-top: 1px solid var(--zn-color-neutral-200);">
    <strong>Footer Area</strong>
  </div>
</zn-scroll-container>
```

## Examples

### Basic Vertical Scrolling

The most common use case is a simple vertical scrolling container. The main content area scrolls while header and footer remain fixed.

```html:preview
<zn-scroll-container style="height: 400px; display: block; border: 1px solid var(--zn-color-neutral-200); border-radius: 4px; overflow: hidden;">
  <div style="padding: 1rem;">
    <h3 style="margin-top: 0;">Scrollable Content Area</h3>
    <p>This container has a fixed height and the content will scroll vertically when it exceeds the available space.</p>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
    <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    <p>Additional content to demonstrate scrolling behavior.</p>
    <p>More content here...</p>
    <p>And even more content to ensure scrolling is visible.</p>
    <p>Final paragraph of content.</p>
  </div>
</zn-scroll-container>
```

### With Fixed Header

Use the `header` slot to add a fixed header that remains visible while content scrolls.

```html:preview
<zn-scroll-container style="height: 350px; display: block; border: 1px solid var(--zn-color-neutral-200); border-radius: 4px; overflow: hidden;">
  <div slot="header" style="padding: 1rem; background: var(--zn-color-primary-50); border-bottom: 2px solid var(--zn-color-primary-200);">
    <h3 style="margin: 0;">Document Title</h3>
    <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: var(--zn-color-neutral-600);">Last updated: January 23, 2026</p>
  </div>

  <div style="padding: 1rem;">
    <h4>Section 1</h4>
    <p>The header remains fixed at the top while this content scrolls.</p>
    <p>This is useful for displaying titles, metadata, or navigation elements.</p>

    <h4>Section 2</h4>
    <p>More content to demonstrate scrolling.</p>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>

    <h4>Section 3</h4>
    <p>Even more content to ensure scrolling is visible.</p>
    <p>The header never scrolls out of view.</p>

    <h4>Section 4</h4>
    <p>Additional content continues here.</p>
    <p>Keep scrolling to see more.</p>
  </div>
</zn-scroll-container>
```

### With Fixed Footer

Use the `footer` slot to add a fixed footer that remains at the bottom. The footer is positioned absolutely and the scrollable area has padding to account for its height.

```html:preview
<zn-scroll-container style="height: 350px; display: block; border: 1px solid var(--zn-color-neutral-200); border-radius: 4px; overflow: hidden;">
  <div style="padding: 1rem;">
    <h4>Content Area</h4>
    <p>The footer remains fixed at the bottom while this content scrolls.</p>
    <p>This is perfect for action bars, input fields, or status information.</p>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
    <p>More content to demonstrate scrolling.</p>
    <p>Additional content here.</p>
    <p>The footer is always visible at the bottom.</p>
  </div>

  <div slot="footer" style="padding: 1rem; background: var(--zn-color-neutral-100); border-top: 1px solid var(--zn-color-neutral-200); display: flex; gap: 0.5rem;">
    <zn-button size="small" color="secondary">Cancel</zn-button>
    <zn-button size="small" color="primary">Save Changes</zn-button>
  </div>
</zn-scroll-container>
```

### Header and Footer Together

Combine both header and footer slots for maximum control. The scrollable area sits between them.

```html:preview
<zn-scroll-container style="height: 400px; display: block; border: 1px solid var(--zn-color-neutral-200); border-radius: 4px; overflow: hidden;">
  <div slot="header" style="padding: 1rem; background: var(--zn-color-neutral-100); border-bottom: 1px solid var(--zn-color-neutral-200);">
    <h3 style="margin: 0;">Messages</h3>
  </div>

  <div style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
    <div style="padding: 0.75rem; background: var(--zn-color-primary-50); border-radius: 4px;">
      <strong>Alice:</strong> Hey, how's the project going?
    </div>
    <div style="padding: 0.75rem; background: var(--zn-color-neutral-100); border-radius: 4px;">
      <strong>Bob:</strong> Great! Just finished the main features.
    </div>
    <div style="padding: 0.75rem; background: var(--zn-color-primary-50); border-radius: 4px;">
      <strong>Alice:</strong> Awesome! When can we review?
    </div>
    <div style="padding: 0.75rem; background: var(--zn-color-neutral-100); border-radius: 4px;">
      <strong>Bob:</strong> How about tomorrow morning?
    </div>
    <div style="padding: 0.75rem; background: var(--zn-color-primary-50); border-radius: 4px;">
      <strong>Alice:</strong> Perfect, see you then!
    </div>
    <div style="padding: 0.75rem; background: var(--zn-color-neutral-100); border-radius: 4px;">
      <strong>Bob:</strong> Looking forward to it.
    </div>
  </div>

  <div slot="footer" style="padding: 1rem; background: var(--zn-color-white); border-top: 1px solid var(--zn-color-neutral-200);">
    <div style="display: flex; gap: 0.5rem;">
      <zn-input placeholder="Type a message..." style="flex: 1;"></zn-input>
      <zn-button size="small" icon="send" color="primary">Send</zn-button>
    </div>
  </div>
</zn-scroll-container>
```

### Auto-Scroll to Bottom

Use the `start-scrolled` attribute to automatically scroll to the bottom when the component loads or when new content is added. This is perfect for chat interfaces, activity logs, and notification feeds.

```html:preview
<zn-scroll-container start-scrolled style="height: 300px; display: block; border: 1px solid var(--zn-color-neutral-200); border-radius: 4px; overflow: hidden;">
  <div slot="header" style="padding: 1rem; background: var(--zn-color-neutral-100); border-bottom: 1px solid var(--zn-color-neutral-200);">
    <h4 style="margin: 0;">Activity Log</h4>
  </div>

  <div style="padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
    <div style="font-size: 0.875rem; color: var(--zn-color-neutral-600);">
      <strong>09:00</strong> - System started
    </div>
    <div style="font-size: 0.875rem; color: var(--zn-color-neutral-600);">
      <strong>09:15</strong> - User login: alice@example.com
    </div>
    <div style="font-size: 0.875rem; color: var(--zn-color-neutral-600);">
      <strong>09:30</strong> - File uploaded: document.pdf
    </div>
    <div style="font-size: 0.875rem; color: var(--zn-color-neutral-600);">
      <strong>09:45</strong> - Report generated
    </div>
    <div style="font-size: 0.875rem; color: var(--zn-color-neutral-600);">
      <strong>10:00</strong> - Email sent to team
    </div>
    <div style="font-size: 0.875rem; color: var(--zn-color-neutral-600);">
      <strong>10:15</strong> - Database backup completed
    </div>
    <div style="font-size: 0.875rem; color: var(--zn-color-neutral-600);">
      <strong>10:30</strong> - Server status: healthy
    </div>
    <div style="font-size: 0.875rem; color: var(--zn-color-neutral-600);">
      <strong>10:45</strong> - New deployment started
    </div>
    <div style="font-size: 0.875rem; color: var(--zn-color-success-600); font-weight: bold;">
      <strong>11:00</strong> - Deployment successful (scrolled to this line)
    </div>
  </div>
</zn-scroll-container>
```

### Chat Interface Example

A practical example showing how to build a chat interface with auto-scrolling and dynamic content.

```html:preview
<zn-scroll-container id="chat-example" start-scrolled style="height: 450px; display: block; border: 1px solid var(--zn-color-neutral-200); border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  <div slot="header" style="padding: 1rem; background: var(--zn-color-primary); color: white; display: flex; align-items: center; gap: 0.75rem;">
    <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--zn-color-primary-700); display: flex; align-items: center; justify-content: center; font-weight: bold;">
      TC
    </div>
    <div>
      <div style="font-weight: bold;">Team Chat</div>
      <div style="font-size: 0.75rem; opacity: 0.9;">5 members online</div>
    </div>
  </div>

  <div id="chat-messages" style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
    <div style="display: flex; gap: 0.75rem;">
      <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--zn-color-success); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: bold; flex-shrink: 0;">
        AJ
      </div>
      <div style="flex: 1;">
        <div style="font-weight: bold; font-size: 0.875rem; margin-bottom: 0.25rem;">Alice Johnson <span style="font-weight: normal; color: var(--zn-color-neutral-500); font-size: 0.75rem;">10:30 AM</span></div>
        <div style="padding: 0.75rem; background: var(--zn-color-neutral-100); border-radius: 8px; border-top-left-radius: 0;">
          Good morning everyone! Ready for the standup?
        </div>
      </div>
    </div>

    <div style="display: flex; gap: 0.75rem;">
      <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--zn-color-info); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: bold; flex-shrink: 0;">
        BS
      </div>
      <div style="flex: 1;">
        <div style="font-weight: bold; font-size: 0.875rem; margin-bottom: 0.25rem;">Bob Smith <span style="font-weight: normal; color: var(--zn-color-neutral-500); font-size: 0.75rem;">10:31 AM</span></div>
        <div style="padding: 0.75rem; background: var(--zn-color-neutral-100); border-radius: 8px; border-top-left-radius: 0;">
          Yes! Just wrapped up the authentication module.
        </div>
      </div>
    </div>

    <div style="display: flex; gap: 0.75rem;">
      <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--zn-color-warning); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: bold; flex-shrink: 0;">
        CW
      </div>
      <div style="flex: 1;">
        <div style="font-weight: bold; font-size: 0.875rem; margin-bottom: 0.25rem;">Carol Williams <span style="font-weight: normal; color: var(--zn-color-neutral-500); font-size: 0.75rem;">10:32 AM</span></div>
        <div style="padding: 0.75rem; background: var(--zn-color-neutral-100); border-radius: 8px; border-top-left-radius: 0;">
          Great work! I've finished the UI designs for the dashboard.
        </div>
      </div>
    </div>

    <div style="display: flex; gap: 0.75rem;">
      <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--zn-color-danger); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: bold; flex-shrink: 0;">
        DB
      </div>
      <div style="flex: 1;">
        <div style="font-weight: bold; font-size: 0.875rem; margin-bottom: 0.25rem;">David Brown <span style="font-weight: normal; color: var(--zn-color-neutral-500); font-size: 0.75rem;">10:33 AM</span></div>
        <div style="padding: 0.75rem; background: var(--zn-color-neutral-100); border-radius: 8px; border-top-left-radius: 0;">
          Excellent! Database migrations are ready to go.
        </div>
      </div>
    </div>
  </div>

  <div slot="footer" style="padding: 1rem; background: var(--zn-color-white); border-top: 1px solid var(--zn-color-neutral-200);">
    <div style="display: flex; gap: 0.5rem; align-items: center;">
      <zn-button size="small" color="secondary" icon="attach_file"></zn-button>
      <zn-input placeholder="Type your message..." style="flex: 1;"></zn-input>
      <zn-button size="small" icon="send" color="primary">Send</zn-button>
    </div>
  </div>
</zn-scroll-container>
```

### Log Viewer Example

Perfect for displaying server logs, build output, or any streaming text content.

```html:preview
<zn-scroll-container start-scrolled style="height: 350px; display: block; border: 1px solid var(--zn-color-neutral-800); border-radius: 4px; overflow: hidden; background: var(--zn-color-neutral-900);">
  <div slot="header" style="padding: 0.75rem 1rem; background: var(--zn-color-neutral-800); color: var(--zn-color-neutral-200); font-family: monospace; font-size: 0.875rem; border-bottom: 1px solid var(--zn-color-neutral-700);">
    <strong>build.log</strong> - Application Build Output
  </div>

  <div style="padding: 1rem; font-family: monospace; font-size: 0.875rem; color: var(--zn-color-neutral-300); line-height: 1.6;">
    <div style="color: var(--zn-color-info-400);">[INFO] Starting build process...</div>
    <div style="color: var(--zn-color-neutral-400);">[DEBUG] Loading configuration from config.json</div>
    <div style="color: var(--zn-color-info-400);">[INFO] Configuration loaded successfully</div>
    <div style="color: var(--zn-color-neutral-400);">[DEBUG] Initializing TypeScript compiler</div>
    <div style="color: var(--zn-color-info-400);">[INFO] Compiling TypeScript files...</div>
    <div style="color: var(--zn-color-neutral-400);">[DEBUG] src/index.ts</div>
    <div style="color: var(--zn-color-neutral-400);">[DEBUG] src/components/button.ts</div>
    <div style="color: var(--zn-color-neutral-400);">[DEBUG] src/components/input.ts</div>
    <div style="color: var(--zn-color-warning-400);">[WARN] Unused variable 'tempVar' in src/utils/helper.ts:45</div>
    <div style="color: var(--zn-color-neutral-400);">[DEBUG] src/utils/helper.ts</div>
    <div style="color: var(--zn-color-success-400);">[SUCCESS] TypeScript compilation complete</div>
    <div style="color: var(--zn-color-info-400);">[INFO] Bundling assets...</div>
    <div style="color: var(--zn-color-neutral-400);">[DEBUG] Processing CSS files</div>
    <div style="color: var(--zn-color-neutral-400);">[DEBUG] Optimizing images</div>
    <div style="color: var(--zn-color-success-400);">[SUCCESS] Assets bundled successfully</div>
    <div style="color: var(--zn-color-info-400);">[INFO] Running tests...</div>
    <div style="color: var(--zn-color-success-400);">[SUCCESS] All tests passed (42/42)</div>
    <div style="color: var(--zn-color-success-400); font-weight: bold;">[SUCCESS] Build completed in 12.4s</div>
  </div>
</zn-scroll-container>
```

### Feed with Dynamic Content

A practical example showing an activity feed that automatically scrolls to show the latest activity.

```html:preview
<zn-scroll-container id="activity-feed" start-scrolled style="height: 400px; display: block; border: 1px solid var(--zn-color-neutral-200); border-radius: 4px; overflow: hidden;">
  <div slot="header" style="padding: 1rem; background: var(--zn-color-neutral-50); border-bottom: 1px solid var(--zn-color-neutral-200); display: flex; justify-content: space-between; align-items: center;">
    <h4 style="margin: 0;">Recent Activity</h4>
    <zn-chip size="small" type="info">Live</zn-chip>
  </div>

  <div id="feed-content" style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
    <div style="display: flex; gap: 1rem; padding: 0.75rem; background: var(--zn-color-neutral-50); border-radius: 4px; border-left: 3px solid var(--zn-color-success);">
      <zn-icon src="check_circle" style="color: var(--zn-color-success); flex-shrink: 0;"></zn-icon>
      <div style="flex: 1;">
        <div style="font-weight: bold; margin-bottom: 0.25rem;">Deployment Successful</div>
        <div style="font-size: 0.875rem; color: var(--zn-color-neutral-600);">Production environment updated to v2.1.0</div>
        <div style="font-size: 0.75rem; color: var(--zn-color-neutral-500); margin-top: 0.25rem;">2 minutes ago</div>
      </div>
    </div>

    <div style="display: flex; gap: 1rem; padding: 0.75rem; background: var(--zn-color-neutral-50); border-radius: 4px; border-left: 3px solid var(--zn-color-info);">
      <zn-icon src="person_add" style="color: var(--zn-color-info); flex-shrink: 0;"></zn-icon>
      <div style="flex: 1;">
        <div style="font-weight: bold; margin-bottom: 0.25rem;">New Team Member</div>
        <div style="font-size: 0.875rem; color: var(--zn-color-neutral-600);">Sarah joined the engineering team</div>
        <div style="font-size: 0.75rem; color: var(--zn-color-neutral-500); margin-top: 0.25rem;">15 minutes ago</div>
      </div>
    </div>

    <div style="display: flex; gap: 1rem; padding: 0.75rem; background: var(--zn-color-neutral-50); border-radius: 4px; border-left: 3px solid var(--zn-color-warning);">
      <zn-icon src="warning" style="color: var(--zn-color-warning); flex-shrink: 0;"></zn-icon>
      <div style="flex: 1;">
        <div style="font-weight: bold; margin-bottom: 0.25rem;">High Memory Usage</div>
        <div style="font-size: 0.875rem; color: var(--zn-color-neutral-600);">Server-03 memory usage at 85%</div>
        <div style="font-size: 0.75rem; color: var(--zn-color-neutral-500); margin-top: 0.25rem;">1 hour ago</div>
      </div>
    </div>

    <div style="display: flex; gap: 1rem; padding: 0.75rem; background: var(--zn-color-neutral-50); border-radius: 4px; border-left: 3px solid var(--zn-color-success);">
      <zn-icon src="backup" style="color: var(--zn-color-success); flex-shrink: 0;"></zn-icon>
      <div style="flex: 1;">
        <div style="font-weight: bold; margin-bottom: 0.25rem;">Backup Completed</div>
        <div style="font-size: 0.875rem; color: var(--zn-color-neutral-600);">Daily database backup finished successfully</div>
        <div style="font-size: 0.75rem; color: var(--zn-color-neutral-500); margin-top: 0.25rem;">2 hours ago</div>
      </div>
    </div>
  </div>
</zn-scroll-container>
```

### Notification Center

A comprehensive example showing how to build a notification center with categorized notifications.

```html:preview
<zn-scroll-container start-scrolled style="height: 450px; display: block; border: 1px solid var(--zn-color-neutral-200); border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
  <div slot="header" style="padding: 1.25rem; background: var(--zn-color-white); border-bottom: 1px solid var(--zn-color-neutral-200);">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h3 style="margin: 0;">Notifications</h3>
        <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: var(--zn-color-neutral-600);">You have 4 unread notifications</p>
      </div>
      <zn-button size="small" color="secondary">Mark all read</zn-button>
    </div>
  </div>

  <div style="padding: 0;">
    <div style="padding: 1rem; background: var(--zn-color-primary-50); border-bottom: 1px solid var(--zn-color-neutral-200);">
      <div style="display: flex; gap: 1rem; align-items: start;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--zn-color-primary); color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <zn-icon src="star"></zn-icon>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 0.25rem;">New Feature Released</div>
          <div style="font-size: 0.875rem; color: var(--zn-color-neutral-700); margin-bottom: 0.5rem;">
            Check out the new dark mode in settings. Customize your experience!
          </div>
          <div style="font-size: 0.75rem; color: var(--zn-color-neutral-600);">Just now</div>
        </div>
        <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--zn-color-primary); flex-shrink: 0; margin-top: 0.5rem;"></div>
      </div>
    </div>

    <div style="padding: 1rem; background: var(--zn-color-white); border-bottom: 1px solid var(--zn-color-neutral-200);">
      <div style="display: flex; gap: 1rem; align-items: start;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--zn-color-success); color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <zn-icon src="task_alt"></zn-icon>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 0.25rem;">Task Completed</div>
          <div style="font-size: 0.875rem; color: var(--zn-color-neutral-700); margin-bottom: 0.5rem;">
            "Update user documentation" was marked as complete by Alice.
          </div>
          <div style="font-size: 0.75rem; color: var(--zn-color-neutral-600);">5 minutes ago</div>
        </div>
      </div>
    </div>

    <div style="padding: 1rem; background: var(--zn-color-info-50); border-bottom: 1px solid var(--zn-color-neutral-200);">
      <div style="display: flex; gap: 1rem; align-items: start;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--zn-color-info); color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <zn-icon src="comment"></zn-icon>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 0.25rem;">New Comment</div>
          <div style="font-size: 0.875rem; color: var(--zn-color-neutral-700); margin-bottom: 0.5rem;">
            Bob commented on your pull request: "Looks good, just one small suggestion..."
          </div>
          <div style="font-size: 0.75rem; color: var(--zn-color-neutral-600);">15 minutes ago</div>
        </div>
        <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--zn-color-info); flex-shrink: 0; margin-top: 0.5rem;"></div>
      </div>
    </div>

    <div style="padding: 1rem; background: var(--zn-color-white); border-bottom: 1px solid var(--zn-color-neutral-200);">
      <div style="display: flex; gap: 1rem; align-items: start;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--zn-color-neutral-400); color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <zn-icon src="security"></zn-icon>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 0.25rem;">Security Update</div>
          <div style="font-size: 0.875rem; color: var(--zn-color-neutral-700); margin-bottom: 0.5rem;">
            Your password was successfully changed. If this wasn't you, contact support.
          </div>
          <div style="font-size: 0.75rem; color: var(--zn-color-neutral-600);">1 hour ago</div>
        </div>
      </div>
    </div>

    <div style="padding: 1rem; background: var(--zn-color-warning-50); border-bottom: 1px solid var(--zn-color-neutral-200);">
      <div style="display: flex; gap: 1rem; align-items: start;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--zn-color-warning); color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <zn-icon src="schedule"></zn-icon>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 0.25rem;">Upcoming Deadline</div>
          <div style="font-size: 0.875rem; color: var(--zn-color-neutral-700); margin-bottom: 0.5rem;">
            Project milestone "Beta Release" is due in 3 days.
          </div>
          <div style="font-size: 0.75rem; color: var(--zn-color-neutral-600);">3 hours ago</div>
        </div>
        <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--zn-color-warning); flex-shrink: 0; margin-top: 0.5rem;"></div>
      </div>
    </div>
  </div>

  <div slot="footer" style="padding: 1rem; background: var(--zn-color-neutral-50); border-top: 1px solid var(--zn-color-neutral-200); text-align: center;">
    <zn-button size="small" color="secondary" style="width: 100%;">View All Notifications</zn-button>
  </div>
</zn-scroll-container>
```

### Programmatic Scrolling

You can programmatically scroll to the bottom using the `scrollEnd()` method.

```html:preview
<zn-scroll-container id="programmatic-scroll" style="height: 300px; display: block; border: 1px solid var(--zn-color-neutral-200); border-radius: 4px; overflow: hidden;">
  <div id="scroll-content" style="padding: 1rem;">
    <p>Content line 1</p>
    <p>Content line 2</p>
    <p>Content line 3</p>
    <p>Content line 4</p>
    <p>Content line 5</p>
    <p>Content line 6</p>
    <p>Content line 7</p>
    <p>Content line 8</p>
    <p>Content line 9</p>
    <p>Content line 10</p>
  </div>

  <div slot="footer" style="padding: 1rem; background: var(--zn-color-neutral-100); border-top: 1px solid var(--zn-color-neutral-200);">
    <zn-button id="add-content-btn" size="small">Add Content</zn-button>
    <zn-button id="scroll-bottom-btn" size="small" color="secondary">Scroll to Bottom</zn-button>
  </div>
</zn-scroll-container>

<script type="module">
  const container = document.getElementById('programmatic-scroll');
  const content = document.getElementById('scroll-content');
  const addBtn = document.getElementById('add-content-btn');
  const scrollBtn = document.getElementById('scroll-bottom-btn');
  let lineCount = 10;

  addBtn.addEventListener('click', () => {
    lineCount++;
    const newLine = document.createElement('p');
    newLine.textContent = `Content line ${lineCount} (newly added)`;
    newLine.style.fontWeight = 'bold';
    newLine.style.color = 'var(--zn-color-primary)';
    content.appendChild(newLine);
  });

  scrollBtn.addEventListener('click', () => {
    container.scrollEnd();
  });
</script>
```

### Responsive Footer Height

The footer's height is automatically tracked and the scrollable area adjusts accordingly. This happens dynamically when the footer content changes size.

```html:preview
<zn-scroll-container start-scrolled style="height: 400px; display: block; border: 1px solid var(--zn-color-neutral-200); border-radius: 4px; overflow: hidden;">
  <div style="padding: 1rem;">
    <p>The scrollable area automatically adjusts its padding based on the footer's height.</p>
    <p>This ensures that content is never hidden behind the fixed footer.</p>
    <p>Try expanding the footer below to see how the scroll area adjusts.</p>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    <p>Ut enim ad minim veniam, quis nostrud exercitation.</p>
    <p>More content here...</p>
    <p>And even more...</p>
    <p>Keep scrolling...</p>
    <p>Almost there...</p>
    <p>Last line of content.</p>
  </div>

  <div id="dynamic-footer" slot="footer" style="padding: 1rem; background: var(--zn-color-neutral-100); border-top: 1px solid var(--zn-color-neutral-200); transition: all 0.3s ease;">
    <div style="margin-bottom: 0.5rem;">
      <strong>Footer Section</strong>
    </div>
    <zn-button id="toggle-footer-btn" size="small">Expand Footer</zn-button>
    <div id="extra-footer-content" style="display: none; margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-200); border-radius: 4px;">
      <p style="margin: 0;">This is additional footer content that appears when expanded.</p>
      <p style="margin: 0.5rem 0 0 0;">The scroll area automatically adjusts!</p>
    </div>
  </div>
</zn-scroll-container>

<script type="module">
  const btn = document.getElementById('toggle-footer-btn');
  const extraContent = document.getElementById('extra-footer-content');
  let expanded = false;

  btn.addEventListener('click', () => {
    expanded = !expanded;
    extraContent.style.display = expanded ? 'block' : 'none';
    btn.textContent = expanded ? 'Collapse Footer' : 'Expand Footer';
  });
</script>
```

### Minimal Example

A minimal example showing just the essential markup.

```html:preview
<zn-scroll-container style="height: 250px; display: block; border: 1px solid var(--zn-color-neutral-200);">
  <div style="padding: 1rem;">
    <p>Simple scrollable content without header or footer.</p>
    <p>Just add content to the default slot.</p>
    <p>The container handles the rest.</p>
    <p>Additional content...</p>
    <p>More content...</p>
    <p>Keep scrolling...</p>
    <p>Last line.</p>
  </div>
</zn-scroll-container>
```


