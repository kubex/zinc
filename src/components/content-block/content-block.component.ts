import {classMap} from "lit/directives/class-map.js";
import {deepQuerySelectorAll} from "../../utilities/query";
import {HasSlotController} from "../../internal/slot";
import {html, nothing, unsafeCSS} from 'lit';
import {property, queryAssignedNodes, queryAsync} from 'lit/decorators.js';
import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';
import ZincElement from "../../internal/zinc-element";
import type {PropertyValues} from 'lit';
import type ZnTile from "../tile";

import styles from './content-block.scss';

interface TextRow {
  lines: string[];
  type: 'reply' | 'text';
}

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/content-block
 * @status experimental
 * @since 1.0
 */
export default class ContentBlock extends ZincElement {
  static styles = unsafeCSS(styles);

  @property() time = '';
  @property() sender = '';
  @property() avatar = '';

  @property({type: Boolean, reflect: true}) outbound = false;
  @property({type: Boolean, reflect: true}) short = false;
  @property({attribute: 'default-display', reflect: true}) defaultDisplay: 'text' | 'html' = 'text';

  @queryAssignedNodes({slot: 'html', flatten: true}) htmlNodes!: Node[];

  @queryAsync('iframe') iframe!: Promise<HTMLIFrameElement>;

  private readonly hasSlotController = new HasSlotController(this, 'text', 'html');

  private _textRows: TextRow[] = [];

  private _footerObserver?: MutationObserver;
  private _replaceDebounce: number = 0;

  connectedCallback() {
    super.connectedCallback();
    this.iframe.then((iframe) => {
      if (iframe.contentDocument) {
        const div = this.htmlNodes[0] as HTMLDivElement;
        if (div) {
          let convertedHtml = div?.innerHTML ?? '';
          convertedHtml = convertedHtml.replace(/&nbsp;/g, ' ');
          convertedHtml = convertedHtml.replace(/&lt;/g, '<');
          convertedHtml = convertedHtml.replace(/&gt;/g, '>');
          convertedHtml = convertedHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

          const baseStyles = "<style>body,html{background-color: #ffffff}img{max-width:100%; max-height: 500px;}</style>";
          iframe.srcdoc = baseStyles + convertedHtml;
        }
      }

      iframe.addEventListener("load", () => {
        setTimeout(() => this._resizeIframe(iframe), 50);
      });
    });
  }

  disconnectedCallback() {
    try {
      if (this._footerObserver) {
        this._footerObserver.disconnect();
        this._footerObserver = undefined;
      }
      if (this._replaceDebounce) {
        clearTimeout(this._replaceDebounce);
        this._replaceDebounce = 0;
      }
    } finally {
      // Ensure base class cleanup
      // @ts-ignore - base may or may not implement disconnectedCallback
      super.disconnectedCallback?.();
    }
  }

  private _collapseContent(e: Event) {
    const target = e.target as HTMLElement;
    const headerClick = target.classList.contains('content-block-header') ||
      target.parentElement?.classList.contains('content-block-header');

    if (headerClick && target.slot !== 'nav') {
      this.short = !this.short;
      this.requestUpdate();
      this.updateComplete.then(() => {
        if (!this.short) {
          this.iframe.then((iframe) => {
            if (iframe && !iframe.classList.contains('hidden')) {
              this._resizeIframe(iframe);
            }
          });
        }
      });
    }
  }

  private _toggleText() {
    const textContent = this.shadowRoot?.querySelector('.text-content') as HTMLDivElement | null;
    this.iframe.then((iframe) => {
      if (textContent) {
        iframe.classList.add('hidden');
        textContent.classList.remove('hidden');
      }
    });
  }

  private _toggleHtml() {
    const textContent = this.shadowRoot?.querySelector('.text-content') as HTMLDivElement | null;
    this.iframe.then((iframe) => {
      if (textContent) {
        iframe.classList.remove('hidden');
        textContent.classList.add('hidden');
        setTimeout(() => this._resizeIframe(iframe), 0);
      }
    });
  }

