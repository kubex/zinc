import ZnAudioSelect from './audio-select.component';

export * from './audio-select.component';
export default ZnAudioSelect;

ZnAudioSelect.define('zn-audio-select');

declare global {
  interface HTMLElementTagNameMap {
    'zn-audio-select': ZnAudioSelect;
  }
}
