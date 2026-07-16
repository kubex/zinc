import '../../../dist/zn.min.js';
import {expect, fixture, html, oneEvent} from '@open-wc/testing';
import type ZnFile from './file.component';

describe('<zn-file>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`<zn-file></zn-file>`);

    expect(el).to.exist;
  });

  for (const droparea of [false, true]) {
    it(`accepts a drop when the ${droparea ? 'droparea' : 'standard input'} has no animation target`, async () => {
      const el = await fixture<ZnFile>(html`<zn-file ?droparea=${droparea}></zn-file>`);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(new File(['content'], 'example.txt', {type: 'text/plain'}));
      const dropHandler = el as unknown as {
        handleTransferItems: (items: DataTransferItemList | null) => Promise<FileList>;
      };
      dropHandler.handleTransferItems = () => Promise.resolve(dataTransfer.files);

      const changed = oneEvent(el, 'zn-change');
      el.shadowRoot!.querySelector<HTMLElement>('.form-control')!.dispatchEvent(new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer
      }));
      await changed;

      expect(el.files).to.have.length(1);
      expect(el.files![0].name).to.equal('example.txt');
    });
  }
});
