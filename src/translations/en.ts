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
}

registerTranslation(translation);
export default translation;
