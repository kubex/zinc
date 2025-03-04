import Quill, {Module} from "quill";

type ImageResizeModuleOptions = {
  overlayStyles?: Partial<CSSStyleDeclaration>;
}

class ImageResizeModule extends Module<ImageResizeModuleOptions>
{

  static DEFAULTS: ImageResizeModuleOptions = {};

  private _focusedImage: HTMLImageElement | null = null;
  private _overlay: HTMLDivElement | null = null;

  constructor(quill: Quill, options: ImageResizeModuleOptions)
  {
    super(quill, options);

    this.quill.root.addEventListener('click', this.handleClick, false);
    this.quill.root.addEventListener('scroll', this.handleScroll, false);

    (this.quill.root.parentNode as HTMLElement).style.position =
      (this.quill.root.parentNode as HTMLElement).style.position || 'relative';
  }

  handleClick = (e: MouseEvent) =>
  {
    console.log('click', e);
    if(e.target && e.target instanceof Element && e.target.tagName && e.target.tagName.toUpperCase() === 'IMG')
    {
      console.log('image clicked');
      if(this._focusedImage === e.target)
      {
        return; // already focused
      }

      if(this._focusedImage)
      {
        this.hide(); // we were just focused on another image
      }

      this.show(e.target as HTMLImageElement);
      e.preventDefault(); // prevent drag handles appearing
    }
    else if(this._focusedImage)
    {
      this.hide(); // clicked on something else
    }
  };

  handleScroll = (e: MouseEvent) =>
  {
    console.log('scroll', e);
    if(this._focusedImage)
    {
      this.hide(); // hide the overlay if the user scrolls as it is no longer in the right place
    }
  };

  show = (image: HTMLImageElement) =>
  {
    console.log('show', image);
    this._focusedImage = image;
    this.showOverlay();
  };

  hide = () =>
  {
    console.log('hide');
    this.hideOverlay();
    this._focusedImage = null;
  };

  showOverlay = () =>
  {
    if(this._overlay)
    {
      this.hideOverlay(); // cleanup
    }

    this.quill.setSelection(null); // remove text selection

    this.setUserSelect('none'); // prevent spurious text selection

    // listen for the image being deleted or moved
    document.addEventListener('keyup', this.checkImage, true);
    this.quill.root.addEventListener('input', this.checkImage, true);

    // Create and add the overlay
    this._overlay = document.createElement('div');
    Object.assign(this._overlay.style, this.options.overlayStyles);

    this.quill?.root?.parentNode?.appendChild(this._overlay);
    this.repositionElements();
  };

  hideOverlay = () =>
  {
    if(!this._overlay)
    {
      return;
    }

    // Remove the overlay
    this._overlay?.parentNode?.removeChild(this._overlay);
    this._overlay = null;

    // stop listening for image deletion or movement
    document.removeEventListener('keyup', this.checkImage);
    this.quill.root.removeEventListener('input', this.checkImage);

    this.setUserSelect(''); // reset user-select
  };

  repositionElements = () =>
  {
    if(!this._overlay || !this._focusedImage)
    {
      return; // nothing to do
    }

    const parent = this.quill.root.parentNode as HTMLElement;
    const imgRect = this._focusedImage.getBoundingClientRect();
    const containerRect = parent.getBoundingClientRect();

    Object.assign(this._overlay.style, {
      left: `${imgRect.left - containerRect.left - 1 + parent.scrollLeft}px`,
      top: `${imgRect.top - containerRect.top - 1 + parent.scrollTop}px`,
      width: `${imgRect.width}px`,
      height: `${imgRect.height}px`
    });
  };

  setUserSelect = (value: string) =>
  {
    [
      'userSelect',
      'mozUserSelect',
      'webkitUserSelect',
      'msUserSelect'
    ].forEach((prop: any) =>
    {
      // set on contenteditable element and <html>
      this.quill.root.style[prop] = value;
      document.documentElement.style[prop] = value;
    });
  };

  checkImage = (e: KeyboardEvent) =>
  {
    if(this._focusedImage)
    {
      if(e.keyCode == 46 || e.keyCode == 8)
      {
        // @ts-expect-error Quill might not be defined on the window
        (window.Quill || Quill).find(this._focusedImage).deleteAt(0);
      }
    }
  };
}

export default ImageResizeModule;
