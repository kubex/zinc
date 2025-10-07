import {html} from "lit";
import {property} from "lit/decorators.js";
import ZincElement from "../../../internal/zinc-element";

export default class ZnEditorQuickAction extends ZincElement {
  @property() uri: string;
  @property() caption: string;
  @property() description: string;
  @property() key: string;
  @property() icon: string;

  render() {
    return html`
      <div
        data-quick-action
        data-caption="${this.caption}"
        data-description="${this.description}"
        data-key="${this.key}"
        data-uri="${this.uri}"
        data-icon="${this.icon}"
        style="display: none;"
      ></div>`
  }
}

ZnEditorQuickAction.define('zn-editor-quick-action');
