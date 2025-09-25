import type Quill from 'quill';

interface DragAndDropModuleOptions {
  onDrop: (file: File, options: object) => void;
  draggableContentTypePattern: string;
  draggables: [];
}

const defaultOptions: DragAndDropModuleOptions = {
  onDrop: () => {
  },
  draggableContentTypePattern: '^image\\/',
  draggables: []
};

export default class DragAndDropModule {
  private _quill: Quill;
  private _options: DragAndDropModuleOptions;
  private _container: any = null;
  private _draggables: any = [];

  constructor(quill: Quill, options: DragAndDropModuleOptions) {
    this._quill = quill;
    this._options = Object.assign({}, defaultOptions, options);
    this._container = this._quill.addContainer('ql-editor');
    this._draggables = this._options.draggables.map(convertDraggable);

    this._quill.root.addEventListener('drop', this.handleDrop);
  }

  nullReturner = () => null;

  handleDrop = (e: DragEvent) => {
    const onDrop = this._options.onDrop;
    // @ts-expect-error target is not a valid property, but we're using it
    const node = e.target && e.target['ql-data'] ? e.target : this._container;
    const files = e.dataTransfer?.files;
    const fileInfos = filesMatching(files, this._draggables);


    if (fileInfos.length === 0) return;

    e.stopPropagation();
    e.preventDefault();

    Promise.all(fileInfos.map(fileInfo => {
      return Promise
        .resolve((onDrop || this.nullReturner)(fileInfo.file, { tag: fileInfo.tag, attr: fileInfo.attr }))
        .then((ret: any) => ({ on_drop_ret_val: ret, fileInfo }));
    }))
      // Map return Values of onDrop/nullReturner to file datas
      .then(datas => Promise.all(datas.map(({ on_drop_ret_val, fileInfo }) => {
        if (on_drop_ret_val === false) {
          // if onDrop()  return false, it means we shouldn't do anything with the file
          return;
        }

        const { tag, attr } = fileInfo;

        let data: any;
        if (on_drop_ret_val === null) {
          // data = getFileDataUrl(fileInfo.file);
        } else {
          data = on_drop_ret_val;
        }

        return Promise.resolve(data).then(ret => ({ data: ret, tag, attr }));
      })))
      .then(datas => datas.forEach(fileInfo => {
        // loop through each fileInfo and attach them to the editor

        // fileInfo is undefined if onDrop returned false
        if (fileInfo) {
          const { data, tag, attr } = fileInfo;
          // create an element from the given `tag` (e.g. 'img')
          const new_element = document.createElement(tag);

          // set `attr` to `data` (e.g. img.src = "data:image/png;base64..")
          new_element.setAttribute(attr, data);

          // attach the tag to the quill container
          // TODO: maybe a better way to determine *exactly* where to append
          // the node? Currently, we're guessing based on event.target, but
          // that only gets us the node itself, not the position within the
          // node (i.e., if the node is a text node, maybe it's possible to
          // split the text node on the point where the user to dropped)
          node.appendChild(new_element);
        }
      }));
  };
}

const convertDraggable = (draggable: any) => {
  if (draggable.content_type_pattern && draggable.tag && draggable.attr) {
    const ret = Object.assign({}, draggable);
    ret.content_type_regex = new RegExp(draggable.content_type_pattern);
    delete ret.content_type_pattern;
    return ret;
  }

  // @ts-expect-error draggable is not a valid property, but we're using it
  e.draggable = draggable;
};

const filesMatching = (fileList: FileList | undefined, draggables: any) => {
  const ret = [];
  if (fileList) {
    for (let i = 0; i < fileList.length; i++) {
      const file: any = fileList.item(i);
      const draggable = draggables.find((d: any) => d.content_type_regex.test(file.type));
      draggable && ret.push({ file, tag: draggable.tag, attr: draggable.attr });
    }
  }
  return ret;
};

export const getFileDataUrl = (file: any) => {
  const reader = new FileReader();
  return new Promise(resolve => {
    reader.addEventListener('load', function () {
      resolve(reader.result);
    }, false);
    reader.readAsDataURL(file);
  });
};
