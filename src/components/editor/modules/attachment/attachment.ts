import type Quill from 'quill';
import type Toolbar from "../toolbar/toolbar";

interface AttachmentOptions {
  upload: (file: File) => Promise<{ path: any, url: any, filename: any }>;
  onFileUploaded?: (node: HTMLElement, {url}: { url: string }) => void;
  attachmentInput?: HTMLInputElement;
}

const generateId = () => {
  const name = 'attachment';
  const id = new Date().getTime();
  return `${name}_${id}`;
};

export default class Attachment {
  private _quill: Quill;
  private _options: AttachmentOptions;

  private _fileHolder: HTMLInputElement | null;

  constructor(quill: Quill, options: AttachmentOptions) {
    this._quill = quill;
    this._options = options;

    if (typeof (this._options.upload) !== "function") {
      console.warn("[Quill Attachment Module] No upload function provided");
    }

    (this._quill
      .getModule('toolbar') as Toolbar)
      .addHandler('attachment', this._selectLocalImage.bind(this));

    this._createAttachmentContainer();
  }

  private _selectLocalImage() {
    this._fileHolder = document.createElement('input');
    this._fileHolder.setAttribute('type', 'file');
    this._fileHolder.setAttribute('accept', '*/*');
    this._fileHolder.onchange = this._fileChanged.bind(this);
    this._fileHolder.click();
  }

  private _fileChanged() {
    if (!this._fileHolder?.files || this._fileHolder.files.length < 0) {
      return;
    }

    const file = this._fileHolder.files[0];
    const attachmentId = generateId();
    const fileReader = new FileReader();

    fileReader.addEventListener('load', () => {
      const base64Content = fileReader.result as string;
      this._insertAttachment({dataUrl: base64Content, file, id: attachmentId});
    }, false);

    if (file) {
      fileReader.readAsDataURL(file);
    }

    this._options.upload(file).then(({path, url}) => {
      this._uploadAttachment(file, url);
      this._updateAttachment(attachmentId, url, path);
    }).catch(err => {
      console.warn(err.message);
    });
  }

  private _attachmentContainer = document.createElement('div');

  private _createAttachmentContainer() {
    const attachmentContainer = this._attachmentContainer;
    attachmentContainer.id = 'attachment-container';
    attachmentContainer.style.display = 'flex';
    attachmentContainer.style.flexWrap = 'wrap';
    attachmentContainer.style.gap = '10px';
    attachmentContainer.style.position = 'absolute';
    attachmentContainer.style.bottom = '0';
    attachmentContainer.style.left = '0';
    attachmentContainer.style.right = '0';
    attachmentContainer.style.padding = '10px';

    this._quill.container.appendChild(attachmentContainer);
  }

  private _insertAttachment({dataUrl, file, id}: { dataUrl: string, file: File, id: string }) {
    this._attachmentContainer.appendChild(this._createAttachment(dataUrl, file, id));
  }

  private _updateAttachment(id: string, url: string, filename: string) {
    const element = this._quill.container.querySelector(`#${id}`) as HTMLAnchorElement;
    if (element) {
      element.setAttribute('href', url);
      let attachmentName = element.querySelector('.attachment-name');
      if (attachmentName) {
        if (filename) {
          attachmentName.textContent = filename;
        } else {
          attachmentName.textContent = 'Error uploading file';
        }
      }

      if (typeof this._options.onFileUploaded === 'function') {
        this._options.onFileUploaded(element, {url});
      }


      // add the url to the hidden input
      const attachments = this._options.attachmentInput;
      if (attachments && filename) {
        // value should be an array of attachment names
        const value = attachments.value;
        const data = value ? JSON.parse(value) : [];
        data.push(filename);
        attachments.value = JSON.stringify(data);
      }
    }
  }

  private _createAttachment(dataUrl: string, file: File, id: string) {
    const attachment = document.createElement('a');
    attachment.setAttribute('href', dataUrl);
    attachment.setAttribute('id', id);
    attachment.setAttribute('download', file.name);
    attachment.style.padding = '10px';
    attachment.style.backgroundColor = 'white';
    attachment.style.border = '1px solid #ccc';
    attachment.style.borderRadius = '5px';
    attachment.style.display = 'flex';
    attachment.style.alignItems = 'center';
    attachment.style.gap = '5px';

    const p = document.createElement('p');
    p.classList.add('attachment-name');
    p.textContent = 'Uploading...';

    attachment.appendChild(p);

    // add a remove button
    const removeButton = document.createElement('button');
    removeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg"  width="14" height="14" viewBox="0 0 30 30"><path d="M7 4a.995.995 0 0 0-.707.293l-2 2a.999.999 0 0 0 0 1.414L11.586 15l-7.293 7.293a.999.999 0 0 0 0 1.414l2 2a.999.999 0 0 0 1.414 0L15 18.414l7.293 7.293a.999.999 0 0 0 1.414 0l2-2a.999.999 0 0 0 0-1.414L18.414 15l7.293-7.293a.999.999 0 0 0 0-1.414l-2-2a.999.999 0 0 0-1.414 0L15 11.586 7.707 4.293A.996.996 0 0 0 7 4z"/></svg>';
    removeButton.onclick = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      this._removeAttachment(id);
    };

    attachment.appendChild(removeButton);
    return attachment;
  }

  private _removeAttachment(id: string) {
    const attachment = this._quill.container.querySelector(`#${id}`);
    if (attachment) {
      attachment.remove();
    }

    // remove the attachment from the hidden input
    const attachments = this._options.attachmentInput;
    if (attachments) {
      // value should be an array of attachment names
      const value = attachments.value;
      let attachmentName = attachment?.querySelector('.attachment-name');
      const data = value ? JSON.parse(value) : [];
      const index = data.indexOf(attachmentName ? attachmentName.textContent : '');
      if (index > -1) {
        data.splice(index, 1);
        attachments.value = JSON.stringify(data);
      }
    }
  }

  private _uploadAttachment(file: File, url: string) {
    const xhr = new XMLHttpRequest();

    xhr.open('PUT', url, true);
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log(`[Quill Attachment Module] File uploaded successfully to ${url}`);
      } else {
        console.error(`[Quill Attachment Module] Failed to upload file. Status: ${xhr.status}`);
      }
    };

    xhr.onerror = () => {
      console.error(`[Quill Attachment Module] Error occurred while uploading file.`);
    };

    xhr.send(file);
  }
}
