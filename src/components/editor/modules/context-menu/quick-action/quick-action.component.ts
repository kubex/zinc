import {html} from "lit";
import {property} from "lit/decorators.js";
import ZincElement from "../../../../../internal/zinc-element";

export default class ZnEditorQuickAction extends ZincElement {
  @property() uri: string;
  @property() label: string;
  @property() content: string;
  @property() key: string;
  @property() icon: string;
  @property({type: Number}) order?: number | null;

  render() {
    return html`
      <div style="display: none;"></div>`
  }
}

ZnEditorQuickAction.define('zn-editor-quick-action');
