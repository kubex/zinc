import type {Extension} from '../extension';

/** A YouTube or Vimeo page URL as its embeddable player URL; any other URL is left as it is. */
export function embedUrl(url: string): string {
  let match = /^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/.exec(url)
    ?? /^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/.exec(url);
  if (match) return `${match[1] || 'https'}://www.youtube.com/embed/${match[2]}?showinfo=0`;
  match = /^(?:(https?):\/\/)?(?:www\.)?vimeo\.com\/(\d+)/.exec(url);
  if (match) return `${match[1] || 'https'}://player.vimeo.com/video/${match[2]}/`;
  return url;
}

const isWeb = (src: string | null) => !!src && /^https?:\/\//i.test(src);

/** Embedded videos, between blocks. Only http(s) players are kept. */
export const video: Extension = {
  name: 'video',
  tags: ['iframe'],
  atoms: [{
    name: 'video',
    selector: 'iframe',
    block: true,
    attributes: ['src', 'frameborder', 'allowfullscreen'],
    create: value => {
      const iframe = document.createElement('iframe');
      iframe.setAttribute('src', embedUrl(String(value)));
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', 'true');
      return iframe;
    },
  }],
  parse: root => root.querySelectorAll('iframe').forEach(iframe => {
    if (!isWeb(iframe.getAttribute('src'))) iframe.remove();
  }),
};
