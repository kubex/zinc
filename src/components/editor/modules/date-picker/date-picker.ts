import AirDatepicker from "air-datepicker";
import type Quill from "quill";
import type ToolbarComponent from "../toolbar/toolbar.component";

class DatePicker {
  private readonly _quill: Quill;

  constructor(quill: Quill) {
    this._quill = quill;

    this._initPicker();
  }

  private _initPicker() {
    this.getToolbarDateContainer().then((container) => {
      if (!container) return;

      container.innerHTML = '';

      // eslint-disable-next-line no-new
      new AirDatepicker(container, {
        inline: true,
        locale: {
          days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
          months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          today: 'Today',
          clear: 'Clear',
          dateFormat: 'MM/dd/yyyy',
          timeFormat: 'hh:ii aa',
          firstDay: 0
        },
        onSelect: ({formattedDate}) => this._onDateSelect(formattedDate)
      });
    });
  }

  private async getToolbarDateContainer(): Promise<HTMLElement | null> {
    try {
      const root = this._quill.container?.getRootNode?.() as ShadowRoot | null;
      if (!root) return null;

      const toolbar = root.getElementById?.('toolbar') as ToolbarComponent | null;
      await toolbar?.updateComplete;

      const shadow = toolbar?.shadowRoot as ShadowRoot | undefined;
      const container = shadow?.querySelector?.('.date-picker') as HTMLElement | null;
      return container ?? null;
    } catch {
      return null;
    }
  }

  private _onDateSelect(formattedDate: string | string[]) {
    try {
      if (!formattedDate || !this._quill) return;
      const range = this._quill.getSelection(true);
      if (range) {
        const text = Array.isArray(formattedDate) ? formattedDate.join(', ') : formattedDate;
        this._quill.insertText(range.index, text, 'user');
        this._quill.setSelection(range.index + text.length, 0, 'user');
      } else {
        const index = Math.max(0, this._quill.getLength() - 1);
        const text = Array.isArray(formattedDate) ? formattedDate.join(', ') : formattedDate;
        this._quill.insertText(index, text, 'user');
        this._quill.setSelection(index + text.length, 0, 'user');
      }
    } catch (e) {
      // no-op
    }
  }
}

export default DatePicker;
