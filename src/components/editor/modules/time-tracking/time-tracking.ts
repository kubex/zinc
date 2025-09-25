import type Quill from 'quill';

interface TimeTrackingModuleOptions {
  startTimeInput?: HTMLInputElement;
  openTimeInput?: HTMLInputElement;
}

export default class TimeTracking {
  private _quill: Quill;
  private _options: TimeTrackingModuleOptions;
  private _startTime: number;
  private _openTime: number;

  constructor(quill: Quill, options: TimeTrackingModuleOptions) {
    this._quill = quill;
    this._options = options;

    this._quill.on('editor-change', this._updateStartTime.bind(this));
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
