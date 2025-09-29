import {html, unsafeCSS} from "lit";
import {property, query} from "lit/decorators.js";
import ZincElement from "../../../../../internal/zinc-element";
import type {CSSResultGroup} from "lit";

import styles from './ai-panel.scss';

export default class AIPanelComponent extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @query('.prompt') promptInput!: HTMLTextAreaElement;

  @property({type: Boolean, reflect: true}) open = false;
  @property({type: Function}) refine?: (prompt: string) => void;
  @property({type: Function}) refineBuiltIn?: (e: Event) => void;

  public show() {
    this.open = true;
  }

  public hide() {
    this.open = false;
  }

  private handleTriggerKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();

      const prompt = this.promptInput.value.trim() || '';

      if (this.refine && prompt) {
        this.refine(prompt);

        this.promptInput.value = '';
        this.promptInput.blur();
      }
    }
  }

  render() {
    return html`
      <zn-panel class="ai-panel" flush cosmic>
        <div class="ai-panel__actions">
          <zn-textarea name="prompt"
                       class="prompt"
                       inputmode="text"
                       rows="1"
                       resize="auto"
                       size="small"
                       placeholder="Enter custom prompt"
                       @keydown=${this.handleTriggerKeyDown}></zn-textarea>
          <button
            type="button"
            class="item"
            role="option"
            aria-selected="false"
            data-ai-option="improve"
            @click=${this.refineBuiltIn}
          >
            <zn-icon src="article" size="16"></zn-icon>
            <span class="label">Improve writing</span>
          </button>
          <button
            type="button"
            class="item"
            role="option"
            aria-selected="false"
            data-ai-option="shorten"
            @click=${this.refineBuiltIn}
          >
            <zn-icon src="compress" size="16"></zn-icon>
            <span class="label">Shorten text</span>
          </button>
          <button
            type="button"
            class="item"
            role="option"
            aria-selected="false"
            data-ai-option="tone"
            @click=${this.refineBuiltIn}
          >
            <zn-icon src="work" size="16"></zn-icon>
            <span class="label">Change tone</span>
          </button>
          <button
            type="button"
            class="item"
            role="option"
            aria-selected="false"
            data-ai-option="spelling"
            @click=${this.refineBuiltIn}
          >
            <zn-icon src="spellcheck" size="16"></zn-icon>
            <span class="label">Fix spelling / grammar</span>
          </button>
          <button
            type="button"
            class="item"
            role="option"
            aria-selected="false"
            data-ai-option="translate"
            @click=${this.refineBuiltIn}
          >
            <zn-icon src="translate" size="16"></zn-icon>
            <span class="label">Translate</span>
          </button>
        </div>
      </zn-panel>`;
  }
}

AIPanelComponent.define('zn-ai-panel');
