import {colorDataProvider} from "../../data-select/providers/color-data-provider";
import {type CSSResultGroup, html, unsafeCSS} from "lit";
import ZincElement from "../../../internal/zinc-element";

import styles from './editor-toolbar.scss';

export default class ZnEditorToolbar extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);


  render() {
    return html`
      <div>
        ${this._textOptions()}
        ${this._formatOptions()}
        ${this._colorOptions()}
        ${this._listOptions()}
        ${this._fileOptions()}
        ${this._emojiOptions()}
      </div>
    `;
  }

  private _textOptions() {
    return html`
      <zn-dropdown class="header__dropdown" placement="bottom-end">
        <zn-button slot="trigger"
                   class="header__dropdown-trigger"
                   color="transparent">
          <span class="header__dropdown-label" data-role="label">Normal</span>
          <zn-icon class="header__dropdown-arrow" src="arrow_drop_down" size="18"></zn-icon>
        </zn-button>
        <zn-menu>
          <zn-menu-item type="checkbox"
                        checked-position="right"
                        data-format="header"
                        data-format-type="1">
            <zn-icon src="format_h1" size="18" slot="prefix"></zn-icon>
            Heading 1
          </zn-menu-item>
          <zn-menu-item type="checkbox"
                        checked-position="right"
                        data-format="header"
                        data-format-type="2">
            <zn-icon src="format_h2" size="18" slot="prefix"></zn-icon>
            Heading 2
          </zn-menu-item>
          <zn-menu-item type="checkbox"
                        checked-position="right"
                        data-format="header"
                        data-format-type=""
                        selected>
            <zn-icon src="text_format" size="18" slot="prefix"></zn-icon>
            Normal
          </zn-menu-item>
        </zn-menu>
      </zn-dropdown>`;
  }

  private _formatOptions() {
    return html`
      <zn-button class="common-format"
                 color="transparent"
                 icon="format_bold"
                 icon-size="18"
                 data-format="bold"></zn-button>
      <zn-button class="common-format"
                 color="transparent"
                 icon="format_italic"
                 icon-size="18"
                 data-format="italic"></zn-button>
      <zn-button class="common-format"
                 color="transparent"
                 icon="format_underlined"
                 icon-size="18"
                 data-format="underline"></zn-button>

      <zn-dropdown class="format__dropdown" placement="bottom-end">
        <zn-button slot="trigger"
                   class="toolbar__dropdown-trigger format__dropdown-trigger"
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

  private _colorOptions() {
    return html`
      <zn-dropdown class="color__dropdown" placement="bottom-end">
        <zn-button slot="trigger"
                   class="toolbar__dropdown-trigger color__dropdown-trigger"
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
      <zn-dropdown class="list__dropdown" placement="bottom-end">
        <zn-button slot="trigger"
                   class="toolbar__dropdown-trigger list__dropdown-trigger"
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

  private _fileOptions() {
    return html`
      <zn-dropdown class="file__dropdown" placement="bottom-end">
        <zn-button slot="trigger"
                   class="toolbar__dropdown-trigger file__dropdown-trigger"
                   color="transparent"
                   icon="arrow_drop_down"
                   icon-size="18"
                   icon-position="right">
          <zn-icon src="add" size="18"></zn-icon>
        </zn-button>
        <zn-menu>
          <zn-menu-item checked-position="right" data-format="link">
            <zn-icon src="link" size="18" slot="prefix"></zn-icon>
            Link
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
      <zn-dropdown class="emoji__dropdown" placement="bottom-end">
        <zn-button slot="trigger"
                   class="toolbar__dropdown-trigger emoji__dropdown-trigger"
                   color="transparent"
                   icon="arrow_drop_down"
                   icon-size="18"
                   icon-position="right">
          <zn-icon src="insert_emoticon" size="18"></zn-icon>
        </zn-button>
        <div class="emoji-picker"></div>
      </zn-dropdown>`;
  }
}
