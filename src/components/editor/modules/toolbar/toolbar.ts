import './toolbar.component';
import Quill from "quill";
import QuillToolbar from "quill/modules/toolbar";
import type DialogComponent from "../dialog/dialog.component";
import type Emoji from "../emoji/emoji";
import type ToolbarComponent from "./toolbar.component";
import type ZnDropdown from "../../../dropdown";
import type ZnMenuItem from "../../../menu-item";

class Toolbar extends QuillToolbar {
  private readonly _quill: Quill;
  private readonly _component: ToolbarComponent;
  private _lastDialogUri?: string;
  private _formatters: Element[] = [];

  constructor(quill: Quill, options: {
    container: ToolbarComponent;
    handlers?: Record<string, (value?: any) => void>;
  }) {
    super(quill, options);

    // Add handlers after parent Toolbar initialization
    this.addHandler('attachment', () => null);
    this.addHandler('date', () => this._openDatePicker());
    this.addHandler('divider', () => this._insertDivider());
    this.addHandler('redo', () => quill.history.redo());
    this.addHandler('undo', () => quill.history.undo());
    this.addHandler('dialog', (value: string) => this._openDialog(value));
    this.addHandler('image', () => this._addImage());

    this._quill = quill;
    this._component = options.container;

    this._component.updateComplete.then(() => {
      this._attachToolbarHandlers();
      this._syncToolbarState = this._syncToolbarState.bind(this);
      this._component.addEventListener('zn-toolbar-overflow-updated', this._handleOverflowUpdate);

      if (quill) {
        quill.on('selection-change', this._syncToolbarState);
        quill.root?.addEventListener('click', this._syncToolbarState);
        quill.on('text-change', this._syncToolbarState);
        this._syncToolbarState();
      }
    });
  }

  public callFormat(key: string, value?: string | boolean | undefined) {
    const handler = (this.handlers?.[key] as ((value?: any) => void) | undefined);
    if (value === undefined) {
      if (key === 'header' || key === 'color') {
        value = false; // False for text normal or default color
      }
      if (key === 'link') {
        value = true; // True for creating a link
      }
    }
    if (typeof handler === 'function') {
      handler.call(this, value);
      return;
    }
    if (key === 'clean') {
      const range = this._quill.getSelection();
      if (range) {
        this._quill.removeFormat(range.index, range.length || 0);
      } else {
        this._quill.removeFormat(0, this._quill.getLength());
      }
      return;
    }
    const range = this._quill.getSelection();
    const formats: Record<string, unknown> = range ? this._quill.getFormat(range) : {};
    const current = formats[key];
    const next: boolean | string | number = value !== undefined ? value as boolean | string | number : !(current as boolean);
    this._quill.format(key, next);
  }

  public trigger(key: string) {
    const container = this.container;
    if (!container) return;

    const matches = this._formatters.filter(
      formatter => formatter.getAttribute('data-toolbar-key') === key && formatter.tagName === 'ZN-BUTTON'
    );

    const tool = (matches?.length ? (matches[0] as HTMLElement) : null);
    if (tool) {
      tool.click();
      return;
    }

    const shadowRoot = this._component.shadowRoot;
    const element = shadowRoot?.querySelector(`[data-toolbar-key="${key}"]`) as HTMLElement | null;
    if (element) {
      const format = element.getAttribute('data-format');
      const type = element.getAttribute('data-format-type') ?? undefined;
      if (format) {
        this.callFormat(format, type);
      }
    }
  }

  private _attachToolbarHandlers() {
    const shadowRoot = this._component.shadowRoot;
    const shadowFormatters = shadowRoot?.querySelectorAll('[data-format]') ?? [];
    const slottedFormatters: Element[] = [];
    const slot = shadowRoot?.querySelector('slot');
    if (slot) {
      const assigned = slot.assignedElements({flatten: true});
      assigned.forEach(element => {
        const formatElement = element.shadowRoot?.querySelector('[data-format]');
        if (formatElement) {
          slottedFormatters.push(formatElement);
        }
      });
    }

    this._formatters = [...shadowFormatters, ...slottedFormatters];

    if (shadowRoot) {
      shadowRoot.addEventListener('click', this._onToolbarClick);
    }
  }

