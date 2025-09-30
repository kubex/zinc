import './panel/ai-panel.component';
import './tooltip/ai-tooltip.component';
import {html} from "lit";
import {litToHTML} from "../../../../utilities/lit-to-html";
import Quill from "quill";
import type {Range} from "quill";
import type AIPanelComponent from "./panel/ai-panel.component";
import type AITooltipComponent from "./tooltip/ai-tooltip.component";

class QuillAI {
  private _quill: Quill;
  private readonly _path: string = '';
  private _component!: AITooltipComponent | AIPanelComponent;
  private _selectedText: string = '';

  constructor(quill: Quill, options: { path: string }) {
    this._quill = quill;
    this._path = options.path;

    this._initComponent();
    this._attachEvents();
  }

  private _initComponent() {
    this._component = this._createTooltipComponent()!;
    this._component.addEventListener('click', (e: Event) => this._replaceTooltip(e));
    this._quill.container.ownerDocument.body.appendChild(this._component);
  }

  private _attachEvents() {
    this._quill.on(Quill.events.SELECTION_CHANGE, (range, oldRange) => this._updateFromEditor(range, oldRange));
  }

  async processAIRequest(prompt: string) {
    const quotedSelectedText = this._selectedText ? this._selectedText : this._quill.getText();

    const panel: HTMLElement | null | undefined = this._component.shadowRoot?.querySelector('.ai-panel');
    if (panel) {
      // Loading skeletons - TODO: Fix up height and transitions between states
      panel.innerHTML = `<zn-skeleton height="200px" speed="2s" style="margin: 15px 10px;"></zn-skeleton>`;
      panel.style.width = '100%';
    }

    const response = await fetch(this._path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-kx-fetch-style': 'zn-editor',
      },
      body: JSON.stringify({text: quotedSelectedText, prompt: prompt})
    });

    // TODO: Remove event when done
    // this._component.removeEventListener('click', this._clickPanelEvent());

    if (response.ok) {
      const result: unknown = await response.text();
      if (panel) {
        // TODO: Add resizing animation
        panel.style.width = '300px';
        panel.innerHTML = result as string;

        const actionButtons = document.createElement('div');
        actionButtons.style.display = 'flex';
        actionButtons.style.justifyContent = 'space-between';
        actionButtons.style.gap = '10px';
        actionButtons.style.padding = '10px';

        const acceptButton = document.createElement('zn-split-button');
        acceptButton.setAttribute('name', 'button');
        acceptButton.setAttribute('value', 'replace-text');
        acceptButton.setAttribute('caption', 'Replace');
        acceptButton.setAttribute('class', 'ml-auto');
        acceptButton.setAttribute('slot', 'actions');

        const menu = document.createElement('zn-menu');
        menu.setAttribute('slot', 'menu');

        const menuItem = document.createElement('zn-menu-item');
        menuItem.setAttribute('value', 'insert-text');
        menuItem.textContent = 'Insert';

        menu.appendChild(menuItem);
        acceptButton.appendChild(menu);

        acceptButton.addEventListener('click', () => {
          const range = this._quill.getSelection();
          if (range) {
            this._quill.deleteText(range.index, range.length);
            this._quill.insertText(range.index, panel?.innerText || '');
            this._quill.setSelection(range.index + (panel?.innerText.length || 0), 0);
          }
          this.resetComponent();
        });

        const retryButton = document.createElement('zn-button');
        retryButton.setAttribute('variant', 'secondary');
        retryButton.textContent = 'Retry';
        retryButton.addEventListener('click', () => {
          this.processAIRequest(prompt).then(r => r);
        });

        actionButtons.appendChild(retryButton);
        actionButtons.appendChild(acceptButton);
        panel.appendChild(actionButtons);

        // Reposition panel after content change
        this._positionComponent();
      }
    } else {
      const result: unknown = await response.json();

      if (typeof result === 'string') {
        const range = this._quill.getSelection();
        if (range) {
          this._quill.deleteText(range.index, range.length);
          this._quill.insertText(range.index, result);
          this._quill.setSelection(range.index + result.length, 0);
        }
      }
    }
  }

  private _createTooltipComponent() {
    const tpl = html`
      <zn-ai-tooltip></zn-ai-tooltip>`;
    return litToHTML<AITooltipComponent>(tpl);
  }

  private _createPanelComponent() {
    const tpl = html`
      <zn-ai-panel></zn-ai-panel>`;
    return litToHTML<AIPanelComponent>(tpl);
  }

  private _replaceTooltip(e: Event) {
    e.preventDefault();
    e.stopPropagation();

    this._component.remove();

    const panel = this._createPanelComponent();
    if (!panel) return;

    this._component = panel;
    this._component.requestUpdate();

    // Attach panel button triggers
    this._attachPanelEvents(panel);

    this._quill.container.ownerDocument.body.appendChild(this._component);
    this._show();
    this._positionComponent();
  }

  private _onDocumentClick(e: MouseEvent) {
    const path = e.composedPath ? e.composedPath() : [e.target as Node];
    if (
      !path.includes(this._component) &&
      !path.includes(this._component.shadowRoot!) &&
      this._component.shadowRoot !== null &&
      !this._quill.root.contains(path[0] as Node)
    ) {
      this.resetComponent();
    }
  }

  private _updateFromEditor(range: Range, oldRange: Range) {
    // Only display 'refine' option for selections longer than 25 characters
    if (range?.length > 0) {
      // Keep selected text in memory to be passed to AI later
      this._selectedText = this._quill.getText(range.index, range.length);

      this._show();
      this._positionComponent();
      return;
    }

    // Reset component if editor selection is changed
    if (oldRange === null) {
      this.resetComponent();
    }
  }

  private _positionComponent() {
    if (!this._component || !this._component.open) return;

    const range = this._quill.getSelection();
    if (!range) return;

    const positionTooltip = () => {
      const editorBounds = this._quill.container.getBoundingClientRect();
      let bounds;
      if (range.length === this._quill.getLength() - 1) {
        bounds = this._quill.getBounds(range.index, range.length);
      } else {
        const endIndex = range.index + range.length;
        bounds = this._quill.getBounds(endIndex);
      }
      if (!bounds) return;

      const right = editorBounds.left + bounds.right; // Align right side
      const top = editorBounds.top + bounds.top - this._component.offsetHeight - 4; // Position above the selection

      if (right + this._component.offsetWidth > window.innerWidth) {
        this._setPosition(window.innerWidth - this._component.offsetWidth - 10, top);
        return;
      }

      this._setPosition(right - this._component.offsetWidth, top);
    };

    // Defer positioning to ensure the component is fully rendered
    requestAnimationFrame(positionTooltip);
  }

  private _setPosition(left: number, top: number) {
    this._component.style.left = `${Math.max(0, left)}px`;
    this._component.style.top = `${top}px`;
  }

  private resetComponent() {
    this._hide();
    this._component.remove();
    this._initComponent();
  }

  private _show() {
    if (!this._component.open) {
      this._component.show();
      this._quill.container.ownerDocument.addEventListener('click', (e: MouseEvent) => this._onDocumentClick(e));
      this._quill.container.ownerDocument.addEventListener('keydown', this._onEscapeKey);
    }
  }

  private _hide() {
    this._component.hide();
    this._quill.container.ownerDocument.removeEventListener('click', (e: MouseEvent) => this._onDocumentClick(e));
    this._quill.container.ownerDocument.removeEventListener('keydown', this._onEscapeKey);
  }

  private _onEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      this._hide();
      this._component.remove();
      this._initComponent();
    }
  }

  private _attachPanelEvents(panel: AIPanelComponent) {
    panel.refine = this._clickPanelEvent.bind(this);
    panel.refineBuiltIn = this._clickPreDefinedEvent.bind(this);
  }

  private _clickPreDefinedEvent(e: Event) {
    if (e instanceof PointerEvent) {
      const target = e.target as HTMLElement;
      let prompt = target.getAttribute('data-ai-option') || '';
      if (prompt === "") {
        for (const targetElement of e.composedPath()) {
          if (!(targetElement instanceof HTMLElement)) continue;
          prompt = targetElement.getAttribute('data-ai-option') || ''
          if (prompt) break;
        }
      }
      this.processAIRequest(prompt).then(r => r);
    }
  }

  private _clickPanelEvent(prompt: string) {
    this.processAIRequest(prompt).then(r => r);
  }
}

export default QuillAI;
