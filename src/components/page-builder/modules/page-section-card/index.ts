import ZnPageSectionCard from './page-section-card.component';

export * from './page-section-card.component';
export default ZnPageSectionCard;

ZnPageSectionCard.define('zn-page-section-card');

declare global {
  interface HTMLElementTagNameMap {
    'zn-page-section-card': ZnPageSectionCard;
  }
}