  private _resizeIframe(iframe?: HTMLIFrameElement) {
    const resize = (frame: HTMLIFrameElement) => {
      const doc = frame.contentDocument;
      if (!doc) return;

      // Allow the iframe to shrink as well as grow
      frame.style.height = 'auto';

      const body = doc.body;
      const element = doc.documentElement;

      const heights = [
        body?.scrollHeight ?? 0,
        element?.scrollHeight ?? 0,
        body?.offsetHeight ?? 0,
        element?.offsetHeight ?? 0
      ];
      const height = Math.max(...heights);

      if (height > 0) {
        frame.style.height = `${height}px`;
      }
    };

    if (iframe) {
      resize(iframe);
    } else {
      this.iframe.then((frame) => {
        if (frame?.contentDocument) {
          requestAnimationFrame(() => resize(frame));
        }
      });
    }
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    const textContent = this.shadowRoot?.querySelectorAll('.text-section');
    if (textContent && textContent.length > 0) {
      textContent.forEach((content) => {
        content.innerHTML = content.innerHTML.replace(/&nbsp;/g, ' ');
        content.innerHTML = content.innerHTML.replace(/<!--[\s\S]*?-->/g, '');
        content.innerHTML = content.innerHTML.replace(/<\/p><br>/g, '</p>');
      });
    }
  }

  protected render() {
    const text = this.getTextSections();
    const hasFooter = this.querySelector(`:scope > [slot="footer"]`) !== null;
    const hasTextSlot = this.hasSlotController.test('text');
    const hasHtmlSlot = this.hasSlotController.test('html');
    const showActions = hasTextSlot && hasHtmlSlot;
    const initialShowHtml = hasHtmlSlot && (!hasTextSlot || this.defaultDisplay === 'html');

    return html`
      <zn-panel flush
                tabbed
                flush-footer="${hasFooter || nothing}"
                class="${classMap({
                  'content-block--outbound': this.outbound,
                  'content-block--short': this.short
                })}">

        <zn-header class="content-block-header"
                   caption="${this.sender}"
                   description="${this.truncateText()}"
                   @click="${this._collapseContent}">

          <zn-icon src="${this.avatar}"
                   library="avatar"
                   round></zn-icon>

          <div slot="actions">
            <small>${this.time}</small>
            ${showActions ? html`
              <zn-dropdown>
                <zn-button slot="trigger" icon="more_vert" icon-size="24" color="transparent"
                           size="content"></zn-button>
                <zn-menu>
                  <zn-menu-item @click="${this._toggleHtml}">
                    Show HTML
                  </zn-menu-item>
                  <zn-menu-item @click="${this._toggleText}">
                    Show Text
                  </zn-menu-item>
                </zn-menu>
              </zn-dropdown>
            ` : ''}
          </div>

        </zn-header>

        <zn-sp no-gap>
          <iframe class="${classMap({'hidden': !initialShowHtml})}" title="Content block HTML preview"></iframe>
          <slot class="html-content" name="html" style="display: none;"></slot>
          <slot name="text" style="display: none;"></slot>
          <div class="${classMap({'text-content': true, 'hidden': initialShowHtml})}">
            ${text.map((section) => html`
              ${section.type === 'reply' ? html`
                <div class="toggle-reply" @click="${this.showReply}">...</div>` : ''}
              <div class=${classMap({
                'text-section': true,
                'text-section--reply': section.type === 'reply',
                'text-section--text': section.type === 'text',
                'hidden': section.type === 'reply'
              })}>
                ${section.lines.map((line) => html`${unsafeHTML(line)}<br>`)}
              </div>
            `)}
          </div>
        </zn-sp>

        ${hasFooter ? html`
          <slot slot="footer" name="footer" @slotchange="${this._handleSlotChange}"></slot>` : ''}
      </zn-panel>
    `;
  }

  protected truncateText() {
    const textContent = this.querySelector('[slot="text"]') as HTMLDivElement | null;
    if (!textContent) return '';
    const trimmed = textContent.innerText.replace(/<[^>]*>/g, '').trim();
    return trimmed.length > 32 ? trimmed.substring(0, 32) + '...' : trimmed;
  }

  private _handleSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    const assignedEls: Element[] = slot.assignedElements({flatten: true});
    if (!assignedEls || assignedEls.length === 0) return;

