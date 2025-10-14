import {classMap} from "lit/directives/class-map.js";
import {HasSlotController} from "../../internal/slot";
import {html, unsafeCSS} from 'lit';
import {property, queryAssignedNodes, queryAsync} from 'lit/decorators.js';
import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';
import ZincElement from "../../internal/zinc-element";
import type {PropertyValues} from 'lit';

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

  @queryAssignedNodes({slot: 'html', flatten: true}) htmlNodes!: Node[];

  @queryAsync('iframe') iframe!: Promise<HTMLIFrameElement>;

  private readonly hasSlotController = new HasSlotController(this, 'text', 'html');

  private _textRows: TextRow[] = [];

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

          const baseStyles = "<style>body,html{padding: 0; margin: 0; font-size: 13px; font-family: Arial;}img{max-width:100%; max-height: 500px;}</style>";
          iframe.srcdoc = baseStyles + convertedHtml;
        }
      }

      iframe.addEventListener("load", () => {
        // Save original styles
        const originalDisplay = iframe.style.display;
        const originalVisibility = iframe.style.visibility;
        const originalPosition = iframe.style.position;

        // Make iframe render but stay hidden
        iframe.style.display = 'block';
        iframe.style.visibility = 'hidden';
        iframe.style.position = 'absolute';

        setTimeout(() => {
          const iframeBody = iframe.contentDocument?.body;
          if (iframeBody) {
            const height = iframeBody.scrollHeight;
            iframe.style.height = `${height + 30}px`;
          }
          // Restore original styles
          iframe.style.display = originalDisplay;
          iframe.style.visibility = originalVisibility;
          iframe.style.position = originalPosition;
        }, 50);
      });
    });
  }

  private _collapseContent(e: Event) {
    const target = e.target as HTMLElement;
    const headerClick = target.classList.contains('content-block-header') ||
      target.parentElement?.classList.contains('content-block-header');

    if (headerClick && target.slot !== 'nav') {
      this.short = !this.short;
      this.requestUpdate();
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
      }
    });
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

    return html`
      <zn-panel flush tabbed class="${classMap({
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
          <iframe class="hidden" title="Content block HTML preview"></iframe>
          <slot class="html-content" name="html" style="display: none;"></slot>
          <slot name="text" style="display: none;"></slot>
          <div class="text-content">
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
          <slot slot="footer" name="footer"></slot>` : ''}
      </zn-panel>
    `;
  }

  protected truncateText() {
    const textContent = this.querySelector('[slot="text"]') as HTMLDivElement | null;
    if (!textContent) return '';
    const trimmed = textContent.innerText.replace(/<[^>]*>/g, '').trim();
    return trimmed.length > 32 ? trimmed.substring(0, 32) + '...' : trimmed;
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
        row = this.transformLineForImages(row);

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

  private transformLineForImages(line: string): string {
    let out = line;

    // Replace Markdown image syntax ![alt](url) for http(s)
    const mdHttpImg = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+?\.(?:png|jpe?g|gif|webp|bmp|svg))\)/gi;
    out = out.replace(mdHttpImg, (_match, alt, url) => {
      return `<img src="${url}" alt="${alt || 'image'}" loading="lazy" style="max-width:100%;max-height:500px;">`;
    });

    // Replace Markdown image syntax with data URI (base64)
    const mdDataImg = /!\[([^\]]*)\]\((data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+)\)/gi;
    out = out.replace(mdDataImg, (_match, alt, url) => {
      return `<img src="${url}" alt="${alt || 'image'}" loading="lazy" style="max-width:100%;max-height:500px;">`;
    });

    // Replace bare http(s) image URLs with <img>
    const httpImg = /(https?:\/\/[^\s]+?\.(?:png|jpe?g|gif|webp|bmp|svg))(?!\S)/gi;
    out = out.replace(httpImg, (_m, url) => {
      return `<img src="${url}" alt="image" loading="lazy" style="max-width:100%;max-height:500px;">`;
    });

    // Replace bare data URI images with <img>
    const dataImg = /(data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+)(?!\S)/gi;
    out = out.replace(dataImg, (_m, url) => {
      return `<img src="${url}" alt="image" loading="lazy" style="max-width:100%;max-height:500px;">`;
    });

    return out;
  }

  showReply(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const nextElement = target.nextElementSibling;
    if (nextElement) {
      nextElement.classList.toggle('hidden');
    }
  }
}
