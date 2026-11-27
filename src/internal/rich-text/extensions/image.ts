import type {Extension} from '../extension';
import type RichEditor from '../rich-editor';

export interface ImageValue {
  src: string;
  alt?: string;
  title?: string;
}

// A click on an image selects it, so Backspace and Delete remove it like any other selection
function selectOnClick(editor: RichEditor) {
  const onClick = (e: MouseEvent) => {
    const img = e.target as Element;
    if (img.tagName !== 'IMG' || !editor.root.contains(img)) return;
    editor.setSelection(editor.indexOf(img), 1);
  };
  editor.root.addEventListener('click', onClick);
  return () => editor.root.removeEventListener('click', onClick);
}

/** Inline images. */
export const image: Extension = {
  name: 'image',
  atoms: [{
    name: 'image',
    selector: 'img',
    attributes: ['src', 'alt', 'title', 'width', 'height'],
    create: value => {
      const props: ImageValue = typeof value === 'string' ? {src: value} : value as ImageValue;
      const {src, alt, title} = props;
      const img = document.createElement('img');
      img.setAttribute('src', src);
      if (alt) img.setAttribute('alt', alt);
      if (title) img.setAttribute('title', title);
      return img;
    },
  }],
  init: selectOnClick,
};
