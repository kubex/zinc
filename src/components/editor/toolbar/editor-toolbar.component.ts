import {html} from "lit";
import {litToHTML} from "../../../utilities/lit-to-html";
import ZincElement from "../../../internal/zinc-element";
import type Quill from "quill";
import type ZnDropdown from "../../dropdown";

export default class ZnEditorToolbar extends ZincElement {
  public quill: Quill;

  render() {
    console.log(this.quill);

    return html`
      <div>
        ${this._textOptions()}
        ${this._formatOptions()}
        ${this._listOptions()}
      </div>
    `;
  }

  private _textOptions() {
    const textOptions = html`
      <zn-dropdown class="header__dropdown" placement="bottom-end">
        <zn-button slot="trigger"
                   class="header__dropdown-trigger"
                   color="transparent"
                   icon="arrow_drop_down"
                   icon-size="18"
                   icon-position="right">
          Normal Text
        </zn-button>
        <zn-menu selected-label-trigger>
          <zn-menu-item type="checkbox"
                        checked-position="right"
                        data-format="header"
                        data-format-type="1"
                        @click="${this._handleOptionClicked}">
            <zn-icon src="format_h1" size="18" slot="prefix"></zn-icon>
            Heading 1
          </zn-menu-item>
          <zn-menu-item type="checkbox"
                        checked-position="right"
                        data-format="header"
                        data-format-type="2"
                        @click="${this._handleOptionClicked}">
            <zn-icon src="format_h2" size="18" slot="prefix"></zn-icon>
            Heading 2
          </zn-menu-item>
          <zn-menu-item type="checkbox"
                        checked-position="right"
                        data-format="header"
                        selected
                        @click="${this._handleOptionClicked}">
            <zn-icon src="text_format" size="18" slot="prefix"></zn-icon>
            Normal Text
          </zn-menu-item>
        </zn-menu>
      </zn-dropdown>`
    return litToHTML<ZnDropdown>(textOptions);
  }

  private _formatOptions() {
    const formatOptions = html`
      <span>
        <zn-button color="transparent" icon="format_bold" icon-size="18" data-format="bold"></zn-button>
        <zn-button color="transparent" icon="format_italic" icon-size="18" data-format="italic"></zn-button>
        <zn-button color="transparent" icon="format_underlined" icon-size="18" data-format="underline"></zn-button>

        <zn-dropdown class="format__dropdown" placement="bottom-end">
          <zn-button slot="trigger"
                     class="format__dropdown-trigger"
                     color="transparent"
                     icon="arrow_drop_down"
                     icon-size="18"
                     icon-position="right">
            Formatting
          </zn-button>
          <zn-menu selected-label-trigger>
            <zn-menu-item type="checkbox" checked-position="right" data-format="strike">
              <zn-icon src="format_strikethrough" size="18" slot="prefix"></zn-icon>
              Strikethrough
            </zn-menu-item>
            <zn-menu-item data-format="clean">
              <zn-icon src="format_clear" size="18" slot="prefix"></zn-icon>
              Clear Formatting
            </zn-menu-item>
          </zn-menu>
        </zn-dropdown>
      </span>`
    return litToHTML<HTMLSpanElement>(formatOptions);
  }

  private _listOptions() {
    const listOptions = html`
      <zn-dropdown class="list__dropdown" placement="bottom-end">
        <zn-button slot="trigger"
                   class="list__dropdown-trigger"
                   color="transparent"
                   icon="arrow_drop_down"
                   icon-size="18"
                   icon-position="right">
          Lists
        </zn-button>
        <zn-menu selected-label-trigger>
          <zn-menu-item type="checkbox"
                        checked-position="right"
                        data-format="list"
                        data-format-type="bullet"
                        data-list="Bulleted List">
            <zn-icon src="format_list_bulleted" size="18" slot="prefix"></zn-icon>
            Bulleted
          </zn-menu-item>
          <zn-menu-item type="checkbox"
                        checked-position="right"
                        data-format="list"
                        data-format-type="ordered"
                        data-text="Numbered List">
            <zn-icon src="format_list_numbered" size="18" slot="prefix"></zn-icon>
            Numbered
          </zn-menu-item>
          <zn-menu-item type="checkbox"
                        checked-position="right"
                        data-format="list"
                        data-format-type="check"
                        data-text="Checked List">
            <zn-icon src="checklist" size="18" slot="prefix"></zn-icon>
            Checked
          </zn-menu-item>
        </zn-menu>
      </zn-dropdown>`
    return litToHTML<ZnDropdown>(listOptions);
  }

  private _handleOptionClicked = (e: Event) => {
    const menuItem = e.target as HTMLElement;

    if (menuItem.tagName !== 'ZN-MENU-ITEM') return;

    const label = menuItem.getAttribute('data-text') ?? menuItem.textContent?.trim();

    // Locate the closest dropdown from the clicked item (not from the toolbar itself)
    let parent: HTMLElement | null = menuItem as HTMLElement;
    let dropdown: HTMLElement | null = null;
    let depth = 0;
    const maxDepth = 30;
    while (parent && depth < maxDepth) {
      if (parent.tagName && parent.tagName.toLowerCase() === 'zn-dropdown') {
        dropdown = parent;
        break;
      }
      parent = parent.parentElement || (parent.getRootNode() instanceof ShadowRoot ? (parent.getRootNode() as ShadowRoot).host as HTMLElement : null);
      depth++;
    }

    const button = dropdown?.querySelector('zn-button[slot="trigger"]') as HTMLElement | null;

    if (button && label) {
      button.textContent = label;
    }
  }
}
