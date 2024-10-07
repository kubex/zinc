import {html, unsafeCSS} from 'lit';
import {customElement, property, queryAssignedNodes, queryAsync} from 'lit/decorators.js';
import {classMap} from "lit/directives/class-map.js";

import styles from './index.scss?inline';
import {ZincElement} from "@/zinc-element";

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
            <slot class="text-content" name="text"></slot>
          </div>
        </div>
      </div>
    `;
  }
}
