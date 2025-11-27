import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property, state} from "lit/decorators.js";
import ZincElement from '../../internal/zinc-element';
import type {ZnChangeEvent} from "../../events/zn-change";

import styles from './audio-select.scss';

interface AudioFile {
  name: string;
  url: string;
}

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/audio-select
 * @status experimental
 * @since 1.0
 *
 * @slot - The default slot.
 * @slot actions - The actions slot.
 * @slot footer - The footer slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnAudioSelect extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private _selectedUrl: string = '';
  @state() private _isPlaying: boolean = false;
  private readonly _audio: HTMLAudioElement;

  @property() label = '';
  @property() placeholder = '';
  @property({type: Object}) files: AudioFile[];

  constructor() {
    super();
    this._audio = new Audio();

    // Handle audio ending naturally
    this._audio.addEventListener('ended', () => {
      this._isPlaying = false;
      // Reset to start so pressing play again restarts the audio
      this._audio.currentTime = 0;
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopAudio();
  }

  _stopAudio() {
    if (this._audio) {
      this._audio.pause();
      this._audio.currentTime = 0;
    }
    this._isPlaying = false;
  }

  handleSelectChange(e: ZnChangeEvent) {
    if (e.target !== e.currentTarget) {
      return;
    }

    const url = (e.target as HTMLSelectElement).value;
    this._selectedUrl = url;

    this._stopAudio();

    if (url) {
      this._audio.src = url;
    }
  }

  togglePreview(e: CustomEvent) {
    e.stopPropagation();

    if (!this._selectedUrl) {
      e.preventDefault();
      this._isPlaying = false;
      this.requestUpdate();
      return;
    }

    if (this._isPlaying) {
      this._audio.pause();
      this._isPlaying = false;
    } else {
      this._audio.play()
        .then(() => {
          this._isPlaying = true;
        })
        .catch(err => {
          console.error("Audio playback failed:", err);
          this._isPlaying = false;
          this.requestUpdate();
        });
    }
  }

  render() {
    return html`
      <div class="container">
        <div class="select-wrapper">
          <zn-select label="${this.label}" @zn-change="${this.handleSelectChange}">
            <zn-checkbox
              slot="prefix"
              checked-icon="pause"
              unchecked-icon="play_arrow"
              checked-color="primary"
              unchecked-color="secondary"
              ?checked="${this._isPlaying}"
              @zn-change="${this.togglePreview}">
            </zn-checkbox>

            <zn-option value="" disabled selected>${this.placeholder || 'Select audio'}</zn-option>
            ${this.files.map(file => html`
              <zn-option value="${file.url}">${file.name}</zn-option>
            `)}
          </zn-select>
        </div>
      </div>
    `;
  }
}
