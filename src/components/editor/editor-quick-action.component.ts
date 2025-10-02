import {html} from "lit";
import {property} from "lit/decorators.js";
import ZincElement from "../../internal/zinc-element";

export default class ZnEditorQuickAction extends ZincElement {
  @property() uri: string;
  @property() caption: string;
  @property() description: string;
  @property() key: string;

  render() {
    return html`
      <div></div>`
  }
}
