import './panel/ai-panel.component';
import './tooltip/ai-tooltip.component';
import {html} from "lit";
import {litToHTML} from "../../../../utilities/lit-to-html";
import Quill from "quill";
import type {Range} from "quill";
import type AIPanelComponent from "./panel/ai-panel.component";
import AITooltipComponent from "./tooltip/ai-tooltip.component";
import ZnTextarea from "../../../textarea";

class QuillAI {
  private _quill: Quill;
  private readonly _path: string = '';
  private _component!: AITooltipComponent | AIPanelComponent;
  private _selectedText: string = '';
  private _prompt: string = '';
  private _aiResponseContent: string = '';

  constructor(quill: Quill, options: { path: string }) {
    this._quill = quill;
    this._path = options.path;

    this._initComponent();
    this._attachEvents();
  }

  public replaceTextAtSelection() {
    const content = this._latestContent(null);
    const range = this._quill.getSelection();
    if (range) {
      this._quill.deleteText(range.index, range.length);
      this._quill.insertText(range.index, content || '');
      this._quill.setSelection(range.index + (content.length || 0), 0);
    }
    this.resetComponent();
  }

  public insertTextAtSelection() {
    const content = this._latestContent(null);
    const range = this._quill.getSelection();
    if (range) {
      this._quill.insertText(range.index, content || '');
      this._quill.setSelection(range.index + (content.length || 0), 0);
    }
    this.resetComponent();
  }

  private _initComponent() {
    this._component = this._createTooltipComponent()!;
    this._component.addEventListener('click', (e: Event) => this._replaceTooltip(e));
    this._quill.container.ownerDocument.body.appendChild(this._component);
  }

  private _attachEvents() {
    this._quill.on(Quill.events.SELECTION_CHANGE, (range) => this._updateFromEditor(range));
  }

  private _latestContent(panel: HTMLElement | null | undefined): string {
    if (panel === null || panel === undefined) {
      panel = this._component.shadowRoot?.querySelector('.ai-panel');
    }
    if (panel) {
      const ele = panel.querySelector('[name="editor-response-text"]')
      if (ele instanceof HTMLInputElement || ele instanceof ZnTextarea) {
        return ele.value;
      }
    }
    return this._aiResponseContent
  }

  async processAIRequest() {
    const quotedSelectedText = this._selectedText ? this._selectedText : this._quill.getText();

    const panel: HTMLElement | null | undefined = this._component.shadowRoot?.querySelector('.ai-panel');
    if (panel) {
      // Loading skeletons - TODO: Fix up height and transitions between states
      panel.innerHTML = `<zn-skeleton height="200px" speed="2s" style="margin: 15px 10px;"></zn-skeleton>`;
      // panel.style.width = '100%';
    }

    const response = await fetch(this._path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-kx-fetch-style': 'zn-editor',
      },
      body: JSON.stringify({text: quotedSelectedText, prompt: this._prompt})
    });

    if (response.ok) {
      const result: unknown = await response.text();
      if (panel) {
        panel.style.width = '500px';
        panel.innerHTML = result as string;

        this._aiResponseContent = this._latestContent(panel);

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

  private _updateFromEditor(range: Range) {
    // Only display 'refine' option for selections longer than 25 characters
    if (range?.length > 25) {
      // Keep selected text in memory to be passed to AI later
      this._selectedText = this._quill.getText(range.index, range.length);

      this._show();
      this._positionComponent();
    } else {
      this.resetComponent();
    }
  }

  private _positionComponent() {
    if (!this._component || !this._component.open) return;

    const range = this._quill.getSelection();
    if (!range) return;

    if (this._component instanceof AITooltipComponent) {
      const editorBounds = this._quill.container.getBoundingClientRect();
      const endIndex = range.index + range.length;
      const bounds = this._quill.getBounds(endIndex);
      if (!bounds) return;

      const left = editorBounds.left + bounds.left - 10; // Slight offset to the left
      const top = editorBounds.top + bounds.bottom + 4;
      this._setPosition(left, top);

      return;
    }

    const positionPanel = () => {
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
      const top = editorBounds.top + bounds.top - this._component.offsetHeight - 8; // Position above the selection

      if (right + this._component.offsetWidth > window.innerWidth) {
        this._setPosition(window.innerWidth - this._component.offsetWidth - 10, top);
        return;
      }


      this._setPosition(right - this._component.offsetWidth, top);
    };

    // Defer positioning to ensure the panel is fully rendered
    requestAnimationFrame(positionPanel);
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
      this._prompt = target.getAttribute('data-ai-option') || '';
      if (this._prompt === "") {
        for (const targetElement of e.composedPath()) {
          if (!(targetElement instanceof HTMLElement)) continue;
          this._prompt = targetElement.getAttribute('data-ai-option') || ''
          if (this._prompt) break;
        }
      }
      this.processAIRequest().then(r => r);
    }
  }

  private _clickPanelEvent() {
    this.processAIRequest().then(r => r);
  }
}

export default QuillAI;
