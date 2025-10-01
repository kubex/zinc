import {html} from "lit";
import {litToHTML} from "../../../../utilities/lit-to-html";
import AIPanelComponent from './panel/ai-panel.component';
import AITooltipComponent from "./tooltip/ai-tooltip.component";
import Quill from "quill";
import ZnTextarea from "../../../textarea";
import type {Range} from "quill";

class QuillAI {
  private _quill: Quill;
  private readonly _path: string = '';
  private _component!: AITooltipComponent | AIPanelComponent;
  private _range: Range = {index: 0, length: 0};
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
    if (this._range) {
      this._quill.deleteText(this._range.index, this._range.length);
      this._quill.insertText(this._range.index, content || '');
      this._quill.setSelection(this._range.index + (content.length || 0), 0);
    }
    this._resetComponent();
  }

  public insertTextAtSelection() {
    const content = this._latestContent(null);
    if (this._range) {
      this._quill.insertText(this._range.index, content || '');
      this._quill.setSelection(this._range.index + (content.length || 0), 0);
    }
    this._resetComponent();
  }

  private _initComponent() {
    this._component = this._createTooltipComponent()!;
    this._component.addEventListener('click', (e: Event) => this._replaceTooltip(e));
    this._quill.container.ownerDocument.body.appendChild(this._component);
  }

  private _attachEvents() {
    this._quill.on(Quill.events.SELECTION_CHANGE, (range, oldRange) => this._updateFromEditor(range, oldRange));
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
    const isInsideComponent = path.includes(this._component) || path.includes(this._component.shadowRoot!);
    const isInsideQuillRoot = this._quill.root.contains(path[0] as Node);

    const isInsideAIPanel = path.some((node) => {
      if (node instanceof HTMLElement) {
        return node.tagName === 'ZN-AI-PANEL';
      }
      return false;
    });

    if (!isInsideComponent && !isInsideQuillRoot && !isInsideAIPanel) {
      this._resetComponent();
    }
  }

  private _updateFromEditor(range: Range, oldRange: Range) {
    this._range = range?.length > 0 ? range : oldRange;

    // Update if component isn't AI panel
    if (this._component instanceof AIPanelComponent) return;

    // Display 'refine' option for selections longer than 25 characters
    if (range?.length > 25) {
      // Keep selected text in memory to be passed to AI later
      this._selectedText = this._quill.getText(range.index, range.length);

      this._show();
      this._positionComponent();
    } else {
      this._resetComponent();
    }
  }

  private _positionComponent() {
    if (!this._component || !this._component.open) return;

    if (!this._range) return;

    if (this._component instanceof AITooltipComponent) {
      const editorBounds = this._quill.container.getBoundingClientRect();
      const endIndex = this._range.index + this._range.length;
      const bounds = this._quill.getBounds(endIndex);
      if (!bounds) return;

      const left = editorBounds.left + bounds.left - 10; // Slight offset to the left
      const top = editorBounds.top + bounds.bottom + 4;

      this._component.style.left = `${Math.max(0, left)}px`;
      this._component.style.top = `${top}px`;

      return;
    }

    const positionPanel = () => {
      const editorBounds = this._quill.container.getBoundingClientRect();
      let bounds;
      if (this._range.length === this._quill.getLength() - 1) {
        bounds = this._quill.getBounds(this._range.index, this._range.length);
      } else {
        const endIndex = this._range.index + this._range.length;
        bounds = this._quill.getBounds(endIndex);
      }
      if (!bounds) return;

      const right = editorBounds.left + bounds.right; // Align right side
      const bottom = editorBounds.top + bounds.top - 8; // Position above the selection

      if (right > window.innerWidth) {
        this._setPanelPosition(window.innerWidth - 10, bottom);
        return;
      }

      this._setPanelPosition(right, bottom);
    };

    // Defer positioning to ensure the panel is fully rendered
    requestAnimationFrame(positionPanel);
  }

  private _setPanelPosition(right: number, bottom: number) {
    this._component.style.right = `${Math.max(0, window.innerWidth - right)}px`;
    this._component.style.bottom = `${Math.max(0, window.innerHeight - bottom)}px`;
  }

  private _resetComponent() {
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
