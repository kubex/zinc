import {html, unsafeCSS} from 'lit';
import {customElement, property, queryAssignedNodes, queryAsync} from 'lit/decorators.js';
import {classMap} from "lit/directives/class-map.js";

import styles from './index.scss?inline';
import {ZincElement} from "@/zinc-element";

type TextRow = {
  lines: Array<string>;
  type: 'reply' | 'text';
}

@customElement('zn-ticket-post')
export class TicketPost extends ZincElement
{
  static styles = unsafeCSS(styles);

  @property() time = '';
  @property() sender = '';
  @property() avatar = '';

  @property({type: Boolean, reflect: true}) outbound = false;
  @property({type: Boolean, reflect: true}) collapsed = false;

  @queryAssignedNodes({slot: 'html', flatten: true}) htmlNodes!: Array<Node>;

  @queryAsync('iframe') iframe!: Promise<HTMLIFrameElement>;

  private _textRows: TextRow[] = [];

  connectedCallback()
  {
    super.connectedCallback();
    this.iframe.then((iframe) =>
    {
      if(iframe.contentDocument)
      {
        const div = this.htmlNodes[0] as HTMLDivElement;
        if(div)
        {
          let convertedHtml = div?.innerHTML;
          convertedHtml = convertedHtml.replace(/&nbsp;/g, '');
          convertedHtml = convertedHtml.replace(/&lt;/g, '<');
          convertedHtml = convertedHtml.replace(/&gt;/g, '>');
          convertedHtml = convertedHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

          const baseStyles = "<style>body,html{padding: 0; margin: 0; font-size: 13px; ;line-height: 15px; font-family: Arial;}</style>";
          iframe.srcdoc = baseStyles + convertedHtml;
        }
      }
    });
  }

  private _toggleText()
  {
    const textContent = this.querySelector('[slot="text"]') as HTMLDivElement | null;
    this.iframe.then((iframe) =>
    {
      if(textContent)
      {
        textContent.attributes.removeNamedItem('hidden');
        iframe.attributes.setNamedItem(document.createAttribute('hidden'));
      }
    });
  }

  private _toggleHtml()
  {
    const textContent = this.querySelector('[slot="text"]') as HTMLDivElement | null;
    this.iframe.then((iframe) =>
    {
      if(textContent)
      {
        iframe.attributes.removeNamedItem('hidden');
        textContent.attributes.setNamedItem(document.createAttribute('hidden'));
        iframe.height = (iframe.contentWindow.document.body.offsetHeight + 35) + 'px';
      }
    });
  }

  collapseContent(e)
  {
    const headerClick = e.target.classList.contains('post-header')
      || e.target.classList.contains('avatar')
      || e.target.parentElement?.classList.contains('post-header');

    if(this.collapsed || headerClick)
    {
      this.collapsed = !this.collapsed;
    }
  }

  protected render()
  {
    const textSections = this.getTextSections();

    return html`
      <div class="${classMap({
        'ticket-post': true,
        'ticket-post--outbound': this.outbound,
        'ticket-post--collapsed': this.collapsed
      })}">
        <div class="${classMap({'ticket-post__left': true})}">
          <zn-avatar class="avatar"
                     avatar="${this.avatar}"
                     @click="${this.collapseContent}">
          </zn-avatar>
          <zn-icon class="toggler" size="24" src="html" @click="${this._toggleHtml}"></zn-icon>
          <zn-icon class="toggler" size="24" src="abc" @click="${this._toggleText}"></zn-icon>
        </div>
        <div class="${classMap({'ticket-post__content': true})}" @click="${this.collapseContent}">
          <div class="post-header">
            <h5>${this.sender}</h5>
            <p>${this.time}</p>
          </div>
          <slot class="html-content" name="html" style="display: none"></slot>
          <div class="post-content__body">
            <iframe hidden></iframe>
            <slot name="text" style="display: none;"></slot>
            <div class="text-content">
              ${this.getTextHtml()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  protected getTextSections()
  {
    const textContent = this.querySelector('[slot="text"]') as HTMLDivElement | null;
    const textRows = [];

    if(textContent)
    {
      const text = textContent.innerText;
      const rows = text.split('\n');
      let previousType = null;
      let forceReply = false;
      let type = 'text';

      const containsGraterThan = rows.some((row) => row.startsWith('>'));

      rows.forEach((row) =>
      {
        if(row.startsWith('On ') && row.endsWith(' wrote:') && !containsGraterThan) forceReply = true;
        if(row.startsWith('--')) forceReply = false;
        type = forceReply || row.startsWith('>') ? 'reply' : 'text';
        if(type === 'reply' && row.startsWith('>')) row = row.substring(1).trim();
        if(row === '') return;

        // if previous row is the same type, append to it
        if(previousType === type)
        {
          if(textRows.length === 0)
          {
            textRows.push({lines: [row], type});
            return;
          }

          textRows[textRows.length - 1].lines.push(row);
          return;
        }

        textRows.push({lines: [row], type});

        previousType = type;
      });
    }

    // filter empty rows
    this._textRows = textRows;
    return this._textRows;
  }

  protected getTextHtml()
  {
    const text = this.getTextSections();

    return html`
      ${text.map((section) => html`
        ${section.type === 'reply' ? html`
          <div class="toggle-reply" @click="${this.showReply}">...</div>` : ''}
        <div class=${classMap({
          'text-section': true,
          'text-section--reply': section.type === 'reply',
          'text-section--text': section.type === 'text',
          'hidden': section.type === 'reply'
        })}>
          ${section.lines.map((line) => html`
            <p>${line}</p>
          `)}
        </div>
      `)}
    `;
  }

  showReply(e: MouseEvent)
  {
    const target = e.target as HTMLElement;
    const nextElement = target.nextElementSibling;
    if(nextElement)
    {
      nextElement.classList.toggle('hidden');
    }
  }
}
