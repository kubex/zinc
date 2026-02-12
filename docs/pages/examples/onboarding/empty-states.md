---
meta:
  title: Empty States
  description: Collection of empty state patterns for various scenarios.
fullWidth: true
---

# Empty States Gallery

A collection of empty state designs for different scenarios. Demonstrates `zn-empty-state` variations with icons, messages, and call-to-action buttons.

## First-Time / No Data

```html:preview
<zn-cols layout="1,1,1">
  <zn-panel>
    <zn-empty-state>
      <zn-icon slot="icon" src="inbox" style="font-size: 64px;"></zn-icon>
      <span slot="headline">No messages yet</span>
      <span slot="description">When you receive messages, they'll appear here.</span>
      <zn-button slot="action">Compose Message</zn-button>
    </zn-empty-state>
  </zn-panel>

  <zn-panel>
    <zn-empty-state>
      <zn-icon slot="icon" src="folder_open" style="font-size: 64px;"></zn-icon>
      <span slot="headline">No files uploaded</span>
      <span slot="description">Upload your first file to get started organizing your documents.</span>
      <zn-button slot="action" icon="upload">Upload Files</zn-button>
    </zn-empty-state>
  </zn-panel>

  <zn-panel>
    <zn-empty-state>
      <zn-icon slot="icon" src="groups" style="font-size: 64px;"></zn-icon>
      <span slot="headline">No team members</span>
      <span slot="description">Invite colleagues to collaborate on this project.</span>
      <zn-button slot="action" icon="person_add">Invite Team</zn-button>
    </zn-empty-state>
  </zn-panel>
</zn-cols>
```

## Search / Filter Results

```html:preview
<zn-cols layout="1,1">
  <zn-panel>
    <zn-empty-state>
      <zn-icon slot="icon" src="search_off" style="font-size: 64px;"></zn-icon>
      <span slot="headline">No results found</span>
      <span slot="description">We couldn't find anything matching "xyz123". Try a different search term.</span>
      <zn-button slot="action" color="secondary">Clear Search</zn-button>
    </zn-empty-state>
  </zn-panel>

  <zn-panel>
    <zn-empty-state>
      <zn-icon slot="icon" src="filter_alt_off" style="font-size: 64px;"></zn-icon>
      <span slot="headline">No matching items</span>
      <span slot="description">No items match your current filters. Try adjusting or clearing filters.</span>
      <zn-button slot="action" color="secondary">Clear Filters</zn-button>
    </zn-empty-state>
  </zn-panel>
</zn-cols>
```

## Error States

```html:preview
<zn-cols layout="1,1,1">
  <zn-panel>
    <zn-empty-state>
      <zn-icon slot="icon" src="error_outline" style="font-size: 64px; color: var(--zn-color-error);"></zn-icon>
      <span slot="headline">Something went wrong</span>
      <span slot="description">We encountered an error loading this content. Please try again.</span>
      <zn-button slot="action" icon="refresh">Retry</zn-button>
    </zn-empty-state>
  </zn-panel>

  <zn-panel>
    <zn-empty-state>
      <zn-icon slot="icon" src="cloud_off" style="font-size: 64px; color: var(--zn-color-warning);"></zn-icon>
      <span slot="headline">Connection lost</span>
      <span slot="description">Please check your internet connection and try again.</span>
      <zn-button slot="action" icon="refresh">Reconnect</zn-button>
    </zn-empty-state>
  </zn-panel>

  <zn-panel>
    <zn-empty-state>
      <zn-icon slot="icon" src="sentiment_dissatisfied" style="font-size: 64px; color: var(--zn-color-error);"></zn-icon>
      <span slot="headline">Page not found</span>
      <span slot="description">The page you're looking for doesn't exist or has been moved.</span>
      <zn-button slot="action">Go Home</zn-button>
    </zn-empty-state>
  </zn-panel>
</zn-cols>
```

## Permission / Access States

```html:preview
<zn-cols layout="1,1">
  <zn-panel>
    <zn-empty-state>
      <zn-icon slot="icon" src="lock" style="font-size: 64px; color: var(--zn-color-warning);"></zn-icon>
      <span slot="headline">Access restricted</span>
      <span slot="description">You don't have permission to view this content. Contact your admin for access.</span>
      <zn-button slot="action" color="secondary">Request Access</zn-button>
    </zn-empty-state>
  </zn-panel>

  <zn-panel>
    <zn-empty-state>
      <zn-icon slot="icon" src="workspace_premium" style="font-size: 64px; color: var(--zn-color-primary);"></zn-icon>
      <span slot="headline">Upgrade required</span>
      <span slot="description">This feature is available on the Pro plan. Upgrade to unlock.</span>
      <zn-button slot="action">View Plans</zn-button>
    </zn-empty-state>
  </zn-panel>
</zn-cols>
```

## Maintenance / Status States

```html:preview
<zn-cols layout="1,1">
  <zn-panel>
    <zn-empty-state>
      <zn-icon slot="icon" src="engineering" style="font-size: 64px; color: var(--zn-color-info);"></zn-icon>
      <span slot="headline">Under maintenance</span>
      <span slot="description">We're performing scheduled maintenance. We'll be back shortly.</span>
      <zn-button slot="action" color="secondary">Check Status</zn-button>
    </zn-empty-state>
  </zn-panel>

  <zn-panel>
    <zn-empty-state>
      <zn-icon slot="icon" src="hourglass_empty" style="font-size: 64px; color: var(--zn-color-info);"></zn-icon>
      <span slot="headline">Coming soon</span>
      <span slot="description">This feature is still in development. Stay tuned for updates!</span>
      <zn-button slot="action" color="secondary">Notify Me</zn-button>
    </zn-empty-state>
  </zn-panel>
</zn-cols>
```

## Success / Completion States

```html:preview
<zn-cols layout="1,1,1">
  <zn-panel>
    <zn-empty-state>
      <zn-icon slot="icon" src="task_alt" style="font-size: 64px; color: var(--zn-color-success);"></zn-icon>
      <span slot="headline">All done!</span>
      <span slot="description">You've completed all your tasks for today. Great work!</span>
      <zn-button slot="action" color="secondary">View History</zn-button>
    </zn-empty-state>
  </zn-panel>

  <zn-panel>
    <zn-empty-state>
      <zn-icon slot="icon" src="mark_email_read" style="font-size: 64px; color: var(--zn-color-success);"></zn-icon>
      <span slot="headline">Inbox zero!</span>
      <span slot="description">You've read all your messages. Enjoy the peace and quiet.</span>
    </zn-empty-state>
  </zn-panel>

  <zn-panel>
    <zn-empty-state>
      <zn-icon slot="icon" src="celebration" style="font-size: 64px; color: var(--zn-color-warning);"></zn-icon>
      <span slot="headline">Congratulations!</span>
      <span slot="description">You've completed the onboarding process. Welcome aboard!</span>
      <zn-button slot="action">Explore Features</zn-button>
    </zn-empty-state>
  </zn-panel>
</zn-cols>
```

**Components demonstrated:** `zn-empty-state`, `zn-icon`, `zn-button`, `zn-panel`, `zn-cols`
