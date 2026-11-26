import {onEditorChange} from '../host';
import type {EditorHost} from '../host';

interface TimeTrackingOptions {
  startTimeInput?: HTMLInputElement;
  openTimeInput?: HTMLInputElement;
}

export default class TimeTracking {
  private _options: TimeTrackingOptions;
  private _startTime: number;
  private _openTime: number;

  constructor(host: EditorHost, options: TimeTrackingOptions) {
    this._options = options;

    onEditorChange(host.editor, this._updateStartTime.bind(this));
    this._updateOpenTime();
  }

  private _updateOpenTime() {
    if (this._options.openTimeInput && !this._openTime) {
      this._openTime = Math.floor(new Date().getTime() / 1000);
      this._options.openTimeInput.value = this._openTime.toString();
    }
  }

  private _updateStartTime() {
    if (this._options.startTimeInput && !this._startTime) {
      this._startTime = Math.floor(new Date().getTime() / 1000);
      this._options.startTimeInput.value = this._startTime.toString();
    }
  }
}
