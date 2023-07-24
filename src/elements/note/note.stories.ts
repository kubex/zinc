import {html} from 'lit-html';

export default {
  title: 'Elements/Note',
};

export const Default = () =>
  html`
    <zn-panel>
      <zn-note>
        <span slot="caption">by Mark Neale (CSA)</span>
        <span slot="date">May 24th 2023 @ 14:21</span>

        <p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in
          some form, by injected humour, or randomised words which don't look even slightly believable. If you are going
          to use a passage of Lorem Ipsum.</p>

        <p>Or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem
          Ipsum or randomised words which don't look even slightly believable.</p>
      </zn-note>
    </zn-panel>
  `;