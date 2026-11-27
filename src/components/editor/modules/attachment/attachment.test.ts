import {aTimeout, expect} from '@open-wc/testing';
import Attachment, {putFile} from './attachment';
import type {EditorHost} from '../host';
import type {UploadOptions} from './attachment';

// An upload the test finishes by hand
interface Pending {
  options: UploadOptions;
  resolve: (stored: {path: string; url: string}) => void;
  reject: (error: Error) => void;
}

describe('editor attachments', () => {
  let container: HTMLElement;
  let input: HTMLInputElement;
  let failures: number;
  let uploads: Pending[];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
    input = document.createElement('input');
    failures = 0;
    uploads = [];
  });

  afterEach(() => container.remove());

  const attach = (file: File) => {
    const host = {container, getModule: () => undefined} as unknown as EditorHost;
    const module = new Attachment(host, {
      attachmentInput: input,
      upload: (_file, options) => new Promise((resolve, reject) => {
        uploads.push({options, resolve, reject});
        options.signal.addEventListener('abort', () => reject(new Error('cancelled')));
      }),
      onFileUploaded: () => undefined,
      onFileUploadFailed: () => failures++,
    });
    module.addAttachment(file);
    return container.querySelector<HTMLElement>('.attachment')!;
  };
  const status = (chip: HTMLElement) => chip.querySelector('.attachment__status')!.textContent;
  const retry = (chip: HTMLElement) => chip.querySelector<HTMLButtonElement>('.attachment__retry')!;
  const remove = (chip: HTMLElement) => chip.querySelector<HTMLButtonElement>('.attachment__remove')!;
  const pdf = (bytes = 2048) => new File([new Uint8Array(bytes)], 'report.pdf', {type: 'application/pdf'});
  const stored = {path: 'uploads/report.pdf', url: 'https://files.test/report.pdf'};

  it('shows progress while uploading, then the type and size', async () => {
    const chip = attach(pdf());
    expect(chip.dataset.state).to.equal('uploading');
    expect(remove(chip).getAttribute('aria-label')).to.equal('Cancel upload of report.pdf');

    uploads[0].options.onProgress(0.64);
    expect(status(chip)).to.equal('Uploading · 64%');
    expect(chip.querySelector('.attachment__progress')!.getAttribute('aria-valuenow')).to.equal('64');

    uploads[0].resolve(stored);
    await aTimeout(0);
    expect(chip.dataset.state).to.equal('uploaded');
    expect(status(chip)).to.equal('PDF · 2 KB');
    expect(chip.querySelector('.attachment__name')!.getAttribute('href')).to.equal(stored.url);
    expect(input.value).to.equal('["uploads/report.pdf"]');
  });

  it('takes its own path out of the form value when removed', async () => {
    const chip = attach(pdf());
    uploads[0].resolve(stored);
    await aTimeout(0);

    remove(chip).click();
    expect(container.querySelector('.attachment')).to.equal(null);
    expect(input.value).to.equal('[]');
  });

  it('offers Retry after a failed upload, and uploads again from it', async () => {
    const chip = attach(pdf());
    uploads[0].reject(new Error('500'));
    await aTimeout(0);
    expect(chip.dataset.state).to.equal('failed');
    expect(status(chip)).to.equal('Upload failed');
    expect(retry(chip).hidden).to.be.false;
    expect(failures).to.equal(1);

    retry(chip).click();
    uploads[1].resolve(stored);
    await aTimeout(0);
    expect(chip.dataset.state).to.equal('uploaded');
  });

  it('refuses a file over 30 MB without uploading it or offering Retry', () => {
    const chip = attach(pdf(31 * 1024 * 1024));
    expect(chip.dataset.state).to.equal('too-large');
    expect(status(chip)).to.equal('31.0 MB · max 30 MB');
    expect(retry(chip).hidden).to.be.true;
    expect(uploads).to.have.length(0);
  });

  it('cancels the upload when removed mid-way', async () => {
    const chip = attach(pdf());
    remove(chip).click();
    await aTimeout(0);
    expect(uploads[0].options.signal.aborted).to.be.true;
    expect(container.querySelector('.attachment')).to.equal(null);
    expect(failures).to.equal(1);
    expect(input.value).to.equal('');
  });

  describe('putFile', () => {
    const realRequest = window.XMLHttpRequest;

    class FakeRequest {
      static sent: FakeRequest | null = null;
      upload: {onprogress?: (e: {lengthComputable: boolean; loaded: number; total: number}) => void} = {};
      status = 0;
      aborted = false;
      onload?: () => void;
      onabort?: () => void;
      open() { /* not under test */ }
      setRequestHeader() { /* not under test */ }
      send() {
        FakeRequest.sent = this;
      }
      abort() {
        this.aborted = true;
        this.onabort?.();
      }
    }

    beforeEach(() => {
      FakeRequest.sent = null;
      window.XMLHttpRequest = FakeRequest as unknown as typeof XMLHttpRequest;
    });
    afterEach(() => (window.XMLHttpRequest = realRequest));

    it('reports progress and resolves on a 2xx', async () => {
      const progress: number[] = [];
      const done = putFile('https://upload.test', pdf(), {onProgress: f => progress.push(f), signal: new AbortController().signal});
      FakeRequest.sent!.upload.onprogress!({lengthComputable: true, loaded: 1, total: 4});
      FakeRequest.sent!.status = 204;
      FakeRequest.sent!.onload!();
      await done;
      expect(progress).to.deep.equal([0.25]);
    });

    it('aborts the request when the signal does', async () => {
      const controller = new AbortController();
      const done = putFile('https://upload.test', pdf(), {onProgress: () => undefined, signal: controller.signal});
      controller.abort();
      let error: Error | null = null;
      await done.catch((e: Error) => (error = e));
      expect(FakeRequest.sent!.aborted).to.be.true;
      expect(error).to.not.equal(null);
    });
  });
});
