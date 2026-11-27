import type {EditorHost} from '../host';
import type Toolbar from "../toolbar/toolbar";

export interface UploadOptions {
  /** Report how much of the file has been sent, from 0 to 1. */
  onProgress: (fraction: number) => void;
  /** Aborts when the person removes the file before it finishes. */
  signal: AbortSignal;
}

/** Uploads a file, resolving with where it was stored: `path` goes in the form value, `url` links the chip. */
export type Uploader = (file: File, options: UploadOptions) => Promise<{ path: string; url: string }>;

interface AttachmentOptions {
  upload: Uploader;
  // node is null when the chip was removed (or reset) during the upload
  onFileUploaded?: (node: HTMLElement | null, {url}: { url: string }) => void;
  onFileUploadFailed?: (error: Error) => void;
  attachmentInput?: HTMLInputElement;
  /** From this many files they fold into one stack that opens their list; 0 never stacks. Read on every change. */
  stackAt?: () => number;
}

type ChipState = 'uploading' | 'uploaded' | 'failed' | 'too-large';

// Mirrors the server's upload body-size limit.
const MAX_ATTACHMENT_BYTES = 30 * 1024 * 1024;

const svg = (paths: string) => `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

const ICONS = {
  file: svg('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>'),
  image: svg('<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/>'
    + '<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>'),
  failed: svg('<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>'),
  retry: svg('<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>'),
  remove: svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
};

let nextAttachmentId = 0;

const generateId = () => `attachment_${++nextAttachmentId}`;

export function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const fileKind = (file: File) => {
  const extension = /\.([a-z0-9]{1,6})$/i.exec(file.name)?.[1];
  return (extension ?? file.type.split('/')[1] ?? 'File').toUpperCase();
};

function button(className: string, label: string, icon: string, text = '') {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = className;
  el.innerHTML = icon;
  if (text) el.append(Object.assign(document.createElement('span'), {textContent: text}));
  if (label) el.setAttribute('aria-label', label);
  return el;
}

export default class Attachment {
  private readonly _container: HTMLElement;
  private _options: AttachmentOptions;
  private readonly _files = new Map<string, File>();
  private readonly _uploads = new Map<string, AbortController>();

  private _fileHolder: HTMLInputElement | null;

  constructor(host: EditorHost, options: AttachmentOptions) {
    this._container = host.container;
    this._options = options;

    if (typeof (this._options.upload) !== "function") {
      console.warn("[Editor Attachment Module] No upload function provided");
    }
    if (typeof (this._options.onFileUploaded) !== "function") {
      console.warn("[Editor Attachment Module] No file uploaded function provided");
    }

    host.getModule<Toolbar>('toolbar')?.addHandler('attachment', this._selectLocalImage.bind(this));

    this._badge.addEventListener('click', e => {
      e.stopPropagation();
      this._setOpen(!this._attachmentContainer.classList.contains('attachments--open'));
    });
    this._attachmentContainer.addEventListener('wheel', this._wheelStack, {passive: false});
    // Files dropped on the bar are attachments, images included; dropped on the text, an image goes inline. While
    // files are over the editor the bar shows, empty or not, so there's always somewhere to drop them
    const bar = this._attachmentContainer;
    this._container.addEventListener('dragover', e => {
      if (e.dataTransfer?.types.includes('Files')) bar.classList.add('attachments--armed');
    });
    this._container.addEventListener('dragleave', e => {
      if (!this._container.contains(e.relatedTarget as Node | null)) bar.classList.remove('attachments--armed');
    });
    this._container.addEventListener('drop', () => bar.classList.remove('attachments--armed'), true);
    bar.addEventListener('dragover', e => {
      if (!e.dataTransfer?.types.includes('Files')) return;
      e.preventDefault();
      bar.classList.add('attachments--drop');
    });
    bar.addEventListener('dragleave', e => {
      if (!bar.contains(e.relatedTarget as Node | null)) bar.classList.remove('attachments--drop');
    });
    bar.addEventListener('drop', e => {
      bar.classList.remove('attachments--drop');
      if (!e.dataTransfer?.files.length) return;
      e.preventDefault();
      e.stopPropagation();
      Array.from(e.dataTransfer.files).forEach(file => this.addAttachment(file));
    });
    this._attachmentContainer.append(this._list, this._moreAbove, this._moreBelow);
    this._container.appendChild(this._attachmentContainer);
  }

  private _selectLocalImage() {
    this._fileHolder = document.createElement('input');
    this._fileHolder.setAttribute('type', 'file');
    this._fileHolder.setAttribute('accept', '*/*');
    this._fileHolder.onchange = this._fileChanged.bind(this);
    this._fileHolder.click();
  }

  private _fileChanged() {
    const file = this._fileHolder?.files?.[0];
    if (!file) return;

    this.addAttachment(file);
  }

  public addAttachment(file: File, dataUrl?: string) {
    const id = generateId();
    this._files.set(id, file);
    this._list.appendChild(this._createAttachment(dataUrl || URL.createObjectURL(file), file, id));

    if (file.size > MAX_ATTACHMENT_BYTES) {
      this._setState(id, 'too-large', `${formatSize(file.size)} · max 30 MB`);
      return;
    }
    this._startUpload(id);
  }

  private _startUpload(id: string) {
    const file = this._files.get(id);
    if (!file) return;
    this._setState(id, 'uploading', 'Uploading');
    this._setProgress(id, 0);

    if (typeof this._options.upload !== 'function') {
      this._setState(id, 'failed', 'Upload failed');
      return;
    }
    const controller = new AbortController();
    this._uploads.set(id, controller);
    const onProgress = (fraction: number) => this._setProgress(id, fraction);
    // the rejection handler covers only the upload, so each upload settles exactly once
    this._options.upload(file, {onProgress, signal: controller.signal}).then(({path, url}) => {
      this._uploads.delete(id);
      this._updateAttachment(id, url, path);
    }, (err: Error) => {
      this._uploads.delete(id);
      console.warn(err.message);
      this._setState(id, 'failed', 'Upload failed');
      this._options.onFileUploadFailed?.(err);
    });
  }

  private readonly _attachmentContainer = Object.assign(document.createElement('div'), {className: 'attachments'});

  // Apps clear the files by emptying #attachment-container, so that id stays on the element holding only the files
  private readonly _list = Object.assign(document.createElement('div'), {id: 'attachment-container', className: 'attachments__list'});
  private readonly _badge = Object.assign(document.createElement('button'), {type: 'button', className: 'attachments__badge'});
  private readonly _moreAbove = this._moreButton(1);
  private readonly _moreBelow = this._moreButton(-1);
  // How many of the fanned-out files have slid down past the front one, and how many fit at once
  private _scroll = 0;
  private _fits = Infinity;
  private _wheel = 0;

  private _moreButton(direction: 1 | -1) {
    const more = button(`attachments__more attachments__more--${direction > 0 ? 'above' : 'below'}`, '',
      svg(direction > 0 ? '<path d="m18 15-6-6-6 6"/>' : '<path d="m6 9 6 6 6-6"/>'), ' ');
    more.hidden = true;
    more.addEventListener('click', () => this._scrollStack(direction * Math.max(1, this._fits - 1)));
    return more;
  }

  /**
   * Enough files pile up like the shell's minimised windows: the newest in front, two more peeking out behind, and
   * a badge on the front one that fans them all out.
   */
  public layout() {
    const chips = Array.from(this._list.children) as HTMLElement[];
    const stackAt = this._options.stackAt?.() ?? 0;
    const stacked = stackAt > 0 && chips.length >= stackAt;
    this._attachmentContainer.classList.toggle('attachments--stacked', stacked);
    chips.forEach((chip, index) => chip.style.setProperty('--depth', String(chips.length - 1 - index)));
    if (!stacked) {
      this._setOpen(false);
      this._badge.remove();
      this._place();
      return;
    }

    const front = chips[chips.length - 1];
    const remove = front.querySelector('.attachment__remove')!;
    if (remove.previousElementSibling !== this._badge) remove.before(this._badge);
    const behind = chips.slice(0, -1);
    const failing = behind.filter(chip => chip.dataset.state === 'failed' || chip.dataset.state === 'too-large').length;
    this._badge.dataset.count = String(behind.length);
    this._badge.classList.toggle('attachments__badge--alert', failing > 0);
    this._labelBadge(failing);
    this._place();
  }

  /**
   * Where each file sits. Fanned out, the column reaches no higher than the top of the text; past that it scrolls as
   * one list, with a button on its top and bottom edge for the files out of view. Out of view or folded behind the
   * front one, a file is out of reach.
   */
  private _place() {
    const chips = Array.from(this._list.children) as HTMLElement[];
    const open = this._attachmentContainer.classList.contains('attachments--open');
    const stacked = this._attachmentContainer.classList.contains('attachments--stacked');
    if (open) {
      const step = chips[0].offsetHeight + 6;
      const room = this._list.getBoundingClientRect().bottom - this._container.getBoundingClientRect().top - 8;
      this._fits = Math.max(2, Math.floor(room / step));
    }
    this._scroll = Math.min(Math.max(this._scroll, 0), Math.max(0, chips.length - this._fits));
    let above = 0;
    let below = 0;
    chips.forEach((chip, index) => {
      const depth = chips.length - 1 - index;
      const position = depth - this._scroll;
      const away = open && (position < 0 || position > this._fits - 1);
      if (away && position < 0) below++;
      if (away && position >= 0) above++;
      chip.style.setProperty('--position', String(position));
      chip.classList.toggle('attachment--away', away);
      chip.inert = stacked && depth > 0 && (!open || away);
    });
    this._attachmentContainer.style.setProperty('--shown', String(Math.min(chips.length, this._fits)));
    this._labelMore(this._moreAbove, open ? above : 0, 'above');
    this._labelMore(this._moreBelow, open ? below : 0, 'below');
  }

  private _labelMore(more: HTMLButtonElement, count: number, where: string) {
    more.hidden = count === 0;
    more.querySelector('span')!.textContent = `${count} more`;
    more.setAttribute('aria-label', `Show ${count} more attachments ${where}`);
  }

  private _scrollStack(by: number) {
    this._attachmentContainer.classList.add('attachments--scrolled');
    this._scroll += by;
    this._place();
  }

  // A whole file per notch, however finely the wheel or trackpad reports
  private _wheelStack = (e: WheelEvent) => {
    if (!this._attachmentContainer.classList.contains('attachments--open')) return;
    e.preventDefault();
    this._wheel += e.deltaY;
    const step = 40;
    const by = Math.trunc(this._wheel / step);
    if (!by) return;
    this._wheel -= by * step;
    // Scrolling down brings the lower files back, as a list would
    this._scrollStack(-by);
  };

  private _labelBadge(failing = 0) {
    const open = this._attachmentContainer.classList.contains('attachments--open');
    const count = this._badge.dataset.count;
    this._badge.setAttribute('aria-expanded', String(open));
    this._badge.setAttribute('aria-label', open
      ? 'Stack the other attachments'
      : `Show ${count} more attachments${failing ? `, ${failing} failed` : ''}`);
  }

  private _setOpen(open: boolean) {
    if (this._attachmentContainer.classList.contains('attachments--open') === open) return;
    this._attachmentContainer.classList.toggle('attachments--open', open);
    this._attachmentContainer.classList.remove('attachments--scrolled');
    this._scroll = 0;
    this._wheel = 0;
    const doc = this._container.ownerDocument;
    if (open) {
      doc.addEventListener('pointerdown', this._closeOutside, true);
      doc.addEventListener('keydown', this._closeOnEscape, true);
    } else {
      doc.removeEventListener('pointerdown', this._closeOutside, true);
      doc.removeEventListener('keydown', this._closeOnEscape, true);
    }
    this.layout();
  }

  /** Folds a fanned-out stack, letting go of the page-wide listeners it holds while open. */
  public fold() {
    this._setOpen(false);
  }

  private _closeOutside = (e: PointerEvent) => {
    if (!e.composedPath().includes(this._attachmentContainer)) this._setOpen(false);
  };

  private _closeOnEscape = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    e.stopPropagation();
    this._setOpen(false);
    this._badge.focus();
  };

  private _chip(id: string) {
    return this._attachmentContainer.querySelector<HTMLElement>(`#${id}`);
  }

  private _setState(id: string, state: ChipState, status: string) {
    const chip = this._chip(id);
    if (!chip) return;
    chip.dataset.state = state;
    chip.querySelector('.attachment__status')!.textContent = status;
    chip.querySelector('.attachment__retry')!.toggleAttribute('hidden', state !== 'failed');
    const remove = chip.querySelector('.attachment__remove')!;
    const name = this._files.get(id)?.name ?? '';
    remove.setAttribute('aria-label', state === 'uploading' ? `Cancel upload of ${name}` : `Remove ${name}`);
    const failed = state === 'failed' || state === 'too-large';
    chip.querySelector('.attachment__icon')!.innerHTML = failed ? ICONS.failed : chip.dataset.kind === 'image' ? ICONS.image : ICONS.file;
    chip.querySelector('.attachment__retry')!.setAttribute('aria-label', `Retry upload of ${name}`);
    // A condensed chip has no room for its status, so it's in the tooltip
    chip.title = `${name} · ${status}`;
    this.layout();
  }

  private _setProgress(id: string, fraction: number) {
    const chip = this._chip(id);
    if (!chip) return;
    const percent = Math.round(fraction * 100);
    const progress = chip.querySelector('.attachment__progress')!;
    progress.setAttribute('aria-valuenow', String(percent));
    (progress.firstElementChild as HTMLElement).style.transform = `scaleX(${percent / 100})`;
    chip.style.setProperty('--progress', `${percent}%`);
    if (chip.dataset.state === 'uploading') {
      const status = percent ? `Uploading · ${percent}%` : 'Uploading';
      chip.querySelector('.attachment__status')!.textContent = status;
      chip.title = `${this._files.get(id)?.name ?? ''} · ${status}`;
      this.layout();
    }
  }

  private _revokeObjectUrl(element: Element) {
    const href = element.querySelector('.attachment__name')?.getAttribute('href');
    if (href?.startsWith('blob:')) {
      URL.revokeObjectURL(href);
    }
  }

  private _updateAttachment(id: string, url: string, path: string) {
    const element = this._chip(id);
    if (!element) {
      this._options.onFileUploaded?.(null, {url});
      return;
    }

    this._revokeObjectUrl(element);
    element.querySelector('.attachment__name')!.setAttribute('href', url);
    const file = this._files.get(id)!;
    this._setState(id, 'uploaded', `${fileKind(file)} · ${formatSize(file.size)}`);

    this._options.onFileUploaded?.(element, {url});

    // the hidden input holds the upload paths, which the chip keeps so removing it takes the right one out
    const attachments = this._options.attachmentInput;
    if (attachments && path) {
      element.dataset.path = path;
      const data: string[] = attachments.value ? JSON.parse(attachments.value) as string[] : [];
      data.push(path);
      attachments.value = JSON.stringify(data);
    }
  }

  private _createAttachment(href: string, file: File, id: string) {
    const chip = document.createElement('div');
    chip.id = id;
    chip.className = 'attachment';
    if (file.type.startsWith('image/')) chip.dataset.kind = 'image';

    const icon = document.createElement('div');
    icon.className = 'attachment__icon';

    const body = document.createElement('div');
    body.className = 'attachment__body';
    const name = document.createElement('a');
    name.className = 'attachment__name';
    name.href = href;
    name.download = file.name;
    name.title = file.name;
    name.textContent = file.name;
    const status = document.createElement('span');
    status.className = 'attachment__status';
    body.append(name, status);

    const retry = button('attachment__retry', '', ICONS.retry, 'Retry');
    retry.addEventListener('click', () => this._startUpload(id));
    const remove = button('attachment__remove', `Remove ${file.name}`, ICONS.remove);
    remove.addEventListener('click', () => this._removeAttachment(id));

    const progress = document.createElement('div');
    progress.className = 'attachment__progress';
    progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-label', `Uploading ${file.name}`);
    progress.setAttribute('aria-valuemin', '0');
    progress.setAttribute('aria-valuemax', '100');
    progress.append(document.createElement('div'));

    chip.append(icon, body, retry, remove, progress);
    return chip;
  }

  /** Clear every staged attachment preview and reset the backing form input. */
  public reset() {
    Array.from(this._list.children).forEach(chip => this._revokeObjectUrl(chip));
    this._list.replaceChildren();
    this._files.clear();
    this.layout();
    const attachments = this._options.attachmentInput;
    if (attachments) {
      attachments.value = '';
    }
  }

  // While uploading, removing the chip cancels the upload
  private _removeAttachment(id: string) {
    const attachment = this._chip(id);
    this._uploads.get(id)?.abort();
    this._files.delete(id);
    if (!attachment) return;
    this._revokeObjectUrl(attachment);
    attachment.remove();
    this.layout();

    const attachments = this._options.attachmentInput;
    const path = attachment.dataset.path;
    if (attachments?.value && path) {
      const data = (JSON.parse(attachments.value) as string[]).filter(item => item !== path);
      attachments.value = JSON.stringify(data);
    }
  }
}

/** Sends a file to a presigned upload URL with PUT, reporting progress. */
export function putFile(url: string, file: File, {onProgress, signal}: UploadOptions): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error('[Editor Attachment Module] Upload cancelled.'));
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`[Editor Attachment Module] Failed to upload file. Status: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error(`[Editor Attachment Module] Error occurred while uploading file.`));
    xhr.onabort = () => reject(new Error('[Editor Attachment Module] Upload cancelled.'));
    signal.addEventListener('abort', () => xhr.abort(), {once: true});
    xhr.send(file);
  });
}