  private _onToolbarClick = (e: Event) => {
    const path = (e.composedPath()) || [];
    let targetEl: HTMLElement | null = null;

    for (const node of path as EventTarget[]) {
      if (node instanceof HTMLElement) {
        if (node.hasAttribute && node.hasAttribute('data-format')) {
          targetEl = node;
          break;
        }
      }
    }
    if (!targetEl) return;

    const format = targetEl.getAttribute('data-format');
    if (!format) return;

    const type: string | undefined = targetEl.getAttribute('data-format-type') ?? undefined;
    this.callFormat(format, type);
  }

  private _syncToolbarState() {
    if (!this._quill) return;

    const range = this._quill.getSelection();
    if (!range) return;

    const formats: Record<string, any> = this._quill.getFormat(range);
    if (!formats) return;

    this._syncButtonState('format_bold', !!formats.bold);
    this._syncButtonState('format_italic', !!formats.italic);
    this._syncButtonState('format_underlined', !!formats.underline);

    this._updateHeadingFormatMenu(formats);
    this._updateListFormatMenu(formats);
    this._updateTextFormatMenu(formats);
    this._updateColorFormatMenu(formats);

    this._updateDropdownTrigger('zn-dropdown.toolbar__header-dropdown', 'match_case');
    this._updateDropdownTrigger('zn-dropdown.toolbar__list-dropdown', 'lists');
  }

  private _updateHeadingFormatMenu(formats: Record<string, any>) {
    const wanted = formats.header ? String(formats.header) : ''; // Empty string for text normal
    this._updateMenuCheckedState('zn-dropdown.toolbar__header-dropdown zn-menu zn-menu-item[data-format]', 'data-format-type', wanted);
  }

  private _updateListFormatMenu(formats: Record<string, any>) {
    const list = formats.list as string | null;
    const listValue = (list === 'ordered' || list === 'bullet' || list === 'checked') ? list : null;
    this._updateMenuCheckedState('zn-dropdown.toolbar__list-dropdown zn-menu zn-menu-item[data-format]', 'data-format-type', listValue);
  }

  private _updateTextFormatMenu(formats: Record<string, any>) {
    const selector = 'zn-dropdown.toolbar__format-dropdown zn-menu zn-menu-item[data-format]';
    const attr = 'data-format';
    const wanted = this._getTextFormats(formats);

    this._updateMenuCheckedState(selector, attr, wanted);
  }

  private _updateColorFormatMenu(formats: Record<string, any>) {
    const color = (typeof formats.color === 'string') ? formats.color : '';
    this._updateMenuCheckedState('zn-dropdown.toolbar__color-dropdown zn-menu zn-menu-item[data-format]', 'data-format-type', color);
  }

  private _getTextFormats(formats: Record<string, any>) {
    const wanted: string[] = [];
    if (formats.strike) {
      wanted.push('strike');
    }
    if (formats.blockquote) {
      wanted.push('blockquote');
    }
    if (formats.code) {
      wanted.push('code');
    }
    if (Object.prototype.hasOwnProperty.call(formats, 'code-block')) {
      wanted.push('code-block');
    }
    return wanted;
  }

  private _updateMenuCheckedState(selector: string, matchAttr: string, wanted: string | string[] | null) {
    const items = this._component.shadowRoot?.querySelectorAll(selector) as NodeListOf<ZnMenuItem> | undefined;
    if (!items?.length) return;

    const wantedValues: string[] = wanted === null ? [] : Array.isArray(wanted) ? wanted : [wanted];

    items.forEach((item: ZnMenuItem) => {
      const value = item.getAttribute(matchAttr) ?? '';
      if (item.getAttribute('type') === 'checkbox') {
        item.checked = wantedValues.includes(value);
      }
    });
  }

