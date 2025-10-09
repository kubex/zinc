import {colorDataProvider} from "../../../data-select/providers/color-data-provider";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from "lit";
import {property, query, queryAll} from "lit/decorators.js";
import ZincElement from "../../../../internal/zinc-element";
import ZnButton from "../../../button";
import ZnEditorTool from "./tool";
import ZnMenu from "../../../menu";
import ZnMenuItem from "../../../menu-item";

import styles from './toolbar.scss';

export default class ToolbarComponent extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({type: Number})
  public containerWidth: number;

  @query('.toolbar') private _toolbarEl!: HTMLElement;

  @queryAll('.toolbar__group') private _groups!: HTMLElement[];

  @query('.toolbar__overflow-menu') private _overflowMenu!: HTMLElement;
  @query('.toolbar__group--overflow') private _overflowGroup!: HTMLElement;

  private _resizeObserver: ResizeObserver | null = null;
  private _resizeId: number | null = null;

  // Tracks DOM nodes (e.g. emoji/date pickers) temporarily moved into the overflow submenu so we can restore them
  private _movedContent: Map<HTMLElement, { placeholder: Comment; originalParent: HTMLElement }> = new Map();

  connectedCallback() {
    super.connectedCallback();
    this.containerWidth = this.offsetWidth;

    this._resizeObserver = new ResizeObserver(this.handleResize.bind(this));
    if (this.parentElement) {
      this._resizeObserver.observe(this.parentElement);
    }
    this._resizeObserver.observe(this as HTMLElement);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    if (this._resizeId !== null) {
      cancelAnimationFrame(this._resizeId);
      this._resizeId = null;
    }

    // Make sure any content we moved into the overflow is restored on disconnect
    this.restoreMovedContent();
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    this.containerWidth = this.getToolbarWidth();
    this.updateEmptyGroups();

    const slotElement = this.renderRoot?.querySelector('slot') as HTMLSlotElement | null;
    slotElement?.addEventListener('slotchange', () => this.calculateOverflow());

    this.updateComplete.then(() => this.calculateOverflow());
  }

  handleResize = () => {
    this.containerWidth = this.getToolbarWidth();
    if (this._resizeId !== null) {
      cancelAnimationFrame(this._resizeId);
    }
    this._resizeId = requestAnimationFrame(() => {
      this.calculateOverflow();
      this._resizeId = null;
    });
  }

  private getToolbarWidth() {
    const host = this as unknown as HTMLElement;
    let width = host.getBoundingClientRect?.().width || host.offsetWidth || 0;
    if ((!width || width <= 0) && this._toolbarEl) {
      const bounds = this._toolbarEl.getBoundingClientRect();
      width = bounds.width;
    }
    return width;
  }

  private getOverflowGroupWidth() {
    let width = 50;
    const overflowGroup = this._overflowGroup as HTMLElement | undefined;
    if (!overflowGroup) return width;

    const prevDisplay = overflowGroup.style.display;
    const prevVisibility = overflowGroup.style.visibility;

    overflowGroup.style.display = 'flex';
    overflowGroup.style.visibility = 'hidden';

    width = overflowGroup.offsetWidth || width;

    overflowGroup.style.visibility = prevVisibility;
    overflowGroup.style.display = prevDisplay || 'none';

    return width;
  }

  private restoreMovedContent() {
    this._movedContent.forEach(({placeholder, originalParent}, el) => {
      if (placeholder.parentNode) {
        originalParent.insertBefore(el, placeholder);
        placeholder.parentNode.removeChild(placeholder);
      } else {
        originalParent.appendChild(el);
      }
    });
    this._movedContent.clear();
  }

  private moveContentTo(element: HTMLElement, target: HTMLElement) {
    if (this._movedContent.has(element)) {
      if (element.parentElement !== target) target.appendChild(element);
      return;
    }

    const originalParent = element.parentElement as HTMLElement | null;
    if (!originalParent) return;

    const placeholder = document.createComment('toolbar-overflow-placeholder');
    originalParent.insertBefore(placeholder, element);

    target.appendChild(element);
    this._movedContent.set(element, {placeholder, originalParent});
  }

  private isGroupEmpty(group: HTMLElement): boolean {
    const slotElement = group.querySelector('slot') as HTMLSlotElement | null;
    if (slotElement) {
      const assigned = slotElement.assignedElements({flatten: true});
      return assigned.length === 0;
    }

    return group.childElementCount === 0;
  }

  private updateEmptyGroups() {
    const groups = Array.from(this._groups || []);
    groups.forEach(group => {
      const empty = this.isGroupEmpty(group);
      group.classList.toggle('toolbar__group--empty', empty);
    });
  }

  private _updateDividerClasses() {
    const groups = Array.from(this._groups || []);
    let seenVisible = false;
    groups.forEach(group => {
      const isEmpty = group.classList.contains('toolbar__group--empty');
      const isHidden = (group as HTMLElement).style.display === 'none';
      const isVisible = !isEmpty && !isHidden;

      group.classList.toggle('toolbar__group--has-prev-visible', isVisible && seenVisible);
      if (isVisible) {
        seenVisible = true;
      }
    });
  }

  private calculateOverflow() {
    const groups = Array.from(this._groups || []);
    if (!groups.length) return;

    this.restoreMovedContent();
    this.updateEmptyGroups();

    const nonOverflowGroups = groups.filter(group => !group.classList.contains('toolbar__group--overflow') && !group.classList.contains('toolbar__group--empty'));

    nonOverflowGroups.forEach(group => {
      group.style.display = 'flex';
      group.classList.remove('toolbar__group--hidden', 'toolbar__group--has-prev-visible');
    });

    if (this._overflowGroup) {
      this._overflowGroup.style.display = 'none';
      this._overflowGroup.classList.remove('toolbar__group--hidden', 'toolbar__group--has-prev-visible');
    }

    const containerWidth = this.getToolbarWidth();

    if (!containerWidth || containerWidth <= 0) {
      nonOverflowGroups.forEach(group => (group.style.display = 'flex'));
      if (this._overflowGroup) {
        this._overflowGroup.style.display = 'none';
      }

      this.restoreMovedContent();
      if (this._overflowMenu) {
        this._overflowMenu.innerHTML = '';
      }

      this._updateDividerClasses();
      this._dispatchOverflowEvent();
      return;
    }

    let used = 0;
    let visibleCount = 0;

    for (const group of nonOverflowGroups) {
      const width = group.offsetWidth;
      if (used + width <= containerWidth) {
        used += width;
        visibleCount++;
      } else {
        break;
      }
    }

    if (visibleCount >= nonOverflowGroups.length) {
      nonOverflowGroups.forEach(group => (group.style.display = 'flex'));
      if (this._overflowGroup) {
        this._overflowGroup.style.display = 'none';
      }

      this.restoreMovedContent();
      if (this._overflowMenu) {
        this._overflowMenu.innerHTML = '';
      }

      this._updateDividerClasses();
      this._dispatchOverflowEvent();
      return;
    }

    const overflowTriggerWidth = this.getOverflowGroupWidth();
    used = 0;
    visibleCount = 0;
    for (const group of nonOverflowGroups) {
      const width = group.offsetWidth;
      if (used + width + overflowTriggerWidth <= containerWidth) {
        used += width;
        visibleCount++;
      } else {
        break;
      }
    }

    nonOverflowGroups.forEach((group, index) => {
      group.style.display = index < visibleCount ? 'flex' : 'none';
    });

    nonOverflowGroups.forEach((group, index) => {
      const hidden = index >= visibleCount;
      group.classList.toggle('toolbar__group--hidden', hidden);
    });

    if (this._overflowGroup) {
      this._overflowGroup.style.display = 'flex';
    }

    this._updateDividerClasses();

    const hiddenGroups = nonOverflowGroups.slice(visibleCount);
    this.populateOverflowMenu(hiddenGroups);

    this._dispatchOverflowEvent();
  }

  private _dispatchOverflowEvent() {
    this.dispatchEvent(new CustomEvent('zn-toolbar-overflow-updated', {bubbles: true, composed: true}));
  }

  private populateOverflowMenu(hiddenGroups: HTMLElement[]) {
    const menu = this._overflowMenu as HTMLElement | null;
    if (!menu) return;

    this.restoreMovedContent();

    menu.innerHTML = '';

    const addMenuItemTo = (targetMenu: HTMLElement, label: string, icon?: string, onClick?: () => void, attrs: {
      [k: string]: string;
    } = {}) => {
      const item = document.createElement('zn-menu-item') as ZnMenuItem;
      item.innerText = label;

      Object.keys(attrs).forEach(key => item.setAttribute(key, attrs[key]));

      if (icon) {
        const iconEl = document.createElement('zn-icon');
        iconEl.setAttribute('src', icon);
        iconEl.setAttribute('size', '18');
        iconEl.setAttribute('slot', 'prefix');
        item.appendChild(iconEl);
      }

      if (onClick) {
        item.addEventListener('click', (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        });
      }
      targetMenu.appendChild(item);
      return item as ZnMenuItem;
    };

    const makeProxyClone = (original: ZnMenuItem) => {
      const cloned = document.createElement('zn-menu-item') as ZnMenuItem;
      for (const a of original.attributes) {
        if (a.name === 'id') continue;
        cloned.setAttribute(a.name, a.value);
      }
      cloned.innerHTML = original.innerHTML;
      return cloned;
    };

    const getDropdownIcon = (dropdown: HTMLElement) => {
      const triggerBtn = dropdown.querySelector('zn-button[slot="trigger"]') as ZnButton | undefined;
      const iconEl = triggerBtn?.querySelector('zn-icon') as HTMLElement | null;
      return iconEl?.getAttribute('src');
    };

    const buttonLabelMap: Record<string, string> = {
      bold: 'Bold',
      italic: 'Italic',
      underline: 'Underline',
      undo: 'Undo',
      redo: 'Redo'
    };

    const dropdownLabelMap: Record<string, string> = {
      'toolbar__header-dropdown': 'Text',
      'toolbar__format-dropdown': 'Format',
      'toolbar__color-dropdown': 'Color',
      'toolbar__list-dropdown': 'Lists',
      'toolbar__file-dropdown': 'Insert',
      'toolbar__emoji-dropdown': 'Emoji',
      'toolbar__date-dropdown': 'Date'
    };

    hiddenGroups.forEach((group) => {
      // 1) Dropdowns → nested submenu
      const dropdowns = Array.from(group.querySelectorAll('zn-dropdown')) as HTMLElement[];
      dropdowns.forEach((dropdown: HTMLElement) => {
        let label = '';
        for (const className in dropdownLabelMap) {
          if (dropdown.classList.contains(className)) {
            label = dropdownLabelMap[className];
            break;
          }
        }
        if (!label) {
          label = dropdown.getAttribute('aria-label') || dropdown.getAttribute('title') || 'More';
        }

        const icon = getDropdownIcon(dropdown) || '';
        const parentItem = addMenuItemTo(menu, label, icon);
        // Mark overflow items by source to allow programmatic access (e.g. opening Date from context menu)
        if (dropdown.classList.contains('toolbar__date-dropdown')) {
          parentItem.setAttribute('data-overflow-source', 'date');
        }
        const submenu = document.createElement('zn-menu');
        submenu.setAttribute('slot', 'submenu');

        const items = dropdown.querySelectorAll<ZnMenuItem>('zn-menu-item');
        if (items.length) {
          items.forEach((original: ZnMenuItem) => {
            const clone = makeProxyClone(original);
            submenu.appendChild(clone);
          });
        } else {
          // No menu items: embed dropdown content (e.g. emoji/date pickers)
          // Move the original content elements to preserve event listeners and third-party initialization.
          const contentCandidates = Array.from(dropdown.children).filter((element: Element) => {
            const isTrigger = (element as HTMLElement).getAttribute('slot') === 'trigger' || element instanceof ZnButton;
            const isMenu = element instanceof ZnMenu || element instanceof ZnMenuItem;
            return !isTrigger && !isMenu;
          });

          const wrapper = document.createElement('div');
          wrapper.className = 'toolbar__submenu-content';
          contentCandidates.forEach((element: HTMLElement) => this.moveContentTo(element, wrapper));
          submenu.appendChild(wrapper);
        }

        parentItem.appendChild(submenu);
      });

      // 2) Direct action buttons (exclude dropdown triggers)
      const buttons = group.querySelectorAll<ZnButton>(
        'zn-button.toolbar__format-button, zn-button.toolbar__action-button'
      );

      buttons.forEach((button: ZnButton) => {
        const icon = button.getAttribute('icon') ?? '';
        const format = button.getAttribute('data-format') ?? '';
        const text =
          button.getAttribute('data-text') ??
          buttonLabelMap[format] ??
          (format
            ? format.charAt(0).toUpperCase() + format.slice(1)
            : button.getAttribute('aria-label') ??
            button.textContent?.trim() ??
            'Action');

        const attrs: Record<string, string> = {'data-format': format};
        const typeVal = button.getAttribute('data-format-type') ?? '';
        if (typeVal) {
          attrs['data-format-type'] = typeVal;
        }
        if (icon) {
          attrs['data-icon'] = icon;
        }
        if (text) {
          attrs['data-text'] = text;
        }

        addMenuItemTo(menu, text, icon, undefined, attrs);
      });

      // 3) Standalone menu items not inside dropdowns
      const standaloneItems = Array.from(group.querySelectorAll<ZnMenuItem>('zn-menu-item')).filter(item => !item.closest('zn-dropdown'));
      standaloneItems.forEach((original: ZnMenuItem) => {
        const clone = makeProxyClone(original);
        menu.appendChild(clone);
      });

      // 4) Slotted elements (when slot group is hidden)
      if (group.querySelector('slot')) {
        const slotElement = group.querySelector('slot') as HTMLSlotElement | null;
        const assigned = slotElement ? slotElement.assignedElements({flatten: true}) : [];
        if (!assigned.length) return;

        assigned.forEach((element: Element) => {
          if (element instanceof ZnEditorTool) {
            const icon = element.icon;
            const text = element.label;
            const format = element.handler || 'dialog';
            const uri = element.uri || '';
            const key = element.key || '';

            const attrs: Record<string, string> = {'data-format': format};
            if (uri) attrs['data-format-type'] = uri;
            if (key) attrs['data-toolbar-key'] = key;
            if (icon) attrs['data-icon'] = icon;
            if (text) attrs['data-text'] = text;

            addMenuItemTo(menu, text, icon, undefined, attrs);
          }
        });
      }
    });
  }

  render() {
    return html`
      <div class="toolbar">
        <div class="toolbar__group">${this._textOptions()}</div>
        <div class="toolbar__group">${this._formatOptions()}</div>
        <div class="toolbar__group">${this._historyOptions()}</div>
        <div class="toolbar__group">${this._colorOptions()}</div>
        <div class="toolbar__group">${this._listOptions()}</div>
        <div class="toolbar__group">
          ${this._insertOptions()}
          ${this._dateOption()}
          ${this._emojiOptions()}
        </div>
        <div class="toolbar__group">
          <slot></slot>
        </div>
        <div class="toolbar__group toolbar__group--overflow">
          <zn-dropdown class="toolbar__overflow" placement="bottom-end">
            <zn-button slot="trigger"
                       class="toolbar__overflow-trigger"
                       color="transparent"
                       size="content"
                       icon="more_horiz"
                       icon-size="18"
                       icon-position="right"></zn-button>
            <zn-menu class="toolbar__overflow-menu"></zn-menu>
          </zn-dropdown>
        </div>
      </div>
    `;
  }

  private _textOptions() {
    return html`
      <zn-dropdown class="toolbar__header-dropdown" placement="bottom-end">
        <zn-button slot="trigger"
                   class="toolbar__dropdown-trigger toolbar__header-dropdown-trigger"
                   color="transparent"
                   icon="arrow_drop_down"
                   icon-size="18"
                   icon-position="right">
          <zn-icon src="match_case" size="18" color="primary"></zn-icon>
        </zn-button>
        <zn-menu>
          <zn-menu-item type="checkbox"
                        checked-position="right"
                        data-format="header"
                        data-format-type="1"
                        data-icon="format_h1">
            <zn-icon src="format_h1" size="18" slot="prefix"></zn-icon>
            Heading 1
          </zn-menu-item>
          <zn-menu-item type="checkbox"
                        checked-position="right"
                        data-format="header"
                        data-format-type="2"
                        data-icon="format_h2">
            <zn-icon src="format_h2" size="18" slot="prefix"></zn-icon>
            Heading 2
          </zn-menu-item>
          <zn-menu-item type="checkbox"
                        checked-position="right"
                        data-format="header"
                        data-format-type=""
                        data-icon="match_case"
                        checked>
            <zn-icon src="match_case" size="18" slot="prefix"></zn-icon>
            Normal
          </zn-menu-item>
        </zn-menu>
      </zn-dropdown>`;
  }

  private _formatOptions() {
    return html`
      ${this._commonFormatOptions()}

      <zn-dropdown class="toolbar__format-dropdown" placement="bottom-end">
        <zn-button slot="trigger"
                   class="toolbar__dropdown-trigger toolbar__format-dropdown-trigger"
                   color="transparent"
                   icon="arrow_drop_down"
                   icon-size="18"
                   icon-position="right">
          <zn-icon src="format_color_text" size="18"></zn-icon>
        </zn-button>
        <zn-menu>
          <zn-menu-item type="checkbox" checked-position="right" data-format="strike">
            <zn-icon src="format_strikethrough" size="18" slot="prefix"></zn-icon>
            Strikethrough
          </zn-menu-item>
          <zn-menu-item type="checkbox" checked-position="right" data-format="blockquote">
            <zn-icon src="format_quote" size="18" slot="prefix"></zn-icon>
            Quote
          </zn-menu-item>
          <zn-menu-item type="checkbox" checked-position="right" data-format="code">
            <zn-icon src="code" size="18" slot="prefix"></zn-icon>
            Code
          </zn-menu-item>
          <zn-menu-item type="checkbox" checked-position="right" data-format="code-block">
            <zn-icon src="code_blocks" size="18" slot="prefix"></zn-icon>
            Code Block
          </zn-menu-item>
          <zn-menu-item data-format="clean">
            <zn-icon src="format_clear" size="18" slot="prefix"></zn-icon>
            Clear Formatting
          </zn-menu-item>
        </zn-menu>
      </zn-dropdown>`;
  }

  private _commonFormatOptions() {
    return html`
      <zn-button class="toolbar__format-button"
                 color="transparent"
                 icon="format_bold"
                 icon-size="18"
                 data-format="bold"></zn-button>
      <zn-button class="toolbar__format-button"
                 color="transparent"
                 icon="format_italic"
                 icon-size="18"
                 data-format="italic"></zn-button>
      <zn-button class="toolbar__format-button"
                 color="transparent"
                 icon="format_underlined"
                 icon-size="18"
                 data-format="underline"></zn-button>`;
  }

  private _historyOptions() {
    return html`
      <zn-button class="toolbar__format-button"
                 color="transparent"
                 icon="undo"
                 icon-size="18"
                 data-format="undo"></zn-button>
      <zn-button class="toolbar__format-button"
                 color="transparent"
                 icon="redo"
                 icon-size="18"
                 data-format="redo"></zn-button>`;
  }

  private _colorOptions() {
    return html`
      <zn-dropdown class="toolbar__color-dropdown" placement="bottom-end">
        <zn-button slot="trigger"
                   class="toolbar__dropdown-trigger toolbar__color-dropdown-trigger"
                   color="transparent"
                   icon="arrow_drop_down"
                   icon-size="18"
                   icon-position="right">
          <zn-icon src="colors" size="18"></zn-icon>
        </zn-button>
        <zn-menu>
          <zn-menu-item data-format="color" data-format-type="">
            <zn-icon slot="prefix" class="color-icon--unset" src="format_color_reset" size="18"></zn-icon>
            Unset
          </zn-menu-item>
          ${colorDataProvider.getData.map((opt) => html`
            <zn-menu-item data-format="color" data-format-type="${opt.key}">
              <div slot="prefix" class="color-icon color-icon--${opt.key}"></div>
              ${opt.value}
            </zn-menu-item>
          `)}
        </zn-menu>
      </zn-dropdown>`;
  }

  private _listOptions() {
    return html`
      <zn-dropdown class="toolbar__list-dropdown" placement="bottom-end">
        <zn-button slot="trigger"
                   class="toolbar__dropdown-trigger toolbar__list-dropdown-trigger"
                   color="transparent"
                   icon="arrow_drop_down"
                   icon-size="18"
                   icon-position="right">
          <zn-icon src="lists" size="18"></zn-icon>
        </zn-button>
        <zn-menu>
          <zn-menu-item type="checkbox"
                        checked-position="right"
                        data-format="list"
                        data-format-type="bullet"
                        data-text="Bulleted List"
                        data-icon="format_list_bulleted">
            <zn-icon src="format_list_bulleted" size="18" slot="prefix"></zn-icon>
            Bulleted
          </zn-menu-item>
          <zn-menu-item type="checkbox"
                        checked-position="right"
                        data-format="list"
                        data-format-type="ordered"
                        data-text="Numbered List"
                        data-icon="format_list_numbered">
            <zn-icon src="format_list_numbered" size="18" slot="prefix"></zn-icon>
            Numbered
          </zn-menu-item>
          <zn-menu-item type="checkbox"
                        checked-position="right"
                        data-format="list"
                        data-format-type="checked"
                        data-text="Checked List"
                        data-icon="checklist">
            <zn-icon src="checklist" size="18" slot="prefix"></zn-icon>
            Checked
          </zn-menu-item>
        </zn-menu>
      </zn-dropdown>`;
  }

  private _insertOptions() {
    return html`
      <zn-dropdown class="toolbar__file-dropdown" placement="bottom-end">
        <zn-button slot="trigger"
                   class="toolbar__dropdown-trigger toolbar__file-dropdown-trigger"
                   color="transparent"
                   icon="arrow_drop_down"
                   icon-size="18"
                   icon-position="right">
          <zn-icon src="add" size="18"></zn-icon>
        </zn-button>
        <zn-menu>
          <zn-menu-item checked-position="right" data-format="divider">
            <zn-icon src="horizontal_rule" size="18" slot="prefix"></zn-icon>
            Divider
          </zn-menu-item>
          <zn-menu-item checked-position="right" data-format="link">
            <zn-icon src="link" size="18" slot="prefix"></zn-icon>
            Link
          </zn-menu-item>
          <zn-menu-item checked-position="right" data-format="attachment">
            <zn-icon src="attachment" size="18" slot="prefix"></zn-icon>
            Attachment
          </zn-menu-item>
          <zn-menu-item checked-position="right" data-format="image">
            <zn-icon src="image" size="18" slot="prefix"></zn-icon>
            Image
          </zn-menu-item>
          <zn-menu-item checked-position="right" data-format="video">
            <zn-icon src="video_camera_back" size="18" slot="prefix"></zn-icon>
            Video
          </zn-menu-item>
        </zn-menu>
      </zn-dropdown>`;
  }

  private _emojiOptions() {
    return html`
      <zn-dropdown class="toolbar__emoji-dropdown" placement="bottom-end">
        <zn-button slot="trigger"
                   class="toolbar__dropdown-trigger toolbar__emoji-dropdown-trigger"
                   color="transparent"
                   icon="arrow_drop_down"
                   icon-size="18"
                   icon-position="right">
          <zn-icon src="insert_emoticon" size="18"></zn-icon>
        </zn-button>
        <div class="emoji-picker"></div>
      </zn-dropdown>`;
  }

  private _dateOption() {
    return html`
      <zn-dropdown class="toolbar__date-dropdown" placement="bottom-end">
        <zn-button slot="trigger"
                   class="toolbar__dropdown-trigger toolbar__date-dropdown-trigger"
                   color="transparent"
                   icon="arrow_drop_down"
                   icon-size="18"
                   icon-position="right">
          <zn-icon src="calendar_today" size="18"></zn-icon>
        </zn-button>
        <div class="date-picker"></div>
      </zn-dropdown>`;
  }
}

ToolbarComponent.define('zn-toolbar');