    // Reset and attach a new observer to watch for dynamic content inside the footer subtree
    if (this._footerObserver) {
      this._footerObserver.disconnect();
      this._footerObserver = undefined;
    }

    const obs = new MutationObserver(() => {
      this._debouncedReplace();
    });
    this._footerObserver = obs;

    assignedEls.forEach(el => {
      obs.observe(el, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['href', 'download', 'caption']
      });
    });

    // Run now and again shortly after to catch async rendering
    this._replaceImagePlaceholders();
    setTimeout(() => this._replaceImagePlaceholders(), 50);
  }

  private _debouncedReplace() {
    if (this._replaceDebounce) {
      clearTimeout(this._replaceDebounce);
    }
    this._replaceDebounce = window.setTimeout(() => this._replaceImagePlaceholders(), 50);
  }

  private _replaceImagePlaceholders() {
    const textContainer = this.shadowRoot?.querySelector('.text-content') as HTMLDivElement | null;
    if (!textContainer) {
      // If the shadow content hasn't been rendered yet, try after the next update
      this.updateComplete.then(() => this._replaceImagePlaceholders());
      return;
    }

    const footer = this.querySelector(':scope > [slot="footer"]') as HTMLElement | null;
    if (!footer) return;

    const anchors = deepQuerySelectorAll('a[href]', footer, '') as HTMLAnchorElement[];
    if (anchors.length === 0) return;

    let textContent = textContainer.innerHTML;
    const extensions = new Set(['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'heic', 'tiff', 'tif', 'avif']);
    anchors.forEach((a) => {
      const candidates = new Set<string>();
      const tile = a.querySelector('zn-tile') as ZnTile | null;

      const caption = (tile?.caption ?? tile?.getAttribute?.('caption') ?? '').trim();
      if (caption) candidates.add(caption);

      const downloadAttr = (a.getAttribute('download') || '').trim();
      if (downloadAttr) candidates.add(downloadAttr);

      const url = a.getAttribute('href') || '';
      candidates.forEach((rawName) => {
        const name = (rawName || '').trim();
        if (!name) return;

        const base = name.includes('/') ? name.split('/').pop()! : name;
        const lowerBase = base.toLowerCase();
        const ext = lowerBase.includes('.') ? lowerBase.split('.').pop()! : '';
        if (ext && !extensions.has(ext)) return;

        const alt = base.replace(/"/g, '&quot;');
        textContent = textContent.replace(`[image: ${base}]`, () => `<img src="${url}" alt="${alt}" style="max-height: 500px; max-width: 100%">`);
      });
    });

    // Update the generated content directly without triggering a re-render
    textContainer.innerHTML = textContent;
  }

  protected getTextSections(): TextRow[] {
    const textContent = this.querySelector('[slot="text"]') as HTMLDivElement | null;
    const textRows: TextRow[] = [];

    if (textContent) {
      const text = textContent.innerText;
      const rows = text.split('\n');
      let previousType: TextRow['type'] | null = null;
      let forceReply = false;
      let type: TextRow['type'] = 'text';

      const containsGraterThan = rows.some((row) => row.startsWith('>'));

      rows.forEach((rowOrig) => {
        let row = rowOrig;
        if (((row.startsWith('On') && row.endsWith('wrote:')) || row.startsWith('From:')) && !containsGraterThan) forceReply = true;
        if (row.startsWith('--')) forceReply = false;
        type = (forceReply || row.startsWith('>')) ? 'reply' : 'text';
        if (row.startsWith('Sent from')) type = 'reply';
        if (row.trim() === '' && previousType === 'reply') type = 'reply';
        if (type === 'reply' && row.startsWith('>')) row = row.substring(1).trim();

        if (previousType === type) {
          if (textRows.length === 0) {
            textRows.push({lines: [row], type});
            previousType = type;
            return;
          }
          textRows[textRows.length - 1].lines.push(row);
        } else {
          textRows.push({lines: [row], type});
          previousType = type;
        }
      });
    }

    this._textRows = textRows;
    return this._textRows;
  }

  showReply(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const nextElement = target.nextElementSibling;
    if (nextElement) {
      nextElement.classList.toggle('hidden');
    }
  }
}
