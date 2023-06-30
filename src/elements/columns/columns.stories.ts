import {html} from 'lit-html';

export default {
  title: 'Elements/Columns',
};

export const Default = ({content}) =>
  html`
    <style>
      body {
        display: block;
        padding: 20px;
      }

      zn-cols {
        background: blue;
        margin: 20px 0;
      }
      
      zn-cols > div {
        background: white;
        flex-grow: 1;
      }
    </style>
    
    <zn-cols layout="1,1,1,1">
      <div slot="c1">Col 1a</div>
      <div slot="c2">Col 2a</div>
      <div slot="c3">Col 3a</div>
      <div slot="c4">Col 4a</div>
    </zn-cols>

    <zn-cols>
      <div slot="c1">Col 1b</div>
      <div slot="c2">Col 2b</div>
      <div slot="c3">Col 3b</div>
    </zn-cols>

    <zn-cols>
      <div slot="c1">Col 1c</div>
      <div slot="c2">Col 2c</div>
    </zn-cols>

    <zn-cols>
      <div slot="c1">Col 1d</div>
    </zn-cols>


    <zn-cols>
      <div slot="c1">Col 1e</div>
      <div slot="c2">Col 2e</div>
      <div slot="c3">Col 3e</div>
      <div slot="c4">Col 4e</div>
    </zn-cols>

    <zn-cols layout="3,1">
      <div slot="c1">Col 1f</div>
      <div slot="c2">Col 2f</div>
    </zn-cols>

    <zn-cols layout="2,1,1">
      <div slot="c1">Col 1g</div>
      <div slot="c2">Col 2g</div>
    </zn-cols>

    <hr/>

    <zn-cols>
      <div slot="c1">Col 1h</div>
    </zn-cols>

    <zn-cols>
      <div slot="c1">Col 1i</div>
      <div slot="c2">Col 2i</div>
    </zn-cols>

    <zn-cols>
      <div slot="c1">Col 1j</div>
      <div slot="c2">Col 2j</div>
      <div slot="c3">Col 3j</div>
    </zn-cols>

    <zn-cols>
      <div slot="c1">Col 1k</div>
      <div slot="c2">Col 2k</div>
      <div slot="c3">Col 3k</div>
      <div slot="c4">Col 4k</div>
    </zn-cols>

    <hr/>

    <zn-cols layout="3,1">
      <div slot="c1">Col 1l</div>
      <div slot="c2">Col 2l</div>
    </zn-cols>
  `;

Default.args = {
  content: 'Default',
}