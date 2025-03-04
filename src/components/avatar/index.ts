import ZnAvatar from './avatar.component';

export * from './avatar.component';
export default ZnAvatar;

ZnAvatar.define('zn-avatar');

declare global {
  interface HTMLElementTagNameMap {
    'zn-avatar': ZnAvatar;
  }
}
