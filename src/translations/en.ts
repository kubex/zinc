import {registerTranslation, type Translation} from "../utilities/localize.js";

const translation: Translation = {
  $code: 'en',
  $name: 'English',
  $dir: 'ltr',

  onChange: 'onChange',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  clearEntry: 'Clear entry',
  numOptionsSelected: num => {
    if (num === 0) return 'No options selected';
    if (num === 1) return '1 option selected';
    return `${num} options selected`;
  },
  fileButtonText: 'Choose a file',
  fileButtonTextMultiple: 'Choose files',
  folderButtonText: 'Choose a folder',
  fileDragDrop: 'Drop files here to upload',
  folderDragDrop: 'Drop folder here to upload',
  numFilesSelected: (num: number) => {
    if (num === 0) return 'No files selected';
    if (num === 1) return '1 file selected';
    return `${num} files selected`;
  }
}

registerTranslation(translation);
export default translation;
