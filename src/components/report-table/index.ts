import ZnReportTable from './report-table.component';

export * from './report-table.component';
export default ZnReportTable;

ZnReportTable.define('zn-report-table');

declare global {
  interface HTMLElementTagNameMap {
    'zn-report-table': ZnReportTable;
  }
}
