import ZnAvatarGroup from './avatar-group.component';

export * from './avatar-group.component';
export default ZnAvatarGroup;

ZnAvatarGroup.define('zn-avatar-group');

declare global {
  interface HTMLElementTagNameMap {
    'zn-avatar-group': ZnAvatarGroup;
  }
}
