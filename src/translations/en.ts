import {registerTranslation, type Translation} from "../utilities/localize.js";

const translation: Translation = {
  $code: 'en',
  $name: 'English',
  $dir: 'ltr',

  onChange: 'onChange',
}

registerTranslation(translation);
export default translation;
