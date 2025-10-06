import ZnSettingsContainer from './settings-container.component';

export * from './settings-container.component';
export default ZnSettingsContainer;

ZnSettingsContainer.define('zn-settings-container');

declare global {
  interface HTMLElementTagNameMap {
    'zn-settings-container': ZnSettingsContainer;
  }
}
