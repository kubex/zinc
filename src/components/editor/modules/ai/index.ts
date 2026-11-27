import {html} from "lit";
import {litToHTML} from "../../../../utilities/lit-to-html";
import AIPanelComponent from './panel/ai-panel.component';
import AITooltipComponent from "./tooltip/ai-tooltip.component";
import ZnTextarea from "../../../textarea";
import type {EditorHost} from '../host';
import type {TextRange} from '../../../../internal/rich-text/rich-editor';
import type RichEditor from '../../../../internal/rich-text/rich-editor';

class EditorAI {
  private _editor: RichEditor;
  private readonly _container: HTMLElement;
  private readonly _path: string = '';
  private _component!: AITooltipComponent | AIPanelComponent;
  private _selectedText: string = '';
  private _prompt: string = '';
  private _aiResponseContent: string = '';
  private readonly _tooltip: () => boolean;

  /** `tooltip` returning false leaves offering Refine to the editor's own controls, which call `openPanel()`. */
  constructor(host: EditorHost, options: { path: string; tooltip?: () => boolean }) {
    this._editor = host.editor;
    this._container = host.container;
    this._path = options.path;
    this._tooltip = options.tooltip ?? (() => true);

    this._initComponent();
    this._attachEvents();
  }

  private _initComponent() {
    this._component = this._createTooltipComponent()!;
    this._component.addEventListener('click', (e: Event) => this._replaceTooltip(e));
    this._container.ownerDocument.body.appendChild(this._component);
  }

  private _attachEvents() {
    this._editor.addEventListener('selection-change', e => this._updateFromEditor((e as CustomEvent<{range: TextRange | null}>).detail.range));
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
    const quotedSelectedText = this._selectedText ? this._selectedText : this._editor.getText();
    const panel: HTMLElement | null | undefined = this._component.shadowRoot?.querySelector('.ai-panel');

    const response = await fetch(this._path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-kx-fetch-style': 'zn-editor',
        'x-kx-editor-id': this._container.getAttribute('x-editor-id') || '',
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
        const range = this._editor.getSelection();
        if (range) {
          this._editor.deleteText(range.index, range.length);
          this._editor.insertText(range.index, result);
          this._editor.setSelection(range.index + result.length, 0);
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
    this.openPanel();
  }

  /** Opens the prompts panel for the selected text, or the whole content when nothing is selected. */
  public openPanel() {
    // Clicking the tooltip takes focus from the text, so keep what it captured when nothing is selected now
    const range = this._editor.getSelection();
    if (range?.length) this._selectedText = this._editor.getText(range.index, range.length);
    this._hide();
    this._component.remove();

    const panel = this._createPanelComponent();
    if (!panel) return;

    this._component = panel;
    this._component.requestUpdate();

    // Attach panel button triggers
    this._attachPanelEvents(panel);

    // TODO: Finish overlay to prevent clicking away
    /*    // Create and append the overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'none';
        overlay.style.zIndex = '10000';

        // Append the overlay and panel to the body
        this._container.ownerDocument.body.appendChild(overlay);

        this._component.style.zIndex = '10001';*/

    this._container.ownerDocument.body.appendChild(this._component);
    this._show();
    this._positionComponent();
  }

  private _onDocumentClick(e: MouseEvent) {
    const path = e.composedPath ? e.composedPath() : [e.target as Node];
    const isInsideComponent = path.includes(this._component) || path.includes(this._component.shadowRoot!);
    const isInsideEditor = this._editor.root.contains(path[0] as Node);

    const isInsideAIPanel = path.some((node) => {
      if (node instanceof HTMLElement) {
        return node.tagName === 'ZN-AI-PANEL';
      }
      return false;
    });

    // If this._aiResponseContent is not empty, it means user is interacting with the panel
    if (this._latestContent(null)) {
      if (!isInsideAIPanel) {
        e.preventDefault();
        e.stopPropagation();

        return;
      }
    }

    if (!isInsideComponent && !isInsideEditor && !isInsideAIPanel) {
      this.resetComponent();
    }
  }

  private _updateFromEditor(range: TextRange | null) {
    // Update if component isn't AI panel
    if (this._component instanceof AIPanelComponent) return;

    // Display 'refine' option for selections longer than 25 characters
    if (this._tooltip() && range && range.length > 25) {
      // Keep selected text in memory to be passed to AI later
      this._selectedText = this._editor.getText(range.index, range.length);

      this._show();
      this._positionComponent();
    } else {
      this.resetComponent();
    }
  }

  private _positionComponent() {
    if (!this._component || !this._component.open) return;

    const range = this._editor.getSelection();
    if (!range) return;

    if (this._component instanceof AITooltipComponent) {
      const bounds = this._editor.getBounds(range.index + range.length);
      const left = bounds.left - 10; // Slight offset to the left
      const top = bounds.bottom + 4;

      this._component.style.left = `${Math.max(0, left)}px`;
      this._component.style.top = `${top}px`;

      return;
    }

    const positionPanel = () => {
      let bounds;
      if (range.length === this._editor.getLength() - 1) {
        bounds = this._editor.getBounds(range.index, range.length);
      } else {
        const endIndex = range.index + range.length;
        bounds = this._editor.getBounds(endIndex);
      }
      const right = bounds.right; // Align right side
      const bottom = bounds.top - 8; // Position above the selection

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

  public resetComponent() {
    this._hide();
    this._component.remove();
    this._initComponent();
  }

  private _show() {
    if (!this._component.open) {
      this._component.show();
      this._container.ownerDocument.addEventListener('click', (e: MouseEvent) => this._onDocumentClick(e));
      this._container.ownerDocument.addEventListener('keydown', this._onEscapeKey);
    }
  }

  private _hide() {
    this._component.hide();
    this._container.ownerDocument.removeEventListener('click', (e: MouseEvent) => this._onDocumentClick(e));
    this._container.ownerDocument.removeEventListener('keydown', this._onEscapeKey);
  }

  private _onEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      this._hide();
      this._component.remove();
      this._initComponent();
    }
  }

  private _attachPanelEvents(panel: AIPanelComponent) {
    panel.refine = this._enterCustomPrompt.bind(this);
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

  private _enterCustomPrompt(prompt: string) {
    this._prompt = prompt;
    this.processAIRequest().then(r => r);
  }
}

export default EditorAI;
