import {type CSSResultGroup, html, unsafeCSS} from "lit";
import {property} from "lit/decorators.js";
import ZincElement from "../../../../../internal/zinc-element";

import styles from './tool.scss';

export default class ZnEditorTool extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() uri: string;
  @property() key: string;
  @property() icon: string;
  @property() handler: string = 'dialog';

  render() {
    return html`
      <zn-button class="tool-action"
                 color="transparent"
                 icon="${this.icon}"
                 icon-size="18"
                 data-format="${this.handler}"
                 data-format-type="${this.uri}"
                 data-toolbar-key="${this.key}"></zn-button>
      <div class="${this.handler}"></div>`
  }
}

ZnEditorTool.define('zn-editor-tool');
