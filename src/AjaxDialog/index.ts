import { AjaxDialog } from "./ajax-dialog";

export * from "./ajax-dialog";
export default AjaxDialog;

declare global
{
  interface HTMLElementTagNameMap
  {
    'zn-ajax-dialog': AjaxDialog;
  }
}