  private _updateDropdownTrigger(dropdownSelector: string, defaultIconSrc: string) {
    const shadowRoot = this._component.shadowRoot;
    const dropdown = shadowRoot?.querySelector(dropdownSelector) as HTMLElement | null;
    if (!dropdown) return;

    const trigger = dropdown.querySelector('zn-button[slot="trigger"]') as HTMLElement | null;
    if (!trigger) return;

    const menu = dropdown.querySelector('zn-menu');
    const items = menu?.querySelectorAll('zn-menu-item') as NodeListOf<ZnMenuItem> | undefined;

    let iconSrc = defaultIconSrc;
    let iconColor = 'default';
    if (items?.length) {
      items.forEach((item: ZnMenuItem) => {
        const checked = item.checked ?? (item.hasAttribute('checked'));
        if (checked) {
          const icon = item.querySelector('zn-icon')!;
          iconSrc = icon?.getAttribute('src') ?? iconSrc;
          iconColor = 'primary';
        }
      });
    }

    trigger.innerHTML = `<zn-icon src="${iconSrc}" color="${iconColor}" size="18"></zn-icon>`;
  }

  private _syncButtonState(icon: string, active: boolean) {
    const button = this._component.shadowRoot?.querySelector(`zn-button[icon="${icon}"]`) as HTMLElement | null;
    if (!button) return;
    if (active) {
      button.classList.add('ql-active');
      button.setAttribute('icon-color', 'primary');
    } else {
      button.classList.remove('ql-active');
      button.removeAttribute('icon-color');
    }
  }

  private _insertDivider() {
    if (!this._quill) return;

    const selection = this._quill.getSelection(true);
    let index = selection ? selection.index + selection.length : this._quill.getLength();

    const prevChar = index > 0 ? this._quill.getText(index - 1, 1) : '\n';
    if (prevChar !== '\n') {
      this._quill.insertText(index, '\n', Quill.sources.USER);
      index += 1;
    }

    this._quill.insertEmbed(index, 'hr', true, Quill.sources.USER);
    this._quill.insertText(index + 1, '\n', Quill.sources.USER);
    this._quill.setSelection(index + 1, 0, Quill.sources.USER);

    this._syncToolbarState();
  }

  private _openDatePicker() {
    const shadow = this._component.shadowRoot;
    if (!shadow) return;

    const button = shadow.querySelector(`zn-button.toolbar__date-dropdown-trigger`) as HTMLElement | null;
    const isVisible = (el: HTMLElement | null) => (el?.offsetParent !== null);

    if (isVisible(button)) {
      button!.click();
      return;
    }

    const overflowDropdown = shadow.querySelector('zn-dropdown.toolbar__overflow') as ZnDropdown | null;
    if (overflowDropdown) {
      overflowDropdown.show().then();

      const overflowMenu = shadow.querySelector('.toolbar__overflow-menu') as HTMLElement | null;
      const dateParentItem = overflowMenu?.querySelector('zn-menu-item[data-overflow-source="date"]') as HTMLElement | null;

      if (dateParentItem) {
        // Trigger submenu open by simulating hover/focus
        dateParentItem.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
        dateParentItem.focus?.();
      }
    }
  }

  private _openDialog(uri: string) {
    if (this._lastDialogUri === uri) {
      const dialog = document.querySelector(`zn-editor-dialog`) as DialogComponent | null;
      if (!dialog) return;

      dialog.dialogEl.showModal();
    }

    const dialog = document.querySelector(`zn-editor-dialog`) as DialogComponent | null;
    if (!dialog) return;

    dialog.dialogEl.showModal();
    dialog.setContent(`<app-space id="app-editor-modal" allow-scripts auto-load uri="${uri}"></app-space>`);
  }

  private _handleOverflowUpdate = () => {
    const emoji = this._quill.getModule('emoji') as Emoji;
    emoji?.initPicker();
  }

  private _addImage() {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file?.type || !file.type.startsWith('image/')) return;

      const reader = new window.FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const selection = this._quill.getSelection(true);
        const index = selection ? selection.index + selection.length : this._quill.getLength();

        this._quill.insertEmbed(index, 'image', dataUrl, Quill.sources.USER);

        const root = this._quill.root as HTMLElement;
        const images = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
        const inserted = images.reverse().find(img => img.getAttribute('src') === dataUrl) || null;
        if (inserted) {
          inserted.setAttribute('alt', file.name);
          inserted.setAttribute('title', file.name);
        }

        this._quill.setSelection(index + 1, 0, Quill.sources.USER);
        this._syncToolbarState();
      };
      reader.readAsDataURL(file);
    }
  }
}

export default Toolbar;
