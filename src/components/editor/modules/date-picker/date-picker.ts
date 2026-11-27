import AirDatepicker from "air-datepicker";
import type {EditorHost, PickerModule} from '../host';
import type RichEditor from '../../../../internal/rich-text/rich-editor';

/** A calendar that inserts the chosen date as text. It opens in the editor's picker popup. */
class DatePicker implements PickerModule {
  readonly element = document.createElement('div');
  private readonly _editor: RichEditor;
  private readonly _host: EditorHost;

  constructor(host: EditorHost) {
    this._editor = host.editor;
    this._host = host;

    // eslint-disable-next-line no-new
    new AirDatepicker(this.element, {
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
  }

  private _onDateSelect(formattedDate: string | string[]) {
    if (!formattedDate) return;
    const range = this._editor.getSelection(true)!;
    const text = Array.isArray(formattedDate) ? formattedDate.join(', ') : formattedDate;
    this._editor.insertText(range.index, text);
    this._editor.setSelection(range.index + text.length, 0);
    this._host.closePicker();
  }
}

export default DatePicker;
