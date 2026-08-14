import ZnScheduleBuilder from './schedule-builder.component';

export * from './schedule-builder.component';
export default ZnScheduleBuilder;

ZnScheduleBuilder.define('zn-schedule-builder');

declare global {
  interface HTMLElementTagNameMap {
    'zn-schedule-builder': ZnScheduleBuilder;
  }
}
